/* ============================================================
 * Woetive — Hero Stage v22
 *
 * 3 acts × 121 frames = 363-frame continuous timeline.
 * v3 (REVEAL) → v5 (OFFER) → v2 (POINT).
 * Text appears frame-indexed (sync with figure motion, not scroll %).
 * ========================================================== */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = matchMedia('(max-width: 768px)').matches;

  const ACT_FRAME_COUNTS = { act1: 121, act2: 121, act3: 121 };

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

  function globalToActLocal(globalIdx) {
    for (const [act, r] of Object.entries(ACT_RANGES)) {
      if (globalIdx <= r.end) return { act, localIdx: globalIdx - r.start };
    }
    const last = Object.values(ACT_RANGES).pop();
    return { act: 'act3', localIdx: last.count - 1 };
  }

  function actFolder(act) {
    const n = act.slice(3);
    return `0${n}_act${n}`;
  }

  function framePath(act, localIdx) {
    const num = String(localIdx + 1).padStart(4, '0');
    return `/frames/${actFolder(act)}/frame_${num}.webp`;
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
      this.bgColor = '#FAFAF8';
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
      this.ctx.fillStyle = this.bgColor;
      this.ctx.fillRect(0, 0, this.intrinsic.w, this.intrinsic.h);
    }

    resize() {
      this.setupCanvas();
      this.fillBackground();
      this.draw(Math.round(this.currentFrame));
    }

    /**
     * COVER fit — figure fills the frame edge-to-edge cinematically.
     * Frames are 16:9 wide; on most viewports we crop top/bottom slightly.
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
        // image wider than canvas — fit height, crop sides equally
        dh = h;
        dw = h * imgRatio;
        dx = (w - dw) / 2;
        dy = 0;
      } else {
        // image taller than canvas — fit width, crop top/bottom equally
        dw = w;
        dh = w / imgRatio;
        dx = 0;
        dy = (h - dh) / 2;
      }
      this.ctx.fillStyle = this.bgColor;
      this.ctx.fillRect(0, 0, w, h);
      this.ctx.drawImage(img, dx, dy, dw, dh);
    }

    draw(idx) {
      idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, idx | 0));
      const img = this.images[idx];
      if (img && img.complete && img.naturalWidth) {
        this.drawImage(img);
        return;
      }
      for (let d = 1; d <= 12; d++) {
        const a = idx - d, b = idx + d;
        if (a >= 0 && this.images[a] && this.images[a].complete && this.images[a].naturalWidth) {
          this.drawImage(this.images[a]); return;
        }
        if (b < TOTAL_FRAMES && this.images[b] && this.images[b].complete && this.images[b].naturalWidth) {
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
      this.images[globalIdx] = img;
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
     *  Phase 1 — eager: poster (frame 0) + first frame of each act
     *  Phase 2 — bulk: remaining frames in batches
     */
    async preload(onProgress) {
      const eagerIndices = [0, ACT_RANGES.act2.start, ACT_RANGES.act3.start];
      await Promise.all(eagerIndices.map((i) => this.loadFrame(i)));
      this.canvas.classList.add('is-ready');
      this.draw(0);
      if (onProgress) onProgress(this);

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
    const target = 6;
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
    setTimeout(dismiss, 2200);
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

  function setupNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 100);
    update();
    addEventListener('scroll', update, { passive: true });
  }

  // ---------- Stage scroll choreography ----------------------
  /**
   * Frame-indexed text reveals.
   *
   * Each [data-enter] element becomes visible when globalFrame >= enter.
   * Optional [data-exit]: hidden again past that frame.
   * The parent .hero-overlay also gets is-active when its act range matches.
   *
   * Act 2 parallax: text container drifts +/-20px X opposite to figure slide,
   * mounted via CSS variable on the overlay element.
   */
  function bindStage(sequence) {
    if (typeof ScrollTrigger === 'undefined') return;

    const stage = document.getElementById('stage');
    const overlays = Array.from(document.querySelectorAll('.hero-overlay'));
    const triggers = Array.from(document.querySelectorAll('[data-enter]'));
    const limeAccents = Array.from(document.querySelectorAll('[data-lime-trigger]'));
    const progressBar = document.querySelector('.stage__progress-bar');
    const overlayAct2 = document.querySelector('.hero-overlay[data-act="2"]');
    const scrollCue = document.querySelector('.scroll-cue');

    let activeAct = 1;

    const apply = (globalFrame) => {
      // Activate the right overlay (cross-fade between acts)
      let act;
      if (globalFrame < ACT_RANGES.act1.end + 0.5) act = 1;
      else if (globalFrame < ACT_RANGES.act2.end + 0.5) act = 2;
      else act = 3;

      if (act !== activeAct) {
        activeAct = act;
        overlays.forEach((o) => {
          const a = parseInt(o.dataset.act, 10);
          o.classList.toggle('is-active', a === activeAct);
        });
      }

      // Per-element frame-indexed reveals
      for (const el of triggers) {
        const enter = parseFloat(el.dataset.enter);
        const exit = el.dataset.exit ? parseFloat(el.dataset.exit) : Infinity;
        const visible = globalFrame >= enter && globalFrame < exit;
        if (visible !== el.classList.contains('is-visible')) {
          el.classList.toggle('is-visible', visible);
        }
      }

      // Lime accent draw-ins
      for (const el of limeAccents) {
        const trigger = parseFloat(el.dataset.limeTrigger);
        const visible = globalFrame >= trigger;
        if (visible !== el.classList.contains('is-visible')) {
          el.classList.toggle('is-visible', visible);
        }
      }

      // Act 2 parallax — text drifts opposite to figure motion
      if (overlayAct2) {
        if (act === 2) {
          const localT = (globalFrame - ACT_RANGES.act2.start) / ACT_RANGES.act2.count;
          const offset = (localT - 0.5) * 32; // -16px → +16px
          overlayAct2.style.setProperty('--parallax-x', offset.toFixed(2) + 'px');
        } else {
          overlayAct2.style.setProperty('--parallax-x', '0px');
        }
      }

      // Hide scroll cue past act 1
      if (scrollCue) {
        scrollCue.style.opacity = globalFrame > 100 ? '0' : '';
      }
    };

    ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        sequence.setProgress(p);
        if (progressBar) progressBar.style.transform = `scaleX(${p})`;
        const globalFrame = p * (TOTAL_FRAMES - 1);
        apply(globalFrame);
      },
    });

    // Initial state — activate act 1 + apply triggers for frame 0
    overlays.forEach((o) => o.classList.toggle('is-active', parseInt(o.dataset.act, 10) === 1));
    apply(0);
  }

  // ---------- Reduced-motion fallback -------------------------
  function reducedMotionFallback(sequence) {
    sequence.preload();
    document.querySelectorAll('.hero-overlay').forEach((o) => o.classList.add('is-active'));
    document.querySelectorAll('[data-enter], [data-lime-trigger]').forEach((el) =>
      el.classList.add('is-visible')
    );
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

      requestAnimationFrame(() => {
        sequence.resize();
        ScrollTrigger.refresh();
      });
    };
    start();

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
