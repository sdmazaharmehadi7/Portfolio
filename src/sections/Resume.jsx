import React from 'react';
import { Container, SectionHeading, Button } from '../components';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';

// Stable module-level timestamp used only as a last-resort fallback version key.
// Evaluated once at module load time, never inside the render function.
const MODULE_LOAD_TS = String(Date.now());

export default function Resume() {
  const [sectionRef, isVisible] = useScrollReveal(0.12);
  const { resumeUrl, resumeFilename, resumeUploadedAt } = usePortfolioData();

  /**
   * Builds a cache-busted URL for the View Resume action.
   *
   * The `?v=` query string forces the browser (and its PDF viewer cache)
   * to treat each resume version as a distinct resource, preventing Chrome
   * from serving a stale cached PDF when the URL changes between uploads.
   *
   * Version key priority:
   *  1. `resumeUploadedAt` epoch (stable, unique per upload, from Supabase)
   *  2. `MODULE_LOAD_TS`  (constant set at module init, satisfies react-hooks/purity)
   */
  const buildViewUrl = (url) => {
    if (!url) return '/resume.pdf';
    const versionKey = resumeUploadedAt
      ? new Date(resumeUploadedAt).getTime().toString()
      : MODULE_LOAD_TS;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${versionKey}`;
  };

  /**
   * Opens the resume in a new tab imperatively at click time.
   * This guarantees the LATEST resumeUrl (after Supabase finishes loading)
   * is used — not the stale fallback that was baked into href at first render.
   */
  const handleViewResume = (e) => {
    e.preventDefault();
    const url = buildViewUrl(resumeUrl || '/resume.pdf');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const downloadUrl = resumeUrl || '/resume.pdf';
  const downloadFilename = resumeFilename || 'Sayyad_Mazahar_Mehadi_Resume.pdf';

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
          {/*
            Primary Action — View Resume
            Uses onClick to open imperatively at click time so the browser
            always gets the latest Supabase URL, never a stale rendered href.
          */}
          <Button
            href={buildViewUrl(resumeUrl || '/resume.pdf')}
            onClick={handleViewResume}
            variant="primary"
            size="lg"
            aria-label="View Resume in native browser PDF viewer"
          >
            <span>View Resume</span>
            <span style={{ fontSize: '1.05rem' }}>↗</span>
          </Button>

          {/* Secondary Action — Download PDF (fresh HTTP fetch via download attr) */}
          <Button
            href={downloadUrl}
            download={downloadFilename}
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
