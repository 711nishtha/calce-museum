/**
 * Homepage hero: a view along the museum's axis through three receding arches into
 * the sunlit atrium, with an olive branch in the foreground. The sun shaft and its
 * disc of light drift slowly (disabled for reduced motion via CSS).
 */
import { palette } from "@/lib/brand";
import { rng, f } from "./rng";

export function heroSvg(): string {
  const W = 1600;
  const H = 1000;
  const r = rng(7);
  const arch = (cx: number, top: number, w: number, bottom: number) =>
    `M${f(cx - w / 2)},${f(bottom)} V${f(top + w / 2)} A${f(w / 2)},${f(w / 2)} 0 0 1 ${f(cx + w / 2)},${f(top + w / 2)} V${f(bottom)} Z`;

  let leaves = "";
  for (let i = 0; i < 34; i++) {
    const t = i / 34;
    const x = 1600 - t * 520 + r.range(-10, 10);
    const y = 40 + Math.sin(t * 2.6) * 90 + t * 120;
    const a = r.range(-70, 70) + (i % 2 ? 40 : -40);
    const len = r.range(46, 74);
    leaves += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><path d="M0,0 C${f(len * 0.3)},-${f(len * 0.13)} ${f(len * 0.7)},-${f(len * 0.13)} ${f(len)},0 C${f(len * 0.7)},${f(len * 0.13)} ${f(len * 0.3)},${f(len * 0.13)} 0,0 Z" fill="${i % 3 ? palette.olive : "#5E6345"}" opacity="${f(r.range(0.8, 1))}"/></g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
<defs>
  <linearGradient id="h-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9E0CF"/><stop offset="1" stop-color="#D9CCB6"/></linearGradient>
  <linearGradient id="h-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D5C6AC"/><stop offset="1" stop-color="#BFAE91"/></linearGradient>
  <linearGradient id="h-deeper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9B697"/><stop offset="1" stop-color="#AE9A7A"/></linearGradient>
  <linearGradient id="h-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF3E2"/><stop offset="1" stop-color="#F1DFC0"/></linearGradient>
  <linearGradient id="h-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDBEA3"/><stop offset="1" stop-color="#B8A587"/></linearGradient>
  <linearGradient id="h-shaft" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#FFF7E6" stop-opacity="0.75"/><stop offset="1" stop-color="#FFF7E6" stop-opacity="0"/></linearGradient>
  <filter id="h-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="h-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.16 0 0 0 0 0.12 0 0 0 0 0.09 1.2 0 0 0 -0.55"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#h-wall)"/>
<path d="${arch(800, 150, 620, 860)}" fill="url(#h-deep)"/>
<path d="${arch(800, 300, 400, 800)}" fill="url(#h-deeper)"/>
<path d="${arch(800, 410, 250, 762)}" fill="url(#h-sun)"/>
<rect x="675" y="700" width="250" height="62" fill="#E7D3B0"/>
<path d="M0,860 H1600 V1000 H0 Z" fill="url(#h-floor)"/>
<path d="M490,860 L675,762 H925 L1110,860 Z" fill="#C8B697"/>
<g class="hero-light">
  <path d="M560,0 L760,0 L1010,860 L700,860 Z" fill="url(#h-shaft)" opacity="0.55"/>
  <ellipse cx="860" cy="900" rx="210" ry="42" fill="#FFF4DD" opacity="0.65" filter="url(#h-blur)"/>
</g>
<path d="M800,0 H1600 V1000 H1110 L1110,860 V${f(150 + 310)} A310,310 0 0 0 490,${f(150 + 310)} V860 L490,1000 H0 V0 Z" fill="url(#h-wall)"/>
<rect x="0" y="0" width="${W}" height="${H}" fill="url(#h-wall)" opacity="0" />
<g class="hero-branch">
  <path d="M1600,30 C1400,90 1260,120 1080,220" stroke="#5B4A3A" stroke-width="7" fill="none" stroke-linecap="round"/>
  ${leaves}
</g>
<rect width="${W}" height="${H}" filter="url(#h-grain)" opacity="0.6"/>
</svg>`;
}
