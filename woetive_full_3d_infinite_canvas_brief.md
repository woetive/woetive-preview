# WOETIVE — Full 3D Infinite Canvas Website Brief  
## Camera-directed WebGL build for Claude Code

## 0. Core idea

Build the WOETIVE website as a **single 3D infinite canvas**, not as a stack of normal HTML sections.

The website should feel like an **After Effects camera composition translated into WebGL**:

- the camera travels through a continuous 3D editorial space,
- text exists as 3D planes in space,
- cards exist as 3D panels in space,
- the humanoid is a static sculpture that the camera moves around,
- some text appears behind the humanoid,
- some cards pass in front of the humanoid,
- sections are not “pages” — they are **camera stations** inside one long scene.

The humanoid model has **no rig**.  
It must never walk, gesture, or animate like a character.

The movement comes from:

- camera dolly,
- camera orbit,
- camera pan,
- camera tilt,
- depth positioning,
- parallax,
- light movement,
- mouse attention field,
- particle mind-map sphere,
- 3D text/cards crossing the camera frame.

Important:  
**Text should not fade out as the main transition.**  
Text should leave because the camera moves past it, goes around it, or it moves out of the camera frustum. Opacity can be used only as a technical assist at the very edges, never as the main design effect.

Think:

> One camera. One world. Twelve scenes.  
> No hard cuts. No flat landing-page sections.

---

# 1. Brand foundation

## 1.1 Positioning

WOETIVE is:

**Creative direction studio for companies past their first chapter.**

Not an agency.  
Not freelancers.  
Not AI-as-product.

The client buys:

- taste,
- judgment,
- leadership,
- direction.

The outputs are:

- brand identity,
- web,
- campaigns,
- motion,
- content systems.

## 1.2 Target client

Established Slovak / Czech / EU-scalable companies around €300K–€2M+ revenue.

They have a real product and real revenue.  
Their first visual identity got them here.  
Now it no longer carries the company.

## 1.3 Voice

Apple × Anthropic × OpenAI.

- sparse
- declarative
- calm
- sharp
- editorial
- no hype
- no sales talk

## 1.4 Forbidden words

Never use:

```txt
innovative
passionate
boutique
crafted
elevate
transform
unlock
journey
partner
solutions
leverage
synergy
ecosystem
holistic
bespoke
premium experience
world-class
```

## 1.5 Lime rule

Lime #D0EF00 appears as a typographic underline only under:

1. `outgrew` in Hero
2. `re-direct` in Manifesto
3. `turn` in Contact

Allowed additional lime:

- humanoid chest line
- minimal progress markers
- subtle particle activation
- hover strokes
- camera path debugging only in dev, never final

No lime buttons.  
No lime text fills except if unavoidable for the underline word treatment.  
No lime backgrounds.

---

# 2. Technical concept

## 2.1 Required stack

Use:

- React
- React Three Fiber
- Drei
- GSAP ScrollTrigger
- Lenis smooth scroll
- TypeScript
- CSS modules or Tailwind for fallback UI only

The main experience should be WebGL-first.

## 2.2 Asset

Use:

```txt
/public/model.glb
```

The GLB is static and unrigged.

## 2.3 Main principle

Everything important is placed in 3D space.

Use HTML only for:

- accessibility fallback,
- SEO hidden/static copy,
- fallback mobile version,
- technical wrappers,
- optional crisp text overlays if Three.js text quality becomes insufficient.

But the intended desktop experience must place typography/cards as 3D objects.

## 2.4 Scene architecture

Create one global scene:

```txt
WorldRoot
  CameraRig
  Humanoid
  ParticleMindMap
  3DTextPlanes
  3DCards
  SectionAnchors
  Lights
```

Do not mount/unmount per section unless necessary.  
Objects can move outside camera view but should remain in the world.

## 2.5 Infinite canvas illusion

Each section is a spatial zone along a camera path.

Suggested world axis logic:

- Z axis = forward movement through the website
- X axis = lateral editorial composition
- Y axis = vertical emphasis / close-up shifts

The camera path should travel from `z = 0` to roughly `z = -120`.

Each section occupies a zone:

```txt
01 Hero                  z 0 to -10
02 Manifesto             z -10 to -20
03 Close-up Interlude    z -20 to -28
04 Selected Work         z -28 to -42
05 Method Interlude      z -42 to -50
06 Method Steps          z -50 to -65
07 Trust Ribbon          z -65 to -72
08 Why Woetive           z -72 to -88
09 Testimonials          z -88 to -98
10 Founders              z -98 to -110
11 Contact               z -110 to -122
12 Footer                z -122 to -130
```

The camera never teleports.  
It interpolates between waypoints.

---

# 3. Global visual system

## 3.1 Colors

