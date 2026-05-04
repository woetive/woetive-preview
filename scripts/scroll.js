import * as THREE from 'three';

// ONE continuous camera path. The user scrolls the page = the camera flies
// through a 3D world from z=0 to z=-122. Each waypoint defines camera +
// model + particles + lighting + bg state. Everything interpolates smoothly.

const PATH = [
  // p, camera pos, lookAt, fov, bg, model {pos, rot.y, scale}, particle opacity, lime intensity
  // Hero — close portrait: face + chest, figure right side. ~65% closer than before.
  { p: 0.000, pos: [ 0.85, 1.85,   0.50], look: [ 0.45, 2.00,  -2.20], fov: 32, bg: '#050505', mp: [ 1.05, -0.95,  -2.20], mr: -0.18, ms: 1.95, pa: 0.38, li: 1.15 },
  { p: 0.075, pos: [ 0.70, 1.95,   0.10], look: [ 0.50, 2.10,  -2.20], fov: 30, bg: '#050505', mp: [ 0.85, -0.85,  -2.20], mr: -0.10, ms: 2.05, pa: 0.32, li: 1.20 },

  { p: 0.105, pos: [ 0.60, 1.75,  -8.50], look: [ 0.85, 1.30, -12.10], fov: 32, bg: '#050505', mp: [-0.50, -0.90, -12.00], mr: 0.18, ms: 2.10, pa: 0.12, li: 1.35 },
  { p: 0.165, pos: [ 0.60, 1.75,  -8.50], look: [ 0.85, 1.30, -12.10], fov: 32, bg: '#050505', mp: [-0.50, -0.90, -12.00], mr: 0.18, ms: 2.10, pa: 0.12, li: 1.35 },

  { p: 0.250, pos: [ 0.12, 1.42, -20.65], look: [ 0.28, 0.95, -22.00], fov: 26, bg: '#050505', mp: [ 0.58, -0.80, -22.00], mr:  0.02, ms: 3.20, pa: 0.03, li: 1.55 },

  // Camera enters off-white "gallery room" — bg lerps over this segment
  { p: 0.330, pos: [ 0.40, 1.25, -27.60], look: [ 0.25, 0.85, -31.50], fov: 36, bg: '#F4F3EE', mp: [ 2.35, -1.10, -32.80], mr: -0.72, ms: 1.85, pa: 0.00, li: 0.75 },
  { p: 0.420, pos: [ 0.20, 1.05, -29.00], look: [ 0.20, 0.70, -31.80], fov: 40, bg: '#F4F3EE', mp: [ 2.35, -1.10, -32.80], mr: -0.72, ms: 1.85, pa: 0.00, li: 0.75 },

  // Back to dark for method interlude
  { p: 0.500, pos: [ 0.65, 1.25, -42.90], look: [ 0.45, 0.85, -45.20], fov: 29, bg: '#050505', mp: [ 0.85, -0.95, -45.20], mr: -0.35, ms: 2.65, pa: 0.10, li: 1.20 },

  // Method steps — 4 sub-waypoints. Camera descends from head to torso while
  // the model slowly rotates. Big-number plane (lime) sits behind the figure
  // and swaps 01 → 04 as the user scrolls each step.
  { p: 0.535, pos: [ 0.10, 2.40, -52.50], look: [ 0.00, 2.30, -55.00], fov: 32, bg: '#050505', mp: [ 0.00, -1.00, -55.00], mr:  0.00, ms: 2.10, pa: 0.05, li: 0.85 },
  { p: 0.575, pos: [ 0.10, 2.00, -52.50], look: [ 0.00, 1.80, -55.00], fov: 32, bg: '#050505', mp: [ 0.00, -1.00, -55.00], mr:  0.18, ms: 2.10, pa: 0.05, li: 0.85 },
  { p: 0.615, pos: [ 0.10, 1.55, -52.50], look: [ 0.00, 1.25, -55.00], fov: 32, bg: '#050505', mp: [ 0.00, -1.00, -55.00], mr:  0.32, ms: 2.10, pa: 0.05, li: 0.85 },
  { p: 0.655, pos: [ 0.10, 1.15, -52.50], look: [ 0.00, 0.85, -55.00], fov: 32, bg: '#050505', mp: [ 0.00, -1.00, -55.00], mr:  0.45, ms: 2.10, pa: 0.05, li: 0.85 },

  // Trust ribbon (no model, fade out lime)
  { p: 0.700, pos: [ 0,    1.00, -64.50], look: [ 0,    0.25, -67.00], fov: 42, bg: '#F4F3EE', mp: [ 1.45, -1.00, -75.00], mr:  0.35, ms: 2.05, pa: 0.00, li: 0.00 },

  // Why bento
  { p: 0.780, pos: [ 0.15, 1.05, -73.50], look: [ 0.10, 0.05, -76.80], fov: 38, bg: '#F4F3EE', mp: [ 2.55, -1.10, -78.00], mr: -0.55, ms: 1.85, pa: 0.00, li: 0.35 },

  // Testimonials (warm white, no model in frame)
  { p: 0.850, pos: [ 0,    0.95, -88.80], look: [ 0,    0.05, -91.40], fov: 40, bg: '#FAF9F4', mp: [ 3.50, -1.10, -90.00], mr: -0.55, ms: 1.85, pa: 0.00, li: 0.00 },

  // Founders return
  { p: 0.920, pos: [ 0.50, 1.25, -99.40], look: [ 0.55, 0.65,-102.00], fov: 36, bg: '#F4F3EE', mp: [ 1.40, -1.00,-102.50], mr: -0.18, ms: 2.10, pa: 0.10, li: 0.85 },

  // Contact climax — back to dark, lime peak
  { p: 0.970, pos: [ 0,    1.45,-111.65], look: [ 0.22, 1.05,-114.00], fov: 31, bg: '#050505', mp: [ 0.75, -0.95,-114.00], mr: -0.05, ms: 2.45, pa: 0.22, li: 1.65 },

  // Footer
  { p: 1.000, pos: [ 0,    0.85,-122.50], look: [ 0,    0.35,-124.50], fov: 42, bg: '#050505', mp: [ 3.50, -1.00,-130.00], mr: -0.05, ms: 1.00, pa: 0.00, li: 0.00 },
];

