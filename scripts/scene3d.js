/* ============================================================
 * Woetive — Manifesto 3D scene
 *
 * Scroll-driven Three.js scene featuring the figure GLB.
 * Camera dollies from wide shot → chest close-up. Lime emissive
 * intensifies with scroll. Mouse parallax adds 6DOF feel.
 *
 * Render loop is gated by IntersectionObserver — only renders
 * when the section is in viewport (saves battery, idle cycles).
 *
 * Loaded as a module, runs only on desktop (skips on mobile or
 * prefers-reduced-motion).
 * ========================================================== */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 900px)').matches;

const ACCENT = new THREE.Color('#D0EF00');
const BG = new THREE.Color('#0A0A09');

class ManifestoScene {
  constructor(canvas, container) {
    this.canvas = canvas;
    this.container = container;
    this.disposed = false;
    this.inView = false;
    this.modelReady = false;
    this.scrollProgress = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this.setupRenderer();
    this.setupScene();
    this.setupLights();
    this.setupCamera();
    this.loadModel();
    this.bindEvents();
    this.observeViewport();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.resize();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = BG;
    this.scene.fog = new THREE.Fog(BG, 4, 14);
  }

  setupLights() {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.4);
    this.scene.add(hemi);

    // Key light — top-front, soft
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2, 5, 4);
    this.scene.add(key);

    // Rim light — back, slight lime tint, picks out figure silhouette
    const rim = new THREE.DirectionalLight(0xc4d870, 0.6);
    rim.position.set(-3, 2, -4);
    this.scene.add(rim);

    // Fill — front-bottom, cool, very subtle
    const fill = new THREE.DirectionalLight(0x6688aa, 0.2);
    fill.position.set(0, -1, 3);
    this.scene.add(fill);

    // Lime accent point light positioned on chest area — drives interactive glow
    this.limePoint = new THREE.PointLight(ACCENT, 0, 1.8, 2);
    this.limePoint.position.set(0, 0.9, 0.3);
    this.scene.add(this.limePoint);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(32, this.aspect, 0.1, 50);
    this.camera.position.set(0, 1.0, 4.4);
    this.camera.lookAt(0, 1.0, 0);
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      '/models/figure.glb',
      (gltf) => {
        if (this.disposed) return;
        const model = gltf.scene;

        // Auto-center & scale: bring model to fit a ~2m tall standing figure
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3(); box.getSize(size);
        const center = new THREE.Vector3(); box.getCenter(center);
        const targetHeight = 2.0;
        const scale = targetHeight / Math.max(size.y, 0.001);
        model.scale.setScalar(scale);
        // Re-bound after scaling, then center horizontally and place feet near y=0
        const box2 = new THREE.Box3().setFromObject(model);
        const size2 = new THREE.Vector3(); box2.getSize(size2);
        const center2 = new THREE.Vector3(); box2.getCenter(center2);
        model.position.set(-center2.x, -box2.min.y, -center2.z);

        // Material pass — boost contrast, prep for emissive driving
        model.traverse((child) => {
          if (!child.isMesh) return;
          const mat = child.material;
          if (mat && mat.isMeshStandardMaterial) {
            mat.envMapIntensity = 0.8;
            mat.roughness = Math.min(0.9, (mat.roughness ?? 0.6) + 0.05);
            // Emissive pinned to the texture's lime channel — we boost with intensity
            mat.emissive = ACCENT.clone();
            mat.emissiveMap = mat.map;
            mat.emissiveIntensity = 0;
            mat.needsUpdate = true;
          }
          this.figureMaterial = mat;
        });

        this.model = model;
        this.modelHeight = targetHeight;
        this.scene.add(model);
        this.modelReady = true;
        this.canvas.classList.add('is-ready');
        this.requestRender();
      },
      undefined,
      (err) => console.error('[scene3d] GLB load failed', err)
    );
  }

  bindEvents() {
    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.tick = this.tick.bind(this);
    addEventListener('resize', this.onResize, { passive: true });
    addEventListener('mousemove', this.onMouseMove, { passive: true });

    // Bind to existing GSAP ScrollTrigger if present, else fallback to scroll event
    if (typeof window.ScrollTrigger !== 'undefined') {
      window.ScrollTrigger.create({
        trigger: this.container,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => this.setScrollProgress(self.progress),
      });
    } else {
      addEventListener('scroll', () => {
        const rect = this.container.getBoundingClientRect();
        const total = rect.height + window.innerHeight;
        const scrolled = window.innerHeight - rect.top;
        this.setScrollProgress(Math.max(0, Math.min(1, scrolled / total)));
      }, { passive: true });
    }
  }

  observeViewport() {
    const io = new IntersectionObserver(
      (entries) => {
        const wasIn = this.inView;
        this.inView = entries[0].isIntersecting;
        if (this.inView && !wasIn) this.requestRender();
      },
      { threshold: 0.0, rootMargin: '20% 0px 20% 0px' }
    );
    io.observe(this.container);
    this.viewportObserver = io;
  }

  onResize() {
    this.resize();
    this.requestRender();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    this.aspect = w / h;
    this.renderer.setSize(w, h, false);
    if (this.camera) {
      this.camera.aspect = this.aspect;
      this.camera.updateProjectionMatrix();
    }
  }

  onMouseMove(e) {
    if (!this.inView) return;
    const x = (e.clientX / window.innerWidth) * 2 - 1;   // -1..1
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    this.targetMouseX = x;
    this.targetMouseY = y;
    this.requestRender();
  }

  setScrollProgress(p) {
    this.scrollProgress = p;
    this.requestRender();
  }

  requestRender() {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(this.tick);
  }

  tick() {
    this.rafId = null;
    if (this.disposed) return;
    if (!this.modelReady) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // ----- Camera choreography -----
    // 0.0 → wide shot (full body), 0.5 → chest close-up, 1.0 → slight pullback
    const p = this.scrollProgress;
    const dolly = easeInOutCubic(p < 0.6 ? p / 0.6 : 1 - (p - 0.6) / 0.4 * 0.3);
    // dolly: 0 wide → 1 close → 0.7 slight pullback
    const camZ = lerp(4.4, 1.55, dolly);
    const camY = lerp(1.05, 1.18, dolly);

    // Mouse parallax — interpolate toward target for smoothness
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;
    const parallaxX = this.mouseX * 0.18;
    const parallaxY = -this.mouseY * 0.10;

    this.camera.position.set(parallaxX, camY + parallaxY, camZ);
    this.camera.lookAt(0, lerp(1.0, 1.18, dolly), 0);

    // Subtle figure rotation — drives slight orbit feel
    if (this.model) {
      const baseRot = -0.08 + (this.scrollProgress * 0.16); // -0.08 → +0.08
      this.model.rotation.y = baseRot + this.mouseX * 0.04;
    }

    // ----- Lime emissive choreography -----
    // Dim until 0.35, ramps up, peaks at 0.85, holds
    const limeT = clamp((p - 0.30) / 0.55, 0, 1);
    const limeIntensity = easeInOutCubic(limeT) * 1.6;
    if (this.figureMaterial) {
      this.figureMaterial.emissiveIntensity = limeIntensity;
    }
    this.limePoint.intensity = limeIntensity * 1.4;

    // Tone mapping exposure — slight fade toward end
    this.renderer.toneMappingExposure = 1.0 + Math.sin(p * Math.PI) * 0.08;

    this.renderer.render(this.scene, this.camera);

    // Continue rendering while in view & still animating mouse parallax
    const stillMoving =
      Math.abs(this.targetMouseX - this.mouseX) > 0.001 ||
      Math.abs(this.targetMouseY - this.mouseY) > 0.001;
    if (this.inView && stillMoving) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  dispose() {
    this.disposed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.viewportObserver) this.viewportObserver.disconnect();
    removeEventListener('resize', this.onResize);
    removeEventListener('mousemove', this.onMouseMove);
    this.renderer.dispose();
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ----- Bootstrap -----
function init() {
  if (reduceMotion || isMobile) {
    // Static fallback — show overlay copy without 3D
    const section = document.getElementById('manifesto3d');
    if (section) section.classList.add('manifesto3d--static');
    return;
  }

  const canvas = document.getElementById('manifesto3d-canvas');
  const section = document.getElementById('manifesto3d');
  if (!canvas || !section) return;

  // Wait for ScrollTrigger to be available so we bind correctly
  const start = () => {
    new ManifestoScene(canvas, section);
  };
  if (typeof window.ScrollTrigger !== 'undefined') {
    start();
  } else {
    let waited = 0;
    const id = setInterval(() => {
      waited += 80;
      if (typeof window.ScrollTrigger !== 'undefined' || waited > 1600) {
        clearInterval(id);
        start();
      }
    }, 80);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
