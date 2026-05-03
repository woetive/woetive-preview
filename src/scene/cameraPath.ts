// Continuous camera path. Each waypoint has progress p (0..1 of total scroll),
// camera state, model state, particle opacity, lime intensity, and bg color.
// Per woetive_full_3d_infinite_canvas_brief.md sections 8–19.

export type Waypoint = {
  p: number;
  pos:  [number, number, number];
  look: [number, number, number];
  fov:  number;
  bg:   string;          // hex
  mp:   [number, number, number];   // model position
  mr:   number;                     // model rotation Y (rad)
  ms:   number;                     // model scale
  pa:   number;                     // particle opacity
  li:   number;                     // lime emissive intensity
};

export const PATH: Waypoint[] = [
  // 01 Hero — z 0 to -10
  { p: 0.000, pos: [ 0.55, 1.25,   4.80], look: [ 0.05, 0.85,  -2.00], fov: 38, bg: '#050505', mp: [ 1.05, -0.95,  -2.20], mr: -0.18, ms: 1.95, pa: 0.38, li: 1.15 },
  { p: 0.075, pos: [ 0.10, 1.45,   3.15], look: [ 0.35, 1.10,  -2.15], fov: 34, bg: '#050505', mp: [ 0.85, -0.85,  -2.20], mr: -0.10, ms: 2.05, pa: 0.32, li: 1.20 },

  // 02 Manifesto — z -10 to -20
  { p: 0.170, pos: [-0.25, 1.75,  -9.65], look: [ 0.15, 1.30, -12.10], fov: 30, bg: '#050505', mp: [ 0.78, -0.90, -12.00], mr: -0.04, ms: 2.55, pa: 0.12, li: 1.35 },

  // 03 Close-up — z -20 to -28
  { p: 0.250, pos: [ 0.12, 1.42, -20.65], look: [ 0.28, 0.95, -22.00], fov: 26, bg: '#050505', mp: [ 0.58, -0.80, -22.00], mr:  0.02, ms: 3.20, pa: 0.03, li: 1.55 },

  // 04 Work — z -28 to -42 (off-white room)
  { p: 0.330, pos: [ 0.40, 1.25, -27.60], look: [ 0.25, 0.85, -31.50], fov: 36, bg: '#F4F3EE', mp: [ 2.35, -1.10, -32.80], mr: -0.72, ms: 1.85, pa: 0.00, li: 0.75 },
  { p: 0.420, pos: [ 0.20, 1.05, -29.00], look: [ 0.20, 0.70, -31.80], fov: 40, bg: '#F4F3EE', mp: [ 2.35, -1.10, -32.80], mr: -0.72, ms: 1.85, pa: 0.00, li: 0.75 },

  // 05 Method Interlude — z -42 to -50 (back to dark)
  { p: 0.500, pos: [ 0.65, 1.25, -42.90], look: [ 0.45, 0.85, -45.20], fov: 29, bg: '#050505', mp: [ 0.85, -0.95, -45.20], mr: -0.35, ms: 2.65, pa: 0.10, li: 1.20 },

  // 06 Method Steps — z -50 to -65 (off-white)
  { p: 0.620, pos: [-0.65, 1.35, -53.00], look: [ 0.35, 0.55, -57.00], fov: 36, bg: '#F4F3EE', mp: [ 1.45, -1.00, -55.50], mr:  0.35, ms: 2.05, pa: 0.00, li: 0.85 },

  // 07 Trust Ribbon — z -65 to -72
  { p: 0.700, pos: [ 0.00, 1.00, -64.50], look: [ 0.00, 0.25, -67.00], fov: 42, bg: '#F4F3EE', mp: [ 1.45, -1.00, -75.00], mr:  0.35, ms: 2.05, pa: 0.00, li: 0.00 },

  // 08 Why Woetive — z -72 to -88
  { p: 0.780, pos: [ 0.15, 1.05, -73.50], look: [ 0.10, 0.05, -76.80], fov: 38, bg: '#F4F3EE', mp: [ 2.55, -1.10, -78.00], mr: -0.55, ms: 1.85, pa: 0.00, li: 0.35 },

  // 09 Testimonials — z -88 to -98 (warm white)
  { p: 0.850, pos: [ 0.00, 0.95, -88.80], look: [ 0.00, 0.05, -91.40], fov: 40, bg: '#FAF9F4', mp: [ 3.50, -1.10, -90.00], mr: -0.55, ms: 1.85, pa: 0.00, li: 0.00 },

  // 10 Founders — z -98 to -110
  { p: 0.920, pos: [ 0.50, 1.25, -99.40], look: [ 0.55, 0.65,-102.00], fov: 36, bg: '#F4F3EE', mp: [ 1.40, -1.00,-102.50], mr: -0.18, ms: 2.10, pa: 0.10, li: 0.85 },

  // 11 Contact — z -110 to -122 (dark, climax)
  { p: 0.970, pos: [ 0.00, 1.45,-111.65], look: [ 0.22, 1.05,-114.00], fov: 31, bg: '#050505', mp: [ 0.75, -0.95,-114.00], mr: -0.05, ms: 2.45, pa: 0.22, li: 1.65 },

  // 12 Footer — z -122 to -130
  { p: 1.000, pos: [ 0.00, 0.85,-122.50], look: [ 0.00, 0.35,-124.50], fov: 42, bg: '#050505', mp: [ 3.50, -1.00,-130.00], mr: -0.05, ms: 1.00, pa: 0.00, li: 0.00 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function lerpHex(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  const hex = (v: number) => Math.round(v).toString(16).padStart(2, '0');
  return '#' + hex(lerp(ar, br, t)) + hex(lerp(ag, bg, t)) + hex(lerp(ab, bb, t));
}

export type CameraState = {
  pos:  [number, number, number];
  look: [number, number, number];
  fov:  number;
  bg:   string;
  mp:   [number, number, number];
  mr:   number;
  ms:   number;
  pa:   number;
  li:   number;
};

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
