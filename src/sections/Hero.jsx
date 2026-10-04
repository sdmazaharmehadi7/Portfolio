import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Container, Button } from '../components';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { STAGE_METADATA, STAGE_ORDER } from '../three/LLMArchitecture';

const LLMScene = lazy(() => import('../three/LLMScene'));

function LLMPlaceholder() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.72rem',
        color: 'var(--color-muted)',
        opacity: 0.5,
        letterSpacing: '0.04em'
      }}
      aria-hidden="true"
    >
      <span>// INITIALIZING 3D PIPELINE...</span>
    </div>
  );
}

export default function Hero() {
  const [activeStage, setActiveStage] = useState(null);
  const [isExploded, setIsExploded] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const { profile } = usePortfolioData();

  // Toggle stage or select new stage
  const handleSelectStage = useCallback((stageId) => {
    setActiveStage((prev) => (prev === stageId ? null : stageId));
  }, []);

  // Smooth Reset View (camera, selection, exploded state)
  const handleResetView = useCallback(() => {
    setActiveStage(null);
    setIsExploded(false);
    setResetSignal((s) => s + 1);
  }, []);

  // Global Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveStage(null);
        setIsExploded(false);
        setResetSignal((s) => s + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeMetadata = activeStage ? STAGE_METADATA[activeStage] : null;

  return (
    <section
      id="hero"
      aria-label="Sayyad Mazahar Mehadi — Software Developer and AI Engineer"
      style={{
        paddingTop: 'clamp(2.5rem, 6vw, 4.5rem)',
        paddingBottom: 'clamp(2.5rem, 6vw, 4.5rem)',
        position: 'relative'
      }}
    >
      <Container style={{ maxWidth: 'min(95vw, 1560px)' }}>
        <div
          className="hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 37%) minmax(0, 63%)',
            gap: 'clamp(2rem, 3.5vw, 3.5rem)',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Typography / Content (Strictly 35–37% on desktop) */}
          <div className="hero-content" style={{ maxWidth: '520px' }}>
            {/* Eyebrow */}
            <div
              className="animate-hero-eyebrow"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-xs, 0.75rem)',
                color: 'var(--color-muted, #71717A)',
                letterSpacing: 'var(--tracking-wider, 0.08em)',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-4, 1rem)'
              }}
            >
              {profile.eyebrow || 'AI • FULL-STACK • AGENTIC SYSTEMS'}
            </div>

            {/* Main Heading */}
            <h1
              className="animate-hero-heading"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(2.35rem, 4.2vw, 3.75rem)',
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: 'var(--tracking-tighter, -0.04em)',
                color: 'var(--color-primary, #FFFFFF)',
                marginBottom: 'var(--space-6, 1.5rem)',
                whiteSpace: 'pre-line'
              }}
            >
              {profile.headline || `Building intelligent\nsoftware for the\nreal world.`}
            </h1>

            {/* Supporting Text */}
            <p
              className="animate-hero-text"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(0.95rem, 1.3vw, 1.08rem)',
                color: 'var(--color-secondary, #A1A1AA)',
                lineHeight: 'var(--line-height-relaxed, 1.65)',
                marginBottom: 'var(--space-8, 2rem)',
                maxWidth: '460px'
              }}
            >
              {profile.summary || 'Computer Science student focused on AI agents, LLM applications, RAG systems, and modern full-stack development.'}
            </p>

            {/* Call to Action Buttons */}
            <div
              className="animate-hero-actions"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.85rem',
                alignItems: 'center'
              }}
            >
              <Button href="#projects" variant="primary" size="lg">
                Explore my work
              </Button>
              <Button
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="lg"
                mono
              >
                GitHub ↗
              </Button>
            </div>
          </div>

          {/* Right Column: Large Interactive 3D LLM Visualization (60–65% on desktop, 55–60vw) */}
          <div
            className="hero-vis-wrapper animate-hero-vis"
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Elegant Minimal Title for Transformer Visualization */}
            <div
              style={{
                marginBottom: '0.65rem',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: 'var(--color-muted)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  01 // AI ARCHITECTURES
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                    fontWeight: 500,
                    color: 'var(--color-primary)',
                    margin: '0.2rem 0 0 0',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Transformer Architecture{' '}
                  <span style={{ color: 'var(--color-secondary)', fontWeight: 400 }}>
                    — From Tokens to Prediction
                  </span>
                </h2>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--color-muted)'
                }}
              >
                [3D Interactive Model]
              </span>
            </div>

            {/* Accessible HTML Stage Navigation & Reset Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginBottom: '0.65rem',
                flexWrap: 'wrap'
              }}
            >
              {/* Stage Pills Scroll Container */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  overflowX: 'auto',
                  paddingBottom: '0.2rem',
                  maxWidth: '100%',
                  scrollbarWidth: 'none'
                }}
                role="tablist"
                aria-label="Transformer architecture pipeline stages"
              >
                {STAGE_ORDER.map((stageId) => {
                  const meta = STAGE_METADATA[stageId];
                  const isSelected = activeStage === stageId;
                  return (
                    <button
                      key={stageId}
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => handleSelectStage(stageId)}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        padding: '0.22rem 0.52rem',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        border: isSelected
                          ? '1px solid rgba(255, 255, 255, 0.35)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: isSelected
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(255, 255, 255, 0.025)',
                        color: isSelected ? '#FFFFFF' : 'var(--color-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {meta.title}
                    </button>
                  );
                })}
              </div>

              {/* Reset View Button */}
              <button
                onClick={handleResetView}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  padding: '0.22rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--color-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                aria-label="Reset 3D camera to default presentation perspective"
              >
                <span>⟲</span> Reset View
              </button>
            </div>

            {/* 3D WebGL Canvas Box */}
            <div
              id="hero-visualization-container"
              className="hero-vis-container"
              style={{
                width: '100%',
                height: 'clamp(460px, 64vh, 680px)',
                backgroundColor: '#070707',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: 'var(--radius-lg, 8px)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Suspense fallback={<LLMPlaceholder />}>
                <LLMScene
                  activeStage={activeStage}
                  onSelectStage={handleSelectStage}
                  isExploded={isExploded}
                  resetSignal={resetSignal}
                />
              </Suspense>

              {/* Unobtrusive Canvas Control Hint in bottom right */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '0.75rem',
                  right: '0.85rem',
                  zIndex: 2,
                  pointerEvents: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  color: 'rgba(255, 255, 255, 0.32)',
                  letterSpacing: '0.04em'
                }}
              >
                Orbit: Left-drag • Zoom: Scroll/Pinch • Pan: Right-drag
              </div>
            </div>

            {/* Minimal Explanation Panel Outside the 3D Canvas (Never covers architecture) */}
            {activeMetadata ? (
              <div
                className="stage-explanation-card"
                style={{
                  marginTop: '0.75rem',
                  padding: '0.85rem 1.15rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.11)',
                  borderRadius: 'var(--radius-md, 6px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}
                aria-live="polite"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: '#93C5FD',
                        letterSpacing: '0.06em'
                      }}
                    >
                      STAGE {activeMetadata.num} // {activeMetadata.title.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.66rem',
                        color: 'var(--color-muted)'
                      }}
                    >
                      [{activeMetadata.category}]
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {(activeStage === 'TRANSFORMER' || activeStage === 'ATTENTION') && (
                      <button
                        onClick={() => setIsExploded(!isExploded)}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          padding: '0.2rem 0.55rem',
                          background: isExploded
                            ? 'rgba(255, 255, 255, 0.14)'
                            : 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.20)',
                          borderRadius: '4px',
                          color: isExploded ? '#FFFFFF' : 'var(--color-secondary)',
                          cursor: 'pointer'
                        }}
                        aria-label={isExploded ? 'Switch to assembled view' : 'Switch to exploded 3D view'}
                      >
                        {isExploded ? '⬡ Assembled View' : '⬡ Exploded View'}
                      </button>
                    )}
                    <button
                      onClick={() => handleSelectStage(null)}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        padding: '0.2rem 0.5rem',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '4px',
                        color: 'var(--color-muted)',
                        cursor: 'pointer'
                      }}
                      aria-label="Close component explanation"
                    >
                      Close ✕
                    </button>
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.86rem',
                    color: 'var(--color-primary)',
                    lineHeight: 1.55
                  }}
                >
                  {activeMetadata.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    paddingTop: '0.2rem'
                  }}
                >
                  <code
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.74rem',
                      color: 'var(--color-muted)',
                      backgroundColor: 'rgba(0, 0, 0, 0.35)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '3px'
                    }}
                  >
                    {activeMetadata.formula}
                  </code>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.66rem',
                      color: 'var(--color-muted)'
                    }}
                  >
                    Click node again or Esc to deselect
                  </span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.6rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.015)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 'var(--radius-md, 6px)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.70rem',
                  color: 'var(--color-muted)',
                  flexWrap: 'wrap',
                  gap: '0.4rem'
                }}
              >
                <span>Interactive 3D Pipeline — 9 Procedural Stages</span>
                <span>Click any 3D stage or label to inspect mathematical operations</span>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

