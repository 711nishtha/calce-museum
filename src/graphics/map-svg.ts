/**
 * Visitor map drawn directly from the floor plan. SVG user units are metres and
 * SVG y equals plan z, so north is up.
 */
import { SITE_BOUNDS, fixtures, galleryNumeral, roomCenter, rooms, walls, type RoomDef } from "@/architecture/floorplan";
import { artworkFootprint } from "@/architecture/collision";
import { artworks } from "@/content/artworks";
import { tourStops } from "@/content/tour";
import type { RoomId } from "@/content/types";

export { galleryNumeral };
import { palette, support } from "@/lib/brand";
import { arrow, text } from "./identity";

export const MAP_VIEWBOX = `${SITE_BOUNDS.x0} ${SITE_BOUNDS.z0} ${SITE_BOUNDS.x1 - SITE_BOUNDS.x0} ${SITE_BOUNDS.z1 - SITE_BOUNDS.z0}`;

const roomFill: Record<RoomDef["kind"], string> = {
  gallery: palette.limestone,
  public: "#EFE8DB",
  passage: palette.limestone,
  exterior: "#E3E0CC",
};

function shape(room: RoomDef, attrs: string): string {
  const s = room.shape;
  return s.type === "rect"
    ? `<rect x="${s.x0}" y="${s.z0}" width="${s.x1 - s.x0}" height="${s.z1 - s.z0}" ${attrs}/>`
    : `<circle cx="${s.cx}" cy="${s.cz}" r="${s.r}" ${attrs}/>`;
}

export interface MapOptions {
  highlight?: RoomId | null;
  tour?: boolean;
  labels?: boolean;
  /** draw artworks as small markers */
  works?: boolean;
  background?: string;
}

export function mapSvg(o: MapOptions = {}): string {
  const labels = o.labels ?? true;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MAP_VIEWBOX}" preserveAspectRatio="xMidYMid meet">`;
  s += `<rect x="${SITE_BOUNDS.x0}" y="${SITE_BOUNDS.z0}" width="${SITE_BOUNDS.x1 - SITE_BOUNDS.x0}" height="${SITE_BOUNDS.z1 - SITE_BOUNDS.z0}" fill="${o.background ?? palette.ivory}"/>`;
  const order = [...rooms].sort((a, b) => Number(a.kind === "passage") - Number(b.kind === "passage"));
  for (const room of order) {
    const hl = o.highlight === room.id;
    s += shape(room, `fill="${hl ? "#E9C9B4" : roomFill[room.kind]}" data-room="${room.id}"`);
  }
  // Atrium oculus
  s += `<circle cx="0" cy="0" r="1.3" fill="none" stroke="${support.inkSoft}" stroke-width="0.12" stroke-dasharray="0.4 0.3"/>`;
  for (const fx of fixtures) {
    if (fx.type === "circle") s += `<circle cx="${fx.x}" cy="${fx.z}" r="${fx.r}" fill="${fx.tag === "olive" || fx.tag === "atrium-planter" ? palette.olive : palette.sand}" opacity="0.55"/>`;
    else s += `<rect x="${fx.x0}" y="${fx.z0}" width="${fx.x1 - fx.x0}" height="${fx.z1 - fx.z0}" fill="${fx.tag === "planter" ? palette.olive : palette.sand}" opacity="${fx.tag === "planter" ? 0.35 : 0.55}"/>`;
  }
  if (o.works) {
    for (const w of artworks) {
      const fp = artworkFootprint(w);
      if (fp?.type === "circle") s += `<circle cx="${fp.x}" cy="${fp.z}" r="0.55" fill="${palette.terracotta}"/>`;
      else if (fp?.type === "rect") s += `<rect x="${fp.x0}" y="${fp.z0}" width="${fp.x1 - fp.x0}" height="${fp.z1 - fp.z0}" fill="${palette.terracotta}" opacity="0.35"/>`;
      else if (w.placement.type === "wall") s += `<circle cx="${w.placement.x}" cy="${w.placement.z}" r="0.42" fill="${palette.terracotta}"/>`;
    }
  }
  for (const w of walls) {
    const width = w.kind === "low" ? 0.25 : w.kind === "partition" ? 0.3 : 0.45;
    s += `<line x1="${w.a[0]}" y1="${w.a[1]}" x2="${w.b[0]}" y2="${w.b[1]}" stroke="${support.ink}" stroke-width="${width}" stroke-linecap="square"/>`;
  }
  if (o.tour) {
    const pts = tourStops.map((t) => `${t.position[0]},${t.position[2]}`).join(" ");
    s += `<g class="map-tour">`;
    s += `<polyline points="${pts}" fill="none" stroke="${palette.terracotta}" stroke-width="0.28" stroke-dasharray="0.8 0.5"/>`;
    tourStops.forEach((t, i) => {
      s += `<circle cx="${t.position[0]}" cy="${t.position[2]}" r="0.95" fill="${palette.terracotta}"/>`;
      s += text(t.position[0], t.position[2] + 0.42, String(i + 1), { size: 1.15, family: "text", fill: palette.ivory, anchor: "middle", weight: 600 });
    });
    s += `</g>`;
  }
  if (labels) {
    for (const room of rooms) {
      if (room.kind === "passage") continue;
      const [cx, cz] = roomCenter(room);
      const num = galleryNumeral[room.id];
      const dz = room.id === "atrium" ? 4.6 : 0;
      if (num) s += text(cx, cz - 1.4 + dz, num, { size: 3.2, fill: support.ink, anchor: "middle" });
      s += text(cx, cz + (num ? 1.6 : 0.5) + dz, room.label, { size: 1.6, family: "text", fill: support.ink, anchor: "middle", tracking: 0.1, upper: true });
    }
    s += arrow(0, 25.2, 2.6, "ahead", palette.terracotta);
    s += text(0, 28.4, "Entrance", { size: 1.2, family: "text", fill: palette.terracotta, anchor: "middle", tracking: 0.12, upper: true });
    // north arrow and scale bar
    s += `<g transform="translate(29 -38)"><path d="M0,-3 L1.4,1.6 L0,0.8 L-1.4,1.6 Z" fill="${support.ink}"/>${text(0, 4.4, "N", { size: 1.6, family: "text", anchor: "middle" })}</g>`;
    s += `<g transform="translate(-28 40)"><line x1="0" y1="0" x2="10" y2="0" stroke="${support.ink}" stroke-width="0.25"/><line x1="0" y1="-0.6" x2="0" y2="0.6" stroke="${support.ink}" stroke-width="0.25"/><line x1="10" y1="-0.6" x2="10" y2="0.6" stroke="${support.ink}" stroke-width="0.25"/>${text(5, -1, "10 m", { size: 1.2, family: "text", anchor: "middle" })}</g>`;
  }
  return s + `</svg>`;
}
