# WOETIVE — Camera-Directed 3D Homepage Brief for Claude Code

## 0. Purpose

Build a live, scroll-driven website for **WOETIVE**.

The site must feel like a cinematic editorial experience, not a normal agency landing page.

The main 3D character is a **static GLB humanoid with no rig**. The humanoid does **not** walk, gesture, turn its head, or animate physically.

All perceived motion comes from:

- camera movement
- light movement
- object parallax
- HTML text entering/leaving the camera frame
- cards moving in front of / behind the humanoid
- liquid 3D object deformation
- scroll-controlled scene composition

Think of the site as a **single continuous camera film** moving around one sculptural subject.

The humanoid is not a mascot. It is a silent creative director object — judgment, direction, pressure, restraint.

---

## 1. Brand Positioning

### Core positioning

**Cesta B — Creative direction studio for companies past their first chapter.**

WOETIVE is not an agency. Not freelancers. Not AI-as-product.

The product sold is **outsourced creative direction**:

- taste
- judgment
- leadership
- visual direction
- strategic direction
- creative decision-making

Deliverables are the result of that direction:

- brand identity
- web
- campaigns
- motion
- content systems

The client is not a startup. They are an established company with real revenue, product-market fit, and a brand that no longer keeps up.

### Target client

Established Slovak / Czech / EU-scalable companies around **€300K–€2M+ revenue** that have outgrown their first visual identity.

### Voice

Apple × Anthropic × OpenAI.

- sparse
- confident
- declarative
- calm
- sharp
- editorial
- no hype
- no sales talk

### Forbidden words

Never use these words anywhere on the website:

- innovative
- passionate
- boutique
- crafted
- elevate
- transform
- unlock
- journey
- partner
- solutions
- leverage
- synergy
- ecosystem
- holistic
- bespoke
- premium experience
- world-class

### Permanent tagline

Use under / near the wordmark:

**Built by hand. Accelerated by AI.**

---

## 2. Visual System

### Global style

The site should feel like:

- Swiss editorial tech magazine
- high-fashion technology cover
- Apple product film
- Anthropic-level restraint
- dark tactile 3D gallery

Avoid:

- SaaS dashboard language
- fake metrics
- blue AI glow
- generic neon
- service grids everywhere
- overanimated Webflow-showcase feel
- robotic / sci-fi clichés

### Color palette

```css
--black: #050505;
--charcoal: #0B0B0A;
--dark-gray: #161616;
--mid-gray: #6F6F6A;
--line-gray: rgba(255,255,255,0.14);
--off-white: #F4F3EE;
--warm-white: #FAF9F4;
--lime: #D0EF00;
```

### Lime rules

The lime #D0EF00 typographic underline animation appears only under:

1. **outgrew** in Hero
2. **re-direct** in Manifesto
3. **turn** in Contact

No lime text fills elsewhere. No lime backgrounds. No lime CTA buttons.

Allowed lime uses:

- emissive line on humanoid chest
- subtle progress line
- small cursor light reflection
- hover borders / underline
- 3D scene glow/reflection

### Typography

Use a strong Swiss grotesk for most text.

Recommended:

- primary sans: `Inter`, `Suisse Int'l`, `Neue Haas Grotesk`, fallback to system sans
- mono: `IBM Plex Mono`, `JetBrains Mono`, fallback monospace
- italic serif: `Editorial New Italic`, `Cormorant Garamond Italic`, fallback serif italic

Free stack:

```css
--font-sans: "Inter", system-ui, sans-serif;
--font-mono: "IBM Plex Mono", "JetBrains Mono", monospace;
--font-serif: "Cormorant Garamond", Georgia, serif;
```

### Layout rhythm

Desktop base:

- viewport: 1440–1920px wide
- section min-height: 100vh
- max-content-width: 1680px
- site padding desktop: 48–64px
- site padding mobile: 20–24px
- text should breathe
- never overcrowd the page
- fewer elements, stronger scale

---

## 3. 3D Technical Setup

### Asset

Use the provided static model:

```txt
/model.glb
```

