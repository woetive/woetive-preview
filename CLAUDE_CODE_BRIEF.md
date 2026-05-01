# WOETIVE v18 — Build Brief for Claude Code

You are Claude Code, building the v18 release of woetive-preview.

## Mission

Replace the current static landing page (v17, commit `839519e`) with a new scroll-driven cinematic version that uses canvas-based image sequences. Same vanilla HTML+CSS+JS philosophy (no build step). Auto-deploys to Vercel on push to `main`.

---

## Repository Context

- **GitHub:** `github.com/woetive/woetive-preview`
- **Vercel project:** `woetive-preview-cmvq.vercel.app`
- **Branch:** `main` (auto-deploy)
- **Framework:** static (no build)
- **Current state:** v17 deployed — full HTML site with hero video, 10 sections
- **Action:** Replace `index.html`, `styles/`, `scripts/` with the new version. Keep the existing `/assets/` folder if it has founder portraits worth preserving (joshua.webp, daniel.webp).

---

## What This Bundle Contains

```
/
├── index.html              ← Starter HTML, 7 sections, semantic markup. Polish/extend.
├── styles/main.css         ← Complete design system. Use as-is or refine.
├── frames/                 ← 5 image sequences, pre-baked WebP. DO NOT MODIFY.
│   ├── 01_act1_reveal/     ← 151 frames: ultra-macro lime line → close-up reveal
│   ├── 02_act1_pullback/   ← 151 frames: close-up → full body
│   ├── 03_act1_pointing/   ← 151 frames: full body → wide gallery + pointing gesture
│   ├── 04_act2_compose/    ← 151 frames: top-down figure composing brand artifacts
│   └── 05_act3_invitation/ ← 151 frames: frontal figure raising hand in invitation
├── vercel.json             ← Static deploy config with cache headers for frames
└── README.md               ← Deploy instructions for the user
```

**You need to write:** `scripts/main.js` (the canvas image sequence + GSAP ScrollTrigger + Lenis logic). Everything else is provided as starter you can refine.

---

## Brand Strategy

### Position
**Outsourced creative direction for companies past their first chapter.**

Two brothers (Joshua + Daniel Paquete). AI in the studio. Six weeks per brand.

### Target client
Established companies (300K–2M+ EUR revenue) that outgrew their original brand identity. Slovak/Czech market primarily, but copy is in English to stay open to broader EU.

### Voice
Apple × Anthropic × OpenAI. Confident, sparse, declarative. **Forbidden words:** innovative, passionate, boutique, crafted, elevate, transform, unlock, journey, partner, solutions, leverage, synergy, ecosystem, holistic, bespoke, premium experience, world-class.

### Tagline (under logo, persistent)
**Built by hand. Accelerated by AI.**

---

## Design System

### Color palette
| Token | Value | Usage |
|---|---|---|
| `--bg` | `#FFFFFF` | Page background, canvas background |
| `--ink` | `#0A0A0A` | Body text, headings, CTAs |
| `--ink-soft` | `rgba(10,10,10,0.65)` | Secondary text |
| `--ink-faint` | `rgba(10,10,10,0.35)` | Tertiary, eyebrows |
| `--line` | `rgba(10,10,10,0.08)` | Hairlines |
| `--accent` | `#D0EF00` | **Lime chartreuse** — used VERY sparingly: hover states, accent line in headlines, primary CTA hover. Never as a background block. |

### Typography
- **Headings:** Inter, 600–700 weight, tracking-tight (-0.03em to -0.045em), large display sizes via `clamp()`
- **Body:** Inter, 400 weight, line-height 1.55
- **Eyebrows / metadata:** JetBrains Mono, uppercase, 0.08–0.1em letter-spacing, 11px
- Both fonts loaded via Google Fonts in HTML head

### Spacing scale
`xs(0.5rem) → s(1rem) → m(2rem) → l(4rem) → xl(8rem) → xxl(12rem)`

---

## Site Architecture — 7 Sections, Single Page

### Section 1 — HERO
- **Canvas sequence:** `/frames/01_act1_reveal/` (151 frames)
- **Eyebrow top-left:** `Woetive ✦ Studio · Issue 02 / 2026`
- **Eyebrow top-right:** `Currently directing for Q3 2026 · Two slots open`
- **Headline:** `Brands for companies that outgrew their first one.`
  - Style: `<em>outgrew</em>` is italic + has lime chartreuse highlight beneath (subtle ::after bar)
- **Subhead (mono):** `Built by hand. Accelerated by AI.`
- **CTAs:** `Begin →` (primary, dark) + `See work` (ghost)
- **Bottom center:** `Scroll to read ↓` (pulse animation)

### Section 2 — MANIFESTO
- **Canvas sequence:** `/frames/02_act1_pullback/` (151 frames)
- **Eyebrow:** `Manifesto · 01`
- **Lead paragraph:** `Most companies hit a moment when the brand stops keeping up. The product evolves. The team grows. The customers change. The identity stays the same — until it starts holding everything back.`
- **Followup paragraph:** `That's where we come in. Two directors. AI in the studio. Six weeks. One brand built for the next five years.`

