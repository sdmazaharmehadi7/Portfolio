import React, { useState } from 'react';
import { Container, SectionHeading } from '../components';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';

// Minimal monochrome architectural schematic thumbnails for optional preview
function ProjectSchematic({ type }) {
  switch (type) {
    case 'workbench':
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="140" height="70" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="10" y1="26" x2="150" y2="26" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <circle cx="20" cy="18" r="2.5" fill="rgba(255,255,255,0.3)" />
          <circle cx="28" cy="18" r="2.5" fill="rgba(255,255,255,0.2)" />
          <rect x="20" y="38" width="50" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
          <rect x="20" y="48" width="85" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
          <rect x="20" y="56" width="65" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
          <rect x="115" y="38" width="25" height="25" rx="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        </svg>
      );
    case 'forecast':
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="140" height="70" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M 25 65 L 55 45 L 85 52 L 115 30 L 135 24" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="135" cy="24" r="3" fill="#FFFFFF" />
          <line x1="25" y1="70" x2="135" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </svg>
      );
    case 'agent':
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="140" height="70" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle cx="80" cy="32" r="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <line x1="74" y1="38" x2="48" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <line x1="80" y1="40" x2="80" y2="58" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <line x1="86" y1="38" x2="112" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <rect x="40" y="60" width="16" height="10" rx="2" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <rect x="72" y="60" width="16" height="10" rx="2" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <rect x="104" y="60" width="16" height="10" rx="2" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </svg>
      );
    case 'chat':
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="140" height="70" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <rect x="22" y="24" width="60" height="14" rx="3" fill="rgba(255,255,255,0.1)" />
          <rect x="78" y="44" width="60" height="14" rx="3" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <circle cx="28" cy="68" r="3" fill="rgba(255,255,255,0.4)" />
          <circle cx="36" cy="68" r="3" fill="rgba(255,255,255,0.3)" />
          <circle cx="44" cy="68" r="3" fill="rgba(255,255,255,0.2)" />
        </svg>
      );
    case 'payment':
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="140" height="70" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <rect x="26" y="22" width="108" height="46" rx="4" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <line x1="26" y1="36" x2="134" y2="36" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <rect x="36" y="48" width="24" height="6" rx="1.5" fill="rgba(255,255,255,0.3)" />
          <circle cx="120" cy="51" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </svg>
      );
    case 'security':
    default:
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="140" height="70" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle cx="80" cy="40" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          <rect x="74" y="48" width="12" height="16" rx="2" fill="rgba(255,255,255,0.2)" />
          <circle cx="80" cy="54" r="1.5" fill="#FFFFFF" />
        </svg>
      );
  }
}

export default function Projects() {
  const [sectionRef, isVisible] = useScrollReveal(0.1);
  const [hoveredProject, setHoveredProject] = useState(null);
  const { projects } = usePortfolioData();

  return (
    <section
      id="projects"
      ref={sectionRef}
      style={{
        paddingTop: 'var(--space-12, 3rem)',
        paddingBottom: 'var(--space-16, 4rem)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <Container>
        <SectionHeading
          tag="// SELECTED REPERTOIRE"
          title="Selected Work"
          description="Production systems, autonomous agent runtimes, and full-stack software built with mathematical rigor."
        />

        {/* Editorial Project List */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid var(--color-border)',
            marginTop: 'var(--space-8, 2rem)'
          }}
        >
          {projects.map((project) => {
            const isHovered = hoveredProject === project.id;
            const primaryLink = project.liveUrl || project.githubUrl;

            return (
              <article
                key={project.id}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                style={{
                  borderBottom: `1px solid ${isHovered ? 'var(--color-border-hover)' : 'var(--color-border)'}`,
                  padding: 'clamp(1.5rem, 3vw, 2.25rem) 0',
                  backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                  transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                  transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1), background-color 320ms cubic-bezier(0.16, 1, 0.3, 1), border-color 320ms cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(40px, 60px) 1fr auto',
                    gap: 'clamp(1rem, 3vw, 2.5rem)',
                    alignItems: 'baseline'
                  }}
                >
                  {/* Project Number */}
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--font-size-sm, 0.875rem)',
                      color: isHovered ? 'var(--color-primary)' : 'var(--color-muted)',
                      letterSpacing: '0.04em',
                      transition: 'color 150ms ease'
                    }}
                  >
                    {project.num}
                  </div>

                  {/* Main Editorial Content Column */}
                  <div>
                    {/* Header Row: Title & Arrow */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <a
                        href={primaryLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <h3
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 'clamp(1.25rem, 2.4vw, 1.65rem)',
                            fontWeight: 500,
                            letterSpacing: 'var(--tracking-tight, -0.02em)',
                            color: 'var(--color-primary)',
                            lineHeight: 1.25
                          }}
                        >
                          {project.title}
                        </h3>

                        {/* Animated Arrow Indicator */}
                        <span
                          style={{
                            display: 'inline-block',
                            color: isHovered ? 'var(--color-primary)' : 'var(--color-muted)',
                            fontSize: '1.15rem',
                            transform: isHovered ? 'translate(2.5px, -2.5px)' : 'translate(0, 0)',
                            transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1), color 200ms ease'
                          }}
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </a>
                    </div>

                    {/* Short Description */}
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'var(--font-size-base, 1rem)',
                        color: 'var(--color-secondary)',
                        lineHeight: 'var(--line-height-relaxed, 1.65)',
                        maxWidth: '720px',
                        marginBottom: '1rem'
                      }}
                    >
                      {project.description}
                    </p>

                    {/* Technologies Tag List */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem 0.85rem',
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}
                    >
                      {project.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--font-size-xs, 0.75rem)',
                            color: isHovered ? 'var(--color-secondary)' : 'var(--color-muted)',
                            transition: 'color 150ms ease'
                          }}
                        >
                          {tech}
                          {tIdx < project.technologies.length - 1 && (
                            <span style={{ color: 'var(--color-border)', marginLeft: '0.85rem' }}>·</span>
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Action Links: GitHub & Live Demo */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '1.25rem',
                        alignItems: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem'
                      }}
                    >
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: 'var(--color-secondary)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            borderBottom: '1px solid var(--color-border)',
                            paddingBottom: '2px',
                            transition: 'all 150ms ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.borderColor = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--color-secondary)';
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                          }}
                        >
                          <span>Source Code</span>
                          <span style={{ fontSize: '0.85rem' }}>↗</span>
                        </a>
                      )}

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            borderBottom: '1px solid var(--color-primary)',
                            paddingBottom: '2px',
                            fontWeight: 500,
                            transition: 'opacity 150ms ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        >
                          <span>Live Demo</span>
                          <span style={{ fontSize: '0.85rem' }}>↗</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Optional Subtle Schematic Preview (Monochrome Architectural Micro-Thumbnail) */}
                  <div
                    className="project-schematic-preview"
                    style={{
                      width: '130px',
                      height: '75px',
                      backgroundColor: 'var(--color-surface, #0A0A0A)',
                      border: `1px solid ${isHovered ? 'var(--color-border-hover)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm, 4px)',
                      opacity: isHovered ? 1 : 0.45,
                      transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
                      transition: 'opacity 320ms cubic-bezier(0.16, 1, 0.3, 1), border-color 320ms cubic-bezier(0.16, 1, 0.3, 1), transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignSelf: 'center'
                    }}
                    aria-hidden="true"
                  >
                    <ProjectSchematic type={project.previewType} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
