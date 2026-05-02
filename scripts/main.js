/* ============================================================
 * Woetive — v21 Stage Architecture
 *
 * ONE pinned canvas, 5 acts, 605 frames continuous timeline.
 * Vanilla. Globals: gsap, ScrollTrigger, Lenis.
 * ========================================================== */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = matchMedia('(max-width: 768px)').matches;

  // Frames per act. Adjust if folder counts differ.
  const ACT_FRAME_COUNTS = {
    act1: 121,
    act2: 121,
    act3: 121,
    act4: 121,
    act5: 121,
  };

  // Build cumulative ranges for global frame index → (act, localIdx)
  function buildRanges() {
    const ranges = {};
    let cum = 0;
    for (const [act, count] of Object.entries(ACT_FRAME_COUNTS)) {
      ranges[act] = { start: cum, end: cum + count - 1, count };
      cum += count;
    }
    return { ranges, total: cum };
  }
  const { ranges: ACT_RANGES, total: TOTAL_FRAMES } = buildRanges();

  // Map global index → folder + local index
  function globalToActLocal(globalIdx) {
    for (const [act, r] of Object.entries(ACT_RANGES)) {
      if (globalIdx <= r.end) {
        return { act, localIdx: globalIdx - r.start };
      }
    }
    const last = Object.values(ACT_RANGES).pop();
    return { act: 'act5', localIdx: last.count - 1 };
  }

  function actFolder(act) {
    // 'act1' → '01_act1'
    const n = act.slice(3);
    return `0${n}_act${n}`;
  }

  function framePath(act, localIdx) {
    const num = String(localIdx + 1).padStart(4, '0');
    return `/frames/${actFolder(act)}/frame_${num}.jpg`;
  }

  // ---------- StageSequence ----------------------------------
  class StageSequence {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
      this.images = new Array(TOTAL_FRAMES).fill(null);
      this.currentFrame = 0;
      this.targetFrame = 0;
      this.lerpFactor = 0.18;
      this.rafId = null;
      this.loaded = 0;
      this.dpr = 1;
      this.disposed = false;
      this.setupCanvas();
      this.fillBackground();
    }

    setupCanvas() {
      const dprCap = isMobile ? 1.5 : 2;
      this.dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      this.canvas.width = Math.floor(w * this.dpr);
      this.canvas.height = Math.floor(h * this.dpr);
      this.intrinsic = { w, h };
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }

    fillBackground() {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, this.intrinsic.w, this.intrinsic.h);
    }

    resize() {
      this.setupCanvas();
      this.fillBackground();
      this.draw(Math.round(this.currentFrame));
    }

    /**
     * CONTAIN fit — figure is never cropped, white background fills empty space.
     */
    drawImage(img) {
      const w = this.intrinsic.w;
      const h = this.intrinsic.h;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const imgRatio = iw / ih;
      const canvasRatio = w / h;
      let dw, dh, dx, dy;
      if (imgRatio > canvasRatio) {
        dw = w;
        dh = w / imgRatio;
        dx = 0;
        dy = (h - dh) / 2;
      } else {
        dh = h;
        dw = h * imgRatio;
        dx = (w - dw) / 2;
        dy = 0;
      }
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, w, h);
      this.ctx.drawImage(img, dx, dy, dw, dh);
    }

    draw(idx) {
      idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, idx | 0));
      const img = this.images[idx];
      if (img && img.complete) {
        this.drawImage(img);
        return;
      }
      // Nearest-loaded fallback — search bidirectional, max 12 steps
      for (let d = 1; d <= 12; d++) {
        const a = idx - d, b = idx + d;
        if (a >= 0 && this.images[a] && this.images[a].complete) {
          this.drawImage(this.images[a]); return;
        }
        if (b < TOTAL_FRAMES && this.images[b] && this.images[b].complete) {
          this.drawImage(this.images[b]); return;
        }
      }
    }

    setProgress(progress) {
      this.targetFrame = Math.max(0, Math.min(1, progress)) * (TOTAL_FRAMES - 1);
      if (!this.rafId) this.startLoop();
    }

    startLoop() {
      const loop = () => {
        if (this.disposed) { this.rafId = null; return; }
        const diff = this.targetFrame - this.currentFrame;
        if (Math.abs(diff) < 0.01) {
          this.currentFrame = this.targetFrame;
          this.draw(Math.round(this.currentFrame));
          this.rafId = null;
          return;
        }
        this.currentFrame += diff * this.lerpFactor;
        this.draw(Math.round(this.currentFrame));
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }

    loadFrame(globalIdx) {
      if (this.images[globalIdx]) return Promise.resolve();
      const { act, localIdx } = globalToActLocal(globalIdx);
      const img = new Image();
      img.decoding = 'async';
      this.images[globalIdx] = img;       // reserve slot
      return new Promise((resolve) => {
        img.onload = () => {
          if (this.disposed) return resolve();
          this.loaded++;
          if (Math.round(this.currentFrame) === globalIdx) this.draw(globalIdx);
          resolve();
        };
        img.onerror = () => { this.images[globalIdx] = null; resolve(); };
        img.src = framePath(act, localIdx);
      });
    }

    /**
     * Two-phase preload:
     *  Phase 1 — eager: poster (frame 0) + first frame of each subsequent act
     *            so act transitions are instant
     *  Phase 2 — bulk: rest of frames in batches of 12
     */
    async preload(onProgress) {
      // Phase 1 — eager keyframes
      const eagerIndices = [0];
      let cum = ACT_RANGES.act1.count;
      for (const act of ['act2', 'act3', 'act4', 'act5']) {
        eagerIndices.push(cum);
        cum += ACT_RANGES[act].count;
      }
      await Promise.all(eagerIndices.map((i) => this.loadFrame(i)));
      this.canvas.classList.add('is-ready');
      this.draw(0);
      if (onProgress) onProgress(this);

      // Phase 2 — bulk
      const batchSize = 12;
      for (let i = 1; i < TOTAL_FRAMES; i += batchSize) {
        if (this.disposed) return;
        const batch = [];
        for (let j = 0; j < batchSize && i + j < TOTAL_FRAMES; j++) {
          if (!this.images[i + j] || !this.images[i + j].complete) {
            batch.push(this.loadFrame(i + j));
          }
        }
        if (batch.length) await Promise.all(batch);
        if (onProgress) onProgress(this);
      }
    }

    dispose() {
      this.disposed = true;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.images.length = 0;
    }
  }

  // ---------- Boot loader ------------------------------------
  function setupBootLoader(seq) {
    const boot = document.querySelector('.boot');
    const fill = document.querySelector('.boot__fill');
    if (!boot) return;
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      if (fill) fill.style.transform = 'scaleX(1)';
      boot.classList.add('boot--hidden');
      setTimeout(() => boot.remove(), 700);
      document.dispatchEvent(new CustomEvent('woetive:boot-done'));
    };
    // Watch loaded count for first ~10 frames
    const target = 10;
    let last = 0;
    const tick = () => {
      const pct = Math.min(1, seq.loaded / target);
      if (pct !== last) {
        if (fill) fill.style.transform = `scaleX(${pct})`;
        last = pct;
      }
      if (pct < 1 && !seq.disposed && !dismissed) requestAnimationFrame(tick);
      else dismiss();
    };
    setTimeout(dismiss, 2500);
    boot.addEventListener('click', dismiss);
    requestAnimationFrame(tick);
  }

  // ---------- Lenis smooth scroll ----------------------------
  function setupScroll() {
    if (reduceMotion) return null;
    if (typeof Lenis === 'undefined') return null;
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      syncTouch: true,
      syncTouchLerp: 0.075,
    });
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return lenis;
  }

  // ---------- Reveal observer for static sections -------------
  function setupRevealObservers() {
    if (reduceMotion) {
      document.querySelectorAll('.reveal-on-scroll, .reveal-stagger').forEach((el) =>
        el.classList.add('is-visible')
      );
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal-on-scroll, .reveal-stagger').forEach((el) => io.observe(el));
  }

  // ---------- Nav scroll state -------------------------------
  function setupNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 100);
    update();
    addEventListener('scroll', update, { passive: true });
  }

  // ---------- Hero entrance ----------------------------------
  function heroEntrance() {
    const heroOverlay = document.querySelector('.overlay--hero');
    const limeAccent = heroOverlay && heroOverlay.querySelector('.lime-accent');

    if (reduceMotion || typeof gsap === 'undefined') {
      if (heroOverlay) heroOverlay.classList.add('is-active');
      if (limeAccent) limeAccent.classList.add('is-visible');
      return;
    }

    const start = () => {
      // Mark hero as active so opacity transitions correctly
      if (heroOverlay) heroOverlay.classList.add('is-active');

      const eyebrows = document.querySelectorAll('.overlay--hero .eyebrow');
      const headline = document.querySelector('.overlay--hero .overlay__headline');
      const subhead = document.querySelector('.overlay--hero .overlay__subhead');
      const ctaButtons = document.querySelectorAll('.overlay--hero .btn');

      gsap.set([eyebrows, headline, subhead, ctaButtons], { opacity: 0, y: 12 });

      const tl = gsap.timeline();
      tl.to(eyebrows, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' })
        .to(headline, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.3')
        .to(subhead, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5')
        .to(ctaButtons, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, '-=0.3');

      // Lime accent draws in 1.4s after page load
      setTimeout(() => {
        if (limeAccent) limeAccent.classList.add('is-visible');
      }, 1400);
    };

    const canvas = document.getElementById('stage-canvas');
    if (canvas && canvas.classList.contains('is-ready')) {
      start();
    } else if (canvas) {
      const id = setInterval(() => {
        if (canvas.classList.contains('is-ready')) {
          clearInterval(id);
          start();
        }
      }, 80);
      setTimeout(() => { clearInterval(id); start(); }, 1600);
    } else {
      start();
    }
  }

  // ---------- Stage scroll choreography ----------------------
  function bindStage(sequence) {
    if (typeof ScrollTrigger === 'undefined') return;

    const stage = document.getElementById('stage');
    const overlays = Array.from(document.querySelectorAll('.overlay'));
    const progressBar = document.querySelector('.stage__progress-bar');
    const workCards = document.querySelectorAll('.overlay--work .work-card');
    const methodSteps = document.querySelectorAll('.overlay--method .method-step');
    const contactLime = document.querySelector('.overlay--contact .lime-accent');

    let activeAct = 1;

    ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress; // 0–1 across all 5 acts
        sequence.setProgress(p);

        if (progressBar) progressBar.style.transform = `scaleX(${p})`;

        // Determine active act (each act = 20% of stage scroll)
        let act;
        if (p < 0.2) act = 1;
        else if (p < 0.4) act = 2;
        else if (p < 0.6) act = 3;
        else if (p < 0.8) act = 4;
        else act = 5;

        if (act !== activeAct) {
          activeAct = act;
          overlays.forEach((o) => {
            const a = parseInt(o.dataset.act, 10);
            o.classList.toggle('is-active', a === activeAct);
          });
        }

        // Frame-indexed sub-events
        const globalFrame = p * (TOTAL_FRAMES - 1);

        // Act 3 (work cards) — slide-in based on local frame within act 3
        if (activeAct === 3) {
          const act3LocalFrame = globalFrame - ACT_RANGES.act3.start;
          workCards.forEach((card) => {
            const cardN = parseInt(card.dataset.card, 10);
            const threshold = cardN === 1 ? 30 : cardN === 2 ? 60 : 90;
            card.classList.toggle('is-visible', act3LocalFrame >= threshold);
          });
        } else if (activeAct < 3) {
          // Hide cards if user scrolls back before act 3
          workCards.forEach((card) => card.classList.remove('is-visible'));
        } else {
          // Past act 3 — keep all visible
          workCards.forEach((card) => card.classList.add('is-visible'));
        }

        // Act 4 (method steps) — fade in by local progress within act 4
        if (activeAct === 4) {
          const act4Local = (p - 0.6) / 0.2; // 0..1 within act 4
          methodSteps.forEach((step) => {
            const stepN = parseInt(step.dataset.step, 10);
            const threshold = (stepN - 1) * 0.25;
            step.classList.toggle('is-visible', act4Local >= threshold);
          });
        } else if (activeAct < 4) {
          methodSteps.forEach((step) => step.classList.remove('is-visible'));
        } else {
          methodSteps.forEach((step) => step.classList.add('is-visible'));
        }

        // Act 5 (contact lime accent) — appears in last 30% of act 5
        if (contactLime) {
          const act5Local = (p - 0.8) / 0.2; // 0..1 within act 5
          const visible = activeAct === 5 && act5Local >= 0.3;
          contactLime.classList.toggle('is-visible', visible);
        }
      },
    });

    // Initial sync — ensure act 1 is active
    overlays.forEach((o) => {
      const a = parseInt(o.dataset.act, 10);
      o.classList.toggle('is-active', a === 1);
    });
  }

  // ---------- Reduced-motion fallback -------------------------
  function reducedMotionFallback(sequence) {
    sequence.preload();
    // Show all overlays as static blocks (CSS handles vertical layout)
    document.querySelectorAll('.overlay').forEach((o) => o.classList.add('is-active'));
    document.querySelectorAll('.work-card, .method-step').forEach((el) => el.classList.add('is-visible'));
    document.querySelectorAll('.lime-accent').forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- Bootstrap --------------------------------------
  function init() {
    setupNavScroll();
    setupRevealObservers();

    const canvas = document.getElementById('stage-canvas');
    if (!canvas) return;
    const sequence = new StageSequence(canvas);

    setupBootLoader(sequence);
    sequence.preload();

    if (reduceMotion) {
      reducedMotionFallback(sequence);
      return;
    }

    const start = () => {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return setTimeout(start, 50);
      }
      gsap.registerPlugin(ScrollTrigger);
      setupScroll();
      bindStage(sequence);
      heroEntrance();

      requestAnimationFrame(() => {
        sequence.resize();
        ScrollTrigger.refresh();
      });
    };
    start();

    // Resize handler
    let resizeTimer = 0;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sequence.resize();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }, 150);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