### Section 3 — PROOF
- **Canvas sequence:** `/frames/03_act1_pointing/` (151 frames)
- **Eyebrow right-aligned:** `Selected ↓`
- **Heading:** `Recent work.`

### Section 4 — SELECTED WORK (STATIC, no canvas)
- **Eyebrow:** `Work · 2023—2026`
- **Heading:** `Three projects. Three problems solved.` (italic on second sentence)
- **Three case studies in 3-column grid:**

  **01 — FORMA** (Architecture studio, 2024 Q4, 4 weeks)
  - Brief: `Architecture studio site that 3×'d the pipeline.`
  - Stats: `+300% Leads/mo`, `1.2s LCP`, `4 wks Ship time`
  - Tag: `Web · Brand refresh`

  **02 — VELDT** (Editorial campaign, 2024 Q2, 6 weeks)
  - Brief: `2.4M reach. Zero paid euros.`
  - Stats: `2.4M Reach`, `18% Engagement`, `6 wks Live`
  - Tag: `Art direction · Campaign`

  **03 — NOCTA** (Spirits brand, 2023 Q4, 12 weeks)
  - Brief: `From zero to 3 design awards.`
  - Stats: `3 Awards`, `+210% Retail`, `12 wks Launch`
  - Tag: `Brand identity · Packaging`

- Each case study currently links to `mailto:house@woetive.com?subject=...`
- **Archive link:** `See full archive (8 cases) →` mailto

### Section 5 — METHOD
- **Canvas sequence:** `/frames/04_act2_compose/` (151 frames, top-down view)
- **Eyebrow:** `Method · 04`
- **Heading:** `How we direct.`
- **Four steps with fade-in synced to scroll progress (25/50/75/100%):**

  1. **`Listen for two weeks.`** — `Most agencies skip this. It's why their work could belong to anyone.`
  2. **`Position.`** — `Before any visual decision, we know what your brand stands for — and against.`
  3. **`Design.`** — `Two directors, AI as a third hand. Thirty directions explored, three presented.`
  4. **`Ship in six weeks.`** — `Full system, documented. No retainer trap.`

### Section 6 — FOUNDERS (STATIC)
- **Eyebrow:** `About · The brothers`
- **Heading:** `Two brothers. Same hand.` (italic on second part)
- **Lead paragraph:** Joshua leads strategy and art direction. Daniel leads craft and code. They live together. AI gives ten-person tempo. Hand finishes give two-person integrity.
- **Two founder cards (side-by-side):**

  **J.S.P / 001** — Joshua Samuel Paquete — CEO · Art Director — `Older brother · Strategy first.` Tags: Strategy, Art Direction, Prompt Eng., AI Workflow.
  Image: `/assets/joshua.webp` (if exists) or text-only placeholder `JSP` in mono on dark bg.

  **D.A.P / 002** — Daniel Alexander Paquete — Creative Director — `Younger brother · Craft first.` Tags: Web, Identity, Motion, AI Curation.
  Image: `/assets/daniel.webp` (if exists) or text-only placeholder `DAP`.

### Section 7 — CONTACT
- **Canvas sequence:** `/frames/05_act3_invitation/` (151 frames)
- **Eyebrow:** `Contact · Q3 2026`
- **Heading (centered, large):** `Your turn.`
- **Line:** `One project at a time. Currently directing for Q3 2026. Two slots open.`
- **CTA (large, accent):** `Begin →` → `mailto:house@woetive.com?subject=New project brief`
- **Email below:** `Or write directly: house@woetive.com`

