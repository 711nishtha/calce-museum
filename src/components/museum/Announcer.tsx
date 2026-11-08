"use client";

import { useEffect } from "react";
import { roomById } from "@/architecture/floorplan";
import { exitsFrom } from "@/architecture/navigation";
import { getArtist } from "@/content/artists";
import { artworks, getArtwork } from "@/content/artworks";
import { getExhibition } from "@/content/exhibitions";
import { useMuseum } from "@/three/state/museumStore";

/**
 * A visually hidden live region describing where the visitor is: entering a room
 * (with its exhibition, works and exits) and the work they are facing.
 */
export function Announcer() {
  const text = useMuseum((s) => s.announcement);

  useEffect(
    () =>
      useMuseum.subscribe((s, prev) => {
        if (s.mode === "intro") return;
        if (s.room !== prev.room && s.room) {
          const room = roomById(s.room);
          if (room.kind === "passage") return;
          const ex = room.exhibitionId ? getExhibition(room.exhibitionId) : undefined;
          const n = artworks.filter((w) => w.placement.type !== "storage" && w.placement.room === room.id).length;
          const exits = exitsFrom(room.id).map((e) => `${roomById(e.room).name} to the ${e.direction}`);
          s.announce(`${room.name}.${ex ? ` ${ex.title}.` : ""}${n ? ` ${n} ${n === 1 ? "work" : "works"}.` : ""} Ways on: ${exits.join("; ")}.`);
        } else if (s.focusedArtworkId !== prev.focusedArtworkId && s.focusedArtworkId && s.panel === "none") {
          const w = getArtwork(s.focusedArtworkId)!;
          s.announce(`In front of you: ${w.title}, ${getArtist(w.artistId)?.name}. Press E to read.`);
        }
      }),
    [],
  );

  return (
    <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
      {text}
    </p>
  );
}
