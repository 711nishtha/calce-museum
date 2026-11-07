import type { Metadata } from "next";
import Link from "next/link";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { PageHead } from "@/components/ui/PageHead";
import { artists } from "@/content/artists";
import { artworksByArtist } from "@/content/artworks";
import { getExhibition } from "@/content/exhibitions";

export const metadata: Metadata = { title: "Artists", description: "The eleven artists and one collective shown at CALCE this season." };

export default function ArtistsPage() {
  const sorted = [...artists].sort((a, b) => a.name.split(" ").at(-1)!.localeCompare(b.name.split(" ").at(-1)!));
  return (
    <>
      <PageHead eyebrow="This season" title="Artists" lede="Eleven artists and one collective working with stone, earth, light and water around the Mediterranean." />
      <section className="section">
        <div className="container artist-grid">
          {sorted.map((a) => {
            const works = artworksByArtist(a.id);
            const exhibitionTitles = [...new Set(works.map((w) => (w.exhibitionId ? getExhibition(w.exhibitionId)?.title : "Sculpture Garden")))];
            return (
              <Link key={a.id} href={`/artists/${a.id}`} className="artist-entry">
                <span className="arch">
                  <ArtworkImage work={works[0]!} />
                </span>
                <span>
                  <span className="artist-entry__name">{a.name}</span>
                  <span className="small soft" style={{ display: "block", marginTop: "var(--space-2)" }}>
                    {a.id === "collettivo-mareo" ? `Founded ${a.born}, ${a.birthplace}` : `b. ${a.born}, ${a.birthplace}`} · lives in {a.basedIn}
                  </span>
                  <span className="small" style={{ display: "block", marginTop: "var(--space-2)" }}>
                    {exhibitionTitles.join(" · ")}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
