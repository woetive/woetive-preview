// Continuous camera path. Each section's t=0 must equal previous t=1.
// Per camera-directed brief — Hero is the only section fully aligned to brief
// values right now; other sections inherit from previous and use existing
// rough waypoints until each one is dialled in section-by-section.

const W = {
  // Hero — dark, figure right, headline left, particle cloud behind
  heroStart:       { pos: [ 0.50, 1.55, 4.50], look: [-0.40, 1.40, 0], fov: 32 },
  heroEnd:         { pos: [ 0.20, 1.65, 3.30], look: [-0.30, 1.45, 0], fov: 30 },

  manifestoEnd:    { pos: [-0.25, 1.78, 2.30], look: [ 0.18, 1.45, 0], fov: 32 },

  closeupOrbitIn:  { pos: [-1.70, 1.55, 0.95], look: [ 0,    1.55, 0], fov: 30 },
  closeupOrbitOut: { pos: [-1.70, 1.55, 0.95], look: [ 0,    1.55, 0], fov: 30 },
  closeupExit:     { pos: [-1.50, 1.50, 3.60], look: [-0.50, 1.30, 0], fov: 33 },

  workEnd:         { pos: [-1.85, 1.40, 5.40], look: [-0.70, 1.10, 0], fov: 36 },
  methodInterEnd:  { pos: [ 0.50, 1.65, 1.90], look: [-0.20, 1.55, 0], fov: 30 },
  methodEnd:       { pos: [-0.40, 2.50, 4.20], look: [ 0.30, 0.95, 0], fov: 35 },
  foundersEnd:     { pos: [ 1.50, 1.10, 3.40], look: [ 0.20, 1.30, 0], fov: 38 },
  contactEnd:      { pos: [ 0,    1.55, 2.40], look: [ 0,    1.55, 0], fov: 28 },
};

const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut   = (t) => 1 - Math.pow(1 - t, 3);

function lerpKf(from, to, t) {
  return {
    position: { x: lerp(from.pos[0], to.pos[0], t), y: lerp(from.pos[1], to.pos[1], t), z: lerp(from.pos[2], to.pos[2], t) },
    lookAt:   { x: lerp(from.look[0], to.look[0], t), y: lerp(from.look[1], to.look[1], t), z: lerp(from.look[2], to.look[2], t) },
    fov:      lerp(from.fov, to.fov, t),
  };
}

function applyText(el, m) {
  if (!el) return;
  el.style.transform = `translate3d(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px, 0)`;
  el.style.opacity = m.opacity.toFixed(3);
}

function textMotion(t, enter, exit) {
  const ENTER_END = 0.30;
  const EXIT_START = 0.70;
  const enterT = Math.min(1, t / ENTER_END);
  const exitT  = Math.max(0, (t - EXIT_START) / (1 - EXIT_START));
  const eIn  = 1 - Math.pow(1 - enterT, 3);
  const eOut = exitT * exitT;
  return {
    x: lerp(enter.x, 0, eIn) + lerp(0, exit.x, eOut),
    y: lerp(enter.y, 0, eIn) + lerp(0, exit.y, eOut),
    opacity: Math.max(0, eIn - eOut),
  };
}

