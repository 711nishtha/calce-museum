# QA report

Date: 7 November 2026 · Build: Next.js 15.5.28 production build · Browser: Chromium via DevTools
protocol, Windows 11, Intel UHD Graphics 750 (integrated).

## Automated checks

| Check | Result |
|-------|--------|
| `npm run typecheck` | pass |
| `npm run lint` | pass, 0 warnings |
| `npm test` | 37 / 37 pass |
| `npm run build` | pass — 140 static pages |
| `npm audit --omit=dev` | 0 vulnerabilities (PostCSS and sharp pinned via overrides) |
| Route sweep (production server) | 20 key routes → 200; unknown route → 404 |
| Internal links on home, visit, exhibition, identity, artwork, artist pages | 97 distinct links, all 200 |

Tests cover: walkability from the entrance to every room (grid flood-fill against real collision),
the site cannot be exited, sliding collision with no tunnelling, doorway widths and arch heights,
viewpoints and tour stops reachable and in the right room, wall works on a wall face inside their room
and within wall height, content referential integrity, no placeholder text, deterministic and
well-formed SVG for every artwork and identity asset, booking rules and pricing, AA contrast for every
text pair used, token parity between CSS and TypeScript.

## Tested by hand in the browser

**3D museum (desktop 1280 × 800)**
- Start screen over a live, slowly drifting view of the façade; loading progress for 33 works.
- Enter → glide to the forecourt; header shows the current room and exhibition; minimap tracks
  position and heading.
- Keyboard walking (W, arrows) and turning; walking into the garden wall stops flush, no pass-through.
- Directory: "Go" to every gallery, the atrium and the garden; "View" a specific work; fades between
  rooms, glides within a room.
- Interaction: focus prompt names the work and artist; E / button opens the panel; focus lands on
  "Return to the gallery"; Esc closes and re-captures the mouse.
- Deep links `?room=`, `?work=` (opens the panel on arrival) and `?tour=1`.
- Guided tour: stops 1–5 verified in sequence with correct rooms, narration and progress.
- Production console: no errors or warnings.
- Frame rate on integrated Intel UHD 750: ~26 fps on High, ~39 fps on Balanced (auto-selected);
  ~22 fps on Balanced while standing at the mirror pool, which re-renders the room.
- Live keyboard walk: forecourt → portal → reception → atrium (stopped by the bench ring) → east
  passage → Gallery I → focus and E on *Arch for an Absent Door*; full 13-stop guided tour.

**3D museum (mobile 390 × 844, touch emulation)**
- Touch instructions and Balanced quality on the start screen; a "Room by room, without 3D" link.
- Left-half drag walks (verified movement towards the portal); compact single-row toolbar.

**Website**
- Home at 1280 and 390: no horizontal overflow; header nav fits at 1160 px and above, menu below.
- Booking: empty submission lists five errors in a focused summary; complete flow → confirmation with
  reference, live ticket, correct total (2 adults + 1 reduced + 1 tour = €51) and demo labelling.
- Identity guide: posters, catalogue covers, signs, ticket, map, brochure, social and merchandise render
  in the brand typefaces; downloads are self-contained SVG.

## Defects found and fixed during QA

- Overexposed, hazy 3D scene → lower exposure, hemisphere and environment intensity; fog pushed back.
- Plaster and ashlar mottling read as stains → quieter, larger-scale mottling; reduced bump on stone.
- Start panel overflowed at 800 px height → scrollable panel, smaller headings.
- Mirror pool rendered black with the reflector material → glossy metal surface reflecting the
  environment.
- Viewpoints for large floor works stood at the basin edge → distance scales with the footprint.
- A viewpoint landed inside a bench (rectangles guarded only by their outline) → points inside
  rectangular obstacles now count as blocked.
- Meridian touched the floor → raised; covered by a height test.
- Rapid "+" clicks in booking counted once (stale closure) → functional increments.
- Earlier-today entry slots were bookable → marked "Passed" and disabled.
- Poster subtitles collided with the footer on two-line titles → title block anchored from the bottom.
- Hero illustration stopped short on mobile → wrapper fills the hero.
- Mobile 3D toolbar wrapped → compact buttons; Exit folded into the brand link.
- Live walkthrough (second pass): the mirror pool still rendered as a black slab → replaced with a
  planar `Reflector` (only rendered within 16 m) under a faint tint; it now mirrors the room.
- The "darkened chamber" was washed with light → Meridian's point light and glow reduced.
- Anchored sections scrolled under the sticky header → `scroll-padding-top` on the document.

## Known limitations

- Booking and shop are demonstrations: no payment, email or real ticket. Capacity is simulated.
- Artwork imagery is generated vector art; sculpture "photographs" on the website are drawn studio
  views, not photographs.
- No baked lightmaps: interior light is real-time (sun shadows + area lights), so corners are softer
  than a baked render. Area lights do not cast shadows.
- Pointer lock is unavailable in some embedded browsers; keyboard turning, the Directory and the
  "Continue walking" control keep the museum usable.
- 3D signage uses the brand fonts via troika; downloaded SVGs fall back to Georgia/Helvetica unless
  the OFL fonts are installed.
- Mobile was tested by emulation, not on physical devices; integrated-GPU performance is ~40 fps on
  Balanced.
- Screen readers get the full experience through the Directory and artwork dialogs; the 3D view itself
  is described but not navigable by screen reader.

## Deployment

`npm run build && npm start` on Node 20.9+, or deploy the repository to Vercel. Set
`NEXT_PUBLIC_SITE_URL`. No secrets are required.

Live on GitHub Pages: https://711nishtha.github.io/calce-museum/ — deployed by
`.github/workflows/deploy.yml` on every push to `main`. Verified after deploy: key pages, media,
fonts and the 404 page return the right status and content type; the 3D museum loads all 33 works,
follows a `?room=` deep link and logs no console errors.

## Update — the Royal Salon, finishes and speed

- **Gallery V — The Royal Salon** added north of Gallery II through a new arched passage: two Ionic
  colonnades with a Greek-key entablature, a coffered ceiling with gilt rosettes and a skylit lantern,
  oxblood damask over walnut panelling, a black-and-white marble floor, two chandeliers, a velvet ottoman
  and a pair of amphorae. Twelve public-domain paintings hang in gilt frames as clearly labelled
  reproductions, each credited to its holding collection and to Wikimedia Commons (downloaded with the
  owner's approval, converted to WebP, 3.3 MB in total).
- **Finishes throughout**: oak skirtings and stone cornices on every interior wall, moulded arch surrounds
  with keystones (gilt on the Royal Salon side), marble pilasters and a Greek-key frieze ring in the atrium,
  an inlaid marble star medallion around the olive tree, and brass picture lights over every painting.
- **Speed**: walking 1.7 → 3.6 m/s (Shift 6.5), keyboard turning 1.7 → 2.5 rad/s, quicker glides and fades.
- **Tests**: walkability, placement and viewpoint tests cover the new rooms; a new test checks that every
  reproduction ships its image, is credited and carries the reproduction label. 38/38 pass.
- **Performance** (production build, integrated Intel UHD 750, Balanced): static ornament is merged into a
  few geometries per material; Balanced keeps a pool of two room area lights that follow the visitor;
  chandeliers use emissive candles rather than extra lights. Measured ≈29 fps in the atrium, ≈45 fps in
  Gallery I and 31–38 fps in the Royal Salon.
- Known limitation: on Balanced, a room you have not yet entered is lit only by daylight fill until you step
  into it (High quality lights every room at once).
