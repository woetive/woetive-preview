import * as THREE from 'three';

// Liquid background — a single fragment-shader plane sitting behind the figure.
// Simplex noise + radial halo + mouse uniform create a flowing "energy field"
// that breathes, reacts to the cursor, and gives the figure a soft glow.

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uMouse;        // -1..1
  uniform vec3  uAccent;       // lime
  uniform vec3  uBg;           // white
  uniform float uIntensity;    // 0..1 master mix

  // --- Simplex 2D noise (Ashima Arts, BSD) ---
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                            + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  // Fractal brownian motion — layered noise for organic flow
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * snoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;            // -1..1
    p.x *= 1.6;                           // aspect compensation

    // Mouse-attracted center of the energy bloom
    vec2 c = uMouse * 0.6;

    // Flowing distortion — noise field that drifts in time
    vec2 q = p + vec2(uTime * 0.04, uTime * 0.025);
    float n1 = fbm(q * 1.4 + c * 0.6);
    float n2 = fbm(q * 2.6 - c * 0.4 + vec2(5.2, 1.7));
    float liquid = (n1 + n2 * 0.5);

    // Radial halo around mouse-shifted center
    float d = length(p - c);
    float halo = smoothstep(1.4, 0.05, d) * 0.85;

    // Liquid metaball-like blob — clusters where noise + halo align
    float blob = smoothstep(0.0, 0.55, halo + liquid * 0.35);

    // Subtle lime kiss in the brightest blob centers
    float lime = smoothstep(0.65, 1.0, blob) * 0.20;

    vec3 col = mix(uBg, uBg * 0.93, blob * 0.55);   // base soft cloud
    col += uAccent * lime * uIntensity;             // lime accent kisses

    // Vignette toward edges so the field feels enclosed
    float vig = smoothstep(1.4, 0.4, length(p));
    col = mix(uBg, col, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createLiquidBackground(scene) {
  const geo = new THREE.PlaneGeometry(16, 10, 1, 1);
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime:      { value: 0 },
      uMouse:     { value: new THREE.Vector2(0, 0) },
      uAccent:    { value: new THREE.Color('#D0EF00') },
      uBg:        { value: new THREE.Color('#FFFFFF') },
      uIntensity: { value: 1.0 },
    },
    depthWrite: false,
    transparent: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 1.0, -3.5);   // sits behind figure
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;             // render before figure
  scene.add(mesh);

  const state = { mx: 0, my: 0, tmx: 0, tmy: 0 };

  function setMouse(nx, ny) {
    state.tmx = nx;
    state.tmy = ny;
  }

  function setIntensity(v) {
    mat.uniforms.uIntensity.value = v;
  }

  function update() {
    state.mx += (state.tmx - state.mx) * 0.05;
    state.my += (state.tmy - state.my) * 0.05;
    mat.uniforms.uMouse.value.set(state.mx, -state.my);
    mat.uniforms.uTime.value = performance.now() * 0.001;
  }

  return { mesh, update, setMouse, setIntensity };
}
