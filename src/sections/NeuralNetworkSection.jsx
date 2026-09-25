import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Container } from '../components';
import { NN_STAGE_METADATA, NN_STAGE_ORDER } from '../three/NNArchitecture';

const NNScene = lazy(() => import('../three/NNScene'));

function NNPlaceholder() {
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
      <span>// INITIALIZING NEURAL NETWORK GRAPH...</span>
    </div>
  );
}

export default function NeuralNetworkSection() {
  const [activeLayer, setActiveLayer] = useState(null);
  const [activeNeuronId, setActiveNeuronId] = useState(null);
  const [isExploded, setIsExploded] = useState(false);
  const [isBackprop, setIsBackprop] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  // Layer toggle handler
  const handleSelectLayer = useCallback((layerId) => {
    setActiveNeuronId(null);
    setActiveLayer((prev) => (prev === layerId ? null : layerId));
  }, []);

  // Neuron click handler
  const handleSelectNeuron = useCallback((neuronId, layerId) => {
    setActiveNeuronId(neuronId);
    if (layerId) {
      setActiveLayer(layerId);
    }
  }, []);

  // Reset View handler
  const handleResetView = useCallback(() => {
    setActiveLayer(null);
    setActiveNeuronId(null);
    setIsExploded(false);
    setIsBackprop(false);
    setResetSignal((s) => s + 1);
  }, []);

  // Global Escape key reset
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveLayer(null);
        setActiveNeuronId(null);
        setIsExploded(false);
        setResetSignal((s) => s + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentMeta = activeLayer ? NN_STAGE_METADATA[activeLayer] : null;

  return (
    <section
      id="neural-network"
      style={{
        paddingTop: 'clamp(3rem, 6vw, 5rem)',
        paddingBottom: 'clamp(3rem, 6vw, 5rem)',
        position: 'relative'
      }}
      aria-label="Neural Network Architecture Visualization"
    >
      <Container style={{ maxWidth: 'min(95vw, 1560px)' }}>
        {/* Section Header */}
        <div style={{ marginBottom: '1.75rem', maxWidth: '720px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-xs, 0.75rem)',
              color: 'var(--color-muted, #71717A)',
              letterSpacing: 'var(--tracking-wider, 0.08em)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem'
            }}
          >
            02 // AI ARCHITECTURES
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: 'var(--tracking-tighter, -0.03em)',
              color: 'var(--color-primary, #FFFFFF)',
              margin: '0 0 0.6rem 0'
            }}
          >
            Neural Network <span style={{ color: 'var(--color-secondary, #A1A1AA)', fontWeight: 400 }}>— From Input to Learning</span>
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.92rem, 1.2vw, 1.02rem)',
              color: 'var(--color-secondary, #A1A1AA)',
              lineHeight: 'var(--line-height-relaxed, 1.6)',
              margin: 0,
              maxWidth: '580px'
            }}
          >
            A visual exploration of neurons, layers, forward propagation, and backpropagation learning.
          </p>
        </div>

        {/* 3D Visualization Container Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
          }}
        >
          {/* Top Bar: Accessible Stage Navigation & Utility Controls */}
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
            {/* Layer Navigation Tabs */}
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
              aria-label="Neural Network Layer Stages"
            >
              {NN_STAGE_ORDER.map((layerId) => {
                const meta = NN_STAGE_METADATA[layerId];
                const isSelected = activeLayer === layerId;
                return (
                  <button
                    key={layerId}
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleSelectLayer(layerId)}
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

              {/* Dedicated Learning / Backpropagation Mode Tab */}
              <button
                role="tab"
                aria-selected={isBackprop || activeLayer === 'LEARNING'}
                onClick={() => {
                  setActiveLayer('LEARNING');
                  setIsBackprop(true);
                }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  padding: '0.22rem 0.55rem',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  border: isBackprop || activeLayer === 'LEARNING'
                    ? '1px solid rgba(253, 224, 71, 0.45)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: isBackprop || activeLayer === 'LEARNING'
                    ? 'rgba(253, 224, 71, 0.12)'
                    : 'rgba(255, 255, 255, 0.025)',
                  color: isBackprop || activeLayer === 'LEARNING' ? '#FDE047' : 'var(--color-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Learning / Backprop
              </button>
            </div>

            {/* Utility Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
              {/* Backprop / Forward Flow Toggle */}
              <button
                onClick={() => setIsBackprop(!isBackprop)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  padding: '0.22rem 0.55rem',
                  borderRadius: '4px',
                  border: isBackprop
                    ? '1px solid rgba(253, 224, 71, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: isBackprop
                    ? 'rgba(253, 224, 71, 0.08)'
                    : 'rgba(255, 255, 255, 0.04)',
                  color: isBackprop ? '#FDE047' : 'var(--color-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease'
                }}
                aria-label={isBackprop ? 'Switch to forward propagation flow' : 'Switch to backpropagation learning flow'}
              >
                <span>{isBackprop ? '←' : '→'}</span> {isBackprop ? 'Backpropagation' : 'Forward Flow'}
              </button>

              {/* Exploded View Toggle */}
              <button
                onClick={() => setIsExploded(!isExploded)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  padding: '0.22rem 0.55rem',
                  borderRadius: '4px',
                  border: isExploded
                    ? '1px solid rgba(255, 255, 255, 0.30)'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: isExploded
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(255, 255, 255, 0.04)',
                  color: isExploded ? '#FFFFFF' : 'var(--color-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease'
                }}
                aria-label={isExploded ? 'Assemble neural layers' : 'Explode neural layers'}
              >
                <span>⬡</span> {isExploded ? 'Assembled' : 'Explode View'}
              </button>

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
          </div>

          {/* 3D WebGL Canvas Box */}
          <div
            id="neural-network-visualization-container"
            style={{
              width: '100%',
              height: 'clamp(460px, 64vh, 660px)',
              backgroundColor: '#070707',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              borderRadius: 'var(--radius-lg, 8px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Suspense fallback={<NNPlaceholder />}>
              <NNScene
                activeLayer={activeLayer}
                activeNeuronId={activeNeuronId}
                onSelectLayer={handleSelectLayer}
                onSelectNeuron={handleSelectNeuron}
                isExploded={isExploded}
                isBackprop={isBackprop}
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
              Orbit: Left-drag • Zoom: Scroll/Pinch • Click: Neuron or Layer
            </div>
          </div>

          {/* Minimal Explanation Panel Outside the 3D Canvas (Never covers model) */}
          {activeNeuronId ? (
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
                    NEURON // {activeNeuronId}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.66rem',
                      color: 'var(--color-muted)'
                    }}
                  >
                    [Parent Layer: {activeLayer || 'Synaptic Unit'}]
                  </span>
                </div>

                <button
                  onClick={() => setActiveNeuronId(null)}
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
                  aria-label="Deselect neuron"
                >
                  Close ✕
                </button>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: '0.86rem',
                  color: 'var(--color-primary)',
                  lineHeight: 1.55
                }}
              >
                Individual computational unit computing an affine transformation of its incoming synapses followed by an activation threshold.
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
                  {'a_i^{[l]} = \\sigma(\\sum_j w_{ij}^{[l]} a_j^{[l-1]} + b_i^{[l]})'}
                </code>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.66rem',
                    color: 'var(--color-muted)'
                  }}
                >
                  Click empty space or Esc to deselect
                </span>
              </div>
            </div>
          ) : currentMeta ? (
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
                      color: isBackprop ? '#FDE047' : '#93C5FD',
                      letterSpacing: '0.06em'
                    }}
                  >
                    STAGE {currentMeta.num} // {currentMeta.title.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.66rem',
                      color: 'var(--color-muted)'
                    }}
                  >
                    [{currentMeta.category}]
                  </span>
                </div>

                <button
                  onClick={() => setActiveLayer(null)}
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

              <p
                style={{
                  margin: 0,
                  fontSize: '0.86rem',
                  color: 'var(--color-primary)',
                  lineHeight: 1.55
                }}
              >
                {currentMeta.description}
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
                  {currentMeta.formula}
                </code>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.66rem',
                    color: 'var(--color-muted)'
                  }}
                >
                  Click layer again or Esc to deselect
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
              <span>Conceptual 3D Artificial Neural Network — 7 Layers with Synaptic Weight Routing</span>
              <span>Click any neuron or layer pill to inspect mathematical transformations</span>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
