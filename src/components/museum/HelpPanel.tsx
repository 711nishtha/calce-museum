"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useMuseum } from "@/three/state/museumStore";

/** Controls, comfort settings and non-3D alternatives. Opened with H or ? (or the Help button). */
export function HelpPanel({ onClose }: { onClose: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduced = useMuseum((s) => s.reducedMotion);
  const setReduced = useMuseum((s) => s.setReducedMotion);
  const quality = useMuseum((s) => s.quality);
  const setQuality = useMuseum((s) => s.setQuality);

  useEffect(() => {
    headingRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside className="m-panel m-side" role="dialog" aria-modal="true" aria-labelledby="m-help-title">
      <h2 id="m-help-title" ref={headingRef} tabIndex={-1}>
        Help &amp; comfort
      </h2>

      <section className="m-room" aria-labelledby="m-help-keys">
        <h3 id="m-help-keys" className="h4">
          Keyboard — no mouse needed
        </h3>
        <dl className="m-keys" style={{ margin: "var(--space-3) 0 0" }}>
          <dt>↑ ↓ or W S</dt>
          <dd>Walk forward and back</dd>
          <dt>← →</dt>
          <dd>Turn (A D step sideways)</dd>
          <dt>Shift</dt>
          <dd>Walk faster</dd>
          <dt>E or Enter</dt>
          <dd>Read about the work in front of you</dd>
          <dt>G</dt>
          <dd>Directory: where you are, ways on, every room and work</dd>
          <dt>T, then N / B</dt>
          <dd>Guided tour: next and previous stop</dd>
          <dt>M</dt>
          <dd>Show or hide the map</dd>
          <dt>H or ?</dt>
          <dd>This panel</dd>
          <dt>Esc</dt>
          <dd>Close a panel; release the mouse</dd>
        </dl>
        <p className="small soft">
          With a screen reader, use the Directory and the guided tour: room changes, arrivals and the work in front of you are announced.
        </p>
      </section>

      <section className="m-room" aria-labelledby="m-help-comfort">
        <h3 id="m-help-comfort" className="h4">
          Comfort
        </h3>
        <div className="btn-row" style={{ marginTop: "var(--space-3)" }}>
          <button type="button" className="m-btn" aria-pressed={reduced} onClick={() => setReduced(!reduced)}>
            Reduce motion: {reduced ? "on" : "off"}
          </button>
          <button type="button" className="m-btn" aria-pressed={quality === "balanced"} onClick={() => setQuality(quality === "high" ? "balanced" : "high")}>
            Lighter graphics: {quality === "balanced" ? "on" : "off"}
          </button>
        </div>
        <p className="small soft">Reduce motion replaces glides with instant cuts and stills the swaying threads, breathing wall and head movement.</p>
      </section>

      <section className="m-room" aria-labelledby="m-help-alt">
        <h3 id="m-help-alt" className="h4">
          Without 3D
        </h3>
        <p className="small">Every room, work and tour stop is also on the website, with the same texts.</p>
        <div className="btn-row">
          <Link href="/map" className="m-btn">
            Map &amp; tour
          </Link>
          <Link href="/collection" className="m-btn">
            Collection
          </Link>
        </div>
      </section>

      <button type="button" className="m-btn m-panel__close" onClick={onClose} aria-label="Close help">
        ✕
      </button>
    </aside>
  );
}
