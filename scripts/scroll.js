// Continuous camera path. Each section's start state EXACTLY matches the
// previous section's end state, so transitions feel like one continuous take
// rather than cinematic cuts.
//
// Master waypoints — read top-to-bottom as the camera flies through space:

const W = {
  heroStart:        { pos: [ 0.6, 1.50, 4.5 ], look: [ 0,    1.00, 0 ], fov: 35 },
  heroEnd:          { pos: [ 0.3, 1.50, 4.0 ], look: [ 0,    1.05, 0 ], fov: 35 },

  manifestoEnd:     { pos: [-2.40, 1.42, 3.0 ], look: [ 0,    1.10, 0 ], fov: 38 },

  closeupOrbitIn:   { pos: [-1.60, 1.55, 1.0 ], look: [ 0,    1.50, 0 ], fov: 28 },
  closeupOrbitOut:  { pos: [-1.60, 1.55, 1.0 ], look: [ 0,    1.50, 0 ], fov: 28 },
  closeupExit:      { pos: [-1.70, 1.50, 4.4 ], look: [-0.50, 1.05, 0 ], fov: 34 },

  workEnd:          { pos: [-1.85, 1.45, 5.4 ], look: [-0.70, 1.05, 0 ], fov: 35 },

  methodInterEnd:   { pos: [-0.40, 1.05, 2.1 ], look: [ 0,    0.85, 0 ], fov: 30 },

  methodEnd:        { pos: [-0.30, 2.55, 4.0 ], look: [ 0.10, 0.55, 0 ], fov: 32 },

  foundersEnd:      { pos: [ 1.20, 0.95, 3.6 ], look: [ 0.30, 1.20, 0 ], fov: 38 },

  contactEnd:       { pos: [ 0,    1.45, 2.5 ], look: [ 0,    1.25, 0 ], fov: 30 },
};

// ---------- helpers ----------
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut   = (t) => 1 - Math.pow(1 - t, 3);

function lerpKf(from, to, t) {
  return {
    position: {
      x: lerp(from.pos[0],  to.pos[0],  t),
      y: lerp(from.pos[1],  to.pos[1],  t),
      z: lerp(from.pos[2],  to.pos[2],  t),
    },
    lookAt: {
      x: lerp(from.look[0], to.look[0], t),
      y: lerp(from.look[1], to.look[1], t),
      z: lerp(from.look[2], to.look[2], t),
    },
    fov: lerp(from.fov, to.fov, t),
  };
}

// ---------- section camera + overlay choreography ----------