```css
:root {
  --black: #050505;
  --charcoal: #0B0B0A;
  --deep-gray: #151515;
  --mid-gray: #777770;
  --muted-gray: #9A9A92;
  --off-white: #F4F3EE;
  --warm-white: #FAF9F4;
  --lime: #D0EF00;
}
```

## 3.2 Typography

Use Swiss grotesk as main.

Suggested:

```txt
Sans: Inter / Neue Haas Grotesk / Suisse Int'l
Mono: IBM Plex Mono / JetBrains Mono
Serif italic: Cormorant Garamond Italic or Editorial-style serif
```

If text is rendered in WebGL:

- Use Troika Three Text or Drei Text.
- Use SDF text rendering.
- Ensure crisp rendering.
- Keep letter spacing controlled.
- Avoid text shimmering.

## 3.3 Scene lighting

No blue light.  
No sci-fi glow.

Lights:

```txt
Key light: soft warm white, upper front-left
Rim light: subtle white, rear-right
Fill light: very weak
Mouse light: soft warm-white attention light
Chest line: lime emissive
```

## 3.4 Humanoid material

Matte black sculptural material:

```ts
bodyMaterial = new THREE.MeshStandardMaterial({
  color: "#050505",
  roughness: 0.84,
  metalness: 0.04
})
```

Add procedural micro-grain if possible.

## 3.5 Lime line

If separate material:

```ts
lineMaterial = new THREE.MeshStandardMaterial({
  color: "#D0EF00",
  emissive: "#D0EF00",
  emissiveIntensity: 1.15,
  roughness: 0.35
})
```

Intensity by scene:

```txt
Hero: 1.15
Manifesto: 1.35
Close-up: 1.55
Work: 0.75
Method Interlude: 1.2
Method Steps: 0.85
Trust Ribbon: 0
Why Woetive: 0.35
Testimonials: 0
Founders: 0.85
Contact: 1.65
Footer: 0
```

---

# 4. Replace liquid object with particle mind-map sphere

Remove the obsidian/liquid blob completely.

Create a subtle **AI mind-map particle sphere** behind and around the humanoid.

## 4.1 Meaning

The sphere represents:

- AI-assisted thinking,
- decision mapping,
- hidden structure,
- studio intelligence,
- speed in the background.

It is not the product.  
It should never dominate the humanoid or typography.

## 4.2 Visual behavior

The sphere should look like:

- dim off-white particles,
- thin connecting lines,
- low opacity,
- spatial depth,
- slow organic drift,
- quiet decision map.

It must not look like:

- galaxy,
- crypto network,
- matrix code,
- blue AI sphere,
- glowing tech cliché,
- stock particle background.

## 4.3 Particle count

Desktop:

```ts
PARTICLE_COUNT = 160 to 220
```

Tablet:

```ts
PARTICLE_COUNT = 90 to 120
```

Mobile:

```ts
PARTICLE_COUNT = 40 to 70
```

## 4.4 Placement

Primary use:

```txt
Hero: behind humanoid, slightly left and center
Manifesto: fade to low visibility
Close-up: almost disappear
Contact: return behind humanoid
```

World position suggestion:

```ts
particleSphere.position = [-0.8, 1.25, -3.0]
particleSphere.scale = [2.6, 1.7, 1.2]
```

## 4.5 Interaction

Mouse acts as attention light:

- nearby particles brighten slightly,
- nearby lines become more visible,
- no large glow,
- max particle opacity increase +0.15,
- max line opacity increase +0.10,
- lime line intensity +0.08 near humanoid.

## 4.6 Motion

Particles drift slowly:

```txt
speed: 0.02–0.05
drift amplitude: 0.015–0.04 units
sphere rotation: very slow, 0.01 rad/sec
```

No fast orbiting.

---

# 5. Camera path philosophy

The camera is the protagonist.

The humanoid is static.  
The world moves because the camera travels.

## 5.1 Motion vocabulary

Use only:

- slow push-in,
- slow dolly out,
- lateral slide,
- parallax orbit,
- tilt down,
- tilt up,
- macro close-up,
- pass-through between text planes,
- foreground panel crossing.

Do not use:

- camera shake,
- fast zoom,
- spin,
- flashy orbit,
- walking simulation,
- random fly-through.

## 5.2 Text behavior

Text is physically placed in 3D space.

Text does not “fade out” as primary motion.

Text disappears because:

- camera passes it,
- it moves outside frame,
- humanoid occludes it,
- it is left behind in depth,
- another plane crosses in front of it.

Opacity can be used only at 0–5% and 95–100% of a section to avoid harsh clipping.

## 5.3 Depth rules

- Big conceptual words can sit behind the humanoid.
- Readable body text should stay in clear space.
- Cards can pass in front of the humanoid if they represent work/deliverables.
- Manifesto text should feel carved into the dark space around the humanoid.
- Contact text can begin behind the humanoid and settle beside it.

