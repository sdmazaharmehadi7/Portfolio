import React, { useState } from 'react';
import { Container, SectionHeading } from '../components';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Experience() {
  const [sectionRef, isVisible] = useScrollReveal(0.12);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { experiences, achievements, education, certifications } = usePortfolioData();

  const sections = [
    {
      heading: '// 01. PROFESSIONAL EXPERIENCE',
      title: 'Internships',
      items: experiences
    },
    {
      heading: '// 02. COMPETITIONS & LEADERSHIP',
      title: 'Achievements & Activities',
      items: achievements
    },
    {
      heading: '// 03. ACADEMIC FOUNDATION',
      title: 'Education',
      items: education
    },
    ...(certifications && certifications.length > 0
      ? [
          {
            heading: '// 04. CREDENTIALS & CERTIFICATIONS',
            title: 'Certifications',
            items: certifications.map((c) => ({
              period: c.issue_date || 'Certified',
              title: c.title,
              organization: c.issuer,
              focus: 'Credential',
              description: `Official certification issued by ${c.issuer}.`
            }))
          }
        ]
      : [])
  ];

  return (
    <section
      id="experience"
      ref={sectionRef}
      style={{
        paddingTop: 'var(--space-12, 3rem)',
        paddingBottom: 'var(--space-16, 4rem)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <Container>
        <SectionHeading
          tag="// BACKGROUND // TRAJECTORY"
          title="Experience & Credentials"
          description="Industrial internships, competitive engineering initiatives, and foundational academic coursework."
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16, 4rem)', marginTop: 'var(--space-8, 2rem)' }}>
          {sections.map((sectionGroup, sIdx) => (
            <div key={sIdx}>
              {/* Group Subheading */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: 'var(--space-3, 0.75rem)',
                  marginBottom: 'var(--space-6, 1.5rem)'
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-primary)'
                  }}
                >
                  {sectionGroup.title}
                </h3>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--font-size-xs, 0.75rem)',
                    color: 'var(--color-muted)',
                    letterSpacing: '0.04em'
                  }}
                >
                  {sectionGroup.heading}
                </span>
              </div>

              {/* Timeline Container with Thin Vertical Line */}
              <div
                style={{
                  position: 'relative',
                  paddingLeft: 'clamp(1rem, 2.5vw, 2rem)'
                }}
              >
                {/* Thin vertical timeline line */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    bottom: '8px',
                    left: 0,
                    width: '1px',
                    backgroundColor: 'var(--color-border)'
                  }}
                  aria-hidden="true"
                />

                {/* Timeline Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8, 2rem)' }}>
                  {sectionGroup.items.map((item, idx) => {
                    const itemKey = `${sIdx}-${idx}`;
                    const isHovered = hoveredItem === itemKey;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredItem(itemKey)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          position: 'relative',
                          transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                          transition: 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        {/* Timeline Node Dot */}
                        <div
                          style={{
                            position: 'absolute',
                            left: 'calc(-1 * clamp(1rem, 2.5vw, 2rem) - 4.5px)',
                            top: '6px',
                            width: '9px',
                            height: '9px',
                            borderRadius: '50%',
                            backgroundColor: isHovered ? 'var(--color-primary)' : 'var(--color-bg)',
                            border: `1px solid ${isHovered ? 'var(--color-primary)' : 'var(--color-border-hover)'}`,
                            transition: 'background-color 260ms cubic-bezier(0.16, 1, 0.3, 1), border-color 260ms cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                          aria-hidden="true"
                        />

                        {/* Two-Column Item Content (Left: Label/Period, Right: Details) */}
                        <div
                          className="experience-item-row"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(110px, 160px) 1fr',
                            gap: 'clamp(1rem, 3vw, 2.5rem)',
                            alignItems: 'baseline'
                          }}
                        >
                          {/* Left Column: Label / Focus */}
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 'var(--font-size-xs, 0.75rem)',
                              color: isHovered ? 'var(--color-primary)' : 'var(--color-muted)',
                              letterSpacing: '0.04em',
                              transition: 'color 150ms ease'
                            }}
                          >
                            <span>{item.focus || item.period}</span>
                            {item.score && (
                              <div
                                style={{
                                  marginTop: '0.35rem',
                                  fontSize: '0.85rem',
                                  fontWeight: 500,
                                  color: 'var(--color-primary)'
                                }}
                              >
                                {item.score}
                              </div>
                            )}
                          </div>

                          {/* Right Column: Title, Organization, Description */}
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'baseline',
                                gap: '0.5rem 0.85rem',
                                marginBottom: '0.35rem'
                              }}
                            >
                              <h4
                                style={{
                                  fontFamily: 'var(--font-sans)',
                                  fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
                                  fontWeight: 500,
                                  letterSpacing: '-0.02em',
                                  color: 'var(--color-primary)',
                                  lineHeight: 1.3
                                }}
                              >
                                {item.title}
                              </h4>
                              <span
                                style={{
                                  fontFamily: 'var(--font-sans)',
                                  fontSize: 'var(--font-size-sm, 0.875rem)',
                                  color: 'var(--color-muted)'
                                }}
                              >
                                @ {item.organization}
                              </span>
                            </div>

                            <p
                              style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: 'var(--font-size-sm, 0.875rem)',
                                color: 'var(--color-secondary)',
                                lineHeight: 'var(--line-height-relaxed, 1.65)',
                                maxWidth: '720px',
                                margin: 0
                              }}
                            >
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
