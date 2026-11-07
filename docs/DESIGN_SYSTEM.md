# CALCE design system

The identity of a small Mediterranean museum: stone, daylight and arches. The same tokens drive CSS
(`src/styles/tokens.css`), SVG and print (`src/lib/brand.ts`) and the 3D materials. The live guide, with
every asset downloadable as SVG, is at **/identity**.

## Mark and wordmark

- **Arch mark**: an arched opening on a threshold line, with the atrium's sun at the springing point
  (48 × 64 grid, 3.4-unit stroke). Arch is always ink or ivory; the sun may take an exhibition accent.
- **Wordmark**: "CALCE" in Instrument Serif capitals, tracking +16%. Lockups: horizontal (with "The
  Cultural Salon"), stacked, reversed, mark only.
- Clear space = width of the sun on all sides. Minimum: mark 16 px / 6 mm; lockup 120 px / 30 mm.

## Colour

| Token | Hex | Use |
|-------|-----|-----|
| Limestone | `#E8DFCE` | primary ground, stone panels |
| Ivory | `#F5F0E7` | page ground, tickets, reversed type |
| Sand | `#C8B69A` | rules on dark, inputs, secondary fills |
| Terracotta | `#A75F40` | accent, large numerals, mark sun (3:1 — large text only) |
| Olive | `#777C58` | landscape, status, Exhibition 02 |
| Walnut | `#674B3A` | wayfinding panels, dark sections |
| Ink | `#2A211B` | text (AA on every light ground) |
| Ink soft | `#5C4E44` | secondary text (AA) |
| Terracotta deep | `#8C4A2F` | links, primary buttons, small accent text (AA) |
| Olive deep | `#585C3E` | small olive text |
| Prussian | `#2E4560` | Exhibition 03 accent |
| Night | `#1C1713` | footer, 3D fallback |

Contrast pairs are asserted in `tests/brand.test.ts`. Focus rings use `#1F5F8B`, distinct from every
brand colour.

## Typography

- **Instrument Serif** (OFL) — display, titles, numerals, quotes, prompts in italic.
- **Instrument Sans** (OFL) — body, labels, interface, wayfinding.
- Fluid scale `--step--2` … `--step-6` (≈1.2 ratio on small screens, ≈1.33 on large). Body 1.6 leading,
  62-character measure. Labels: uppercase, 0.14em tracking, `--step--2`.
- Font files are self-hosted by `next/font`; copies in `public/fonts` (with licences) serve 3D signage.

## Space, grid, shape

- 4 px base; tokens `--space-1` (4 px) … `--space-10` (144 px).
- 12-column grid, gutters 16–32 px, margins 16–88 px, max width 1440 px.
- Images are cropped to arches: a semicircle across the full width (`.arch`, `--arch`).
- Buttons are pills (48 px min height); chips 40 px; no shadows except floating overlays.
- Motion: 160 / 320 / 700 ms with `cubic-bezier(.22,.61,.36,1)`; all set to 0 under reduced motion.

## Components

Header with primary nav and two actions; editorial exhibition rows (alternating, arch image, large
numeral); index lists; artwork figures with tombstone captions; meta lists; hours tables; FAQ
disclosures; filter chips; booking steps with calendar, slot grid and quantity steppers; summary panel;
notices; product entries; map with legend; 3D overlay (top bar, reticle, prompt pill, artwork dialog,
directory side panel, tour panel, minimap).

## Print and communication assets (all at /identity, all SVG)

| Asset | Format |
|-------|--------|
| Exhibition posters (arch and typographic variants) | A2, 420 × 594 mm |
| Catalogue covers | 210 × 270 mm |
| Gallery entrance signs | 600 × 900 mm limestone panels |
| Atrium wayfinding | 900 mm walnut panel |
| Timed-entry ticket | 200 × 80 mm (also rendered live on booking confirmation) |
| Visitor map | generated from the building plan |
| Season brochure | A4 trifold, outside and inside |
| Social campaign | 1080 × 1080 feed, 1080 × 1920 story |
| Merchandise | tote, poster, catalogue, cup, scarf, notebook, postcards |

Downloaded SVGs are self-contained (artwork nested). Text references the brand fonts with Georgia /
Helvetica fallbacks; for press-ready output, open in a vector editor with the OFL fonts installed and
convert text to outlines.

## Anti-patterns

Card grids for everything, decorative gradients, glassmorphism, badges, game-like HUDs, timers or
scores, placeholder copy, stock photography.