---

# 6. Scroll-to-camera mapping

Use one scroll timeline.

Pseudo logic:

```ts
const progress = scrollY / totalScrollHeight
const cameraState = getCameraStateAtProgress(progress)
```

Use camera waypoints.

```ts
type CameraWaypoint = {
  id: string
  progress: number
  position: [number, number, number]
  target: [number, number, number]
  fov: number
  modelPosition: [number, number, number]
  modelRotation: [number, number, number]
  modelScale: number
  modelOpacity: number
  particleOpacity: number
  limeIntensity: number
  bgColor: string
}
```

Interpolate between waypoints.

Use damping:

```txt
camera damping: 0.055
target damping: 0.065
model transform damping: 0.075
particle damping: 0.04
```

---

# 7. Global fixed navigation

Navigation is mostly 2D overlay, because it must stay crisp and usable.

But visually it should feel integrated with the scene.

## 7.1 Desktop nav

Top left:

```txt
WOETIVE
Built by hand. Accelerated by AI.
```

Center:

```txt
Work
Method
About
Contact
```

Right:

```txt
Q3 2026 · TWO SLOTS OPEN
```

Nav behavior:

- fixed,
- switches color depending scene:
  - white on dark
  - black on light
- no fade as main transition,
- color shifts smoothly as background changes,
- z-index highest.

---

# 8. SECTION 01 — HERO

## 8.1 Scene purpose

Immediate visual contract.

This is not an agency website.  
It is a dark Swiss editorial cinematic interface.

The user should feel:

> They direct. They decide. They have taste.

## 8.2 Copy

Exact:

```txt
WOETIVE · ISSUE 02 / 2026
Q3 2026 · TWO SLOTS OPEN
Brands for companies that outgrew their first one.
BUILT BY HAND. ACCELERATED BY AI.
Begin →
See work
SCROLL ↓
```

3D glass note card:

```txt
CURRENT MODE
One project at a time.
Six weeks per brand.
No retainer trap.
```

Small editorial note:

```txt
Creative direction for companies past their first chapter. Brand identity, web, campaigns, motion, and content systems — directed, not delegated.
```

## 8.3 3D layout

World zone:

```txt
z: 0 to -10
```

Humanoid:

```ts
position: [1.05, -0.95, -2.2]
rotation: [0, -0.18, 0]
scale: 1.95
```

Particle sphere:

```ts
position: [-0.45, 1.1, -3.15]
scale: [2.7, 1.6, 1.1]
opacity: 0.38
```

Main headline as 3D text group:

```ts
position: [-2.55, 1.05, -1.15]
rotation: [0, 0.02, 0]
```

Line breaks:

```txt
Brands for
companies that
outgrew their
first one.
```

The headline should sit partly in front of the particle sphere but spatially near the humanoid.

`outgrew` is serif italic with lime underline.

Subhead:

```ts
position: [-2.55, -0.55, -1.1]
```

CTA group:

```ts
position: [-2.55, -0.95, -1.05]
```

Editorial note:

```ts
position: [-0.65, -1.45, -1.2]
```

Glass note card:

```ts
position: [1.55, -0.55, -0.85]
rotation: [0, -0.08, 0]
scale: [1, 1, 1]
```

The glass card is a 3D plane with shader-like frosted material or HTML/CSS 3D transform if easier.

## 8.4 Camera motion

Start camera:

```ts
position: [0.55, 1.25, 4.8]
target: [0.05, 0.85, -2.0]
fov: 38
```

End camera:

```ts
position: [0.10, 1.45, 3.15]
target: [0.35, 1.1, -2.15]
fov: 34
```

Motion:

- slow push-in toward humanoid chest/face,
- slight slide from left to right,
- particle sphere remains behind model,
- headline appears already in scene; camera reveals it by moving into position,
- glass card enters view from right due to camera movement, not fade.

## 8.5 Element choreography

Progress 0.00:

- camera begins wide,
- headline is partially off-frame left,
- humanoid is visible but not fully dominant,
- particle sphere is visible behind.

Progress 0.15:

- camera aligns with headline.
- user can read first two lines.

Progress 0.30:

- `outgrew` crosses central focus area.
- underline draws as camera locks momentarily.

Progress 0.45:

- glass card becomes visible on right because the camera slide reveals it.
- do not fade it in; it should enter from right edge.

Progress 0.65:

- camera pushes closer.
- headline begins to move out left relative to camera.
- humanoid takes more visual priority.

Progress 0.85:

- CTA and scroll cue slide below frame due to camera push/tilt.
- particle sphere dims slightly.

Progress 1.00:

- camera is close enough to transition into Manifesto.
- hero text is behind/left of camera and no longer central.

---