const SECTIONS = {
  hero: {
    cameraAt(t) { return lerpKf(W.heroStart, W.heroEnd, easeOut(t)); },
    overlay(el, t) {
      const ol = el.querySelector('.overlay--hero');
      if (ol) {
        ol.style.setProperty('--ovl-y', `${-t * 12}px`);
        ol.style.setProperty('--ovl-s', `${(1 - t * 0.04).toFixed(4)}`);
      }
      const cue = el.querySelector('.scroll-cue');
      if (cue) cue.style.opacity = String(Math.max(0, 1 - t * 2.4));
    },
  },

  manifesto: {
    // Camera arcs around the figure on a smooth circular path from hero-end to manifestoEnd.
    cameraAt(t) {
      const e = easeInOut(t);
      // Use polar interpolation in XZ plane around origin (figure stands at 0,0,0)
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
    overlay(el, t) {
      const ol = el.querySelector('.overlay--manifesto');
      if (ol) ol.style.setProperty('--ovl-x', `${t * 14}px`);
      const spans = el.querySelectorAll('.manifesto__headline span');
      spans[0]?.classList.toggle('is-visible', t > 0.22);
      spans[1]?.classList.toggle('is-visible', t > 0.55);
      el.querySelector('.manifesto__body')?.classList.toggle('is-visible', t > 0.78);
      el.querySelector('.manifesto__meta')?.classList.toggle('is-visible', t > 0.88);
    },
  },

  closeup: {
    // 3 phases: spiral inward (continues the orbit), full 360° body orbit, spiral out.
    cameraAt(t) {
      // Phase 1 — spiral in (0..0.18)
      if (t < 0.18) {
        const u = easeInOut(t / 0.18);
        return lerpKf(W.manifestoEnd, W.closeupOrbitIn, u);
      }
      // Phase 2 — full 360° orbit at orbit-radius (0.18..0.82)
      if (t < 0.82) {
        const u = (t - 0.18) / 0.64;        // 0..1
        const startA = Math.atan2(W.closeupOrbitIn.pos[0], W.closeupOrbitIn.pos[2]);
        const r      = Math.hypot(W.closeupOrbitIn.pos[0], W.closeupOrbitIn.pos[2]);
        // Sweep clockwise (negative angular delta) for natural left-to-back-to-right motion
        const angle  = startA - u * Math.PI * 2;
        const yBob   = Math.sin(u * Math.PI * 2) * 0.04; // tiny vertical breath during orbit
        return {
          position: {
            x: Math.sin(angle) * r,
            y: W.closeupOrbitIn.pos[1] + yBob,
            z: Math.cos(angle) * r,
          },
          lookAt: { x: 0, y: W.closeupOrbitIn.look[1], z: 0 },
          fov:    W.closeupOrbitIn.fov,
        };
      }
      // Phase 3 — spiral out (0.82..1.0)
      const u = easeOut((t - 0.82) / 0.18);
      return lerpKf(W.closeupOrbitOut, W.closeupExit, u);
    },
    overlay(el, t) {
      const top = el.querySelector('.eye--top-left');
      const bot = el.querySelector('.eye--bottom-right');
      if (top) {
        const v = Math.max(0, Math.min(1, (t - 0.04) / 0.18));
        top.style.opacity = v;
        top.style.transform = `translateY(${(1 - v) * 8}px)`;
      }
      if (bot) {
        const v = Math.max(0, Math.min(1, (t - 0.70) / 0.20));
        const e = easeOut(v);
        bot.style.opacity = e;
        bot.style.transform = `translateY(${(1 - e) * 12}px)`;
      }
    },
  },

  work: {
    // Continues the pull-out from closeup-exit to a wide left-side framing.
    cameraAt(t) { return lerpKf(W.closeupExit, W.workEnd, easeInOut(t)); },
    overlay(el, t) {
      const head = el.querySelector('.overlay--work .overlay__header');
      if (head) head.style.setProperty('--ovl-x', `${t * 10}px`);
      const cards = el.querySelectorAll('.work-card');
      [0.30, 0.52, 0.74].forEach((th, i) => cards[i]?.classList.toggle('is-visible', t >= th));
    },
  },

  methodInterlude: {
    // Push back IN from the wide work shot to a tight detail on the lower body / hand area.
    cameraAt(t) { return lerpKf(W.workEnd, W.methodInterEnd, easeInOut(t)); },
    overlay(el, t) {
      const top = el.querySelector('.eye--top-right');
      const bot = el.querySelector('.eye--bottom-left');
      if (top) {
        const v = Math.max(0, Math.min(1, (t - 0.04) / 0.18));
        top.style.opacity = v;
        top.style.transform = `translateY(${(1 - v) * 8}px)`;
      }
      if (bot) {
        const v = Math.max(0, Math.min(1, (t - 0.70) / 0.20));
        const e = easeOut(v);
        bot.style.opacity = e;
        bot.style.transform = `translateY(${(1 - e) * 12}px)`;
      }
    },
  },

  method: {
    // Crane up — continues from the close low position to a high overhead.
    cameraAt(t) { return lerpKf(W.methodInterEnd, W.methodEnd, easeInOut(t)); },
    overlay(el, t) {
      const steps = el.querySelectorAll('.method-steps > li');
      [0.18, 0.42, 0.66, 0.88].forEach((th, i) => steps[i]?.classList.toggle('is-visible', t >= th));
      el.querySelectorAll('.method-steps .step__num').forEach((num) => {
        num.style.setProperty('--num-s', `${(1 + t * 0.10).toFixed(3)}`);
      });
    },
  },

  founders: {
    // Long graceful descend from method-high to a low-angle right-side framing.
    cameraAt(t) { return lerpKf(W.methodEnd, W.foundersEnd, easeInOut(t)); },
    overlay(el, t) {
      const head = el.querySelector('.overlay--founders .overlay__header');
      if (head) head.style.setProperty('--ovl-s', `${(1 + t * 0.04).toFixed(4)}`);
      const cards = el.querySelectorAll('.founder-card');
      cards.forEach((c, i) => c.classList.toggle('is-visible', t >= 0.45 + i * 0.18));
    },
  },

  contact: {
    // Settle to centered push-in. Last 20% adds a small ±5° orbit so the
    // figure visually "turns to face you" at the climax.
    cameraAt(t) {
      if (t < 0.80) {
        const u = easeInOut(t / 0.80);
        return lerpKf(W.foundersEnd, W.contactEnd, u);
      }
      const u = (t - 0.80) / 0.20;
      const a = Math.sin(u * Math.PI) * 0.09;          // tiny ±5°
      const r = Math.hypot(W.contactEnd.pos[0], W.contactEnd.pos[2]);
      return {
        position: { x: Math.sin(a) * r, y: W.contactEnd.pos[1], z: Math.cos(a) * r },
        lookAt:   { x: W.contactEnd.look[0], y: W.contactEnd.look[1], z: W.contactEnd.look[2] },
        fov:      W.contactEnd.fov,
      };
    },
    overlay(el, t) {
      const ol = el.querySelector('.overlay--contact');
      if (ol) ol.style.setProperty('--ovl-s', `${(0.96 + t * 0.04).toFixed(4)}`);
      const cta = el.querySelector('.contact__cta');
      if (cta) {
        const v = Math.max(0, Math.min(1, (t - 0.55) / 0.30));
        const e = easeOut(v);
        cta.style.opacity = e;
        cta.style.transform = `translateY(${(1 - e) * 16}px)`;
      }
    },
  },
};

// ---------- ScrollTrigger wiring ----------

export function initScroll({ canvas, camera }) {
  const ScrollTrigger = window.ScrollTrigger;
  if (!ScrollTrigger) { console.warn('[scroll] ScrollTrigger not loaded'); return; }
  window.gsap?.registerPlugin(ScrollTrigger);

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
        cfg.overlay?.(el, p);
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
