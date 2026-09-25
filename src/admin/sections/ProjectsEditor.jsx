import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  ExternalLink
} from 'lucide-react';

function GithubIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default function ProjectsEditor({ onToast }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    async function loadProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('display_order', { ascending: true });
        if (error) throw error;
        if (isMounted) {
          setProjects(data || []);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        onToast?.('Failed to load projects.', 'error');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger, onToast]);

  const handleAddNew = () => {
    const nextOrder = projects.length > 0 ? Math.max(...projects.map((p) => p.display_order || 0)) + 1 : 1;
    const numStr = String(nextOrder).padStart(2, '0');
    setEditingProject({
      num: numStr,
      slug: `project-${Date.now()}`,
      title: '',
      description: '',
      technologies: [],
      techInput: '',
      github_url: '',
      live_url: '',
      image_url: '',
      preview_type: 'workbench',
      display_order: nextOrder,
      is_featured: false,
      is_published: true
    });
  };

  const handleEdit = (project) => {
    setEditingProject({
      ...project,
      techInput: Array.isArray(project.technologies) ? project.technologies.join(', ') : ''
    });
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const updated = [...projects];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Reassign display_order sequentially
    const reordered = updated.map((item, idx) => ({
      ...item,
      display_order: idx + 1,
      num: String(idx + 1).padStart(2, '0')
    }));

    setProjects(reordered);

    // Persist reordering to Supabase
    try {
      const updates = reordered.map((item) =>
        supabase
          .from('projects')
          .update({ display_order: item.display_order, num: item.num, updated_at: new Date().toISOString() })
          .eq('id', item.id)
      );
      await Promise.all(updates);
      onToast?.('Projects reordered successfully!', 'success');
    } catch (err) {
      console.error('Error updating order:', err);
      onToast?.('Failed to save project order.', 'error');
      setReloadTrigger((v) => v + 1);
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (isSaving || !supabase || !editingProject) return;

    if (!editingProject.title.trim()) {
      onToast?.('Please enter a project title.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const techList = editingProject.techInput
        ? editingProject.techInput
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : editingProject.technologies || [];

      const payload = {
        title: editingProject.title.trim(),
        description: editingProject.description.trim(),
        technologies: techList,
        github_url: editingProject.github_url?.trim() || null,
        live_url: editingProject.live_url?.trim() || null,
        image_url: editingProject.image_url?.trim() || null,
        preview_type: editingProject.preview_type || 'workbench',
        display_order: parseInt(editingProject.display_order, 10) || 1,
        num: String(editingProject.display_order || 1).padStart(2, '0'),
        is_featured: Boolean(editingProject.is_featured),
        is_published: Boolean(editingProject.is_published),
        slug: editingProject.slug || editingProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        updated_at: new Date().toISOString()
      };

      let result;
      if (editingProject.id) {
        result = await supabase.from('projects').update(payload).eq('id', editingProject.id);
      } else {
        result = await supabase.from('projects').insert([payload]);
      }

      if (result.error) throw result.error;

      onToast?.(`Project "${payload.title}" saved successfully!`, 'success');
      setEditingProject(null);
      setReloadTrigger((v) => v + 1);
    } catch (err) {
      console.error('Error saving project:', err);
      onToast?.(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item || !supabase) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', deleteModal.item.id);
      if (error) throw error;
      onToast?.(`Project "${deleteModal.item.title}" deleted.`, 'success');
      setDeleteModal({ isOpen: false, item: null });
      setReloadTrigger((v) => v + 1);
    } catch (err) {
      console.error('Error deleting project:', err);
      onToast?.(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#121212',
    border: '1px solid #262626',
    borderRadius: '5px',
    padding: '0.65rem 0.85rem',
    color: '#ffffff',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.75rem',
    color: '#888888',
    marginBottom: '0.4rem',
    textTransform: 'uppercase'
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
            Projects Management ({projects.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#737373', fontFamily: 'var(--font-mono, monospace)' }}>
            Manage featured projects, repositories, live URLs, and display order
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            border: 'none',
            borderRadius: '5px',
            padding: '0.5rem 0.9rem',
            fontFamily: 'var(--font-sans, system-ui)',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Plus size={14} />
          <span>Add Project</span>
        </button>
      </div>

      {/* Editor Modal / Drawer */}
      {editingProject && (
        <div
          style={{
            backgroundColor: '#0c0c0c',
            border: '1px solid #262626',
            borderRadius: '8px',
            padding: '1.75rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
              {editingProject.id ? `Edit Project: ${editingProject.title}` : 'Add New Project'}
            </h3>
            <button
              type="button"
              onClick={() => setEditingProject(null)}
              style={{ background: 'transparent', border: 'none', color: '#888888', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Project Title *</label>
                <input
                  type="text"
                  value={editingProject.title || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. Sovereign AI Workbench"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Display Order / Number</label>
                <input
                  type="number"
                  value={editingProject.display_order || 1}
                  onChange={(e) => setEditingProject({ ...editingProject, display_order: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description *</label>
              <textarea
                rows={3}
                value={editingProject.description || ''}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="High-impact technical overview..."
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>GitHub URL</label>
                <input
                  type="url"
                  value={editingProject.github_url || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                  style={inputStyle}
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label style={labelStyle}>Live Demo URL</label>
                <input
                  type="url"
                  value={editingProject.live_url || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, live_url: e.target.value })}
                  style={inputStyle}
                  placeholder="https://demo.app/..."
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Technologies (Comma Separated)</label>
              <input
                type="text"
                value={editingProject.techInput || ''}
                onChange={(e) => setEditingProject({ ...editingProject, techInput: e.target.value })}
                style={inputStyle}
                placeholder="PyTorch, FastAPI, Next.js, Docker, WebGL"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Image URL / Asset Reference</label>
                <input
                  type="text"
                  value={editingProject.image_url || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, image_url: e.target.value })}
                  style={inputStyle}
                  placeholder="/assets/project.png or https://..."
                />
              </div>

              <div>
                <label style={labelStyle}>Preview Type</label>
                <select
                  value={editingProject.preview_type || 'workbench'}
                  onChange={(e) => setEditingProject({ ...editingProject, preview_type: e.target.value })}
                  style={inputStyle}
                >
                  <option value="workbench">Workbench</option>
                  <option value="chatbot">Chatbot / Agent</option>
                  <option value="analytics">Analytics Dashboard</option>
                  <option value="graph">Neural Graph</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={Boolean(editingProject.is_featured)}
                  onChange={(e) => setEditingProject({ ...editingProject, is_featured: e.target.checked })}
                />
                <span>Featured Project</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={Boolean(editingProject.is_published)}
                  onChange={(e) => setEditingProject({ ...editingProject, is_published: e.target.checked })}
                />
                <span>Published on Website</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                style={{
                  padding: '0.55rem 1rem',
                  backgroundColor: 'transparent',
                  border: '1px solid #333333',
                  borderRadius: '5px',
                  color: '#cccccc',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  padding: '0.55rem 1.25rem',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: isSaving ? 'wait' : 'pointer',
                  opacity: isSaving ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Save size={14} />
                <span>{isSaving ? 'Saving...' : 'Save Project'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List Table */}
      {isLoading ? (
        <div style={{ padding: '2rem', color: '#888888', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem' }}>
          Loading projects from Supabase...
        </div>
      ) : projects.length === 0 ? (
        <div
          style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid #1f1f1f',
            borderRadius: '6px',
            padding: '2.5rem',
            textAlign: 'center',
            color: '#737373'
          }}
        >
          No projects found. Click "Add Project" to create your first portfolio entry.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {projects.map((item, index) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: '6px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              {/* Left Order & Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    color: '#666666',
                    width: '28px'
                  }}
                >
                  {item.num || String(item.display_order).padStart(2, '0')}
                </span>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>
                      {item.title}
                    </span>
                    {item.is_featured && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '3px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#e5e5e5'
                        }}
                      >
                        FEATURED
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#888888', display: 'block', maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description}
                  </span>
                </div>
              </div>

              {/* Center Links & Tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.github_url && (
                  <a
                    href={item.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#888888', padding: '0.35rem' }}
                    title="View GitHub"
                  >
                    <GithubIcon size={15} />
                  </a>
                )}
                {item.live_url && (
                  <a
                    href={item.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#888888', padding: '0.35rem' }}
                    title="View Live Demo"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>

              {/* Right Order & Edit Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => handleMoveOrder(index, -1)}
                  disabled={index === 0}
                  style={{
                    backgroundColor: '#141414',
                    border: '1px solid #262626',
                    color: index === 0 ? '#444444' : '#aaaaaa',
                    borderRadius: '4px',
                    padding: '0.35rem',
                    cursor: index === 0 ? 'default' : 'pointer'
                  }}
                  title="Move Up"
                >
                  <ArrowUp size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => handleMoveOrder(index, 1)}
                  disabled={index === projects.length - 1}
                  style={{
                    backgroundColor: '#141414',
                    border: '1px solid #262626',
                    color: index === projects.length - 1 ? '#444444' : '#aaaaaa',
                    borderRadius: '4px',
                    padding: '0.35rem',
                    cursor: index === projects.length - 1 ? 'default' : 'pointer'
                  }}
                  title="Move Down"
                >
                  <ArrowDown size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  style={{
                    backgroundColor: '#141414',
                    border: '1px solid #262626',
                    color: '#e5e5e5',
                    borderRadius: '4px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: true, item })}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    borderRadius: '4px',
                    padding: '0.35rem 0.5rem',
                    cursor: 'pointer'
                  }}
                  title="Delete Project"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Project"
        itemName={deleteModal.item?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, item: null })}
      />
    </div>
  );
}
