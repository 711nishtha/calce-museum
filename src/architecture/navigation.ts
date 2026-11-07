/**
 * Where to stand. Arrival points for each room and a viewing position for each
 * artwork, validated against collision so scripted moves never land inside a wall.
 */
import type { Artwork, Facing, RoomId } from "@/content/types";
import { artworkFootprint, buildCollider, isFree, type Collider } from "./collision";
import { EYE_HEIGHT, roomAt } from "./floorplan";

export interface Viewpoint {
  position: [number, number, number];
  lookAt: [number, number, number];
}

const E = EYE_HEIGHT;

/** Hand-placed arrival viewpoints: just inside each room, looking into it. */
export const arrivals: Record<Exclude<RoomId, `passage-${string}`>, Viewpoint> = {
  forecourt: { position: [0, E, 39], lookAt: [0, 3, 23] },
  reception: { position: [0, E, 21], lookAt: [0, 2.2, 11] },
  shop: { position: [-9.6, E, 17], lookAt: [-16, 1.4, 17] },
  cafe: { position: [9.6, E, 17], lookAt: [17, 1.6, 17] },
  garden: { position: [20, E, 17], lookAt: [27, 1, 15] },
  atrium: { position: [0, E, 7.2], lookAt: [0, 2.6, 0] },
  "gallery-sculpture": { position: [12.4, E, 0], lookAt: [22, 1.2, 0] },
  "gallery-painting": { position: [-12.4, E, 0], lookAt: [-22, 1.6, 0] },
  "gallery-photography": { position: [0, E, -12.4], lookAt: [0, 1.4, -20] },
  "gallery-installation": { position: [0, E, -28.4], lookAt: [-2, 2.2, -36] },
};

export function arrivalFor(room: RoomId): Viewpoint {
  if (room in arrivals) return arrivals[room as keyof typeof arrivals];
  return arrivals.atrium;
}

const normal: Record<Facing, [number, number]> = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] };

let collider: Collider | null = null;
const getCollider = () => (collider ??= buildCollider());

/** Best place to stand to look at a work: in front of wall works, beside floor works. */
export function viewpointFor(work: Artwork): Viewpoint | null {
  const p = work.placement;
  if (p.type === "storage") return null;
  const c = getCollider();
  const centreY = p.type === "wall" ? (p.y ?? 1.6) : Math.min(1.2, work.dimensions.h / 200 + 0.45);
  const target: [number, number, number] = [p.x, centreY, p.z];

  if (p.type === "wall") {
    const [nx, nz] = normal[p.facing];
    const span = Math.max(work.dimensions.w, work.dimensions.h) / 100;
    for (const d of [Math.max(2.2, span * 1.15), 2.6, 3.2, 4.0, 4.6, 5.2, 2.0, 1.6]) {
      const x = p.x + nx * d;
      const z = p.z + nz * d;
      if (isFree(c, x, z) && roomAt(x, z)?.id === p.room) return { position: [x, E, z], lookAt: target };
    }
  } else {
    // Try a ring of positions around the work, preferring the side that faces the room's entrance.
    const fp = artworkFootprint(work);
    const base = fp?.type === "rect" ? Math.max(fp.x1 - fp.x0, fp.z1 - fp.z0) / 2 + 1.6 : 2.4;
    for (const r of [base, base + 0.5, base - 0.4, base + 1]) {
      for (let k = 0; k < 16; k++) {
        const a = Math.PI + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 8);
        const x = p.x + Math.cos(a) * r;
        const z = p.z + Math.sin(a) * r;
        if (isFree(c, x, z) && roomAt(x, z)?.id === p.room) return { position: [x, E, z], lookAt: target };
      }
    }
  }
  return null;
}
