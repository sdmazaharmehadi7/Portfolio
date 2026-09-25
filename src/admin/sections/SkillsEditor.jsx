import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Save, X } from 'lucide-react';

export default function SkillsEditor({ onToast }) {
  const [skillsCategories, setSkillsCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    async function loadSkills() {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('display_order', { ascending: true });
        if (error) throw error;
        if (isMounted) {
          setSkillsCategories(data || []);
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
        onToast?.('Failed to load skills.', 'error');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger, onToast]);

  const handleAddNew = () => {
    const nextOrder = skillsCategories.length > 0 ? Math.max(...skillsCategories.map((s) => s.display_order || 0)) + 1 : 1;
    setEditingItem({
      category: '',
      skills: [],
      skillsInput: '',
      display_order: nextOrder,
      is_published: true
    });
  };

  const handleEdit = (item) => {
    setEditingItem({
      ...item,
      skillsInput: Array.isArray(item.skills) ? item.skills.join(', ') : ''
    });
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= skillsCategories.length) return;

    const updated = [...skillsCategories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((item, idx) => ({
      ...item,
      display_order: idx + 1
    }));

    setSkillsCategories(reordered);

    try {
      const updates = reordered.map((item) =>
        supabase
          .from('skills')
          .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
          .eq('id', item.id)
      );
      await Promise.all(updates);
      onToast?.('Skills categories reordered!', 'success');
    } catch (err) {
      console.error('Error reordering skills:', err);
      onToast?.('Failed to reorder skills.', 'error');
      setReloadTrigger((v) => v + 1);
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (isSaving || !supabase || !editingItem) return;

    if (!editingItem.category.trim()) {
      onToast?.('Please enter a category name.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const skillsArray = editingItem.skillsInput
        ? editingItem.skillsInput
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : editingItem.skills || [];

      const payload = {
        category: editingItem.category.trim(),
        skills: skillsArray,
        display_order: parseInt(editingItem.display_order, 10) || 1,
        is_published: Boolean(editingItem.is_published),
        updated_at: new Date().toISOString()
      };

      let result;
      if (editingItem.id) {
        result = await supabase.from('skills').update(payload).eq('id', editingItem.id);
      } else {
        result = await supabase.from('skills').insert([payload]);
      }

      if (result.error) throw result.error;
      onToast?.(`Category "${payload.category}" saved successfully!`, 'success');
      setEditingItem(null);
      setReloadTrigger((v) => v + 1);
    } catch (err) {
      console.error('Error saving category:', err);
      onToast?.(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item || !supabase) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('skills').delete().eq('id', deleteModal.item.id);
      if (error) throw error;
      onToast?.(`Category "${deleteModal.item.category}" deleted.`, 'success');
      setDeleteModal({ isOpen: false, item: null });
      setReloadTrigger((v) => v + 1);
    } catch (err) {
      console.error('Error deleting skill category:', err);
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
            Technical Skills Categories ({skillsCategories.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#737373', fontFamily: 'var(--font-mono, monospace)' }}>
            Categorized technical stack, frameworks, tools, and libraries
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
          <span>Add Category</span>
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
              {editingItem.id ? `Edit: ${editingItem.category}` : 'Add New Skills Category'}
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
                <label style={labelStyle}>Category Name *</label>
                <input
                  type="text"
                  value={editingItem.category || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. AI / LLMs & Agentic Systems"
                  required
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
              <label style={labelStyle}>Skills (Comma Separated)</label>
              <textarea
                rows={3}
                value={editingItem.skillsInput || ''}
                onChange={(e) => setEditingItem({ ...editingItem, skillsInput: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="LangChain, LlamaIndex, RAG Pipelines, Vector DBs, PyTorch"
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
                <span>{isSaving ? 'Saving...' : 'Save Category'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: '2rem', color: '#888888', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem' }}>
          Loading skills...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {skillsCategories.map((item, index) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: '6px',
                padding: '1.1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff', display: 'block', marginBottom: '0.45rem' }}>
                  {item.category}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {item.skills?.map((s, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.7rem',
                        color: '#a3a3a3',
                        backgroundColor: '#141414',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '3px',
                        border: '1px solid #222222'
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
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
                  disabled={index === skillsCategories.length - 1}
                  style={{
                    backgroundColor: '#141414',
                    border: '1px solid #262626',
                    color: index === skillsCategories.length - 1 ? '#444444' : '#aaaaaa',
                    borderRadius: '4px',
                    padding: '0.35rem',
                    cursor: index === skillsCategories.length - 1 ? 'default' : 'pointer'
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
                  title="Delete Category"
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
        title="Delete Skills Category"
        itemName={deleteModal.item?.category || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, item: null })}
      />
    </div>
  );
}
