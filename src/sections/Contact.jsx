import React, { useState } from 'react';
import { Container, Divider } from '../components';
import { personalInfo } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Contact() {
  const [sectionRef, isVisible] = useScrollReveal(0.12);
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleEmailClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const win = window.open(personalInfo.gmailComposeUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = personalInfo.gmailComposeUrl;
    }
  };

  const contactLinks = [
    {
      label: 'GitHub',
      href: personalInfo.github,
      isExternal: true
    },
    {
      label: 'LinkedIn',
      href: personalInfo.linkedin,
      isExternal: true
    },
    {
      label: 'Email Me',
      href: personalInfo.gmailComposeUrl,
      isExternal: true,
      onClick: handleEmailClick,
      ariaLabel: `Open Gmail compose to email ${personalInfo.email}`
    },
    {
      label: 'Resume',
      href: '/resume.pdf',
      isExternal: true
    }
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{
        position: 'relative',
        paddingTop: 'clamp(6rem, 14vw, 11rem)',
        paddingBottom: 'clamp(3rem, 6vw, 5rem)',
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Subtle Generative Ambient Light Drift */}
      <div className="generative-light" aria-hidden="true" />

      <Container style={{ position: 'relative', zIndex: 1 }}>
        {/* Huge Typography Heading */}
        <div style={{ maxWidth: '820px', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(2.75rem, 6.5vw, 5.25rem)',
              fontWeight: 500,
              lineHeight: 1.08,
              letterSpacing: 'var(--tracking-tighter, -0.04em)',
              color: 'var(--color-primary)',
              whiteSpace: 'pre-line',
              marginBottom: 'var(--space-6, 1.5rem)'
            }}
          >
            {`Let's build something\ninteresting.`}
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(1.05rem, 1.8vw, 1.35rem)',
              color: 'var(--color-secondary)',
              lineHeight: 'var(--line-height-relaxed, 1.65)',
              maxWidth: '640px',
              margin: 0,
              whiteSpace: 'pre-line'
            }}
          >
            {`Open to internships, collaborations, AI projects,\nand interesting engineering opportunities.`}
          </p>
        </div>

        {/* Minimal Typography-First Contact Links Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(1.25rem, 3vw, 2.5rem)',
            alignItems: 'center',
            marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)'
          }}
        >
          {contactLinks.map((item) => {
            const isHovered = hoveredLink === item.label;

            return (
              <a
                key={item.label}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                onClick={item.onClick}
                aria-label={item.ariaLabel}
                onMouseEnter={() => setHoveredLink(item.label)}
                onMouseLeave={() => setHoveredLink(null)}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
                  color: isHovered ? 'var(--color-primary)' : 'var(--color-secondary)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderBottom: `1px solid ${isHovered ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  paddingBottom: '4px',
                  transition: 'color 240ms cubic-bezier(0.16, 1, 0.3, 1), border-color 240ms cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <span>{item.label}</span>
                <span
                  style={{
                    fontSize: '1rem',
                    transform: isHovered ? 'translate(2px, -2px)' : 'translate(0, 0)',
                    transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'inline-block'
                  }}
                  aria-hidden="true"
                >
                  ↗
                </span>
              </a>
            );
          })}
        </div>

        {/* Direct Email Address Display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: 'clamp(3rem, 7vw, 6rem)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-xs, 0.75rem)',
            color: 'var(--color-muted)'
          }}
        >
          <span>Direct:</span>
          <a
            href={personalInfo.gmailComposeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleEmailClick}
            style={{
              color: 'var(--color-secondary)',
              textDecoration: 'none',
              borderBottom: '1px dotted var(--color-border)',
              transition: 'color 150ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-secondary)')}
            aria-label={`Open Gmail compose to email ${personalInfo.email}`}
          >
            {personalInfo.email}
          </a>
        </div>

        {/* Subtle Hairline Divider */}
        <Divider spacing="sm" style={{ borderColor: 'var(--color-border)' }} />

        {/* Calm & Minimal Footer */}
        <footer
          style={{
            paddingTop: 'var(--space-6, 1.5rem)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-xs, 0.75rem)',
            color: 'var(--color-muted)'
          }}
        >
          <div>
            © 2026 Sayyad Mazahar Mehadi
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span>Bengaluru / Online</span>
            <span>·</span>
            <span>Monochrome Technical Edition</span>
          </div>
        </footer>
      </Container>
    </section>
  );
}
