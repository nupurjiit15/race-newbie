import * as THREE from 'three';
import { lerp } from '../utils/math.js';

export class ThirdPersonCamera {
  constructor(camera) {
    this.camera = camera;
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
  }

  update(target) {
    const behind = new THREE.Vector3(0, 4.5, 9).applyQuaternion(target.quaternion);
    const desiredPosition = target.position.clone().add(behind);
    const desiredLookAt = target.position.clone().add(new THREE.Vector3(0, 1.2, 0));

    this.currentPosition.set(
      lerp(this.currentPosition.x, desiredPosition.x, 0.11),
      lerp(this.currentPosition.y, desiredPosition.y, 0.11),
      lerp(this.currentPosition.z, desiredPosition.z, 0.11),
    );

    this.currentLookAt.set(
      lerp(this.currentLookAt.x, desiredLookAt.x, 0.15),
      lerp(this.currentLookAt.y, desiredLookAt.y, 0.15),
      lerp(this.currentLookAt.z, desiredLookAt.z, 0.15),
    );

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }
}
