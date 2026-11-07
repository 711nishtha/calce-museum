/**
 * CALCE graphic identity — every asset is a pure function returning an SVG string.
 * Text uses the page's web fonts when inlined, and named fallbacks when the SVG is
 * downloaded and opened on its own. Print assets use millimetre viewBoxes.
 */
import { artworksByExhibition } from "@/content/artworks";
import { exhibitions } from "@/content/exhibitions";
import type { Exhibition } from "@/content/types";
import { hours, museum } from "@/content/visit";
import { fonts, palette, support } from "@/lib/brand";
import { escapeXml, formatRange } from "@/lib/format";
import { embedArtwork } from "./embed";

interface TextOpts {
  size: number;
  family?: "display" | "text";
  fill?: string;
  anchor?: "start" | "middle" | "end";
  weight?: number;
  tracking?: number; // em
  italic?: boolean;
  upper?: boolean;
}

export function text(x: number, y: number, content: string, o: TextOpts): string {
  const fam = o.family === "text" ? fonts.text : fonts.display;
  const style = `font-family:${fam};font-size:${o.size}px;${o.weight ? `font-weight:${o.weight};` : ""}${o.tracking ? `letter-spacing:${o.tracking}em;` : ""}${o.italic ? "font-style:italic;" : ""}`;
  const value = escapeXml(o.upper ? content.toUpperCase() : content);
  return `<text x="${x}" y="${y}" fill="${o.fill ?? support.ink}" text-anchor="${o.anchor ?? "start"}" style="${style.replace(/"/g, "'")}">${value}</text>`;
}

/** Wrap text into lines by an approximate character budget. */
export function wrap(content: string, maxChars: number): string[] {
  const words = content.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      if (line) lines.push(line);
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) lines.push(line);
  return lines;
}

export function paragraph(x: number, y: number, content: string, maxChars: number, lineHeight: number, o: TextOpts): string {
  return wrap(content, maxChars)
    .map((l, i) => text(x, y + i * lineHeight, l, o))
    .join("");
}

// ——————————————————————————————————— Mark & wordmark

/**
 * The arch mark: an arched opening (the museum's recurring threshold) with the sun of
 * the atrium oculus at its springing point, standing on a threshold line. 48 × 64 units.
 */
export function mark(x: number, y: number, height: number, stroke: string = support.ink, sun: string = palette.terracotta): string {
  const s = height / 64;
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M9,58 V26 A15,15 0 0 1 39,26 V58" fill="none" stroke="${stroke}" stroke-width="3.4"/><circle cx="24" cy="26" r="5.6" fill="${sun}"/><line x1="2" y1="58" x2="46" y2="58" stroke="${stroke}" stroke-width="3.4"/></g>`;
}

export function wordmark(x: number, y: number, size: number, fill: string = support.ink, anchor: TextOpts["anchor"] = "start"): string {
  return text(x, y, "CALCE", { size, fill, tracking: 0.16, anchor });
}

export type LogoVariant = "primary" | "reversed" | "stacked" | "mark";

export function logoSvg(variant: LogoVariant): string {
  const dark = variant === "reversed";
  const ink = dark ? palette.ivory : support.ink;
  const bg = dark ? palette.walnut : palette.ivory;
  if (variant === "mark") return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96"><rect width="96" height="96" fill="${palette.limestone}"/>${mark(24, 14, 64, support.ink)}</svg>`;
  if (variant === "stacked")
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240"><rect width="320" height="240" fill="${bg}"/>${mark(136, 28, 64, ink)}${wordmark(160, 150, 44, ink, "middle")}${text(160, 184, "The Cultural Salon", { size: 15, family: "text", fill: ink, anchor: "middle", tracking: 0.12, upper: true })}</svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" width="480" height="120"><rect width="480" height="120" fill="${bg}"/>${mark(28, 26, 64, ink)}${wordmark(98, 76, 50, ink)}<line x1="278" y1="38" x2="278" y2="84" stroke="${ink}" stroke-width="1" opacity="0.5"/>${text(294, 57, "The Cultural", { size: 15, family: "text", fill: ink, tracking: 0.12, upper: true })}${text(294, 78, "Salon", { size: 15, family: "text", fill: ink, tracking: 0.12, upper: true })}</svg>`;
}

// ——————————————————————————————————— Shared shapes

export function archPath(x: number, y: number, w: number, h: number): string {
  const r = w / 2;
  return `M${x},${y + h} V${y + r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h} Z`;
}

export function arrow(x: number, y: number, size: number, dir: "left" | "right" | "ahead" | "back", color: string): string {
  const rot = { right: 0, ahead: -90, left: 180, back: 90 }[dir];
  const s = size / 24;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-10,0 H9 M2,-7 L9,0 L2,7" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="square"/></g>`;
}