const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function lerpHex(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  return '#'
    + Math.round(lerp(ar, br, t)).toString(16).padStart(2, '0')
    + Math.round(lerp(ag, bg, t)).toString(16).padStart(2, '0')
    + Math.round(lerp(ab, bb, t)).toString(16).padStart(2, '0');
}

function stateAt(p) {
  if (p <= 0) return PATH[0];
  if (p >= 1) return PATH[PATH.length - 1];
  let i = 0;
  while (i < PATH.length - 1 && PATH[i + 1].p < p) i++;
  const a = PATH[i], b = PATH[i + 1];
  if (!b) return a;
  const u = (p - a.p) / (b.p - a.p);
  const e = easeInOut(u);
  return {
    pos:  [lerp(a.pos[0],  b.pos[0],  e), lerp(a.pos[1],  b.pos[1],  e), lerp(a.pos[2],  b.pos[2],  e)],
    look: [lerp(a.look[0], b.look[0], e), lerp(a.look[1], b.look[1], e), lerp(a.look[2], b.look[2], e)],
    fov:  lerp(a.fov, b.fov, e),
    bg:   lerpHex(a.bg, b.bg, e),
    mp:   [lerp(a.mp[0],   b.mp[0],   e), lerp(a.mp[1],   b.mp[1],   e), lerp(a.mp[2],   b.mp[2],   e)],
    mr:   lerp(a.mr, b.mr, e),
    ms:   lerp(a.ms, b.ms, e),
    pa:   lerp(a.pa, b.pa, e),
    li:   lerp(a.li, b.li, e),
  };
}

// Method zone — bracketed by waypoint p values; the big number is visible
// only between these bounds. The digit 01..04 itself is decided by an
// IntersectionObserver in main.js (matched to actual step blocks in DOM).
const METHOD_START = 0.510;
const METHOD_END   = 0.680;

