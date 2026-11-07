import type { Metadata } from "next";
import Link from "next/link";
import { roomById } from "@/architecture/floorplan";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { PageHead } from "@/components/ui/PageHead";
import { artworksByExhibition } from "@/content/artworks";
import { exhibitions, upcoming } from "@/content/exhibitions";
import { formatRange, mediumLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Exhibitions", description: "Four exhibitions of contemporary sculpture, painting, camera-less photography and installation." };

export default function ExhibitionsPage() {
  return (
    <>
      <PageHead eyebrow="Autumn & Winter 2026–27" title="Exhibitions" lede="Four exhibitions, one in each gallery, arranged around the atrium like the points of a compass." />
      <section className="section">
        <div className="container">
          {exhibitions.map((ex) => (
            <article key={ex.id} className="ex-row" style={{ "--accent": ex.accent } as React.CSSProperties}>
              <Link href={`/exhibitions/${ex.id}`} className="ex-row__media arch" tabIndex={-1} aria-hidden="true">
                <ArtworkImage work={artworksByExhibition(ex.id)[0]!} />
              </Link>
              <div>
                <span className="ex-row__num">{ex.number}</span>
                <span className="eyebrow">
                  {mediumLabel(ex.medium)} · {roomById(ex.room).name}
                </span>
                <h2 className="h2">
                  <Link href={`/exhibitions/${ex.id}`} className="stretched">
                    {ex.title}
                  </Link>
                </h2>
                <p className="h4 italic soft" style={{ marginTop: "var(--space-2)" }}>
                  {ex.subtitle}
                </p>
                <div className="ex-row__meta">
                  <span>{formatRange(ex.opens, ex.closes)}</span>
                  <span>{artworksByExhibition(ex.id).length} works</span>
                </div>
                <p className="ex-row__excerpt">{ex.statement[0]}</p>
                <Link href={`/exhibitions/${ex.id}`} className="text-link">
                  Read the exhibition
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section section--stone" aria-labelledby="upcoming">
        <div className="container split">
          <h2 id="upcoming" className="h2">
            Upcoming
          </h2>
          <ul className="index-list">
            {upcoming.map((u) => (
              <li key={u.id} style={{ padding: "var(--space-5) 0" }}>
                <span className="eyebrow">{formatRange(u.opens, u.closes)}</span>
                <h3 className="h3">{u.title}</h3>
                <p className="italic soft" style={{ margin: "var(--space-1) 0 var(--space-3)" }}>
                  {u.subtitle}
                </p>
                <p style={{ maxWidth: "56ch", margin: 0 }}>{u.teaser}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
