import { createScene } from './scene.js';
import { loadFigure } from './figure.js';
import { createParticles } from './particles.js';
import { createBigNumber } from './big-number.js';
import { initInfiniteCamera } from './scroll.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 767px)').matches;

const canvas = document.getElementById('stage');
const { renderer, scene, camera, mouseLight } = createScene(canvas);

const particles = createParticles(scene);
const bigNumber = createBigNumber(scene);

let figureGroup = null;
let limeMaterial = null;
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

(async () => {
  try {
    const result = await loadFigure(scene);
    figureGroup = result.figureGroup;
    limeMaterial = result.limeMaterial;
    document.body.classList.add('figure-ready');

    const boot = document.querySelector('.boot');
    if (boot) {
      boot.classList.add('boot--hidden');
      setTimeout(() => boot.remove(), 800);
    }

    // Wire global continuous camera path (scroll-driven)
    if (!reduceMotion) {
      initInfiniteCamera({ scene, camera, figureGroup, particles, bigNumber, limeMaterial, renderer });
    } else {
      canvas.style.opacity = '1';
    }

    runHeroEntry();
    bindMethodStepNumber();
  } catch (err) {
    console.error('[main] figure load failed', err);
    document.body.classList.add('figure-failed');
    document.querySelector('.boot')?.classList.add('boot--hidden');
  }
})();

// Drive the big-number plane's digit text + bottom step indicator from
// whichever .method__step block is most visible in the viewport.
function bindMethodStepNumber() {
  const blocks = document.querySelectorAll('.method__step');
  const indicators = document.querySelectorAll('.method__indicator-step');
  if (!blocks.length) return;
  const ratios = new Map();
  const labels = ['01', '02', '03', '04'];
  let lastIdx = -1;

  const apply = (idx) => {
    if (idx === lastIdx) return;
    lastIdx = idx;
    if (bigNumber) bigNumber.setNumber(labels[idx]);
    indicators.forEach((el, i) => el.classList.toggle('is-active', i === idx));
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => ratios.set(e.target, e.intersectionRatio));
    let best = null, bestR = 0;
    ratios.forEach((r, el) => { if (r > bestR) { bestR = r; best = el; } });
    if (!best || bestR < 0.05) return;
    const idx = Math.max(0, Math.min(3, parseInt(best.dataset.step, 10) - 1));
    apply(idx);
  }, { threshold: [0, 0.15, 0.35, 0.55, 0.75, 0.95] });

  blocks.forEach(el => io.observe(el));
}

function runHeroEntry() {
  const gsap = window.gsap;
  if (!gsap) return;
  gsap.timeline()
    .from('.nav__brand', { opacity: 0, y: -8, duration: 0.6 })
    .from('.nav__menu a', { opacity: 0, y: -6, duration: 0.5, stagger: 0.06 }, '-=0.4')
    .from('.nav__status > *', { opacity: 0, y: -6, duration: 0.5, stagger: 0.06 }, '-=0.4')
    .from('.hero__line', { opacity: 0, y: 24, duration: 0.9, stagger: 0.10 }, '-=0.2')
    .from('.hero__actions > *', { opacity: 0, y: 8, duration: 0.5, stagger: 0.08 }, '-=0.3')
    .from('.hero__editorial', { opacity: 0, y: 6, duration: 0.5 }, '-=0.3')
    .from('.hero__scroll', { opacity: 0, y: 6, duration: 0.5 }, '-=0.4')
    .from('.hero__glass', { opacity: 0, y: 24, duration: 0.8, ease: 'power2.out' }, '-=0.5');

  // Lime accents reveal once when their section enters viewport
  const limeObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
  }, { threshold: 0.4 });
  document.querySelectorAll('.lime').forEach((el) => limeObs.observe(el));

  // Section reveals (work cards, method steps, manifesto lines, founder cards)
  // Uses IntersectionObserver — kicks in once each enters view
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll(
    '.work-card, .manifesto__headline span, .manifesto__body, .manifesto__meta, .founder-card, .testimonial-card, .why-card, .service-card'
  ).forEach((el) => revealObs.observe(el));
}

addEventListener('mousemove', (e) => {
  mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

// Glass card mouse-tracked shimmer
const glass = document.querySelector('.hero__glass');
if (glass) {
  addEventListener('mousemove', (e) => {
    const r = glass.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    glass.style.setProperty('--mx', `${mx}%`);
    glass.style.setProperty('--my', `${my}%`);
  }, { passive: true });
}

// Scroll progress bar
const scrollFill = document.querySelector('.hero__scroll-fill');
addEventListener('scroll', () => {
  if (scrollFill) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    scrollFill.style.width = `${(p * 100).toFixed(2)}%`;
  }
}, { passive: true });

// Render loop — only handles per-frame mouse + particle update + render.
// Camera path animation runs on its own rAF loop inside scroll.js.
function tick() {
  mouse.x += (mouse.tx - mouse.x) * 0.06;
  mouse.y += (mouse.ty - mouse.y) * 0.06;

  if (figureGroup) {
    const t = performance.now() * 0.0001;
    const breathY = Math.sin(t) * 0.020;
    const breathX = Math.cos(t * 0.6) * 0.010;
    const baseRot = figureGroup.userData.baseRotY ?? 0;
    figureGroup.rotation.y = baseRot + breathY + mouse.x * 0.18;
    figureGroup.rotation.x = breathX + mouse.y * 0.04;
  }

  if (mouseLight) {
    mouseLight.position.set(camera.position.x + mouse.x * 2.5, camera.position.y + 0.4 + mouse.y * 1.0, camera.position.z - 1.5);
  }

  particles.setMouse(mouse.x, mouse.y);
  particles.update();

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// Lenis smooth scroll
waitForLenis(() => {
  if (reduceMotion || isMobile) return;
  const lenis = new window.Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
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

if (reduceMotion) document.documentElement.classList.add('reduced-motion');
