// Camera keyframes per 3D section. Each: position, lookAt target, fov.
// Scroll progress within a pinned section interpolates from previous keyframe
// to this one. The camera always tracks the figure (which sits at origin).

const KF = {
  hero: {
    position: { x: 0.5, y: 1.5, z: 4.6 },
    lookAt:   { x: 0,   y: 1.0, z: 0 },
    fov: 35,
  },
  manifesto: {
    position: { x: -1.2, y: 1.45, z: 3.8 },
    lookAt:   { x: 0,    y: 1.0,  z: 0 },
    fov: 38,
  },
  closeup: {
    position: { x: 0,    y: 1.55, z: 1.7 },
    lookAt:   { x: 0,    y: 1.55, z: 0 },
    fov: 30,
  },
  work: {
    position: { x: -1.7, y: 1.5, z: 5.2 },
    lookAt:   { x: -0.6, y: 1.0, z: 0 },
    fov: 35,
  },
  method: {
    position: { x: 1.2,  y: 2.4, z: 3.6 },
    lookAt:   { x: 0.4,  y: 0.6, z: 0 },
    fov: 32,
  },
  founders: {
    position: { x: -1.4, y: 0.95, z: 3.6 },
    lookAt:   { x: -0.4, y: 1.3,  z: 0 },
    fov: 38,
  },
  contact: {
    position: { x: 0,    y: 1.4, z: 3.0 },
    lookAt:   { x: 0,    y: 1.2, z: 0 },
    fov: 32,
  },
};

const lerp = (a, b, t) => a + (b - a) * t;

export function initScroll({ canvas, camera, figureGroup }) {
  const ScrollTrigger = window.ScrollTrigger;
  if (!ScrollTrigger) { console.warn('[scroll] ScrollTrigger not loaded'); return; }
  window.gsap?.registerPlugin(ScrollTrigger);

  // Initial state — hero keyframe
  applyCamera(camera, KF.hero);

  // Build pinned scroll trigger for each 3D section in DOM order.
  const sections = Array.from(document.querySelectorAll('.sec--3d'));
  let prevKey = 'hero';
  sections.forEach((el) => {
    const camKey = el.dataset.cam;
    const fromKf = KF[prevKey];
    const toKf   = KF[camKey];

    ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onEnter:     () => fadeCanvas(canvas, 1),
      onEnterBack: () => fadeCanvas(canvas, 1),
      onUpdate: (self) => {
        const p = self.progress;
        interpolateCamera(camera, fromKf, toKf, p);
        sectionOverlay(el, p);
      },
    });
    prevKey = camKey;
  });

  // Static sections fade the canvas out to keep the page calm.
  ['#trust', '#why', '#testimonials'].forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter:     () => fadeCanvas(canvas, 0),
      onLeave:     () => fadeCanvas(canvas, 1),
      onEnterBack: () => fadeCanvas(canvas, 0),
      onLeaveBack: () => fadeCanvas(canvas, 1),
    });
  });

  // Lime accent reveals — once per element, when scrolled into view.
  document.querySelectorAll('.lime').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => el.classList.add('is-visible'),
    });
  });
}

function sectionOverlay(el, p) {
  if (el.id === 'manifesto') {
    const spans = el.querySelectorAll('.manifesto__headline span');
    spans[0]?.classList.toggle('is-visible', p > 0.20);
    spans[1]?.classList.toggle('is-visible', p > 0.55);
  }
  if (el.id === 'work') {
    const cards = el.querySelectorAll('.work-card');
    const thresholds = [0.30, 0.50, 0.70];
    cards.forEach((card, i) => card.classList.toggle('is-visible', p >= thresholds[i]));
  }
  if (el.id === 'method') {
    const steps = el.querySelectorAll('.method-steps > li');
    const thresholds = [0.20, 0.45, 0.70, 0.90];
    steps.forEach((step, i) => step.classList.toggle('is-visible', p >= thresholds[i]));
  }
}

function applyCamera(camera, kf) {
  camera.position.set(kf.position.x, kf.position.y, kf.position.z);
  camera.lookAt(kf.lookAt.x, kf.lookAt.y, kf.lookAt.z);
  if (Math.abs(camera.fov - kf.fov) > 0.01) {
    camera.fov = kf.fov;
    camera.updateProjectionMatrix();
  }
}

function interpolateCamera(camera, from, to, t) {
  camera.position.x = lerp(from.position.x, to.position.x, t);
  camera.position.y = lerp(from.position.y, to.position.y, t);
  camera.position.z = lerp(from.position.z, to.position.z, t);
  const lx = lerp(from.lookAt.x, to.lookAt.x, t);
  const ly = lerp(from.lookAt.y, to.lookAt.y, t);
  const lz = lerp(from.lookAt.z, to.lookAt.z, t);
  camera.lookAt(lx, ly, lz);
  const newFov = lerp(from.fov, to.fov, t);
  if (Math.abs(newFov - camera.fov) > 0.01) {
    camera.fov = newFov;
    camera.updateProjectionMatrix();
  }
}

function fadeCanvas(canvas, opacity) {
  if (canvas) canvas.style.opacity = String(opacity);
}
