/**
 * Turns the floor plan into batched geometry. Wall faces are sorted into surface
 * "buckets" (plaster inside, ashlar outside, limestone jambs and copings), so the whole
 * building renders in a handful of draw calls. UVs are anchored in world metres, so
 * textures run continuously across wall segments.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ATRIUM, WALL_THICKNESS, roomAt, rooms, walls, type FloorMaterial, type WallSegment } from "@/architecture/floorplan";
import { scaleBoxUVs, scalePlaneUVs } from "../materials/materials";
import { TILE_METRES, type Surface } from "../materials/textures";

export type WallBucket = Extract<Surface, "plaster" | "ashlar" | "limestone" | "nightPlaster">;

type V3 = [number, number, number];

class QuadBuilder {
  pos: number[] = [];
  nor: number[] = [];
  uv: number[] = [];
  idx: number[] = [];
  constructor(private tile: number) {}

  /** Adds a quad p0..p3; winding is corrected to face along n. UVs: (u,v) metres per vertex. */
  quad(p: [V3, V3, V3, V3], n: V3, uvs: [number, number][]) {
    const e1 = new THREE.Vector3(...p[1]).sub(new THREE.Vector3(...p[0]));
    const e2 = new THREE.Vector3(...p[3]).sub(new THREE.Vector3(...p[0]));
    const flip = e1.cross(e2).dot(new THREE.Vector3(...n)) < 0;
    const base = this.pos.length / 3;
    for (let i = 0; i < 4; i++) {
      this.pos.push(...p[i]!);
      this.nor.push(...n);
      this.uv.push(uvs[i]![0] / this.tile, uvs[i]![1] / this.tile);
    }
    if (flip) this.idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
    else this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(this.uv, 2));
    g.setIndex(this.idx);
    g.computeBoundingSphere();
    return g;
  }
}

const isDrumChord = (w: WallSegment) =>
  Math.abs(Math.hypot(w.a[0] - ATRIUM.cx, w.a[1] - ATRIUM.cz) - ATRIUM.r) < 0.01 && Math.abs(Math.hypot(w.b[0] - ATRIUM.cx, w.b[1] - ATRIUM.cz) - ATRIUM.r) < 0.01;

/** Decide what a wall face looks like by probing which room it faces. */
function faceSurface(w: WallSegment, px: number, pz: number): WallBucket {
  if (w.kind === "low") return "ashlar";
  if (w.kind === "partition") return px > 4 && pz < -35 ? "nightPlaster" : "plaster";
  const room = roomAt(px, pz);
  if (!room || room.kind === "exterior") return "ashlar";
  if (room.id === "gallery-installation" && px > 4 && pz < -35) return "nightPlaster";
  return "plaster";
}

export function buildWalls(): Record<WallBucket, THREE.BufferGeometry> {
  const T = WALL_THICKNESS;
  const builders: Record<WallBucket, QuadBuilder> = {
    plaster: new QuadBuilder(TILE_METRES.plaster),
    ashlar: new QuadBuilder(TILE_METRES.ashlar),
    limestone: new QuadBuilder(TILE_METRES.limestone),
    nightPlaster: new QuadBuilder(TILE_METRES.nightPlaster),
  };

  for (const w of walls) {
    if (isDrumChord(w)) continue; // the drum is drawn as true cylinders
    const [ax, az] = w.a;
    const [bx, bz] = w.b;
    const len = Math.hypot(bx - ax, bz - az);
    const ux = (bx - ax) / len;
    const uz = (bz - az) / len;
    const nx = -uz;
    const nz = ux;
    const H = w.height;
    const L = len + T;
    const mx = (ax + bx) / 2;
    const mz = (az + bz) / 2;
    const half = L / 2;
    const t = T / 2;

    for (const s of [1, -1]) {
      const cx = mx + nx * t * s;
      const cz = mz + nz * t * s;
      const bucket = faceSurface(w, mx + nx * 0.7 * s, mz + nz * 0.7 * s);
      const p0: V3 = [cx - ux * half, 0, cz - uz * half];
      const p1: V3 = [cx + ux * half, 0, cz + uz * half];
      const along = (p: V3) => p[0] * ux + p[2] * uz;
      builders[bucket].quad([p0, p1, [p1[0], H, p1[2]], [p0[0], H, p0[2]]], [nx * s, 0, nz * s], [
        [along(p0), 0],
        [along(p1), 0],
        [along(p1), H],
        [along(p0), H],
      ]);
    }
    // coping
    const c = (su: number, sn: number): V3 => [mx + ux * half * su + nx * t * sn, H, mz + uz * half * su + nz * t * sn];
    const top: [V3, V3, V3, V3] = [c(-1, -1), c(1, -1), c(1, 1), c(-1, 1)];
    builders.limestone.quad(top, [0, 1, 0], top.map((p) => [p[0], p[2]] as [number, number]));
    // ends (door jambs)
    for (const s of [-1, 1]) {
      const ex = mx + ux * half * s;
      const ez = mz + uz * half * s;
      const q0: V3 = [ex - nx * t, 0, ez - nz * t];
      const q1: V3 = [ex + nx * t, 0, ez + nz * t];
      builders.limestone.quad([q0, q1, [q1[0], H, q1[2]], [q0[0], H, q0[2]]], [ux * s, 0, uz * s], [
        [0, 0],
        [T, 0],
        [T, H],
        [0, H],
      ]);
    }
  }
  return {
    plaster: builders.plaster.build(),
    ashlar: builders.ashlar.build(),
    limestone: builders.limestone.build(),
    nightPlaster: builders.nightPlaster.build(),
  };
}

