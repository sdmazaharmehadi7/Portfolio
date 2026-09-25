import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import Toast from './components/Toast';

// 11 Section Editors
import ProfileEditor from './sections/ProfileEditor';
import AboutEditor from './sections/AboutEditor';
import ProjectsEditor from './sections/ProjectsEditor';
import SkillsEditor from './sections/SkillsEditor';
import ExperienceEditor from './sections/ExperienceEditor';
import EducationEditor from './sections/EducationEditor';
import CertificationsEditor from './sections/CertificationsEditor';
import AchievementsEditor from './sections/AchievementsEditor';
import SocialLinksEditor from './sections/SocialLinksEditor';
import ResumeEditor from './sections/ResumeEditor';
import SiteSettingsEditor from './sections/SiteSettingsEditor';

import {
  User,
  Info,
  FolderGit2,
  Cpu,
  Briefcase,
  GraduationCap,
  Award,
  Trophy,
  Share2,
  FileText,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const SECTIONS = [
  { id: 'profile', label: '1. Profile', icon: User, component: ProfileEditor },
  { id: 'about', label: '2. About', icon: Info, component: AboutEditor },
  { id: 'projects', label: '3. Projects', icon: FolderGit2, component: ProjectsEditor },
  { id: 'skills', label: '4. Skills', icon: Cpu, component: SkillsEditor },
  { id: 'experience', label: '5. Experience', icon: Briefcase, component: ExperienceEditor },
  { id: 'education', label: '6. Education', icon: GraduationCap, component: EducationEditor },
  { id: 'certifications', label: '7. Certifications', icon: Award, component: CertificationsEditor },
  { id: 'achievements', label: '8. Achievements', icon: Trophy, component: AchievementsEditor },
  { id: 'social_links', label: '9. Social Links', icon: Share2, component: SocialLinksEditor },
  { id: 'resume', label: '10. Resume', icon: FileText, component: ResumeEditor },
  { id: 'settings', label: '11. Site Settings', icon: Settings, component: SiteSettingsEditor }
];

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const { navigate } = useNavigation();

  const [activeSectionId, setActiveSectionId] = useState('projects');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Protected route check: redirect unauthenticated users to /admin/login
  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { message: '', type: 'success' } : prev));
    }, 4500);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (loading || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#050505',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888888',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.85rem'
        }}
      >
        <span>Verifying administrator session...</span>
      </div>
    );
  }

  const ActiveComponent = SECTIONS.find((s) => s.id === activeSectionId)?.component || ProjectsEditor;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#050505',
        color: '#ededed',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          height: '56px',
          borderBottom: '1px solid #1a1a1a',
          backgroundColor: '#0a0a0a',
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* Brand / Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888888',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'none'
            }}
            className="mobile-admin-toggle"
          >
            {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.04em',
                color: '#ffffff'
              }}
            >
              MAZAHAR
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.75rem',
                color: '#666666'
              }}
            >
              // PORTFOLIO ADMIN
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.65rem',
              color: '#4ade80'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#22c55e'
              }}
            />
            <span>SUPABASE LIVE</span>
          </div>
        </div>

        {/* Right Admin Profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              color: '#888888',
              backgroundColor: '#121212',
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid #222222',
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {user.email}
          </span>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'transparent',
              border: '1px solid #262626',
              color: '#cccccc',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={12} />
            <span>View Portfolio</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <LogOut size={12} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace (Sidebar + Content Pane) */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 56px)' }}>
        {/* Left Navigation Sidebar */}
        <aside
          style={{
            width: '240px',
            backgroundColor: '#070707',
            borderRight: '1px solid #1a1a1a',
            padding: '1.25rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            flexShrink: 0
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.65rem',
              color: '#555555',
              padding: '0 0.65rem 0.65rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            Content Collections
          </div>

          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSectionId === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveSectionId(section.id);
                  setIsMobileSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: isActive ? '#141414' : 'transparent',
                  color: isActive ? '#ffffff' : '#888888',
                  fontFamily: 'var(--font-sans, system-ui)',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 500 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 120ms ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#888888';
                }}
              >
                <Icon size={14} color={isActive ? '#ffffff' : '#666666'} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Editor Work Area */}
        <main
          style={{
            flex: 1,
            padding: '2rem 2.5rem',
            backgroundColor: '#050505',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 56px)'
          }}
        >
          <ActiveComponent onToast={showToast} />
        </main>
      </div>

      {/* Toast Notification Container */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
