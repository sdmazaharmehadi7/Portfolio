import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        backgroundColor: '#111111',
        border: `1px solid ${isSuccess ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
        borderRadius: '6px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
        zIndex: 10000,
        maxWidth: '400px'
      }}
    >
      {isSuccess ? (
        <CheckCircle2 size={18} color="#4ade80" style={{ flexShrink: 0 }} />
      ) : (
        <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0 }} />
      )}
      <span
        style={{
          fontFamily: 'var(--font-sans, system-ui)',
          fontSize: '0.85rem',
          color: isSuccess ? '#e5e5e5' : '#fca5a5',
          lineHeight: 1.4
        }}
      >
        {message}
      </span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888888',
            cursor: 'pointer',
            padding: 0,
            marginLeft: '0.5rem',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
