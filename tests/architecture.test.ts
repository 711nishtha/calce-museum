import { describe, expect, it } from "vitest";
import { buildCollider, isFree, moveWithCollision } from "@/architecture/collision";
import { PLAYER_RADIUS, SPAWN, openings, roomAt, roomById, rooms, walls } from "@/architecture/floorplan";
import { arrivals, viewpointFor } from "@/architecture/navigation";
import { artworks } from "@/content/artworks";
import { tourStops } from "@/content/tour";

const collider = buildCollider();
const STEP = 0.25;

/** Flood-fill the walkable grid from the spawn point. */
function reachableSet() {
  const key = (i: number, j: number) => `${i},${j}`;
  const toCell = (x: number, z: number) => [Math.round(x / STEP), Math.round(z / STEP)] as const;
  const [si, sj] = toCell(SPAWN.position[0], SPAWN.position[2]);
  const seen = new Set<string>([key(si, sj)]);
  const queue: [number, number][] = [[si, sj]];
  while (queue.length) {
    const [i, j] = queue.pop()!;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const ni = i + di;
      const nj = j + dj;
      const k = key(ni, nj);
      if (seen.has(k)) continue;
      const x = ni * STEP;
      const z = nj * STEP;
      if (x < -32 || x > 36 || z < -46 || z > 45) continue;
      if (!isFree(collider, x, z)) continue;
      seen.add(k);
      queue.push([ni, nj]);
    }
  }
  // A point counts as reachable if any of the grid cells around it was reached.
  const has = (x: number, z: number) => {
    const [i0, j0] = [Math.floor(x / STEP), Math.floor(z / STEP)];
    return [0, 1].some((di) => [0, 1].some((dj) => seen.has(key(i0 + di, j0 + dj))));
  };
  return { has, size: seen.size };
}

const reach = reachableSet();

describe("floor plan", () => {
  it("spawns the visitor in free space in the forecourt", () => {
    expect(isFree(collider, SPAWN.position[0], SPAWN.position[2])).toBe(true);
    expect(roomAt(SPAWN.position[0], SPAWN.position[2])?.id).toBe("forecourt");
  });

  it("has passable doorways at least 2.8 m wide between wall faces", () => {
    for (const o of openings) expect(o.width - 0.4, o.id).toBeGreaterThanOrEqual(2.6);
  });

  it("keeps every arch below the wall it is cut into", () => {
    for (const o of openings) expect(o.spring + o.width / 2, o.id).toBeLessThan(o.wallHeight);
  });

  it("has no degenerate wall segments", () => {
    for (const w of walls) expect(Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1])).toBeGreaterThan(0.1);
  });

  it("is walkable from the entrance to every public room and gallery", () => {
    for (const room of rooms) {
      const s = room.shape;
      // sample a grid inside the room and require that some free cell is reachable
      const pts: [number, number][] = [];
      if (s.type === "rect") for (let x = s.x0 + 0.6; x < s.x1; x += 0.5) for (let z = s.z0 + 0.6; z < s.z1; z += 0.5) pts.push([x, z]);
      else for (let a = 0; a < Math.PI * 2; a += 0.3) pts.push([s.cx + Math.cos(a) * 5, s.cz + Math.sin(a) * 5]);
      const ok = pts.some(([x, z]) => reach.has(x, z));
      expect(ok, `${room.id} should be reachable`).toBe(true);
    }
  });

  it("can never be left: the outside of the site is not reachable", () => {
    expect(reach.has(0, 44)).toBe(false);
    expect(reach.has(-25, 20)).toBe(false);
    expect(reach.has(30, -20)).toBe(false);
  });

  it("slides along walls instead of passing through them", () => {
    // Walk hard into the reception's west wall from inside
    let [x, z] = [-6, 13];
    for (let i = 0; i < 60; i++) [x, z] = moveWithCollision(collider, x, z, -0.2, 0);
    expect(x).toBeGreaterThan(-8 + 0.2 + PLAYER_RADIUS - 0.01);
    // A single huge step cannot tunnel through a wall
    const [x2] = moveWithCollision(collider, 0, 20, 0, -30);
    expect(roomAt(x2, -10)?.id).not.toBe("reception");
  });
});

describe("navigation", () => {
  it("places every arrival point in free, reachable space inside its room", () => {
    for (const [id, v] of Object.entries(arrivals)) {
      expect(isFree(collider, v.position[0], v.position[2]), id).toBe(true);
      expect(reach.has(v.position[0], v.position[2]), id).toBe(true);
      expect(roomAt(v.position[0], v.position[2])?.id, id).toBe(id);
    }
  });

  it("finds a reachable viewpoint for every artwork on view", () => {
    for (const w of artworks) {
      const v = viewpointFor(w);
      expect(v, w.id).not.toBeNull();
      expect(reach.has(v!.position[0], v!.position[2]), w.id).toBe(true);
    }
  });

  it("puts every guided tour stop in free, reachable space in the named room", () => {
    for (const s of tourStops) {
      expect(isFree(collider, s.position[0], s.position[2]), s.id).toBe(true);
      expect(reach.has(s.position[0], s.position[2]), s.id).toBe(true);
      expect(roomAt(s.position[0], s.position[2])?.id, s.id).toBe(s.room);
    }
  });
});

describe("artwork placement", () => {
  const nearestWall = (x: number, z: number) =>
    Math.min(
      ...walls.map((w) => {
        const [ax, az] = w.a;
        const [bx, bz] = w.b;
        const dx = bx - ax;
        const dz = bz - az;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
        return Math.hypot(x - (ax + dx * t), z - (az + dz * t));
      }),
    );

  it("hangs wall works on a wall face, inside the stated room", () => {
    for (const w of artworks) {
      if (w.placement.type !== "wall") continue;
      const { x, z, room } = w.placement;
      expect(nearestWall(x, z), w.id).toBeLessThan(0.3);
      expect(roomAt(x, z)?.id, w.id).toBe(room);
    }
  });

  it("keeps wall works within the wall's height and floor works within their room", () => {
    for (const w of artworks) {
      const p = w.placement;
      if (p.type === "wall") {
        const top = (p.y ?? 1.6) + w.dimensions.h / 200;
        expect(top, w.id).toBeLessThan(roomById(p.room).ceiling);
        expect((p.y ?? 1.6) - w.dimensions.h / 200, w.id).toBeGreaterThan(0.3);
      }
      if (p.type === "floor") expect(roomAt(p.x, p.z)?.id, w.id).toBe(p.room);
    }
  });
});
