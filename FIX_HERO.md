# FIX 01 — HERO SECTION REFINEMENT

**Scope:** Only hero section (`#hero`) and its transition into trust ribbon. Nothing else changes.

---

## DIAGNOSIS — what's broken

**Problem 1: Hero headline is too large** — currently displays as 4-line block at ~100px on 1440px viewport, dominating the entire viewport and pushing the figure visually off-screen.

**Problem 2: Canvas crops the figure top** — figure's head is cut off. Canvas height is shorter than figure aspect ratio OR `cover` is cropping top because focus point is centered.

**Problem 3: Canvas scrub is not initialized to frame 0** — figure already in mid-rotation pose at page load. Canvas should display `frame_0001` (3/4 back-turned with head bowed) as the static initial state.

**Problem 4: Hard cut into trust ribbon** — hero ends abruptly when scroll passes 100vh. Apple register requires a graceful handoff.

**Problem 5: Nav tagline casing** — currently sentence case. Should be UPPERCASE in JetBrains Mono per the design system.

---

## FIXES (all in one pass)

### FIX 1.1 — Typography scale down
- `--t-display`: clamp(3rem, 7vw, 6.5rem) → **clamp(2.5rem, 5.5vw, 5rem)**
- `.hero__headline`: `max-width: 14ch`, `line-height: 0.96`, `letter-spacing: -0.04em`, `text-wrap: balance`

### FIX 1.2 — Canvas layout, figure full visibility
- Restructure hero HTML to **2-column grid** (`hero__copy` left, `hero__media` right)
- `hero__media` height: `clamp(500px, 75vh, 800px)`
- Add `fitMode = 'contain'` to FrameSequence
- Hero uses `contain` so figure is never cropped

### FIX 1.3 — Initial frame 0 on load
- `preload()` already loads + draws frame 0 first
- Canvas fade-in CSS (opacity 0 → 1 once `.canvas-sequence--ready` class added)

### FIX 1.4 — Smooth hero → trust ribbon transition
- **Part A:** Canvas opacity fades 1 → 0.3 in final 25% of hero scroll
- **Part B:** Trust ribbon GSAP `from` fade-up entrance
- **Part C:** White gradient seam (`::after` on `.section--hero`)

### FIX 1.5 — Nav tagline uppercase
- Add `text-transform: uppercase` to `.nav__brand-tagline`
- Letter-spacing 0.08em

### FIX 1.6 — Stagger reveal on hero copy
- GSAP timeline: eyebrows → headline → subhead → CTAs (with `-=0.3/-=0.5` overlap)
- Lime accent `.is-visible` added 1.4s after page load

### FIX 1.7 — Responsive hero (≤ 768px)
- `grid-template-columns: 1fr` (collapses)
- `.hero__copy { order: 1 }`, `.hero__media { order: 2 }` — copy above, canvas below
- Top eyebrows stack vertically

---

## ACCEPTANCE CRITERIA

- [ ] Page loads with figure visible in 3/4 back-turned pose (frame 0001), full body visible
- [ ] Headline 3 lines max, "outgrew" has italic + lime underline that draws in 1.4s after page load
- [ ] Hero copy stagger-fades in (eyebrows → headline → subhead → CTAs)
- [ ] Nav tagline reads "BUILT BY HAND. ACCELERATED BY AI." in UPPERCASE mono
- [ ] Scrolling rotates figure smoothly through frames 0–120 (no jumps)
- [ ] In final 25% of hero scroll, canvas opacity fades 100% → 30%
- [ ] Trust ribbon enters with fade-up, not hard cut
- [ ] White gradient softens hero → trust seam
- [ ] On mobile (375px), copy above canvas, both readable, figure not cropped
- [ ] No console errors, no flash of blank canvas

---

## DEPLOY

Push to `main` of `woetive-preview` → Vercel auto-deploys to `woetive-preview-cmvq.vercel.app`.

```
git add -A
git commit -m "fix(hero): typography scale, canvas contain mode, smooth exit transition, stagger reveals"
git push origin main
```

After: FIX 02 — Manifesto section.
