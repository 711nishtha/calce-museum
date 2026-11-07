import { getAsset, identityAssets } from "@/graphics/assets";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return identityAssets.map((a) => ({ id: `${a.id}.svg` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = getAsset(id.replace(/\.svg$/, ""));
  if (!asset) return new Response("Not found", { status: 404 });
  return new Response(asset.render(), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `inline; filename="calce-${asset.id}.svg"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
