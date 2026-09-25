import * as THREE from 'three';
import { createInteractiveBox, createInteractiveVectorRod, createPositionalBar, createTransformerLayerBlock } from './LLMNode';
import { LLMConnections } from './LLMConnections';

export const STAGE_METADATA = {
  INPUT: {
    id: 'INPUT',
    num: '01',
    title: 'Input',
    subtitle: 'Raw Sequence Stream',
    description: 'Raw sequence of text or multimodal tokens ingested into the computational pipeline.',
    category: 'Ingestion Layer',
    formula: 'X = [x_1, x_2, ..., x_n]'
  },
  TOKENS: {
    id: 'TOKENS',
    num: '02',
    title: 'Tokens',
    subtitle: 'Discrete Segmentation',
    description: 'Partitions raw input into discrete sub-word units mapped to fixed vocabulary indices via Byte-Pair Encoding.',
    category: 'Preprocessing',
    formula: 'T_i = Vocabulary_Index(x_i)'
  },
  EMBEDDING: {
    id: 'EMBEDDING',
    num: '03',
    title: 'Embedding',
    subtitle: 'Dense Latent Vectors',
    description: 'Projects discrete token indices into continuous high-dimensional vector representations capturing semantic relationships.',
    category: 'Representation',
    formula: 'E = W_e · T ∈ ℝ^{n × d_{model}}'
  },
  POSITIONAL: {
    id: 'POSITIONAL',
    num: '04',
    title: 'Positional Information',
    subtitle: 'Harmonic Phase Encoding',
    description: 'Injects geometric frequency harmonics and spatial phase embeddings to preserve token ordering across the permutation-invariant model.',
    category: 'Spatial Coordinate',
    formula: 'PE_{(pos, 2i)} = sin(pos / 10000^{2i/d})'
  },
  ATTENTION: {
    id: 'ATTENTION',
    num: '05',
    title: 'Attention',
    subtitle: 'Multi-Head Contextual Routing',
    description: 'The attention mechanism allows tokens to interact with other tokens and dynamically determine which relationships are important.',
    category: 'Core Contextual Backbone',
    formula: 'Attention(Q, K, V) = softmax(QK^T / √d_k)V'
  },
  TRANSFORMER: {
    id: 'TRANSFORMER',
    num: '06',
    title: 'Transformer',
    subtitle: 'Hierarchical Deep Layers',
    description: 'Stacked deep neural blocks combining multi-head self-attention, layer normalization, and residual stream bypass rails.',
    category: 'Deep Backbone',
    formula: 'H^{l} = LayerNorm(x + SubLayer(x))'
  },
  FEEDFORWARD: {
    id: 'FEEDFORWARD',
    num: '07',
    title: 'Feed Forward',
    subtitle: 'Pointwise MLP Projection',
    description: 'Applies two-tier linear expansions with non-linear activation (GELU/SwiGLU) independently to representation dimensions.',
    category: 'Nonlinear Processing',
    formula: 'FFN(x) = max(0, xW_1 + b_1)W_2 + b_2'
  },
  PREDICTION: {
    id: 'PREDICTION',
    num: '08',
    title: 'Prediction',
    subtitle: 'Vocabulary Logits',
    description: 'Projects the final contextual latent state across the entire vocabulary matrix to compute unnormalized logit likelihoods.',
    category: 'Probability Matrix',
    formula: 'z = x · W_u^T ∈ ℝ^{|V|}'
  },
  OUTPUT: {
    id: 'OUTPUT',
    num: '09',
    title: 'Output',
    subtitle: 'Crystallized Generation',
    description: 'Samples the highest-likelihood candidate token via Softmax and temperature sampling for autoregressive sequence generation.',
    category: 'Inference Target',
    formula: 'p = softmax(z / τ)'
  }
};

export const STAGE_ORDER = [
  'INPUT',
  'TOKENS',
  'EMBEDDING',
  'POSITIONAL',
  'ATTENTION',
  'TRANSFORMER',
  'FEEDFORWARD',
  'PREDICTION',
  'OUTPUT'
];

