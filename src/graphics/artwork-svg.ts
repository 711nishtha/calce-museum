/**
 * Generated imagery for every artwork. Paintings and photographs are rendered as the
 * works themselves; sculptures and installations as art-directed "studio views".
 * Output is a standalone SVG string (no fonts, no external references) used by the
 * /media/art/[id] route on the website and as a texture source in the 3D museum.
 */
import type { Artwork, ArtworkVisual, InstallationForm, PaintingStyle, PhotoMotif, PhotoProcess, SculptureForm, SculptureMaterial } from "@/content/types";
import { rng, f, type Rng } from "./rng";

const LONG_SIDE = 1000;

export function artworkImageSize(work: Pick<Artwork, "dimensions" | "visual">): { w: number; h: number } {
  if (work.visual.kind === "sculpture" || work.visual.kind === "installation") {
    if (work.visual.kind === "sculpture" && work.visual.form === "relief") return fit(work.dimensions.w, work.dimensions.h);
    if (work.visual.kind === "installation" && work.visual.form === "breathing-wall") return { w: 1000, h: 760 };
    return { w: 800, h: 1000 };
  }
  return fit(work.dimensions.w, work.dimensions.h);
}

function fit(w: number, h: number) {
  return w >= h ? { w: LONG_SIDE, h: Math.round((LONG_SIDE * h) / w) } : { w: Math.round((LONG_SIDE * w) / h), h: LONG_SIDE };
}

function svg(w: number, h: number, defs: string, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
}

/** Fine tonal grain shared by every image. */
function grainFilter(id: string, seed: number, strength = 1) {
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed}" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.16 0 0 0 0 0.12 0 0 0 0 0.09 ${f(1.4 * strength)} 0 0 0 ${f(-0.62 * strength)}"/></filter>`;
}

/** Displacement that roughens painted edges like a brush or a trowel. */
function roughFilter(id: string, seed: number, scale: number, freq = "0.012 0.05") {
  return `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
}

const blur = (id: string, sd: number) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;

// ——————————————————————————————————— Paintings