# 9. SECTION 02 — MANIFESTO

## 9.1 Scene purpose

The manifesto explains the studio’s stance.

It must feel like the camera entered the mind of the brand.

## 9.2 Copy

Exact:

```txt
MANIFESTO · 01
We don't redesign. We re-direct.
Most brands lose their grip when the company outgrows them. We rebuild the system before that happens — strategy, identity, and AI workflow that scales with you.
TWO DIRECTORS · AI IN STUDIO · SIX WEEKS PER BRAND
```

## 9.3 3D layout

World zone:

```txt
z: -10 to -20
```

Humanoid:

```ts
position: [0.78, -0.9, -12.0]
rotation: [0, -0.04, 0]
scale: 2.55
```

Manifesto headline as huge 3D serif italic text:

```ts
position: [-2.35, 1.15, -10.95]
rotation: [0, 0.03, 0]
```

Line breaks:

```txt
We don't
redesign.
We re-direct.
```

Body text plane:

```ts
position: [-2.25, -0.55, -10.85]
width: 1.6
```

Meta line:

```ts
position: [-2.25, -1.55, -10.85]
```

`re-direct` underline is lime.

Particle sphere:

```ts
opacity: 0.12
position: [0.2, 1.1, -13.2]
```

## 9.4 Camera motion

Start:

```ts
position: [0.10, 1.45, 3.15]
target: [0.35, 1.1, -2.15]
```

Transition camera path pulls forward into world zone:

Mid:

```ts
position: [0.25, 1.65, -7.0]
target: [0.25, 1.2, -12.0]
fov: 32
```

End:

```ts
position: [-0.25, 1.75, -9.65]
target: [0.15, 1.30, -12.1]
fov: 30
```

Motion:

- camera moves forward and slightly left,
- Manifesto text appears from right side of camera because the camera slides left,
- humanoid becomes close-up torso/head,
- hero elements remain behind camera, not faded.

## 9.5 Element choreography

Progress 0.00–0.20:

- camera leaves Hero zone,
- Hero text exits behind camera,
- Manifesto word planes enter from right.

Progress 0.20–0.45:

- “We don’t redesign.” occupies left side.
- humanoid fills right side.
- particle sphere is almost gone.

Progress 0.45–0.62:

- “We re-direct.” crosses the strongest reading zone.
- underline draws under `re-direct`.

Progress 0.62–0.82:

- body text plane comes into view below headline as camera descends slightly.
- meta line becomes visible near bottom because camera tilt reveals it.

Progress 0.82–1.00:

- camera continues toward humanoid texture, preparing Close-up Interlude.
- manifesto text moves left and out of frame naturally.

---

# 10. SECTION 03 — CLOSE-UP INTERLUDE

## 10.1 Scene purpose

A pause.  
No selling.  
No grid.  
Only proximity.

## 10.2 Copy

Exact:

```txt
INTERLUDE — 01
THIS IS WHO YOU'LL WORK WITH.
```

## 10.3 3D layout

World zone:

```txt
z: -20 to -28
```

Humanoid:

```ts
position: [0.58, -0.8, -22.0]
rotation: [0, 0.02, 0]
scale: 3.2
```

Eyebrow:

```ts
position: [-2.4, 1.55, -20.8]
```

Bottom-right line:

```ts
position: [1.25, -1.35, -20.6]
rotation: [0, -0.04, 0]
```

Particle sphere:

```ts
opacity: 0.03
```

## 10.4 Camera motion

Start:

```ts
position: [-0.25, 1.75, -9.65]
target: [0.15, 1.30, -12.1]
```

End:

```ts
position: [0.12, 1.42, -20.65]
target: [0.28, 0.95, -22.0]
fov: 26
```

Motion:

- camera glides down from head/neck to chest/shoulder,
- very shallow movement,
- text is placed far enough that it enters only when camera tilts down.

## 10.5 Element choreography

Progress 0.00:

- manifesto text is now behind camera.
- humanoid macro surface fills frame.

Progress 0.20:

- eyebrow appears top-left because camera passes it.
- do not animate opacity except edge safety.

Progress 0.70:

- “THIS IS WHO YOU’LL WORK WITH.” enters bottom-right.
- it is physically positioned in scene, not faded in.

Progress 1.00:

- camera begins dolly-out preparation for Work gallery.

---

# 11. SECTION 04 — SELECTED WORK

## 11.1 Scene purpose

Proof through curation.

The camera exits the dark close-up and enters a gallery-like work wall.

## 11.2 Copy

Exact:

```txt
WORK · 2023—2026
Recent work.
Three projects. Three problems solved.
See full archive (8 cases) →
```

Cards:

```txt
FORMA
ARCHITECTURE STUDIO
Project 01 · 2024 Q4 · 4 weeks
Architecture studio site that 3×'d the pipeline.
+300% Leads/mo · 1.2s LCP · 4 wks Ship time
Web · Brand refresh
```

