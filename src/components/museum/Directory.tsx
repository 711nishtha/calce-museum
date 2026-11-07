"use client";

import { useEffect, useRef } from "react";
import { rooms } from "@/architecture/floorplan";
import { arrivalFor, viewpointFor } from "@/architecture/navigation";
import { artworks } from "@/content/artworks";
import { getExhibition } from "@/content/exhibitions";
import { useMuseum } from "@/three/state/museumStore";

/**
 * Room-by-room directory of every space and work. Doubles as a fully keyboard- and
 * screen-reader-accessible way to move through the museum without mouse-look.
 */
export function Directory({ onClose }: { onClose: () => void }) {
  const goTo = useMuseum((s) => s.goTo);
  const openArtwork = useMuseum((s) => s.openArtwork);
  const current = useMuseum((s) => s.room);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside className="m-panel m-side" role="dialog" aria-modal="true" aria-labelledby="m-dir-title">
      <h2 id="m-dir-title" ref={headingRef} tabIndex={-1}>
        Directory
      </h2>
      <p className="small soft">Go to any room or work. Movement is a gentle glide within a room and a fade between rooms.</p>
      {rooms
        .filter((r) => r.kind !== "passage")
        .map((r) => {
          const ex = r.exhibitionId ? getExhibition(r.exhibitionId) : undefined;
          const works = artworks.filter((w) => w.placement.type !== "storage" && w.placement.room === r.id);
          return (
            <section key={r.id} className="m-room" aria-labelledby={`m-room-${r.id}`}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                <h3 id={`m-room-${r.id}`} className="h4">
                  {r.name}
                  {current === r.id && <span className="small soft"> · you are here</span>}
                </h3>
                <button
                  type="button"
                  className="m-link"
                  onClick={() => {
                    goTo(arrivalFor(r.id));
                    onClose();
                  }}
                >
                  Go<span className="visually-hidden"> to {r.name}</span>
                </button>
              </div>
              {ex && <p className="small soft" style={{ margin: 0 }}>{ex.title}</p>}
              {works.length > 0 && (
                <ul>
                  {works.map((w) => {
                    const v = viewpointFor(w);
                    return (
                      <li key={w.id}>
                        <span>{w.title}</span>
                        <span style={{ display: "flex", gap: 12 }}>
                          {v && (
                            <button
                              type="button"
                              className="m-link"
                              onClick={() => {
                                goTo(v);
                                onClose();
                              }}
                            >
                              View<span className="visually-hidden"> {w.title}</span>
                            </button>
                          )}
                          <button type="button" className="m-link" onClick={() => openArtwork(w.id)}>
                            About<span className="visually-hidden"> {w.title}</span>
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      <button type="button" className="m-btn m-panel__close" onClick={onClose} aria-label="Close directory">
        ✕
      </button>
    </aside>
  );
}
