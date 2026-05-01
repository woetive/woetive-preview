/* ============================================================
 * Woetive — v18: scroll-driven canvas sequences
 *
 * Vanilla ES6+. Depends on:
 *   - gsap (CDN, global `gsap`)
 *   - ScrollTrigger (CDN, global `ScrollTrigger`)
 *   - lenis (CDN, global `Lenis`)
 *
 * Architecture
 * ------------
 *  1. ImageSequence: per-section canvas controller.
 *     - lazy preloads frames (poster eager, rest in batches when section
 *       enters preload window via IntersectionObserver)
 *     - frees frame memory when section is far past viewport
 *     - draws via cover-fit on a DPR-scaled canvas
 *  2. Scroll engine: Lenis smooth scroll, ScrollTrigger pinned-scrub per
 *     canvas section. Method section also drives step fade-ins.
 *  3. Boot loader: bound to first sequence's poster + ~30 frames.
 *  4. Reduced-motion path: skip ScrollTrigger entirely, paint poster, end.
 * ========================================================== */
(() => {
  'use strict';

  // ---------- 1. Capability + environment ---------------------
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = matchMedia('(max-width: 767px)').matches;
  const DPR_CAP = isMobile ? 1.5 : 2;
  const DPR = Math.min(window.devicePixelRatio || 1, DPR_CAP);

  // Frame source helper
  const FRAMES_BASE = '/frames';
  const PRELOAD_AHEAD = '200% 0px';   // start loading when section is 2 viewports away
  const UNLOAD_BEHIND = '-100% 0px';  // free memory when section is 1 viewport past
  const PRELOAD_BATCH = 8;            // parallel decode requests
  const POSTER_BATCH = 30;            // poster + first 30 frames count as "ready"

  const framePath = (seq, idx) => {
    // frame_0001.webp ... frame_0151.webp
    const n = String(idx + 1).padStart(4, '0');
    return `${FRAMES_BASE}/${seq}/frame_${n}.webp`;
  };

  // ---------- 2. ImageSequence controller ---------------------
  class ImageSequence {
    constructor(section) {
      this.section = section;
      this.canvas = section.querySelector('canvas.canvas-sequence');
      this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
      this.seq = section.dataset.sequence;
      this.count = parseInt(section.dataset.frameCount, 10) || 151;
      this.frames = new Array(this.count);   // sparse array, filled on demand
      this.loadedCount = 0;
      this.currentFrame = 0;
      this.posterPromise = null;
      this.fullPromise = null;
      this.posterReady = false;
      this.disposed = false;
      this._raf = 0;

      this._setupCanvas();
      this._renderBackground();
      this._observePreload();
    }

    _setupCanvas() {
      const cw = this.canvas.width || 1600;
      const ch = this.canvas.height || 900;
      // Internal buffer scaled by DPR for crisp render; CSS controls layout size
      this.canvas.width = Math.round(cw * DPR);
      this.canvas.height = Math.round(ch * DPR);
      this.ctx.scale(DPR, DPR);
      this.intrinsic = { w: cw, h: ch };
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }

    _renderBackground() {
      // Paint white before any frame paints — avoids transparent flash on iOS
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, this.intrinsic.w, this.intrinsic.h);
    }

    /**
     * Cover-fit draw: scale image to fully cover canvas, crop overflow centered.
     * Source space: image natural dimensions; dest space: intrinsic (CSS) size.
     */
    drawFrame(idx) {
      idx = Math.max(0, Math.min(this.count - 1, idx | 0));
      const img = this.frames[idx];
      if (!img || !img.complete) {
        this.currentFrame = idx;
        return false;
      }
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
      this.currentFrame = idx;
      return true;
    }

    /** Schedule a draw at next animation frame (for high-frequency scroll updates). */
    requestDraw(idx) {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = 0;
        if (!this.disposed) this.drawFrame(idx);
      });
    }

    _loadOne(idx) {
      if (this.frames[idx]) return Promise.resolve(this.frames[idx]);
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (this.disposed) return resolve(null);
          this.frames[idx] = img;
          this.loadedCount++;
          // Paint immediately if this matches the current scroll position
          if (idx === this.currentFrame) this.drawFrame(idx);
          resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = framePath(this.seq, idx);
      });
    }

    /** Load frame 0 immediately + first POSTER_BATCH frames concurrently. */
    loadPoster() {
      if (this.posterPromise) return this.posterPromise;
      this.posterPromise = (async () => {
        await this._loadOne(0);
        this.posterReady = true;
        this.canvas.classList.add('canvas-sequence--ready');
        // Continue with next batch concurrently — don't await full poster batch
        this._loadBatchedRange(1, POSTER_BATCH);
      })();
      return this.posterPromise;
    }

    /** Load a range [from, to) in batches of PRELOAD_BATCH. Skips already-loaded. */
    async _loadBatchedRange(from, to) {
      from = Math.max(0, from | 0);
      to = Math.min(this.count, to | 0);
      for (let start = from; start < to; start += PRELOAD_BATCH) {
        if (this.disposed) return;
        const batch = [];
        for (let i = start; i < Math.min(start + PRELOAD_BATCH, to); i++) {
          if (!this.frames[i]) batch.push(this._loadOne(i));
        }
        if (batch.length) await Promise.all(batch);
      }
    }

    /** Preload all frames (after poster). Idempotent. */
    loadAll() {
      if (this.fullPromise) return this.fullPromise;
      this.fullPromise = this._loadBatchedRange(1, this.count);
      return this.fullPromise;
    }

    /** Free frame memory (keeps poster). Caller may re-load on demand. */
    free() {
      if (this.disposed) return;
      let kept = 0;
      for (let i = 0; i < this.count; i++) {
        // Keep poster (frame 0) so we never go back to a blank canvas
        if (i === 0 && this.frames[0]) { kept++; continue; }
        if (this.frames[i]) {
          this.frames[i].src = '';   // detach
          this.frames[i] = undefined;
        }
      }
      this.loadedCount = kept;
      this.fullPromise = null;
      this._renderBackground();
      if (this.frames[0]) this.drawFrame(0);
    }

    _observePreload() {
      // Two thresholds: enter (preload), exit (free)
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
          // Free when section is fully past viewport with margin
          if (!e.isIntersecting && this.fullPromise) this.free();
        }
      }, { rootMargin: UNLOAD_BEHIND });
      exit.observe(this.section);
    }

    dispose() {
      this.disposed = true;
      if (this._raf) cancelAnimationFrame(this._raf);
      this.frames.length = 0;
    }
  }

  // ---------- 3. Boot loader -----------------------------------
  function setupBootLoader(firstSeq) {
    const boot = document.querySelector('.boot');
    const fill = document.querySelector('.boot__fill');
    if (!boot) return { dismiss: () => {} };

    const total = POSTER_BATCH;
    let last = 0;
    const tick = () => {
      const loaded = Math.min(firstSeq.loadedCount, total);
      const pct = Math.min(1, loaded / total);
      if (pct !== last) {
        if (fill) fill.style.transform = `scaleX(${pct})`;
        last = pct;
      }
      if (pct < 1 && !firstSeq.disposed) requestAnimationFrame(tick);
      else dismiss();
    };
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      if (fill) fill.style.transform = 'scaleX(1)';
      boot.classList.add('boot--hidden');
      // Remove from DOM after fade so it can't catch focus / scroll
      setTimeout(() => boot.remove(), 700);
    };
    // Safety dismiss — never block the page beyond 4s even on slow networks
    setTimeout(dismiss, 4000);
    requestAnimationFrame(tick);
    return { dismiss };
  }

  // ---------- 4. Smooth scroll (Lenis) + GSAP ticker ----------
  function setupScroll() {
    if (reduceMotion) return null;
    if (typeof Lenis === 'undefined') return null;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return lenis;
  }

  // ---------- 5. Bind scroll-scrub to a section ----------------
  function bindSectionScrub(seq, section) {
    if (typeof ScrollTrigger === 'undefined') return null;
    const isMethod = section.classList.contains('section--method');
    const steps = isMethod ? section.querySelectorAll('.method-step') : null;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=100%',
      scrub: 0.5,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const frame = Math.round(self.progress * (seq.count - 1));
        seq.requestDraw(frame);

        if (steps && steps.length) {
          const p = self.progress;
          for (let i = 0; i < steps.length; i++) {
            const threshold = (i + 1) * 0.25;
            const visible = p >= threshold - 0.12;
            const el = steps[i];
            if (visible !== el.classList.contains('method-step--visible')) {
              el.classList.toggle('method-step--visible', visible);
            }
          }
        }
      },
    });
    return trigger;
  }

  // ---------- 6. Reduced-motion fallback -----------------------
  function paintPosterOnly(sequences) {
    sequences.forEach((seq) => {
      seq.loadPoster().then(() => seq.drawFrame(0));
    });
  }

  // ---------- 7. Bootstrap -------------------------------------
  function init() {
    const sections = Array.from(document.querySelectorAll('section[data-sequence]'));
    if (!sections.length) return;

    const sequences = sections.map((s) => new ImageSequence(s));

    // Boot loader is gated on first sequence's poster batch
    setupBootLoader(sequences[0]);
    // Eagerly load the first sequence so the hero is warm even before scroll
    sequences[0].loadPoster();

    if (reduceMotion) {
      paintPosterOnly(sequences);
      // No ScrollTrigger, no Lenis. Sections still flow naturally per CSS.
      return;
    }

    // Wait until GSAP is on the page (script tag is `defer`, but main.js is
    // also `defer`, so order is guaranteed in modern browsers — still, defend
    // against late init).
    const start = () => {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return setTimeout(start, 50);
      }
      gsap.registerPlugin(ScrollTrigger);
      setupScroll();
      sequences.forEach((seq, i) => bindSectionScrub(seq, sections[i]));
      // Refresh once images settle (some browsers calculate scroll height
      // differently after canvas paints).
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    start();

    // Resize: re-setup canvas DPR + refresh ScrollTrigger
    let resizeTimer = 0;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sequences.forEach((seq) => {
          // Re-paint current frame at new DPR (canvas size unchanged in CSS)
          seq.drawFrame(seq.currentFrame);
        });
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
