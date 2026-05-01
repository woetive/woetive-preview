/* ============================================================
 * Woetive — v18.1: page enter sequence + section reveals + lime accents
 *
 * Runs after main.js sets up Lenis + ScrollTrigger.
 * Listens to:
 *   - 'woetive:boot-done'    — boot loader fade-out done
 *   - 'woetive:scroll-ready' — main.js ScrollTrigger ready
 *
 * Vanilla. Uses gsap + ScrollTrigger globals.
 * ========================================================== */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const has = (sel) => document.querySelector(sel);

  // -------- 1. Hero enter sequence --------------------------
  function heroEnter() {
    if (reduceMotion || typeof gsap === 'undefined') return;

    // Reset state — set initial values before painting
    const eyebrows = document.querySelectorAll('.section--hero .eyebrow');
    const headline = has('.hero__headline');
    const subhead = has('.hero__subhead');
    const actions = has('.hero__actions');
    const scrollCue = has('.scroll-cue');

    if (eyebrows.length) gsap.set(eyebrows, { opacity: 0, y: 8 });
    if (headline) gsap.set(headline, { opacity: 0, y: 16 });
    if (subhead) gsap.set(subhead, { opacity: 0 });
    if (actions) gsap.set(actions, { opacity: 0, y: 8 });
    if (scrollCue) gsap.set(scrollCue, { opacity: 0 });

    // Nav entrance
    const nav = has('.nav');
    if (nav) {
      gsap.set(nav, { y: -16, opacity: 0 });
      gsap.to(nav, {
        y: 0, opacity: 1, duration: 0.5, delay: 0.2,
        ease: 'power3.out',
      });
    }

    const tl = gsap.timeline({ delay: 0.3 });
    if (eyebrows.length) {
      tl.to(eyebrows, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out' });
    }
    if (headline) {
      tl.to(headline, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3');
    }
    if (subhead) {
      tl.to(subhead, { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.5');
    }
    if (actions) {
      tl.to(actions, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
    }

    // Lime accent draw-in (after headline lands)
    const limeAccent = document.querySelector('.section--hero .lime-accent');
    if (limeAccent) {
      tl.add(() => limeAccent.classList.add('lime-accent--visible'), '-=0.2');
    }

    if (scrollCue) {
      tl.to(scrollCue, { opacity: 1, duration: 0.5 }, '-=0.1');
    }
  }

  // -------- 2. Section reveal (static sections) -------------
  function sectionReveals() {
    if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // Make everything visible immediately for reduced-motion
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const targets = document.querySelectorAll('.reveal-on-scroll');
    targets.forEach((el) => {
      gsap.set(el, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: false,
        onEnter: () =>
          gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }),
        onLeaveBack: () =>
          gsap.to(el, { opacity: 0, y: 24, duration: 0.4, ease: 'power2.in' }),
      });
    });

    // Stagger children inside .reveal-stagger
    document.querySelectorAll('.reveal-stagger').forEach((container) => {
      const children = container.children;
      gsap.set(children, { opacity: 0, y: 20 });
      ScrollTrigger.create({
        trigger: container,
        start: 'top 78%',
        once: true,
        onEnter: () =>
          gsap.to(children, {
            opacity: 1, y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out',
          }),
      });
    });
  }

  // -------- 3. Lime accent triggers (in-section) ------------
  // Accent draw-in for any .lime-accent that isn't in hero (hero is in heroEnter)
  function limeAccentTriggers() {
    if (reduceMotion) {
      document.querySelectorAll('.lime-accent').forEach((el) =>
        el.classList.add('lime-accent--visible')
      );
      return;
    }
    if (typeof ScrollTrigger === 'undefined') return;
    document
      .querySelectorAll('.lime-accent:not(.section--hero .lime-accent)')
      .forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 75%',
          once: true,
          onEnter: () => el.classList.add('lime-accent--visible'),
        });
      });
  }

  // -------- 4. Trust ribbon — pause on hover ----------------
  // (CSS-only marquee; we just toggle a class to pause on hover)
  function trustRibbonHover() {
    const ribbon = document.querySelector('.trust-ribbon');
    if (!ribbon) return;
    ribbon.addEventListener('mouseenter', () =>
      ribbon.classList.add('trust-ribbon--paused')
    );
    ribbon.addEventListener('mouseleave', () =>
      ribbon.classList.remove('trust-ribbon--paused')
    );
  }

  // -------- 5. Wire up --------------------------------------
  function start() {
    heroEnter();
    sectionReveals();
    limeAccentTriggers();
    trustRibbonHover();
  }

  // Run after main.js signals scroll-ready (so ScrollTrigger has refreshed)
  let booted = false;
  document.addEventListener('woetive:scroll-ready', () => {
    if (booted) return;
    booted = true;
    start();
  });

  // Fallback — if main.js never fires the event (e.g. reduced-motion), boot anyway
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        if (!booted) {
          booted = true;
          start();
        }
      }, 600);
    });
  } else {
    setTimeout(() => {
      if (!booted) {
        booted = true;
        start();
      }
    }, 600);
  }
})();
