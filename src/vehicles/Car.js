import {
  calcBrakeForce,
  calcDragForce,
  calcEngineTorqueAtRpm,
  calcMaxTraction,
  calcRollingResistance,
  calcWheelForce,
  clamp,
} from '../physics/vehiclePhysics.js';

export class Car {
  constructor(config, start) {
    this.config = config;
    this.position = { x: start.x, z: start.z };
    this.heading = start.heading;
    this.speedMps = 0;
    this.engineRpm = config.idleRpm;
    this.currentGear = 0;
    this.distanceTravelled = 0;
    this.lap = 1;
    this.roll = 0;
    this.pitch = 0;
  }

  update(input, dt) {
    const absSpeed = Math.abs(this.speedMps);

    const wheelRpm = (absSpeed / (2 * Math.PI * this.config.wheelRadiusM)) * 60;
    const targetRpm = Math.max(
      this.config.idleRpm,
      wheelRpm * this.config.gearRatios[this.currentGear] * this.config.finalDrive,
    );
    this.engineRpm += (targetRpm - this.engineRpm) * Math.min(1, dt * 9);

    if (this.engineRpm > this.config.redlineRpm * 0.95 && this.currentGear < this.config.gearRatios.length - 1) {
      this.currentGear += 1;
    } else if (this.engineRpm < this.config.redlineRpm * 0.32 && this.currentGear > 0) {
      this.currentGear -= 1;
    }

    const torque = calcEngineTorqueAtRpm(this.config, this.engineRpm, input.throttle);
    const wheelForce = calcWheelForce(this.config, torque, this.currentGear);
    const tractionLimit = calcMaxTraction(this.config, absSpeed);

    const driveForce = clamp(wheelForce, -tractionLimit, tractionLimit);
    const brakeForce = calcBrakeForce(this.config, input.brake || input.handbrake ? 1 : 0);
    const dragForce = calcDragForce(this.config, absSpeed);
    const rollingForce = calcRollingResistance(this.config);

    const resistive = dragForce + rollingForce + brakeForce;
    const direction = this.speedMps === 0 ? 1 : Math.sign(this.speedMps);
    const netForce = driveForce - resistive * direction;
    const accel = netForce / this.config.massKg;

    this.speedMps += accel * dt;
    if (Math.abs(this.speedMps) < 0.05 && input.throttle < 0.1) this.speedMps = 0;
    this.speedMps = clamp(this.speedMps, -9, 87);

    const steer = input.steer * this.config.handling.steeringRate;
    const turnRate = (this.speedMps / this.config.wheelBaseM) * Math.tan(steer * 0.45);
    this.heading += turnRate * dt;

    this.position.x += Math.sin(this.heading) * this.speedMps * dt;
    this.position.z += Math.cos(this.heading) * this.speedMps * dt;

    this.roll += (((steer * this.speedMps * 0.015) / this.config.suspension.stiffness) - this.roll) * dt * (8 * this.config.suspension.damping);
    this.pitch += (((-accel * 0.08) / this.config.suspension.stiffness) - this.pitch) * dt * (7 * this.config.suspension.damping);

    this.distanceTravelled += absSpeed * dt;
  }

  get speedKmh() {
    return this.speedMps * 3.6;
  }
}