const SECTIONS = {
  hero: {
    cameraAt(t) { return lerpKf(W.heroStart, W.heroEnd, easeOut(t)); },
    overlay(el, t, ctx) {
      // Hero overlay is visible at page load; only EXIT motion driven on scroll-out.
      const ol = el.querySelector('.overlay--hero');
      if (ol) {
        const exitT = Math.max(0, (t - 0.55) / 0.45);
        const e = exitT * exitT;
        ol.style.transform = `translate3d(${(e * 50).toFixed(1)}px, ${(e * -20).toFixed(1)}px, 0)`;
        ol.style.opacity = (1 - e * 0.95).toFixed(3);
      }
      // Lime chest-line ramps up gently as user scrolls
      if (ctx?.limeMaterial) {
        ctx.limeMaterial.emissiveIntensity = 1.4 + t * 0.6;
      }
      // Particle cloud stays anchored — its own update handles motion
    },
  },

  manifesto: {
    cameraAt(t) {
      const e = easeInOut(t);
      const aFrom = Math.atan2(W.heroEnd.pos[0],  W.heroEnd.pos[2]);
      const aTo   = Math.atan2(W.manifestoEnd.pos[0], W.manifestoEnd.pos[2]);
      const rFrom = Math.hypot(W.heroEnd.pos[0],  W.heroEnd.pos[2]);
      const rTo   = Math.hypot(W.manifestoEnd.pos[0], W.manifestoEnd.pos[2]);
      const angle = lerp(aFrom, aTo, e);
      const radius = lerp(rFrom, rTo, e);
      return {
        position: {
          x: Math.sin(angle) * radius,
          y: lerp(W.heroEnd.pos[1], W.manifestoEnd.pos[1], e),
          z: Math.cos(angle) * radius,
        },
        lookAt: {
          x: lerp(W.heroEnd.look[0], W.manifestoEnd.look[0], e),
          y: lerp(W.heroEnd.look[1], W.manifestoEnd.look[1], e),
          z: lerp(W.heroEnd.look[2], W.manifestoEnd.look[2], e),
        },
        fov: lerp(W.heroEnd.fov, W.manifestoEnd.fov, e),
      };
    },
    overlay(el, t, ctx) {
      applyText(el.querySelector('.overlay--manifesto'),
                textMotion(t, { x: -60, y: 0 }, { x: 50, y: 20 }));
      const spans = el.querySelectorAll('.manifesto__headline span');
      spans[0]?.classList.toggle('is-visible', t > 0.20);
      spans[1]?.classList.toggle('is-visible', t > 0.50);
      el.querySelector('.manifesto__body')?.classList.toggle('is-visible', t > 0.72);
      el.querySelector('.manifesto__meta')?.classList.toggle('is-visible', t > 0.84);
      // Particle cloud fades down as we leave hero
      if (ctx?.particles) ctx.particles.setOpacity(1 - t * 0.85);
    },
  },

  closeup: {
    cameraAt(t) {
      if (t < 0.16) return lerpKf(W.manifestoEnd, W.closeupOrbitIn, easeInOut(t / 0.16));
      if (t < 0.84) {
        const u = (t - 0.16) / 0.68;
        const startA = Math.atan2(W.closeupOrbitIn.pos[0], W.closeupOrbitIn.pos[2]);
        const r      = Math.hypot(W.closeupOrbitIn.pos[0], W.closeupOrbitIn.pos[2]);
        const angle  = startA - u * Math.PI * 2;
        const yBob   = Math.sin(u * Math.PI * 2) * 0.04;
        return {
          position: { x: Math.sin(angle) * r, y: W.closeupOrbitIn.pos[1] + yBob, z: Math.cos(angle) * r },
          lookAt:   { x: 0, y: W.closeupOrbitIn.look[1], z: 0 },
          fov:      W.closeupOrbitIn.fov,
        };
      }
      return lerpKf(W.closeupOrbitOut, W.closeupExit, easeOut((t - 0.84) / 0.16));
    },
    overlay(el, t) {
      const top = el.querySelector('.eye--top-left');
      if (top) {
        const v = Math.max(0, Math.min(1, (t - 0.04) / 0.18));
        top.style.opacity = String(v);
        top.style.transform = `translate3d(${(1 - v) * -20}px, 0, 0)`;
      }
      const bot = el.querySelector('.eye--bottom-right');
      if (bot) {
        const v = Math.max(0, Math.min(1, (t - 0.70) / 0.20));
        const e = easeOut(v);
        bot.style.opacity = String(e);
        bot.style.transform = `translate3d(${(1 - e) * 30}px, 0, 0)`;
      }
    },
  },

  work: {
    cameraAt(t) { return lerpKf(W.closeupExit, W.workEnd, easeInOut(t)); },
    overlay(el, t) {
      applyText(el.querySelector('.overlay--work .overlay__header'),
                textMotion(t, { x: 0, y: 40 }, { x: -50, y: 0 }));
      const cards = el.querySelectorAll('.work-card');
      [0.30, 0.50, 0.70].forEach((th, i) => cards[i]?.classList.toggle('is-visible', t >= th));
    },
  },

  methodInterlude: {
    cameraAt(t) { return lerpKf(W.workEnd, W.methodInterEnd, easeInOut(t)); },
    overlay(el, t) {
      const top = el.querySelector('.eye--top-right');
      if (top) {
        const v = Math.max(0, Math.min(1, (t - 0.04) / 0.18));
        top.style.opacity = String(v);
        top.style.transform = `translate3d(${(1 - v) * 20}px, 0, 0)`;
      }
      const bot = el.querySelector('.eye--bottom-left');
      if (bot) {
        const v = Math.max(0, Math.min(1, (t - 0.70) / 0.20));
        const e = easeOut(v);
        bot.style.opacity = String(e);
        bot.style.transform = `translate3d(${(1 - e) * -30}px, 0, 0)`;
      }
    },
  },

  method: {
    cameraAt(t) { return lerpKf(W.methodInterEnd, W.methodEnd, easeInOut(t)); },
    overlay(el, t) {
      applyText(el.querySelector('.overlay--method'),
                textMotion(t, { x: 0, y: 50 }, { x: -30, y: -30 }));
      const steps = el.querySelectorAll('.method-steps > li');
      [0.18, 0.42, 0.66, 0.88].forEach((th, i) => steps[i]?.classList.toggle('is-visible', t >= th));
      el.querySelectorAll('.method-steps .step__num').forEach((num) => {
        num.style.setProperty('--num-s', `${(1 + t * 0.10).toFixed(3)}`);
      });
    },
  },

  founders: {
    cameraAt(t) { return lerpKf(W.methodEnd, W.foundersEnd, easeInOut(t)); },
    overlay(el, t) {
      applyText(el.querySelector('.overlay--founders .overlay__header'),
                textMotion(t, { x: 0, y: -50 }, { x: 40, y: 0 }));
      const cards = el.querySelectorAll('.founder-card');
      cards.forEach((c, i) => c.classList.toggle('is-visible', t >= 0.45 + i * 0.18));
    },
  },

  contact: {
    cameraAt(t) {
      if (t < 0.80) return lerpKf(W.foundersEnd, W.contactEnd, easeInOut(t / 0.80));
      const u = (t - 0.80) / 0.20;
      const a = Math.sin(u * Math.PI) * 0.09;
      const r = Math.hypot(W.contactEnd.pos[0], W.contactEnd.pos[2]);
      return {
        position: { x: Math.sin(a) * r, y: W.contactEnd.pos[1], z: Math.cos(a) * r },
        lookAt:   { x: W.contactEnd.look[0], y: W.contactEnd.look[1], z: W.contactEnd.look[2] },
        fov:      W.contactEnd.fov,
      };
    },
    overlay(el, t, ctx) {
      applyText(el.querySelector('.overlay--contact'),
                textMotion(t, { x: -50, y: 0 }, { x: 0, y: 0 }));
      const cta = el.querySelector('.contact__cta');
      if (cta) {
        const v = Math.max(0, Math.min(1, (t - 0.55) / 0.30));
        const e = easeOut(v);
        cta.style.opacity = String(e);
        cta.style.transform = `translate3d(0, ${(1 - e) * 16}px, 0)`;
      }
      // Lime line climax flash
      if (ctx?.limeMaterial) ctx.limeMaterial.emissiveIntensity = 1.5 + Math.max(0, t - 0.7) / 0.3 * 1.4;
    },
  },
};

