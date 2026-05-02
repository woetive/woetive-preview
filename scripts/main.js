/* ============================================================
 * Woetive v20 — scroll-driven canvas with frame sequences
 *
 * Vanilla. Globals: gsap, ScrollTrigger, Lenis.
 * 9 sections, 5 with canvas + 4 static. Frame format: JPG, 4-digit padded.
 * ========================================================== */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = matchMedia('(max-width: 768px)').matches;
  const FRAME_EXT = 'jpg';
  const FRAMES_BASE = '/frames';
  const POSTER_BATCH = 12;            // count toward boot loader

  const padded = (n) => String(n + 1).padStart(4, '0');
  const framePath = (seq, idx) => `${FRAMES_BASE}/${seq}/frame_${padded(idx)}.${FRAME_EXT}`;

  // ---------- FrameSequence ----------------------------------
  class FrameSequence {
    constructor(canvas, basePath, frameCount) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
      this.basePath = basePath;
      this.frameCount = frameCount;
      this.images = new Array(frameCount).fill(null);
      this.currentFrame = 0;
      this.targetFrame = 0;
      this.lerpFactor = 0.15;
      this.rafId = null;
      this.loaded = 0;
      this.disposed = false;
      this.dpr = 1;
      this.posterReady = false;
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

    /** Cover-fit draw, crop overflow centered. */
    draw(idx) {
      idx = Math.max(0, Math.min(this.frameCount - 1, idx | 0));
      const img = this.images[idx];
      if (!img || !img.complete) {
        // Nearest-loaded fallback to avoid blank canvas
        for (let d = 1; d <= 6; d++) {
          const a = idx - d, b = idx + d;
          if (a >= 0 && this.images[a] && this.images[a].complete) {
            this._paintImg(this.images[a]); return;
          }
          if (b < this.frameCount && this.images[b] && this.images[b].complete) {
            this._paintImg(this.images[b]); return;
          }
        }
        return;
      }
      this._paintImg(img);
    }

    _paintImg(img) {
      const w = this.intrinsic.w;
      const h = this.intrinsic.h;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const imgRatio = iw / ih;
      const canvasRatio = w / h;
      let dw, dh, dx, dy;
      if (imgRatio > canvasRatio) {
        dh = h; dw = h * imgRatio; dx = (w - dw) / 2; dy = 0;
      } else {
        dw = w; dh = w / imgRatio; dx = 0; dy = (h - dh) / 2;
      }
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, w, h);
      this.ctx.drawImage(img, dx, dy, dw, dh);
    }

    loadFrame(idx) {
      if (this.images[idx]) return Promise.resolve();
      const img = new Image();
      img.decoding = 'async';
      this.images[idx] = img; // reserve slot to avoid duplicate fetch
      return new Promise((resolve) => {
        img.onload = () => {
          if (this.disposed) return resolve();
          this.loaded++;
          if (idx === Math.round(this.currentFrame)) this.draw(idx);
          resolve();
        };
        img.onerror = () => { this.images[idx] = null; resolve(); };
        img.src = framePath(this.basePath, idx);
      });
    }

    async preload(onProgress) {
      // Poster first
      await this.loadFrame(0);
      this.posterReady = true;
      this.draw(0);
      if (onProgress) onProgress(this);

      // Rest in batches of 8
      const batchSize = 8;
      for (let i = 1; i < this.frameCount; i += batchSize) {
        if (this.disposed) return;
        const batch = [];
        for (let j = 0; j < batchSize && i + j < this.frameCount; j++) {
          batch.push(this.loadFrame(i + j));
        }
        await Promise.all(batch);
        if (onProgress) onProgress(this);
      }
    }

    setProgress(progress) {
      this.targetFrame = Math.max(0, Math.min(1, progress)) * (this.frameCount - 1);
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

    dispose() {
      this.disposed = true;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.images.length = 0;
    }
  }

  // ---------- Boot loader ------------------------------------
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
      document.dispatchEvent(new CustomEvent('woetive:boot-done'));
    };
    let last = 0;
    const tick = () => {
      const pct = Math.min(1, firstSeq.loaded / POSTER_BATCH);
      if (pct !== last) {
        if (fill) fill.style.transform = `scaleX(${pct})`;
        last = pct;
      }
      if (pct < 1 && !firstSeq.disposed && !dismissed) requestAnimationFrame(tick);
      else dismiss();
    };
    setTimeout(dismiss, 4500);
    requestAnimationFrame(tick);
  }

  // ---------- Lenis + GSAP ticker ----------------------------
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

  // ---------- Hero word reveal -------------------------------
  function wrapHeadlineWords() {
    const head = document.querySelector('.hero__headline');
    if (!head) return null;
    // Walk children: text nodes get split into <span class="word">; element
    // children (e.g. .lime-accent) are kept as single word units.
    const out = document.createDocumentFragment();
    const wordsList = [];
    head.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.textContent.split(/(\s+)/);
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) {
            out.appendChild(document.createTextNode(p));
          } else {
            const w = document.createElement('span');
            w.className = 'word';
            w.textContent = p;
            out.appendChild(w);
            wordsList.push(w);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const w = document.createElement('span');
        w.className = 'word';
        w.appendChild(node.cloneNode(true));
        out.appendChild(w);
        wordsList.push(w);
      }
    });
    head.innerHTML = '';
    head.appendChild(out);
    // Stagger transition delays
    wordsList.forEach((w, i) => { w.style.transitionDelay = `${i * 70}ms`; });
    return { headline: head, words: wordsList };
  }

  // ---------- Reveal-on-scroll (static sections) -------------
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

  // ---------- Bind canvas section to ScrollTrigger -----------
  function bindCanvasSection(section, sequence) {
    if (typeof ScrollTrigger === 'undefined') return null;

    const isHero = section.id === 'hero';
    const heroData = isHero ? wrapHeadlineWords() : null;
    const heroLime = section.querySelector('.lime-accent');
    const contactLime = section.id === 'contact' ? section.querySelector('.lime-accent') : null;
    const stepEls = section.querySelectorAll('.method-step');
    const workCards = section.classList.contains('section--work')
      ? section.querySelectorAll('.work-card')
      : [];
    const frameRevealEls = section.querySelectorAll('[data-reveal-frame]');

    const pinDistance = section.dataset.pinDistance
      ? `+=${section.dataset.pinDistance}%`
      : '+=100%';

    return ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: pinDistance,
      scrub: 0.5,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        const frame = p * (sequence.frameCount - 1);
        sequence.setProgress(p);

        // Frame-indexed reveals
        if (frameRevealEls.length) {
          frameRevealEls.forEach((el) => {
            const threshold = parseFloat(el.dataset.revealFrame);
            const visible = frame >= threshold;
            if (visible !== el.classList.contains('is-visible')) {
              el.classList.toggle('is-visible', visible);
            }
          });
        }

        // Hero: word stagger reveal at frame 40+; lime accent at 90+
        if (isHero && heroData) {
          const words = heroData.words;
          // Per-word: word i becomes visible at frame >= 40 + i*8
          words.forEach((w, i) => {
            const threshold = 40 + i * 6;
            const visible = frame >= threshold;
            if (visible !== heroData.headline.classList.contains('is-revealed')) {
              // toggle class on headline once all words pass — simpler approach
            }
          });
          // Toggle headline.is-revealed when frame >= 40
          const allVisible = frame >= 40;
          heroData.headline.classList.toggle('is-revealed', allVisible);

          if (heroLime) {
            heroLime.classList.toggle('is-visible', frame >= 90);
          }
        }

        // Contact: lime accent appears at frame 70
        if (contactLime) {
          contactLime.classList.toggle('is-visible', frame >= 70);
        }

        // Work: card slide-ins at frames 40 / 70 / 100
        if (workCards.length) {
          workCards.forEach((card) => {
            const cardN = parseInt(card.dataset.card, 10);
            const threshold = cardN === 1 ? 40 : cardN === 2 ? 70 : 100;
            const visible = frame >= threshold;
            if (visible !== card.classList.contains('is-visible')) {
              card.classList.toggle('is-visible', visible);
            }
          });
        }

        // Method: step fade-ins by progress thresholds
        if (stepEls.length) {
          stepEls.forEach((step) => {
            const threshold = parseFloat(step.dataset.stepProgress) || 0.5;
            const visible = p >= threshold;
            if (visible !== step.classList.contains('is-visible')) {
              step.classList.toggle('is-visible', visible);
            }
          });
        }
      },
    });
  }

  // ---------- Reduced-motion path ----------------------------
  function paintPostersOnly(sections) {
    sections.forEach(({ section, sequence }) => {
      sequence.preload();
      // Reveal all frame-keyed elements immediately
      section.querySelectorAll('[data-reveal-frame]').forEach((el) =>
        el.classList.add('is-visible')
      );
      section.querySelectorAll('.method-step, .work-card').forEach((el) =>
        el.classList.add('is-visible')
      );
      const lime = section.querySelector('.lime-accent');
      if (lime) lime.classList.add('is-visible');
      const head = section.querySelector('.hero__headline');
      if (head) head.classList.add('is-revealed');
    });
  }

  // ---------- Nav scroll state -------------------------------
  function setupNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    update();
    addEventListener('scroll', update, { passive: true });
  }

  // ---------- Bootstrap --------------------------------------
  function init() {
    setupNavScroll();
    setupRevealObservers();

    const canvasSections = Array.from(document.querySelectorAll('section[data-sequence]'));
    const sections = canvasSections.map((section) => {
      const canvas = section.querySelector('canvas.scroll-canvas');
      const seq = section.dataset.sequence;
      const count = parseInt(section.dataset.frameCount, 10) || 121;
      const sequence = new FrameSequence(canvas, seq, count);
      return { section, sequence };
    });

    if (!sections.length) return;

    // Boot loader gated on first section's poster batch
    setupBootLoader(sections[0].sequence);

    // Eager-preload all sequences (start with hero, others go in parallel after)
    sections[0].sequence.preload(() => {});
    // Start preloading remaining sequences after a short delay so hero gets bandwidth first
    setTimeout(() => {
      for (let i = 1; i < sections.length; i++) {
        sections[i].sequence.preload(() => {});
      }
    }, 600);

    if (reduceMotion) {
      paintPostersOnly(sections);
      return;
    }

    // Wait for GSAP + ScrollTrigger
    const waitAndInit = () => {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return setTimeout(waitAndInit, 50);
      }
      gsap.registerPlugin(ScrollTrigger);
      setupScroll();

      sections.forEach(({ section, sequence }) => bindCanvasSection(section, sequence));

      // Refresh after layout settles
      requestAnimationFrame(() => {
        sections.forEach(({ sequence }) => sequence.resize());
        ScrollTrigger.refresh();
      });
    };
    waitAndInit();

    // Resize handler
    let resizeTimer = 0;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sections.forEach(({ sequence }) => sequence.resize());
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
