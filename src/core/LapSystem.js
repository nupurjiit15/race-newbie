export class LapSystem {
  constructor(track) {
    this.track = track;
    this.lastSide = null;
    this.checkpointIndex = 1;
  }

  update(car) {
    const cp = this.track.waypoints[this.checkpointIndex];
    if (Math.hypot(cp.x - car.position.x, cp.z - car.position.z) < 24) {
      this.checkpointIndex = (this.checkpointIndex + 1) % this.track.waypoints.length;
    }

    const a = this.track.finishLine.a;
    const b = this.track.finishLine.b;
    const side = Math.sign((b.x - a.x) * (car.position.z - a.z) - (b.z - a.z) * (car.position.x - a.x));

    if (this.lastSide !== null && this.lastSide < 0 && side > 0 && this.checkpointIndex === 1) {
      car.lap = Math.min(3, car.lap + 1);
    }
    this.lastSide = side;
  }
}
