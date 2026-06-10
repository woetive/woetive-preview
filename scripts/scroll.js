import * as THREE from 'three';

// ONE continuous camera path through a 3D world. The user scrolls = the camera
// flies. Each waypoint references a DOM element (`sel`) and a relative position
// within it (`rp`, 0–1). At init and on resize we compute each waypoint's
// absolute scroll progress `_p` from the element's real position, so the path
// stays in sync no matter how section heights change (Phase 2.4 refactor).
//
// Camera values (pos/look/fov/bg/model/particles/lime) stay hand-tuned — only
// the mapping onto scroll progress is automated.

const PATH = [
  // sel, rp, camera pos, lookAt, fov, bg, model {pos, rot.y, scale}, particle opacity, lime intensity

  // Hero — close portrait: face + chest, figure right side.
  { sel: '#hero', rp: 0.00, pos: [ 0.85, 1.85,   0.50], look: [ 0.45, 2.00,  -2.20], fov: 32, bg: '#050505', mp: [ 1.05, -0.95,  -2.20], mr: -0.18, ms: 1.95, pa: 0.38, li: 1.15 },
  { sel: '#hero', rp: 0.65, pos: [ 0.70, 1.95,   0.10], look: [ 0.50, 2.10,  -2.20], fov: 30, bg: '#050505', mp: [ 0.85, -0.85,  -2.20], mr: -0.10, ms: 2.05, pa: 0.32, li: 1.20 },

  // Manifesto — figure on LEFT, text on right. Arrive early, hold.
  { sel: '#manifesto', rp: 0.20, pos: [ 0.60, 1.75,  -8.50], look: [ 0.85, 1.30, -12.10], fov: 32, bg: '#050505', mp: [-0.50, -0.90, -12.00], mr: 0.18, ms: 2.10, pa: 0.12, li: 1.35 },
  { sel: '#manifesto', rp: 0.85, pos: [ 0.60, 1.75,  -8.50], look: [ 0.85, 1.30, -12.10], fov: 32, bg: '#050505', mp: [-0.50, -0.90, -12.00], mr: 0.18, ms: 2.10, pa: 0.12, li: 1.35 },

  // Close-up interlude
  { sel: '#closeup', rp: 0.50, pos: [ 0.12, 1.42, -20.65], look: [ 0.28, 0.95, -22.00], fov: 26, bg: '#050505', mp: [ 0.58, -0.80, -22.00], mr:  0.02, ms: 3.20, pa: 0.03, li: 1.55 },

  // Work — gallery, light room
  { sel: '#work', rp: 0.25, pos: [ 0.40, 1.25, -27.60], look: [ 0.25, 0.85, -31.50], fov: 36, bg: '#F4F3EE', mp: [ 2.35, -1.10, -32.80], mr: -0.72, ms: 1.85, pa: 0.00, li: 0.75 },
  { sel: '#work', rp: 0.80, pos: [ 0.20, 1.05, -29.00], look: [ 0.20, 0.70, -31.80], fov: 40, bg: '#F4F3EE', mp: [ 2.35, -1.10, -32.80], mr: -0.72, ms: 1.85, pa: 0.00, li: 0.75 },

  // Services (NEW) — stays light, camera continues descent, figure pushed right
  { sel: '#services', rp: 0.30, pos: [ 0.35, 1.18, -34.40], look: [ 0.20, 0.70, -38.00], fov: 38, bg: '#F4F3EE', mp: [ 2.45, -1.10, -39.00], mr: -0.60, ms: 1.85, pa: 0.00, li: 0.40 },
  { sel: '#services', rp: 0.75, pos: [ 0.30, 1.10, -35.80], look: [ 0.18, 0.55, -39.20], fov: 40, bg: '#F4F3EE', mp: [ 2.45, -1.10, -39.00], mr: -0.60, ms: 1.85, pa: 0.00, li: 0.40 },

  // Method interlude — back to dark
  { sel: '#method-interlude', rp: 0.50, pos: [ 0.65, 1.25, -42.90], look: [ 0.45, 0.85, -45.20], fov: 29, bg: '#050505', mp: [ 0.85, -0.95, -45.20], mr: -0.35, ms: 2.65, pa: 0.10, li: 1.20 },

  // Method header — WHITE bg under "Ako vedieme."
  { sel: '.method__header', rp: 0.50, pos: [ 0.10, 1.50, -50.00], look: [ 0.00, 1.20, -55.00], fov: 36, bg: '#F4F3EE', mp: [ 0.00, -1.00, -55.00], mr:  0.00, ms: 2.10, pa: 0.00, li: 0.40 },

  // Method steps — dark. Fixed framing, only model rotation increments.
  { sel: '.method__step[data-step="1"]', rp: 0.50, pos: [ 0.10, 1.60, -51.50], look: [ 0.00, 1.30, -55.00], fov: 32, bg: '#050505', mp: [ 0.00, -1.00, -55.00], mr: 0.00, ms: 2.10, pa: 0.05, li: 0.85 },
  { sel: '.method__step[data-step="2"]', rp: 0.50, pos: [ 0.10, 1.60, -51.50], look: [ 0.00, 1.30, -55.00], fov: 32, bg: '#050505', mp: [ 0.00, -1.00, -55.00], mr: 0.15, ms: 2.10, pa: 0.05, li: 0.85 },
  { sel: '.method__step[data-step="3"]', rp: 0.50, pos: [ 0.10, 1.60, -51.50], look: [ 0.00, 1.30, -55.00], fov: 32, bg: '#050505', mp: [ 0.00, -1.00, -55.00], mr: 0.30, ms: 2.10, pa: 0.05, li: 0.85 },
  { sel: '.method__step[data-step="4"]', rp: 0.50, pos: [ 0.10, 1.60, -51.50], look: [ 0.00, 1.30, -55.00], fov: 32, bg: '#050505', mp: [ 0.00, -1.00, -55.00], mr: 0.45, ms: 2.10, pa: 0.05, li: 0.85 },

  // Trust ribbon — light, no figure
  { sel: '#trust', rp: 0.50, pos: [ 0,    1.00, -64.50], look: [ 0,    0.25, -67.00], fov: 42, bg: '#F4F3EE', mp: [ 1.45, -1.00, -75.00], mr:  0.35, ms: 2.05, pa: 0.00, li: 0.00 },

  // Why bento — light
  { sel: '#why', rp: 0.50, pos: [ 0.15, 1.05, -73.50], look: [ 0.10, 0.05, -76.80], fov: 38, bg: '#F4F3EE', mp: [ 2.55, -1.10, -78.00], mr: -0.55, ms: 1.85, pa: 0.00, li: 0.35 },

  // Testimonials — warm white
  { sel: '#testimonials', rp: 0.50, pos: [ 0,    0.95, -88.80], look: [ 0,    0.05, -91.40], fov: 40, bg: '#FAF9F4', mp: [ 3.50, -1.10, -90.00], mr: -0.55, ms: 1.85, pa: 0.00, li: 0.00 },

  // Founders — light
  { sel: '#founders', rp: 0.50, pos: [ 0.50, 1.25, -99.40], look: [ 0.55, 0.65,-102.00], fov: 36, bg: '#F4F3EE', mp: [ 1.40, -1.00,-102.50], mr: -0.18, ms: 2.10, pa: 0.10, li: 0.85 },

  // Contact — back to dark, lime peak
  { sel: '#contact', rp: 0.50, pos: [ 0,    1.45,-111.65], look: [ 0.22, 1.05,-114.00], fov: 31, bg: '#050505', mp: [ 0.75, -0.95,-114.00], mr: -0.05, ms: 2.45, pa: 0.22, li: 1.65 },

  // Footer — dark, figure leaves
  { sel: '.footer', rp: 0.40, pos: [ 0,    0.85,-122.50], look: [ 0,    0.35,-124.50], fov: 42, bg: '#050505', mp: [ 3.50, -1.00,-130.00], mr: -0.05, ms: 1.00, pa: 0.00, li: 0.00 },
];

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function lerpHex(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  return '#'
    + Math.round(lerp(ar, br, t)).toString(16).padStart(2, '0')
    + Math.round(lerp(ag, bg, t)).toString(16).padStart(2, '0')
    + Math.round(lerp(ab, bb, t)).toString(16).padStart(2, '0');
}