function keyWork(ex: Exhibition) {
  return artworksByExhibition(ex.id)[0]!;
}

const roman = ["I", "II", "III", "IV"];

// ——————————————————————————————————— Posters (A2, 420 × 594 mm)

export function posterSvg(ex: Exhibition, variant: "arch" | "type" = "arch"): string {
  const W = 420;
  const H = 594;
  const work = keyWork(ex);
  const bg = variant === "arch" ? palette.limestone : ex.accent;
  const ink = variant === "arch" ? support.ink : palette.ivory;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm"><rect width="${W}" height="${H}" fill="${bg}"/>`;
  s += mark(28, 26, 30, ink, variant === "arch" ? ex.accent : palette.ivory);
  s += wordmark(64, 50, 20, ink);
  s += text(W - 28, 50, `Exhibition ${ex.number}`, { size: 9, family: "text", fill: ink, anchor: "end", tracking: 0.14, upper: true });
  s += `<line x1="28" y1="70" x2="${W - 28}" y2="70" stroke="${ink}" stroke-width="0.6" opacity="0.6"/>`;
  if (variant === "arch") {
    const ax = 60;
    const ay = 96;
    const aw = W - 120;
    const ah = 300;
    s += `<clipPath id="pa-${ex.id}"><path d="${archPath(ax, ay, aw, ah)}"/></clipPath>`;
    s += `<g clip-path="url(#pa-${ex.id})">${embedArtwork(work, ax, ay, aw, ah, `p-${ex.id}`)}</g>`;
    s += `<path d="${archPath(ax, ay, aw, ah)}" fill="none" stroke="${support.ink}" stroke-width="0.6"/>`;
    // Anchor the title block to the bottom so long titles grow upwards, clear of the footer.
    const titleLines = wrap(ex.title, 18);
    const top = 470 - (titleLines.length - 1) * 40;
    titleLines.forEach((l, i) => (s += text(28, top + i * 40, l, { size: 40, fill: ink })));
    s += text(28, 500, ex.subtitle, { size: 13, fill: ink, italic: true });
  } else {
    s += text(28, 300, ex.number, { size: 260, fill: palette.ivory, tracking: -0.04 });
    wrap(ex.title, 16).forEach((l, i) => (s += text(28, 380 + i * 42, l, { size: 42, fill: ink })));
    s += text(28, 480, ex.subtitle, { size: 13, fill: ink, italic: true });
  }
  s += `<line x1="28" y1="530" x2="${W - 28}" y2="530" stroke="${ink}" stroke-width="0.6" opacity="0.6"/>`;
  s += text(28, 550, formatRange(ex.opens, ex.closes), { size: 11, family: "text", fill: ink, tracking: 0.04 });
  s += text(28, 566, `Gallery ${roman[Number(ex.number) - 1]} · ${museum.address[0]}, ${museum.address[1]}`, { size: 8, family: "text", fill: ink, tracking: 0.04 });
  s += text(W - 28, 550, "calce.example", { size: 11, family: "text", fill: ink, anchor: "end" });
  s += text(W - 28, 566, "Tuesday – Sunday from 10:00", { size: 8, family: "text", fill: ink, anchor: "end" });
  return s + `</svg>`;
}

// ——————————————————————————————————— Catalogue covers (210 × 270 mm)

