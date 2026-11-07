import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { roomById } from "@/architecture/floorplan";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { InlineSvg } from "@/components/ui/InlineSvg";
import { PageHead } from "@/components/ui/PageHead";
import { getArtist } from "@/content/artists";
import { artworksByExhibition } from "@/content/artworks";
import { exhibitions, getExhibition } from "@/content/exhibitions";
import { mapSvg } from "@/graphics/map-svg";
import { formatDate, formatRange, mediumLabel } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return exhibitions.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const ex = getExhibition((await params).id);
  return ex ? { title: ex.title, description: `${ex.subtitle}. ${formatRange(ex.opens, ex.closes)}.` } : {};
}

export default async function ExhibitionPage({ params }: { params: Promise<{ id: string }> }) {
  const ex = getExhibition((await params).id);
  if (!ex) notFound();
  const works = artworksByExhibition(ex.id);
  const artistIds = [...new Set(works.map((w) => w.artistId))];
  const room = roomById(ex.room);

  return (
    <div style={{ "--accent": ex.accent } as React.CSSProperties}>
      <PageHead
        crumbs={[{ href: "/exhibitions", label: "Exhibitions" }, { label: ex.title }]}
        eyebrow={`Exhibition ${ex.number} · ${mediumLabel(ex.medium)}`}
        title={ex.title}
        lede={ex.subtitle}
      >
        <dl className="meta mt-6">
          <dt>Dates</dt>
          <dd>
            {formatDate(ex.opens)} – {formatDate(ex.closes)}
          </dd>
          <dt>Where</dt>
          <dd>{room.name}</dd>
          <dt>Curator</dt>
          <dd>{ex.curator}</dd>
          <dt>Works</dt>
          <dd>
            {works.length} works by {artistIds.length} artists
          </dd>
        </dl>
        <div className="btn-row mt-6">
          <Link href="/tickets" className="btn btn--primary">
            Book tickets
          </Link>
          <Link href={`/museum?room=${ex.room}`} className="btn">
            Walk into {room.name.split(" —")[0]} in 3D
          </Link>
        </div>
      </PageHead>

      <section className="section">
        <div className="container split split--wide-left">
          <div className="prose">
            <span className="eyebrow">Curatorial statement</span>
            {ex.statement.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <p className="small soft">— {ex.curator}</p>
          </div>
          <aside className="sticky">
            <span className="eyebrow">In the building</span>
            <figure className="map-figure">
              <InlineSvg svg={mapSvg({ highlight: ex.room, works: true, labels: true })} label={`Plan of CALCE with ${room.name} highlighted.`} />
            </figure>
            <p className="small mt-4">{ex.layout}</p>
          </aside>
        </div>
      </section>

      <section className="section section--plaster" aria-labelledby="works">
        <div className="container">
          <div className="section__head">
            <h2 id="works" className="h2">
              Works in the exhibition
            </h2>
          </div>
          <div className="work-grid work-grid--wide">
            {works.map((w) => (
              <Link key={w.id} href={`/collection/${w.id}`} className="stretched">
                <figure className="figure">
                  <ArtworkImage work={w} className="arch" />
                  <figcaption className="caption">
                    <strong className="h4">{w.title}</strong>
                    {getArtist(w.artistId)?.name}, {w.year}
                    <br />
                    {w.materials}
                  </figcaption>
                </figure>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="artists">
        <div className="container split">
          <h2 id="artists" className="h2">
            Artists
          </h2>
          <ul className="index-list">
            {artistIds.map((id) => {
              const a = getArtist(id)!;
              return (
                <li key={id}>
                  <Link href={`/artists/${id}`}>
                    <span className="index-list__title">{a.name}</span>
                    <span className="index-list__meta">{a.practice}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
