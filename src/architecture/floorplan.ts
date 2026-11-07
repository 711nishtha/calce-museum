/**
 * CALCE floor plan — the single architectural source of truth.
 *
 * Units are metres. Plan coordinates use x (east +) and z (south +), matching three.js
 * world space with y up. The building is a radial plan: a circular day-lit atrium
 * with four arched passages to reception (south), sculpture (east), painting (west)
 * and photography (north); installations sit beyond photography. Café and shop flank
 * reception; the sculpture garden opens from the café and the sculpture gallery.
 *
 * Consumed by: the 3D architecture, collision, minimap, printed visitor map and tests.
 */
import type { RoomId } from "@/content/types";

export type Point = readonly [x: number, z: number];

export type RoomShape =
  | { type: "rect"; x0: number; x1: number; z0: number; z1: number }
  | { type: "circle"; cx: number; cz: number; r: number };

export type FloorMaterial = "oak" | "travertine" | "terracotta" | "gravel" | "limestone";

export interface RoomDef {
  id: RoomId;
  name: string;
  /** label used on signage and the minimap */
  label: string;
  kind: "gallery" | "public" | "exterior" | "passage";
  shape: RoomShape;
  ceiling: number;
  floor: FloorMaterial;
  exhibitionId?: string;
  /** skylight strips: run along `axis`, centred at each value of `at` on the other axis */
  skylights?: { axis: "x" | "z"; at: number[]; width: number };
}

export type WallKind = "exterior" | "interior" | "partition" | "low" | "glass";

export interface WallSegment {
  a: Point;
  b: Point;
  height: number;
  kind: WallKind;
}

export interface Opening {
  id: string;
  center: Point;
  width: number;
  /** clear height to the springing line of the arch */
  spring: number;
  /** "x" when the host wall runs along the x axis */
  axis: "x" | "z";
  kind: "arch" | "portal" | "glazed";
  /** height of the host wall above the opening */
  wallHeight: number;
  connects: [RoomId, RoomId];
}

export type Obstacle =
  | { type: "circle"; x: number; z: number; r: number; tag: string }
  | { type: "rect"; x0: number; x1: number; z0: number; z1: number; tag: string };

export const WALL_THICKNESS = 0.4;
export const EYE_HEIGHT = 1.62;
export const PLAYER_RADIUS = 0.35;

export const ATRIUM = { cx: 0, cz: 0, r: 9, height: 9.5, oculus: 2.6 } as const;
const PASSAGE_HALF = 1.6;
const PASSAGE_HEIGHT = 4.4;