The GLB has no rig. Do not assume skeletal animation exists.

### 3D stack

Use:

- Next.js or Vite React
- React Three Fiber
- Drei
- GSAP ScrollTrigger
- Lenis smooth scroll
- Tailwind or CSS modules

### Main rendering principle

A single persistent fixed WebGL canvas should stay behind / between the HTML sections.

```txt
Canvas: fixed, full viewport, z-index scene layer
HTML: scroll content overlays, z-index above or below depending section
```

Use section-based scroll progress to drive:

- camera position
- camera target
- model scale
- model rotation
- liquid object position / scale / shader uniform
- lights
- material emissive intensity
- HTML overlay opacity / transform

### Important

The camera creates the illusion that the humanoid moves through the website.

The humanoid may be repositioned or rotated subtly per scene, but never in a way that feels like physical body animation. Treat the model as a sculpture placed in a cinematic set.

---

## 4. 3D Scene Objects

### 4.1 Humanoid

Material:

- matte black / deep charcoal
- roughness high: 0.72–0.88
- metalness low: 0.0–0.12
- subtle procedural noise bump for micro-grain
- no plastic gloss
- visible rim lighting
- contact shadows when grounded

Suggested material:

```js
bodyMaterial = new THREE.MeshStandardMaterial({
  color: "#050505",
  roughness: 0.82,
  metalness: 0.04
})
```

### 4.2 Lime chest line

If the lime line exists as a separate mesh/material, set it to emissive.

```js
lineMaterial = new THREE.MeshStandardMaterial({
  color: "#D0EF00",
  emissive: "#D0EF00",
  emissiveIntensity: scrollDrivenValue,
  roughness: 0.35
})
```

If not separate, add a thin curve/mesh line over the chest manually in Three.js, parented to the model or visually aligned to the torso.

The line should subtly glow, but not become a neon tube.

Use bloom carefully:

- threshold high
- strength low
- radius low

### 4.3 Liquid 3D object

The liquid object appears primarily in the Hero and partially returns in Contact.

It is a large amorphous black glass / obsidian / oil membrane form behind the humanoid.

It must feel:

- tactile
- expensive
- slow
- organic
- editorial
- not sci-fi

Possible implementation:

Use a high-poly sphere/icosahedron with vertex displacement.

- geometry: IcosahedronGeometry / SphereGeometry high segment count
- animated noise displacement
- MeshPhysicalMaterial:
  - transmission / clearcoat
  - roughness 0.18–0.32
  - metalness 0.1
  - color black
  - envMapIntensity controlled by mouse

Suggested material:

```js
liquidMaterial = new THREE.MeshPhysicalMaterial({
  color: "#050505",
  roughness: 0.22,
  metalness: 0.15,
  transmission: 0.15,
  thickness: 1.2,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
  envMapIntensity: 1.4
})
```

#### Mouse light interaction

Mouse controls a soft point light or area light.

- map mouse x/y to light position
- light color warm-white, not blue
- light intensity subtle
- light affects liquid and humanoid reflections
- add a CSS/r3f radial highlight overlay if needed

Mouse behavior:

- liquid highlight travels across surface
- humanoid shoulder/chest gets subtle reflected light
- glass card edge receives shimmer

Keep it subtle.

### 4.4 Lights

Use cinematic studio lighting.

Base setup:

- key/rim light from upper-left/front
- large soft area light from front-left
- very weak fill light
- mouse-driven moving point/area light
- contact shadow plane where needed

No blue/purple lights.

---

## 5. Layering System

Every section must consider depth.

```txt
Layer 0: page background
Layer 1: 3D liquid object
Layer 2: huge background typography / low contrast editorial marks
Layer 3: humanoid model
Layer 4: large foreground text overlays
Layer 5: cards / liquid glass UI
Layer 6: nav / cursor / scroll indicators
```

Some text may pass behind the humanoid by using CSS masking or z-index layering.

Practical implementation:

- use one fixed canvas
- HTML overlays can be split into `behind-model` and `front-ui`
- if true depth compositing is too difficult, simulate it:
  - background typography behind canvas
  - humanoid in canvas
  - CTA/cards above canvas