export class LLMArchitecture {
  constructor(scene, deviceTier = 'desktop') {
    this.scene = scene;
    const tier = typeof deviceTier === 'string' ? deviceTier : (deviceTier ? 'mobile' : 'desktop');
    this.deviceTier = tier;
    this.isMobile = tier === 'mobile';
    this.isTablet = tier === 'tablet';

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.disposables = [];
    this.animatedElements = [];
    this.raycastableMeshes = [];

    // Stage groups and their elements
    this.stageGroups = {};
    this.stageElements = {
      INPUT: [],
      TOKENS: [],
      EMBEDDING: [],
      POSITIONAL: [],
      ATTENTION: [],
      TRANSFORMER: [],
      FEEDFORWARD: [],
      PREDICTION: [],
      OUTPUT: []
    };

    this.activeStage = null;
    this.hoveredStage = null;
    this.isExploded = false;

    // Line connections manager (curated ~26 connections)
    this.connections = new LLMConnections(32);
    this.group.add(this.connections.lineSegments);
    this.disposables.push(this.connections);

    this.buildArchitecture();
  }

  registerMesh(mesh, stageId) {
    mesh.userData = { stageId };
    this.raycastableMeshes.push(mesh);
  }

  buildArchitecture() {
    // =============================================================
    // 01. INPUT [Y = -3.4]
    // =============================================================
    const inputGroup = new THREE.Group();
    inputGroup.position.set(0, -3.4, 0);
    this.group.add(inputGroup);
    this.stageGroups.INPUT = { group: inputGroup, baseY: -3.4, currentY: -3.4, baseZ: 0, currentZ: 0 };

    this.inputBlocks = [];
    const inputConfigs = this.isMobile
      ? [
          { x: -0.42, z: 0.1, w: 0.52, h: 0.08, d: 0.32 },
          { x: 0.42, z: -0.1, w: 0.52, h: 0.08, d: 0.32 }
        ]
      : [
          { x: -0.65, z: 0.15, w: 0.46, h: 0.08, d: 0.32 },
          { x: 0.0, z: -0.15, w: 0.62, h: 0.08, d: 0.34 },
          { x: 0.68, z: 0.1, w: 0.48, h: 0.08, d: 0.30 }
        ];

    inputConfigs.forEach((cfg, idx) => {
      const box = createInteractiveBox(cfg.w, cfg.h, cfg.d, false, 'Input Sequence');
      box.group.position.set(cfg.x, (idx - 1) * 0.06, cfg.z);
      inputGroup.add(box.group);
      this.disposables.push(box.geometry, box.edgesGeometry, box.meshMaterial, box.wireframeMaterial);
      this.registerMesh(box.mesh, 'INPUT');
      this.stageElements.INPUT.push(box);
      this.inputBlocks.push({ box, basePos: box.group.position.clone() });

      this.animatedElements.push({
        target: box.group.position,
        baseY: box.group.position.y,
        speed: 0.7 + idx * 0.15,
        amplitude: 0.03
      });
    });

    // =============================================================
    // 02. TOKENS [Y = -2.6]
    // =============================================================
    const tokenGroup = new THREE.Group();
    tokenGroup.position.set(0, -2.6, 0);
    this.group.add(tokenGroup);
    this.stageGroups.TOKENS = { group: tokenGroup, baseY: -2.6, currentY: -2.6, baseZ: 0, currentZ: 0 };

    this.tokenCells = [];
    const tokenCount = this.isMobile ? 3 : (this.isTablet ? 4 : 5);
    const tokenSpacing = this.isMobile ? 0.46 : 0.40;

    for (let i = 0; i < tokenCount; i++) {
      const x = (i - (tokenCount - 1) / 2) * tokenSpacing;
      const zOffset = (i % 2 === 0 ? 0.08 : -0.08);
      const isAccent = i === 1 || (tokenCount > 3 && i === 3);
      const box = createInteractiveBox(0.28, 0.16, 0.28, isAccent, 'Token');
      box.group.position.set(x, 0, zOffset);
      tokenGroup.add(box.group);
      this.disposables.push(box.geometry, box.edgesGeometry, box.meshMaterial, box.wireframeMaterial);
      this.registerMesh(box.mesh, 'TOKENS');
      this.stageElements.TOKENS.push(box);
      this.tokenCells.push({ box, basePos: box.group.position.clone() });

      if (this.inputBlocks[i % this.inputBlocks.length]) {
        this.connections.addConnection(
          () => this.inputBlocks[i % this.inputBlocks.length].box.group.getWorldPosition(new THREE.Vector3()),
          () => box.group.getWorldPosition(new THREE.Vector3()),
          isAccent,
          'INPUT',
          'TOKENS'
        );
      }
    }

    // =============================================================
    // 03. EMBEDDING [Y = -1.8]
    // =============================================================
    const embedGroup = new THREE.Group();
    embedGroup.position.set(0, -1.8, 0);
    this.group.add(embedGroup);
    this.stageGroups.EMBEDDING = { group: embedGroup, baseY: -1.8, currentY: -1.8, baseZ: 0, currentZ: 0 };

    this.vectorRods = [];
    const gridCols = this.isMobile ? 3 : (this.isTablet ? 4 : 5);
    const gridRows = this.isMobile ? 2 : (this.isTablet ? 2 : 3);
    const gridSpacing = 0.32;

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const x = (c - (gridCols - 1) / 2) * gridSpacing;
        const z = (r - (gridRows - 1) / 2) * gridSpacing;
        const isAccent = (r === 1 && c === (gridCols === 3 ? 1 : 2)) || (r === 0 && c === 1);
        const rod = createInteractiveVectorRod(0.40, 0.016, isAccent);
        rod.group.position.set(x, 0, z);
        embedGroup.add(rod.group);
        this.disposables.push(rod.geom, rod.capGeom, rod.rodMaterial, rod.capMaterial);
        this.registerMesh(rod.rod, 'EMBEDDING');
        this.stageElements.EMBEDDING.push(rod);
        this.vectorRods.push({ rod, basePos: rod.group.position.clone() });

        if (r === 0 && this.tokenCells[c % this.tokenCells.length]) {
          this.connections.addConnection(
            () => this.tokenCells[c % this.tokenCells.length].box.group.getWorldPosition(new THREE.Vector3()),
            () => rod.group.getWorldPosition(new THREE.Vector3()),
            isAccent,
            'TOKENS',
            'EMBEDDING'
          );
        }
      }
    }

    // =============================================================
    // 04. POSITIONAL INFORMATION [Y = -1.0]
    // =============================================================
    const posGroup = new THREE.Group();
    posGroup.position.set(0, -1.0, 0);
    this.group.add(posGroup);
    this.stageGroups.POSITIONAL = { group: posGroup, baseY: -1.0, currentY: -1.0, baseZ: 0, currentZ: 0 };

    this.positionalBars = [];
    const posCount = this.isMobile ? 3 : (this.isTablet ? 4 : 5);
    const posSpacing = 0.36;

    for (let i = 0; i < posCount; i++) {
      const phase = (i / posCount) * Math.PI;
      const height = 0.12 + Math.sin(phase) * 0.10;
      const isAccent = i === 1 || i === 3;
      const bar = createPositionalBar(0.24, height, 0.24, phase, isAccent);
      const x = (i - (posCount - 1) / 2) * posSpacing;
      const z = Math.cos(phase) * 0.15;
      bar.group.position.set(x, 0, z);
      posGroup.add(bar.group);
      this.disposables.push(bar.geom, bar.edgesGeom, bar.meshMaterial, bar.wireMaterial);
      this.registerMesh(bar.mesh, 'POSITIONAL');
      this.stageElements.POSITIONAL.push(bar);
      this.positionalBars.push({ bar, basePos: bar.group.position.clone(), phase });

      // Connect Embeddings into Positional Information
      if (this.vectorRods[i % this.vectorRods.length]) {
        this.connections.addConnection(
          () => this.vectorRods[i % this.vectorRods.length].rod.group.getWorldPosition(new THREE.Vector3()),
          () => bar.group.getWorldPosition(new THREE.Vector3()),
          isAccent,
          'EMBEDDING',
          'POSITIONAL'
        );
      }
    }

    // =============================================================
    // 05. ATTENTION [Y = 0.0] - Spatial Centerpiece
    // =============================================================
    const attnGroup = new THREE.Group();
    attnGroup.position.set(0, 0.0, 0);
    this.group.add(attnGroup);
    this.stageGroups.ATTENTION = { group: attnGroup, baseY: 0.0, currentY: 0.0, baseZ: 0, currentZ: 0 };

    this.attentionNodes = [];
    // 3D diamond/tetrahedron formation with genuine depth along Z
    const headConfigs = [
      { x: -0.75, y: -0.15, z: 0.35, isAccent: false, label: 'Query (Q)' },
      { x: -0.25, y: 0.22, z: -0.35, isAccent: true, label: 'Key (K)' },
      { x: 0.35, y: -0.18, z: -0.30, isAccent: false, label: 'Value (V)' },
      { x: 0.80, y: 0.18, z: 0.30, isAccent: true, label: 'Projection (O)' }
    ];

    headConfigs.forEach((cfg, idx) => {
      const node = createInteractiveBox(0.26, 0.26, 0.26, cfg.isAccent, cfg.label);
      node.group.position.set(cfg.x, cfg.y, cfg.z);
      attnGroup.add(node.group);
      this.disposables.push(node.geometry, node.edgesGeometry, node.meshMaterial, node.wireframeMaterial);
      this.registerMesh(node.mesh, 'ATTENTION');
      this.stageElements.ATTENTION.push(node);

      this.attentionNodes.push({
        box: node,
        group: node.group,
        basePos: new THREE.Vector3(cfg.x, cfg.y, cfg.z),
        isAccent: cfg.isAccent,
        idx
      });

      this.animatedElements.push({
        target: node.group.position,
        baseY: cfg.y,
        speed: 0.6 + idx * 0.15,
        amplitude: 0.025
      });

      // Internal cross-attention routing lines
      headConfigs.forEach((otherCfg, otherIdx) => {
        if (idx < otherIdx) {
          this.connections.addConnection(
            () => node.group.getWorldPosition(new THREE.Vector3()),
            () => this.attentionNodes[otherIdx].group.getWorldPosition(new THREE.Vector3()),
            cfg.isAccent || otherCfg.isAccent,
            'ATTENTION',
            'ATTENTION'
          );
        }
      });
    });

    // Connect Positional bars to Attention heads
    this.positionalBars.forEach((pb, pIdx) => {
      this.connections.addConnection(
        () => pb.bar.group.getWorldPosition(new THREE.Vector3()),
        () => this.attentionNodes[pIdx % this.attentionNodes.length].group.getWorldPosition(new THREE.Vector3()),
        pIdx === 1,
        'POSITIONAL',
        'ATTENTION'
      );
    });

    // =============================================================
    // 06. TRANSFORMER BLOCKS [Y = +1.15] - Stacked Layers with Depth
    // =============================================================
    const tfmrGroup = new THREE.Group();
    tfmrGroup.position.set(0, 1.15, 0);
    this.group.add(tfmrGroup);
    this.stageGroups.TRANSFORMER = { group: tfmrGroup, baseY: 1.15, currentY: 1.15, baseZ: 0, currentZ: 0 };

    this.transformerLayers = [];
    const layerCount = (this.isMobile || this.isTablet) ? 2 : 3;
    const layerSpacing = 0.44;

    for (let i = 0; i < layerCount; i++) {
      const y = (i - (layerCount - 1) / 2) * layerSpacing;
      const block = createTransformerLayerBlock(i, 1.85 - i * 0.12, 1.30 - i * 0.08);
      block.group.position.set(0, y, 0);
      tfmrGroup.add(block.group);
      this.disposables.push(...block.disposables);

      // Register both sub-plates for raycasting
      this.registerMesh(block.attnMesh, 'TRANSFORMER');
      this.registerMesh(block.ffnMesh, 'TRANSFORMER');
      this.stageElements.TRANSFORMER.push(block);

      this.transformerLayers.push({
        block,
        group: block.group,
        baseY: y,
        index: i
      });

      this.animatedElements.push({
        target: block.group.position,
        baseY: y,
        speed: 0.5 + i * 0.18,
        amplitude: 0.03
      });

      // Inter-layer connection paths
      if (i > 0) {
        const prevGroup = this.transformerLayers[i - 1].group;
        [-0.55, 0.55].forEach((xOff) => {
          this.connections.addConnection(
            () => prevGroup.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(xOff, 0, 0)),
            () => block.group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(xOff, 0, 0)),
            i === 1,
            'TRANSFORMER',
            'TRANSFORMER'
          );
        });
      }
    }

    // Connect Attention into Transformer Stack
    this.attentionNodes.forEach((an, aIdx) => {
      this.connections.addConnection(
        () => an.group.getWorldPosition(new THREE.Vector3()),
        () => this.transformerLayers[0].group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3((aIdx - 1.5) * 0.45, -0.15, 0)),
        aIdx === 1,
        'ATTENTION',
        'TRANSFORMER'
      );
    });

    // =============================================================
    // 07. FEED FORWARD [Y = +1.95]
    // =============================================================
    const ffnGroup = new THREE.Group();
    ffnGroup.position.set(0, 1.95, 0);
    this.group.add(ffnGroup);
    this.stageGroups.FEEDFORWARD = { group: ffnGroup, baseY: 1.95, currentY: 1.95, baseZ: 0, currentZ: 0 };

    this.ffnPlates = [];
    const ffnExpansion = createInteractiveBox(1.5, 0.05, 0.9, true, 'MLP Expansion');
    ffnExpansion.group.position.set(0, 0, 0);
    ffnGroup.add(ffnExpansion.group);
    this.disposables.push(ffnExpansion.geometry, ffnExpansion.edgesGeometry, ffnExpansion.meshMaterial, ffnExpansion.wireframeMaterial);
    this.registerMesh(ffnExpansion.mesh, 'FEEDFORWARD');
    this.stageElements.FEEDFORWARD.push(ffnExpansion);

    this.connections.addConnection(
      () => this.transformerLayers[layerCount - 1].group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.15, 0)),
      () => ffnExpansion.group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, -0.05, 0)),
      true,
      'TRANSFORMER',
      'FEEDFORWARD'
    );

    // =============================================================
    // 08. PREDICTION [Y = +2.7] - 3D Logit Distribution
    // =============================================================
    const predGroup = new THREE.Group();
    predGroup.position.set(0, 2.7, 0);
    this.group.add(predGroup);
    this.stageGroups.PREDICTION = { group: predGroup, baseY: 2.7, currentY: 2.7, baseZ: 0, currentZ: 0 };

    const logitHeights = this.isMobile
      ? [0.35, 0.85, 0.35]
      : (this.isTablet ? [0.3, 0.85, 0.45, 0.25] : [0.25, 0.42, 0.88, 0.35, 0.52, 0.22]);
    const peakIndex = this.isMobile ? 1 : (this.isTablet ? 1 : 2);

    this.logitBars = [];
    const logitSpacing = this.isMobile ? 0.34 : 0.24;

    logitHeights.forEach((h, idx) => {
      const isPeak = idx === peakIndex;
      const x = (idx - (logitHeights.length - 1) / 2) * logitSpacing;
      const z = (idx % 2 === 0 ? 0.06 : -0.06);
      const bar = createInteractiveBox(0.12, h, 0.12, isPeak, isPeak ? 'Max Logit' : 'Candidate');
      bar.group.position.set(x, h / 2, z);
      predGroup.add(bar.group);
      this.disposables.push(bar.geometry, bar.edgesGeometry, bar.meshMaterial, bar.wireframeMaterial);
      this.registerMesh(bar.mesh, 'PREDICTION');
      this.stageElements.PREDICTION.push(bar);
      this.logitBars.push({ box: bar, group: bar.group, baseHeight: h, isPeak, baseY: h / 2 });

      this.connections.addConnection(
        () => ffnExpansion.group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(x * 1.4, 0.05, 0)),
        () => bar.group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, -h / 2, 0)),
        isPeak,
        'FEEDFORWARD',
        'PREDICTION'
      );
    });

    // =============================================================
    // 09. OUTPUT [Y = +3.5] - Crystallized Output Token
    // =============================================================
    const outputGroup = new THREE.Group();
    outputGroup.position.set(0, 3.5, 0);
    this.group.add(outputGroup);
    this.stageGroups.OUTPUT = { group: outputGroup, baseY: 3.5, currentY: 3.5, baseZ: 0, currentZ: 0 };

    this.outputToken = createInteractiveBox(0.68, 0.22, 0.48, true, 'Next Token');
    outputGroup.add(this.outputToken.group);
    this.disposables.push(this.outputToken.geometry, this.outputToken.edgesGeometry, this.outputToken.meshMaterial, this.outputToken.wireframeMaterial);
    this.registerMesh(this.outputToken.mesh, 'OUTPUT');
    this.stageElements.OUTPUT.push(this.outputToken);

    this.animatedElements.push({
      target: outputGroup.position,
      baseY: 3.5,
      speed: 0.7,
      amplitude: 0.035
    });

    const peakBar = this.logitBars.find((b) => b.isPeak) || this.logitBars[0];
    if (peakBar) {
      this.connections.addConnection(
        () => peakBar.group.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, peakBar.baseHeight / 2, 0)),
        () => outputGroup.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, -0.11, 0)),
        true,
        'PREDICTION',
        'OUTPUT'
      );
    }
  }

  setActiveStage(stageId) {
    this.activeStage = stageId;
  }

  setHoveredStage(stageId) {
    this.hoveredStage = stageId;
  }

  setExploded(isExploded) {
    this.isExploded = isExploded;
  }

  /**
   * Main animation loop execution
   */
  update(time, isReducedMotion = false, scrollOffset = 0) {
    const inspectedIndex = this.activeStage ? STAGE_ORDER.indexOf(this.activeStage) : -1;
    const shouldExplode = this.isExploded || this.activeStage === 'TRANSFORMER' || this.activeStage === 'ATTENTION';

    // 1. Repeating 8.0s subtle learning flow pulse
    const CYCLE_DURATION = 8.0;
    const TRAVERSAL_WINDOW = 6.4;
    const cycleTime = time % CYCLE_DURATION;
    const flowProgress = cycleTime < TRAVERSAL_WINDOW ? cycleTime / TRAVERSAL_WINDOW : -1;

    // 2. Stage Vertical & Depth Separation (Exploded Technical View)
    STAGE_ORDER.forEach((stageId, idx) => {
      const stage = this.stageGroups[stageId];
      if (!stage) return;

      let targetY = stage.baseY;
      let targetZ = 0;

      if (inspectedIndex !== -1) {
        if (idx === inspectedIndex) {
          // Selected stage gently steps forward toward viewer
          targetZ = 0.35;
        } else if (idx < inspectedIndex) {
          targetY = stage.baseY - (inspectedIndex - idx) * 0.42 - 0.75;
          targetZ = -0.15;
        } else {
          targetY = stage.baseY + (idx - inspectedIndex) * 0.42 + 0.75;
          targetZ = -0.15;
        }
      }

      // Smooth spring-like lerp
      stage.currentY += (targetY - stage.currentY) * 0.06;
      stage.currentZ += (targetZ - stage.currentZ) * 0.06;
      stage.group.position.y = stage.currentY;
      stage.group.position.z = stage.currentZ;
    });

    // 3. Exploded Architecture Sub-Layer Separation (Transformer & Attention)
    if (shouldExplode) {
      // Explode Transformer stacked layers along Y & Z
      this.transformerLayers.forEach((layer) => {
        const targetY = (layer.index - (this.transformerLayers.length - 1) / 2) * 1.15;
        const targetZ = (layer.index - 1) * 0.35;
        layer.group.position.y += (targetY - layer.group.position.y) * 0.06;
        layer.group.position.z += (targetZ - layer.group.position.z) * 0.06;
      });

      // Expand Attention heads radially in 3D
      const spreadFactor = 1.65;
      this.attentionNodes.forEach((node) => {
        const targetX = node.basePos.x * spreadFactor;
        const targetY = node.basePos.y * 1.35;
        const targetZ = node.basePos.z * spreadFactor;
        node.group.position.x += (targetX - node.group.position.x) * 0.06;
        node.group.position.y += (targetY - node.group.position.y) * 0.06;
        node.group.position.z += (targetZ - node.group.position.z) * 0.06;
      });
    } else {
      // Return to assembled coordinates
      this.transformerLayers.forEach((layer) => {
        layer.group.position.y += (layer.baseY - layer.group.position.y) * 0.06;
        layer.group.position.z += (0 - layer.group.position.z) * 0.06;
      });

      this.attentionNodes.forEach((node) => {
        node.group.position.x += (node.basePos.x - node.group.position.x) * 0.06;
        node.group.position.y += (node.basePos.y - node.group.position.y) * 0.06;
        node.group.position.z += (node.basePos.z - node.group.position.z) * 0.06;
      });
    }

    // 4. Subtle Page Scroll Parallax
    if (!isReducedMotion) {
      this.group.position.y = -scrollOffset * 0.35;
      this.group.rotation.x = scrollOffset * 0.04;
    }

    // 5. Opacity transitions (highlight selected/hovered stage, dim unrelated)
    STAGE_ORDER.forEach((stageId) => {
      const elements = this.stageElements[stageId];
      const isSelected = this.activeStage === stageId;
      const isHovered = this.hoveredStage === stageId;
      const hasSelection = this.activeStage !== null;

      elements.forEach((item) => {
        // Standard interactive box
        if (item.meshMaterial && item.wireframeMaterial) {
          const targetMeshOpacity = isSelected
            ? 0.98
            : isHovered
              ? 0.92
              : hasSelection
                ? 0.12
                : item.baseMeshOpacity;

          const targetWireOpacity = isSelected
            ? 1.0
            : isHovered
              ? 0.85
              : hasSelection
                ? 0.10
                : item.baseWireOpacity;

          item.meshMaterial.opacity += (targetMeshOpacity - item.meshMaterial.opacity) * 0.07;
          item.wireframeMaterial.opacity += (targetWireOpacity - item.wireframeMaterial.opacity) * 0.07;
        }

        // Vector Rods
        if (item.rodMaterial && item.capMaterial) {
          const targetRodOpacity = isSelected ? 0.98 : (hasSelection ? 0.12 : item.baseRodOpacity);
          const targetCapOpacity = isSelected ? 1.0 : (hasSelection ? 0.14 : item.baseCapOpacity);

          item.rodMaterial.opacity += (targetRodOpacity - item.rodMaterial.opacity) * 0.07;
          item.capMaterial.opacity += (targetCapOpacity - item.capMaterial.opacity) * 0.07;
        }

        // Transformer Layer Blocks
        if (item.block) {
          const b = item.block;
          const targetMesh = isSelected ? 0.98 : (hasSelection ? 0.12 : b.baseMeshOpacity);
          const targetWire = isSelected ? 1.0 : (hasSelection ? 0.10 : b.baseWireOpacity);

          b.attnMaterial.opacity += (targetMesh - b.attnMaterial.opacity) * 0.07;
          b.attnWireMaterial.opacity += (targetWire - b.attnWireMaterial.opacity) * 0.07;
          b.ffnMaterial.opacity += (targetMesh - b.ffnMaterial.opacity) * 0.07;
          b.ffnWireMaterial.opacity += (targetWire - b.ffnWireMaterial.opacity) * 0.07;
        }
      });
    });

    // 6. Update connection lines
    this.connections.update(time, isReducedMotion, this.activeStage, flowProgress);
  }

  dispose() {
    this.disposables.forEach((d) => {
      if (d && typeof d.dispose === 'function') d.dispose();
    });
    this.scene.remove(this.group);
  }
}
