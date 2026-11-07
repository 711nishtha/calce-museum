import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { CollectionBrowser } from "@/components/site/CollectionBrowser";
import { artworks } from "@/content/artworks";

export const metadata: Metadata = { title: "Collection", description: "Browse every work on view at CALCE by medium, exhibition, artist and date." };

export default function CollectionPage() {
  return (
    <>
      <PageHead eyebrow="Collection" title="Every work on view" lede={`${artworks.length} works across four exhibitions and the sculpture garden. Filter by medium or exhibition, or search by title, artist or material.`} />
      <section className="section section--tight">
        <div className="container">
          <CollectionBrowser />
        </div>
      </section>
    </>
  );
}
