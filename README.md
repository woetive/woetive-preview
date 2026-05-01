# Woetive v18 — Bundle pre Claude Code

Tento ZIP obsahuje všetko, čo Claude Code potrebuje na postavenie v18 webu pre `woetive-preview` repo.

## Obsah balíčka

```
woetive_v18/
├── index.html              ← Starter HTML (7 sekcií, semantic markup)
├── styles/
│   └── main.css            ← Kompletný design systém
├── scripts/                ← Prázdny — Claude Code napíše main.js
├── frames/                 ← 5 image sekvencií, 755 WebP framov, 24MB
│   ├── 01_act1_reveal/     (151 frames)
│   ├── 02_act1_pullback/   (151 frames)
│   ├── 03_act1_pointing/   (151 frames)
│   ├── 04_act2_compose/    (151 frames)
│   └── 05_act3_invitation/ (151 frames)
├── assets/                 ← Prázdny (joshua.webp, daniel.webp ostali v repe)
├── vercel.json             ← Static deploy config
├── CLAUDE_CODE_BRIEF.md    ← Kompletný brief pre Claude Code
└── README.md               ← (tento súbor)
```

## Ako to spustiť

### Krok 1: Nahraj bundle do repa

Máš dve možnosti:

**A) Cez GitHub web UI**
1. Otvor `github.com/woetive/woetive-preview`
2. Vytvor novú branch `v18-build`
3. Drag-and-drop celý rozbalený bundle (zachovaj štruktúru priečinkov)
4. Commit na branch (NIE main, kým nie je hotové)

**B) Lokálne cez git**
```bash
git clone https://github.com/woetive/woetive-preview.git
cd woetive-preview
git checkout -b v18-build
# Skopíruj obsah bundle sem (zachovaj /frames/, /styles/, /scripts/, atď.)
git add -A
git commit -m "v18: scroll-driven build base + frames"
git push origin v18-build
```

### Krok 2: Otvor Claude Code

Spusti Claude Code v priečinku repa:
```bash
cd woetive-preview
claude
```

### Krok 3: Daj Claude Code prompt

Skopíruj kompletný prompt zo súboru **`CLAUDE_CODE_BRIEF.md`** a vlož ho do Claude Code chatu. Alebo jednoduchšie:

```
Read CLAUDE_CODE_BRIEF.md and execute the build.
```

Claude Code prečíta brief a:
- Doplní `scripts/main.js` (canvas image sequence + GSAP ScrollTrigger + Lenis)
- Doladí `index.html` ak je treba (presné copy je už v ňom, ale môžu byť drobné refinements)
- Doladí `styles/main.css` ak nájde chyby
- Otestuje že stránka funguje lokálne

### Krok 4: Test lokálne

V repe priečinku:
```bash
# Akýkoľvek static server, napríklad:
python3 -m http.server 8000
# Alebo:
npx serve .
```

Otvor `http://localhost:8000` a:
- Skontroluj že hero canvas sa scrubuje pri scrolle
- Otestuj všetkých 5 sekvencií
- Otestuj na iPhone Safari (Web Inspector cez USB)
- Otestuj `prefers-reduced-motion` (System Settings → Accessibility)

### Krok 5: Merge a deploy

Ak je všetko OK:
```bash
git checkout main
git merge v18-build
git push origin main
```

Vercel auto-deploynue. Verify na `woetive-preview-cmvq.vercel.app`.

---

## Frame sekvencie — referencia

| Sekcia | Folder | Účel |
|---|---|---|
| Hero | `01_act1_reveal` | Ultra-macro lime line → close-up reveal postavy |
| Manifesto | `02_act1_pullback` | Close-up → full body pull-back |
| Proof | `03_act1_pointing` | Wide gallery + figure pointing na artwork |
| Method | `04_act2_compose` | Top-down view, figure komponuje brand artefakty |
| Contact | `05_act3_invitation` | Figure dvíha ruku v geste pozvania |

Každá sekvencia: 151 framov, 30fps, 1600×900 WebP.

---

## Známe gotchas

- Vercel cache pre /frames/ je nastavený na `immutable` (1 rok). Ak by si potreboval frames pretočiť, zmeň cestu (napr. `/frames-v2/`) namiesto invalidate.
- Safari iOS má memory limit ~256MB pre canvas. Lazy loading + memory cleanup v main.js je preto kritický.
- `prefers-reduced-motion` MUSÍ fungovať — niektorí návštevníci to majú zapnuté v OS a scroll-driven motion ich vyrazí.

---

## Rollback

Ak v18 nefunguje, vrátiť sa na v17:
```bash
git revert HEAD
git push origin main
```

Vercel auto-deploynue predošlú verziu.