export const rooms: RoomDef[] = [
  { id: "forecourt", name: "Olive Forecourt", label: "Forecourt", kind: "exterior", shape: { type: "rect", x0: -18, x1: 18, z0: 23, z1: 42 }, ceiling: 0, floor: "travertine" },
  { id: "reception", name: "Reception Hall", label: "Reception", kind: "public", shape: { type: "rect", x0: -8, x1: 8, z0: 11, z1: 23 }, ceiling: 5.2, floor: "travertine", skylights: { axis: "z", at: [0], width: 2 } },
  { id: "shop", name: "Museum Shop", label: "Shop", kind: "public", shape: { type: "rect", x0: -18, x1: -8, z0: 11, z1: 23 }, ceiling: 4.6, floor: "oak" },
  { id: "cafe", name: "Café Limone", label: "Café", kind: "public", shape: { type: "rect", x0: 8, x1: 18, z0: 11, z1: 23 }, ceiling: 4.6, floor: "terracotta" },
  { id: "garden", name: "Sculpture Garden", label: "Garden", kind: "exterior", shape: { type: "rect", x0: 18, x1: 34, z0: 8, z1: 27 }, ceiling: 0, floor: "gravel" },
  { id: "atrium", name: "Central Atrium", label: "Atrium", kind: "public", shape: { type: "circle", cx: ATRIUM.cx, cz: ATRIUM.cz, r: ATRIUM.r }, ceiling: ATRIUM.height, floor: "limestone" },
  { id: "passage-south", name: "South Passage", label: "Passage", kind: "passage", shape: { type: "rect", x0: -PASSAGE_HALF, x1: PASSAGE_HALF, z0: 8.7, z1: 11 }, ceiling: PASSAGE_HEIGHT, floor: "limestone" },
  { id: "passage-north", name: "North Passage", label: "Passage", kind: "passage", shape: { type: "rect", x0: -PASSAGE_HALF, x1: PASSAGE_HALF, z0: -11, z1: -8.7 }, ceiling: PASSAGE_HEIGHT, floor: "limestone" },
  { id: "passage-east", name: "East Passage", label: "Passage", kind: "passage", shape: { type: "rect", x0: 8.7, x1: 11, z0: -PASSAGE_HALF, z1: PASSAGE_HALF }, ceiling: PASSAGE_HEIGHT, floor: "limestone" },
  { id: "passage-west", name: "West Passage", label: "Passage", kind: "passage", shape: { type: "rect", x0: -11, x1: -8.7, z0: -PASSAGE_HALF, z1: PASSAGE_HALF }, ceiling: PASSAGE_HEIGHT, floor: "limestone" },
  { id: "passage-far-north", name: "Threshold", label: "Passage", kind: "passage", shape: { type: "rect", x0: -PASSAGE_HALF, x1: PASSAGE_HALF, z0: -27, z1: -25 }, ceiling: PASSAGE_HEIGHT, floor: "limestone" },
  { id: "gallery-sculpture", name: "Gallery I — East", label: "Sculpture", kind: "gallery", shape: { type: "rect", x0: 11, x1: 29, z0: -8, z1: 8 }, ceiling: 6.2, floor: "limestone", exhibitionId: "weight-of-stillness", skylights: { axis: "x", at: [-4.5, 0, 4.5], width: 1.2 } },
  { id: "gallery-painting", name: "Gallery II — West", label: "Painting", kind: "gallery", shape: { type: "rect", x0: -29, x1: -11, z0: -8, z1: 8 }, ceiling: 6.2, floor: "oak", exhibitionId: "grammar-of-walls", skylights: { axis: "x", at: [-4.5, 0, 4.5], width: 1.2 } },
  { id: "gallery-photography", name: "Gallery III — North", label: "Photography", kind: "gallery", shape: { type: "rect", x0: -9, x1: 9, z0: -25, z1: -11 }, ceiling: 5.2, floor: "oak", exhibitionId: "salt-and-light", skylights: { axis: "x", at: [-21, -15], width: 1 } },
  { id: "gallery-installation", name: "Gallery IV — The Long Room", label: "Installation", kind: "gallery", shape: { type: "rect", x0: -10, x1: 10, z0: -43, z1: -27 }, ceiling: 6.8, floor: "limestone", exhibitionId: "rooms-that-listen", skylights: { axis: "z", at: [-4.4], width: 1.6 } },
];

export const galleryNumeral: Partial<Record<RoomId, string>> = {
  "gallery-sculpture": "I",
  "gallery-painting": "II",
  "gallery-photography": "III",
  "gallery-installation": "IV",
};

/** Polyline helper: consecutive points become wall segments. */
function line(points: Point[], height: number, kind: WallKind): WallSegment[] {
  const out: WallSegment[] = [];
  for (let i = 0; i < points.length - 1; i++) out.push({ a: points[i]!, b: points[i + 1]!, height, kind });
  return out;
}

/** Arc of the atrium drum between two angles (radians, measured from +x towards +z). */
function atriumArc(from: number, to: number, steps: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps;
    pts.push([ATRIUM.cx + ATRIUM.r * Math.cos(t), ATRIUM.cz + ATRIUM.r * Math.sin(t)]);
  }
  return pts;
}

/** Half-angle subtended by a passage opening on the atrium drum. */
export const ATRIUM_OPENING_HALF_ANGLE = Math.asin(PASSAGE_HALF / ATRIUM.r);
/** Where passage walls meet the drum. */
const DRUM = Math.sqrt(ATRIUM.r ** 2 - PASSAGE_HALF ** 2);

