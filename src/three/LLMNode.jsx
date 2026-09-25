import * as THREE from 'three';

/**
 * LLMNode
 * Procedural architectural geometry builders for the 3D LLM/Transformer visualization.
 * Strictly monochrome + subtle cool white/blue accents (Vercel/Linear scientific aesthetic).
 * Uses lightweight BufferGeometries and reusable materials for 60 FPS performance.
 */


/**
 * Creates an interactive box with wireframe edges
 */
export function createInteractiveBox(width, height, depth, isAccent = false, label = '') {
  const group = new THREE.Group();

  const geometry = new THREE.BoxGeometry(width, height, depth);
  const meshMaterial = new THREE.MeshBasicMaterial({
    color: isAccent ? 0x14202c : 0x0c0e12,
    transparent: true,
    opacity: 0.88
  });
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  group.add(mesh);

  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const wireframeMaterial = new THREE.LineBasicMaterial({
    color: isAccent ? 0xbae6fd : 0xd4d4d8,
    transparent: true,
    opacity: isAccent ? 0.8 : 0.38
  });
  const wireframe = new THREE.LineSegments(edgesGeometry, wireframeMaterial);
  group.add(wireframe);

  return {
    group,
    mesh,
    wireframe,
    meshMaterial,
    wireframeMaterial,
    geometry,
    edgesGeometry,
    baseMeshOpacity: 0.88,
    baseWireOpacity: isAccent ? 0.8 : 0.38,
    isAccent,
    label
  };
}

/**
 * Creates a high-dimensional vector column rod with a glowing cap
 */
export function createInteractiveVectorRod(height, radius = 0.016, isAccent = false) {
  const group = new THREE.Group();

  const geom = new THREE.CylinderGeometry(radius, radius, height, 8);
  const rodMaterial = new THREE.MeshBasicMaterial({
    color: isAccent ? 0xbae6fd : 0x71717a,
    transparent: true,
    opacity: isAccent ? 0.95 : 0.42
  });
  const rod = new THREE.Mesh(geom, rodMaterial);
  group.add(rod);

  const capGeom = new THREE.BoxGeometry(radius * 3.8, radius * 3.8, radius * 3.8);
  const capMaterial = new THREE.MeshBasicMaterial({
    color: isAccent ? 0xffffff : 0xa1a1aa,
    transparent: true,
    opacity: 0.95
  });
  const cap = new THREE.Mesh(capGeom, capMaterial);
  cap.position.y = height / 2;
  group.add(cap);

  return {
    group,
    rod,
    cap,
    rodMaterial,
    capMaterial,
    geom,
    capGeom,
    baseRodOpacity: isAccent ? 0.95 : 0.42,
    baseCapOpacity: 0.95,
    isAccent
  };
}

/**
 * Creates a Positional Encoding harmonic frequency wave-bar
 */
export function createPositionalBar(width, height, depth, phaseAngle = 0, isAccent = false) {
  const group = new THREE.Group();

  const geom = new THREE.BoxGeometry(width, height, depth);
  const meshMaterial = new THREE.MeshBasicMaterial({
    color: isAccent ? 0x162838 : 0x101318,
    transparent: true,
    opacity: 0.85
  });
  const mesh = new THREE.Mesh(geom, meshMaterial);
  group.add(mesh);

  const edgesGeom = new THREE.EdgesGeometry(geom);
  const wireMaterial = new THREE.LineBasicMaterial({
    color: isAccent ? 0xbae6fd : 0x94a3b8,
    transparent: true,
    opacity: isAccent ? 0.85 : 0.4
  });
  const wireframe = new THREE.LineSegments(edgesGeom, wireMaterial);
  group.add(wireframe);

  return {
    group,
    mesh,
    wireframe,
    meshMaterial,
    wireMaterial,
    geom,
    edgesGeom,
    phaseAngle,
    baseMeshOpacity: 0.85,
    baseWireOpacity: isAccent ? 0.85 : 0.4,
    isAccent
  };
}

/**
 * Creates a detailed Transformer Block with sub-layers and residual rails:
 * - Attention sub-plate
 * - Feed-Forward sub-plate
 * - Residual stream bypass rails on left and right
 */
export function createTransformerLayerBlock(layerIndex, width = 1.9, depth = 1.35) {
  const group = new THREE.Group();
  const disposables = [];

  // 1. Attention sub-plate (lower tier)
  const attnPlateGeom = new THREE.BoxGeometry(width, 0.05, depth);
  const attnMaterial = new THREE.MeshBasicMaterial({ color: 0x11161d, transparent: true, opacity: 0.88 });
  const attnMesh = new THREE.Mesh(attnPlateGeom, attnMaterial);
  attnMesh.position.y = -0.16;
  group.add(attnMesh);

  const attnEdges = new THREE.EdgesGeometry(attnPlateGeom);
  const attnWireMaterial = new THREE.LineBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.65 });
  const attnWire = new THREE.LineSegments(attnEdges, attnWireMaterial);
  attnWire.position.y = -0.16;
  group.add(attnWire);

  // 2. Feed-Forward sub-plate (upper tier)
  const ffnPlateGeom = new THREE.BoxGeometry(width * 0.94, 0.05, depth * 0.94);
  const ffnMaterial = new THREE.MeshBasicMaterial({ color: 0x0c1015, transparent: true, opacity: 0.88 });
  const ffnMesh = new THREE.Mesh(ffnPlateGeom, ffnMaterial);
  ffnMesh.position.y = 0.16;
  group.add(ffnMesh);

  const ffnEdges = new THREE.EdgesGeometry(ffnPlateGeom);
  const ffnWireMaterial = new THREE.LineBasicMaterial({ color: 0xd4d4d8, transparent: true, opacity: 0.5 });
  const ffnWire = new THREE.LineSegments(ffnEdges, ffnWireMaterial);
  ffnWire.position.y = 0.16;
  group.add(ffnWire);

  // 3. Residual Stream vertical bypass rails (connecting lower to upper)
  const railPositions = [-width / 2 + 0.08, width / 2 - 0.08];
  const rails = [];

  railPositions.forEach((xPos) => {
    const railGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.42, 6);
    const railMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.7 });
    const rail = new THREE.Mesh(railGeom, railMat);
    rail.position.set(xPos, 0, 0);
    group.add(rail);

    // Micro node dot at connection junction
    const dotGeom = new THREE.BoxGeometry(0.035, 0.035, 0.035);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const dotTop = new THREE.Mesh(dotGeom, dotMat);
    dotTop.position.set(xPos, 0.18, 0);
    group.add(dotTop);

    const dotBottom = new THREE.Mesh(dotGeom, dotMat);
    dotBottom.position.set(xPos, -0.18, 0);
    group.add(dotBottom);

    disposables.push(railGeom, railMat, dotGeom, dotMat);
    rails.push({ rail, dotTop, dotBottom });
  });

  disposables.push(attnPlateGeom, attnMaterial, attnEdges, attnWireMaterial, ffnPlateGeom, ffnMaterial, ffnEdges, ffnWireMaterial);

  return {
    group,
    attnMesh,
    attnWire,
    ffnMesh,
    ffnWire,
    attnMaterial,
    attnWireMaterial,
    ffnMaterial,
    ffnWireMaterial,
    rails,
    disposables,
    layerIndex,
    baseMeshOpacity: 0.88,
    baseWireOpacity: 0.65
  };
}
