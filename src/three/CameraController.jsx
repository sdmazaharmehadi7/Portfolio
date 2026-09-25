import * as THREE from 'three';

/**
 * CameraController
 * Manages isometric camera framing, smooth pointer parallax damping,
 * and camera zoom/focus framing when inspecting a component.
 */
export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.basePosition = new THREE.Vector3(2.2, 0.2, 8.2);
    this.currentPosition = this.basePosition.clone();
    this.lookAtTarget = new THREE.Vector3(0, 0.05, 0);

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.activeStage = null;

    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleMouseLeave = this.onMouseLeave.bind(this);

    window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', this.handleMouseLeave, { passive: true });

    this.camera.position.copy(this.basePosition);
    this.camera.lookAt(this.lookAtTarget);
  }

  setActiveStage(stageId) {
    this.activeStage = stageId;
  }

  onMouseMove(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.mouse.targetX = x;
    this.mouse.targetY = y;
  }

  onMouseLeave() {
    this.mouse.targetX = 0;
    this.mouse.targetY = 0;
  }

  update(time, isReducedMotion = false) {
    if (!isReducedMotion) {
      // Slow, weighted mouse damping on liquid bearings
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.025;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.025;

      // Ultra-subtle, slow ambient breathing drift
      const breatheX = this.activeStage ? 0 : Math.sin(time * 0.08) * 0.025;
      const breatheY = this.activeStage ? 0 : Math.cos(time * 0.07) * 0.022;

      // Subtle framing shift (smoothly glides toward inspected component)
      const targetZ = this.activeStage ? 7.4 : 8.2;
      const targetX = (this.activeStage ? 1.8 : 2.2) + this.mouse.x * 0.22 + breatheX;
      const targetY = (this.activeStage ? 0.08 : 0.2) + this.mouse.y * 0.16 + breatheY;

      // Silky spring-like position interpolation
      this.currentPosition.x += (targetX - this.currentPosition.x) * 0.045;
      this.currentPosition.y += (targetY - this.currentPosition.y) * 0.045;
      this.currentPosition.z += (targetZ - this.currentPosition.z) * 0.045;

      this.camera.position.copy(this.currentPosition);
    } else {
      const targetZ = this.activeStage ? 7.4 : 8.2;
      this.currentPosition.z += (targetZ - this.currentPosition.z) * 0.06;
      this.camera.position.copy(this.currentPosition);
    }

    this.camera.lookAt(this.lookAtTarget);
  }

  dispose() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseleave', this.handleMouseLeave);
  }
}
