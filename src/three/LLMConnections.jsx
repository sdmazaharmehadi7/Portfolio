import * as THREE from 'three';

/**
 * LLMConnections
 * High-performance batched connection manager linking stages of the Transformer architecture.
 * Features:
 * - 15 to 30 curated meaningful connections (no spiderweb)
 * - Directed data pulse flow traveling along connection segments
 * - Active stage highlighting (brightens related paths, dims unrelated)
 * - Uses single BufferGeometry for rock-solid 60 FPS
 */
export class LLMConnections {
  constructor(maxSegments = 36) {
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
   * Adds a meaningful directed connection between two points or dynamic accessor functions
   */
  addConnection(startPos, endPos, isAccent = false, fromStage = null, toStage = null) {
    if (this.connectionDefs.length >= this.maxSegments) return;

    this.connectionDefs.push({
      start: startPos,
      end: endPos,
      isAccent,
      fromStage,
      toStage,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 0.4
    });
  }

  /**
   * Updates line buffer every frame with directional pulse flow and stage highlighting
   */
  update(time, isReducedMotion = false, activeStage = null, flowProgress = -1) {
    let pIdx = 0;
    let cIdx = 0;

    const baseWhite = [0.85, 0.88, 0.92];
    const accentBlue = [0.72, 0.90, 1.0];
    const mutedGray = [0.35, 0.38, 0.42];

    // Pipeline order map for sequential flow timing
    const stageTransitionMap = {
      'INPUT->TOKENS': [0.05, 0.18],
      'TOKENS->EMBEDDING': [0.16, 0.30],
      'EMBEDDING->POSITIONAL': [0.28, 0.42],
      'POSITIONAL->ATTENTION': [0.40, 0.54],
      'ATTENTION->ATTENTION': [0.50, 0.65],
      'ATTENTION->TRANSFORMER': [0.60, 0.74],
      'TRANSFORMER->FEEDFORWARD': [0.70, 0.82],
      'FEEDFORWARD->PREDICTION': [0.80, 0.90],
      'PREDICTION->OUTPUT': [0.88, 0.98]
    };

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

      let relevanceMultiplier = 1.0;
      let isLitByFlow = false;

      // 1. Stage Inspection Highlighting
      if (activeStage) {
        if (conn.fromStage === activeStage || conn.toStage === activeStage) {
          relevanceMultiplier = 2.4;
          isLitByFlow = true;
        } else {
          relevanceMultiplier = 0.08; // Dim unrelated paths
        }
      } else if (!isReducedMotion && flowProgress >= 0) {
        // 2. Global Learning Cycle Wave
        const key = `${conn.fromStage}->${conn.toStage}`;
        const windowRange = stageTransitionMap[key];
        if (windowRange && flowProgress >= windowRange[0] && flowProgress <= windowRange[1]) {
          const mid = (windowRange[0] + windowRange[1]) / 2;
          const span = (windowRange[1] - windowRange[0]) / 2;
          const flowIntensity = Math.max(0, 1 - Math.abs(flowProgress - mid) / span);
          relevanceMultiplier = 1.0 + flowIntensity * 1.8;
          isLitByFlow = flowIntensity > 0.25;
        }
      }

      // 3. Directional pulse traveling along the segment
      const pulsePhase = (time * conn.speed + conn.phase) % 1.0;
      const pulseIntensity = isReducedMotion
        ? 0.7
        : Math.sin(pulsePhase * Math.PI) * 0.4 + 0.6;

      const chosenColor = (conn.isAccent || isLitByFlow)
        ? accentBlue
        : (conn.phase > 3 ? baseWhite : mutedGray);

      const intensity = pulseIntensity * relevanceMultiplier;

      // Start vertex
      this.colors[cIdx++] = Math.min(chosenColor[0] * intensity, 1.0);
      this.colors[cIdx++] = Math.min(chosenColor[1] * intensity, 1.0);
      this.colors[cIdx++] = Math.min(chosenColor[2] * intensity, 1.0);

      // End vertex (directionally biased for forward computational flow)
      const forwardBoost = 1.15;
      this.colors[cIdx++] = Math.min(chosenColor[0] * intensity * forwardBoost, 1.0);
      this.colors[cIdx++] = Math.min(chosenColor[1] * intensity * forwardBoost, 1.0);
      this.colors[cIdx++] = Math.min(chosenColor[2] * intensity * forwardBoost, 1.0);
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
