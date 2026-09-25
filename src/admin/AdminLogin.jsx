import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import { Lock, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const { user, login } = useAuth();
  const { navigate } = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already authenticated, redirect to /admin/dashboard
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await login(email.trim(), password);
      navigate('/admin/dashboard');
    } catch (err) {
      console.warn('Login error:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setErrorMsg('Invalid administrator credentials.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#050505',
        color: '#ededed',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem',
        position: 'relative'
      }}
    >
      {/* Background Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          opacity: 0.8
        }}
      />

      {/* Top Left: Back Link */}
      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'transparent',
          border: '1px solid #222222',
          color: '#888888',
          padding: '0.45rem 0.85rem',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.8rem',
          cursor: 'pointer',
          transition: 'all 150ms ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.borderColor = '#444444';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#888888';
          e.currentTarget.style.borderColor = '#222222';
        }}
      >
        <ArrowLeft size={14} />
        <span>Portfolio</span>
      </button>

      {/* Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#0a0a0a',
          border: '1px solid #1f1f1f',
          borderRadius: '8px',
          padding: '2.5rem 2rem',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
        }}
      >
        {/* Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid #262626'
            }}
          >
            <Lock size={14} color="#e5e5e5" />
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: '#888888',
              textTransform: 'uppercase'
            }}
          >
            // SYSTEM // RESTRICTED ACCESS
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-sans, system-ui)',
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '0 0 0.5rem 0',
            color: '#ffffff'
          }}
        >
          Administrator Login
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-sans, system-ui)',
            fontSize: '0.85rem',
            color: '#737373',
            margin: '0 0 1.75rem 0',
            lineHeight: 1.5
          }}
        >
          Authenticate with your administrator credentials to access the portfolio content management console.
        </p>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '0.75rem 0.85rem',
              marginBottom: '1.5rem',
              color: '#f87171',
              fontSize: '0.825rem',
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              htmlFor="admin-email"
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.75rem',
                color: '#a3a3a3',
                marginBottom: '0.45rem',
                letterSpacing: '0.02em'
              }}
            >
              ADMIN EMAIL
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
              style={{
                width: '100%',
                backgroundColor: '#121212',
                border: '1px solid #262626',
                borderRadius: '5px',
                padding: '0.65rem 0.85rem',
                color: '#ffffff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#555555')}
              onBlur={(e) => (e.target.style.borderColor = '#262626')}
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.75rem',
                color: '#a3a3a3',
                marginBottom: '0.45rem',
                letterSpacing: '0.02em'
              }}
            >
              PASSWORD
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
              style={{
                width: '100%',
                backgroundColor: '#121212',
                border: '1px solid #262626',
                borderRadius: '5px',
                padding: '0.65rem 0.85rem',
                color: '#ffffff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#555555')}
              onBlur={(e) => (e.target.style.borderColor = '#262626')}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '5px',
              padding: '0.75rem 1rem',
              fontFamily: 'var(--font-sans, system-ui)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: isLoading ? 'wait' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              marginTop: '0.5rem',
              transition: 'opacity 150ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? (
              <span>Verifying credentials...</span>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Sign In to Admin</span>
              </>
            )}
          </button>
        </form>

        {/* Private Warning */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #1a1a1a',
            textAlign: 'center'
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.7rem',
              color: '#555555'
            }}
          >
            Single Administrator System • Public registration is disabled
          </span>
        </div>
      </div>
    </div>
  );
}
