import * as THREE from 'three';

// Big lime number rendered as a CanvasTexture on a 3D plane. Lives in the
// scene behind the figure so the depth-sort puts the humanoid in front.
//
// Used in the Method section: as the user scrolls each of the 4 steps,
// setNumber('01' .. '04') swaps the digit on the texture; setOpacity
// fades it in/out at the zone boundaries.

export function createBigNumber(scene) {
  const cv = document.createElement('canvas');
  cv.width = 1024;
  cv.height = 1024;
  const ctx = cv.getContext('2d');

  let currentText = '';
  function drawNumber(text) {
    if (text === currentText) return;
    currentText = text;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#D0EF00';
    // Tightened weight + tracking for clean editorial look
    ctx.font = 'bold 800px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cv.width / 2, cv.height / 2 + 40);
  }
  drawNumber('01');

  const texture = new THREE.CanvasTexture(cv);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    toneMapped: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), mat);
  mesh.position.set(0, 1.4, -200);   // far away by default; scroll places it
  mesh.renderOrder = -1;             // draw before figure so it's behind
  scene.add(mesh);

  return {
    mesh,
    setNumber(text) {
      drawNumber(text);
      texture.needsUpdate = true;
    },
    setOpacity(v) { mat.opacity = Math.max(0, Math.min(1, v)); },
    setPosition(x, y, z) { mesh.position.set(x, y, z); },
  };
}
