import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, RefreshCw, ExternalLink } from 'lucide-react';

export default function ResumeEditor({ onToast }) {
  const [resume, setResume] = useState({
    file_name: 'Sayyad_Mazahar_Mehadi_Resume.pdf',
    file_url: '/resume.pdf',
    version: '2025.1',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    async function loadResume() {
      try {
        const { data, error } = await supabase
          .from('resume_metadata')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (isMounted && data) {
          setResume(data);
        }
      } catch (err) {
        console.error('Error fetching resume metadata:', err);
        onToast?.('Failed to load resume metadata.', 'error');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadResume();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger, onToast]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving || !supabase) return;

    setIsSaving(true);
    try {
      const payload = {
        file_name: resume.file_name.trim(),
        file_url: resume.file_url.trim(),
        version: resume.version?.trim() || '2025.1',
        is_active: Boolean(resume.is_active),
        updated_at: new Date().toISOString()
      };

      let result;
      if (resume.id) {
        result = await supabase.from('resume_metadata').update(payload).eq('id', resume.id);
      } else {
        result = await supabase.from('resume_metadata').insert([payload]);
      }

      if (result.error) throw result.error;

      // Also sync profile resume_url for consistency
      await supabase
        .from('profile')
        .update({ resume_url: payload.file_url, updated_at: new Date().toISOString() })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      onToast?.('Resume metadata updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving resume metadata:', err);
      onToast?.(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', color: '#888888', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem' }}>
        Loading resume metadata from Supabase...
      </div>
    );
  }

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
    <div style={{ maxWidth: '850px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
            Resume Metadata & Document Configuration
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#737373', fontFamily: 'var(--font-mono, monospace)' }}>
            Active resume download endpoint, versioning, and Supabase Storage reference
          </span>
        </div>

        <button
          type="button"
          onClick={() => setReloadTrigger((v) => v + 1)}
          disabled={isLoading || isSaving}
          style={{
            background: 'transparent',
            border: '1px solid #262626',
            color: '#a3a3a3',
            padding: '0.4rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono, monospace)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <RefreshCw size={12} />
          <span>Reload</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>File Name (Download Display)</label>
            <input
              type="text"
              value={resume.file_name || ''}
              onChange={(e) => setResume({ ...resume, file_name: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Version Tag</label>
            <input
              type="text"
              value={resume.version || ''}
              onChange={(e) => setResume({ ...resume, version: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Resume Download URL / Storage Path</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={resume.file_url || ''}
              onChange={(e) => setResume({ ...resume, file_url: e.target.value })}
              style={inputStyle}
              placeholder="/resume.pdf or https://eenuitztjyosmgxcfpeb.supabase.co/storage/v1/object/public/resumes/..."
              required
            />
            {resume.file_url && (
              <a
                href={resume.file_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#141414',
                  border: '1px solid #262626',
                  borderRadius: '5px',
                  padding: '0.65rem 0.85rem',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  whiteSpace: 'nowrap'
                }}
              >
                <ExternalLink size={13} />
                <span>Test Link</span>
              </a>
            )}
          </div>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={Boolean(resume.is_active)}
              onChange={(e) => setResume({ ...resume, is_active: e.target.checked })}
            />
            <span>Set as active resume for all public download buttons</span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: '0.65rem 1.5rem',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '5px',
              fontFamily: 'var(--font-sans, system-ui)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: isSaving ? 'wait' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving changes...' : 'Save Resume Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