function atriumWalls(): WallSegment[] {
  const a = ATRIUM_OPENING_HALF_ANGLE;
  const q = Math.PI / 2;
  const segs: WallSegment[] = [];
  for (let k = 0; k < 4; k++) {
    segs.push(...line(atriumArc(k * q + a, (k + 1) * q - a, 8), ATRIUM.height, "exterior"));
  }
  return segs;
}

const H = { gallery: 6.8, gallerySmall: 5.8, public: 5.8, low: 1.1 };

export const walls: WallSegment[] = [
  // Atrium drum
  ...atriumWalls(),

  // Passages (walls from the drum to the rooms)
  ...line([[-PASSAGE_HALF, DRUM], [-PASSAGE_HALF, 11]], PASSAGE_HEIGHT, "exterior"),
  ...line([[PASSAGE_HALF, DRUM], [PASSAGE_HALF, 11]], PASSAGE_HEIGHT, "exterior"),
  ...line([[-PASSAGE_HALF, -DRUM], [-PASSAGE_HALF, -11]], PASSAGE_HEIGHT, "exterior"),
  ...line([[PASSAGE_HALF, -DRUM], [PASSAGE_HALF, -11]], PASSAGE_HEIGHT, "exterior"),
  ...line([[DRUM, -PASSAGE_HALF], [11, -PASSAGE_HALF]], PASSAGE_HEIGHT, "exterior"),
  ...line([[DRUM, PASSAGE_HALF], [11, PASSAGE_HALF]], PASSAGE_HEIGHT, "exterior"),
  ...line([[-DRUM, -PASSAGE_HALF], [-11, -PASSAGE_HALF]], PASSAGE_HEIGHT, "exterior"),
  ...line([[-DRUM, PASSAGE_HALF], [-11, PASSAGE_HALF]], PASSAGE_HEIGHT, "exterior"),
  ...line([[-PASSAGE_HALF, -25], [-PASSAGE_HALF, -27]], PASSAGE_HEIGHT, "exterior"),
  ...line([[PASSAGE_HALF, -25], [PASSAGE_HALF, -27]], PASSAGE_HEIGHT, "exterior"),

  // Reception hall
  ...line([[-8, 11], [-PASSAGE_HALF, 11]], H.public, "exterior"),
  ...line([[PASSAGE_HALF, 11], [8, 11]], H.public, "exterior"),
  ...line([[-8, 23], [-2, 23]], H.public, "exterior"),
  ...line([[2, 23], [8, 23]], H.public, "exterior"),
  ...line([[-8, 11], [-8, 15.5]], H.public, "interior"),
  ...line([[-8, 18.5], [-8, 23]], H.public, "interior"),
  ...line([[8, 11], [8, 15.5]], H.public, "interior"),
  ...line([[8, 18.5], [8, 23]], H.public, "interior"),

  // Shop
  ...line([[-18, 11], [-8, 11]], H.public - 0.6, "exterior"),
  ...line([[-18, 11], [-18, 23]], H.public - 0.6, "exterior"),
  ...line([[-18, 23], [-8, 23]], H.public - 0.6, "exterior"),

  // Café — glazed garden doors in the east wall
  ...line([[8, 11], [18, 11]], H.public - 0.6, "exterior"),
  ...line([[8, 23], [18, 23]], H.public - 0.6, "exterior"),
  ...line([[18, 11], [18, 15]], H.public - 0.6, "exterior"),
  ...line([[18, 19], [18, 23]], H.public - 0.6, "exterior"),

  // Sculpture garden enclosure (garden walls of rubble limestone)
  ...line([[18, 8], [18, 11]], 2.4, "low"),
  ...line([[18, 23], [18, 27], [34, 27], [34, 8], [29, 8]], 2.4, "low"),

  // Forecourt enclosure (low limestone walls)
  ...line([[18, 27], [18, 42], [-18, 42], [-18, 23]], H.low, "low"),

  // Gallery I — Sculpture (east)
  ...line([[11, -8], [11, -PASSAGE_HALF]], H.gallery, "exterior"),
  ...line([[11, PASSAGE_HALF], [11, 8]], H.gallery, "exterior"),
  ...line([[11, -8], [29, -8], [29, 8], [25.2, 8]], H.gallery, "exterior"),
  ...line([[22, 8], [11, 8]], H.gallery, "exterior"),

  // Gallery II — Painting (west) with a freestanding partition
  ...line([[-11, -8], [-11, -PASSAGE_HALF]], H.gallery, "exterior"),
  ...line([[-11, PASSAGE_HALF], [-11, 8]], H.gallery, "exterior"),
  ...line([[-11, -8], [-29, -8], [-29, 8], [-11, 8]], H.gallery, "exterior"),
  ...line([[-22, -3], [-22, 3]], 4.2, "partition"),

  // Gallery III — Photography (north) with two reading-room partitions
  ...line([[-9, -11], [-PASSAGE_HALF, -11]], H.gallerySmall, "exterior"),
  ...line([[PASSAGE_HALF, -11], [9, -11]], H.gallerySmall, "exterior"),
  ...line([[-9, -11], [-9, -25], [-PASSAGE_HALF, -25]], H.gallerySmall, "exterior"),
  ...line([[9, -11], [9, -25], [PASSAGE_HALF, -25]], H.gallerySmall, "exterior"),
  ...line([[-4, -21], [-4, -15]], 3.4, "partition"),
  ...line([[4, -21], [4, -15]], 3.4, "partition"),

  // Gallery IV — Installations, with a dark chamber in the north-east corner
  ...line([[-PASSAGE_HALF, -27], [-10, -27], [-10, -43], [10, -43], [10, -27], [PASSAGE_HALF, -27]], 7.4, "exterior"),
  ...line([[4, -43], [4, -41]], 6.8, "partition"),
  ...line([[4, -37.4], [4, -35], [10, -35]], 6.8, "partition"),
];

