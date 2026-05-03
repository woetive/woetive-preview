import { createScene } from './scene.js';
import { loadFigure } from './figure.js';
import { createFluidBackground } from './bg-fluid.js';
import { initScroll } from './scroll.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 767px)').matches;

const canvas = document.getElementById('stage');
const { renderer, scene, camera } = createScene(canvas);

const fluid = createFluidBackground(scene);

let figureGroup = null;
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

(async () => {
  try {
    const { figureGroup: fg } = await loadFigure(scene);
    figureGroup = fg;
    document.body.classList.add('figure-ready');

    const boot = document.querySelector('.boot');
    if (boot) {
      boot.classList.add('boot--hidden');
      setTimeout(() => boot.remove(), 800);
    }

    waitForGSAP(() => {
      if (!reduceMotion) initScroll({ canvas, camera });
      else canvas.style.opacity = '1';
      window.ScrollTrigger?.refresh();
    });

    runHeroEntry();
  } catch (err) {
    console.error('[main] figure load failed', err);
    document.body.classList.add('figure-failed');
    const boot = document.querySelector('.boot');
    boot?.classList.add('boot--hidden');
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
    .from('.overlay--hero .eyebrow', { opacity: 0, y: 8, duration: 0.6, stagger: 0.12 })
    .from('.hero__headline',         { opacity: 0, y: 16, duration: 0.9 }, '-=0.3')
    .from('.hero__subhead',          { opacity: 0, y: 8, duration: 0.6 }, '-=0.5')
    .from('.overlay--hero .btn',     { opacity: 0, y: 8, duration: 0.6, stagger: 0.1 }, '-=0.3');
}

// Mouse — drives both the fluid background and the figure's gentle Y rotation.
addEventListener('mousemove', (e) => {
  mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;   // -1..1
  mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

// Render loop
function tick() {
  mouse.x += (mouse.tx - mouse.x) * 0.06;
  mouse.y += (mouse.ty - mouse.y) * 0.06;

  if (figureGroup) {
    // Continuous slow breath rotation — figure feels alive even with no cursor
    const t = performance.now() * 0.0001;
    const breathY = Math.sin(t) * 0.025;        // ±1.4°
    const breathX = Math.cos(t * 0.6) * 0.012;  // ±0.7°
    figureGroup.rotation.y = breathY + mouse.x * 0.22;
    figureGroup.rotation.x = breathX + mouse.y * 0.05;
  }

  fluid.setMouse(mouse.x, mouse.y);
  fluid.update();

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// Lenis smooth scroll on desktop only
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
