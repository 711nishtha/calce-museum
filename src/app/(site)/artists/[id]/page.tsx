import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { PageHead } from "@/components/ui/PageHead";
import { artists, getArtist } from "@/content/artists";
import { artworksByArtist } from "@/content/artworks";
import { getExhibition } from "@/content/exhibitions";

export const dynamicParams = false;

export function generateStaticParams() {
  return artists.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const a = getArtist((await params).id);
  return a ? { title: a.name, description: `${a.name} — ${a.practice}.` } : {};
}

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const artist = getArtist((await params).id);
  if (!artist) notFound();
  const works = artworksByArtist(artist.id);
  const isCollective = artist.id === "collettivo-mareo";

  return (
    <>
      <PageHead crumbs={[{ href: "/artists", label: "Artists" }, { label: artist.name }]} eyebrow={artist.practice} title={artist.name}>
        <dl className="meta mt-6">
          <dt>{isCollective ? "Founded" : "Born"}</dt>
          <dd>
            {artist.born}, {artist.birthplace}
          </dd>
          <dt>Lives and works</dt>
          <dd>{artist.basedIn}</dd>
        </dl>
      </PageHead>
      <section className="section">
        <div className="container split split--wide-left">
          <div className="prose">
            {artist.bio.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <blockquote className="quote" style={{ margin: 0 }}>
            {artist.quote}
          </blockquote>
        </div>
      </section>
      <section className="section section--plaster" aria-labelledby="works">
        <div className="container">
          <div className="section__head">
            <h2 id="works" className="h2">
              On view at CALCE
            </h2>
          </div>
          <div className="work-grid work-grid--wide">
            {works.map((w) => {
              const ex = w.exhibitionId ? getExhibition(w.exhibitionId) : null;
              return (
                <Link key={w.id} href={`/collection/${w.id}`} className="stretched">
                  <figure className="figure">
                    <ArtworkImage work={w} className="arch" />
                    <figcaption className="caption">
                      <strong className="h4">{w.title}</strong>
                      {w.year} · {w.materials}
                      <br />
                      {ex ? ex.title : "Permanent collection · Sculpture Garden"}
                    </figcaption>
                  </figure>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
