"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import { getArtist } from "@/content/artists";
import { artworks } from "@/content/artworks";
import { exhibitions } from "@/content/exhibitions";
import type { Medium } from "@/content/types";
import { filterArtworks, type CollectionSort } from "@/lib/collection";

const media: (Medium | "all")[] = ["all", "sculpture", "painting", "photography", "installation"];

export function CollectionBrowser() {
  const [medium, setMedium] = useState<Medium | "all">("all");
  const [exhibition, setExhibition] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CollectionSort>("gallery");

  const results = useMemo(() => filterArtworks(artworks, { medium, exhibition, query, sort }), [medium, exhibition, query, sort]);

  return (
    <>
      <div className="filters" role="search" aria-label="Filter the collection">
        <fieldset>
          <legend className="label">Medium</legend>
          <div className="chips">
            {media.map((m) => (
              <button key={m} type="button" className="chip" aria-pressed={medium === m} onClick={() => setMedium(m)}>
                {m === "all" ? "All" : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="field" style={{ minWidth: 220 }}>
          <label htmlFor="f-ex">Exhibition</label>
          <select id="f-ex" className="select" value={exhibition} onChange={(e) => setExhibition(e.target.value)}>
            <option value="all">All exhibitions</option>
            {exhibitions.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.number} · {ex.title}
              </option>
            ))}
            <option value="collection">Permanent collection</option>
          </select>
        </div>
        <div className="field" style={{ minWidth: 220, flex: "1 1 220px" }}>
          <label htmlFor="f-q">Search</label>
          <input id="f-q" className="input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title, artist or material" />
        </div>
        <div className="field" style={{ minWidth: 170 }}>
          <label htmlFor="f-sort">Order</label>
          <select id="f-sort" className="select" value={sort} onChange={(e) => setSort(e.target.value as CollectionSort)}>
            <option value="gallery">As hung</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
      </div>
      <p className="small soft" aria-live="polite" role="status">
        {results.length === 1 ? "1 work" : `${results.length} works`}
      </p>
      {results.length === 0 ? (
        <div className="notice mt-6">
          <p style={{ margin: 0 }}>No works match these filters.</p>
          <button
            type="button"
            className="btn btn--small mt-4"
            onClick={() => {
              setMedium("all");
              setExhibition("all");
              setQuery("");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="work-grid mt-6" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {results.map((w) => (
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
      )}
    </>
  );
}
