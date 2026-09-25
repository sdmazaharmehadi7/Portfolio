import { Container, SectionHeading } from '../components';
import { aboutData } from '../data/portfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function About() {
  const [sectionRef, isVisible] = useScrollReveal(0.12);

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        paddingTop: 'var(--space-16, 4rem)',
        paddingBottom: 'var(--space-12, 3rem)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <Container>
        <SectionHeading
          tag="// PROFILE // BACKGROUND"
          title={aboutData.title}
        />

        {/* Two-Column Editorial Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(2rem, 5vw, 4.5rem)',
            alignItems: 'start',
            marginTop: 'var(--space-6, 1.5rem)'
          }}
        >
          {/* Left Column: Narrative Statement */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '640px' }}>
            {aboutData.paragraphs.map((para, idx) => (
              <p
                key={idx}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
                  color: idx === 0 ? 'var(--color-primary)' : 'var(--color-secondary)',
                  lineHeight: 'var(--line-height-relaxed, 1.65)',
                  letterSpacing: 'var(--tracking-tight, -0.02em)',
                  fontWeight: idx === 0 ? 400 : 300
                }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Right Column: Academic Information */}
          <div
            style={{
              borderLeft: '1px solid var(--color-border)',
              paddingLeft: 'clamp(1.5rem, 3vw, 2.5rem)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.75rem'
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-xs, 0.75rem)',
                  color: 'var(--color-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wide, 0.04em)',
                  marginBottom: 'var(--space-1, 0.25rem)'
                }}
              >
                Degree & Discipline
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.15rem',
                  fontWeight: 500,
                  color: 'var(--color-primary)',
                  letterSpacing: '-0.01em'
                }}
              >
                {aboutData.academic.degree}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-xs, 0.75rem)',
                  color: 'var(--color-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wide, 0.04em)',
                  marginBottom: 'var(--space-1, 0.25rem)'
                }}
              >
                Institution
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                  color: 'var(--color-secondary)',
                  lineHeight: 1.4
                }}
              >
                {aboutData.academic.institution}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-xs, 0.75rem)',
                  color: 'var(--color-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wide, 0.04em)',
                  marginBottom: 'var(--space-1, 0.25rem)'
                }}
              >
                Cumulative GPA
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.75rem',
                  fontWeight: 500,
                  color: 'var(--color-primary)',
                  letterSpacing: '-0.02em'
                }}
              >
                {aboutData.academic.cgpa}
                <span style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginLeft: '0.35rem', fontWeight: 400 }}>
                  / 10.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
