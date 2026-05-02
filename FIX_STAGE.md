# FIX 02 — CONTINUOUS STAGE ARCHITECTURE

**Scope:** Complete rewrite of canvas mechanic. ONE pinned canvas across 500vh of scroll, 5 overlays per act, static sections after.

## What changed

- Old: 5 separate `<section data-sequence>` canvas sections, each pinned 100vh independently → visible white gaps, hard cuts.
- New: ONE `.stage` div, 500vh tall. Inside, `.stage__viewport` is `position: sticky; top:0; height:100vh` — naturally pins for the whole 500vh. Single `<canvas>` plays all 5 acts continuously (~605 frames). 5 `.overlay` elements absolute-positioned, fade in/out via `.is-active` class as scroll progresses.

Static sections (Trust ribbon, Why Woetive, Testimonials, Founders, Footer) appear ONLY after stage releases at 500vh.

## Acts

| Act | Progress | Overlay copy | Frame range |
|---|---|---|---|
| 1 | 0–20% | Hero (left-aligned) | 0–120 |
| 2 | 20–40% | Manifesto (right-aligned) | 121–241 |
| 3 | 40–60% | Work + 3 sliding cards | 242–362 |
| 4 | 60–80% | Method + 4 step fade-ins | 363–483 |
| 5 | 80–100% | Contact + lime "turn" | 484–604 |

## Liquid glass nav

- `backdrop-filter: blur(24px) saturate(180%)`
- `background: rgba(255,255,255,0.55)`
- Inset highlight + soft drop shadow
- Intensifies on scroll past 100px

## Frame-indexed events

- Act 3 (work cards): card 1 at local frame 40, card 2 at 70, card 3 at 100 — synced with sweep gesture
- Act 4 (method steps): step 1/2/3/4 at local progress 0.0/0.25/0.50/0.75 within act
- Hero (act 1): lime accent on "outgrew" draws in 1.4s after page load
- Contact (act 5): lime accent on "turn" draws in at frame 70

## Acceptance

- Figure continuously visible during all 5 acts (no white gap between)
- Reverse scroll smooth in both directions
- Static sections appear only after 500vh of stage scroll
- Nav glass blur visible, intensifies on scroll
- Mobile (375px): overlays reflow, canvas keeps figure visible
