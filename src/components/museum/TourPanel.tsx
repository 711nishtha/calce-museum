"use client";

import { useEffect } from "react";
import { roomById } from "@/architecture/floorplan";
import { tourStops } from "@/content/tour";
import { useMuseum } from "@/three/state/museumStore";

/** Guided tour: narration for each stop; moving to a stop glides or fades the camera there. */
export function TourPanel({ onExit }: { onExit: () => void }) {
  const index = useMuseum((s) => s.tourIndex);
  const setIndex = useMuseum((s) => s.setTourIndex);
  const goTo = useMuseum((s) => s.goTo);
  const openArtwork = useMuseum((s) => s.openArtwork);
  const stop = tourStops[index]!;

  useEffect(() => {
    goTo({ position: stop.position, lookAt: stop.target });
  }, [stop, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (useMuseum.getState().panel !== "none") return;
      if (e.code === "KeyN" && index < tourStops.length - 1) setIndex(index + 1);
      if (e.code === "KeyB" && index > 0) setIndex(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, setIndex]);

  return (
    <section className="m-panel m-tour" aria-labelledby="m-tour-title" aria-live="polite">
      <div className="m-tour__progress" aria-hidden="true">
        {tourStops.map((s, i) => (
          <span key={s.id} data-done={i <= index} />
        ))}
      </div>
      <div className="m-tour__head">
        <h2 id="m-tour-title" className="h3">
          {stop.title}
        </h2>
        <span className="small soft">
          Stop {index + 1} of {tourStops.length} · {roomById(stop.room).name}
        </span>
      </div>
      <p className="m-tour__narration">{stop.narration}</p>
      <div className="btn-row" style={{ justifyContent: "space-between" }}>
        <div className="btn-row">
          <button type="button" className="m-btn" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            ← Previous <kbd>B</kbd>
          </button>
          {index < tourStops.length - 1 ? (
            <button type="button" className="m-btn m-btn--primary" onClick={() => setIndex(index + 1)}>
              Next stop <kbd>N</kbd>
            </button>
          ) : (
            <button type="button" className="m-btn m-btn--primary" onClick={onExit}>
              Finish and explore freely
            </button>
          )}
        </div>
        <div className="btn-row">
          {stop.artworkId && (
            <button type="button" className="m-btn" onClick={() => openArtwork(stop.artworkId!)}>
              About the work
            </button>
          )}
          <button type="button" className="m-btn" onClick={onExit}>
            Leave tour
          </button>
        </div>
      </div>
    </section>
  );
}