### Footer
- Brand wordmark + tagline
- `© 2026 Woetive · Slovakia · Bratislava / Košice · Built by the brothers`
- Social: IG, LI, BE links to `instagram.com/woetive`, etc.
- Background: ink (#0A0A0A), text white

---

## Tech Implementation

### Stack
```
- HTML5 semantic markup
- CSS (vanilla, custom properties, no framework)
- JavaScript (vanilla, ES6+ modules optional)
- GSAP 3.12+ (CDN)
- ScrollTrigger plugin (CDN)
- Lenis 1.1+ smooth scroll (CDN)
- Inter + JetBrains Mono (Google Fonts)
- WebP image sequences (pre-provided)
```

### CDN URLs
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js" defer></script>
```

### Canvas Image Sequence — Core Logic

For each section with `data-sequence` and `data-frame-count` attributes:

1. **Find canvas:** `section.querySelector('canvas.canvas-sequence')`
2. **Setup DPR:** Cap at 2 desktop, 1.5 mobile. `ctx.scale(dpr, dpr)`.
3. **Preload strategy:**
   - Immediately load frame 0001 to display as poster
   - When section is within `200vh` of viewport (IntersectionObserver), start loading remaining frames in batches of 8 with `Promise.all`
   - Use `img.decoding = 'async'` for non-blocking
4. **Render:**
   - Fill background with `#FFFFFF` first (no flash)
   - Cover behavior: scale image to fill canvas, crop overflow centered
   - `ctx.imageSmoothingEnabled = true`, `ctx.imageSmoothingQuality = 'high'`
5. **ScrollTrigger binding:**
   ```js
   ScrollTrigger.create({
     trigger: section,
     start: 'top top',
     end: '+=100%',  // 1 viewport scroll for full sequence
     scrub: 0.5,     // smoothing factor
     pin: true,
     anticipatePin: 1,
     invalidateOnRefresh: true,
     onUpdate: (self) => {
       const frame = Math.round(self.progress * (frameCount - 1));
       drawFrame(frame);
     }
   });
   ```
6. **Memory cleanup:**
   - When section is `100vh` past viewport (negative IntersectionObserver), null out image references
   - Garbage collector reclaims memory
   - Re-load if user scrolls back

### Method Section — Step Reveals

In Section 5, additionally to the canvas scrub:
```js
ScrollTrigger.create({
  trigger: methodSection,
  start: 'top top',
  end: '+=100%',
  scrub: 0.5,
  onUpdate: (self) => {
    const steps = methodSection.querySelectorAll('.method-step');
    steps.forEach((step, i) => {
      const threshold = (i + 1) * 0.25;
      step.classList.toggle('method-step--visible', self.progress >= threshold - 0.1);
    });
  }
});
```

### Lenis + GSAP Bridge
```js
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

### Boot Loader
On page load, show subtle "Loading" indicator with progress bar. When first sequence's first 30 frames are loaded, fade out boot loader. Don't block content longer than necessary.

---

## Performance Targets

| Metric | Target |
|---|---|
| LCP | < 1.5s |
| INP | < 200ms |
| CLS | 0 (canvas has fixed dimensions) |
| Active memory | < 50MB sustained |
| Frame draw | < 4ms per scroll tick |

---

## Accessibility Requirements

- Skip link at top: `<a class="skip-link">Skip to content</a>`
- Each canvas: `aria-label` describing the visual content
- `prefers-reduced-motion`: skip ScrollTrigger entirely, draw static first frame for each canvas, sections flow naturally
- Keyboard navigation: nav anchors point to section IDs, focus-visible 2px lime outline
- Heading hierarchy is correct (h1 in hero, h2 in sections)
- All images have alt text or are decoratively hidden

---

## Mobile Responsive (< 768px)

- Sections stack vertically (already handled by section__pin height: 100vh)
- DPR cap: 1.5 (Safari iOS struggles with 2x canvas)
- Hide nav tagline (tight on small screens)
- Hero overlay top elements: stack vertically
- Work grid: 1 column
- Founders grid: 1 column
- Footer: 1 column

---

## Critical Don'ts

- ❌ NO React, Next.js, Astro, Vite — vanilla only
- ❌ NO build step — keep it static
- ❌ NO `<video>` for sequences (canvas only — this matters for Safari iOS scroll-scrub)
- ❌ NO Framer Motion (GSAP only)
- ❌ NO loading spinners (use elegant fades)
- ❌ NO serif fonts
- ❌ NO accent color used as a background fill (only as line, hover, glow)
- ❌ NEVER touch `/frames/` content — they're already optimized

---

## Deploy Steps (after Claude Code finishes)

1. Confirm files are correct: `index.html`, `styles/main.css`, `scripts/main.js`, `frames/*`, `vercel.json`
2. Commit to existing repo:
   ```bash
   cd woetive-preview
   git checkout main
   # Replace files with v18 build
   git add -A
   git commit -m "v18: scroll-driven canvas sequences"
   git push origin main
   ```
3. Vercel auto-deploys (no build command needed)
4. Verify on `woetive-preview-cmvq.vercel.app`
5. Test scroll on Safari iOS, Chrome desktop, Firefox

---

## Voice and Quality Bar

This is an Awwwards-grade submission. Treat every pixel like it matters. WOETIVE positions itself as a creative direction studio for companies past their first chapter. The web should feel like Apple × Anthropic — premium, confident, quiet.

When in doubt: less, sparser, more confident. No filler.

---

## What Success Looks Like

- User opens woetive-preview-cmvq.vercel.app
- Hero loads in under 1.5s (poster frame instant)
- Scrolling reveals Frame 0 → 1 → 2 → 5 in cinematic continuity
- Manifesto reads with figure pulled back
- Work grid feels like a museum
- Method section: top-down composing, 4 steps fade in like timed reveals
- Founders feel human after the abstract figure
- Contact: figure raises hand, "Begin →" lights up on hover with lime chartreuse
- Footer feels like an old library bookplate
- Whole thing: 25 seconds of motion across 7 sections, ~5MB total payload, 60fps everywhere

Build it.
