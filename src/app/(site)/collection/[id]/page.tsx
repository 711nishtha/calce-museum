import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { roomById } from "@/architecture/floorplan";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { getArtist } from "@/content/artists";
import { artworks, artworksByArtist, getArtwork } from "@/content/artworks";
import { getExhibition } from "@/content/exhibitions";
import { mediumLabel } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return artworks.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const w = getArtwork((await params).id);
  if (!w) return {};
  return { title: `${w.title} — ${getArtist(w.artistId)?.name}`, description: w.description };
}

function dims(w: { w: number; h: number; d?: number }) {
  return `${w.h} × ${w.w}${w.d ? ` × ${w.d}` : ""} cm`;
}

export default async function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const work = getArtwork((await params).id);
  if (!work) notFound();
  const artist = getArtist(work.artistId)!;
  const ex = work.exhibitionId ? getExhibition(work.exhibitionId) : null;
  const room = work.placement.type !== "storage" ? roomById(work.placement.room) : null;
  const others = artworksByArtist(artist.id).filter((w) => w.id !== work.id);

  return (
    <>
      <section className="section section--tight">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/collection">Collection</Link>
              </li>
              {ex && (
                <li>
                  <Link href={`/exhibitions/${ex.id}`}>{ex.title}</Link>
                </li>
              )}
              <li>
                <span aria-current="page">{work.title}</span>
              </li>
            </ol>
          </nav>
          <div className="split split--even" style={{ alignItems: "start" }}>
            <figure className="figure figure--contain" style={{ background: "var(--limestone)", padding: "clamp(16px, 5vw, 64px)" }}>
              <ArtworkImage work={work} priority />
            </figure>
            <div className="sticky stack-lg">
              <div>
                <span className="eyebrow">{mediumLabel(work.medium)}</span>
                <h1 className="h1">{work.title}</h1>
                <p className="h3 mt-4">
                  <Link href={`/artists/${artist.id}`}>{artist.name}</Link>
                </p>
              </div>
              <dl className="meta">
                <dt>Date</dt>
                <dd>{work.dateLabel ?? work.year}</dd>
                <dt>Medium</dt>
                <dd>{work.materials}</dd>
                <dt>{work.visual.kind === "image" ? "Original size" : "Dimensions"}</dt>
                <dd>{dims(work.dimensions)}</dd>
                {work.visual.kind === "image" ? (
                  <>
                    <dt>Original</dt>
                    <dd>{work.visual.holder}</dd>
                    <dt>Image</dt>
                    <dd>
                      <a href={work.visual.source} target="_blank" rel="noopener noreferrer">
                        Wikimedia Commons
                      </a>{" "}
                      · public domain
                    </dd>
                  </>
                ) : (
                  <>
                    <dt>{work.exhibitionId ? "Loan" : "Accession"}</dt>
                    <dd>{work.exhibitionId ? `${work.accession} · courtesy the artist` : work.accession}</dd>
                  </>
                )}
                <dt>On view</dt>
                <dd>{room ? room.name : "In storage"}</dd>
              </dl>
              <p className="prose">{work.description}</p>
              <div className="notice">
                <span className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>
                  Look closer
                </span>
                <p className="h4 italic" style={{ margin: 0 }}>
                  {work.lookCloser}
                </p>
              </div>
              <div className="btn-row">
                {room && (
                  <Link href={`/museum?work=${work.id}`} className="btn btn--primary">
                    Find it in the 3D museum
                  </Link>
                )}
                {ex && (
                  <Link href={`/exhibitions/${ex.id}`} className="btn">
                    About the exhibition
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {others.length > 0 && (
        <section className="section section--plaster" aria-labelledby="more">
          <div className="container">
            <div className="section__head">
              <h2 id="more" className="h3">
                More by {artist.name}
              </h2>
            </div>
            <div className="work-grid">
              {others.map((w) => (
                <Link key={w.id} href={`/collection/${w.id}`} className="stretched">
                  <figure className="figure">
                    <ArtworkImage work={w} className="arch" />
                    <figcaption className="caption">
                      <strong className="h4">{w.title}</strong>
                      {w.year}
                    </figcaption>
                  </figure>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
