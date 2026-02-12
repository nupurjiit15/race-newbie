import { CAR_CONFIGS } from './vehicles/carConfigs.js';
import { createTrack, enforceTrackBounds } from './track/createTrack.js';
import { Controls } from './core/controls.js';
import { Car } from './vehicles/Car.js';
import { OpponentAI } from './ai/OpponentAI.js';
import { GameUI } from './ui/GameUI.js';
import { EngineSound } from './audio/EngineSound.js';
import { LapSystem } from './core/LapSystem.js';
import { SoftwareRenderer } from './core/SoftwareRenderer.js';

const canvas = document.querySelector('#game');
const renderer = new SoftwareRenderer(canvas);
const track = createTrack();
const controls = new Controls();
const engineSound = new EngineSound();

let playerCar;
let aiCar;
let ai;
let lapSystem;

const ui = new GameUI(document.querySelector('#ui-root'), (carId) => {
  const playerCfg = CAR_CONFIGS[carId];
  const aiCfg = CAR_CONFIGS[carId === 'm340i' ? 'x5' : 'm340i'];

  playerCar = new Car(playerCfg, { x: -5, z: 120, heading: 0 });
  aiCar = new Car(aiCfg, { x: 5, z: 120, heading: 0 });

  ai = new OpponentAI(track);
  lapSystem = new LapSystem(track);

  addEventListener('keydown', () => engineSound.start(), { once: true });
});

let last = performance.now();

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  if (!playerCar) {
    renderer.drawScene(track, []);
    return;
  }

  const input = controls.update();
  const aiInput = ai.update(aiCar);

  playerCar.update(input, dt);
  aiCar.update(aiInput, dt);

  enforceTrackBounds(playerCar, track);
  enforceTrackBounds(aiCar, track);

  lapSystem.update(playerCar);

  renderer.updateCamera(playerCar);
  renderer.drawScene(track, [playerCar, aiCar]);

  engineSound.update(playerCar.engineRpm, input.throttle);
  ui.update(playerCar, aiCar);
}

requestAnimationFrame(frame);
addEventListener('resize', () => renderer.resize());