---

## 6. Scroll Model

Use a single global scroll timeline.

Recommended virtual scroll height:

```txt
12 sections
Average 120–180vh each
Pinned cinematic sections: 180–300vh
Total scroll length: approx. 1800–2300vh
```

Use Lenis for smooth scroll.

Use GSAP ScrollTrigger with labels:

```js
timeline.addLabel("hero", 0)
timeline.addLabel("manifesto", 0.12)
timeline.addLabel("closeup", 0.22)
timeline.addLabel("work", 0.31)
timeline.addLabel("methodInterlude", 0.42)
timeline.addLabel("methodSteps", 0.50)
timeline.addLabel("trustRibbon", 0.60)
timeline.addLabel("why", 0.66)
timeline.addLabel("testimonials", 0.75)
timeline.addLabel("founders", 0.83)
timeline.addLabel("contact", 0.92)
timeline.addLabel("footer", 1)
```

Each section should update camera state via interpolation.

---

## 7. Camera Direction Philosophy

Since the humanoid is static, the camera is the actor.

### Rules

1. Never make the camera feel like a random orbit.
2. Every camera move must reveal a new idea.
3. When camera moves right-to-left, text should enter from the opposite side to feel spatial.
4. Text should sometimes appear in the camera's path, as if it is placed in the room.
5. Cards can pass in front of the humanoid only when they represent deliverables.
6. Philosophy text should stay behind or beside the humanoid, not on top of it.
7. Avoid constant motion. Some sections should be almost still.
8. Create intentional whitespace moments where the humanoid disappears partially or entirely.

### Movement vocabulary

Use only:

- slow push-in
- slow dolly out
- horizontal slide
- slight parallax orbit
- vertical tilt
- depth rack / blur
- foreground card pass
- text mask reveal

Do not use:

- fast zooms
- shaky camera
- spin
- fly-through
- flashy rotation
- walking simulation

---

## 8. Section-by-Section Plan

The website has 12 sections in this exact order.

---

# 01 — Hero

## Copy

Top-left eyebrow:

```txt
WOETIVE · ISSUE 02 / 2026
```

Top-right eyebrow:

```txt
Q3 2026 · TWO SLOTS OPEN
```

Headline:

```txt
Brands for companies that outgrew their first one.
```

Lime underline only under:

```txt
outgrew
```

Subhead mono:

```txt
BUILT BY HAND. ACCELERATED BY AI.
```

CTA primary:

```txt
Begin →
```

CTA secondary:

```txt
See work
```

Scroll cue:

```txt
SCROLL ↓
```

Liquid glass card:

```txt
CURRENT MODE
One project at a time.
Six weeks per brand.
No retainer trap.
Begin →
```

Small editorial note:

```txt
Creative direction for companies past their first chapter. Brand identity, web, campaigns, motion, and content systems — directed, not delegated.
```

## Visual

Dark charcoal / black hero.

Rounded viewport frame:

- margin: 24–32px
- border-radius: 28–36px
- border: 1px solid rgba(255,255,255,0.12)

Humanoid:

- center-right
- torso/head crop
- scale large
- shoulders and chest visible
- head near top third
- lime chest line visible

Liquid object:

- behind humanoid
- left-to-right sweeping shape
- black glass / obsidian
- interactive highlight follows cursor
- main abstract visual layer

Typography:

- headline left
- line breaks:
  - Brands for
  - companies that
  - outgrew their
  - first one.
- `outgrew` italic serif with lime underline

Liquid glass card:

- bottom-right
- partly overlapping dark space, not covering face
- frosted translucent black glass
- iOS-like refraction edge
- soft inner highlight

## Camera state

Start:

```js
camera.position = [0.8, 1.55, 5.0]
camera.target = [0.05, 1.15, 0]
model.position = [1.05, -0.95, 0]
model.rotation = [0, -0.22, 0]
model.scale = 1.9
liquid.position = [-0.15, 0.25, -0.85]
liquid.scale = [2.9, 1.25, 0.7]
```

End:

```js
camera.position = [0.35, 1.65, 3.45]
camera.target = [0.30, 1.35, 0]
model.position = [0.80, -0.85, 0]
model.rotation = [0, -0.12, 0]
model.scale = 2.05
liquid.position = [-0.45, 0.15, -1.05]
liquid.scale = [3.2, 1.1, 0.65]
```

## Motion

Scroll progress 0–1:

- underline under `outgrew` draws left to right
- liquid highlight follows mouse
- liquid slowly breathes using noise displacement
- humanoid does not move physically
- camera push-in creates perceived presence
- headline opacity drops from 1 to 0.85 near end
- glass card shifts upward 24px and fades from 0 to 1 between progress 0.25–0.55
- scroll cue fades after progress 0.7

## Layering

- liquid behind humanoid
- headline in front of liquid
- glass card in front of humanoid lower-right
- top nav always in front

---

# 02 — Manifesto

## Copy

Eyebrow:

```txt
MANIFESTO · 01
```

Headline italic serif:

```txt
We don't redesign. We re-direct.
```

Lime underline only under:

```txt
re-direct
```

Body:

```txt
Most brands lose their grip when the company outgrows them. We rebuild the system before that happens — strategy, identity, and AI workflow that scales with you.
```

Meta line mono:

```txt
TWO DIRECTORS · AI IN STUDIO · SIX WEEKS PER BRAND
```

## Visual

Dark section continues from Hero.

Humanoid becomes a monumental close-up.

Camera pushes closer to head / neck / chest.  
The liquid object slips out of prominence.  
The scene becomes quieter and more typographic.

## Camera state

Mid:

```js
camera.position = [0.2, 1.72, 2.65]
camera.target = [0.38, 1.42, 0]
model.position = [0.75, -0.82, 0]
model.rotation = [0, -0.08, 0]
model.scale = 2.35
```

End:

```js
camera.position = [-0.25, 1.82, 2.15]
camera.target = [0.18, 1.45, 0]
model.position = [0.82, -0.8, 0]
model.rotation = [0, 0.04, 0]
model.scale = 2.65
```

## Motion

- camera slides slightly from right to left while pushing in
- because camera moves right-to-left, manifesto headline enters from right and settles left
- body text fades in after headline lock
- `re-direct` underline draws only after the word is visible
- model chest line intensity increases slightly during underline
- liquid object fades to 10–20% visibility
- no cards

---

# 03 — Close-up Interlude

## Copy

Eyebrow top-left:

```txt
INTERLUDE — 01
```

Bottom-right fade-in at 70% scroll:

```txt
THIS IS WHO YOU'LL WORK WITH.
```

## Visual

Blank cinematic moment.

Only:

- macro close-up of humanoid surface
- lime line / shoulder / neck
- black tactile texture
- sparse text

## Camera state

Start:

```js
camera.position = [-0.35, 1.78, 1.85]
camera.target = [0.15, 1.35, 0]
model.scale = 2.9
```

End:

```js
camera.position = [0.15, 1.55, 1.55]
camera.target = [0.18, 1.05, 0]
model.scale = 3.15
```

## Motion

- very slow camera drift downward from head/neck to chest line
- text appears only late
- background remains black
- use shallow depth-of-field if possible

---

# 04 — Selected Work

## Copy

Eyebrow:

```txt
WORK · 2023—2026
```

Heading:

```txt
Recent work.
```

Subheading:

```txt
Three projects. Three problems solved.
```

Cards:

**FORMA**

```txt
ARCHITECTURE STUDIO
Project 01 · 2024 Q4 · 4 weeks
Architecture studio site that 3×'d the pipeline.
+300% Leads/mo · 1.2s LCP · 4 wks Ship time
Web · Brand refresh
```

**VELDT**

```txt
EDITORIAL CAMPAIGN
Project 02 · 2024 Q2 · 6 weeks
2.4M reach. Zero paid euros.
2.4M Reach · 18% Engagement · 6 wks Live
Art direction · Campaign
```

**NOCTA**