function painting(style: PaintingStyle, pal: string[], seed: number, w: number, h: number): string {
  const r = rng(seed);
  const c = (i: number) => pal[i % pal.length]!;
  const defs = grainFilter("grain", seed) + roughFilter("rough", seed, 28) + roughFilter("soft", seed + 1, 14, "0.004 0.02") + blur("b8", 8) + blur("b24", 24);
  let body = `<rect width="${w}" height="${h}" fill="${c(0)}"/>`;

  if (style === "bands") {
    let y = -20;
    const n = r.int(4, 6);
    const heights = Array.from({ length: n }, () => r.range(0.6, 1.4));
    const total = heights.reduce((a, b) => a + b, 0);
    body += `<g filter="url(#rough)">`;
    heights.forEach((hh, i) => {
      const bh = ((h + 40) * hh) / total;
      body += `<rect x="-40" y="${f(y)}" width="${w + 80}" height="${f(bh + 6)}" fill="${c(i + 1)}" opacity="${f(r.range(0.82, 1))}"/>`;
      y += bh;
    });
    body += `</g><g filter="url(#soft)" opacity="0.35">`;
    for (let i = 0; i < 9; i++) {
      body += `<rect x="${f(r.range(-60, w * 0.6))}" y="${f(r.range(0, h))}" width="${f(r.range(w * 0.3, w))}" height="${f(r.range(6, 30))}" fill="${c(0)}"/>`;
    }
    body += `</g>`;
  } else if (style === "arches") {
    const aw = w * r.range(0.34, 0.44);
    const ax = (w - aw) / 2 + r.range(-w * 0.06, w * 0.06);
    const spring = h * r.range(0.42, 0.5);
    const floor = h * 0.86;
    body += `<rect y="${f(floor)}" width="${w}" height="${f(h - floor)}" fill="${c(1)}" opacity="0.6"/>`;
    const arch = `M${f(ax)},${f(floor)} V${f(spring)} A${f(aw / 2)},${f(aw / 2)} 0 0 1 ${f(ax + aw)},${f(spring)} V${f(floor)} Z`;
    body += `<g filter="url(#rough)"><path d="${arch}" fill="${c(1)}"/>`;
    const sx = w * 0.18;
    body += `<path d="M${f(ax + aw)},${f(floor)} V${f(spring)} A${f(aw / 2)},${f(aw / 2)} 0 0 0 ${f(ax + aw / 2)},${f(spring - aw / 2)} L${f(ax + aw / 2 + sx)},${f(spring - aw / 2 + sx * 0.5)} L${f(w + 40)},${f(spring + sx)} V${f(floor)} Z" fill="${c(2)}" opacity="0.88"/></g>`;
    body += `<rect x="${f(ax - 10)}" y="${f(floor - 4)}" width="${f(aw + 20)}" height="8" fill="${c(2)}" opacity="0.35" filter="url(#b8)"/>`;
  } else if (style === "horizon") {
    const hz = h * r.range(0.52, 0.62);
    body += `<rect width="${w}" height="${f(hz)}" fill="url(#sky)"/>`;
    body += `<g filter="url(#soft)"><rect x="-30" y="${f(hz)}" width="${w + 60}" height="${f(h - hz + 30)}" fill="${c(2)}"/><rect x="-30" y="${f(hz + (h - hz) * 0.55)}" width="${w + 60}" height="${f(h)}" fill="${c(3)}" opacity="0.55"/></g>`;
    body += `<rect x="-40" y="${f(hz - 6)}" width="${w + 80}" height="12" fill="${c(0)}" opacity="0.7" filter="url(#b8)"/>`;
    return svg(w, h, defs + `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c(0)}"/><stop offset="1" stop-color="${c(1)}"/></linearGradient>`, body + `<rect width="${w}" height="${h}" filter="url(#grain)"/>`);
  } else if (style === "plaster") {
    body += `<g filter="url(#rough)">`;
    for (let i = 0; i < 4; i++) {
      const cx = r.range(w * 0.15, w * 0.85);
      const cy = r.range(h * 0.15, h * 0.85);
      const rad = r.range(w * 0.15, w * 0.35);
      const pts = Array.from({ length: 7 }, (_, k) => {
        const a = (k / 7) * Math.PI * 2 + r.range(-0.3, 0.3);
        const rr = rad * r.range(0.6, 1.1);
        return `${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr * 0.8)}`;
      });
      body += `<polygon points="${pts.join(" ")}" fill="${c(1 + (i % 3))}" opacity="${f(r.range(0.45, 0.85))}"/>`;
    }
    const sq = r.range(w * 0.18, w * 0.26);
    body += `<rect x="${f(r.range(w * 0.1, w * 0.6))}" y="${f(r.range(h * 0.5, h * 0.7))}" width="${f(sq)}" height="${f(sq * 0.9)}" fill="${c(0)}" opacity="0.9"/></g>`;
    let x = r.range(w * 0.3, w * 0.7);
    let y = 0;
    let crack = `M${f(x)},0`;
    while (y < h) {
      y += r.range(14, 34);
      x += r.range(-16, 16);
      crack += ` L${f(x)},${f(y)}`;
    }
    body += `<path d="${crack}" fill="none" stroke="#4a3a2e" stroke-width="2.2" opacity="0.55"/><path d="${crack}" fill="none" stroke="#fff" stroke-width="1" opacity="0.35" transform="translate(2 1)"/>`;
  } else if (style === "window") {
    const ww = w * 0.5;
    const wh = h * 0.56;
    const wx = (w - ww) / 2;
    const wy = h * 0.18;
    body += `<g filter="url(#soft)"><rect x="${f(wx - 22)}" y="${f(wy - 22)}" width="${f(ww + 44)}" height="${f(wh + 44)}" fill="${c(2)}" opacity="0.7"/></g>`;
    body += `<rect x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${f(wh)}" fill="${c(3)}"/>`;
    const leaf = ww / 2 - 4;
    for (const side of [0, 1]) {
      const lx = wx + side * (leaf + 8);
      body += `<g filter="url(#rough)"><rect x="${f(lx)}" y="${f(wy)}" width="${f(leaf)}" height="${f(wh)}" fill="${c(1)}"/>`;
      for (let s = wy + 18; s < wy + wh - 10; s += 16) body += `<rect x="${f(lx + 10)}" y="${f(s)}" width="${f(leaf - 20)}" height="5" fill="${c(3)}" opacity="0.35"/>`;
      body += `</g>`;
    }
    body += `<rect x="${f(wx - 30)}" y="${f(wy + wh)}" width="${f(ww + 60)}" height="18" fill="${c(2)}"/><rect x="${f(wx - 30)}" y="${f(wy + wh + 18)}" width="${f(ww + 60)}" height="22" fill="${c(3)}" opacity="0.25" filter="url(#b8)"/>`;
  } else if (style === "shadow") {
    const sy = h * r.range(0.16, 0.24);
    body = `<rect width="${w}" height="${h}" fill="url(#wall)"/>`;
    body += `<g filter="url(#rough)"><rect x="-40" y="-40" width="${w + 80}" height="${f(sy + 40)}" fill="${c(2)}"/></g>`;
    body += `<rect x="-40" y="${f(sy - 10)}" width="${w + 80}" height="30" fill="${c(2)}" opacity="0.45" filter="url(#b24)"/>`;
    body += `<path d="M0,${f(h * 0.78)} L${w},${f(h * 0.62)} L${w},${h} L0,${h} Z" fill="${c(1)}" opacity="0.25" filter="url(#b24)"/>`;
    return svg(w, h, defs + `<linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c(3)}"/><stop offset="1" stop-color="${c(1)}"/></linearGradient>`, body + `<rect width="${w}" height="${h}" filter="url(#grain)"/>`);
  }
  return svg(w, h, defs, body + `<rect width="${w}" height="${h}" filter="url(#grain)"/>`);
}