export function initInfiniteCamera({ scene, camera, figureGroup, particles, bigNumber, limeMaterial, renderer }) {
  // Damped state — actual values lerp toward target each frame to feel cinematic
  const target = { pos: [0, 0, 0], look: [0, 0, 0], fov: 35, bg: '#050505', mp: [0, 0, 0], mr: 0, ms: 1, pa: 0.4, li: 1.15 };
  const cur    = { pos: [0, 0, 0], look: [0, 0, 0], fov: 35,                  mp: [0, 0, 0], mr: 0, ms: 1, pa: 0.4, li: 1.15 };

  const sceneBgColor = new THREE.Color('#050505');
  const tmpColor = new THREE.Color();

  function read() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
  }

  function poll() {
    const s = stateAt(read());
    target.pos[0] = s.pos[0]; target.pos[1] = s.pos[1]; target.pos[2] = s.pos[2];
    target.look[0] = s.look[0]; target.look[1] = s.look[1]; target.look[2] = s.look[2];
    target.fov = s.fov; target.bg = s.bg;
    target.mp[0] = s.mp[0]; target.mp[1] = s.mp[1]; target.mp[2] = s.mp[2];
    target.mr = s.mr; target.ms = s.ms; target.pa = s.pa; target.li = s.li;
  }

  // Damping factors (per brief recommendation)
  const D_CAM = 0.085;
  const D_LOOK = 0.10;
  const D_MODEL = 0.09;
  const D_PARTICLE = 0.06;

  function tick() {
    poll();

    // Camera position + look + fov
    cur.pos[0]  += (target.pos[0]  - cur.pos[0])  * D_CAM;
    cur.pos[1]  += (target.pos[1]  - cur.pos[1])  * D_CAM;
    cur.pos[2]  += (target.pos[2]  - cur.pos[2])  * D_CAM;
    cur.look[0] += (target.look[0] - cur.look[0]) * D_LOOK;
    cur.look[1] += (target.look[1] - cur.look[1]) * D_LOOK;
    cur.look[2] += (target.look[2] - cur.look[2]) * D_LOOK;
    cur.fov     += (target.fov     - cur.fov)     * 0.1;
    camera.position.set(cur.pos[0], cur.pos[1], cur.pos[2]);
    camera.lookAt(cur.look[0], cur.look[1], cur.look[2]);
    if (Math.abs(cur.fov - camera.fov) > 0.01) {
      camera.fov = cur.fov;
      camera.updateProjectionMatrix();
    }

    // Model position/rot/scale (mouse rotation is added in main.js render loop on top of this base rotation)
    if (figureGroup) {
      cur.mp[0] += (target.mp[0] - cur.mp[0]) * D_MODEL;
      cur.mp[1] += (target.mp[1] - cur.mp[1]) * D_MODEL;
      cur.mp[2] += (target.mp[2] - cur.mp[2]) * D_MODEL;
      cur.mr    += (target.mr    - cur.mr)    * D_MODEL;
      cur.ms    += (target.ms    - cur.ms)    * D_MODEL;
      figureGroup.position.set(cur.mp[0], cur.mp[1], cur.mp[2]);
      figureGroup.userData.baseRotY = cur.mr;     // main.js reads this for breath/mouse rot offset
      figureGroup.scale.setScalar(cur.ms);
    }

    // Particles
    if (particles) {
      cur.pa += (target.pa - cur.pa) * D_PARTICLE;
      particles.setOpacity(cur.pa);
      // Move the particle cloud with the figure (slight z-back offset)
      particles.setPosition(cur.mp[0] - 1.0, cur.mp[1] + 1.4, cur.mp[2] - 1.2);
    }

    // Lime emissive
    if (limeMaterial) {
      cur.li += (target.li - cur.li) * 0.08;
      limeMaterial.emissiveIntensity = cur.li;
    }

    // Big number plane — visible only in the Method zone. Position + opacity
    // driven here; the digit text itself (01..04) is set by an
    // IntersectionObserver in main.js so it aligns with the actual step
    // block currently in the viewport.
    if (bigNumber) {
      const p = read();
      if (p >= METHOD_START && p <= METHOD_END) {
        bigNumber.setPosition(cur.mp[0], cur.mp[1] + 2.05, cur.mp[2] - 2.8);
        const edgeFade = Math.min(1,
          Math.min((p - METHOD_START) / 0.025, (METHOD_END - p) / 0.025)
        );
        bigNumber.setOpacity(0.78 * Math.max(0, edgeFade));
      } else {
        bigNumber.setOpacity(0);
      }
    }

    // Background color (scene + body bg sync)
    tmpColor.set(target.bg);
    sceneBgColor.lerp(tmpColor, 0.06);
    scene.background = sceneBgColor;
    document.body.style.backgroundColor = `rgb(${Math.round(sceneBgColor.r * 255)}, ${Math.round(sceneBgColor.g * 255)}, ${Math.round(sceneBgColor.b * 255)})`;
    if (renderer) renderer.setClearColor(sceneBgColor, 1);

    // Theme inversion — when bg luminance crosses a threshold, flip text color tokens
    const lum = sceneBgColor.r * 0.299 + sceneBgColor.g * 0.587 + sceneBgColor.b * 0.114;
    document.documentElement.dataset.theme = lum > 0.5 ? 'light' : 'dark';

    requestAnimationFrame(tick);
  }
  tick();

  return { stateAt, read };
}
