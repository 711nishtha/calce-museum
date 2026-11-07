"use client";

import { artworks } from "@/content/artworks";
import { Installation } from "./Installations";
import { Sculpture } from "./Sculpture";
import { WallArtwork } from "./WallArtwork";

/** Hangs and places every artwork from the shared content data. */
export function Artworks() {
  return (
    <group>
      {artworks.map((w) => {
        if (w.placement.type === "storage") return null;
        if (w.visual.kind === "installation") return <Installation key={w.id} work={w} />;
        if (w.placement.type === "floor") return <Sculpture key={w.id} work={w} />;
        return <WallArtwork key={w.id} work={w} />;
      })}
    </group>
  );
}