// ——————————————————————————————————— Camera-less photographs

function leafPath(len: number, wid: number) {
  return `M0,${f(-len)} C${f(wid)},${f(-len * 0.5)} ${f(wid)},${f(len * 0.5)} 0,${f(len)} C${f(-wid)},${f(len * 0.5)} ${f(-wid)},${f(-len * 0.5)} 0,${f(-len)} Z`;
}

function motif(m: PhotoMotif, r: Rng, w: number, h: number, ink: string): string {
  let out = "";
  if (m === "leaves") {
    for (let i = 0; i < 26; i++) {
      const x = r.range(w * 0.12, w * 0.88);
      const y = r.range(h * 0.1, h * 0.9);
      const a = r.range(0, 180);
      const len = r.range(34, 62);
      const ghost = r.next() < 0.35;
      const g = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><path d="${leafPath(len, len * 0.24)}" fill="${ink}"/></g>`;
      out += g;
      if (ghost) out += `<g transform="translate(${f(x + r.range(8, 22))} ${f(y + r.range(-10, 10))}) rotate(${f(a + r.range(-14, 14))})" opacity="0.35"><path d="${leafPath(len, len * 0.24)}" fill="${ink}"/></g>`;
    }
  } else if (m === "grass") {
    for (let i = 0; i < 7; i++) {
      const x0 = r.range(w * 0.25, w * 0.75);
      const tipX = x0 + r.range(-w * 0.28, w * 0.28);
      const tipY = r.range(h * 0.06, h * 0.3);
      const midX = (x0 + tipX) / 2 + r.range(-60, 60);
      out += `<path d="M${f(x0)},${f(h * 0.96)} Q${f(midX)},${f(h * 0.55)} ${f(tipX)},${f(tipY)}" fill="none" stroke="${ink}" stroke-width="${f(r.range(2, 4.5))}" stroke-linecap="round"/>`;
      for (let k = 0; k < 16; k++) {
        const t = r.range(0.25, 1);
        const px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * midX + t * t * tipX;
        const py = (1 - t) * (1 - t) * h * 0.96 + 2 * (1 - t) * t * h * 0.55 + t * t * tipY;
        const fl = r.range(18, 54);
        const fa = r.range(-2.4, -0.7) * (r.next() < 0.5 ? 1 : -1);
        out += `<path d="M${f(px)},${f(py)} q${f(Math.cos(fa) * fl * 0.5)},${f(Math.sin(fa) * fl * 0.2)} ${f(Math.cos(fa) * fl)},${f(Math.sin(fa) * fl)}" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linecap="round"/>`;
      }
    }
  } else if (m === "glass") {
    const cx = w * r.range(0.42, 0.58);
    const cy = h * r.range(0.45, 0.55);
    const rad = Math.min(w, h) * r.range(0.24, 0.32);
    out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rad)}" fill="${ink}" opacity="0.12"/>`;
    out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rad)}" fill="none" stroke="${ink}" stroke-width="5" filter="url(#b3)"/>`;
    for (let i = 0; i < 14; i++) {
      const a0 = r.range(0, Math.PI * 2);
      const a1 = a0 + r.range(0.6, 2.2);
      const r0 = rad * r.range(0.2, 0.95);
      out += `<path d="M${f(cx + Math.cos(a0) * r0)},${f(cy + Math.sin(a0) * r0)} Q${f(cx + r.range(-rad, rad) * 0.4)},${f(cy + r.range(-rad, rad) * 0.4)} ${f(cx + Math.cos(a1) * rad * 0.9)},${f(cy + Math.sin(a1) * rad * 0.9)}" fill="none" stroke="${ink}" stroke-width="${f(r.range(1.2, 3.4))}" opacity="${f(r.range(0.4, 0.95))}" filter="url(#b1)"/>`;
    }
    out += `<ellipse cx="${f(cx - rad * 0.35)}" cy="${f(cy - rad * 0.4)}" rx="${f(rad * 0.18)}" ry="${f(rad * 0.08)}" fill="${ink}" filter="url(#b3)" transform="rotate(-30 ${f(cx)} ${f(cy)})"/>`;
  } else if (m === "net") {
    for (let i = 0; i < 4; i++) {
      const cx = w * (0.22 + i * 0.19) + r.range(-20, 20);
      const cy = h * (0.3 + (i % 2) * 0.35) + r.range(-30, 30);
      const rad = r.range(56, 92);
      out += `<path d="M${f(cx - rad * 2.8)},${f(cy + rad * 0.8)} L${f(cx)},${f(cy)}" stroke="${ink}" stroke-width="${f(rad * 0.9)}" opacity="0.12" stroke-linecap="round" filter="url(#b10)"/>`;
      out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rad)}" fill="${ink}" opacity="0.85" filter="url(#b3)"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rad * 0.55)}" fill="#000" opacity="0.35" filter="url(#b10)"/>`;
    }
  } else if (m === "wave") {
    for (let i = 0; i < 5; i++) {
      const y0 = h * (0.25 + i * 0.13);
      let d = `M-20,${f(y0)}`;
      for (let x = 0; x <= w + 40; x += 40) d += ` L${x},${f(y0 + Math.sin(x / r.range(60, 120) + i) * r.range(8, 22))}`;
      out += `<path d="${d} L${w + 40},${h + 20} L-20,${h + 20} Z" fill="${ink}" opacity="${f(0.1 + i * 0.05)}" filter="url(#b3)"/>`;
    }
    for (let i = 0; i < 260; i++) out += `<circle cx="${f(r.range(0, w))}" cy="${f(r.range(0, h))}" r="${f(r.range(0.8, 2.6))}" fill="#fff" opacity="${f(r.range(0.2, 0.6))}"/>`;
  } else if (m === "shell") {
    const cx = w / 2;
    const cy = h * 0.72;
    const rad = Math.min(w, h) * 0.42;
    let fan = `M${f(cx)},${f(cy)}`;
    for (let a = -150; a <= -30; a += 4) fan += ` L${f(cx + Math.cos((a * Math.PI) / 180) * rad * (1 + 0.03 * Math.sin(a)))},${f(cy + Math.sin((a * Math.PI) / 180) * rad)}`;
    out += `<path d="${fan} Z" fill="${ink}" opacity="0.92" filter="url(#b1)"/>`;
    for (let a = -146; a <= -34; a += 8) out += `<line x1="${f(cx)}" y1="${f(cy)}" x2="${f(cx + Math.cos((a * Math.PI) / 180) * rad * 0.98)}" y2="${f(cy + Math.sin((a * Math.PI) / 180) * rad * 0.98)}" stroke="#6b4a33" stroke-width="3" opacity="0.35" filter="url(#b1)"/>`;
    out += `<path d="M${f(cx - 40)},${f(cy + 4)} L${f(cx + 40)},${f(cy + 4)} L${f(cx + 24)},${f(cy + 34)} L${f(cx - 24)},${f(cy + 34)} Z" fill="${ink}" opacity="0.85" filter="url(#b1)"/>`;
  }
  return out;
}