```txt
SPIRITS BRAND
Project 03 · 2023 Q4 · 12 weeks
From zero to 3 design awards.
3 Awards · +210% Retail · 12 wks Launch
Brand identity · Packaging
```

Archive link:

```txt
See full archive (8 cases) →
```

## Visual

Switch to off-white.

This transition should feel like a camera exiting the black studio and entering a clean gallery wall.

Humanoid:

- cropped on far right
- slightly behind cards
- silent curator

Cards:

- three large editorial cards
- dark image tiles top
- text lower
- rounded 18–24px
- minimal borders

## Camera state

End:

```js
camera.position = [1.2, 1.25, 4.6]
camera.target = [0.65, 1.1, 0]
model.position = [2.15, -1.0, 0]
model.rotation = [0, -0.65, 0]
model.scale = 1.85
```

## Motion

- background crossfades from black to off-white
- camera dollies out and right
- humanoid becomes side/cropped object on right edge
- cards enter from left to right because camera moves right
- cards pass in front of the humanoid lower torso if overlap occurs
- heading locks top-left
- archive link fades in after cards

---

# 05 — Method Interlude

## Copy

Eyebrow top-right:

```txt
INTERLUDE — 02
```

Bottom-left fade-in at 70%:

```txt
EVERY DECISION HAS WEIGHT.
```

## Visual

Dark transitional section.

Use humanoid partially visible or almost absent.  
The camera moves close to the hand, shoulder, or chest line.

No process yet. No cards.

## Camera state

End:

```js
camera.position = [0.65, 1.25, 2.1]
camera.target = [0.45, 0.85, 0]
model.position = [0.85, -0.95, 0]
model.rotation = [0, -0.35, 0]
model.scale = 2.7
```

## Motion

- off-white fades to black
- camera moves from gallery side view into close-up
- text comes from bottom-left as if revealed by camera pan

---

# 06 — Method Steps

## Copy

Eyebrow:

```txt
METHOD · 04
```

Heading:

```txt
How we direct.
```

Steps:

```txt
01 — Listen for two weeks.
Most agencies skip this. It's why their work could belong to anyone.
```

```txt
02 — Position.
Before any visual decision, we know what your brand stands for — and against.
```

```txt
03 — Design.
Two directors, AI as a third hand. Thirty directions explored, three presented.
```

```txt
04 — Ship in six weeks.
Full system, documented. No retainer trap.
```

## Visual

Off-white with dark humanoid close-up on one side.

Large method steps arranged with strong Swiss dividers.

No walking animation.

## Camera state

End:

```js
camera.position = [-0.65, 1.45, 3.2]
camera.target = [0.4, 1.15, 0]
model.position = [1.25, -1.0, 0]
model.rotation = [0, 0.35, 0]
model.scale = 2.05
```

## Motion

- because camera drifts left, steps enter from right
- each step appears when scroll reaches a marker
- active step full opacity, previous steps 35%
- no lime text
- subtle black dividers

---

# 07 — Trust Ribbon

## Copy

Eyebrow centered:

```txt
TRUSTED BY FOUNDERS BUILDING REAL COMPANIES
```

Marquee:

```txt
Labaš ✦ Fresh Plus ✦ Mobilonline ✦ Gams ✦ Strategy1st ✦ Forbestclients ✦ Flowy
```

## Visual

Mostly static, no humanoid needed.

Off-white background.  
Thin lines.  
Centered eyebrow.  
Large slow marquee.

## Motion

- model fades out
- marquee scrolls slowly horizontally
- no dramatic camera

---

# 08 — Why Woetive

## Copy

Eyebrow:

```txt
WHY WOETIVE · 06 DIFFERENTIATORS
```

Heading:

```txt
Not an agency. Your creative team.
```

Cards:

```txt
01 · TEAM — Two people, one AI stack.
No middle management. No juniors. Your brief gets read by a director, not parsed by a project manager.
Tags: Strategy / Craft / AI Workflow
```

```txt
02 · COMMUNICATION — Direct line. No PMs.
Slack and email replies in hours, not days. The brothers who own your project answer their own DMs.
```

