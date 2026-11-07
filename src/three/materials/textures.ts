/**
 * Procedural surface textures painted on canvas at runtime — no image downloads.
 * Each texture represents a fixed real-world tile size (TILE_METRES) so geometry can
 * map UVs in metres and every surface keeps a consistent scale.
 */
import * as THREE from "three";
import { rng } from "@/graphics/rng";

export type Surface = "limestone" | "ashlar" | "plaster" | "travertine" | "oak" | "terracotta" | "gravel" | "earth" | "nightPlaster";

/** metres covered by one repeat of each texture */
export const TILE_METRES: Record<Surface, number> = {
  limestone: 2.4,
  ashlar: 4.8,
  plaster: 6,
  travertine: 2.4,
  oak: 2.4,
  terracotta: 1.2,
  gravel: 3,
  earth: 12,
  nightPlaster: 6,
};

const cache = new Map<string, THREE.CanvasTexture>();

function speckle(ctx: CanvasRenderingContext2D, size: number, seed: number, count: number, colours: string[], rMin: number, rMax: number, alpha: number) {
  const r = rng(seed);
  ctx.globalAlpha = alpha;
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colours[i % colours.length]!;
    ctx.beginPath();
    ctx.arc(r.next() * size, r.next() * size, r.range(rMin, rMax), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function mottle(ctx: CanvasRenderingContext2D, size: number, seed: number, colours: string[], count: number, alpha: number) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = r.next() * size;
    const y = r.next() * size;
    const rad = r.range(size * 0.12, size * 0.4);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    const c = colours[i % colours.length]!;
    g.addColorStop(0, c);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    // draw wrapped copies so the texture tiles seamlessly
    for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) ctx.fillRect(x - rad + dx, y - rad + dy, rad * 2, rad * 2);
  }
  ctx.globalAlpha = 1;
}

