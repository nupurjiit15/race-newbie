export class Controls {
  constructor() {
    this.state = {
      throttle: 0,
      brake: 0,
      steer: 0,
      handbrake: false,
    };
    this.keys = new Set();

    addEventListener('keydown', (e) => this.keys.add(e.code));
    addEventListener('keyup', (e) => this.keys.delete(e.code));
  }

  update() {
    this.state.throttle = this.keys.has('ArrowUp') || this.keys.has('KeyW') ? 1 : 0;
    this.state.brake = this.keys.has('ArrowDown') || this.keys.has('KeyS') ? 1 : 0;

    const left = this.keys.has('ArrowLeft') || this.keys.has('KeyA');
    const right = this.keys.has('ArrowRight') || this.keys.has('KeyD');
    this.state.steer = left ? -1 : right ? 1 : 0;

    this.state.handbrake = this.keys.has('Space');
    return this.state;
  }
}
