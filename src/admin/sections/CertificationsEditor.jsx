import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Save, X, ExternalLink } from 'lucide-react';

export default function CertificationsEditor({ onToast }) {
  const [certifications, setCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    async function loadCertifications() {
      try {
        const { data, error } = await supabase
          .from('certifications')
          .select('*')
          .order('display_order', { ascending: true });
        if (error) throw error;
        if (isMounted) {
          setCertifications(data || []);
        }
      } catch (err) {
        console.error('Error fetching certifications:', err);
        onToast?.('Failed to load certifications.', 'error');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCertifications();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger, onToast]);

  const handleAddNew = () => {
    const nextOrder = certifications.length > 0 ? Math.max(...certifications.map((c) => c.display_order || 0)) + 1 : 1;
    setEditingItem({
      title: '',
      issuer: '',
      issue_date: '2025',
      credential_url: '',
      display_order: nextOrder,
      is_published: true
    });
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= certifications.length) return;

    const updated = [...certifications];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((item, idx) => ({
      ...item,
      display_order: idx + 1
    }));

    setCertifications(reordered);

    try {
      const updates = reordered.map((item) =>
        supabase
          .from('certifications')
          .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
          .eq('id', item.id)
      );
      await Promise.all(updates);
      onToast?.('Certifications reordered!', 'success');
    } catch (err) {
      console.error('Error reordering certifications:', err);
      onToast?.('Failed to reorder certifications.', 'error');
      setReloadTrigger((v) => v + 1);
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (isSaving || !supabase || !editingItem) return;

    if (!editingItem.title.trim() || !editingItem.issuer.trim()) {
      onToast?.('Please enter certification name and issuer.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: editingItem.title.trim(),
        issuer: editingItem.issuer.trim(),
        issue_date: editingItem.issue_date?.trim() || null,
        credential_url: editingItem.credential_url?.trim() || null,
        display_order: parseInt(editingItem.display_order, 10) || 1,
        is_published: Boolean(editingItem.is_published),
        updated_at: new Date().toISOString()
      };

      let result;
      if (editingItem.id) {
        result = await supabase.from('certifications').update(payload).eq('id', editingItem.id);
      } else {
        result = await supabase.from('certifications').insert([payload]);
      }

      if (result.error) throw result.error;
      onToast?.(`Certification "${payload.title}" saved successfully!`, 'success');
      setEditingItem(null);
      setReloadTrigger((v) => v + 1);
    } catch (err) {
      console.error('Error saving certification:', err);
      onToast?.(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item || !supabase) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('certifications').delete().eq('id', deleteModal.item.id);
      if (error) throw error;
      onToast?.(`Certification "${deleteModal.item.title}" deleted.`, 'success');
      setDeleteModal({ isOpen: false, item: null });
      setReloadTrigger((v) => v + 1);
    } catch (err) {
      console.error('Error deleting certification:', err);
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
            Certifications & Credentials ({certifications.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#737373', fontFamily: 'var(--font-mono, monospace)' }}>
            Official certifications, badges, issuer verification, and completion dates
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
          <span>Add Certification</span>
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
              {editingItem.id ? `Edit: ${editingItem.title}` : 'Add New Certification'}
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
                <label style={labelStyle}>Certification Name *</label>
                <input
                  type="text"
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. Kaggle 5-Day Agentic AI Program Certificate"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Issuer *</label>
                <input
                  type="text"
                  value={editingItem.issuer || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, issuer: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. Kaggle / Infosys Springboard"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Date / Year</label>
                <input
                  type="text"
                  value={editingItem.issue_date || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, issue_date: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. 2025"
                />
              </div>

              <div>
                <label style={labelStyle}>Credential / Verification URL</label>
                <input
                  type="url"
                  value={editingItem.credential_url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, credential_url: e.target.value })}
                  style={inputStyle}
                  placeholder="https://..."
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
                <span>{isSaving ? 'Saving...' : 'Save Certification'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: '2rem', color: '#888888', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem' }}>
          Loading certifications...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {certifications.map((item, index) => (
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
                    by {item.issuer}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.7rem',
                      color: '#666666',
                      marginLeft: 'auto'
                    }}
                  >
                    {item.issue_date}
                  </span>
                </div>
                {item.credential_url && (
                  <a
                    href={item.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.75rem',
                      color: '#a3a3a3',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      textDecoration: 'none'
                    }}
                  >
                    <span>View Credential</span>
                    <ExternalLink size={11} />
                  </a>
                )}
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
                  disabled={index === certifications.length - 1}
                  style={{
                    backgroundColor: '#141414',
                    border: '1px solid #262626',
                    color: index === certifications.length - 1 ? '#444444' : '#aaaaaa',
                    borderRadius: '4px',
                    padding: '0.35rem',
                    cursor: index === certifications.length - 1 ? 'default' : 'pointer'
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
                  title="Delete Certification"
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
        title="Delete Certification"
        itemName={deleteModal.item?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, item: null })}
      />
    </div>
  );
}
