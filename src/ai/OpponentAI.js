export class OpponentAI {
  constructor(track) {
    this.track = track;
    this.targetIndex = 1;
  }

  update(car) {
    const target = this.track.waypoints[this.targetIndex];
    const dx = target.x - car.position.x;
    const dz = target.z - car.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 18) {
      this.targetIndex = (this.targetIndex + 1) % this.track.waypoints.length;
    }

    const desiredHeading = Math.atan2(dx, dz);
    let error = desiredHeading - car.heading;
    while (error > Math.PI) error -= Math.PI * 2;
    while (error < -Math.PI) error += Math.PI * 2;

    const steer = Math.max(-1, Math.min(1, error * 1.6));
    const throttle = Math.abs(error) > 0.75 ? 0.52 : 1;
    const brake = Math.abs(error) > 1.2 ? 0.5 : 0;

    return { throttle, brake, steer, handbrake: false };
  }
}