export function catalogueSvg(ex: Exhibition): string {
  const W = 210;
  const H = 270;
  const work = keyWork(ex);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm"><rect width="${W}" height="${H}" fill="${ex.accent}"/>`;
  s += text(18, 30, `CALCE Editions · ${ex.number}`, { size: 6, family: "text", fill: palette.ivory, tracking: 0.16, upper: true });
  wrap(ex.title, 14).forEach((l, i) => (s += text(18, 62 + i * 24, l, { size: 24, fill: palette.ivory })));
  s += `<clipPath id="cc-${ex.id}"><path d="${archPath(110, 120, 80, 120)}"/></clipPath><g clip-path="url(#cc-${ex.id})">${embedArtwork(work, 110, 120, 80, 120, `c-${ex.id}`)}</g>`;
  s += text(18, 236, ex.subtitle, { size: 7.5, fill: palette.ivory, italic: true });
  s += text(18, 252, `Edited by ${ex.curator}`, { size: 5.5, family: "text", fill: palette.ivory, tracking: 0.1, upper: true });
  s += mark(178, 230, 22, palette.ivory, palette.ivory);
  return s + `</svg>`;
}

// ——————————————————————————————————— Social campaign (1080 × 1080, 1080 × 1920)

export function socialSvg(ex: Exhibition, format: "square" | "story"): string {
  const W = 1080;
  const H = format === "square" ? 1080 : 1920;
  const work = keyWork(ex);
  const imgH = format === "square" ? 640 : 1180;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${palette.ivory}"/>`;
  s += embedArtwork(work, 0, 0, W, imgH, `s-${format}-${ex.id}`);
  s += `<rect y="${imgH}" width="${W}" height="10" fill="${ex.accent}"/>`;
  const y0 = imgH + 90;
  s += text(72, y0, `Now on view · Exhibition ${ex.number}`, { size: 28, family: "text", fill: support.inkSoft, tracking: 0.12, upper: true });
  wrap(ex.title, format === "square" ? 22 : 18).forEach((l, i) => (s += text(72, y0 + 92 + i * 84, l, { size: 84, fill: support.ink })));
  s += text(72, H - 72, formatRange(ex.opens, ex.closes), { size: 32, family: "text", fill: support.ink });
  s += mark(W - 72 - 42, H - 72 - 56, 56, support.ink, ex.accent);
  return s + `</svg>`;
}

// ——————————————————————————————————— Tickets (landscape, 200 × 80 mm)

export interface TicketData {
  reference: string;
  date: string;
  slot: string;
  admits: string;
  name: string;
  demo: boolean;
}

export function ticketSvg(t: TicketData): string {
  const W = 200;
  const H = 80;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm" role="img"><rect width="${W}" height="${H}" rx="3" fill="${palette.ivory}"/>`;
  s += `<rect x="146" width="54" height="${H}" fill="${palette.terracotta}"/>`;
  s += `<path d="M146,0 V${H}" stroke="${palette.ivory}" stroke-width="0.8" stroke-dasharray="1.6 1.6"/>`;
  s += mark(10, 10, 16, support.ink);
  s += wordmark(26, 22, 10, support.ink);
  s += text(10, 36, "Timed entry", { size: 3.6, family: "text", fill: support.inkSoft, tracking: 0.14, upper: true });
  s += text(10, 47, t.date, { size: 9, fill: support.ink });
  s += text(10, 58, `Entry ${t.slot}`, { size: 7, fill: support.ink, italic: true });
  s += text(10, 70, t.admits, { size: 3.8, family: "text", fill: support.ink, tracking: 0.04 });
  s += text(10, 75.5, t.name, { size: 3.4, family: "text", fill: support.inkSoft });
  s += `<path d="${archPath(100, 14, 34, 52)}" fill="none" stroke="${palette.sand}" stroke-width="0.6"/><circle cx="117" cy="31" r="3.4" fill="${palette.terracotta}"/>`;
  s += text(173, 18, "Reference", { size: 3.4, family: "text", fill: palette.ivory, anchor: "middle", tracking: 0.16, upper: true });
  s += text(173, 28, t.reference, { size: 5.4, family: "text", fill: palette.ivory, anchor: "middle", tracking: 0.06, weight: 600 });
  // A deliberately non-scannable decorative pattern (no real ticketing system is connected).
  let pattern = "";
  let h = 0;
  for (const ch of t.reference) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if ((h >> ((i * 9 + j) % 29)) & 1 || (i + j) % 7 === 0) pattern += `<rect x="${158 + i * 3}" y="${36 + j * 3}" width="2.4" height="2.4" fill="${palette.ivory}" opacity="0.85"/>`;
  s += pattern;
  if (t.demo) s += text(173, 72, "Demo · not valid for entry", { size: 3, family: "text", fill: palette.ivory, anchor: "middle", tracking: 0.08, upper: true });
  return s + `</svg>`;
}