function photo(process: PhotoProcess, m: PhotoMotif, seed: number, w: number, h: number): string {
  const r = rng(seed);
  const defs = grainFilter("grain", seed, 0.8) + roughFilter("edge", seed, 36, "0.02 0.03") + blur("b1", 1.2) + blur("b3", 3) + blur("b10", 10) + blur("b40", 40);
  const m0 = Math.round(Math.min(w, h) * 0.07);
  let body = "";
  if (process === "cyanotype") {
    const deep = seed % 3 === 0 ? "#2B3E52" : "#1D3A5F";
    body += `<rect width="${w}" height="${h}" fill="#F2EDE2"/>`;
    const glow = `<radialGradient id="glow" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#3C628E" stop-opacity="0.55"/><stop offset="1" stop-color="#3C628E" stop-opacity="0"/></radialGradient>`;
    body += `<g filter="url(#edge)"><rect x="${m0}" y="${m0}" width="${w - 2 * m0}" height="${h - 2 * m0}" fill="${deep}"/></g>`;
    body += `<rect x="${m0}" y="${m0}" width="${w - 2 * m0}" height="${h - 2 * m0}" fill="url(#glow)"/>`;
    body += `<g filter="url(#b1)">${motif(m, r, w, h, "#EEF0EC")}</g>`;
    return svg(w, h, defs + glow, body + `<rect width="${w}" height="${h}" filter="url(#grain)"/>`);
  }
  if (process === "photogram") {
    body += `<rect width="${w}" height="${h}" fill="#F4F1EA"/><rect x="${m0}" y="${m0}" width="${w - 2 * m0}" height="${h - 2 * m0}" fill="#0F0E0D"/>`;
    body += `<g>${motif(m, r, w, h, "#F7F4EC")}</g>`;
    return svg(w, h, defs, body + `<rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.8"/>`);
  }
  if (process === "lumen") {
    const g = `<linearGradient id="lumen" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#EBC3A6"/><stop offset="0.45" stop-color="#D49A92"/><stop offset="1" stop-color="#7C5C86"/></linearGradient>`;
    body += `<rect width="${w}" height="${h}" fill="url(#lumen)"/>`;
    body += motif(m, r, w, h, "#5B3F6E");
    body += `<path d="M0,${f(h * 0.2)} Q${f(w * 0.5)},${f(h * 0.12)} ${w},${f(h * 0.24)}" stroke="#6E4E86" stroke-width="3" fill="none" opacity="0.6" filter="url(#b3)"/>`;
    return svg(w, h, defs + g, body + `<rect width="${w}" height="${h}" filter="url(#grain)"/>`);
  }
  // salt print
  const g = `<radialGradient id="salt" cx="0.5" cy="0.55" r="0.75"><stop offset="0" stop-color="#8A6243"/><stop offset="1" stop-color="#4A3122"/></radialGradient>`;
  body += `<rect width="${w}" height="${h}" fill="#EDE3CF"/><g filter="url(#edge)"><rect x="${m0}" y="${m0}" width="${w - 2 * m0}" height="${h - 2 * m0}" fill="url(#salt)"/></g>`;
  body += motif(m, r, w, h, "#E9D8BA");
  return svg(w, h, defs + g, body + `<rect width="${w}" height="${h}" filter="url(#grain)"/>`);
}