```txt
VELDT
EDITORIAL CAMPAIGN
Project 02 · 2024 Q2 · 6 weeks
2.4M reach. Zero paid euros.
2.4M Reach · 18% Engagement · 6 wks Live
Art direction · Campaign
```

```txt
NOCTA
SPIRITS BRAND
Project 03 · 2023 Q4 · 12 weeks
From zero to 3 design awards.
3 Awards · +210% Retail · 12 wks Launch
Brand identity · Packaging
```

## 11.3 3D layout

World zone:

```txt
z: -28 to -42
```

Background changes to off-white.  
This should happen through camera entering a light “room”, not a flat fade.

Use a large off-white 3D wall plane:

```ts
position: [0, 0, -32]
scale: [8, 4.5, 1]
material: offWhite
```

Humanoid:

```ts
position: [2.35, -1.1, -32.8]
rotation: [0, -0.72, 0]
scale: 1.85
opacity: 0.88
```

The humanoid is cropped right, like a curator in the gallery.

Header text group:

```ts
position: [-2.75, 1.25, -30.5]
rotation: [0, 0.02, 0]
```

Cards as 3D panels:

Card 01:

```ts
position: [-1.55, -0.45, -29.9]
rotation: [0, 0.03, 0]
scale: [1.15, 1.45, 1]
```

Card 02:

```ts
position: [0.05, -0.45, -30.15]
rotation: [0, 0.00, 0]
scale: [1.15, 1.45, 1]
```

Card 03:

```ts
position: [1.65, -0.45, -30.4]
rotation: [0, -0.03, 0]
scale: [1.15, 1.45, 1]
```

Cards sit in front of the humanoid lower body if they overlap.

## 11.4 Camera motion

Start:

```ts
position: [0.12, 1.42, -20.65]
target: [0.28, 0.95, -22.0]
```

Mid:

```ts
position: [0.40, 1.25, -27.6]
target: [0.25, 0.85, -31.5]
fov: 36
```

End:

```ts
position: [0.20, 1.05, -29.0]
target: [0.20, 0.70, -31.8]
fov: 40
```

Motion:

- camera dollies out of close-up,
- slight rightward slide,
- enters off-white gallery wall,
- cards appear because camera arrives in front of them,
- no card fade needed.

## 11.5 Element choreography

Progress 0.00–0.18:

- dark close-up surface leaves frame.
- off-white plane enters from depth.
- exposure / background color changes naturally.

Progress 0.18–0.30:

- header group enters left side.

Progress 0.30–0.52:

- Card 01 moves into view from left edge because camera slides.
- Card 02 becomes visible next.
- Card 03 enters last.
- Cards do not fade. They physically occupy space.

Progress 0.52–0.78:

- camera holds enough for user to read.
- humanoid is visible right side behind cards.

Progress 0.78–1.00:

- camera tracks right.
- cards slide left and exit frame naturally.
- dark Method Interlude appears ahead.

---

# 12. SECTION 05 — METHOD INTERLUDE

## 12.1 Scene purpose

Reset the rhythm.  
One sentence.  
Darkness returns.

## 12.2 Copy

Exact:

```txt
INTERLUDE — 02
EVERY DECISION HAS WEIGHT.
```

## 12.3 3D layout

World zone:

```txt
z: -42 to -50
```

A dark room plane begins at z -44.

Humanoid:

```ts
position: [0.85, -0.95, -45.2]
rotation: [0, -0.35, 0]
scale: 2.65
```

Eyebrow:

```ts
position: [1.9, 1.45, -43.6]
```

Statement:

```ts
position: [-2.2, -1.15, -43.8]
```

## 12.4 Camera motion

Start:

```ts
position: [0.20, 1.05, -29.0]
target: [0.20, 0.70, -31.8]
```

End:

```ts
position: [0.65, 1.25, -42.9]
target: [0.45, 0.85, -45.2]
fov: 29
```

Motion:

- camera leaves gallery and moves into dark close-up,
- cards are left behind,
- statement appears bottom-left as camera tilts slightly down.

## 12.5 Element choreography

Progress 0.00–0.25:

- Work cards pass behind camera.
- off-white gallery plane exits.

Progress 0.25–0.70:

- dark close-up dominates.
- no extra UI.

Progress 0.70–1.00:

- “EVERY DECISION HAS WEIGHT.” enters bottom-left.
- camera slows.

---

# 13. SECTION 06 — METHOD STEPS

## 13.1 Scene purpose

Show the method without making it feel like a SaaS process.

Four physical typographic stations.

## 13.2 Copy

Exact:

```txt
METHOD · 04
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

## 13.3 3D layout

World zone:

```txt
z: -50 to -65
```

Light room returns.

Humanoid:

```ts
position: [1.45, -1.0, -55.5]
rotation: [0, 0.35, 0]
scale: 2.05
opacity: 0.92
```

Header:

```ts
position: [-2.65, 1.45, -52.5]
```

Step planes arranged in depth, like boards the camera passes:

Step 01:

```ts
position: [-1.65, 0.55, -53.0]
rotation: [0, 0.03, 0]
```

Step 02:

```ts
position: [-0.85, 0.10, -55.2]
rotation: [0, 0.02, 0]
```

Step 03:

```ts
position: [-0.05, -0.35, -57.4]
rotation: [0, 0.01, 0]
```

Step 04:

```ts
position: [0.75, -0.80, -59.6]
rotation: [0, 0.00, 0]
```

The camera should travel diagonally across these, so each step becomes readable as it enters the center.

## 13.4 Camera motion

Start:

```ts
position: [0.65, 1.25, -42.9]
target: [0.45, 0.85, -45.2]
```

End:

```ts
position: [-0.65, 1.35, -53.0]
target: [0.35, 0.55, -57.0]
fov: 36
```

Motion:

- camera drifts left and slightly down,
- each method board enters from right,
- camera passes across them like a museum wall,
- no fade.

## 13.5 Element choreography

Progress 0.00–0.18:

- dark interlude leaves behind camera.
- off-white returns.

Progress 0.18–0.32:

- Header “How we direct.” passes into view.

Progress 0.32–0.45:

- Step 01 is centered/readable.

Progress 0.45–0.58:

- Step 02 is centered/readable.

Progress 0.58–0.72:

- Step 03 is centered/readable.

Progress 0.72–0.88:

- Step 04 is centered/readable.

Progress 0.88–1.00:

- steps pass behind camera.
- humanoid fades only technically if needed as Trust Ribbon has no model.

---

# 14. SECTION 07 — TRUST RIBBON

## 14.1 Scene purpose

A flat breathing band inside the 3D world.

## 14.2 Copy

Exact:

```txt
TRUSTED BY FOUNDERS BUILDING REAL COMPANIES
Labaš ✦ Fresh Plus ✦ Mobilonline ✦ Gams ✦ Strategy1st ✦ Forbestclients ✦ Flowy
```

## 14.3 3D layout

World zone:

```txt
z: -65 to -72
```

Create one long horizontal 3D text ribbon plane.

Eyebrow:

```ts
position: [0, 0.75, -67.0]
```

Marquee text repeated across X:

```ts
position: [0, 0, -67.1]
```

No humanoid.

## 14.4 Camera motion

```ts
start position: [-0.65, 1.35, -53.0]
end position: [0.0, 1.0, -64.5]
target: [0, 0.25, -67.0]
fov: 42
```

Motion:

- camera glides parallel to the ribbon.
- marquee itself can move slowly along X.
- this is the only section where object motion is acceptable because it is a ribbon, not a fade.

---

# 15. SECTION 08 — WHY WOETIVE

## 15.1 Scene purpose

Only bento grid section.  
It explains difference without hype.

## 15.2 Copy

Exact:

```txt
WHY WOETIVE · 06 DIFFERENTIATORS
Not an agency. Your creative team.
```

Cards:

```txt
01 · TEAM — Two people, one AI stack.
No middle management. No juniors. Your brief gets read by a director, not parsed by a project manager.
Strategy / Craft / AI Workflow
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

## 15.3 3D layout

World zone:

```txt
z: -72 to -88
```

Off-white room.

Humanoid returns faintly behind the grid:

```ts
position: [2.55, -1.1, -78.0]
rotation: [0, -0.55, 0]
scale: 1.85
opacity: 0.25
```

Header:

```ts
position: [-2.65, 1.35, -74.0]
```

Bento cards are 3D panels at staggered depths.

Card 01 large:

```ts
position: [-1.75, 0.45, -75.0]
scale: [1.45, 1.0, 1]
```

Card 02:

```ts
position: [0.00, 0.55, -75.7]
scale: [1.15, 0.75, 1]
```

Card 03 tall:

```ts
position: [1.45, 0.25, -76.2]
scale: [1.05, 1.25, 1]
```

Card 04:

```ts
position: [0.05, -0.75, -77.0]
scale: [1.15, 1.05, 1]
```

Card 05 wide:

```ts
position: [-1.55, -0.85, -77.6]
scale: [1.45, 0.85, 1]
```

Card 06:

```ts
position: [1.45, -0.95, -78.2]
scale: [1.05, 0.85, 1]
```

Cards should feel physically placed, not flat CSS blocks.

## 15.4 Camera motion

Start:

```ts
position: [0.0, 1.0, -64.5]
target: [0, 0.25, -67.0]
```

End:

```ts
position: [0.15, 1.05, -73.5]
target: [0.1, 0.05, -76.8]
fov: 38
```

Motion:

- camera enters bento wall at slight angle,
- cards appear due to depth and lateral movement,
- no fade,
- parallax creates hierarchy.

## 15.5 Element choreography

Progress 0.00–0.20:

- header appears first.
- humanoid faintly visible right.

Progress 0.20–0.60:

- camera moves past cards in staggered depth:
  - Card 01 becomes readable first.
  - Card 03 appears on right.
  - Card 05 enters lower-left.
  - Remaining cards fill composition.

Progress 0.60–0.85:

- all cards readable.
- camera slows.

Progress 0.85–1.00:

- camera moves past bento grid.
- cards leave frame left/right based on depth.

---

# 16. SECTION 09 — TESTIMONIALS

## 16.1 Scene purpose

Quiet trust.  
No cinematic overkill.

## 16.2 Copy

Exact:

```txt
TESTIMONIALS · 4.8 / 5
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

## 16.3 3D layout

World zone:

```txt
z: -88 to -98
```

Off-white.

Three testimonial cards as large 3D planes.

Header:

```ts
position: [-2.55, 1.2, -90.0]
```

Cards:

```ts
quote01 position: [-1.65, -0.15, -91.0]
quote02 position: [0.00, -0.15, -91.4]
quote03 position: [1.65, -0.15, -91.8]
```

No humanoid.

## 16.4 Camera motion

```ts
start: [0.15, 1.05, -73.5]
end: [0.0, 0.95, -88.8]
target: [0, 0.05, -91.4]
fov: 40
```

Motion:

- camera moves straight and calmly.
- cards enter from depth.
- no fading.

---

# 17. SECTION 10 — FOUNDERS

## 17.1 Scene purpose

Humanize the studio without making it sentimental.

## 17.2 Copy

Exact:

```txt
ABOUT · THE BROTHERS
Two brothers. Same hand.
Joshua leads strategy and art direction. Daniel leads craft and code. We live together. Brand decisions continue at the dinner table, not just in the studio. AI gives us the tempo of a ten-person agency. Hand finishes give us the integrity of a two-person one.
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

## 17.3 3D layout

World zone:

```txt
z: -98 to -110
```

Humanoid returns as large background/center-right sculpture:

```ts
position: [1.4, -1.0, -102.5]
rotation: [0, -0.18, 0]
scale: 2.1
opacity: 1
```

Header and lead:

```ts
position: [-2.55, 1.2, -100.2]
```

Founder cards:

```ts
JSP card position: [0.35, -0.75, -100.8]
DAP card position: [1.55, -0.75, -101.2]
```

Cards pass in front of lower humanoid body.

## 17.4 Camera motion

```ts
start: [0.0, 0.95, -88.8]
end: [0.50, 1.25, -99.4]
target: [0.55, 0.65, -102.0]
fov: 36
```

Motion:

- camera approaches from left,
- humanoid returns gradually through framing,
- founder cards enter from right because camera tracks left-to-right.

---

# 18. SECTION 11 — CONTACT

## 18.1 Scene purpose

Climax.  
The camera arrives face-to-face with the object.

## 18.2 Copy

Exact:

```txt
READY WHEN YOU ARE
Your turn.
One project at a time. Currently directing for Q3 2026.
Begin →
See work
```

CTA primary:

```txt
mailto:house@woetive.com?subject=New project brief
```

## 18.3 3D layout

World zone:

```txt
z: -110 to -122
```

Dark room.

Humanoid:

```ts
position: [0.75, -0.95, -114.0]
rotation: [0, -0.05, 0]
scale: 2.45
opacity: 1
```

Particle sphere returns:

```ts
position: [-0.65, 0.85, -115.2]
scale: [2.3, 1.4, 1.0]
opacity: 0.22
```

Headline:

```ts
position: [-2.35, 0.65, -112.5]
```

`turn` underlined lime.

Body:

```ts
position: [-2.15, -0.55, -112.4]
```

CTA:

```ts
position: [-2.15, -1.05, -112.35]
```

## 18.4 Camera motion

Start:

```ts
position: [0.50, 1.25, -99.4]
target: [0.55, 0.65, -102.0]
```

End:

```ts
position: [0.0, 1.45, -111.65]
target: [0.22, 1.05, -114.0]
fov: 31
```

Motion:

- camera enters dark room,
- particle field reappears behind humanoid,
- camera pushes in slowly,
- headline begins partially behind humanoid, then camera angle reveals it enough to read.

## 18.5 Element choreography

Progress 0.00–0.25:

- Founders room disappears behind camera.
- dark contact room appears.

Progress 0.25–0.45:

- “Your” becomes visible.
- humanoid blocks part of the composition.

Progress 0.45–0.65:

