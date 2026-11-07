"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { getArtist } from "@/content/artists";
import { getArtwork } from "@/content/artworks";
import { getExhibition } from "@/content/exhibitions";
import { useMuseum } from "@/three/state/museumStore";
import { artworkUrl } from "@/lib/paths";

/** Information about one work, opened from the gallery. Esc or the close button returns to walking. */
export function ArtworkPanel({ onClose }: { onClose: () => void }) {
  const id = useMuseum((s) => s.openArtworkId);
  const closeRef = useRef<HTMLButtonElement>(null);
  const work = id ? getArtwork(id) : undefined;

  useEffect(() => {
    if (!work) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [work, onClose]);

  if (!work) return null;
  const artist = getArtist(work.artistId)!;
  const ex = work.exhibitionId ? getExhibition(work.exhibitionId) : null;
  const d = work.dimensions;

  return (
    <div className="m-panel m-artwork" role="dialog" aria-modal="true" aria-labelledby="m-art-title">
      <div className="m-artwork__image">
        <img src={artworkUrl(work.id)} alt={`${work.title} by ${artist.name}`} />
      </div>
      <div className="m-artwork__text stack">
        <span className="eyebrow">{ex ? `Exhibition ${ex.number} · ${ex.title}` : "Permanent collection"}</span>
        <h2 id="m-art-title" className="h2">
          {work.title}
        </h2>
        <p className="h3" style={{ margin: 0 }}>
          {artist.name}
        </p>
        <dl className="meta">
          <dt>Date</dt>
          <dd>{work.year}</dd>
          <dt>Medium</dt>
          <dd>{work.materials}</dd>
          <dt>Size</dt>
          <dd>
            {d.h} × {d.w}
            {d.d ? ` × ${d.d}` : ""} cm
          </dd>
        </dl>
        <p>{work.description}</p>
        <div className="notice">
          <span className="eyebrow" style={{ marginBottom: 4 }}>
            Look closer
          </span>
          <p className="h4 italic" style={{ margin: 0 }}>
            {work.lookCloser}
          </p>
        </div>
        <p className="small soft">
          {artist.name} (b. {artist.born}, {artist.birthplace}) — {artist.practice.toLowerCase()}.
        </p>
        <div className="btn-row">
          <button ref={closeRef} type="button" className="m-btn m-btn--primary" onClick={onClose}>
            Return to the gallery <kbd>Esc</kbd>
          </button>
          <Link href={`/collection/${work.id}`} className="m-btn" target="_blank" rel="noopener">
            Open on the website
          </Link>
        </div>
      </div>
      <button type="button" className="m-btn m-panel__close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}