// ——————————————————————————————————— Sculpture studio views

export const sculptureColours: Record<SculptureMaterial, { light: string; dark: string; accent: string }> = {
  limestone: { light: "#EDE4CF", dark: "#B9A98A", accent: "#D8CBB0" },
  travertine: { light: "#E6D6B6", dark: "#AE9672", accent: "#CDB892" },
  bronze: { light: "#9C7444", dark: "#2F2219", accent: "#C99A5B" },
  terracotta: { light: "#CB8058", dark: "#7E4128", accent: "#A75F40" },
  oak: { light: "#C39B6C", dark: "#7B5A3C", accent: "#A47E55" },
  marble: { light: "#F4F1EB", dark: "#C9C3B8", accent: "#E2DDD3" },
};

function sculptureForm(form: SculptureForm, mat: SculptureMaterial, r: Rng, w: number, h: number, baseY: number): string {
  const fill = "url(#mat)";
  const cx = w / 2;
  let out = "";
  if (form === "stack") {
    let y = baseY;
    const n = r.int(5, 7);
    for (let i = 0; i < n; i++) {
      const bw = w * r.range(0.16, 0.3) * (1 - i * 0.04);
      const bh = h * r.range(0.07, 0.11);
      const x = cx - bw / 2 + r.range(-w * 0.025, w * 0.025) + i * 2;
      out += `<rect x="${f(x)}" y="${f(y - bh)}" width="${f(bw)}" height="${f(bh)}" rx="${f(bh * 0.3)}" fill="${fill}"/>`;
      out += `<rect x="${f(x)}" y="${f(y - bh)}" width="${f(bw)}" height="${f(bh * 0.18)}" rx="${f(bh * 0.1)}" fill="#fff" opacity="0.18"/>`;
      y -= bh - 1;
    }
  } else if (form === "vessel") {
    const vw = w * 0.42;
    const vh = h * 0.36;
    const top = baseY - vh;
    const d = `M${f(cx - vw * 0.22)},${f(top)} C${f(cx - vw * 0.2)},${f(top + vh * 0.12)} ${f(cx - vw * 0.62)},${f(top + vh * 0.25)} ${f(cx - vw * 0.5)},${f(top + vh * 0.62)} C${f(cx - vw * 0.42)},${f(top + vh * 0.9)} ${f(cx - vw * 0.2)},${f(baseY)} ${f(cx)},${f(baseY)} C${f(cx + vw * 0.2)},${f(baseY)} ${f(cx + vw * 0.42)},${f(top + vh * 0.9)} ${f(cx + vw * 0.5)},${f(top + vh * 0.62)} C${f(cx + vw * 0.62)},${f(top + vh * 0.25)} ${f(cx + vw * 0.2)},${f(top + vh * 0.12)} ${f(cx + vw * 0.22)},${f(top)} Z`;
    out += `<path d="${d}" fill="${fill}"/>`;
    out += `<clipPath id="vclip"><path d="${d}"/></clipPath><g clip-path="url(#vclip)" opacity="0.28" stroke="#000" stroke-width="1.6">`;
    for (let k = -12; k < 12; k++) out += `<line x1="${f(cx + k * 22)}" y1="${f(top)}" x2="${f(cx + k * 22 + vh)}" y2="${f(baseY)}"/><line x1="${f(cx + k * 22)}" y1="${f(top)}" x2="${f(cx + k * 22 - vh)}" y2="${f(baseY)}"/>`;
    out += `</g><ellipse cx="${f(cx)}" cy="${f(top)}" rx="${f(vw * 0.22)}" ry="${f(vw * 0.05)}" fill="#1a120c" opacity="0.8"/><ellipse cx="${f(cx)}" cy="${f(top - 1)}" rx="${f(vw * 0.22)}" ry="${f(vw * 0.05)}" fill="none" stroke="${sculptureColours[mat].accent}" stroke-width="4"/>`;
  } else if (form === "arch") {
    const aw = w * 0.36;
    const ah = h * 0.52;
    const t = aw * 0.2;
    const x0 = cx - aw / 2;
    const top = baseY - ah;
    const outer = `M${f(x0)},${f(baseY)} V${f(top + aw / 2)} A${f(aw / 2)},${f(aw / 2)} 0 0 1 ${f(x0 + aw)},${f(top + aw / 2)} V${f(baseY)} Z`;
    const iw = aw - 2 * t;
    const inner = `M${f(x0 + t)},${f(baseY)} V${f(top + aw / 2)} A${f(iw / 2)},${f(iw / 2)} 0 0 1 ${f(x0 + t + iw)},${f(top + aw / 2)} V${f(baseY)} Z`;
    out += `<path d="${outer} ${inner}" fill-rule="evenodd" fill="${fill}"/>`;
    out += `<path d="${outer} ${inner}" fill-rule="evenodd" fill="#3a1d10" opacity="0.18" transform="translate(${f(aw * 0.04)} 0) scale(1 1)"/>`;
  } else if (form === "ring") {
    const rr = w * 0.24;
    const cy = baseY - rr - 6;
    out += `<path d="M${f(cx - rr)},${f(cy)} a${f(rr)},${f(rr * 1.02)} 0 1 0 ${f(rr * 2)},0 a${f(rr)},${f(rr * 1.02)} 0 1 0 ${f(-rr * 2)},0 Z M${f(cx - rr * 0.74)},${f(cy)} a${f(rr * 0.74)},${f(rr * 0.76)} 0 1 1 ${f(rr * 1.48)},0 a${f(rr * 0.74)},${f(rr * 0.76)} 0 1 1 ${f(-rr * 1.48)},0 Z" fill-rule="evenodd" fill="${fill}"/>`;
    out += `<path d="M${f(cx - rr * 0.6)},${f(cy - rr * 0.82)} A${f(rr)},${f(rr)} 0 0 1 ${f(cx + rr * 0.6)},${f(cy - rr * 0.82)}" stroke="${sculptureColours[mat].accent}" stroke-width="6" fill="none" opacity="0.9"/>`;
  } else if (form === "column") {
    const cw = w * 0.12;
    const ch = h * 0.6;
    const top = baseY - ch;
    out += `<path d="M${f(cx - cw / 2)},${f(baseY)} C${f(cx - cw * 0.95)},${f(top + ch * 0.62)} ${f(cx - cw * 0.95)},${f(top + ch * 0.38)} ${f(cx - cw / 2)},${f(top)} H${f(cx + cw / 2)} C${f(cx + cw * 0.95)},${f(top + ch * 0.38)} ${f(cx + cw * 0.95)},${f(top + ch * 0.62)} ${f(cx + cw / 2)},${f(baseY)} Z" fill="${fill}"/>`;
    for (let i = 0; i < 40; i++) out += `<ellipse cx="${f(cx + r.range(-cw * 0.6, cw * 0.6))}" cy="${f(r.range(top + 10, baseY - 10))}" rx="${f(r.range(1.5, 5))}" ry="${f(r.range(0.8, 2))}" fill="#5c4630" opacity="0.4"/>`;
  } else if (form === "seat") {
    const sw = w * 0.7;
    const sh = h * 0.13;
    const x0 = cx - sw / 2;
    out += `<path d="M${f(x0)},${f(baseY)} V${f(baseY - sh)} Q${f(cx)},${f(baseY - sh * 1.7)} ${f(x0 + sw)},${f(baseY - sh)} V${f(baseY)} H${f(x0 + sw * 0.88)} V${f(baseY - sh * 0.4)} H${f(x0 + sw * 0.12)} V${f(baseY)} Z" fill="${fill}"/>`;
  }
  return out;
}

