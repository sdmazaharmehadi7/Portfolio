import * as THREE from 'three';
import { NNConnections } from './NNConnections';

export const NN_STAGE_METADATA = {
  INPUT_FEATURES: {
    id: 'INPUT_FEATURES',
    num: '01',
    title: 'Input Features',
    subtitle: 'Raw Signal Ingestion',
    category: 'Ingestion Layer',
    formula: 'x = [x_1, x_2, ..., x_d]^T \\in \\mathbb{R}^d',
    description: 'Raw multidimensional features ingested into the network, normalized and mapped into continuous input coordinates.'
  },
  INPUT_LAYER: {
    id: 'INPUT_LAYER',
    num: '02',
    title: 'Input Layer',
    subtitle: 'Signal Distribution Hub',
    category: 'Distribution Layer',
    formula: 'a^{[0]} = x',
    description: 'Holds input neuron values and broadcasts them forward along weighted synaptic connections to the hidden layers.'
  },
  HIDDEN_1: {
    id: 'HIDDEN_1',
    num: '03',
    title: 'Hidden Layer 1',
    subtitle: 'Primitive Feature Extraction',
    category: 'Low-Level Processing',
    formula: 'z^{[1]} = W^{[1]} a^{[0]} + b^{[1]}, \\quad a^{[1]} = \\text{ReLU}(z^{[1]})',
    description: 'Calculates initial linear combinations and applies non-linear activations to identify basic boundaries and elementary correlations.'
  },
  HIDDEN_2: {
    id: 'HIDDEN_2',
    num: '04',
    title: 'Hidden Layer 2',
    subtitle: 'Intermediate Representation',
    category: 'Latent Manifold',
    formula: 'z^{[2]} = W^{[2]} a^{[1]} + b^{[2]}, \\quad a^{[2]} = \\text{GELU}(z^{[2]})',
    description: 'Composes lower-level signals into intermediate distributed representations, capturing intricate combinatorial patterns.'
  },
  HIDDEN_3: {
    id: 'HIDDEN_3',
    num: '05',
    title: 'Hidden Layer 3',
    subtitle: 'High-Level Semantic Synthesis',
    category: 'Abstraction Layer',
    formula: 'z^{[3]} = W^{[3]} a^{[2]} + b^{[3]}, \\quad a^{[3]} = \\text{Swish}(z^{[3]})',
    description: 'Synthesizes high-order semantic manifolds to prepare decision-ready representations prior to target classification.'
  },
  OUTPUT_LAYER: {
    id: 'OUTPUT_LAYER',
    num: '06',
    title: 'Output Layer',
    subtitle: 'Class Logits & Probabilities',
    category: 'Target Mapping',
    formula: '\\hat{y} = \\text{softmax}(W^{[L]} a^{[L-1]} + b^{[L]})',
    description: 'Projects the final contextual hidden state into unnormalized logits and normalizes them into a probability distribution.'
  },
  PREDICTION: {
    id: 'PREDICTION',
    num: '07',
    title: 'Prediction',
    subtitle: 'Inference Target Output',
    category: 'Final Decision',
    formula: '\\hat{c} = \\arg\\max_k (\\hat{y}_k)',
    description: 'Selects the highest-probability candidate state for the final model decision or continuous regression target.'
  },
  LEARNING: {
    id: 'LEARNING',
    num: '08',
    title: 'Learning / Backpropagation',
    subtitle: 'Reverse Gradient Descent',
    category: 'Optimization Process',
    formula: '\\delta^{[l]} = (W^{[l+1]T} \\delta^{[l+1]}) \\odot \\sigma\'(z^{[l]}), \\quad W \\leftarrow W - \\eta \\nabla_W L',
    description: 'Propagates error gradients backward from prediction through all layers via the chain rule, updating synaptic weights toward optimal convergence.'
  }
};

export const NN_STAGE_ORDER = [
  'INPUT_FEATURES',
  'INPUT_LAYER',
  'HIDDEN_1',
  'HIDDEN_2',
  'HIDDEN_3',
  'OUTPUT_LAYER',
  'PREDICTION'
];

export class NNArchitecture {
  constructor(scene, deviceTier = 'desktop') {
    this.scene = scene;
    const tier = typeof deviceTier === 'string' ? deviceTier : (deviceTier ? 'mobile' : 'desktop');
    this.deviceTier = tier;
    this.isMobile = tier === 'mobile';
    this.isTablet = tier === 'tablet';

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.activeLayer = null;
    this.activeNeuronId = null;
    this.hoveredNeuronId = null;
    this.isExploded = false;
    this.isBackprop = false;

    this.raycastableMeshes = [];
    this.neurons = [];
    this.layerGroups = {};
    this.disposables = [];

    this.connections = new NNConnections(84);
    this.group.add(this.connections.lineSegments);
    this.disposables.push(this.connections);

    this.buildNetwork();
  }

