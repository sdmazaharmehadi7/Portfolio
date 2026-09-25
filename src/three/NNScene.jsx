import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { NNArchitecture } from './NNArchitecture';

// Default presentation camera angle for the 3D Neural Network
const DEFAULT_CAM_POS = new THREE.Vector3(0.0, 0.6, 7.6);
const DEFAULT_LOOK_AT = new THREE.Vector3(0.0, 0.0, 0.0);

export default function NNScene({
  activeLayer = null,
  activeNeuronId = null,
  onSelectLayer,
  onSelectNeuron,
  isExploded = false,
  isBackprop = false,
  resetSignal = 0
}) {
  const mountRef = useRef(null);
  const architectureRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  const isTransitioningRef = useRef(false);
  const targetCamPosRef = useRef(DEFAULT_CAM_POS.clone());
  const targetLookAtRef = useRef(DEFAULT_LOOK_AT.clone());
  const userInteractingRef = useRef(false);

  const pointerDownPosRef = useRef({ x: 0, y: 0 });
  const mouseCoordsRef = useRef(new THREE.Vector2());
  const raycasterRef = useRef(new THREE.Raycaster());

  const onSelectLayerRef = useRef(onSelectLayer);
  const onSelectNeuronRef = useRef(onSelectNeuron);
  const activeLayerRef = useRef(activeLayer);
  const activeNeuronIdRef = useRef(activeNeuronId);
  const isExplodedRef = useRef(isExploded);
  const isBackpropRef = useRef(isBackprop);

  useEffect(() => {
    onSelectLayerRef.current = onSelectLayer;
  }, [onSelectLayer]);

  useEffect(() => {
    onSelectNeuronRef.current = onSelectNeuron;
  }, [onSelectNeuron]);

  useEffect(() => {
    activeLayerRef.current = activeLayer;
  }, [activeLayer]);

  useEffect(() => {
    activeNeuronIdRef.current = activeNeuronId;
  }, [activeNeuronId]);

  useEffect(() => {
    isExplodedRef.current = isExploded;
  }, [isExploded]);

  useEffect(() => {
    isBackpropRef.current = isBackprop;
  }, [isBackprop]);

  // Smooth Reset View triggered by parent button
  const triggerReset = useCallback(() => {
    targetCamPosRef.current.copy(DEFAULT_CAM_POS);
    targetLookAtRef.current.copy(DEFAULT_LOOK_AT);
    isTransitioningRef.current = true;
  }, []);

  // Sync active layer with architecture and camera target
  useEffect(() => {
    if (architectureRef.current) {
      architectureRef.current.setActiveLayer(activeLayer);

      if (activeLayer && architectureRef.current.layerGroups[activeLayer]) {
        const layer = architectureRef.current.layerGroups[activeLayer];
        targetLookAtRef.current.set(layer.baseX, 0, 0);
        targetCamPosRef.current.set(
          layer.baseX,
          DEFAULT_CAM_POS.y * 0.9,
          DEFAULT_CAM_POS.z * 0.85
        );
        isTransitioningRef.current = true;
      }
    }
  }, [activeLayer]);

  // Sync active neuron selection
  useEffect(() => {
    if (architectureRef.current) {
      architectureRef.current.setActiveNeuron(activeNeuronId);

      if (activeNeuronId) {
        const neuron = architectureRef.current.neurons.find((n) => n.id === activeNeuronId);
        if (neuron) {
          const worldPos = neuron.group.getWorldPosition(new THREE.Vector3());
          targetLookAtRef.current.set(worldPos.x, worldPos.y, worldPos.z);
          targetCamPosRef.current.set(
            worldPos.x,
            worldPos.y + 0.3,
            worldPos.z + 4.2
          );
          isTransitioningRef.current = true;
        }
      }
    }
  }, [activeNeuronId]);

  // Sync exploded state
  useEffect(() => {
    if (architectureRef.current) {
      architectureRef.current.setExploded(isExploded);
    }
  }, [isExploded]);

  // Sync backpropagation mode
  useEffect(() => {
    if (architectureRef.current) {
      architectureRef.current.setBackpropagation(isBackprop);
    }
  }, [isBackprop]);

  useEffect(() => {
    if (resetSignal > 0) {
      triggerReset();
    }
  }, [resetSignal, triggerReset]);

  // WebGL Mount & Interaction Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const getDeviceTier = () => {
      const w = window.innerWidth;
      if (w < 640) return 'mobile';
      if (w < 1024) return 'tablet';
      return 'desktop';
    };

    const getCappedPixelRatio = (tier) => {
      if (tier === 'mobile') return 1.0;
      if (tier === 'tablet') return Math.min(window.devicePixelRatio || 1, 1.25);
      return Math.min(window.devicePixelRatio || 1, 1.5);
    };

    const deviceTier = getDeviceTier();
    const mediaQueryReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isReducedMotion = mediaQueryReducedMotion.matches;

    const handleMotionChange = (e) => {
      isReducedMotion = e.matches;
    };
    mediaQueryReducedMotion.addEventListener('change', handleMotionChange);

    // Scene & Perspective Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.copy(DEFAULT_CAM_POS);
    cameraRef.current = camera;

    // WebGL Renderer with performance-capped DPR
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: deviceTier !== 'mobile',
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(getCappedPixelRatio(deviceTier));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.8;   // Deep zoom into individual neurons
    controls.maxDistance = 14.0;  // Broad architecture view
    controls.minPolarAngle = Math.PI * 0.15;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.enablePan = true;
    controls.panSpeed = 0.8;
    controls.rotateSpeed = 0.8;
    controls.target.copy(DEFAULT_LOOK_AT);
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      userInteractingRef.current = true;
      isTransitioningRef.current = false;
    });

    controls.addEventListener('end', () => {
      userInteractingRef.current = false;
    });

    // 3D Architecture Instance
    const architecture = new NNArchitecture(scene, deviceTier);
    architectureRef.current = architecture;
    architecture.setActiveLayer(activeLayerRef.current);
    architecture.setActiveNeuron(activeNeuronIdRef.current);
    architecture.setExploded(isExplodedRef.current);
    architecture.setBackpropagation(isBackpropRef.current);

    // Track pointerdown position
    const handlePointerDown = (e) => {
      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    };

    // Hover detection for individual neurons and layers
    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseCoordsRef.current.set(x, y);

      raycasterRef.current.setFromCamera(mouseCoordsRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(architecture.raycastableMeshes, false);

      if (intersects.length > 0) {
        const hoveredNeuron = intersects[0].object.userData?.neuronId;
        renderer.domElement.style.cursor = 'pointer';
        architecture.setHoveredNeuron(hoveredNeuron);
      } else {
        renderer.domElement.style.cursor = 'grab';
        architecture.setHoveredNeuron(null);
      }
    };

    // Click / Tap selection
    const handlePointerUp = (e) => {
      const dx = Math.abs(e.clientX - pointerDownPosRef.current.x);
      const dy = Math.abs(e.clientY - pointerDownPosRef.current.y);

      // Distinguish drag from click (>5px is drag)
      if (dx > 5 || dy > 5) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseCoordsRef.current.set(x, y);

      raycasterRef.current.setFromCamera(mouseCoordsRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(architecture.raycastableMeshes, false);

      if (intersects.length > 0) {
        const clickedData = intersects[0].object.userData;
        if (clickedData?.isNeuron) {
          if (typeof onSelectNeuronRef.current === 'function') {
            onSelectNeuronRef.current(clickedData.neuronId, clickedData.layerId);
          }
        } else if (clickedData?.layerId) {
          if (typeof onSelectLayerRef.current === 'function') {
            onSelectLayerRef.current(clickedData.layerId);
          }
        }
      } else {
        // Clicking empty space deselects
        if (typeof onSelectLayerRef.current === 'function') {
          onSelectLayerRef.current(null);
        }
        if (typeof onSelectNeuronRef.current === 'function') {
          onSelectNeuronRef.current(null, null);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', handlePointerDown);
    dom.addEventListener('pointermove', handlePointerMove, { passive: true });
    dom.addEventListener('pointerup', handlePointerUp);

    // Escape key resets selection
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (typeof onSelectLayerRef.current === 'function') {
          onSelectLayerRef.current(null);
        }
        if (typeof onSelectNeuronRef.current === 'function') {
          onSelectNeuronRef.current(null, null);
        }
        triggerReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Passive page scroll observation for subtle parallax
    let scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Render loop state & pausing when outside viewport or tab hidden
    const timer = new THREE.Timer();
    let animFrameId = null;
    let isIntersecting = true;
    let isDocumentVisible = !document.hidden;

    const animate = () => {
      if (!isIntersecting || !isDocumentVisible) {
        animFrameId = null;
        return;
      }

      animFrameId = requestAnimationFrame(animate);
      timer.update();
      const elapsedTime = timer.getElapsed();

      // Smooth camera transition toward target
      if (isTransitioningRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.055);
        controls.target.lerp(targetLookAtRef.current, 0.055);

        if (
          camera.position.distanceTo(targetCamPosRef.current) < 0.02 &&
          controls.target.distanceTo(targetLookAtRef.current) < 0.02
        ) {
          camera.position.copy(targetCamPosRef.current);
          controls.target.copy(targetLookAtRef.current);
          isTransitioningRef.current = false;
        }
      }

      controls.update();

      const scrollOffset = Math.min(scrollY / 600, 1.0);
      architecture.update(elapsedTime, isReducedMotion, scrollOffset);

      renderer.render(scene, camera);
    };

    const updateRenderingState = () => {
      const shouldRender = isIntersecting && isDocumentVisible;
      if (shouldRender && !animFrameId) {
        animate();
      } else if (!shouldRender && animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        updateRenderingState();
      },
      { threshold: 0.02, rootMargin: '60px 0px 60px 0px' }
    );
    observer.observe(container);

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      updateRenderingState();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    });
    resizeObserver.observe(container);

    updateRenderingState();

    return () => {
      mediaQueryReducedMotion.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      resizeObserver.disconnect();

      dom.removeEventListener('pointerdown', handlePointerDown);
      dom.removeEventListener('pointermove', handlePointerMove);
      dom.removeEventListener('pointerup', handlePointerUp);

      if (animFrameId) cancelAnimationFrame(animFrameId);

      timer.dispose();
      controls.dispose();
      architecture.dispose();
      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [triggerReset]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'grab'
      }}
      aria-label="3D Interactive Artificial Neural Network Architecture Model"
      role="region"
    />
  );
}