```txt
03 · MINDSET — Strategic + executional.
Joshua leads strategy and AD. Daniel leads craft and code. One room, one decision.
```

```txt
04 · TRUST — 100% in-house.
Every hour billed is worked by Joshua or Daniel. No subcontractors. No outsourced asset farms.
```

```txt
05 · PROCESS — Brainstorm at the dinner table.
We live together. Your brief continues in our heads after 6pm. Decisions compound faster when there's no wall between us.
```

```txt
06 · SPEED — Weeks, not quarters.
AI iterates. We finalize. Brand identity in 6–10 weeks. Web in 4–8.
```

## Visual

The one bento grid section.

Asymmetric bento grid.  
Off-white background.  
Mostly solid cards, thin borders, subtle shadows.

Humanoid may return subtly:

- cropped shoulder/torso behind bento grid
- faint 3D object on far right
- not dominant

## Camera state

```js
modelVisibility = 0.35
camera.position = [1.4, 1.2, 4.8]
camera.target = [0.9, 1.0, 0]
model.position = [2.4, -1.05, 0]
model.scale = 1.8
```

## Motion

- cards appear with slight z-depth
- closer cards move faster
- background figure moves slowly
- hover: black border or subtle underline

---

# 09 — Testimonials

## Copy

Eyebrow:

```txt
TESTIMONIALS · 4.8 / 5
```

Heading:

```txt
Trust that returns.
```

Quote 01:

```txt
"Strategically, visually, humanly — everything fits. A level we hadn't seen from local studios."
ML / Ing. Miroslav Labaš / Co-owner · Labaš
```

Quote 02:

```txt
"Fast, precise, no sales talk. A brand the customer understands — and the competition notices."
MK / Ing. Milan Kovalančík / Owner · Mobilonline
```

Quote 03:

```txt
"Two brothers, one head. Communication at the level of big agencies — without their inertia."
IK / Ivan Kopčík / CEO · Forbestclients
```

## Visual

Static off-white cards.

No humanoid necessary.

Quiet editorial card layout:

- three cards
- large quote text
- initials as small circular marks
- thin borders
- no glass
- no aggressive carousel

## Motion

- cards fade upward slightly
- staggered 80–120ms
- section mostly still

---

# 10 — Founders

## Copy

Eyebrow:

```txt
ABOUT · THE BROTHERS
```

Heading:

```txt
Two brothers. Same hand.
```

Lead:

```txt
Joshua leads strategy and art direction. Daniel leads craft and code. We live together. Brand decisions continue at the dinner table, not just in the studio. AI gives us the tempo of a ten-person agency. Hand finishes give us the integrity of a two-person one.
```

Meta mono:

```txt
LIVE · SINCE 2022 · J.S.P / 001 + D.A.P / 002 · BRATISLAVA + KOŠICE, SK
```

Founder Card JSP:

```txt
JSP / 001
Joshua Samuel Paquete · CEO · Art Director
Older brother · Strategy first. Builds the AI workflow that gives us ten-person tempo. Obsessed with detail, calm under pressure.
Strategy / Art Direction / Prompt Eng. / AI Workflow
```

Founder Card DAP:

```txt
DAP / 002
Daniel Alexander Paquete · Creative Director
Younger brother · Craft first. Picks the one direction that stays in the client's head for ten years. Thinks like a designer, ships like a craftsman.
Web / Identity / Motion / AI Curation
```

## Visual

Humanoid returns as a central / background figure.

Two portrait cards should appear like editorial dossier cards.

Layout:

- left: heading + lead
- center/right: humanoid partial crop
- lower/right: two founder cards

## Camera state

```js
modelVisibility = 1
camera.position = [0.55, 1.35, 3.4]
camera.target = [0.55, 1.1, 0]
model.position = [1.15, -1.0, 0]
model.rotation = [0, -0.15, 0]
model.scale = 2.1
```

## Motion

- camera slowly pushes in
- founder cards slide from right to left as if entering the camera plane
- cards can pass in front of the humanoid lower body
- lead text fades first, then cards

---

# 11 — Contact

## Copy

