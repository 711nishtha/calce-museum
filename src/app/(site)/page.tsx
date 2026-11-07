import Link from "next/link";
import { roomById } from "@/architecture/floorplan";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { BrandMark } from "@/components/ui/BrandMark";
import { InlineSvg } from "@/components/ui/InlineSvg";
import { HoursTable, OpeningStatus } from "@/components/site/OpeningStatus";
import { artists } from "@/content/artists";
import { artworks, artworksByArtist, artworksByExhibition, getArtwork } from "@/content/artworks";
import { exhibitions, upcoming } from "@/content/exhibitions";
import { articles } from "@/content/journal";
import { gettingHere, museum } from "@/content/visit";
import { getArtist } from "@/content/artists";
import { heroSvg } from "@/graphics/hero-svg";
import { mapSvg } from "@/graphics/map-svg";
import { formatDate, formatRange } from "@/lib/format";

const highlightIds = ["long-wall-cadiz", "net-memory-i", "olive-leaves-wind", "field-of-unspoken-lines", "window-alfama", "carafe-one", "seat-for-two-strangers"];

export default function HomePage() {
  const highlights = highlightIds.map((id) => getArtwork(id)!);
  const featured = artists.filter((a) => ["ilaria-vensano", "yusuf-kalender", "nadia-ferhat", "hana-ostrowa-lind", "mireille-saade", "aurelio-benn"].includes(a.id));
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__art">
          <InlineSvg svg={heroSvg()} />
        </div>
        <div className="hero__veil" aria-hidden="true" />
        <div className="container hero__content">
          <span className="eyebrow">Museum of contemporary art · {museum.address[1].split(",")[0]}</span>
          <h1 id="hero-title" className="display hero__title">
            A salon for <span className="italic">slow</span> looking
          </h1>
          <p className="lede hero__lede">Four exhibitions in a house of limestone, oak and daylight — in the building, or step by step in the 3D museum.</p>
          <div className="btn-row hero__actions">
            <Link href="/tickets" className="btn btn--primary">
              Book a timed entry
            </Link>
            <Link href="/museum" className="btn">
              Walk through in 3D
            </Link>
          </div>
          <div className="hero__status">
            <OpeningStatus />
            <span>{museum.address[0]}</span>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="intro-title">
        <div className="container split">
          <div>
            <span className="eyebrow">The museum</span>
            <BrandMark className="mt-4" />
          </div>
          <div>
            <h2 id="intro-title" className="h2" style={{ maxWidth: "20ch" }}>
              Built around a room with no art in it — only <span className="italic">light</span>, an olive tree and somewhere to sit.
            </h2>
            <div className="prose mt-6">
              <p>
                CALCE is a museum of contemporary art arranged around a day-lit atrium. Four galleries open from it like the points of a compass, each with its own exhibition and its own quality of light. The sculpture garden and Café Limone lie to the east; the shop to the west.
              </p>
              <p>Every work is given room. Every gallery has a bench. Every label ends with an invitation to look a little longer.</p>
            </div>
            <Link href="/journal/building-with-light" className="text-link">
              Read about the architecture
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--plaster" aria-labelledby="now-title">
        <div className="container">
          <div className="section__head">
            <h2 id="now-title" className="h2">
              Now on view
            </h2>
            <Link href="/exhibitions" className="text-link">
              All exhibitions
            </Link>
          </div>
          {exhibitions.map((ex) => {
            const key = artworksByExhibition(ex.id)[0]!;
            return (
              <article key={ex.id} className="ex-row" style={{ "--accent": ex.accent } as React.CSSProperties}>
                <Link href={`/exhibitions/${ex.id}`} className="ex-row__media arch" tabIndex={-1} aria-hidden="true">
                  <ArtworkImage work={key} />
                </Link>
                <div>
                  <span className="ex-row__num">{ex.number}</span>
                  <h3 className="h2">
                    <Link href={`/exhibitions/${ex.id}`} className="stretched">
                      {ex.title}
                    </Link>
                  </h3>
                  <p className="h4 italic soft" style={{ marginTop: "var(--space-2)" }}>
                    {ex.subtitle}
                  </p>
                  <div className="ex-row__meta">
                    <span>{formatRange(ex.opens, ex.closes)}</span>
                    <span>{roomById(ex.room).name}</span>
                    <span>Curated by {ex.curator}</span>
                  </div>
                  <p className="ex-row__excerpt">{ex.statement[0]}</p>
                  <div className="btn-row">
                    <Link href={`/exhibitions/${ex.id}`} className="text-link">
                      Exhibition
                    </Link>
                    <Link href={`/museum?room=${ex.room}`} className="text-link">
                      Walk into the gallery
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section section--dark" aria-labelledby="museum-title">
        <div className="container teaser">
          <div>
            <span className="eyebrow">The 3D museum</span>
            <h2 id="museum-title" className="h2">
              Walk the building at a human pace
            </h2>
            <p className="mt-6" style={{ maxWidth: "48ch" }}>
              A real-time model of CALCE, hung with the same {artworks.length} works in the same places. Walk from the olive forecourt through the atrium into every gallery, stop at any work to read about it, or follow the thirteen-stop guided tour.
            </p>
            <div className="btn-row mt-6">
              <Link href="/museum" className="btn btn--light">
                Enter the museum
              </Link>
              <Link href="/museum?tour=1" className="btn btn--light">
                Start the guided tour
              </Link>
            </div>
            <p className="small mt-6" style={{ color: "var(--sand)" }}>
              Keyboard and mouse, touch, or a step-by-step guided mode. Works best on a recent desktop browser.
            </p>
          </div>
          <figure className="map-figure">
            <InlineSvg svg={mapSvg({ tour: true, background: "#EFE8DB" })} label="Plan of CALCE with the guided tour route marked in thirteen numbered stops." />
          </figure>
        </div>
      </section>

      <section className="section" aria-labelledby="artists-title">
        <div className="container">
          <div className="section__head">
            <h2 id="artists-title" className="h2">
              Featured artists
            </h2>
            <Link href="/artists" className="text-link">
              All {artists.length} artists
            </Link>
          </div>
          <div className="artist-grid">
            {featured.map((a) => {
              const work = artworksByArtist(a.id)[0]!;
              return (
                <Link key={a.id} href={`/artists/${a.id}`} className="artist-entry">
                  <span className="arch">
                    <ArtworkImage work={work} />
                  </span>
                  <span>
                    <span className="artist-entry__name">{a.name}</span>
                    <span className="small soft" style={{ display: "block", marginTop: "var(--space-2)" }}>
                      {a.practice}
                    </span>
                    <span className="small soft" style={{ display: "block" }}>
                      b. {a.born}, {a.birthplace}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--stone" aria-labelledby="collection-title">
        <div className="container">
          <div className="section__head">
            <h2 id="collection-title" className="h2">
              From the galleries
            </h2>
            <Link href="/collection" className="text-link">
              Browse the collection
            </Link>
          </div>
          <ul className="strip" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {highlights.map((w) => (
              <li key={w.id}>
                <Link href={`/collection/${w.id}`} className="stretched">
                  <figure className="figure">
                    <ArtworkImage work={w} className="arch" />
                    <figcaption className="caption">
                      <strong className="h4">{w.title}</strong>
                      {getArtist(w.artistId)?.name}, {w.year}
                    </figcaption>
                  </figure>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="upcoming-title">
        <div className="container split">
          <div>
            <h2 id="upcoming-title" className="h2">
              Coming in 2027
            </h2>
          </div>
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

      <section className="section section--plaster" aria-labelledby="visit-title">
        <div className="container split split--even">
          <div>
            <span className="eyebrow">Plan your visit</span>
            <h2 id="visit-title" className="h2">
              Tuesday to Sunday, from ten
            </h2>
            <p className="mt-6" style={{ maxWidth: "44ch" }}>
              Adults €16, reduced €11. Under 18s, members and companions free. Step-free throughout, with seating in every gallery.
            </p>
            <ul className="info-list mt-6">
              {gettingHere.slice(0, 2).map((g) => (
                <li key={g.mode}>
                  <h3>{g.mode}</h3>
                  <p className="small">{g.text}</p>
                </li>
              ))}
            </ul>
            <div className="btn-row mt-6">
              <Link href="/tickets" className="btn btn--primary">
                Book tickets
              </Link>
              <Link href="/visit" className="btn">
                Visitor information
              </Link>
            </div>
          </div>
          <div>
            <HoursTable />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="journal-title">
        <div className="container">
          <div className="section__head">
            <h2 id="journal-title" className="h2">
              Journal
            </h2>
            <Link href="/journal" className="text-link">
              All stories
            </Link>
          </div>
          <div className="article-list">
            {[...articles]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 3)
              .map((a) => (
                <Link key={a.slug} href={`/journal/${a.slug}`} className="article-entry">
                  <span className="eyebrow">
                    {a.category} · {formatDate(a.date)}
                  </span>
                  <h3 className="article-entry__title">{a.title}</h3>
                  <p className="soft">{a.dek}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
