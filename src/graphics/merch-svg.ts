/** Product mockups for the shop and the identity guide — drawn, not photographed. */
import { getArtwork } from "@/content/artworks";
import { getExhibition } from "@/content/exhibitions";
import type { ShopProduct } from "@/content/types";
import { palette, support } from "@/lib/brand";
import { embedArtwork, namespaceIds } from "./embed";
import { catalogueSvg, mark, posterSvg, wordmark } from "./identity";

const S = 800;

function nest(svgString: string, x: number, y: number, w: number, h: number, prefix: string): string {
  return namespaceIds(svgString, prefix).replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+"/, `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="$1"`);
}

function stage(body: string, prefix: string): string {
  const defs = `<defs><linearGradient id="${prefix}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEE7DA"/><stop offset="0.72" stop-color="#E4DACA"/><stop offset="0.72" stop-color="#D8CCB8"/><stop offset="1" stop-color="#CFC2AC"/></linearGradient><filter id="${prefix}-sh" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter></defs>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">${defs}<rect width="${S}" height="${S}" fill="url(#${prefix}-bg)"/>${body}</svg>`;
}

const shadow = (prefix: string, cx: number, cy: number, rx: number, ry: number) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#3a2c22" opacity="0.28" filter="url(#${prefix}-sh)"/>`;

export function productMockupSvg(p: ShopProduct): string {
  const id = `m-${p.id}`;
  const ex = p.exhibitionId ? getExhibition(p.exhibitionId) : undefined;
  let b = "";
  switch (p.mockup) {
    case "tote":
      b += shadow(id, 400, 690, 230, 22);
      b += `<path d="M310,250 C310,140 490,140 490,250" fill="none" stroke="#D9CCB3" stroke-width="16"/><path d="M220,250 H580 L600,690 H200 Z" fill="#EDE3D0"/><path d="M400,250 L410,690" stroke="#000" opacity="0.04" stroke-width="80"/>`;
      b += mark(352, 380, 96, palette.terracotta, palette.terracotta);
      b += wordmark(400, 548, 48, palette.terracotta, "middle");
      break;
    case "poster":
      b += shadow(id, 400, 700, 220, 18);
      b += `<rect x="215" y="88" width="370" height="610" fill="#5A4234"/><rect x="225" y="98" width="350" height="590" fill="#fff"/>`;
      b += nest(posterSvg(ex ?? getExhibition("grammar-of-walls")!, "arch"), 240, 167, 320, 453, `${id}-p`);
      break;
    case "catalogue":
      b += shadow(id, 410, 680, 230, 22);
      b += `<rect x="236" y="166" width="340" height="480" fill="#000" opacity="0.15" transform="translate(14 10)"/>`;
      b += nest(catalogueSvg(ex ?? getExhibition("weight-of-stillness")!), 230, 160, 340, 437, `${id}-c`);
      b += `<rect x="230" y="160" width="14" height="437" fill="#000" opacity="0.12"/>`;
      break;
    case "cup":
      b += shadow(id, 400, 620, 170, 24);
      b += `<path d="M270,330 H530 L505,600 Q400,640 295,600 Z" fill="${palette.terracotta}"/><ellipse cx="400" cy="330" rx="130" ry="26" fill="#7A3F27"/><ellipse cx="400" cy="330" rx="118" ry="20" fill="${palette.walnut}"/><path d="M270,330 H530 L527,360 Q400,385 273,360 Z" fill="#C9845F" opacity="0.6"/><path d="M300,370 L320,590" stroke="#fff" stroke-width="14" opacity="0.12"/>`;
      break;
    case "scarf":
      b += shadow(id, 400, 660, 260, 24);
      b += `<path d="M160,300 Q400,240 640,300 L620,640 Q400,600 180,640 Z" fill="${palette.limestone}"/><path d="M160,300 Q400,240 640,300" stroke="${palette.terracotta}" stroke-width="8" fill="none"/><path d="M180,640 Q400,600 620,640" stroke="${palette.terracotta}" stroke-width="8" fill="none"/>`;
      for (let i = 0; i < 6; i++) b += `<path d="M${200 + i * 70},${300 - 8} Q${230 + i * 70},450 ${210 + i * 70},630" stroke="#fff" stroke-width="18" opacity="0.18" fill="none"/>`;
      break;
    case "notebook": {
      const work = getArtwork("wild-fennel")!;
      b += shadow(id, 410, 680, 210, 20);
      b += `<rect x="250" y="150" width="310" height="520" rx="6" fill="#1D3A5F"/>`;
      b += `<clipPath id="${id}-clip"><rect x="250" y="150" width="310" height="520" rx="6"/></clipPath><g clip-path="url(#${id}-clip)">${embedArtwork(work, 250, 150, 310, 520, `${id}-a`)}</g>`;
      b += `<rect x="250" y="150" width="20" height="520" fill="#000" opacity="0.2"/><rect x="290" y="600" width="230" height="44" fill="${palette.ivory}"/>`;
      b += wordmark(405, 630, 22, support.ink, "middle");
      break;
    }
    case "postcards": {
      const ids = ["arch-at-four", "olive-leaves-wind", "seven-afternoons"];
      b += shadow(id, 400, 650, 270, 22);
      ids.forEach((aid, i) => {
        const work = getArtwork(aid)!;
        const rot = (i - 1) * 9;
        b += `<g transform="rotate(${rot} 400 420)"><rect x="270" y="220" width="260" height="380" fill="#fff"/>${embedArtwork(work, 284, 234, 232, 300, `${id}-${i}`)}<rect x="284" y="548" width="120" height="6" fill="${palette.sand}"/></g>`;
      });
      break;
    }
    case "candle":
      b += shadow(id, 400, 640, 150, 20);
      b += `<rect x="300" y="330" width="200" height="290" rx="20" fill="${palette.limestone}"/><ellipse cx="400" cy="330" rx="100" ry="18" fill="#D9CCB3"/>`;
      break;
  }
  return stage(b, id);
}
