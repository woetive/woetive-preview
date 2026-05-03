import * as THREE from 'three';

// Low-poly fluid polys behind the figure: 80 instanced icosahedra drifting on noise,
// gently following the cursor. Each instance has its own seed so the cloud breathes
// rather than moving as one block.

const COUNT = 80;
const RADIUS = 4.5;     // half-width of cloud volume
const RADIUS_Z = 3;
const HEIGHT = 3;
const BASE_SCALE_MIN = 0.04;
const BASE_SCALE_MAX = 0.14;

export function createFluidBackground(scene) {
  const geo = new THREE.IcosahedronGeometry(1, 0); // 12 verts
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xE8E8E5,
    roughness: 0.5,
    metalness: 0.05,
    clearcoat: 0.4,
    clearcoatRoughness: 0.6,
    transparent: true,
    opacity: 0.55,
    sheen: 0.6,
    sheenColor: new THREE.Color(0xD0EF00),
    sheenRoughness: 0.7,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  mesh.position.z = -2.5; // sit behind the figure

  const seeds = new Float32Array(COUNT * 4);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < COUNT; i++) {
    const x = (Math.random() - 0.5) * 2 * RADIUS;
    const y = Math.random() * HEIGHT + 0.2;
    const z = -(Math.random() * RADIUS_Z + 0.5);
    const s = BASE_SCALE_MIN + Math.random() * (BASE_SCALE_MAX - BASE_SCALE_MIN);
    seeds[i * 4 + 0] = x;
    seeds[i * 4 + 1] = y;
    seeds[i * 4 + 2] = z;
    seeds[i * 4 + 3] = s;
    dummy.position.set(x, y, z);
    dummy.scale.setScalar(s);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;

  scene.add(mesh);

  const state = { mouseX: 0, mouseY: 0, targetMouseX: 0, targetMouseY: 0 };
  const tmp = new THREE.Object3D();

  function update(dt) {
    state.mouseX += (state.targetMouseX - state.mouseX) * 0.04;
    state.mouseY += (state.targetMouseY - state.mouseY) * 0.04;
    const t = performance.now() * 0.0004;
    for (let i = 0; i < COUNT; i++) {
      const sx = seeds[i * 4 + 0];
      const sy = seeds[i * 4 + 1];
      const sz = seeds[i * 4 + 2];
      const ss = seeds[i * 4 + 3];
      const phase = i * 0.21;
      const dx = Math.sin(t + phase) * 0.18 + state.mouseX * 0.4;
      const dy = Math.cos(t * 0.8 + phase * 1.3) * 0.12 - state.mouseY * 0.25;
      const dz = Math.sin(t * 0.6 + phase * 0.7) * 0.10;
      tmp.position.set(sx + dx, sy + dy, sz + dz);
      tmp.scale.setScalar(ss * (1 + Math.sin(t * 1.2 + phase) * 0.18));
      tmp.rotation.x = t + phase;
      tmp.rotation.y = t * 0.7 + phase;
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  function setMouse(nx, ny) {
    state.targetMouseX = nx;
    state.targetMouseY = ny;
  }

  return { mesh, update, setMouse };
}