  createNeuron(layerId, index, radius, x, y, z, isAccent = false) {
    const neuronGroup = new THREE.Group();
    neuronGroup.position.set(x, y, z);

    // Inner core sphere
    const geom = new THREE.IcosahedronGeometry(radius, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: isAccent ? 0x22364c : 0x12161c,
      transparent: true,
      opacity: 0.92
    });
    const coreMesh = new THREE.Mesh(geom, coreMat);

    // Outer wire cage
    const wireGeom = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(radius * 1.25, 1));
    const wireMat = new THREE.LineBasicMaterial({
      color: isAccent ? 0xbae6fd : 0x71717a,
      transparent: true,
      opacity: isAccent ? 0.85 : 0.40
    });
    const wireMesh = new THREE.LineSegments(wireGeom, wireMat);

    neuronGroup.add(coreMesh);
    neuronGroup.add(wireMesh);

    const neuronId = `${layerId}_N${index}`;
    coreMesh.userData = {
      isNeuron: true,
      neuronId,
      layerId,
      index
    };

    this.raycastableMeshes.push(coreMesh);
    this.disposables.push(geom, wireGeom, coreMat, wireMat);

    const neuronObj = {
      id: neuronId,
      layerId,
      index,
      group: neuronGroup,
      coreMesh,
      wireMesh,
      coreMat,
      wireMat,
      isAccent,
      baseRadius: radius,
      basePos: new THREE.Vector3(x, y, z),
      targetScale: 1.0,
      currentScale: 1.0
    };

    this.neurons.push(neuronObj);
    return neuronObj;
  }

  buildNetwork() {
    // Spatial layout of layers along the X axis with genuine 3D depth along Y and Z
    const layerConfigs = [
      {
        id: 'INPUT_FEATURES',
        baseX: -3.2,
        neuronRadius: 0.08,
        isAccent: false,
        nodes: this.isMobile
          ? [
              { y: 0.8, z: -0.2 },
              { y: 0.0, z: 0.25 },
              { y: -0.8, z: -0.15 }
            ]
          : [
              { y: 1.0, z: -0.3 },
              { y: 0.35, z: 0.35 },
              { y: -0.35, z: -0.35 },
              { y: -1.0, z: 0.25 }
            ]
      },
      {
        id: 'INPUT_LAYER',
        baseX: -2.1,
        neuronRadius: 0.10,
        isAccent: false,
        nodes: this.isMobile
          ? [
              { y: 0.9, z: 0.2 },
              { y: 0.3, z: -0.2 },
              { y: -0.3, z: 0.2 },
              { y: -0.9, z: -0.2 }
            ]
          : [
              { y: 1.15, z: 0.25 },
              { y: 0.58, z: -0.35 },
              { y: 0.0, z: 0.40 },
              { y: -0.58, z: -0.25 },
              { y: -1.15, z: 0.20 }
            ]
      },
      {
        id: 'HIDDEN_1',
        baseX: -0.95,
        neuronRadius: 0.105,
        isAccent: true,
        nodes: this.isMobile
          ? [
              { y: 1.1, z: -0.25 },
              { y: 0.55, z: 0.35 },
              { y: 0.0, z: -0.35 },
              { y: -0.55, z: 0.3 },
              { y: -1.1, z: -0.2 }
            ]
          : [
              { y: 1.35, z: -0.25 },
              { y: 0.90, z: 0.45 },
              { y: 0.45, z: -0.40 },
              { y: 0.0, z: 0.50 },
              { y: -0.45, z: -0.35 },
              { y: -0.90, z: 0.40 },
              { y: -1.35, z: -0.20 }
            ]
      },
      {
        id: 'HIDDEN_2',
        baseX: 0.25,
        neuronRadius: 0.11,
        isAccent: true,
        nodes: this.isMobile
          ? [
              { y: 1.2, z: 0.3 },
              { y: 0.6, z: -0.35 },
              { y: 0.0, z: 0.4 },
              { y: -0.6, z: -0.35 },
              { y: -1.2, z: 0.25 }
            ]
          : [
              { y: 1.40, z: 0.30 },
              { y: 1.0, z: -0.40 },
              { y: 0.60, z: 0.45 },
              { y: 0.20, z: -0.45 },
              { y: -0.20, z: 0.40 },
              { y: -0.60, z: -0.40 },
              { y: -1.0, z: 0.35 },
              { y: -1.40, z: -0.25 }
            ]
      },
      {
        id: 'HIDDEN_3',
        baseX: 1.45,
        neuronRadius: 0.105,
        isAccent: false,
        nodes: this.isMobile
          ? [
              { y: 1.0, z: -0.3 },
              { y: 0.35, z: 0.35 },
              { y: -0.35, z: -0.35 },
              { y: -1.0, z: 0.25 }
            ]
          : [
              { y: 1.25, z: -0.35 },
              { y: 0.75, z: 0.40 },
              { y: 0.25, z: -0.40 },
              { y: -0.25, z: 0.35 },
              { y: -0.75, z: -0.35 },
              { y: -1.25, z: 0.25 }
            ]
      },
      {
        id: 'OUTPUT_LAYER',
        baseX: 2.55,
        neuronRadius: 0.12,
        isAccent: true,
        nodes: [
          { y: 0.75, z: 0.30 },
          { y: 0.0, z: -0.35 },
          { y: -0.75, z: 0.25 }
        ]
      },
      {
        id: 'PREDICTION',
        baseX: 3.5,
        neuronRadius: 0.14,
        isAccent: true,
        nodes: [
          { y: 0.35, z: 0.05 },
          { y: -0.35, z: -0.05 }
        ]
      }
    ];

    // Build layers and neurons
    const layerNeuronMap = {};

    layerConfigs.forEach((cfg) => {
      const layerGroup = new THREE.Group();
      layerGroup.position.set(cfg.baseX, 0, 0);
      this.group.add(layerGroup);

      this.layerGroups[cfg.id] = {
        group: layerGroup,
        baseX: cfg.baseX,
        currentX: cfg.baseX,
        baseZ: 0,
        currentZ: 0,
        neurons: []
      };

      layerNeuronMap[cfg.id] = [];

      cfg.nodes.forEach((pos, idx) => {
        const isPeak = cfg.id === 'PREDICTION' && idx === 0;
        const neuron = this.createNeuron(
          cfg.id,
          idx,
          cfg.neuronRadius,
          0,
          pos.y,
          pos.z,
          cfg.isAccent || isPeak
        );
        layerGroup.add(neuron.group);
        this.layerGroups[cfg.id].neurons.push(neuron);
        layerNeuronMap[cfg.id].push(neuron);
      });
    });

    // Create curated synaptic connections between adjacent layers
    for (let l = 0; l < layerConfigs.length - 1; l++) {
      const fromCfg = layerConfigs[l];
      const toCfg = layerConfigs[l + 1];
      const fromNeurons = layerNeuronMap[fromCfg.id];
      const toNeurons = layerNeuronMap[toCfg.id];

      fromNeurons.forEach((fn, fIdx) => {
        // Connect to 2-3 target neurons to keep clean engineering clarity
        toNeurons.forEach((tn, tIdx) => {
          const shouldConnect =
            (fIdx + tIdx) % 2 === 0 ||
            Math.abs(fIdx - tIdx) <= 1 ||
            (fIdx === 0 && tIdx === 0) ||
            (fIdx === fromNeurons.length - 1 && tIdx === toNeurons.length - 1);

          if (shouldConnect) {
            this.connections.addConnection(
              () => fn.group.getWorldPosition(new THREE.Vector3()),
              () => tn.group.getWorldPosition(new THREE.Vector3()),
              fromCfg.id,
              toCfg.id,
              fn.id,
              tn.id,
              1.0
            );
          }
        });
      });
    }
  }

  setActiveLayer(layerId) {
    this.activeLayer = layerId;
    this.activeNeuronId = null; // Clear individual neuron selection when selecting layer
  }

  setActiveNeuron(neuronId) {
    this.activeNeuronId = neuronId;
    if (neuronId) {
      const neuron = this.neurons.find((n) => n.id === neuronId);
      if (neuron) {
        this.activeLayer = neuron.layerId;
      }
    }
  }

  setHoveredNeuron(neuronId) {
    this.hoveredNeuronId = neuronId;
  }

  setExploded(isExploded) {
    this.isExploded = isExploded;
  }

  setBackpropagation(isBackprop) {
    this.isBackprop = isBackprop;
  }

  update(time, isReducedMotion = false, scrollOffset = 0) {
    const inspectedIndex = this.activeLayer ? NN_STAGE_ORDER.indexOf(this.activeLayer) : -1;
    const isBackpropActive = this.isBackprop || this.activeLayer === 'LEARNING' || this.activeLayer === 'OUTPUT_LAYER';

    // 1. Update synaptic connection pulse flow
    this.connections.update(
      time,
      isReducedMotion,
      this.activeLayer,
      this.activeNeuronId,
      isBackpropActive
    );

    // 2. Layer spatial separation (Controlled exploded diagram along X & Z)
    NN_STAGE_ORDER.forEach((layerId, idx) => {
      const layer = this.layerGroups[layerId];
      if (!layer) return;

      let targetX = layer.baseX;
      let targetZ = 0;

      if (this.isExploded) {
        // Uniform expansion along X axis
        const centerIdx = (NN_STAGE_ORDER.length - 1) / 2;
        targetX = layer.baseX + (idx - centerIdx) * 0.42;
        targetZ = (idx % 2 === 0 ? 0.22 : -0.22);
      } else if (inspectedIndex !== -1) {
        if (idx === inspectedIndex) {
          // Selected layer steps forward toward viewer
          targetZ = 0.48;
        } else if (idx < inspectedIndex) {
          targetX = layer.baseX - (inspectedIndex - idx) * 0.32 - 0.45;
          targetZ = -0.15;
        } else {
          targetX = layer.baseX + (idx - inspectedIndex) * 0.32 + 0.45;
          targetZ = -0.15;
        }
      }

      layer.currentX += (targetX - layer.currentX) * 0.06;
      layer.currentZ += (targetZ - layer.currentZ) * 0.06;
      layer.group.position.x = layer.currentX;
      layer.group.position.z = layer.currentZ;
    });

    // 3. Update individual neurons (scale, breathing, hover & selection highlighting)
    this.neurons.forEach((n) => {
      const isSelected = n.id === this.activeNeuronId;
      const isHovered = n.id === this.hoveredNeuronId;
      const isLayerActive = n.layerId === this.activeLayer;

      // Determine scale
      if (isSelected) {
        n.targetScale = 1.38;
      } else if (isHovered) {
        n.targetScale = 1.20;
      } else if (isLayerActive) {
        n.targetScale = 1.10;
      } else {
        n.targetScale = 1.0;
      }

      // Smooth scale interpolation
      n.currentScale += (n.targetScale - n.currentScale) * 0.10;
      n.group.scale.setScalar(n.currentScale);

      // Subtle breathing motion for idle vitality
      if (!isReducedMotion && !isSelected) {
        const breath = Math.sin(time * 1.5 + n.index * 0.6) * 0.015;
        n.group.position.y = n.basePos.y + breath;
      }

      // Adjust opacity & color based on selection
      if (isSelected || isHovered) {
        n.coreMat.color.setHex(isBackpropActive ? 0x4a3a14 : 0x1f3d5a);
        n.coreMat.opacity = 1.0;
        n.wireMat.color.setHex(isBackpropActive ? 0xfde047 : 0xffffff);
        n.wireMat.opacity = 1.0;
      } else if (isLayerActive) {
        n.coreMat.color.setHex(n.isAccent ? 0x22364c : 0x161c24);
        n.coreMat.opacity = 0.95;
        n.wireMat.color.setHex(n.isAccent ? 0xbae6fd : 0xa1a1aa);
        n.wireMat.opacity = 0.85;
      } else if (this.activeLayer || this.activeNeuronId) {
        // Dim unrelated neurons
        n.coreMat.color.setHex(0x0a0c0f);
        n.coreMat.opacity = 0.35;
        n.wireMat.color.setHex(0x52525b);
        n.wireMat.opacity = 0.15;
      } else {
        // Normal resting state
        n.coreMat.color.setHex(n.isAccent ? 0x22364c : 0x12161c);
        n.coreMat.opacity = 0.92;
        n.wireMat.color.setHex(n.isAccent ? 0xbae6fd : 0x71717a);
        n.wireMat.opacity = n.isAccent ? 0.85 : 0.40;
      }
    });

    // 4. Subtle passive scroll parallax
    if (!isReducedMotion) {
      this.group.position.y = -scrollOffset * 0.25;
    }
  }

  dispose() {
    this.disposables.forEach((item) => {
      if (item && typeof item.dispose === 'function') {
        item.dispose();
      }
    });
    this.connections.dispose();
  }
}
