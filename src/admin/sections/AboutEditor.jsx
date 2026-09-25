import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, RefreshCw } from 'lucide-react';

export default function AboutEditor({ onToast }) {
  const [about, setAbout] = useState({
    tag: '',
    title: '',
    paragraphs: [],
    academic_degree: '',
    academic_institution: '',
    academic_cgpa: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    async function loadAbout() {
      try {
        const { data, error } = await supabase.from('about').select('*').limit(1).maybeSingle();
        if (error) throw error;
        if (isMounted && data) {
          setAbout({
            ...data,
            paragraphs: Array.isArray(data.paragraphs) ? data.paragraphs : []
          });
        }
      } catch (err) {
        console.error('Error fetching about data:', err);
        onToast?.('Failed to load about data.', 'error');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAbout();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger, onToast]);

  const handleParagraphChange = (index, value) => {
    const updated = [...about.paragraphs];
    updated[index] = value;
    setAbout((prev) => ({ ...prev, paragraphs: updated }));
  };

  const handleAddParagraph = () => {
    setAbout((prev) => ({ ...prev, paragraphs: [...prev.paragraphs, ''] }));
  };

  const handleRemoveParagraph = (index) => {
    setAbout((prev) => ({
      ...prev,
      paragraphs: prev.paragraphs.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving || !supabase) return;

    setIsSaving(true);
    try {
      const payload = {
        ...about,
        paragraphs: about.paragraphs.filter((p) => p.trim().length > 0),
        updated_at: new Date().toISOString()
      };

      let result;
      if (about.id) {
        result = await supabase.from('about').update(payload).eq('id', about.id);
      } else {
        result = await supabase.from('about').insert([payload]);
      }

      if (result.error) throw result.error;
      onToast?.('About section updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving about section:', err);
      onToast?.(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', color: '#888888', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem' }}>
        Loading About data from Supabase...
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
            About & Background Configuration
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#737373', fontFamily: 'var(--font-mono, monospace)' }}>
            Biographical narrative, degree, and institution
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setReloadTrigger((v) => v + 1);
          }}
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
            <label style={labelStyle}>Section Tag</label>
            <input
              type="text"
              value={about.tag || ''}
              onChange={(e) => setAbout((prev) => ({ ...prev, tag: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Section Title</label>
            <input
              type="text"
              value={about.title || ''}
              onChange={(e) => setAbout((prev) => ({ ...prev, title: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Narrative Paragraphs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={labelStyle}>Bio Paragraphs</label>
            <button
              type="button"
              onClick={handleAddParagraph}
              style={{
                background: 'transparent',
                border: '1px solid #333333',
                color: '#cccccc',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono, monospace)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Plus size={11} />
              <span>Add Paragraph</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {about.paragraphs?.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <textarea
                  rows={3}
                  value={p}
                  onChange={(e) => handleParagraphChange(idx, e.target.value)}
                  placeholder={`Paragraph ${idx + 1}`}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveParagraph(idx)}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    borderRadius: '4px',
                    padding: '0.65rem 0.65rem',
                    cursor: 'pointer'
                  }}
                  title="Remove paragraph"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Academic Degree</label>
            <input
              type="text"
              value={about.academic_degree || ''}
              onChange={(e) => setAbout((prev) => ({ ...prev, academic_degree: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Academic Institution</label>
            <input
              type="text"
              value={about.academic_institution || ''}
              onChange={(e) => setAbout((prev) => ({ ...prev, academic_institution: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>CGPA / Grade</label>
            <input
              type="text"
              value={about.academic_cgpa || ''}
              onChange={(e) => setAbout((prev) => ({ ...prev, academic_cgpa: e.target.value }))}
              style={inputStyle}
            />
          </div>
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
            <span>{isSaving ? 'Saving changes...' : 'Save About Section'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