// ——————————————————————————————————— Signage & wayfinding

export function gallerySignSvg(ex: Exhibition): string {
  const W = 600;
  const H = 900;
  const n = Number(ex.number);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm"><rect width="${W}" height="${H}" fill="${palette.limestone}"/>`;
  s += `<rect x="0" y="0" width="${W}" height="14" fill="${ex.accent}"/>`;
  s += text(48, 120, "Gallery", { size: 34, family: "text", fill: support.inkSoft, tracking: 0.16, upper: true });
  s += text(40, 330, roman[n - 1]!, { size: 230, fill: support.ink });
  s += `<line x1="48" y1="400" x2="${W - 48}" y2="400" stroke="${support.ink}" stroke-width="1.4"/>`;
  wrap(ex.title, 16).forEach((l, i) => (s += text(48, 480 + i * 60, l, { size: 56, fill: support.ink })));
  s += text(48, 680, ex.subtitle, { size: 24, fill: support.ink, italic: true });
  s += text(48, 820, formatRange(ex.opens, ex.closes), { size: 24, family: "text", fill: support.inkSoft, tracking: 0.04 });
  s += mark(W - 48 - 54, 770, 72, support.ink, ex.accent);
  return s + `</svg>`;
}

export interface WayfindingEntry {
  label: string;
  detail?: string;
  dir: "left" | "right" | "ahead" | "back";
}

export function wayfindingSvg(entries: WayfindingEntry[], title = "Atrium"): string {
  const W = 900;
  const rowH = 96;
  const H = 120 + entries.length * rowH + 40;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm"><rect width="${W}" height="${H}" fill="${palette.walnut}"/>`;
  s += text(48, 76, `You are in the ${title}`, { size: 26, family: "text", fill: palette.sand, tracking: 0.14, upper: true });
  entries.forEach((e, i) => {
    const y = 120 + i * rowH;
    s += `<line x1="48" y1="${y}" x2="${W - 48}" y2="${y}" stroke="${palette.sand}" stroke-width="1" opacity="0.5"/>`;
    s += arrow(84, y + rowH / 2, 44, e.dir, palette.ivory);
    s += text(150, y + rowH / 2 + 14, e.label, { size: 44, fill: palette.ivory });
    if (e.detail) s += text(W - 48, y + rowH / 2 + 10, e.detail, { size: 24, family: "text", fill: palette.sand, anchor: "end", tracking: 0.06 });
  });
  return s + `</svg>`;
}

export const atriumWayfinding: WayfindingEntry[] = [
  { label: "Sculpture", detail: "Gallery I", dir: "right" },
  { label: "Painting", detail: "Gallery II", dir: "left" },
  { label: "Photography", detail: "Gallery III", dir: "ahead" },
  { label: "Installation", detail: "Gallery IV · via III", dir: "ahead" },
  { label: "Café, Shop & Exit", detail: "Reception", dir: "back" },
];

// ——————————————————————————————————— Brochure (A4 landscape trifold, 297 × 210 mm)