function relief(mat: SculptureMaterial, r: Rng, w: number, h: number): string {
  const c = sculptureColours[mat];
  const cols = mat === "terracotta" ? 4 : 5;
  const rows = 3;
  const pad = Math.min(w, h) * 0.04;
  const tw = (w - pad * 2) / cols;
  const th = (h - pad * 2) / rows;
  let out = `<rect width="${w}" height="${h}" fill="${mat === "terracotta" ? "#E9DFCF" : "#E2D8C4"}"/>`;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = pad + i * tw;
      const y = pad + j * th;
      const tint = mat === "terracotta" ? ["#D49573", "#C27752", "#A9603D", "#8E4C2F"][r.int(0, 3)]! : ["#E6DCC4", "#DCD0B4", "#D2C4A6"][r.int(0, 2)]!;
      out += `<rect x="${f(x + 3)}" y="${f(y + 3)}" width="${f(tw - 6)}" height="${f(th - 6)}" fill="${tint}"/>`;
      const steps = r.int(2, 5);
      for (let s = 0; s < steps; s++) {
        const sy = y + 3 + ((th - 6) * (s + 1)) / (steps + 1);
        out += `<rect x="${f(x + 3)}" y="${f(sy)}" width="${f(tw - 6)}" height="5" fill="${c.dark}" opacity="0.35"/><rect x="${f(x + 3)}" y="${f(sy - 3)}" width="${f(tw - 6)}" height="3" fill="#fff" opacity="0.25"/>`;
      }
    }
  }
  return out;
}

