import { artworks, getArtwork } from "@/content/artworks";
import { artworkSvg } from "@/graphics/artwork-svg";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  // Emitted as real .svg files so static hosts serve the right content type.
  return artworks.map((a) => ({ id: `${a.id}.svg` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = getArtwork(id.replace(/\.svg$/, ""));
  if (!work) return new Response("Not found", { status: 404 });
  return new Response(artworkSvg(work), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