Eyebrow:

```txt
READY WHEN YOU ARE
```

Headline italic serif:

```txt
Your turn.
```

Lime underline only under:

```txt
turn
```

Body:

```txt
One project at a time. Currently directing for Q3 2026.
```

CTA primary:

```txt
Begin →
```

CTA link:

```txt
mailto:house@woetive.com?subject=New project brief
```

CTA secondary:

```txt
See work
```

## Visual

Climax.

Return to dark cinematic scene.

Humanoid appears large, almost frontal / torso crop.

Liquid object returns subtly behind or to side.

Headline huge and sparse.

## Camera state

```js
camera.position = [0.0, 1.55, 2.35]
camera.target = [0.22, 1.22, 0]
model.position = [0.75, -0.95, 0]
model.rotation = [0, -0.05, 0]
model.scale = 2.45
liquid.position = [-0.55, 0.05, -1.1]
liquid.scale = [2.8, 1.0, 0.6]
```

## Motion

- camera slowly pushes in
- `Your turn.` appears from behind the humanoid or beside shoulder
- underline draws under `turn`
- lime chest line intensifies slightly
- CTA fades in after underline completes
- liquid object has very slow distortion
- mouse light returns

---

# 12 — Footer

## Copy

Wordmark:

```txt
WOETIVE
```

Tagline:

```txt
BUILT BY HAND. ACCELERATED BY AI.
```

Meta:

```txt
© 2026 Woetive · Slovakia · Bratislava / Košice · Built by the brothers
```

Social:

```txt
IG · LI · BE
```

Links:

- IG: instagram.com/woetive
- LI: linkedin.com/company/woetive
- BE: behance.net/woetive

## Visual

Dark footer.

No humanoid, or only a tiny silhouette/fade from previous section.

Use large wordmark and minimal links.

---

## 9. HTML Overlay Motion Rules

### General

Use CSS transforms and opacity.

```css
.text-reveal {
  transform: translateY(32px);
  opacity: 0;
  filter: blur(8px);
}

.text-reveal.active {
  transform: translateY(0);
  opacity: 1;
  filter: blur(0);
}
```

### Directional logic

If camera moves from right to left:

- text enters from right
- cards enter from right
- previous text exits left

If camera moves from left to right:

- text enters from left
- cards enter from left
- previous text exits right

If camera pushes in:

- text should either scale down / fade back
- or appear as if fixed in foreground

If camera dollies out:

- cards can enter from depth / blur-to-sharp

### Behind / front logic

Use this rule:

- philosophical or background words = behind humanoid
- important readable body text = front overlay
- cards/deliverables = may pass in front of humanoid
- nav and CTA = always front

---

## 10. Liquid Glass Card Design

Use this for Hero and optionally Contact only.

### CSS direction

```css
.glass-card {
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.20),
    rgba(255,255,255,0.06)
  );
  backdrop-filter: blur(28px) saturate(1.15);
  -webkit-backdrop-filter: blur(28px) saturate(1.15);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 32px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.28),
    inset 0 -1px 0 rgba(255,255,255,0.06),
    0 24px 80px rgba(0,0,0,0.35);
  overflow: hidden;
}
```

### Inner reflection

```css
.glass-card::before {
  content: "";
  position: absolute;
  inset: -40%;
  background: radial-gradient(
    circle at var(--mx, 50%) var(--my, 50%),
    rgba(255,255,255,0.38),
    rgba(255,255,255,0.08) 22%,
    transparent 48%
  );
  opacity: 0.45;
  pointer-events: none;
  transition: opacity .2s ease;
}
```

### Refraction edge

```css
.glass-card::after {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow:
    inset 8px 8px 20px rgba(255,255,255,0.04),
    inset -8px -8px 20px rgba(0,0,0,0.18);
  pointer-events: none;
}
```

### Behavior

- card slightly tilts based on mouse
- max tilt 3deg
- shimmer follows mouse
- never bouncy
- never over-glowy

---

## 11. Responsive Behavior

### Desktop

Full cinematic experience.

