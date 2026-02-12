const AIR_DENSITY = 1.225;
const GRAVITY = 9.81;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function calcPowerWatts(hp) {
  return hp * 745.7;
}

export function calcEngineTorqueAtRpm(config, rpm, throttle) {
  const x = clamp(rpm / config.redlineRpm, 0, 1.1);
  const rise = Math.min(1, x * 2.1);
  const mid = 1 - Math.max(0, x - 0.55) * 0.35;
  const highFalloff = 1 - Math.max(0, x - 0.82) * 1.9;
  return config.torqueNm * rise * mid * Math.max(0.62, highFalloff) * throttle;
}

export function calcWheelForce(config, engineTorqueNm, gearIndex) {
  const gearRatio = config.gearRatios[gearIndex];
  const axleTorque = engineTorqueNm * gearRatio * config.finalDrive * config.drivetrainEfficiency;
  return axleTorque / config.wheelRadiusM;
}

export function calcDragForce(config, speedMps) {
  return 0.5 * AIR_DENSITY * config.dragCoefficient * config.frontalAreaM2 * speedMps * speedMps;
}

export function calcRollingResistance(config) {
  return config.rollingResistance * config.massKg * GRAVITY;
}

export function calcBrakeForce(config, brakeInput) {
  return brakeInput * config.massKg * GRAVITY * config.handling.brakeGrip;
}

export function calcMaxTraction(config, speedMps) {
  // Heavy vehicles get more available normal force, but we reduce with speed to simulate tire slip growth.
  const speedGripLoss = 1 - clamp(speedMps / 95, 0, 0.36);
  return config.massKg * GRAVITY * config.handling.lateralGrip * speedGripLoss;
}