- “turn.” enters visible zone.
- underline draws.
- chest line intensity rises.

Progress 0.65–0.85:

- body and CTA become visible as camera settles.
- particle sphere reacts to mouse again.

Progress 0.85–1.00:

- hold.
- no extra animations.

---

# 19. SECTION 12 — FOOTER

## 19.1 Scene purpose

Calm ending.

## 19.2 Copy

Exact:

```txt
WOETIVE
BUILT BY HAND. ACCELERATED BY AI.
© 2026 Woetive · Slovakia · Bratislava / Košice · Built by the brothers
IG · LI · BE
```

Links:

```txt
IG → https://instagram.com/woetive
LI → https://linkedin.com/company/woetive
BE → https://behance.net/woetive
```

## 19.3 3D layout

World zone:

```txt
z: -122 to -130
```

Dark flat ending.

No humanoid.  
No particles.

Large 3D wordmark plane:

```ts
position: [0, 0.45, -124.5]
scale: very large
```

Meta lines below.

## 19.4 Camera motion

```ts
start: [0.0, 1.45, -111.65]
end: [0.0, 0.85, -122.5]
target: [0, 0.35, -124.5]
fov: 42
```

Motion:

- camera leaves humanoid behind,
- wordmark enters as final object,
- stillness.

---

# 20. 3D card style

All cards should be actual planes in 3D or CSS3D objects spatially synced with WebGL.

## 20.1 Work cards

Dark material:

```css
background: rgba(5,5,5,0.96);
border: 1px solid rgba(255,255,255,0.14);
border-radius: 24px;
```

Card surface should have subtle grain.

## 20.2 Bento cards

Light material:

```css
background: rgba(250,249,244,0.82);
border: 1px solid rgba(0,0,0,0.12);
border-radius: 28px;
```

## 20.3 Founder cards

Editorial dossier look:

```css
background: rgba(250,249,244,0.72);
border: 1px solid rgba(0,0,0,0.12);
border-radius: 28px;
```

## 20.4 Glass note card

Use only in Hero, optionally Contact.

Frosted card should feel like iOS glass, not SaaS card.

```css
background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.055));
backdrop-filter: blur(30px) saturate(1.15);
border: 1px solid rgba(255,255,255,0.22);
border-radius: 34px;
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.28),
  inset 0 -1px 0 rgba(255,255,255,0.06),
  0 24px 80px rgba(0,0,0,0.38);
```

Mouse shimmer:

- follows cursor,
- max tilt 3 degrees,
- no bounce,
- no strong glow.

---

# 21. Implementation structure

Suggested files:

```txt
/src
  /components
    App.tsx
    Navigation.tsx
    WebGLWorld.tsx
    CameraRig.tsx
    Humanoid.tsx
    ParticleMindMap.tsx
    SceneText.tsx
    SceneCard.tsx
    GlassCard3D.tsx
    SectionDebugger.tsx
  /scene
    cameraPath.ts
    worldObjects.ts
    copy.ts
    materials.ts
    choreography.ts
  /hooks
    useScrollProgress.ts
    useMouseAttention.ts
    useCameraPath.ts
  /styles
    globals.css
```

---

# 22. Build order

Build in this order:

1. Basic React app.
2. Fixed WebGL canvas.
3. Load GLB humanoid.
4. Create camera path system.
5. Add Hero zone only.
6. Add 3D text for Hero.
7. Add particle mind-map sphere.
8. Add mouse attention light.
9. Add Manifesto zone.
10. Add Close-up Interlude.
11. Add Work cards.
12. Add Method Interlude.
13. Add Method Steps.
14. Add Trust Ribbon.
15. Add Why Woetive.
16. Add Testimonials.
17. Add Founders.
18. Add Contact.
19. Add Footer.
20. Add responsive fallback.
21. Add reduced motion fallback.
22. Polish camera easing and spatial readability.

Do not build flat sections first.  
Build the 3D camera world first.

---

# 23. Quality checklist

The final website must satisfy:

- It feels like one continuous 3D canvas.
- Text leaves through camera movement, not simple fading.
- Humanoid never walks or gestures.
- Camera movement makes the static model feel alive.
- Some elements pass behind the humanoid.
- Some cards pass in front of the humanoid.
- Particles are subtle, not sci-fi.
- No liquid blob.
- No fake dashboard metrics.
- No forbidden words.
- Only three lime underline words.
- Hero is dark Swiss editorial.
- Work section feels curated.
- Method section feels calm and exact.
- Contact feels like climax.
- Mobile remains usable.

---

# 24. Critical instruction for Claude Code

If there is a conflict between a normal web layout and the 3D camera concept, choose the 3D camera concept.

This is not a website with a 3D decoration.  
This is a 3D editorial film that happens to be navigable as a website.
