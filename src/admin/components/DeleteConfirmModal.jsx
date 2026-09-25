import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, title, itemName, onConfirm, onCancel, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#0c0c0c',
          border: '1px solid #262626',
          borderRadius: '8px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.9)',
          position: 'relative'
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: '#888888',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444'
            }}
          >
            <AlertTriangle size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
            {title || 'Confirm Deletion'}
          </h3>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#a3a3a3', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
          Are you sure you want to delete <strong style={{ color: '#ffffff' }}>"{itemName}"</strong>? This destructive action will immediately remove the record from Supabase.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              padding: '0.55rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid #333333',
              borderRadius: '5px',
              color: '#cccccc',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.8rem',
              cursor: isDeleting ? 'wait' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: '0.55rem 1.1rem',
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: '5px',
              color: '#ffffff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: isDeleting ? 'wait' : 'pointer',
              opacity: isDeleting ? 0.7 : 1
            }}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