function sculpture(form: SculptureForm, mat: SculptureMaterial, seed: number, w: number, h: number): string {
  const r = rng(seed);
  const c = sculptureColours[mat];
  const defs =
    grainFilter("grain", seed, 0.7) +
    blur("b10", 10) +
    blur("b30", 30) +
    `<linearGradient id="mat" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0" stop-color="${c.light}"/><stop offset="0.55" stop-color="${c.accent}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient>` +
    `<linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EEE6D8"/><stop offset="1" stop-color="#D8CDBA"/></linearGradient>` +
    `<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6CAB4"/><stop offset="1" stop-color="#C4B69C"/></linearGradient>`;
  if (form === "relief") return svg(w, h, defs, relief(mat, r, w, h) + `<rect width="${w}" height="${h}" filter="url(#grain)"/>`);
  const horizon = h * 0.7;
  const plinthH = form === "seat" ? 0 : h * 0.1;
  const plinthW = w * 0.5;
  const baseY = h * 0.84 - plinthH;
  let body = `<rect width="${w}" height="${f(horizon)}" fill="url(#wall)"/><rect y="${f(horizon)}" width="${w}" height="${f(h - horizon)}" fill="url(#floor)"/>`;
  body += `<polygon points="${f(w * 0.62)},0 ${f(w)},0 ${f(w)},${f(horizon)} ${f(w * 0.8)},${f(horizon)}" fill="#fff" opacity="0.22" filter="url(#b30)"/>`;
  body += `<ellipse cx="${f(w / 2 + w * 0.08)}" cy="${f(h * 0.85)}" rx="${f(w * 0.36)}" ry="${f(h * 0.03)}" fill="#3b2e24" opacity="0.35" filter="url(#b10)"/>`;
  if (plinthH > 0) {
    body += `<rect x="${f((w - plinthW) / 2)}" y="${f(baseY)}" width="${f(plinthW)}" height="${f(plinthH)}" fill="#EDE6DA"/><rect x="${f(w / 2)}" y="${f(baseY)}" width="${f(plinthW / 2)}" height="${f(plinthH)}" fill="#D9D0C2"/>`;
  }
  body += sculptureForm(form, mat, r, w, h, baseY);
  return svg(w, h, defs, body + `<rect width="${w}" height="${h}" filter="url(#grain)"/>`);
}

// ——————————————————————————————————— Installation views

