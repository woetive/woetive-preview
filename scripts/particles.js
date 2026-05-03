import * as THREE from 'three';

// AI-sphere / mind-map style background. A sphere of points with thin
// connecting lines between nearby neighbours. GPU-friendly: positions are
// computed once at init, then we only animate the parent group's rotation.
//
// The cloud sits behind the humanoid, slowly rotates on its own, and tilts
// gently toward the cursor.

export function createParticles(scene) {
  const COUNT = 320;
  const RADIUS = 1.55;
  const positions = new Float32Array(COUNT * 3);

  // Fibonacci-sphere distribution for even angular spread, then radial jitter
  // so the cloud feels organic rather than perfectly geometric.
  const golden = Math.PI * (1 + Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / COUNT);
    const theta = golden * i;
    const r = RADIUS * (0.55 + Math.random() * 0.55);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  // ---- Points ----
  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pointsMat = new THREE.PointsMaterial({
    color: 0xF4F3EE,
    size: 0.022,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const points = new THREE.Points(pointsGeo, pointsMat);

  // ---- Connecting lines (mind-map web) ----
  // Static topology computed once: every pair of points within threshold gets
  // a thin additive line. ~few hundred segments — trivial to render.
  const MAX_DIST = 0.46;
  const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
  const lineVerts = [];
  for (let i = 0; i < COUNT; i++) {
    for (let j = i + 1; j < COUNT; j++) {
      const dx = positions[i * 3]     - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < MAX_DIST_SQ) {
        lineVerts.push(positions[i * 3],     positions[i * 3 + 1], positions[i * 3 + 2]);
        lineVerts.push(positions[j * 3],     positions[j * 3 + 1], positions[j * 3 + 2]);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xF4F3EE,
    transparent: true,
    opacity: 0.10,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);

  // ---- Subtle lime accent points (~8%) ----
  const accentCount = Math.floor(COUNT * 0.08);
  const accentPos = new Float32Array(accentCount * 3);
  for (let i = 0; i < accentCount; i++) {
    const idx = Math.floor(Math.random() * COUNT);
    accentPos[i * 3]     = positions[idx * 3];
    accentPos[i * 3 + 1] = positions[idx * 3 + 1];
    accentPos[i * 3 + 2] = positions[idx * 3 + 2];
  }
  const accentGeo = new THREE.BufferGeometry();
  accentGeo.setAttribute('position', new THREE.BufferAttribute(accentPos, 3));
  const accentMat = new THREE.PointsMaterial({
    color: 0xD0EF00,
    size: 0.038,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const accent = new THREE.Points(accentGeo, accentMat);

  // ---- Group + placement behind the figure ----
  const group = new THREE.Group();
  group.add(lines);
  group.add(points);
  group.add(accent);
  group.position.set(-0.30, 1.45, -1.30);
  group.scale.set(1.15, 1.15, 1.15);
  scene.add(group);

  let mx = 0, my = 0, tmx = 0, tmy = 0;

  function setMouse(nx, ny) { tmx = nx; tmy = ny; }

  function update() {
    mx += (tmx - mx) * 0.04;
    my += (tmy - my) * 0.04;
    const t = performance.now() * 0.00012;
    // Slow autonomous rotation + cursor parallax
    group.rotation.y = t * 1.4 + mx * 0.4;
    group.rotation.x = Math.sin(t * 0.7) * 0.12 - my * 0.20;
    // Subtle scale breath
    const breath = 1 + Math.sin(t * 1.6) * 0.012;
    group.scale.set(1.15 * breath, 1.15 * breath, 1.15 * breath);
  }

  function setOpacity(v) {
    pointsMat.opacity = 0.85 * v;
    lineMat.opacity   = 0.10 * v;
    accentMat.opacity = 0.85 * v;
  }

  function setPosition(x, y, z) { group.position.set(x, y, z); }

  return { mesh: group, update, setMouse, setOpacity, setPosition };
}
