// Per-section camera + overlay choreography. Each section owns its own
// cameraAt(t) and overlay(el, t) functions so transitions can be multi-phase
// and the text reacts to where the camera is going, not just to scroll progress.

const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut   = (t) => 1 - Math.pow(1 - t, 3);

const SECTIONS = {
  hero: {
    cameraAt(t) {
      const e = easeOut(t);
      return {
        position: { x: 0.5, y: 1.5, z: lerp(4.6, 4.0, e) },
        lookAt:   { x: 0,   y: lerp(1.0, 1.05, e), z: 0 },
        fov: 35,
      };
    },
    overlay(el, t) {
      // Hero overlay drifts UP and slight scale-down as camera dollies in.
      const ol = el.querySelector('.overlay--hero');
      if (!ol) return;
      ol.style.setProperty('--ovl-y', `${-t * 12}px`);
      ol.style.setProperty('--ovl-s', `${(1 - t * 0.04).toFixed(4)}`);
    },
  },

  manifesto: {
    // True orbit: camera arcs 30° to the left around the figure while dollying in.
    cameraAt(t) {
      const e = easeInOut(t);
      const angle = -e * 0.55;             // radians (~31°)
      const radius = lerp(4.0, 3.6, e);
      return {
        position: {
          x: Math.sin(angle) * radius,
          y: lerp(1.5, 1.4, e),
          z: Math.cos(angle) * radius,
        },
        lookAt: { x: 0, y: lerp(1.0, 1.05, e), z: 0 },
        fov:    lerp(35, 38, e),
      };
    },
    overlay(el, t) {
      // Right-aligned overlay drifts slightly with the camera (parallax floating feel)
      const ol = el.querySelector('.overlay--manifesto');
      if (ol) ol.style.setProperty('--ovl-x', `${t * 14}px`);

      // Lines reveal at orbit-angle thresholds, not raw scroll
      const spans = el.querySelectorAll('.manifesto__headline span');
      spans[0]?.classList.toggle('is-visible', t > 0.22);
      spans[1]?.classList.toggle('is-visible', t > 0.55);
      el.querySelector('.manifesto__body')?.classList.toggle('is-visible', t > 0.78);
      el.querySelector('.manifesto__meta')?.classList.toggle('is-visible', t > 0.88);
    },
  },

  closeup: {
    // Three internal phases: push-in (0-0.4), micro-orbit (0.4-0.75), pull back (0.75-1).
    cameraAt(t) {
      if (t < 0.40) {
        const u = easeOut(t / 0.40);
        return {
          position: { x: 0, y: lerp(1.5, 1.55, u), z: lerp(3.8, 1.4, u) },
          lookAt:   { x: 0, y: lerp(1.0, 1.55, u), z: 0 },
          fov:      lerp(35, 28, u),
        };
      }
      if (t < 0.75) {
        const u = (t - 0.40) / 0.35;
        // Gentle arc at close range — stays near the face/torso
        const a = Math.sin(u * Math.PI) * 0.30;   // -0.30..0.30 rad swing
        const r = 1.4;
        return {
          position: {
            x: Math.sin(a) * r,
            y: 1.55 + Math.sin(u * Math.PI) * 0.04,
            z: Math.cos(a) * r,
          },
          lookAt: { x: 0, y: 1.55, z: 0 },
          fov:    28,
        };
      }
      const u = easeOut((t - 0.75) / 0.25);
      return {
        position: { x: 0, y: 1.55, z: lerp(1.4, 1.7, u) },
        lookAt:   { x: 0, y: 1.55, z: 0 },
        fov:      lerp(28, 30, u),
      };
    },
    overlay(el, t) {
      const line = el.querySelector('.closeup__line');
      const sub  = el.querySelector('.closeup__sub');
      const eye  = el.querySelector('.overlay--closeup .eyebrow');
      if (eye) {
        const v = Math.max(0, Math.min(1, (t - 0.05) / 0.15));
        eye.style.opacity = v;
        eye.style.transform = `translateY(${(1 - v) * 8}px)`;
      }
      if (line) {
        const v = Math.max(0, Math.min(1, (t - 0.55) / 0.30));
        const e = easeOut(v);
        line.style.opacity = e;
        line.style.transform = `translateY(${(1 - e) * 24}px) scale(${0.94 + e * 0.06})`;
      }
      if (sub) {
        const v = Math.max(0, Math.min(1, (t - 0.78) / 0.20));
        sub.style.opacity = v;
        sub.style.transform = `translateY(${(1 - v) * 10}px)`;
      }
    },
  },

  work: {
    // Pull back + slide left — opens the right side for cards.
    cameraAt(t) {
      const e = easeInOut(t);
      return {
        position: { x: lerp(0,  -1.7, e), y: 1.5, z: lerp(1.7, 5.2, e) },
        lookAt:   { x: lerp(0,  -0.6, e), y: 1.0, z: 0 },
        fov:      lerp(30, 35, e),
      };
    },
    overlay(el, t) {
      const head = el.querySelector('.overlay--work .overlay__header');
      if (head) head.style.setProperty('--ovl-x', `${t * 10}px`);

      const cards = el.querySelectorAll('.work-card');
      const thresholds = [0.32, 0.52, 0.72];
      cards.forEach((card, i) => card.classList.toggle('is-visible', t >= thresholds[i]));
    },
  },

  method: {
    // Crane up — camera rises from eye-level to high overhead, tilting down.
    cameraAt(t) {
      const e = easeInOut(t);
      return {
        position: { x: lerp(1.0, 1.4, e), y: lerp(1.5, 2.8, e), z: lerp(4.0, 3.4, e) },
        lookAt:   { x: lerp(0.3, 0.4, e), y: lerp(1.0, 0.5, e), z: 0 },
        fov:      lerp(35, 32, e),
      };
    },
    overlay(el, t) {
      const steps = el.querySelectorAll('.method-steps > li');
      const thresholds = [0.18, 0.42, 0.66, 0.88];
      steps.forEach((step, i) => step.classList.toggle('is-visible', t >= thresholds[i]));
      // Number scale-up amplifies as camera rises
      el.querySelectorAll('.method-steps .step__num').forEach((num) => {
        num.style.setProperty('--num-s', `${(1 + t * 0.10).toFixed(3)}`);
      });
    },
  },

  founders: {
    // Low-angle hero shot from the right + slow dolly forward. Figure sits left-of-frame.
    cameraAt(t) {
      const e = easeOut(t);
      return {
        position: { x: lerp(1.6, 1.4, e), y: lerp(0.95, 1.05, e), z: lerp(4.2, 3.5, e) },
        lookAt:   { x: 0.2, y: lerp(1.15, 1.25, e), z: 0 },
        fov:      lerp(38, 36, e),
      };
    },
    overlay(el, t) {
      const head = el.querySelector('.overlay--founders .overlay__header');
      if (head) head.style.setProperty('--ovl-s', `${(1 + t * 0.04).toFixed(4)}`);

      const cards = el.querySelectorAll('.founder-card');
      cards.forEach((c, i) => {
        const th = 0.45 + i * 0.18;
        c.classList.toggle('is-visible', t >= th);
      });
    },
  },

  contact: {
    // Centered push-in + tiny end-orbit. The figure "turns to face you".
    cameraAt(t) {
      if (t < 0.80) {
        const u = easeInOut(t / 0.80);
        return {
          position: { x: 0, y: lerp(1.45, 1.4, u), z: lerp(3.5, 2.5, u) },
          lookAt:   { x: 0, y: lerp(1.15, 1.25, u), z: 0 },
          fov:      lerp(35, 30, u),
        };
      }
      const u = (t - 0.80) / 0.20;
      const a = Math.sin(u * Math.PI) * 0.09; // tiny ±5°
      return {
        position: { x: Math.sin(a) * 2.5, y: 1.4, z: Math.cos(a) * 2.5 },
        lookAt:   { x: 0, y: 1.25, z: 0 },
        fov:      30,
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

export function initScroll({ canvas, camera }) {
  const ScrollTrigger = window.ScrollTrigger;
  if (!ScrollTrigger) { console.warn('[scroll] ScrollTrigger not loaded'); return; }
  window.gsap?.registerPlugin(ScrollTrigger);

  // Apply initial hero state so the first paint is composed
  applyCamera(camera, SECTIONS.hero.cameraAt(0));

  document.querySelectorAll('.sec--3d').forEach((el) => {
    const cfg = SECTIONS[el.dataset.cam];
    if (!cfg) return;

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
        applyCamera(camera, cfg.cameraAt(p));
        cfg.overlay?.(el, p);
      },
    });
  });

  // Static sections fade canvas out
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

  // Lime accents (3 places) reveal once on view
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
