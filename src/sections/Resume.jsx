import React from 'react';
import { Container, SectionHeading, Button } from '../components';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Resume() {
  const [sectionRef, isVisible] = useScrollReveal(0.12);
  const { resumeUrl } = usePortfolioData();

  return (
    <section
      id="resume"
      ref={sectionRef}
      style={{
        paddingTop: 'var(--space-12, 3rem)',
        paddingBottom: 'var(--space-12, 3rem)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      aria-label="Resume"
    >
      <Container>
        <SectionHeading
          tag="// CREDENTIALS // CURRICULUM VITAE"
          title="Resume"
          description="View my resume and learn more about my experience, projects, and technical background."
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            marginTop: 'var(--space-6, 1.5rem)'
          }}
        >
          {/* Primary Action: View Resume in Browser */}
          <Button
            href={resumeUrl || "/resume.pdf"}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="lg"
            aria-label="View Resume in native browser PDF viewer"
          >
            <span>View Resume</span>
            <span style={{ fontSize: '1.05rem' }}>↗</span>
          </Button>

          {/* Secondary Action: Download PDF */}
          <Button
            href={resumeUrl || "/resume.pdf"}
            download="Sayyad_Mazahar_Mehadi_Resume.pdf"
            variant="secondary"
            size="lg"
            mono
            aria-label="Download Resume PDF file"
          >
            <span>Download PDF</span>
            <span style={{ fontSize: '1.05rem' }}>↓</span>
          </Button>
        </div>
      </Container>
    </section>
  );
}
