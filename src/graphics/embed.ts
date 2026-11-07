import type { Artwork } from "@/content/types";
import { artworkSvg } from "./artwork-svg";
import { artworkUrl } from "@/lib/paths";

/**
 * Namespaces ids inside an SVG string so several generated images can be inlined on
 * one page (or nested inside a poster) without their filters and gradients colliding.
 */
export function namespaceIds(svgString: string, prefix: string): string {
  return svgString
    .replace(/id="([^"]+)"/g, (_, id: string) => `id="${prefix}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${prefix}-${id})`);
}

type EmbedMode = "nest" | "link";
let mode: EmbedMode = "nest";

/**
 * Render with artworks referenced by URL (`<image href="…/media/art/<id>.svg">`) rather than
 * nested. Used for SVG inlined in web pages, where nesting would bloat the HTML;
 * downloadable files keep the default nested mode so they are self-contained.
 * Rendering is synchronous, so the scoped switch cannot leak between requests.
 */
export function linked<T>(render: () => T): T {
  const previous = mode;
  mode = "link";
  try {
    return render();
  } finally {
    mode = previous;
  }
}

/** Place an artwork image inside another SVG at x,y,w,h, cropped to fill. */
export function embedArtwork(work: Artwork, x: number, y: number, w: number, h: number, prefix: string): string {
  if (mode === "link") return `<image href="${artworkUrl(work.id)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`;
  return namespaceIds(artworkSvg(work), prefix).replace(
    /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="\d+" height="\d+"/,
    `<svg x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"`,
  );
}