const painters: Record<Surface, (ctx: CanvasRenderingContext2D, s: number) => void> = {
  limestone: (ctx, s) => {
    ctx.fillStyle = "#E4DAC5";
    ctx.fillRect(0, 0, s, s);
    mottle(ctx, s, 3, ["#ebe2cf", "#dccfb4", "#e4d9c3"], 18, 0.16);
    speckle(ctx, s, 4, 2600, ["#b9a98a", "#f4ecdc", "#cbbd9f"], 0.4, 1.4, 0.35);
    // honed slabs 1.2 m × 1.2 m
    ctx.strokeStyle = "rgba(120,100,75,0.28)";
    ctx.lineWidth = 2;
    for (const p of [0, s / 2]) {
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, s);
      ctx.moveTo(0, p);
      ctx.lineTo(s, p);
      ctx.stroke();
    }
  },
  ashlar: (ctx, s) => {
    ctx.fillStyle = "#E0D3B8";
    ctx.fillRect(0, 0, s, s);
    mottle(ctx, s, 5, ["#e8ddc6", "#dacbae", "#e2d6bd"], 18, 0.14);
    speckle(ctx, s, 6, 3000, ["#b3a281", "#f2e9d6"], 0.4, 1.6, 0.3);
    // courses 0.6 m high, blocks 1.2–1.6 m, staggered
    const course = s / 8;
    ctx.strokeStyle = "rgba(110,90,66,0.35)";
    ctx.lineWidth = 2;
    const r = rng(9);
    for (let i = 0; i < 8; i++) {
      const y = i * course;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(s, y);
      ctx.stroke();
      let x = (i % 2) * course;
      while (x < s) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + course);
        ctx.stroke();
        x += course * r.range(2, 2.7);
      }
    }
  },
  plaster: (ctx, s) => {
    ctx.fillStyle = "#EDE4D3";
    ctx.fillRect(0, 0, s, s);
    mottle(ctx, s, 7, ["#f3ebdd", "#e7dcc8", "#efe6d6"], 30, 0.18);
    speckle(ctx, s, 8, 2400, ["#ddd0b8", "#fbf6ec"], 0.3, 0.9, 0.18);
  },
  nightPlaster: (ctx, s) => {
    ctx.fillStyle = "#3a322b";
    ctx.fillRect(0, 0, s, s);
    mottle(ctx, s, 17, ["#453b33", "#2f2823"], 40, 0.5);
  },
  travertine: (ctx, s) => {
    ctx.fillStyle = "#E2D2B2";
    ctx.fillRect(0, 0, s, s);
    const r = rng(11);
    for (let i = 0; i < 70; i++) {
      const y = r.next() * s;
      ctx.strokeStyle = r.next() < 0.5 ? "rgba(190,166,128,0.45)" : "rgba(244,234,214,0.5)";
      ctx.lineWidth = r.range(1, 5);
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= s; x += s / 16) ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 3);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(140,115,80,0.45)";
    for (let i = 0; i < 260; i++) {
      ctx.beginPath();
      ctx.ellipse(r.next() * s, r.next() * s, r.range(1, 6), r.range(0.6, 1.8), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // tiles 0.6 × 1.2 m
    ctx.strokeStyle = "rgba(150,128,96,0.4)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i * s) / 4);
      ctx.lineTo(s, (i * s) / 4);
      ctx.stroke();
      const off = (i % 2) * (s / 4);
      for (let x = off; x < s; x += s / 2) {
        ctx.beginPath();
        ctx.moveTo(x, (i * s) / 4);
        ctx.lineTo(x, ((i + 1) * s) / 4);
        ctx.stroke();
      }
    }
  },
  oak: (ctx, s) => {
    const r = rng(13);
    const planks = 12; // 0.2 m wide boards
    const pw = s / planks;
    for (let i = 0; i < planks; i++) {
      const tone = r.range(-14, 14);
      ctx.fillStyle = `rgb(${178 + tone},${140 + tone},${98 + tone})`;
      ctx.fillRect(i * pw, 0, pw, s);
      for (let k = 0; k < 18; k++) {
        ctx.strokeStyle = `rgba(110,78,48,${r.range(0.08, 0.22)})`;
        ctx.lineWidth = r.range(0.6, 2);
        const x = i * pw + r.next() * pw;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        for (let y = 0; y <= s; y += s / 24) ctx.lineTo(x + Math.sin(y * 0.01 + k) * 2.2, y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(70,48,30,0.45)";
      ctx.fillRect(i * pw, 0, 1.5, s);
      const cut = r.next() * s;
      ctx.fillRect(i * pw, cut, pw, 1.5);
    }
  },
  terracotta: (ctx, s) => {
    const n = 4; // 0.3 m tiles
    const t = s / n;
    const r = rng(15);
    ctx.fillStyle = "#8f5a40";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const tone = r.range(-18, 14);
        ctx.fillStyle = `rgb(${184 + tone},${108 + tone * 0.7},${76 + tone * 0.5})`;
        ctx.fillRect(i * t + 3, j * t + 3, t - 6, t - 6);
      }
    speckle(ctx, s, 16, 1400, ["#7c4630", "#d79a78"], 0.4, 1.4, 0.35);
  },
  gravel: (ctx, s) => {
    ctx.fillStyle = "#CDBFA5";
    ctx.fillRect(0, 0, s, s);
    speckle(ctx, s, 19, 9000, ["#a8987c", "#e7dcc6", "#b9a98c", "#8f8068"], 0.8, 2.6, 0.7);
  },
  earth: (ctx, s) => {
    ctx.fillStyle = "#A39874";
    ctx.fillRect(0, 0, s, s);
    mottle(ctx, s, 21, ["#938a62", "#b5a77f", "#8a8a5c", "#ab9c76"], 60, 0.55);
    speckle(ctx, s, 22, 5000, ["#8e8662", "#d6c9a8"], 0.5, 1.8, 0.4);
  },
};

export function surfaceTexture(surface: Surface, size = 512): THREE.CanvasTexture {
  const key = `${surface}@${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  painters[surface](ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}
