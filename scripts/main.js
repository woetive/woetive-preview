/* ============================================================
 * Woetive — v18.1: scroll-driven canvas sequences
 *
 * Critical fixes over v18:
 *   - Lerp-based frame interpolation (no more visible step changes)
 *   - Bidirectional smooth scrub (forward + reverse identical feel)
 *   - Tighter Lenis params (less floaty, more grounded)
 *   - Resize-safe DPR + canvas re-measure
 *   - Eager preload of first 5 frames per sequence in parallel
 *   - Lookahead window (load ±30 around current target)
 *
 * Vanilla ES6+. Depends on globals: gsap, ScrollTrigger, Lenis.
 * ========================================================== */
(() => {
  'use strict';

  // ---------- 1. Capability + environment ---------------------
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = matchMedia('(max-width: 767px)').matches;
  const FRAMES_BASE = '/frames';
  const PRELOAD_AHEAD = '150% 0px';
  const UNLOAD_BEHIND = '-100% 0px';
  const PRELOAD_BATCH = 8;
  const POSTER_BATCH = 30;
  const LOOKAHEAD = 30;            // priority window around current frame
  const LERP_FACTOR = 0.12;        // 0.08 silky, 0.2 snappy

  const padded = (n) => String(n + 1).padStart(4, '0');
  const framePath = (seq, idx) => `${FRAMES_BASE}/${seq}/frame_${padded(idx)}.webp`;

  // Sequences registry — keyed by section id
  const sequences = Object.create(null);

  // ---------- 2. ImageSequence controller ---------------------
  class ImageSequence {
    constructor(section) {
      this.id = section.id;
      this.section = section;
      this.canvas = section.querySelector('canvas.canvas-sequence');
      this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
      this.seq = section.dataset.sequence;
      this.frameCount = parseInt(section.dataset.frameCount, 10) || 151;

      this.frames = new Array(this.frameCount);   // sparse array
      this.loadedCount = 0;

      // Lerp state
      this.targetFrame = 0;
      this.currentFrame = 0;
      this.isAnimating = false;
      this.rafId = null;

      this.posterPromise = null;
      this.fullPromise = null;
      this.disposed = false;
      this.dpr = 1;

      this.resize();
      this._renderBackground();
      this._observePreload();
    }

    /**
     * Re-measure canvas + DPR. Called on init, resize, and after layout settles.
     */
    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dprCap = isMobile ? 1.5 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      // Internal buffer at DPR scale
      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);
      this.intrinsic = { w, h };
      this.dpr = dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }

    _renderBackground() {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, this.intrinsic.w, this.intrinsic.h);
    }

    /**
     * Cover-fit draw. Crops overflow centered.
     */
    drawImage(img) {
      const cw = this.intrinsic.w;
      const ch = this.intrinsic.h;
      const iw = img.naturalWidth || cw;
      const ih = img.naturalHeight || ch;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) * 0.5;
      const dy = (ch - dh) * 0.5;
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, cw, ch);
      this.ctx.drawImage(img, dx, dy, dw, dh);
    }

    /**
     * Draw a specific frame index (rounded). Falls back to nearest loaded
     * frame if requested isn't ready yet (no white-flash blink).
     */
    draw(frameIndex) {
      const idx = Math.max(0, Math.min(this.frameCount - 1, Math.round(frameIndex)));
      const img = this.frames[idx];
      if (img && img.complete) {
        this.drawImage(img);
        return idx;
      }
      // Nearest fallback search (max 8 steps each way to limit cost)
      for (let d = 1; d <= 8; d++) {
        const a = idx - d, b = idx + d;
        if (a >= 0 && this.frames[a] && this.frames[a].complete) {
          this.drawImage(this.frames[a]);
          return a;
        }
        if (b < this.frameCount && this.frames[b] && this.frames[b].complete) {
          this.drawImage(this.frames[b]);
          return b;
        }
      }
      return -1;
    }

    /**
     * Set the desired (scroll-driven) frame and start the lerp loop if idle.
     */
    setTargetFrame(progress) {
      this.targetFrame = Math.max(0, Math.min(1, progress)) * (this.frameCount - 1);
      // Prioritise loading the lookahead window around the target
      this._priorityLoad(Math.round(this.targetFrame));
      if (!this.isAnimating) this._startRenderLoop();
    }

    _startRenderLoop() {
      this.isAnimating = true;
      const loop = () => {
        if (this.disposed) {
          this.isAnimating = false;
          return;
        }
        const diff = this.targetFrame - this.currentFrame;
        if (Math.abs(diff) < 0.01) {
          this.currentFrame = this.targetFrame;
          this.draw(this.currentFrame);
          this.isAnimating = false;
          this.rafId = null;
          return;
        }
        // Linear interpolation toward target
        this.currentFrame += diff * LERP_FACTOR;
        this.draw(this.currentFrame);
        this.rafId = requestAnimationFrame(loop);
      };
      loop();
    }

    /**
     * Load priority window: targetFrame ± LOOKAHEAD frames.
     * Already-loaded indices are skipped.
     */
    _priorityLoad(centerIdx) {
      const from = Math.max(0, centerIdx - LOOKAHEAD);
      const to = Math.min(this.frameCount, centerIdx + LOOKAHEAD + 1);
      // Fire-and-forget loads — don't block scroll
      for (let i = from; i < to; i++) {
        if (!this.frames[i]) this._loadOne(i);
      }
    }

    _loadOne(idx) {
      if (this.frames[idx]) return Promise.resolve(this.frames[idx]);
      // Mark slot to prevent duplicate fetches
      const placeholder = { complete: false };
      this.frames[idx] = placeholder;
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (this.disposed) return resolve(null);
          this.frames[idx] = img;
          this.loadedCount++;
          // If this matches what scroll wants right now, repaint
          if (Math.round(this.currentFrame) === idx) {
            this.draw(this.currentFrame);
          }
          resolve(img);
        };
        img.onerror = () => {
          this.frames[idx] = undefined;
          resolve(null);
        };
        img.src = framePath(this.seq, idx);
      });
    }

    /** Eagerly load frame 0 + first POSTER_BATCH frames. */
    loadPoster() {
      if (this.posterPromise) return this.posterPromise;
      this.posterPromise = (async () => {
        await this._loadOne(0);
        this.canvas.classList.add('canvas-sequence--ready');
        // Concurrent first-batch (don't await)
        this._loadBatchedRange(1, POSTER_BATCH);
        // Paint frame 0 immediately for posters
        if (this.frames[0] && this.frames[0].complete) {
          this.currentFrame = 0;
          this.draw(0);
        }
      })();
      return this.posterPromise;
    }

    async _loadBatchedRange(from, to) {
      from = Math.max(0, from | 0);
      to = Math.min(this.frameCount, to | 0);
      for (let start = from; start < to; start += PRELOAD_BATCH) {
        if (this.disposed) return;
        const batch = [];
        for (let i = start; i < Math.min(start + PRELOAD_BATCH, to); i++) {
          if (!this.frames[i] || !this.frames[i].complete) batch.push(this._loadOne(i));
        }
        if (batch.length) await Promise.all(batch);
      }
    }

    loadAll() {
      if (this.fullPromise) return this.fullPromise;
      this.fullPromise = this._loadBatchedRange(0, this.frameCount);
      return this.fullPromise;
    }

    /** Free non-poster frames when section is far past viewport. */
    free() {
      if (this.disposed) return;
      let kept = 0;
      for (let i = 0; i < this.frameCount; i++) {
        if (i === 0 && this.frames[0] && this.frames[0].complete) { kept++; continue; }
        const f = this.frames[i];
        if (f && f.src) f.src = '';
        this.frames[i] = undefined;
      }
      this.loadedCount = kept;
      this.fullPromise = null;
      // Repaint poster so we never show black canvas
      if (this.frames[0]) this.draw(0);
    }

    _observePreload() {
      if (!('IntersectionObserver' in window)) {
        this.loadPoster().then(() => this.loadAll());
        return;
      }
      const enter = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.loadPoster().then(() => this.loadAll());
          enter.disconnect();
        }
      }, { rootMargin: PRELOAD_AHEAD });
      enter.observe(this.section);

      const exit = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting && this.fullPromise) this.free();
        }
      }, { rootMargin: UNLOAD_BEHIND });
      exit.observe(this.section);
    }

    dispose() {
      this.disposed = true;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.frames.length = 0;
    }
  }

  // ---------- 3. Boot loader -----------------------------------
  function setupBootLoader(firstSeq) {
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
      // Notify animations.js to start page enter
      document.dispatchEvent(new CustomEvent('woetive:boot-done'));
    };

    const total = POSTER_BATCH;
    let last = 0;
    const tick = () => {
      const loaded = Math.min(firstSeq.loadedCount, total);
      const pct = Math.min(1, loaded / total);
      if (pct !== last) {
        if (fill) fill.style.transform = `scaleX(${pct})`;
        last = pct;
      }
      if (pct < 1 && !firstSeq.disposed && !dismissed) requestAnimationFrame(tick);
      else dismiss();
    };
    setTimeout(dismiss, 4000);   // never block more than 4s
    requestAnimationFrame(tick);
  }

  // ---------- 4. Lenis smooth scroll ---------------------------
  function setupScroll() {
    if (reduceMotion) return null;
    if (typeof Lenis === 'undefined') return null;
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
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

  // ---------- 5. Bind scroll-scrub to a section ----------------
  function bindSectionScrub(seq, section, opts = {}) {
    if (typeof ScrollTrigger === 'undefined') return null;
    const isMethod = section.classList.contains('section--method');
    const steps = isMethod ? section.querySelectorAll('.method-step') : null;
    const pinDistance = opts.pinDistance || (isMethod ? '+=130%' : '+=100%');

    return ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: pinDistance,
      scrub: 0.5,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        seq.setTargetFrame(p);

        if (steps && steps.length) {
          for (let i = 0; i < steps.length; i++) {
            const threshold = (i + 1) * 0.22;
            const fadeRange = 0.10;
            const localProgress = (p - threshold) / fadeRange;
            const opacity = Math.max(0, Math.min(1, localProgress));
            const translate = (1 - opacity) * 12;
            const el = steps[i];
            el.style.opacity = opacity;
            el.style.transform = `translateY(${translate}px)`;
            // Toggle class for any CSS-driven side-effects
            const visible = opacity > 0.5;
            if (visible !== el.classList.contains('method-step--visible')) {
              el.classList.toggle('method-step--visible', visible);
            }
          }
        }
      },
    });
  }

  // ---------- 6. Reduced-motion fallback -----------------------
  function paintPosterOnly(seqs) {
    seqs.forEach((seq) => seq.loadPoster().then(() => seq.draw(0)));
  }

  // ---------- 7. Bootstrap -------------------------------------
  function init() {
    const sections = Array.from(document.querySelectorAll('section[data-sequence]'));
    if (!sections.length) return;

    const seqList = sections.map((s) => {
      const seq = new ImageSequence(s);
      sequences[s.id] = seq;
      return seq;
    });

    setupBootLoader(seqList[0]);
    seqList[0].loadPoster();

    // Eager preload: first 5 frames of EVERY sequence, in parallel
    const eagerPromises = [];
    seqList.forEach((seq) => {
      for (let i = 0; i < 5; i++) eagerPromises.push(seq._loadOne(i));
    });
    Promise.all(eagerPromises);

    if (reduceMotion) {
      paintPosterOnly(seqList);
      return;
    }

    const start = () => {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return setTimeout(start, 50);
      }
      gsap.registerPlugin(ScrollTrigger);
      setupScroll();
      seqList.forEach((seq, i) => bindSectionScrub(seq, sections[i]));
      // Refresh ScrollTrigger after layout settles
      requestAnimationFrame(() => {
        seqList.forEach((s) => s.resize());
        ScrollTrigger.refresh();
      });
      // Notify animations.js — main is ready
      document.dispatchEvent(new CustomEvent('woetive:scroll-ready'));
    };
    start();

    // Resize handling
    let resizeTimer = 0;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        seqList.forEach((seq) => {
          seq.resize();
          seq.draw(seq.currentFrame);
        });
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }, 150);
    }, { passive: true });

    // Expose registry for animations.js
    window.__woetiveSequences = sequences;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
