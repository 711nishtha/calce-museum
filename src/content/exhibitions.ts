import type { Exhibition, UpcomingExhibition } from "./types";

export const exhibitions: Exhibition[] = [
  {
    id: "weight-of-stillness",
    number: "01",
    title: "The Weight of Stillness",
    subtitle: "Contemporary sculpture in stone, bronze and clay",
    medium: "sculpture",
    room: "gallery-sculpture",
    opens: "2026-09-12",
    closes: "2027-01-17",
    curator: "Livia Castellane",
    accent: "#A75F40",
    statement: [
      "Sculpture is often described as the art of mass, yet the works gathered here are concerned with something quieter: the moment at which a heavy thing comes to rest. Each of the three artists in this exhibition works with materials drawn from the Mediterranean basin — Salento limestone, harbour bronze, wood-fired terracotta — and each allows those materials a measure of authority over the final form.",
      "Ilaria Vensano balances carved blocks without fixings. Kojo Adembe-Laurent casts the imprint of fishing nets into bronze. Mireille Saadé builds arches and seats that frame the encounter between strangers. Together they propose that stillness is not the absence of movement, but movement that has found its equilibrium.",
      "The works are arranged on low plinths in the day-lit East Gallery, spaced so that each can be walked around in full. A glazed door at the southern end leads to the sculpture garden, where three works from the permanent collection continue the conversation outdoors.",
    ],
    layout: "Seven works on low plinths and walls, set out in two rows so each can be circled. The glazed south door leads into the garden.",
  },
  {
    id: "grammar-of-walls",
    number: "02",
    title: "A Grammar of Walls",
    subtitle: "Painting and the Mediterranean surface",
    medium: "painting",
    room: "gallery-painting",
    opens: "2026-10-03",
    closes: "2027-02-28",
    curator: "Omar Haddane",
    accent: "#777C58",
    statement: [
      "Around the Mediterranean, walls are painted, patched, whitewashed and repainted for centuries. They accumulate a slow grammar of colour and repair. This exhibition brings together three painters who treat the wall not as a support for images but as their subject.",
      "Elena Marchetti-Roa binds coastal earths in lime and sands them back into weathered bands. Yusuf Kalender paints arches and the shadows they cast at a single hour. Ines Albarrán Soto works in true fresco, isolating cracks, windows and repairs from Lisbon's older streets.",
      "Hung at generous intervals in the West Gallery under north-facing skylights, the paintings ask to be seen slowly and from several distances. A freestanding wall at the centre of the room carries two works back to back, one facing the morning and one facing the afternoon.",
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
      "Before the camera, there was light-sensitive paper. Salt & Light presents three contemporary artists who return to that direct contact between object, light and surface. None of the works on view was made with a lens.",
      "Nadia Ferhat exposes cyanotypes of wild plants in the open air. Aurelio Benn places glass and water on photographic paper in the darkroom. Saoirse Quell leaves paper at the shoreline for a day and lets the sea and sun do the rest.",
      "The North Gallery is arranged as a reading room: two low partitions divide the space into intimate bays and a central table holds the artists' working notebooks, reproduced for visitors to handle. Light levels are kept deliberately low to protect the works.",
    ],
    layout: "Ten prints across perimeter walls and two partitions forming reading bays, with a central notebook table.",
  },
  {
    id: "rooms-that-listen",
    number: "04",
    title: "Rooms That Listen",
    subtitle: "Installations for slow attention",
    medium: "installation",
    room: "gallery-installation",
    opens: "2026-07-04",
    closes: "2027-01-10",
    curator: "Livia Castellane",
    accent: "#674B3A",
    statement: [
      "Rooms That Listen gathers four installations that respond to the presence of the visitor. Nothing here is interactive in the conventional sense — there are no buttons and no screens — but each work changes depending on how, and how long, you stay.",
      "Collettivo Mareo's field of suspended threads registers the slightest movement of air. Hana Ostrowa-Lind's pool of still water doubles the skylight above, while her breathing wall brightens and dims over a full minute. In a darkened chamber, Tariq Sorel's single line of light traces the passage of the sun.",
      "The Long Room is the tallest space in the museum. Please move slowly, keep voices low and allow your eyes time to adjust in the chamber.",
    ],
    layout: "Four installations across the Long Room and a darkened side chamber; low light throughout.",
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

export function getExhibition(id: string): Exhibition | undefined {
  return exhibitions.find((e) => e.id === id);
}
