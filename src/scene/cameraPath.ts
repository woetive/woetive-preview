// Hero-only camera path. Below the Hero zone the canvas fades out and HTML
// sections take over, so we don't need the long Z=-130 traversal anymore.

export type Waypoint = {
  p: number;                              // global scroll progress 0..1
  pos:  [number, number, number];
  look: [number, number, number];
  fov:  number;
  bg:   string;
  mp:   [number, number, number];          // model position
  mr:   number;                            // model rotation Y
  ms:   number;                            // model scale
  pa:   number;                            // particle opacity
  li:   number;                            // lime emissive intensity
};

// Hero zone occupies first ~7% of total scroll (roughly the first 100vh).
// Camera does a slow push-in + slight slide right while user scrolls Hero.
export const PATH: Waypoint[] = [
  { p: 0.000, pos: [ 0.55, 1.25,  4.80], look: [ 0.05, 0.85, -2.00], fov: 38, bg: '#050505', mp: [ 1.05, -0.95, -2.20], mr: -0.18, ms: 1.95, pa: 0.38, li: 1.15 },
  { p: 0.070, pos: [ 0.10, 1.45,  3.15], look: [ 0.35, 1.10, -2.15], fov: 34, bg: '#050505', mp: [ 0.85, -0.85, -2.20], mr: -0.10, ms: 2.05, pa: 0.32, li: 1.20 },
  // Past Hero — held at last keyframe; canvas opacity handles the fade-out
  { p: 1.000, pos: [ 0.10, 1.45,  3.15], look: [ 0.35, 1.10, -2.15], fov: 34, bg: '#050505', mp: [ 0.85, -0.85, -2.20], mr: -0.10, ms: 2.05, pa: 0.32, li: 1.20 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function lerpHex(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  const hex = (v: number) => Math.round(v).toString(16).padStart(2, '0');
  return '#' + hex(lerp(ar, br, t)) + hex(lerp(ag, bg, t)) + hex(lerp(ab, bb, t));
}

export type CameraState = Omit<Waypoint, 'p'>;

export function cameraStateAt(p: number): CameraState {
  if (p <= 0) return clone(PATH[0]);
  if (p >= 1) return clone(PATH[PATH.length - 1]);
  let i = 0;
  while (i < PATH.length - 1 && PATH[i + 1].p < p) i++;
  const a = PATH[i], b = PATH[i + 1];
  if (!b) return clone(a);
  const u = (p - a.p) / (b.p - a.p);
  const e = easeInOut(u);
  return {
    pos:  [lerp(a.pos[0],  b.pos[0],  e), lerp(a.pos[1],  b.pos[1],  e), lerp(a.pos[2],  b.pos[2],  e)],
    look: [lerp(a.look[0], b.look[0], e), lerp(a.look[1], b.look[1], e), lerp(a.look[2], b.look[2], e)],
    fov:  lerp(a.fov, b.fov, e),
    bg:   lerpHex(a.bg, b.bg, e),
    mp:   [lerp(a.mp[0], b.mp[0], e), lerp(a.mp[1], b.mp[1], e), lerp(a.mp[2], b.mp[2], e)],
    mr:   lerp(a.mr, b.mr, e),
    ms:   lerp(a.ms, b.ms, e),
    pa:   lerp(a.pa, b.pa, e),
    li:   lerp(a.li, b.li, e),
  };
}

function clone(w: Waypoint): CameraState {
  return {
    pos: [...w.pos], look: [...w.look], fov: w.fov, bg: w.bg,
    mp: [...w.mp], mr: w.mr, ms: w.ms, pa: w.pa, li: w.li,
  };
}