// Method zone bracket (for the big-number plane visibility) — recomputed in resolve()
let METHOD_START = 0.35;
let METHOD_END   = 0.62;

// Resolve every waypoint's absolute scroll progress from the DOM.
function resolvePaths() {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  for (const w of PATH) {
    const el = document.querySelector(w.sel);
    if (!el) { w._p = w._p ?? 0; continue; }
    const absTop = el.getBoundingClientRect().top + window.scrollY;
    const y = absTop + w.rp * el.offsetHeight;
    w._p = clamp01(y / maxScroll);
  }
  PATH.sort((a, b) => a._p - b._p);

  // Method bracket: from top of step 1 to bottom of step 4
  const s1 = document.querySelector('.method__step[data-step="1"]');
  const s4 = document.querySelector('.method__step[data-step="4"]');
  if (s1 && s4) {
    const top1 = s1.getBoundingClientRect().top + window.scrollY;
    const bot4 = s4.getBoundingClientRect().top + window.scrollY + s4.offsetHeight;
    METHOD_START = clamp01(top1 / maxScroll);
    METHOD_END   = clamp01(bot4 / maxScroll);
  }
}

function stateAt(p) {
  if (p <= PATH[0]._p) return PATH[0];
  if (p >= PATH[PATH.length - 1]._p) return PATH[PATH.length - 1];
  let i = 0;
  while (i < PATH.length - 1 && PATH[i + 1]._p < p) i++;
  const a = PATH[i], b = PATH[i + 1];
  if (!b) return a;
  const span = (b._p - a._p) || 1;
  const u = (p - a._p) / span;
  const e = easeInOut(clamp01(u));
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

export function initInfiniteCamera({ scene, camera, figureGroup, particles, bigNumber, limeMaterial, renderer }) {
  const target = { pos: [0, 0, 0], look: [0, 0, 0], fov: 35, bg: '#050505', mp: [0, 0, 0], mr: 0, ms: 1, pa: 0.4, li: 1.15 };
  const cur    = { pos: [0, 0, 0], look: [0, 0, 0], fov: 35,                  mp: [0, 0, 0], mr: 0, ms: 1, pa: 0.4, li: 1.15 };

  const sceneBgColor = new THREE.Color('#050505');
  const tmpColor = new THREE.Color();

  resolvePaths();
  let resizeTimer = null;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resolvePaths, 120);
  }, { passive: true });
  // Re-resolve once fonts/images settle (layout can shift)
  addEventListener('load', () => setTimeout(resolvePaths, 200));
  setTimeout(resolvePaths, 600);

  function read() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? clamp01(window.scrollY / max) : 0;
  }

  function poll() {
    const s = stateAt(read());
    target.pos[0] = s.pos[0]; target.pos[1] = s.pos[1]; target.pos[2] = s.pos[2];
    target.look[0] = s.look[0]; target.look[1] = s.look[1]; target.look[2] = s.look[2];
    target.fov = s.fov; target.bg = s.bg;
    target.mp[0] = s.mp[0]; target.mp[1] = s.mp[1]; target.mp[2] = s.mp[2];
    target.mr = s.mr; target.ms = s.ms; target.pa = s.pa; target.li = s.li;
  }

  const D_CAM = 0.085, D_LOOK = 0.10, D_MODEL = 0.09, D_PARTICLE = 0.06;

  function tick() {
    poll();

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

    if (figureGroup) {
      cur.mp[0] += (target.mp[0] - cur.mp[0]) * D_MODEL;
      cur.mp[1] += (target.mp[1] - cur.mp[1]) * D_MODEL;
      cur.mp[2] += (target.mp[2] - cur.mp[2]) * D_MODEL;
      cur.mr    += (target.mr    - cur.mr)    * D_MODEL;
      cur.ms    += (target.ms    - cur.ms)    * D_MODEL;
      figureGroup.position.set(cur.mp[0], cur.mp[1], cur.mp[2]);
      figureGroup.userData.baseRotY = cur.mr;
      figureGroup.scale.setScalar(cur.ms);
    }

    if (particles) {
      cur.pa += (target.pa - cur.pa) * D_PARTICLE;
      particles.setOpacity(cur.pa);
      particles.setPosition(cur.mp[0] - 1.0, cur.mp[1] + 1.4, cur.mp[2] - 1.2);
    }

    if (limeMaterial) {
      cur.li += (target.li - cur.li) * 0.08;
      limeMaterial.emissiveIntensity = cur.li;
    }

    // Big number plane — visible only in the Method zone. Digit set by
    // IntersectionObserver in main.js.
    if (bigNumber) {
      const p = read();
      if (p >= METHOD_START && p <= METHOD_END) {
        bigNumber.setPosition(cur.mp[0], cur.mp[1] + 2.05, cur.mp[2] - 2.8);
        const fadeSpan = Math.max(0.012, (METHOD_END - METHOD_START) * 0.08);
        const edgeFade = Math.min(1, Math.min((p - METHOD_START) / fadeSpan, (METHOD_END - p) / fadeSpan));
        bigNumber.setOpacity(0.78 * Math.max(0, edgeFade));
      } else {
        bigNumber.setOpacity(0);
      }
    }

    tmpColor.set(target.bg);
    sceneBgColor.lerp(tmpColor, 0.06);
    scene.background = sceneBgColor;
    document.body.style.backgroundColor = `rgb(${Math.round(sceneBgColor.r * 255)}, ${Math.round(sceneBgColor.g * 255)}, ${Math.round(sceneBgColor.b * 255)})`;
    if (renderer) renderer.setClearColor(sceneBgColor, 1);

    const lum = sceneBgColor.r * 0.299 + sceneBgColor.g * 0.587 + sceneBgColor.b * 0.114;
    document.documentElement.dataset.theme = lum > 0.5 ? 'light' : 'dark';

    requestAnimationFrame(tick);
  }
  tick();

  return { stateAt, read, resolvePaths };
}
