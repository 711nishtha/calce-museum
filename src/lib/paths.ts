import type { Artwork } from "@/content/types";

/**
 * Public URLs for static assets. When the site is exported to a sub-path (for example
 * GitHub Pages at /calce-museum), NEXT_PUBLIC_BASE_PATH is set at build time and every
 * hand-written asset URL must carry it; next/link adds it to page links automatically.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE_PATH}${path}`;

/** Artwork image (same file for the website and the 3D textures): a generated SVG, or a reproduction. */
export const artworkUrl = (work: Pick<Artwork, "id" | "visual">) =>
  work.visual.kind === "image" ? asset(`/paintings/${work.visual.file}`) : asset(`/media/art/${work.id}.svg`);

/** Downloadable identity asset. */
export const identityAssetUrl = (id: string) => asset(`/media/identity/${id}.svg`);