export function initScroll({ canvas, camera, particles, limeMaterial }) {
  const ScrollTrigger = window.ScrollTrigger;
  if (!ScrollTrigger) { console.warn('[scroll] ScrollTrigger not loaded'); return; }
  window.gsap?.registerPlugin(ScrollTrigger);

  const ctx = { particles, limeMaterial };
  applyCamera(camera, SECTIONS.hero.cameraAt(0));

  document.querySelectorAll('.sec--3d').forEach((el) => {
    const cfg = SECTIONS[el.dataset.cam];
    if (!cfg) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onEnter:     () => fadeCanvas(canvas, 1),
      onEnterBack: () => fadeCanvas(canvas, 1),
      onUpdate: (self) => {
        const p = self.progress;
        applyCamera(camera, cfg.cameraAt(p));
        cfg.overlay?.(el, p, ctx);
      },
    });
  });

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

  document.querySelectorAll('.lime').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => el.classList.add('is-visible'),
    });
  });
}

function applyCamera(camera, kf) {
  camera.position.set(kf.position.x, kf.position.y, kf.position.z);
  camera.lookAt(kf.lookAt.x, kf.lookAt.y, kf.lookAt.z);
  if (Math.abs(camera.fov - kf.fov) > 0.01) {
    camera.fov = kf.fov;
    camera.updateProjectionMatrix();
  }
}

function fadeCanvas(canvas, opacity) {
  if (canvas) canvas.style.opacity = String(opacity);
}
