export class SoftwareRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = { x: 0, y: 7.2, z: 0, yaw: 0, pitch: 0.28, fov: 480 };
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  worldToScreen(x, y, z) {
    const cx = x - this.camera.x;
    const cy = y - this.camera.y;
    const cz = z - this.camera.z;

    const sinY = Math.sin(-this.camera.yaw);
    const cosY = Math.cos(-this.camera.yaw);
    const sinP = Math.sin(-this.camera.pitch);
    const cosP = Math.cos(-this.camera.pitch);

    const rx = cx * cosY - cz * sinY;
    const rz = cx * sinY + cz * cosY;

    const ry = cy * cosP - rz * sinP;
    const rz2 = cy * sinP + rz * cosP;

    if (rz2 <= 0.2) return null;

    const sx = this.canvas.width * 0.5 + (rx / rz2) * this.camera.fov;
    const sy = this.canvas.height * 0.55 - (ry / rz2) * this.camera.fov;
    return { x: sx, y: sy, depth: rz2 };
  }

  updateCamera(targetCar) {
    const back = 14;
    const height = 7;
    const tx = targetCar.position.x - Math.sin(targetCar.heading) * back;
    const tz = targetCar.position.z - Math.cos(targetCar.heading) * back;

    this.camera.x += (tx - this.camera.x) * 0.09;
    this.camera.y += (height - this.camera.y) * 0.08;
    this.camera.z += (tz - this.camera.z) * 0.09;
    this.camera.yaw += ((targetCar.heading + Math.PI) - this.camera.yaw) * 0.08;
  }

  drawScene(track, cars) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#7fb2e0');
    sky.addColorStop(1, '#18212e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawTrack(track);

    const sorted = [...cars].sort((a, b) => {
      const da = (a.position.x - this.camera.x) ** 2 + (a.position.z - this.camera.z) ** 2;
      const db = (b.position.x - this.camera.x) ** 2 + (b.position.z - this.camera.z) ** 2;
      return db - da;
    });

    sorted.forEach((car) => this.drawCar(car));
  }

  drawTrack(track) {
    const { ctx } = this;
    for (let i = 0; i < track.waypoints.length; i += 1) {
      const a = track.waypoints[i];
      const b = track.waypoints[(i + 1) % track.waypoints.length];
      this.drawRoadSegment(a, b, track.roadHalfWidth, '#40454d', '#c8d2df');
    }

    this.drawLine(track.finishLine.a, track.finishLine.b, '#ffffff', 5);
  }

  drawRoadSegment(a, b, halfWidth, color, lineColor) {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = (-dz / len) * halfWidth;
    const nz = (dx / len) * halfWidth;

    const p1 = this.worldToScreen(a.x + nx, 0, a.z + nz);
    const p2 = this.worldToScreen(a.x - nx, 0, a.z - nz);
    const p3 = this.worldToScreen(b.x - nx, 0, b.z - nz);
    const p4 = this.worldToScreen(b.x + nx, 0, b.z + nz);

    if (!p1 || !p2 || !p3 || !p4) return;

    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    this.drawLine({ x: a.x + nx, z: a.z + nz }, { x: b.x + nx, z: b.z + nz }, lineColor, 2);
    this.drawLine({ x: a.x - nx, z: a.z - nz }, { x: b.x - nx, z: b.z - nz }, lineColor, 2);
  }

  drawLine(a, b, color, width) {
    const p1 = this.worldToScreen(a.x, 0.02, a.z);
    const p2 = this.worldToScreen(b.x, 0.02, b.z);
    if (!p1 || !p2) return;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.stroke();
  }

  drawCar(car) {
    const halfW = 0.95;
    const halfL = 2.2;
    const h = 1.15;
    const sin = Math.sin(car.heading);
    const cos = Math.cos(car.heading);

    const corners = [
      { x: -halfW, z: -halfL },
      { x: halfW, z: -halfL },
      { x: halfW, z: halfL },
      { x: -halfW, z: halfL },
    ].map((c) => ({
      x: car.position.x + c.x * cos + c.z * sin,
      z: car.position.z + c.z * cos - c.x * sin,
    }));

    const base = corners.map((c) => this.worldToScreen(c.x, 0.05 + car.pitch, c.z));
    const top = corners.map((c) => this.worldToScreen(c.x, h + car.roll, c.z));

    if (base.some((p) => !p) || top.some((p) => !p)) return;
    const { ctx } = this;

    ctx.fillStyle = car.config.color;
    ctx.beginPath();
    top.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(15,18,22,0.75)';
    for (let i = 0; i < 4; i += 1) {
      const j = (i + 1) % 4;
      ctx.beginPath();
      ctx.moveTo(base[i].x, base[i].y);
      ctx.lineTo(base[j].x, base[j].y);
      ctx.lineTo(top[j].x, top[j].y);
      ctx.lineTo(top[i].x, top[i].y);
      ctx.closePath();
      ctx.fill();
    }
  }
}
