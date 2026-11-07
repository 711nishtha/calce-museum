# Architecture

CALCE is one Next.js 15 (App Router, TypeScript) application with two faces — an editorial website and a
real-time 3D museum — built on a single typed content model and a single graphic identity.

```
src/content/        typed data: artists, artworks, exhibitions, tour, journal, shop, visit   ← single source of truth
src/architecture/   floor plan, collision, viewpoints (pure TS, no three.js)                 ← tested
src/graphics/       deterministic SVG generators: artworks, identity, map, merch, hero
src/lib/            brand tokens, booking logic, collection filtering, formatting
src/app/(site)/     website routes (server components by default)
src/app/media/      static SVG routes: /media/art/[id], /media/identity/[id]
src/app/museum/     the 3D route (client only, lazy-loaded)
src/three/          scene: architecture, materials, landscape, artworks, controls, interaction, lighting, store
src/components/     site/, museum/ (3D overlay UI), booking/, shop/, ui/
tests/              vitest: walkability, placements, content integrity, booking, brand contrast
```

## One source, three renderings

| Data | Website | 3D museum | Print / identity |
|------|---------|-----------|------------------|
| `artworks.ts` `visual` spec | `<img src="/media/art/id">` | same URL loaded as a texture; sculptures and installations built procedurally from the same spec | embedded in posters, catalogue covers, social, brochure |
| `floorplan.ts` | map page, exhibition plans | walls, floors, ceilings, skylights, collision, minimap | printed visitor map |
| `tour.ts` | `/map` tour list | guided tour camera stops | — |
| `brand.ts` / `tokens.css` | CSS tokens | material colours, signage | all SVG assets |

Artwork images are generated, original vector "works". Nothing pretends to be a photograph: paintings and
camera-less prints are rendered as the works themselves; sculptures and installations appear on the
website as drawn studio views and in 3D as real geometry.

## The floor plan

Units are metres; plan x is east, plan z is south (identical to three.js world axes, y up). A circular,
day-lit atrium (r = 9 m, 9.5 m high, 2.6 m oculus) opens through four arched passages to:

- **South** — Reception (16 × 12 m), flanked by the Shop (west) and Café Limone (east), all fronting
  the Olive Forecourt where the visit begins.
- **East** — Gallery I, sculpture (18 × 16 m), with a glazed door to the Sculpture Garden.
- **West** — Gallery II, painting, with a freestanding partition.
- **North** — Gallery III, photography, arranged as a reading room, then the Threshold passage to
  Gallery IV, the Long Room (6.8 m ceiling) with a darkened chamber.

Walls are thick segments; openings are gaps with arched lintels; fixtures (desks, tables, planters,
benches) and artwork footprints are collision obstacles. `tests/architecture.test.ts` flood-fills the
walkable grid from the spawn point and proves every room is reachable, the site cannot be left, every
artwork has a reachable viewpoint, every tour stop is free, and wall works hang on a wall inside their room.

## 3D rendering

- **Architecture** (`three/architecture/buildArchitecture.ts`): wall faces are generated as quads with
  world-anchored UVs and sorted by surface (plaster inside, ashlar outside, limestone jambs/copings,
  dark plaster in the chamber) — four draw calls for every wall in the building. Ceilings are one merged
  mesh with gaps for skylight strips; the atrium drum is true cylinder sections with a coffered ring roof.
- **Materials** (`three/materials`): textures are painted on canvas at runtime (no image downloads) and
  shared; each represents a fixed real-world tile size.
- **Lighting**: one shadow-casting sun (late afternoon, south-west) whose light passes through skylights
  and the oculus; `rectAreaLight`s per room for diffuse daylight; hemisphere fill; a procedural
  `Environment` of light-formers for reflections; drei `Sky` and distance fog.
- **Artworks**: paintings on linen supports, prints matted in oak frames, reliefs as stone panels — all
  textured from `/media/art/[id]`. Sculptures are lathe/extrude/rounded-box geometry on plinths.
  Installations: 700–1400 animated threads that part around the visitor, a mirror basin, a wall that
  "breathes" over 60 s, and a light slot whose brightness follows the visitor's local time of day.
- **Controls** (`three/controls/Player.tsx`): pointer-lock mouse-look, WASD and arrow keys (arrows turn,
  so a mouse is optional), touch joystick + drag-look, 1.7 m/s walk, sub-stepped sliding collision,
  room detection, and scripted moves: a glide within a room, a fade through ivory between rooms (never
  through walls), and instant jumps under `prefers-reduced-motion`.
- **Interaction**: a centre-of-view raycast every 110 ms against invisible hit volumes, occluded by the
  architecture; E / Enter / click opens the information panel.
- **State**: Zustand store (`three/state/museumStore.ts`) shared by the canvas and the DOM overlay;
  high-frequency input goes through refs, not React state.

## Website

Server components render everything static (140 prerendered pages). Client components are limited to:
navigation state, collection filters, the map explorer, booking, shop reservation, opening-hours status
(computed in the visitor's time zone) and the 3D experience. SVG generators run on the server; client
components receive strings (shop mockups, map) to keep generators out of the client bundle.

## Booking (demonstration)

`src/lib/booking.ts` holds real rules: Monday closures, half-hourly slots until 90 minutes before
closing, ticket types and prices, guided-tour times, group limits, companion/under-18 rules, email
validation and deterministic simulated capacity. Confirmations are stored in `sessionStorage` only. No
payment is taken and tickets are marked "not valid for entry". A real deployment would replace
`finaliseBooking` with a call to a ticketing/payment provider.

## Performance

- The 3D route is code-split (`next/dynamic`, `ssr: false`); website routes ship ~103–120 kB first-load JS.
- Quality presets: **High** (DPR ≤ 2, 4096 shadow map, 1400 threads) and **Balanced** (DPR ≤ 1.25,
  2048 shadow map, 700 threads), auto-selected for integrated/mobile GPUs and touch devices.
- Thread animation runs only when the visitor is within 12 m; textures and materials are cached.