export const openings: Opening[] = [
  { id: "entrance", center: [0, 23], width: 4, spring: 3.2, axis: "x", kind: "portal", wallHeight: H.public, connects: ["forecourt", "reception"] },
  { id: "reception-north", center: [0, 11], width: 3.2, spring: 2.8, axis: "x", kind: "arch", wallHeight: H.public, connects: ["reception", "passage-south"] },
  { id: "reception-shop", center: [-8, 17], width: 3, spring: 2.5, axis: "z", kind: "arch", wallHeight: H.public, connects: ["reception", "shop"] },
  { id: "reception-cafe", center: [8, 17], width: 3, spring: 2.5, axis: "z", kind: "arch", wallHeight: H.public, connects: ["reception", "cafe"] },
  { id: "cafe-garden", center: [18, 17], width: 4, spring: 2.6, axis: "z", kind: "glazed", wallHeight: H.public - 0.6, connects: ["cafe", "garden"] },
  { id: "sculpture-garden", center: [23.6, 8], width: 3.2, spring: 2.6, axis: "x", kind: "glazed", wallHeight: H.gallery, connects: ["gallery-sculpture", "garden"] },
  { id: "gallery-east", center: [11, 0], width: 3.2, spring: 2.8, axis: "z", kind: "arch", wallHeight: H.gallery, connects: ["passage-east", "gallery-sculpture"] },
  { id: "gallery-west", center: [-11, 0], width: 3.2, spring: 2.8, axis: "z", kind: "arch", wallHeight: H.gallery, connects: ["passage-west", "gallery-painting"] },
  { id: "gallery-north", center: [0, -11], width: 3.2, spring: 2.8, axis: "x", kind: "arch", wallHeight: H.gallerySmall, connects: ["passage-north", "gallery-photography"] },
  { id: "photography-north", center: [0, -25], width: 3.2, spring: 2.8, axis: "x", kind: "arch", wallHeight: H.gallerySmall, connects: ["gallery-photography", "passage-far-north"] },
  { id: "installation-south", center: [0, -27], width: 3.2, spring: 2.8, axis: "x", kind: "arch", wallHeight: 7.4, connects: ["passage-far-north", "gallery-installation"] },
  { id: "installation-chamber", center: [4, -39.2], width: 3.6, spring: 2.6, axis: "z", kind: "arch", wallHeight: 6.8, connects: ["gallery-installation", "gallery-installation"] },
];