function installation(form: InstallationForm, seed: number, w: number, h: number): string {
  const r = rng(seed);
  const defs =
    grainFilter("grain", seed, 0.9) +
    blur("b2", 2) +
    blur("b6", 6) +
    blur("b20", 20) +
    blur("b60", 60) +
    `<linearGradient id="room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A322B"/><stop offset="0.68" stop-color="#231D18"/><stop offset="1" stop-color="#17130F"/></linearGradient>` +
    `<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#F6E9CF" stop-opacity="0.95"/><stop offset="1" stop-color="#F6E9CF" stop-opacity="0"/></radialGradient>`;
  let body = `<rect width="${w}" height="${h}" fill="url(#room)"/>`;
  if (form === "threads") {
    body += `<rect x="${f(w * 0.2)}" y="0" width="${f(w * 0.6)}" height="18" fill="#F5EAD4" opacity="0.7" filter="url(#b20)"/>`;
    for (let i = 0; i < 520; i++) {
      const depth = r.next();
      const x = w * 0.5 + (r.next() - 0.5) * w * (0.5 + depth * 0.9);
      const y1 = h * (0.62 + depth * 0.3);
      body += `<line x1="${f(x)}" y1="0" x2="${f(x + r.range(-3, 3))}" y2="${f(y1)}" stroke="#EADFCB" stroke-width="${f(0.5 + depth * 1.1)}" opacity="${f(0.15 + depth * 0.45)}"/><circle cx="${f(x)}" cy="${f(y1)}" r="${f(1 + depth * 2)}" fill="#C59A5A" opacity="${f(0.3 + depth * 0.5)}"/>`;
    }
  } else if (form === "mirror-pool") {
    const top = h * 0.6;
    body += `<rect x="${f(w * 0.3)}" y="0" width="${f(w * 0.4)}" height="24" fill="#F5EAD4" opacity="0.85" filter="url(#b20)"/>`;
    body += `<polygon points="${f(w * 0.28)},${f(top)} ${f(w * 0.72)},${f(top)} ${f(w * 0.98)},${f(h * 0.96)} ${f(w * 0.02)},${f(h * 0.96)}" fill="#0E0C0A"/>`;
    body += `<polygon points="${f(w * 0.42)},${f(top + 6)} ${f(w * 0.58)},${f(top + 6)} ${f(w * 0.66)},${f(h * 0.95)} ${f(w * 0.34)},${f(h * 0.95)}" fill="#F3E6CC" opacity="0.55" filter="url(#b6)"/>`;
    body += `<polygon points="${f(w * 0.28)},${f(top)} ${f(w * 0.72)},${f(top)} ${f(w * 0.98)},${f(h * 0.96)} ${f(w * 0.02)},${f(h * 0.96)}" fill="none" stroke="#5A4E44" stroke-width="3"/>`;
  } else if (form === "light-slot") {
    body = `<rect width="${w}" height="${h}" fill="#0C0A09"/>`;
    body += `<rect x="${f(w / 2 - 60)}" y="${f(h * 0.08)}" width="120" height="${f(h * 0.7)}" fill="#F7E7C6" opacity="0.18" filter="url(#b60)"/>`;
    body += `<rect x="${f(w / 2 - 8)}" y="${f(h * 0.1)}" width="16" height="${f(h * 0.66)}" fill="#FBEFD6" opacity="0.7" filter="url(#b6)"/>`;
    body += `<rect x="${f(w / 2 - 2)}" y="${f(h * 0.1)}" width="4" height="${f(h * 0.66)}" fill="#FFF8EA"/>`;
    body += `<ellipse cx="${f(w / 2)}" cy="${f(h * 0.88)}" rx="${f(w * 0.25)}" ry="14" fill="#F7E7C6" opacity="0.12" filter="url(#b20)"/>`;
  } else {
    body = `<rect width="${w}" height="${h}" fill="#2A241F"/>`;
    body += `<rect x="${f(w * 0.08)}" y="${f(h * 0.08)}" width="${f(w * 0.84)}" height="${f(h * 0.76)}" fill="#CDBFA6"/>`;
    body += `<ellipse cx="${f(w / 2)}" cy="${f(h * 0.46)}" rx="${f(w * 0.42)}" ry="${f(h * 0.36)}" fill="url(#glow)"/>`;
    body += `<rect y="${f(h * 0.84)}" width="${w}" height="${f(h * 0.16)}" fill="#1E1915"/>`;
    body += `<ellipse cx="${f(w / 2)}" cy="${f(h * 0.86)}" rx="${f(w * 0.4)}" ry="12" fill="#F6E9CF" opacity="0.2" filter="url(#b20)"/>`;
  }
  return svg(w, h, defs, body + `<rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.7"/>`);
}

export function renderVisual(visual: ArtworkVisual, w: number, h: number): string {
  switch (visual.kind) {
    case "painting":
      return painting(visual.style, visual.palette, visual.seed, w, h);
    case "photo":
      return photo(visual.process, visual.motif, visual.seed, w, h);
    case "sculpture":
      return sculpture(visual.form, visual.material, visual.seed, w, h);
    case "installation":
      return installation(visual.form, visual.seed, w, h);
  }
}

export function artworkSvg(work: Artwork): string {
  const { w, h } = artworkImageSize(work);
  return renderVisual(work.visual, w, h);
}
