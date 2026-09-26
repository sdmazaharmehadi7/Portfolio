import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Save, RefreshCw, ExternalLink, Upload, Trash2, Eye,
  FileText, CheckCircle, AlertCircle, Loader
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes) return '—';
  const n = Number(bytes);
  if (isNaN(n)) return String(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function getPublicUrl(storagePath) {
  if (!supabase || !storagePath) return null;
  const { data } = supabase.storage.from('resumes').getPublicUrl(storagePath);
  return data?.publicUrl || null;
}

// ─── column map ─────────────────────────────────────────────────────────────
// Actual DB columns: id, filename, file_url, file_size, file_version,
//                   is_active, uploaded_at, storage_path, updated_at

export default function ResumeEditor({ onToast }) {
  // ── state ──────────────────────────────────────────────────────────────────
  const [resume, setResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // upload flow
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle|uploading|success|error
  const [uploadError, setUploadError] = useState('');

  // bucket files
  const [bucketFiles, setBucketFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef(null);

  // ── load active resume ────────────────────────────────────────────────────
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
        if (isMounted) setResume(data);
      } catch (err) {
        console.error('Error loading resume:', err);
        onToast?.('Failed to load resume metadata.', 'error');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadResume();
    return () => { isMounted = false; };
  }, [reloadTrigger, onToast]);

  // ── load bucket file list ─────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    async function loadFiles() {
      setLoadingFiles(true);
      try {
        const { data, error } = await supabase.storage.from('resumes').list('', {
          limit: 50,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });
        if (error) throw error;
        if (isMounted) {
          setBucketFiles((data || []).filter((f) => f.name !== '.emptyFolderPlaceholder'));
        }
      } catch (err) {
        console.error('Error listing bucket:', err);
      } finally {
        if (isMounted) setLoadingFiles(false);
      }
    }

    loadFiles();
    return () => { isMounted = false; };
  }, [reloadTrigger]);

  // ── file validation ───────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are accepted. Please choose a .pdf file.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File is too large. Maximum allowed size is 10 MB.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setUploadError('');
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  // ── upload PDF ────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile || !supabase) return;
    if (uploadStatus === 'uploading') return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadError('');

    try {
      // Versioned filename
      const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 15);
      const storagePath = `resume_${stamp}.pdf`;

      // Fake-progress while upload runs (Storage JS v2 has no real progress events)
      const progressTimer = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 7, 82));
      }, 180);

      const { error: uploadErr } = await supabase.storage
        .from('resumes')
        .upload(storagePath, selectedFile, {
          contentType: 'application/pdf',
          upsert: false,
          cacheControl: '3600'
        });

      clearInterval(progressTimer);
      if (uploadErr) throw uploadErr;

      setUploadProgress(90);

      const publicUrl = getPublicUrl(storagePath);
      if (!publicUrl) throw new Error('Could not resolve public URL for uploaded file.');

      setUploadProgress(94);

      // Deactivate any existing active record
      await supabase
        .from('resume_metadata')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('is_active', true);

      setUploadProgress(97);

      // Insert new active record using actual DB column names
      const { error: dbErr } = await supabase.from('resume_metadata').insert([{
        filename: selectedFile.name,
        file_url: publicUrl,
        file_size: selectedFile.size,
        file_version: new Date().toISOString().slice(0, 10),
        storage_path: storagePath,
        is_active: true,
        uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

      if (dbErr) throw dbErr;

      // Sync profile.resume_url — update all profile rows (there is only one)
      await supabase
        .from('profile')
        .update({ resume_url: publicUrl, updated_at: new Date().toISOString() })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      setUploadProgress(100);
      setUploadStatus('success');
      onToast?.('Resume uploaded & activated! The public portfolio now uses the new file.', 'success');

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
        setReloadTrigger((v) => v + 1);
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
      setUploadStatus('error');
      setUploadProgress(0);
    }
  };

  // ── activate a storage file ───────────────────────────────────────────────
  const handleActivateFile = async (file) => {
    if (!supabase) return;
    const publicUrl = getPublicUrl(file.name);
    if (!publicUrl) { onToast?.('Could not resolve public URL.', 'error'); return; }

    setIsSaving(true);
    try {
      await supabase
        .from('resume_metadata')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('is_active', true);

      await supabase.from('resume_metadata').insert([{
        filename: file.name,
        file_url: publicUrl,
        file_size: file.metadata?.size ?? null,
        file_version: file.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        storage_path: file.name,
        is_active: true,
        uploaded_at: file.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

      await supabase
        .from('profile')
        .update({ resume_url: publicUrl, updated_at: new Date().toISOString() })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      onToast?.(`"${file.name}" is now the active resume.`, 'success');
      setReloadTrigger((v) => v + 1);
    } catch (err) {
      onToast?.(`Activate failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── delete storage file ───────────────────────────────────────────────────
  const handleDeleteFile = async () => {
    if (!confirmDelete || !supabase) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.storage.from('resumes').remove([confirmDelete.name]);
      if (error) throw error;

      // Deactivate if this was active
      if (resume?.storage_path === confirmDelete.name) {
        await supabase
          .from('resume_metadata')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('storage_path', confirmDelete.name);
      }

      onToast?.(`"${confirmDelete.name}" deleted from storage.`, 'success');
      setConfirmDelete(null);
      setReloadTrigger((v) => v + 1);
    } catch (err) {
      onToast?.(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── save metadata edits ───────────────────────────────────────────────────
  const handleSaveMeta = async (e) => {
    e.preventDefault();
    if (isSaving || !supabase || !resume) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('resume_metadata')
        .update({
          filename: (resume.filename || '').trim(),
          file_url: (resume.file_url || '').trim(),
          file_version: (resume.file_version || '').trim() || new Date().toISOString().slice(0, 10),
          updated_at: new Date().toISOString()
        })
        .eq('id', resume.id);

      if (error) throw error;

      // Sync profile — update all profile rows (there is only one)
      await supabase
        .from('profile')
        .update({ resume_url: resume.file_url?.trim(), updated_at: new Date().toISOString() })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      onToast?.('Resume metadata saved!', 'success');
      setReloadTrigger((v) => v + 1);
    } catch (err) {
      onToast?.(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── styles ───────────────────────────────────────────────────────────────
  const card = {
    backgroundColor: '#0c0c0c',
    border: '1px solid #1e1e1e',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem'
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

  const lbl = {
    display: 'block',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.7rem',
    color: '#666',
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const btnPrimary = {
    padding: '0.6rem 1.25rem',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: '5px',
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem'
  };

  const btnGhost = {
    padding: '0.45rem 0.85rem',
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #2a2a2a',
    borderRadius: '5px',
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    textDecoration: 'none'
  };

  // ─── render ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', color: '#444', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading resume data…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: '0 0 0.3rem 0' }}>
            Resume Management
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#444', fontFamily: 'var(--font-mono, monospace)' }}>
            Upload PDF to Supabase Storage · Activate · Preview · Delete
          </span>
        </div>
        <button style={btnGhost} onClick={() => setReloadTrigger((v) => v + 1)}>
          <RefreshCw size={12} /> Reload
        </button>
      </div>

      {/* ── Active Resume Card ── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <FileText size={16} color="#22c55e" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Active Resume</h3>
          {resume?.is_active && (
            <span style={{
              fontSize: '0.68rem', fontFamily: 'var(--font-mono, monospace)',
              backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e',
              border: '1px solid rgba(34,197,94,0.3)', borderRadius: '3px',
              padding: '0.1rem 0.5rem'
            }}>LIVE</span>
          )}
        </div>

        {resume ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginBottom: '1rem' }}>
              {[
                ['Filename', resume.filename],
                ['Version', resume.file_version],
                ['File Size', formatBytes(resume.file_size)],
                ['Uploaded', resume.uploaded_at
                  ? new Date(resume.uploaded_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—']
              ].map(([label, val]) => (
                <div key={label}>
                  <span style={lbl}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.82rem', color: '#e5e5e5', wordBreak: 'break-all' }}>{val || '—'}</span>
                </div>
              ))}
            </div>

            {/* URL chip */}
            <div style={{
              backgroundColor: '#080808', border: '1px solid #1a1a1a', borderRadius: '5px',
              padding: '0.55rem 0.85rem', fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.7rem', color: '#444', wordBreak: 'break-all', marginBottom: '1rem'
            }}>
              {resume.file_url || 'No URL set'}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {resume.file_url && (
                <>
                  <a href={resume.file_url} target="_blank" rel="noopener noreferrer" style={btnGhost}>
                    <Eye size={13} /> Preview
                  </a>
                  <a href={resume.file_url} download={resume.filename || 'resume.pdf'} style={btnGhost}>
                    <ExternalLink size={13} /> Download
                  </a>
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{
            padding: '1.5rem', textAlign: 'center', color: '#333',
            fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem',
            border: '1px dashed #1e1e1e', borderRadius: '6px'
          }}>
            No active resume found. Upload a PDF below to get started.
          </div>
        )}
      </div>

      {/* ── Edit Metadata ── */}
      {resume && (
        <div style={card}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 600, color: '#d4d4d4' }}>
            Edit Metadata
          </h3>
          <form onSubmit={handleSaveMeta} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={lbl}>Display Filename</label>
                <input
                  type="text"
                  value={resume.filename || ''}
                  onChange={(e) => setResume({ ...resume, filename: e.target.value })}
                  style={inputStyle}
                  placeholder="Sayyad_Mazahar_Mehadi_Resume.pdf"
                />
              </div>
              <div>
                <label style={lbl}>Version Tag</label>
                <input
                  type="text"
                  value={resume.file_version || ''}
                  onChange={(e) => setResume({ ...resume, file_version: e.target.value })}
                  style={inputStyle}
                  placeholder="2025.1"
                />
              </div>
            </div>
            <div>
              <label style={lbl}>Public Download URL (auto-set on upload)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={resume.file_url || ''}
                  onChange={(e) => setResume({ ...resume, file_url: e.target.value })}
                  style={inputStyle}
                  placeholder="https://..."
                />
                {resume.file_url && (
                  <a href={resume.file_url} target="_blank" rel="noopener noreferrer"
                    style={{ ...btnGhost, whiteSpace: 'nowrap', color: '#888' }}>
                    <ExternalLink size={12} /> Test
                  </a>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={isSaving}
                style={{ ...btnPrimary, opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'wait' : 'pointer' }}>
                <Save size={14} /> {isSaving ? 'Saving…' : 'Save Metadata'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Upload New Resume ── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <Upload size={16} color="#60a5fa" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Upload New Resume</h3>
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${selectedFile ? '#22c55e' : '#222'}`,
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: selectedFile ? 'rgba(34,197,94,0.04)' : '#070707',
            transition: 'border-color 0.2s, background-color 0.2s',
            marginBottom: '1rem'
          }}
        >
          {selectedFile ? (
            <div>
              <CheckCircle size={24} color="#22c55e" style={{ marginBottom: '0.5rem' }} />
              <p style={{ margin: '0 0 0.25rem 0', color: '#e5e5e5', fontSize: '0.9rem', fontWeight: 500 }}>{selectedFile.name}</p>
              <p style={{ margin: 0, color: '#444', fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)' }}>
                {formatBytes(selectedFile.size)} · PDF · Click to change
              </p>
            </div>
          ) : (
            <div>
              <Upload size={24} color="#333" style={{ marginBottom: '0.5rem' }} />
              <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.88rem' }}>Click to choose a PDF file</p>
              <p style={{ margin: 0, color: '#333', fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)' }}>PDF only · Max 10 MB</p>
            </div>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelect} style={{ display: 'none' }} />

        {/* Error */}
        {uploadError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '5px', marginBottom: '1rem'
          }}>
            <AlertCircle size={14} color="#f87171" />
            <span style={{ color: '#f87171', fontSize: '0.8rem', fontFamily: 'var(--font-mono, monospace)' }}>{uploadError}</span>
          </div>
        )}

        {/* Progress bar */}
        {uploadStatus === 'uploading' && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'var(--font-mono, monospace)' }}>Uploading to Supabase Storage…</span>
              <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontFamily: 'var(--font-mono, monospace)' }}>{uploadProgress}%</span>
            </div>
            <div style={{ backgroundColor: '#1a1a1a', borderRadius: '3px', height: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', backgroundColor: '#60a5fa',
                width: `${uploadProgress}%`, transition: 'width 0.18s ease', borderRadius: '3px'
              }} />
            </div>
          </div>
        )}

        {/* Success */}
        {uploadStatus === 'success' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '5px', marginBottom: '1rem'
          }}>
            <CheckCircle size={14} color="#22c55e" />
            <span style={{ color: '#22c55e', fontSize: '0.8rem', fontFamily: 'var(--font-mono, monospace)' }}>
              Upload complete! The public portfolio now uses this resume.
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {selectedFile && uploadStatus !== 'uploading' && (
            <button
              type="button"
              onClick={() => { setSelectedFile(null); setUploadStatus('idle'); setUploadError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              style={btnGhost}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
            style={{
              ...btnPrimary,
              backgroundColor: (selectedFile && uploadStatus === 'idle') ? '#ffffff' : '#1e1e1e',
              color: (selectedFile && uploadStatus === 'idle') ? '#000' : '#444',
              cursor: (!selectedFile || uploadStatus === 'uploading') ? 'not-allowed' : 'pointer'
            }}
          >
            {uploadStatus === 'uploading'
              ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Uploading…</>
              : <><Upload size={14} /> Upload &amp; Activate</>
            }
          </button>
        </div>
      </div>

      {/* ── Stored Files ── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <FileText size={16} color="#a78bfa" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Files in Storage</h3>
          <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#333', fontFamily: 'var(--font-mono, monospace)' }}>
            bucket: resumes
          </span>
        </div>

        {loadingFiles ? (
          <div style={{ color: '#333', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Loader size={12} /> Loading…
          </div>
        ) : bucketFiles.length === 0 ? (
          <div style={{
            padding: '1.25rem', textAlign: 'center', color: '#2a2a2a',
            fontFamily: 'var(--font-mono, monospace)', fontSize: '0.82rem',
            border: '1px dashed #1a1a1a', borderRadius: '6px'
          }}>
            No files in storage yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {bucketFiles.map((file) => {
              const isActive = resume?.storage_path === file.name;
              const publicUrl = getPublicUrl(file.name);
              return (
                <div key={file.name} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: isActive ? 'rgba(34,197,94,0.05)' : '#070707',
                  border: `1px solid ${isActive ? 'rgba(34,197,94,0.2)' : '#161616'}`,
                  borderRadius: '6px', flexWrap: 'wrap'
                }}>
                  <FileText size={14} color={isActive ? '#22c55e' : '#333'} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem', color: '#e5e5e5', wordBreak: 'break-all' }}>
                      {file.name}
                      {isActive && (
                        <span style={{
                          marginLeft: '0.5rem', fontSize: '0.65rem',
                          backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e',
                          border: '1px solid rgba(34,197,94,0.25)', borderRadius: '2px',
                          padding: '0.05rem 0.4rem'
                        }}>ACTIVE</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#333', fontFamily: 'var(--font-mono, monospace)', marginTop: '0.15rem' }}>
                      {formatBytes(file.metadata?.size)}
                      {file.created_at && ` · ${new Date(file.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    {publicUrl && (
                      <a href={publicUrl} target="_blank" rel="noopener noreferrer" style={btnGhost} title="Preview">
                        <Eye size={12} />
                      </a>
                    )}
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => handleActivateFile(file)}
                        disabled={isSaving}
                        style={{ ...btnGhost, color: '#60a5fa', borderColor: 'rgba(96,165,250,0.25)' }}
                        title="Set as active"
                      >
                        <CheckCircle size={12} /> Activate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(file)}
                      style={{ ...btnGhost, color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}
                      title="Delete file"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Delete Confirm ── */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}
        >
          <div style={{
            backgroundColor: '#0f0f0f', border: '1px solid #222',
            borderRadius: '10px', padding: '2rem', maxWidth: '400px', width: '90%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <Trash2 size={18} color="#f87171" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Delete File</h3>
            </div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#888', lineHeight: 1.5 }}>
              Permanently remove this file from Supabase Storage?
            </p>
            <div style={{
              margin: '0 0 1.25rem 0', fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.78rem', color: '#e5e5e5',
              backgroundColor: '#080808', padding: '0.5rem 0.75rem',
              borderRadius: '4px', wordBreak: 'break-all'
            }}>
              {confirmDelete.name}
            </div>
            {resume?.storage_path === confirmDelete.name && (
              <div style={{
                padding: '0.5rem 0.75rem', marginBottom: '1rem',
                backgroundColor: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: '5px', fontSize: '0.78rem', color: '#fbbf24',
                fontFamily: 'var(--font-mono, monospace)'
              }}>
                ⚠ This is the currently active resume.
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button type="button" onClick={() => setConfirmDelete(null)} style={btnGhost}>Cancel</button>
              <button
                type="button"
                onClick={handleDeleteFile}
                disabled={isDeleting}
                style={{ ...btnPrimary, backgroundColor: '#ef4444', color: '#fff', opacity: isDeleting ? 0.7 : 1 }}
              >
                {isDeleting ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
