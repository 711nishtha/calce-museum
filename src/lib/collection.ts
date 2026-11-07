import { getArtist } from "@/content/artists";
import type { Artwork, Medium } from "@/content/types";

export type CollectionSort = "gallery" | "newest" | "oldest" | "title";

export interface CollectionFilter {
  medium: Medium | "all";
  /** exhibition id, "collection" for permanent works, or "all" */
  exhibition: string;
  query: string;
  sort: CollectionSort;
}

export function filterArtworks(list: Artwork[], f: CollectionFilter): Artwork[] {
  const q = f.query.trim().toLowerCase();
  const out = list.filter((w) => {
    if (f.medium !== "all" && w.medium !== f.medium) return false;
    if (f.exhibition === "collection" && w.exhibitionId !== null) return false;
    if (f.exhibition !== "all" && f.exhibition !== "collection" && w.exhibitionId !== f.exhibition) return false;
    if (q) {
      const hay = `${w.title} ${getArtist(w.artistId)?.name ?? ""} ${w.materials} ${w.year}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (f.sort === "newest") out.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  else if (f.sort === "oldest") out.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
  else if (f.sort === "title") out.sort((a, b) => a.title.localeCompare(b.title));
  return out;
}