- 3D canvas active
- liquid object active
- mouse light active
- scroll camera active
- bento grid full

### Tablet

Reduce:

- liquid complexity
- glass card size
- model scale
- less aggressive camera

### Mobile

Simplified version.

- static or lightly animated GLB
- fewer camera moves
- no heavy liquid shader if performance suffers
- hide large glass card or move below headline
- sections become stacked
- no behind-model text layering if unreadable

### Reduced motion

If `prefers-reduced-motion`:

- disable scroll-scrub camera
- use static key poses per section
- disable liquid deformation
- keep fade/slide transitions minimal

---

## 12. Performance Requirements

- lazy-load 3D assets
- compress GLB with Draco if needed
- use KTX2 compressed textures if any
- keep shadow maps reasonable
- avoid too many lights
- limit postprocessing
- use device pixel ratio cap:

```js
dpr={[1, Math.min(window.devicePixelRatio, 1.75)]}
```

- mobile DPR cap max 1.25

---

## 13. Implementation Components

Suggested file structure:

```txt
/src
  /components
    SiteShell.tsx
    Navigation.tsx
    ScrollScene.tsx
    HumanoidModel.tsx
    LiquidObject.tsx
    MouseLight.tsx
    GlassCard.tsx
    Section.tsx
    Hero.tsx
    Manifesto.tsx
    CloseupInterlude.tsx
    SelectedWork.tsx
    MethodInterlude.tsx
    MethodSteps.tsx
    TrustRibbon.tsx
    WhyWoetive.tsx
    Testimonials.tsx
    Founders.tsx
    Contact.tsx
    Footer.tsx
  /data
    copy.ts
    cameraStates.ts
  /hooks
    useScrollProgress.ts
    useMouseLight.ts
    useCameraRig.ts
  /styles
    globals.css
```

---

## 14. Camera State Data Structure

Create camera states in `/data/cameraStates.ts`.

Example:

```ts
export const cameraStates = {
  hero: {
    start: {
      camera: [0.8, 1.55, 5.0],
      target: [0.05, 1.15, 0],
      modelPos: [1.05, -0.95, 0],
      modelRot: [0, -0.22, 0],
      modelScale: 1.9,
      liquidPos: [-0.15, 0.25, -0.85],
      liquidScale: [2.9, 1.25, 0.7],
      liquidVisible: 1
    },
    end: {
      camera: [0.35, 1.65, 3.45],
      target: [0.30, 1.35, 0],
      modelPos: [0.80, -0.85, 0],
      modelRot: [0, -0.12, 0],
      modelScale: 2.05,
      liquidPos: [-0.45, 0.15, -1.05],
      liquidScale: [3.2, 1.1, 0.65],
      liquidVisible: 1
    }
  }
}
```

Use interpolation between states.

---

## 15. Exact Copy Data

Put all copy into `/data/copy.ts`.

Do not paraphrase.

Do not add extra marketing copy.

Do not use forbidden words.

---

## 16. Final Quality Bar

The final site should feel like:

- a film
- a magazine cover
- a product reveal
- a creative direction studio with restraint

The site should not feel like:

- a generic AI agency
- a SaaS product
- a dashboard demo
- a startup template
- a Webflow animation playground

The user should feel:

```txt
They direct.
They decide.
They have taste.
They are not selling outputs.
They are selling judgment.
```

---

## 17. First Build Milestone

Build in this order:

1. Static layout with all sections and exact copy.
2. Load GLB model in fixed R3F canvas.
3. Add Hero camera state only.
4. Add liquid object and mouse light in Hero.
5. Add Manifesto camera transition.
6. Add all camera states.
7. Add HTML reveal timings.
8. Add glass card.
9. Add responsive fallback.
10. Polish.

Do not try to perfect all sections before the Hero + Manifesto camera relationship works.

---

## 18. Critical Hero Requirement

Hero must be:

- dark
- tactile
- Swiss editorial
- with liquid 3D object
- humanoid center-right
- headline left
- one liquid glass card
- no fake stats
- no dashboard
- no AI agency language

The Hero is the visual contract for the rest of the site.
