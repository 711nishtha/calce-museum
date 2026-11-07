import type { Artwork } from "@/content/types";
import { artworkImageSize } from "@/graphics/artwork-svg";
import { getArtist } from "@/content/artists";
import { artworkUrl } from "@/lib/paths";

/** Generated artwork image served as a static SVG from /media/art/[id]. */
export function ArtworkImage({ work, className, priority = false }: { work: Artwork; className?: string; priority?: boolean }) {
  const { w, h } = artworkImageSize(work);
  const artist = getArtist(work.artistId);
  return (
    <img
      src={artworkUrl(work)}
      width={w}
      height={h}
      alt={`${work.title} by ${artist?.name ?? "unknown artist"}, ${work.year}. ${work.materials}.`}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
