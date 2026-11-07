import type { Metadata } from "next";
import Link from "next/link";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { PageHead } from "@/components/ui/PageHead";
import { contemporaryArtists } from "@/content/artists";
import { artworksByArtist } from "@/content/artworks";
import { getExhibition } from "@/content/exhibitions";
import { masters } from "@/content/masters";
import type { Artist } from "@/content/types";

export const metadata: Metadata = { title: "Artists", description: "The contemporary artists shown at CALCE this season, and the masters shown in reproduction in the Royal Salon." };

const bySurname = (list: Artist[]) => [...list].sort((a, b) => a.name.split(" ").at(-1)!.localeCompare(b.name.split(" ").at(-1)!));

function ArtistEntry({ a }: { a: Artist }) {
  const works = artworksByArtist(a.id);
  const exhibitionTitles = [...new Set(works.map((w) => (w.exhibitionId ? getExhibition(w.exhibitionId)?.title : "Sculpture Garden")))];
  const life = a.died ? `${a.born}–${a.died} · worked in ${a.basedIn}` : a.id === "collettivo-mareo" ? `Founded ${a.born}, ${a.birthplace} · based in ${a.basedIn}` : `b. ${a.born}, ${a.birthplace} · lives in ${a.basedIn}`;
  return (
    <Link href={`/artists/${a.id}`} className="artist-entry">
      <span className="arch">
        <ArtworkImage work={works[0]!} />
      </span>
      <span>
        <span className="artist-entry__name">{a.name}</span>
        <span className="small soft" style={{ display: "block", marginTop: "var(--space-2)" }}>
          {life}
        </span>
        <span className="small" style={{ display: "block", marginTop: "var(--space-2)" }}>
          {exhibitionTitles.join(" · ")}
        </span>
      </span>
    </Link>
  );
}

export default function ArtistsPage() {
  return (
    <>
      <PageHead eyebrow="This season" title="Artists" lede="Eleven artists and one collective working with stone, earth, light and water around the Mediterranean — and twelve masters shown in reproduction in the Royal Salon." />
      <section className="section">
        <div className="container artist-grid">
          {bySurname(contemporaryArtists).map((a) => (
            <ArtistEntry key={a.id} a={a} />
          ))}
        </div>
      </section>
      <section className="section section--plaster" aria-labelledby="masters">
        <div className="container">
          <div className="section__head">
            <h2 id="masters" className="h2">
              Masters in reproduction
            </h2>
            <span className="small soft">Gallery V — The Royal Salon</span>
          </div>
          <div className="artist-grid">
            {bySurname(masters).map((a) => (
              <ArtistEntry key={a.id} a={a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