/** Fixed furniture and landscape. Artwork plinths are added from artwork placements. */
export const fixtures: Obstacle[] = [
  // Forecourt planters with olive trees
  { type: "rect", x0: -13, x1: -4.5, z0: 27, z1: 35, tag: "planter" },
  { type: "rect", x0: 4.5, x1: 13, z0: 27, z1: 35, tag: "planter" },
  // Reception desk
  { type: "rect", x0: 3.2, x1: 6.6, z0: 13.4, z1: 14.6, tag: "desk" },
  // Atrium: olive tree in a round planter with an integrated stone bench
  { type: "circle", x: 0, z: 0, r: 2.4, tag: "atrium-planter" },
  // Café counter and tables
  { type: "rect", x0: 10, x1: 16, z0: 11.2, z1: 12.2, tag: "counter" },
  { type: "circle", x: 11, z: 14.6, r: 0.75, tag: "table" },
  { type: "circle", x: 15, z: 14.6, r: 0.75, tag: "table" },
  { type: "circle", x: 11, z: 20.4, r: 0.75, tag: "table" },
  { type: "circle", x: 15, z: 20.4, r: 0.75, tag: "table" },
  // Shop: shelving, table and counter
  { type: "rect", x0: -17.8, x1: -17.2, z0: 12, z1: 22, tag: "shelf" },
  { type: "rect", x0: -15, x1: -11.5, z0: 15.4, z1: 18.6, tag: "shop-table" },
  { type: "rect", x0: -11.4, x1: -9.4, z0: 11.4, z1: 12.4, tag: "shop-counter" },
  // Garden olive trees and benches
  { type: "circle", x: 21, z: 24, r: 0.5, tag: "olive" },
  { type: "circle", x: 31, z: 24, r: 0.5, tag: "olive" },
  { type: "circle", x: 31, z: 11.5, r: 0.5, tag: "olive" },
  { type: "rect", x0: 25, x1: 27.6, z0: 25.6, z1: 26.4, tag: "bench" },
  // Painting gallery: oak bench facing the partition
  { type: "rect", x0: -26.4, x1: -24.4, z0: -0.4, z1: 0.4, tag: "bench" },
  // Photography gallery: central reading table
  { type: "rect", x0: -1.2, x1: 1.2, z0: -19.6, z1: -16.4, tag: "reading-table" },
];

export const SPAWN = { position: [0, EYE_HEIGHT, 39] as [number, number, number], yaw: 0 };

export function roomById(id: RoomId): RoomDef {
  const r = rooms.find((room) => room.id === id);
  if (!r) throw new Error(`Unknown room ${id}`);
  return r;
}

export function roomCenter(room: RoomDef): Point {
  return room.shape.type === "rect"
    ? [(room.shape.x0 + room.shape.x1) / 2, (room.shape.z0 + room.shape.z1) / 2]
    : [room.shape.cx, room.shape.cz];
}

export function pointInRoom(room: RoomDef, x: number, z: number): boolean {
  const s = room.shape;
  if (s.type === "rect") return x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1;
  return (x - s.cx) ** 2 + (z - s.cz) ** 2 <= s.r ** 2;
}

/** Passages are tested first so that the atrium drum does not swallow them. */
const lookupOrder = [...rooms].sort((a, b) => Number(b.kind === "passage") - Number(a.kind === "passage"));

export function roomAt(x: number, z: number): RoomDef | null {
  return lookupOrder.find((r) => pointInRoom(r, x, z)) ?? null;
}

/** Overall extent of the site, used by the minimap and printed map. */
export const SITE_BOUNDS = { x0: -30, x1: 35, z0: -44, z1: 43 } as const;
