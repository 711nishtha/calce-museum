/**
 * 2D collision in plan. The visitor is a circle; walls are thick segments; furniture,
 * planters and plinths are circles or rectangles. Pure functions so they can be tested
 * without WebGL.
 */
import { PLAYER_RADIUS, WALL_THICKNESS, fixtures, walls, type Obstacle, type WallSegment } from "./floorplan";
import { artworks } from "@/content/artworks";
import type { Artwork } from "@/content/types";

export interface Collider {
  segments: { ax: number; az: number; bx: number; bz: number; r: number }[];
  circles: { x: number; z: number; r: number }[];
  /** rectangular obstacles, kept so that points inside them count as blocked */
  rects: { x0: number; x1: number; z0: number; z1: number }[];
}

/** Footprint that each floor-standing work occupies (plinth, pool, thread field). */
export function artworkFootprint(work: Artwork): Obstacle | null {
  const p = work.placement;
  if (p.type !== "floor") return null;
  const v = work.visual;
  if (v.kind === "installation") {
    if (v.form === "threads") return { type: "rect", x0: p.x - 2.2, x1: p.x + 2.2, z0: p.z - 2.2, z1: p.z + 2.2, tag: work.id };
    if (v.form === "mirror-pool") return { type: "rect", x0: p.x - 1.8, x1: p.x + 1.8, z0: p.z - 2.8, z1: p.z + 2.8, tag: work.id };
  }
  if (v.kind === "sculpture" && v.form === "seat") return { type: "rect", x0: p.x - 1.3, x1: p.x + 1.3, z0: p.z - 0.5, z1: p.z + 0.5, tag: work.id };
  return { type: "circle", x: p.x, z: p.z, r: 0.75, tag: work.id };
}

function rectToSegments(o: Extract<Obstacle, { type: "rect" }>) {
  const { x0, x1, z0, z1 } = o;
  return [
    { ax: x0, az: z0, bx: x1, bz: z0, r: 0 },
    { ax: x1, az: z0, bx: x1, bz: z1, r: 0 },
    { ax: x1, az: z1, bx: x0, bz: z1, r: 0 },
    { ax: x0, az: z1, bx: x0, bz: z0, r: 0 },
  ];
}

export function buildCollider(
  wallList: WallSegment[] = walls,
  obstacleList: Obstacle[] = [...fixtures, ...artworks.map(artworkFootprint).filter((o): o is Obstacle => o !== null)],
): Collider {
  const segments: Collider["segments"] = wallList.map((w) => ({ ax: w.a[0], az: w.a[1], bx: w.b[0], bz: w.b[1], r: WALL_THICKNESS / 2 }));
  const circles: Collider["circles"] = [];
  const rects: Collider["rects"] = [];
  for (const o of obstacleList) {
    if (o.type === "circle") circles.push({ x: o.x, z: o.z, r: o.r });
    else {
      segments.push(...rectToSegments(o));
      rects.push({ x0: o.x0, x1: o.x1, z0: o.z0, z1: o.z1 });
    }
  }
  return { segments, circles, rects };
}

function closestOnSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number): [number, number] {
  const dx = bx - ax;
  const dz = bz - az;
  const len2 = dx * dx + dz * dz;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2));
  return [ax + dx * t, az + dz * t];
}

/** Clearance check used by tests and the teleport validator. */
export function isFree(c: Collider, x: number, z: number, radius = PLAYER_RADIUS): boolean {
  for (const s of c.segments) {
    const [qx, qz] = closestOnSegment(x, z, s.ax, s.az, s.bx, s.bz);
    if ((x - qx) ** 2 + (z - qz) ** 2 < (radius + s.r) ** 2) return false;
  }
  for (const k of c.circles) {
    if ((x - k.x) ** 2 + (z - k.z) ** 2 < (radius + k.r) ** 2) return false;
  }
  for (const r of c.rects) if (x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1) return false;
  return true;
}

/**
 * Move from (x,z) by (dx,dz), sliding along walls. Large moves are sub-stepped so that
 * a fast frame can never tunnel through a 0.4 m wall.
 */
export function moveWithCollision(c: Collider, x: number, z: number, dx: number, dz: number, radius = PLAYER_RADIUS): [number, number] {
  const dist = Math.hypot(dx, dz);
  const steps = Math.max(1, Math.ceil(dist / 0.15));
  let px = x;
  let pz = z;
  for (let s = 0; s < steps; s++) {
    px += dx / steps;
    pz += dz / steps;
    for (let iter = 0; iter < 3; iter++) {
      let moved = false;
      for (const seg of c.segments) {
        const [qx, qz] = closestOnSegment(px, pz, seg.ax, seg.az, seg.bx, seg.bz);
        const ox = px - qx;
        const oz = pz - qz;
        const d2 = ox * ox + oz * oz;
        const min = radius + seg.r;
        if (d2 < min * min) {
          const d = Math.sqrt(d2) || 1e-6;
          const push = min - d;
          px += (ox / d) * push;
          pz += (oz / d) * push;
          moved = true;
        }
      }
      for (const k of c.circles) {
        const ox = px - k.x;
        const oz = pz - k.z;
        const d2 = ox * ox + oz * oz;
        const min = radius + k.r;
        if (d2 < min * min) {
          const d = Math.sqrt(d2) || 1e-6;
          px += (ox / d) * (min - d);
          pz += (oz / d) * (min - d);
          moved = true;
        }
      }
      if (!moved) break;
    }
  }
  return [px, pz];
}
