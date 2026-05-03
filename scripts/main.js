import * as THREE from 'three';
import { createScene } from './scene.js';
import { loadFigure, applyIdleBreathing } from './figure.js';
import { initScrollConductor } from './scroll-conductor.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 767px)').matches;

const canvas = document.getElementById('stage-canvas');
const { renderer, scene, camera } = createScene(canvas);

let bones = {};
let figureMaterial = null;

(async () => {
  try {
    const result = await loadFigure(scene);
    bones = result.bones;
    figureMaterial = result.figureMaterial;
    document.body.classList.add('figure-ready');

    const boot = document.querySelector('.boot');
    if (boot) {
      boot.classList.add('boot--hidden');
      setTimeout(() => boot.remove(), 800);
    }

    waitForGSAP(() => {
      if (!reduceMotion) {
        initScrollConductor({ canvas, camera, bones, figureMaterial });
      } else {
        canvas.style.opacity = '1';
      }
      window.ScrollTrigger?.refresh();
    });

    runHeroEntry();
  } catch (err) {
    console.error('[main] figure load failed', err);
    document.body.classList.add('figure-failed');
  }
})();

function waitForGSAP(fn) {
  let waited = 0;
  const t = setInterval(() => {
    waited += 50;
    if (window.gsap && window.ScrollTrigger) { clearInterval(t); fn(); }
    else if (waited > 4000) { clearInterval(t); console.warn('[main] GSAP not available'); fn(); }
  }, 50);
}

function runHeroEntry() {
  const gsap = window.gsap;
  if (!gsap) return;
  const tl = gsap.timeline();
  tl.from('.overlay--hero .eyebrow', { opacity: 0, y: 8, duration: 0.6, stagger: 0.12 })
    .from('.hero__headline',         { opacity: 0, y: 16, duration: 0.9 }, '-=0.3')
    .from('.hero__subhead',          { opacity: 0, y: 8, duration: 0.6 }, '-=0.5')
    .from('.overlay--hero .btn',     { opacity: 0, y: 8, duration: 0.6, stagger: 0.1 }, '-=0.3');
  // Lime accent reveals are wired in scroll-conductor (triggers when each enters view)
}

function tick() {
  applyIdleBreathing(bones);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

waitForLenis(() => {
  if (reduceMotion || isMobile) return;
  const lenis = new window.Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', () => window.ScrollTrigger?.update());
});

function waitForLenis(fn) {
  let waited = 0;
  const t = setInterval(() => {
    waited += 50;
    if (window.Lenis) { clearInterval(t); fn(); }
    else if (waited > 4000) { clearInterval(t); }
  }, 50);
}

const nav = document.querySelector('.nav');
addEventListener('scroll', () => {
  if (!nav) return;
  nav.classList.toggle('is-scrolled', window.scrollY > 8);
}, { passive: true });

if (isMobile) {
  document.querySelectorAll('.interlude__video').forEach(v => v.pause());
}
if (reduceMotion) {
  document.documentElement.classList.add('reduced-motion');
}
