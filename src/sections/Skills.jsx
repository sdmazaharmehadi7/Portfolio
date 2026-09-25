import React from 'react';
import { Container, SectionHeading } from '../components';
import { skillsCategories } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Skills() {
  const [sectionRef, isVisible] = useScrollReveal(0.12);

  return (
    <section
      id="skills"
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
          tag="// CAPABILITIES // TOOLKIT"
          title="Skills"
          description="Disciplined technical capabilities across systems programming, frontier AI architectures, and distributed web applications."
        />

        {/* Minimal Typography-First Editorial Skills Layout with Hairline Dividers */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid var(--color-border)',
            marginTop: 'var(--space-8, 2rem)'
          }}
        >
          {skillsCategories.map((group, idx) => (
            <div
              key={group.category}
              className="skills-row"
              style={{
                borderBottom: '1px solid var(--color-border)',
                padding: 'clamp(1.5rem, 2.5vw, 2.25rem) 0',
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, 240px) 1fr',
                gap: 'clamp(1.5rem, 4vw, 3rem)',
                alignItems: 'baseline'
              }}
            >
              {/* Category Label */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-sm, 0.875rem)',
                  color: 'var(--color-primary)',
                  letterSpacing: 'var(--tracking-wide, 0.04em)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>// 0{idx + 1}</span>
                <span>{group.category}</span>
              </div>

              {/* Skills Items - Clean typography, no skill bars, no percentages, no stars */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem 1.5rem',
                  alignItems: 'center'
                }}
              >
                {group.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
                      color: 'var(--color-secondary)',
                      letterSpacing: '-0.01em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>{skill}</span>
                    {sIdx < group.skills.length - 1 && (
                      <span
                        style={{
                          color: 'var(--color-border)',
                          fontSize: '0.8rem',
                          marginLeft: '0.25rem',
                          userSelect: 'none'
                        }}
                      >
                        ·
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
