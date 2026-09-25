import React, { useState, useEffect } from 'react';
import Container from './Container';
import { personalInfo } from '../data/portfolioData';

const NAV_LINKS = [
  { label: 'Projects', href: '#projects' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLetsTalkClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const win = window.open(personalInfo.gmailComposeUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = personalInfo.gmailComposeUrl;
    }
  };

  const handleMobileLetsTalkClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    closeMobileMenu();
    const win = window.open(personalInfo.gmailComposeUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = personalInfo.gmailComposeUrl;
    }
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'background-color 350ms cubic-bezier(0.16, 1, 0.3, 1), border-color 350ms cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 350ms cubic-bezier(0.16, 1, 0.3, 1), -webkit-backdrop-filter 350ms cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: isScrolled
          ? 'rgba(0, 0, 0, 0.85)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${isScrolled ? 'var(--color-border)' : 'transparent'}`
      }}
    >
      <Container>
        <div
          style={{
            height: 'var(--header-height, 60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Left: Brand Identity */}
          <a
            href="#"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '0.95rem',
              letterSpacing: '-0.03em',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              transition: 'opacity 150ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            aria-label="Mazahar Home"
          >
            MAZAHAR
          </a>

          {/* Desktop Center: Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem'
            }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  color: 'var(--color-secondary)',
                  textDecoration: 'none',
                  transition: 'color 150ms ease',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-secondary)')}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Action Link & Mobile Menu Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a
              href={personalInfo.gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLetsTalkClick}
              className="desktop-cta"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--color-primary)',
                textDecoration: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md, 6px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                transition: 'all 150ms ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
              }}
              aria-label="Open Gmail compose to email Sayyad Mazahar Mehadi"
            >
              <span>Let's talk</span>
              <span style={{ fontSize: '0.9rem' }}>↗</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm, 4px)',
                color: 'var(--color-primary)',
                padding: '0.35rem 0.65rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {isMobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Mobile Navigation"
            className="mobile-nav"
            style={{
              borderTop: '1px solid var(--color-border)',
              backgroundColor: '#000000',
              padding: '1.25rem 0 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                  color: 'var(--color-secondary)',
                  textDecoration: 'none',
                  padding: '0.4rem 0',
                  transition: 'color 150ms ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-secondary)')}
              >
                {link.label}
              </a>
            ))}

            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
              <a
                href={personalInfo.gmailComposeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleMobileLetsTalkClick}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                aria-label="Open Gmail compose to email Sayyad Mazahar Mehadi"
              >
                <span>Let's talk</span>
                <span>↗</span>
              </a>
            </div>
          </nav>
        )}
      </Container>
    </header>
  );
}
