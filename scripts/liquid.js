import * as THREE from 'three';

// Large amorphous black-glass / obsidian membrane behind the humanoid.
// Per brief: tactile, expensive, slow, organic — never sci-fi.
// Implementation: high-poly icosahedron with per-frame vertex displacement
// driven by layered sin/cos noise. Material is PBR glass with transmission
// + clearcoat for the wet membrane look.

export function createLiquid(scene) {
  const geo = new THREE.IcosahedronGeometry(1, 4);   // ~640 verts, 1280 tris
  const basePos = new Float32Array(geo.attributes.position.array);

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x080808,
    roughness: 0.18,
    metalness: 0.18,
    transmission: 0.18,
    thickness: 1.6,
    ior: 1.45,
    clearcoat: 1.0,
    clearcoatRoughness: 0.10,
    envMapIntensity: 2.4,
    side: THREE.DoubleSide,
    transparent: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(-0.45, 1.30, -1.55);
  mesh.scale.set(2.6, 1.05, 0.65);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  scene.add(mesh);

  let mx = 0, my = 0, tmx = 0, tmy = 0;

  function setMouse(nx, ny) { tmx = nx; tmy = ny; }

  function update() {
    mx += (tmx - mx) * 0.04;
    my += (tmy - my) * 0.04;
    const t = performance.now() * 0.00045;
    const pos = geo.attributes.position.array;
    const mxBoost = 0.06 * mx;
    const myBoost = 0.04 * my;
    for (let i = 0; i < pos.length; i += 3) {
      const bx = basePos[i], by = basePos[i + 1], bz = basePos[i + 2];
      const len = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
      const nx = bx / len, ny = by / len, nz = bz / len;
      const noise =
        Math.sin(bx * 2.3 + t * 1.05) * 0.10 +
        Math.cos(by * 3.0 + t * 0.72) * 0.08 +
        Math.sin(bz * 1.7 + t * 0.88) * 0.07 +
        Math.cos(bx * 1.2 - by * 1.5 + t * 0.55) * 0.05 +
        nx * mxBoost + ny * myBoost;
      pos[i]     = bx + nx * noise;
      pos[i + 1] = by + ny * noise;
      pos[i + 2] = bz + nz * noise;
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  }

  function setPosition(x, y, z) { mesh.position.set(x, y, z); }
  function setScale(sx, sy, sz) { mesh.scale.set(sx, sy, sz); }
  function setOpacity(v) {
    mat.transparent = v < 1;
    mat.opacity = v;
  }

  return { mesh, update, setMouse, setPosition, setScale, setOpacity };
}
