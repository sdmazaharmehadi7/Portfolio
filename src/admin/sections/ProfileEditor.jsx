import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, RefreshCw } from 'lucide-react';

export default function ProfileEditor({ onToast }) {
  const [profile, setProfile] = useState({
    full_name: '',
    brand_name: '',
    title: '',
    eyebrow: '',
    headline: '',
    summary: '',
    email: '',
    gmail_compose_url: '',
    github_url: '',
    linkedin_url: '',
    resume_url: '',
    footer_location: '',
    footer_tagline: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    async function loadProfile() {
      try {
        const { data, error } = await supabase.from('profile').select('*').limit(1).maybeSingle();
        if (error) throw error;
        if (isMounted && data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        onToast?.('Failed to load profile from database.', 'error');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger, onToast]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving || !supabase) return;

    setIsSaving(true);
    try {
      const payload = {
        ...profile,
        updated_at: new Date().toISOString()
      };

      let result;
      if (profile.id) {
        result = await supabase.from('profile').update(payload).eq('id', profile.id);
      } else {
        result = await supabase.from('profile').insert([payload]);
      }

      if (result.error) throw result.error;
      onToast?.('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving profile:', err);
      onToast?.(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', color: '#888888', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem' }}>
        Loading profile data from Supabase...
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
            Profile & Hero Configuration
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#737373', fontFamily: 'var(--font-mono, monospace)' }}>
            Personal branding, headlines, and primary contact links
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
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={profile.full_name || ''}
              onChange={(e) => handleChange('full_name', e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Brand Name</label>
            <input
              type="text"
              value={profile.brand_name || ''}
              onChange={(e) => handleChange('brand_name', e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Professional Title</label>
            <input
              type="text"
              value={profile.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Hero Eyebrow Tag</label>
            <input
              type="text"
              value={profile.eyebrow || ''}
              onChange={(e) => handleChange('eyebrow', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Hero Headline</label>
          <textarea
            rows={3}
            value={profile.headline || ''}
            onChange={(e) => handleChange('headline', e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Bio Summary</label>
          <textarea
            rows={3}
            value={profile.summary || ''}
            onChange={(e) => handleChange('summary', e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Primary Email</label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Gmail Compose URL</label>
            <input
              type="url"
              value={profile.gmail_compose_url || ''}
              onChange={(e) => handleChange('gmail_compose_url', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>GitHub Profile URL</label>
            <input
              type="url"
              value={profile.github_url || ''}
              onChange={(e) => handleChange('github_url', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>LinkedIn Profile URL</label>
            <input
              type="url"
              value={profile.linkedin_url || ''}
              onChange={(e) => handleChange('linkedin_url', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Footer Location</label>
            <input
              type="text"
              value={profile.footer_location || ''}
              onChange={(e) => handleChange('footer_location', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Footer Tagline</label>
            <input
              type="text"
              value={profile.footer_tagline || ''}
              onChange={(e) => handleChange('footer_tagline', e.target.value)}
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
            <span>{isSaving ? 'Saving changes...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