export function brochureSvg(side: "outside" | "inside"): string {
  const W = 297;
  const H = 210;
  const P = 99; // panel width
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm"><rect width="${W}" height="${H}" fill="${palette.ivory}"/>`;
  s += `<line x1="${P}" y1="0" x2="${P}" y2="${H}" stroke="${support.line}" stroke-width="0.3" stroke-dasharray="2 2"/><line x1="${2 * P}" y1="0" x2="${2 * P}" y2="${H}" stroke="${support.line}" stroke-width="0.3" stroke-dasharray="2 2"/>`;
  if (side === "outside") {
    // Panel 1 (inside flap): opening hours
    s += text(12, 24, "Opening hours", { size: 4, family: "text", fill: palette.terracotta, tracking: 0.14, upper: true });
    hours.forEach((d, i) => {
      s += text(12, 36 + i * 8, d.day, { size: 4.2, family: "text" });
      s += text(P - 12, 36 + i * 8, d.open ? `${d.open}–${d.close}` : "Closed", { size: 4.2, family: "text", anchor: "end" });
    });
    s += text(12, 112, "Tickets", { size: 4, family: "text", fill: palette.terracotta, tracking: 0.14, upper: true });
    s += paragraph(12, 122, "Adult €16 · Reduced €11 · Under 18s, members and companions free. Book a timed entry at calce.example/tickets.", 44, 6, { size: 4, family: "text" });
    s += text(12, 160, "Access", { size: 4, family: "text", fill: palette.terracotta, tracking: 0.14, upper: true });
    s += paragraph(12, 170, "Step-free throughout. Wheelchairs and folding stools free at reception.", 44, 6, { size: 4, family: "text" });
    // Panel 2 (back): address
    s += `<rect x="${P}" y="0" width="${P}" height="${H}" fill="${palette.limestone}"/>`;
    s += mark(P + 12, 150, 26, support.ink);
    s += wordmark(P + 12, 194, 12);
    s += paragraph(P + 12, 24, "Ten minutes from the old harbour along the coastal path. Buses 4 and 11 to Uliveto.", 40, 6, { size: 4, family: "text" });
    s += text(P + 12, 60, museum.address[0], { size: 5, family: "text" });
    s += text(P + 12, 67, museum.address[1], { size: 5, family: "text" });
    // Panel 3 (front cover)
    s += `<rect x="${2 * P}" y="0" width="${P}" height="${H}" fill="${palette.terracotta}"/>`;
    s += mark(2 * P + 12, 14, 22, palette.ivory, palette.ivory);
    s += text(2 * P + 12, 70, "Autumn", { size: 20, fill: palette.ivory });
    s += text(2 * P + 12, 92, "& Winter", { size: 20, fill: palette.ivory, italic: true });
    s += text(2 * P + 12, 114, "2026 — 27", { size: 20, fill: palette.ivory });
    exhibitions.forEach((ex, i) => (s += text(2 * P + 12, 150 + i * 9, `${ex.number}  ${ex.title}`, { size: 4.6, family: "text", fill: palette.ivory })));
    s += wordmark(2 * P + 12, 196, 12, palette.ivory);
  } else {
    // Two exhibitions per spread column on panels 2–3; panel 1 introduces the season.
    s += text(12, 24, "This season", { size: 4, family: "text", fill: palette.terracotta, tracking: 0.14, upper: true });
    s += text(12, 46, "Four exhibitions,", { size: 11, fill: support.ink });
    s += text(12, 59, "one slow afternoon.", { size: 11, fill: support.ink, italic: true });
    s += paragraph(12, 78, "CALCE is a museum of contemporary art arranged around a day-lit atrium. Four galleries open from it like the points of a compass; the sculpture garden and Café Limone lie to the east.", 44, 6, { size: 4, family: "text", fill: support.inkSoft });
    s += `<path d="${archPath(12, 120, 75, 76)}" fill="${palette.limestone}"/><circle cx="49.5" cy="157.5" r="7" fill="${palette.terracotta}"/>`;
    exhibitions.forEach((ex, i) => {
      const x = P + Math.floor(i / 2) * P;
      const y = (i % 2) * 105;
      const work = keyWork(ex);
      s += `<clipPath id="bi-${ex.id}"><path d="${archPath(x + 12, y + 12, 30, 44)}"/></clipPath><g clip-path="url(#bi-${ex.id})">${embedArtwork(work, x + 12, y + 12, 30, 44, `b-${ex.id}`)}</g>`;
      s += text(x + 48, y + 20, ex.number, { size: 14, fill: ex.accent });
      s += text(x + 48, y + 30, formatRange(ex.opens, ex.closes), { size: 3.4, family: "text", fill: support.inkSoft, tracking: 0.06, upper: true });
      wrap(ex.title, 22).forEach((l, k) => (s += text(x + 12, y + 68 + k * 8, l, { size: 7.5, fill: support.ink })));
      s += paragraph(x + 12, y + 86, ex.subtitle, 48, 5, { size: 3.8, family: "text", fill: support.inkSoft, italic: true });
    });
  }
  return s + `</svg>`;
}