export interface SkylightRect {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  y: number;
  room: string;
}

/** Ceiling slabs (one merged mesh) with gaps for skylight strips. */
export function buildCeilings(): { geometry: THREE.BufferGeometry; skylights: SkylightRect[] } {
  const parts: THREE.BufferGeometry[] = [];
  const skylights: SkylightRect[] = [];
  const slab = 0.32;
  const box = (x0: number, x1: number, z0: number, z1: number, y: number, h = slab) => {
    const w = x1 - x0;
    const d = z1 - z0;
    if (w <= 0.01 || d <= 0.01) return;
    const g = scaleBoxUVs(new THREE.BoxGeometry(w, h, d), w, h, d, TILE_METRES.plaster);
    g.translate((x0 + x1) / 2, y + h / 2, (z0 + z1) / 2);
    parts.push(g);
  };

  for (const room of rooms) {
    if (room.shape.type !== "rect" || room.kind === "exterior" || room.ceiling <= 0) continue;
    const { x0, x1, z0, z1 } = room.shape;
    const y = room.ceiling;
    const sk = room.skylights;
    if (!sk) {
      box(x0, x1, z0, z1, y);
      continue;
    }
    // Work in (a, b) coordinates: a runs along the skylight axis, b across it.
    const [a0, a1, b0, b1] = sk.axis === "x" ? [x0, x1, z0, z1] : [z0, z1, x0, x1];
    const toXZ = (aa0: number, aa1: number, bb0: number, bb1: number): [number, number, number, number] => (sk.axis === "x" ? [aa0, aa1, bb0, bb1] : [bb0, bb1, aa0, aa1]);
    const gaps = sk.at.map((c) => [c - sk.width / 2, c + sk.width / 2] as const).sort((p, q) => p[0] - q[0]);
    let cursor = b0;
    for (const [g0, g1] of gaps) {
      box(...toXZ(a0, a1, cursor, g0), y);
      // solid ends of the strip
      box(...toXZ(a0, a0 + 1, g0, g1), y);
      box(...toXZ(a1 - 1, a1, g0, g1), y);
      // light-well walls rising 0.6 m above the ceiling
      box(...toXZ(a0 + 1, a1 - 1, g0 - 0.08, g0), y, 0.9);
      box(...toXZ(a0 + 1, a1 - 1, g1, g1 + 0.08), y, 0.9);
      const [sx0, sx1, sz0, sz1] = toXZ(a0 + 1, a1 - 1, g0, g1);
      skylights.push({ x0: sx0, x1: sx1, z0: sz0, z1: sz1, y: y + 0.85, room: room.id });
      cursor = g1;
    }
    box(...toXZ(a0, a1, cursor, b1), y);
  }
  return { geometry: mergeGeometries(parts, false)!, skylights };
}

/** Floor planes grouped by material, plus the atrium disc. */
export function buildFloors(): Partial<Record<FloorMaterial, THREE.BufferGeometry>> {
  const groups: Partial<Record<FloorMaterial, THREE.BufferGeometry[]>> = {};
  const tileFor: Record<FloorMaterial, number> = { oak: TILE_METRES.oak, travertine: TILE_METRES.travertine, terracotta: TILE_METRES.terracotta, gravel: TILE_METRES.gravel, limestone: TILE_METRES.limestone };
  for (const room of rooms) {
    let g: THREE.BufferGeometry;
    if (room.shape.type === "rect") {
      const { x0, x1, z0, z1 } = room.shape;
      // extend under walls so there are no seams at thresholds
      const w = x1 - x0 + WALL_THICKNESS;
      const d = z1 - z0 + WALL_THICKNESS;
      g = scalePlaneUVs(new THREE.PlaneGeometry(w, d), w, d, tileFor[room.floor]);
      g.rotateX(-Math.PI / 2);
      g.translate((x0 + x1) / 2, room.kind === "passage" ? 0.004 : 0.002, (z0 + z1) / 2);
    } else {
      g = new THREE.CircleGeometry(room.shape.r + WALL_THICKNESS / 2, 64);
      const uv = g.attributes.uv as THREE.BufferAttribute;
      const span = (room.shape.r * 2) / tileFor[room.floor];
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * span, uv.getY(i) * span);
      g.rotateX(-Math.PI / 2);
      g.translate(room.shape.cx, 0.003, room.shape.cz);
    }
    (groups[room.floor] ??= []).push(g);
  }
  const out: Partial<Record<FloorMaterial, THREE.BufferGeometry>> = {};
  for (const [k, list] of Object.entries(groups)) out[k as FloorMaterial] = mergeGeometries(list!, false)!;
  return out;
}

/** A section of the atrium drum between two plan angles (radians from +x towards +z). */
export function drumSection(radius: number, from: number, to: number, y0: number, y1: number): THREE.CylinderGeometry {
  const g = new THREE.CylinderGeometry(radius, radius, y1 - y0, Math.max(4, Math.ceil(((to - from) * 64) / (Math.PI * 2))), 1, true, Math.PI / 2 - to, to - from);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const arc = radius * (to - from);
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * arc) / TILE_METRES.plaster, (uv.getY(i) * (y1 - y0)) / TILE_METRES.plaster);
  g.translate(ATRIUM.cx, (y0 + y1) / 2, ATRIUM.cz);
  return g;
}
