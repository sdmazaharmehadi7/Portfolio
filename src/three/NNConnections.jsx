import * as THREE from 'three';

/**
 * NNConnections
 * High-performance batched synaptic connection manager for the 3D Neural Network.
 * Features:
 * - Batched LineSegments using single BufferGeometry for 60 FPS
 * - Forward propagation pulses (Input -> Hidden -> Output)
 * - Conceptual backpropagation reverse pulses (Prediction -> Output -> Hidden -> Input)
 * - Individual neuron and layer highlight filtering
 */
export class NNConnections {
  constructor(maxSegments = 90) {
    this.maxSegments = maxSegments;
    this.positions = new Float32Array(maxSegments * 2 * 3);
    this.colors = new Float32Array(maxSegments * 2 * 3);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    this.material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.lineSegments = new THREE.LineSegments(this.geometry, this.material);
    this.lineSegments.frustumCulled = false;

    this.connectionDefs = [];
  }

  /**
   * Adds a synaptic connection between two neurons
   */
  addConnection(startPosFn, endPosFn, fromLayer, toLayer, fromNeuronId, toNeuronId, weight = 1.0) {
    if (this.connectionDefs.length >= this.maxSegments) return;

    this.connectionDefs.push({
      start: startPosFn,
      end: endPosFn,
      fromLayer,
      toLayer,
      fromNeuronId,
      toNeuronId,
      weight,
      phase: Math.random() * Math.PI * 2,
      speed: 0.7 + Math.random() * 0.5
    });
  }

  /**
   * Updates line buffer every frame with forward or backpropagation pulse flow
   */
  update(time, isReducedMotion = false, activeLayer = null, activeNeuronId = null, isBackprop = false) {
    let pIdx = 0;
    let cIdx = 0;

    // Normal forward flow colors
    const baseGray = [0.28, 0.32, 0.38];
    const forwardPulse = [0.72, 0.90, 1.0];
    const forwardHighlight = [0.85, 0.94, 1.0];

    // Conceptual backprop gradient colors (distinct cool amber/white)
    const backpropPulse = [1.0, 0.88, 0.45];
    const backpropHighlight = [1.0, 0.94, 0.65];

    // Ordered sequence of layer transitions
    const layerOrder = [
      'INPUT_FEATURES',
      'INPUT_LAYER',
      'HIDDEN_1',
      'HIDDEN_2',
      'HIDDEN_3',
      'OUTPUT_LAYER',
      'PREDICTION'
    ];

    const CYCLE_DURATION = 6.0;
    const cycleTime = time % CYCLE_DURATION;
    const progress = cycleTime / CYCLE_DURATION; // 0.0 -> 1.0

    for (let i = 0; i < this.connectionDefs.length; i++) {
      const conn = this.connectionDefs[i];
      const s = typeof conn.start === 'function' ? conn.start() : conn.start;
      const e = typeof conn.end === 'function' ? conn.end() : conn.end;

      this.positions[pIdx++] = s.x;
      this.positions[pIdx++] = s.y;
      this.positions[pIdx++] = s.z;

      this.positions[pIdx++] = e.x;
      this.positions[pIdx++] = e.y;
      this.positions[pIdx++] = e.z;

      // Determine connection relevance to active layer or neuron
      let relevanceMultiplier = 1.0;
      let isDirectlyActive = false;

      if (activeNeuronId) {
        if (conn.fromNeuronId === activeNeuronId || conn.toNeuronId === activeNeuronId) {
          relevanceMultiplier = 2.4;
          isDirectlyActive = true;
        } else {
          relevanceMultiplier = 0.12;
        }
      } else if (activeLayer) {
        if (conn.fromLayer === activeLayer || conn.toLayer === activeLayer) {
          relevanceMultiplier = 2.0;
          isDirectlyActive = true;
        } else {
          relevanceMultiplier = 0.16;
        }
      }

      // Timing window for this connection's layer hop
      const fromIdx = layerOrder.indexOf(conn.fromLayer);
      const hopCount = layerOrder.length - 1;

      let isPulseActive = false;
      let pulsePhase = 0;

      if (!isReducedMotion) {
        if (!isBackprop) {
          // Forward propagation: pulses move from start to end (left to right)
          if (fromIdx !== -1) {
            const startHop = fromIdx / hopCount;
            const endHop = (fromIdx + 1) / hopCount;
            if (progress >= startHop && progress <= endHop) {
              isPulseActive = true;
              pulsePhase = (progress - startHop) / (endHop - startHop);
            }
          }
        } else {
          // Backpropagation: pulses move from end to start (right to left)
          if (fromIdx !== -1) {
            const revHop = (hopCount - 1 - fromIdx);
            const startHop = revHop / hopCount;
            const endHop = (revHop + 1) / hopCount;
            if (progress >= startHop && progress <= endHop) {
              isPulseActive = true;
              pulsePhase = 1.0 - (progress - startHop) / (endHop - startHop);
            }
          }
        }
      }

      // Calculate start and end vertex colors
      let sR = baseGray[0] * relevanceMultiplier;
      let sG = baseGray[1] * relevanceMultiplier;
      let sB = baseGray[2] * relevanceMultiplier;

      let eR = baseGray[0] * relevanceMultiplier;
      let eG = baseGray[1] * relevanceMultiplier;
      let eB = baseGray[2] * relevanceMultiplier;

      if (isDirectlyActive) {
        const highlightColor = isBackprop ? backpropHighlight : forwardHighlight;
        sR = Math.max(sR, highlightColor[0] * 0.75);
        sG = Math.max(sG, highlightColor[1] * 0.75);
        sB = Math.max(sB, highlightColor[2] * 0.75);

        eR = Math.max(eR, highlightColor[0] * 0.75);
        eG = Math.max(eG, highlightColor[1] * 0.75);
        eB = Math.max(eB, highlightColor[2] * 0.75);
      }

      if (isPulseActive) {
        const pulseColor = isBackprop ? backpropPulse : forwardPulse;
        const startIntensity = Math.max(0, 1.0 - Math.abs(pulsePhase - 0.2) * 2.5);
        const endIntensity = Math.max(0, 1.0 - Math.abs(pulsePhase - 0.8) * 2.5);

        sR = Math.min(1.0, sR + pulseColor[0] * startIntensity * 1.2);
        sG = Math.min(1.0, sG + pulseColor[1] * startIntensity * 1.2);
        sB = Math.min(1.0, sB + pulseColor[2] * startIntensity * 1.2);

        eR = Math.min(1.0, eR + pulseColor[0] * endIntensity * 1.2);
        eG = Math.min(1.0, eG + pulseColor[1] * endIntensity * 1.2);
        eB = Math.min(1.0, eB + pulseColor[2] * endIntensity * 1.2);
      }

      this.colors[cIdx++] = sR;
      this.colors[cIdx++] = sG;
      this.colors[cIdx++] = sB;

      this.colors[cIdx++] = eR;
      this.colors[cIdx++] = eG;
      this.colors[cIdx++] = eB;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
