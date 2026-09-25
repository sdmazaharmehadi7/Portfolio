import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Save, X } from 'lucide-react';

export default function ExperienceEditor({ onToast }) {
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    async function loadExperiences() {
      try {
        const { data, error } = await supabase
          .from('experiences')
          .select('*')
          .order('display_order', { ascending: true });
        if (error) throw error;
        if (isMounted) {
          setExperiences(data || []);
        }
      } catch (err) {
        console.error('Error fetching experiences:', err);
        onToast?.('Failed to load experiences.', 'error');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadExperiences();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger, onToast]);

  const handleAddNew = () => {
    const nextOrder = experiences.length > 0 ? Math.max(...experiences.map((e) => e.display_order || 0)) + 1 : 1;
    setEditingItem({
      period: 'Internship',
      title: '',
      organization: '',
      focus: '',
      description: '',
      display_order: nextOrder,
      is_published: true
    });
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;

    const updated = [...experiences];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((item, idx) => ({
      ...item,
      display_order: idx + 1
    }));

    setExperiences(reordered);

    try {
      const updates = reordered.map((item) =>
        supabase
          .from('experiences')
          .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
          .eq('id', item.id)
      );
      await Promise.all(updates);
      onToast?.('Experiences reordered successfully!', 'success');
    } catch (err) {
      console.error('Error reordering experiences:', err);
      onToast?.('Failed to reorder experiences.', 'error');
      setReloadTrigger((v) => v + 1);
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (isSaving || !supabase || !editingItem) return;

    if (!editingItem.title.trim() || !editingItem.organization.trim()) {
      onToast?.('Please enter both role title and organization.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        period: editingItem.period?.trim() || 'Internship',
        title: editingItem.title.trim(),
        organization: editingItem.organization.trim(),
        focus: editingItem.focus?.trim() || '',
        description: editingItem.description?.trim() || '',
        display_order: parseInt(editingItem.display_order, 10) || 1,
        is_published: Boolean(editingItem.is_published),
        updated_at: new Date().toISOString()
      };

      let result;
      if (editingItem.id) {
        result = await supabase.from('experiences').update(payload).eq('id', editingItem.id);
      } else {
        result = await supabase.from('experiences').insert([payload]);
      }

      if (result.error) throw result.error;
      onToast?.(`Experience "${payload.title}" saved successfully!`, 'success');
      setEditingItem(null);
      setReloadTrigger((v) => v + 1);
    } catch (err) {
      console.error('Error saving experience:', err);
      onToast?.(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item || !supabase) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('experiences').delete().eq('id', deleteModal.item.id);
      if (error) throw error;
      onToast?.(`Experience "${deleteModal.item.title}" deleted.`, 'success');
      setDeleteModal({ isOpen: false, item: null });
      setReloadTrigger((v) => v + 1);
    } catch (err) {
      console.error('Error deleting experience:', err);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
            Professional Experience & Internships ({experiences.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#737373', fontFamily: 'var(--font-mono, monospace)' }}>
            Manage organizations, roles, periods, and technical scope
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
          <span>Add Experience</span>
        </button>
      </div>

      {editingItem && (
        <div
          style={{
            backgroundColor: '#0c0c0c',
            border: '1px solid #262626',
            borderRadius: '8px',
            padding: '1.75rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
              {editingItem.id ? `Edit: ${editingItem.title}` : 'Add New Experience'}
            </h3>
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              style={{ background: 'transparent', border: 'none', color: '#888888', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Role / Title *</label>
                <input
                  type="text"
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. Infosys Springboard Internship 7.0"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Company / Organization *</label>
                <input
                  type="text"
                  value={editingItem.organization || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. Infosys Springboard"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Period / Dates</label>
                <input
                  type="text"
                  value={editingItem.period || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, period: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. 2025 or Jun 2024 - Aug 2024"
                />
              </div>

              <div>
                <label style={labelStyle}>Focus / Technologies</label>
                <input
                  type="text"
                  value={editingItem.focus || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, focus: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. Artificial Intelligence / Cloud"
                />
              </div>

              <div>
                <label style={labelStyle}>Display Order</label>
                <input
                  type="number"
                  value={editingItem.display_order || 1}
                  onChange={(e) => setEditingItem({ ...editingItem, display_order: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description / Responsibilities</label>
              <textarea
                rows={3}
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Key technical achievements and responsibilities..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
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
                <span>{isSaving ? 'Saving...' : 'Save Experience'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: '2rem', color: '#888888', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem' }}>
          Loading experiences...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {experiences.map((item, index) => (
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
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>
                    {item.title}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#888888' }}>
                    @ {item.organization}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.7rem',
                      color: '#666666',
                      marginLeft: 'auto'
                    }}
                  >
                    {item.period}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#777777', display: 'block', maxWidth: '600px' }}>
                  {item.description}
                </span>
              </div>

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
                  disabled={index === experiences.length - 1}
                  style={{
                    backgroundColor: '#141414',
                    border: '1px solid #262626',
                    color: index === experiences.length - 1 ? '#444444' : '#aaaaaa',
                    borderRadius: '4px',
                    padding: '0.35rem',
                    cursor: index === experiences.length - 1 ? 'default' : 'pointer'
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
                  title="Delete Experience"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Experience"
        itemName={deleteModal.item?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, item: null })}
      />
    </div>
  );
}
