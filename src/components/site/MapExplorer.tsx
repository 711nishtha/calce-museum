"use client";

import Link from "next/link";
import { useState } from "react";
import { galleryNumeral, rooms } from "@/architecture/floorplan";
import { InlineSvg } from "@/components/ui/InlineSvg";
import { getExhibition } from "@/content/exhibitions";
import type { RoomId } from "@/content/types";

const roomNotes: Partial<Record<RoomId, string>> = {
  forecourt: "Olive trees, bicycle racks and the main entrance. Accessible bays at the gate.",
  reception: "Tickets, information, cloakroom and wheelchairs.",
  shop: "Catalogues, prints and objects. Open without a ticket.",
  cafe: "Lunch, coffee and lemon cake. Garden tables April to October.",
  garden: "Three works from the permanent collection among olive trees.",
  atrium: "Day-lit drum with an olive tree and a ring of stone benches. All galleries open from here.",
};

/**
 * Interactive plan: choose a room in the list to highlight it on the map. The SVG is
 * rendered once on the server (with the tour layer) and restyled here with CSS.
 */
export function MapExplorer({ svg }: { svg: string }) {
  const [active, setActive] = useState<RoomId | null>(null);
  const [showTour, setShowTour] = useState(false);
  const listed = rooms.filter((r) => r.kind !== "passage");
  const activeRoom = rooms.find((r) => r.id === active);

  return (
    <div className="split">
      <div>
        <div className="btn-row" style={{ marginBottom: "var(--space-5)" }}>
          <button type="button" className="chip" aria-pressed={showTour} onClick={() => setShowTour((v) => !v)}>
            Show tour route
          </button>
        </div>
        <ul className="legend" aria-label="Rooms">
          {listed.map((r) => {
            const ex = r.exhibitionId ? getExhibition(r.exhibitionId) : undefined;
            return (
              <li key={r.id}>
                <button type="button" aria-pressed={active === r.id} onClick={() => setActive(active === r.id ? null : r.id)} onFocus={() => setActive(r.id)}>
                  <span className="h4" style={{ display: "block", fontStyle: active === r.id ? "italic" : "normal" }}>
                    {galleryNumeral[r.id] ? `${galleryNumeral[r.id]} · ` : ""}
                    {r.name}
                  </span>
                  <span className="small soft">{ex ? ex.title : roomNotes[r.id]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <figure className={`map-figure${showTour ? "" : " map-figure--no-tour"}`}>
          {active && <style>{`.map-figure [data-room="${active}"] { fill: #E9C9B4; }`}</style>}
          <InlineSvg svg={svg} label={`Plan of CALCE${activeRoom ? ` with ${activeRoom.name} highlighted` : ""}${showTour ? ", showing the guided tour route" : ""}.`} />
        </figure>
        <p className="small soft mt-4" aria-live="polite">
          {activeRoom ? (
            <>
              {activeRoom.name}.{" "}
              <Link href={`/museum?room=${activeRoom.id}`}>Go there in the 3D museum</Link>
            </>
          ) : (
            "Select a room to highlight it. Terracotta dots mark artworks."
          )}
        </p>
      </div>
    </div>
  );
}
