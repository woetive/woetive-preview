import { createScene } from './scene.js';
import { loadFigure } from './figure.js';
import { createLiquid } from './liquid.js';
import { initScroll } from './scroll.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 767px)').matches;

const canvas = document.getElementById('stage');
const { renderer, scene, camera, mouseLight } = createScene(canvas);

const liquid = createLiquid(scene);

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

    waitForGSAP(() => {
      if (!reduceMotion) initScroll({ canvas, camera, liquid, limeMaterial });
      else canvas.style.opacity = '1';
      window.ScrollTrigger?.refresh();
    });

    runHeroEntry();
  } catch (err) {
    console.error('[main] figure load failed', err);
    document.body.classList.add('figure-failed');
    document.querySelector('.boot')?.classList.add('boot--hidden');
  }
})();

function waitForGSAP(fn) {
  let waited = 0;
  const t = setInterval(() => {
    waited += 50;
    if (window.gsap && window.ScrollTrigger) { clearInterval(t); fn(); }
    else if (waited > 4000) { clearInterval(t); fn(); }
  }, 50);
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

// Site-wide scroll progress bar (lives in hero scroll cue)
const scrollFill = document.querySelector('.hero__scroll-fill');
addEventListener('scroll', () => {
  if (scrollFill) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    scrollFill.style.width = `${(p * 100).toFixed(2)}%`;
  }
}, { passive: true });

// Render loop
function tick() {
  mouse.x += (mouse.tx - mouse.x) * 0.06;
  mouse.y += (mouse.ty - mouse.y) * 0.06;

  if (figureGroup) {
    const t = performance.now() * 0.0001;
    const breathY = Math.sin(t) * 0.020;
    const breathX = Math.cos(t * 0.6) * 0.010;
    figureGroup.rotation.y = breathY + mouse.x * 0.18;
    figureGroup.rotation.x = breathX + mouse.y * 0.04;
  }

  if (mouseLight) {
    // Map mouse to a soft warm light circling above-front of the figure
    mouseLight.position.set(mouse.x * 3.0, 1.7 + mouse.y * 1.2, 2.0);
  }

  liquid.setMouse(mouse.x, mouse.y);
  liquid.update();

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// Lenis smooth scroll
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

if (reduceMotion) document.documentElement.classList.add('reduced-motion');
