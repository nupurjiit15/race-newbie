export function createTrack() {
  const waypoints = [
    { x: 0, z: 140 },
    { x: 130, z: 40 },
    { x: 95, z: -130 },
    { x: -90, z: -120 },
    { x: -140, z: 35 },
  ];

  return {
    waypoints,
    roadHalfWidth: 26,
    lapLength: 760,
    finishLine: { a: { x: -14, z: 132 }, b: { x: 14, z: 132 } },
  };
}

export function closestSegmentPoint(p, a, b) {
  const abx = b.x - a.x;
  const abz = b.z - a.z;
  const apx = p.x - a.x;
  const apz = p.z - a.z;
  const abLen2 = abx * abx + abz * abz;
  const t = Math.max(0, Math.min(1, (apx * abx + apz * abz) / abLen2));
  return { x: a.x + abx * t, z: a.z + abz * t, t };
}

export function enforceTrackBounds(car, track) {
  let minDist = Infinity;
  let closest = null;

  for (let i = 0; i < track.waypoints.length; i += 1) {
    const a = track.waypoints[i];
    const b = track.waypoints[(i + 1) % track.waypoints.length];
    const c = closestSegmentPoint(car.position, a, b);
    const dx = car.position.x - c.x;
    const dz = car.position.z - c.z;
    const d = Math.hypot(dx, dz);

    if (d < minDist) {
      minDist = d;
      closest = c;
    }
  }

  if (minDist > track.roadHalfWidth && closest) {
    const dx = car.position.x - closest.x;
    const dz = car.position.z - closest.z;
    const len = Math.max(0.001, Math.hypot(dx, dz));
    car.position.x = closest.x + (dx / len) * track.roadHalfWidth;
    car.position.z = closest.z + (dz / len) * track.roadHalfWidth;
    car.speedMps *= 0.72;
  }
}
