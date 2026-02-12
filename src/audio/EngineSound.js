export class EngineSound {
  constructor() {
    this.started = false;
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.ctx = new AudioContext();

    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sawtooth';

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';

    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0.03;

    this.osc.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.ctx.destination);

    this.osc.frequency.value = 45;
    this.osc.start();
  }

  update(rpm, throttle) {
    if (!this.started) return;
    const hz = Math.max(20, Math.min(230, rpm / 60));
    this.osc.frequency.value += (hz - this.osc.frequency.value) * 0.35;
    this.filter.frequency.value = 450 + throttle * 2200 + (rpm / 7000) * 900;
    this.gain.gain.value = 0.02 + throttle * 0.07;
  }
}
