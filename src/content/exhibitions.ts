import type { Exhibition, UpcomingExhibition } from "./types";

export const exhibitions: Exhibition[] = [
  {
    id: "weight-of-stillness",
    number: "01",
    title: "The Weight of Stillness",
    subtitle: "Sculpture that holds itself up — just",
    medium: "sculpture",
    room: "gallery-sculpture",
    opens: "2026-09-12",
    closes: "2027-01-17",
    curator: "Livia Castellane",
    accent: "#A75F40",
    statement: [
      "Nothing in this room is glued, pinned or bolted. Ilaria Vensano's seven-block column has stood for eleven weeks on nothing but its own weight; our insurers asked us, twice, whether we were sure. We were not entirely sure. That uncertainty is the exhibition.",
      "Vensano stacks soft Lecce limestone until it balances. Kojo Adembe-Laurent presses wax into fishing nets borrowed from the harbour and casts the result in bronze — heavy objects that are mostly holes. Mireille Saadé builds terracotta arches too narrow to be comfortable and benches that turn strangers towards each other whether they like it or not.",
      "Walk all the way round every piece; that is what the low plinths are for. Please don't touch, and please don't lean — not because the works are fragile, but because they are honest about how little holds them up.",
    ],
    layout: "Seven works on low plinths and walls, set out in two rows so each can be circled. The glazed south door leads into the garden.",
  },
  {
    id: "grammar-of-walls",
    number: "02",
    title: "A Grammar of Walls",
    subtitle: "Painting against the postcard",
    medium: "painting",
    room: "gallery-painting",
    opens: "2026-10-03",
    closes: "2027-02-28",
    curator: "Omar Haddane",
    accent: "#777C58",
    statement: [
      "There is a lazy version of Mediterranean painting: blue doors, white walls, a lemon tree, sold by the thousand to tourists. This exhibition is not a rescue of that picture. It is an argument with it.",
      "Elena Marchetti-Roa refuses the postcard by sanding her paintings back until the colour looks used rather than pretty. Yusuf Kalender has been accused — fairly, in our view — of nostalgia; his arches are empty of people, and the shadows do all the talking. Ines Albarrán Soto paints the parts of Lisbon nobody photographs: cement patches, failed repairs, a square of new plaster where a pipe burst.",
      "Our curators disagreed about whether Kalender belongs here. He stayed. Make up your own mind at the central partition, where his Morning Arch hangs back to back with Albarrán Soto's cracked afternoon wall — one looking away from the city, one looking hard at it.",
    ],
    layout: "Nine paintings on three walls and a central freestanding partition, with an oak bench placed for long looking.",
  },
  {
    id: "salt-and-light",
    number: "03",
    title: "Salt & Light",
    subtitle: "Photographs made without a camera",
    medium: "photography",
    room: "gallery-photography",
    opens: "2026-10-24",
    closes: "2027-03-21",
    curator: "Agnes Morrow-Ito",
    accent: "#2E4560",
    statement: [
      "No lenses were used to make anything in this room. Every image formed where light met a chemically sensitised surface, with the object resting directly on top.",
      "Nadia Ferhat's cyanotypes use ferric ammonium citrate and potassium ferricyanide; ultraviolet light reduces iron(III) to iron(II), which a water wash turns into insoluble Prussian blue. Exposure: 8 to 20 minutes of Marseille sun. Aurelio Benn's photograms are gelatin silver paper exposed in the darkroom for a fraction of a second through glass and water. Saoirse Quell's lumen prints are never developed at all: silver chloride paper darkens in daylight over 4 to 6 hours at the tideline, then is scanned before it can change further.",
      "Because these surfaces are still light-sensitive, Gallery III is held at 50 lux — about a third of an ordinary room. Your eyes will adjust in roughly two minutes. The artists' notebooks on the central table record every exposure time, failure and weather note.",
    ],
    layout: "Ten prints across perimeter walls and two partitions forming reading bays, with a central notebook table.",
  },
  {
    id: "rooms-that-listen",
    number: "04",
    title: "Rooms That Listen",
    subtitle: "Installations that need you to work",
    medium: "installation",
    room: "gallery-installation",
    opens: "2026-07-04",
    closes: "2027-01-10",
    curator: "Livia Castellane",
    accent: "#674B3A",
    statement: [
      "This is the most divisive exhibition we have shown. In the first month, eleven visitors asked for a refund and four wrote to say it changed how they breathe. Both responses seem reasonable to us.",
      "There are no labels on the walls, no screens and nothing to press. Collettivo Mareo's 2,400 linen threads move only because you do. Hana Ostrowa-Lind's basin of water holds a reflection until someone walks too fast beside it; her wall brightens and dims over a full minute whether anyone is watching or not. In a dark chamber, Tariq Sorel's slot of light is all there is to see.",
      "If you came for objects, this room will frustrate you. If you stay five minutes, it may not. Either reaction is welcome; the comments book at the door is the most-read thing in the museum.",
    ],
    layout: "Four installations across the Long Room and a darkened side chamber; low light throughout.",
  },
  {
    id: "royal-salon",
    number: "05",
    title: "The Royal Salon",
    subtitle: "Painting as propaganda, from Raphael to David — in reproduction",
    medium: "painting",
    room: "gallery-royal",
    opens: "2026-11-07",
    closes: "2027-12-31",
    curator: "Omar Haddane",
    accent: "#7A2A2C",
    reproductions: true,
    statement: [
      "Every painting in this room was made to persuade someone. Rigaud's Louis XIV advertised an absolute monarch to the courts of Europe; van Dyck turned an unpopular Charles I into a relaxed English gentleman nine years before his subjects beheaded him; Vigée Le Brun repainted Marie Antoinette in silk after the public decided a queen in muslin looked disreputable.",
      "Around them hang the stories those courts told about themselves — philosophers in Raphael's imaginary Athens, Botticelli's Venus, David's Socrates choosing death over compromise, written into paint for patrons who wanted the past to flatter the present.",
      "Everything here is a reproduction. The originals belong to the Prado, the Louvre, the National Gallery, the Uffizi, the Vatican and others, and could never hang together. Images are public-domain photographs from Wikimedia Commons, credited on every label. The room is built like the picture galleries such paintings were made for: colonnades, gilt and damask, the architecture of power.",
    ],
    layout: "Twelve reproductions in gilded frames along two aisles and the north wall, behind an Ionic colonnade; a velvet ottoman at the centre of the nave.",
  },
];

export const upcoming: UpcomingExhibition[] = [
  {
    id: "olive-archive",
    title: "The Olive Archive",
    subtitle: "Craft, memory and a tree that outlives us",
    opens: "2027-03-13",
    closes: "2027-07-25",
    teaser: "Woodwork, textiles and drawings gathered around the olive tree — a living archive that can outlast twenty human generations.",
  },
  {
    id: "terracotta-futures",
    title: "Terracotta Futures",
    subtitle: "New ceramics from around the Mediterranean",
    opens: "2027-05-29",
    closes: "2027-10-17",
    teaser: "Twelve ceramicists rethink the oldest building material in the region, from cooling façades to vessels made of reclaimed brick.",
  },
];

/** Exhibitions of original works; print identity (posters, signs, brochure) covers these. */
export const originalExhibitions = exhibitions.filter((e) => !e.reproductions);

export function getExhibition(id: string): Exhibition | undefined {
  return exhibitions.find((e) => e.id === id);
}
