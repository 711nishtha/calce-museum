import type { Metadata } from "next";
import Link from "next/link";
import { MapExplorer } from "@/components/site/MapExplorer";
import { PageHead } from "@/components/ui/PageHead";
import { getArtwork } from "@/content/artworks";
import { tourStops } from "@/content/tour";
import { roomById } from "@/architecture/floorplan";
import { mapSvg } from "@/graphics/map-svg";
import { identityAssetUrl } from "@/lib/paths";

export const metadata: Metadata = { title: "Map & guided tour", description: "The plan of CALCE and a guided tour through every gallery." };

export default function MapPage() {
  return (
    <>
      <PageHead eyebrow="Map & guided tour" title="Finding your way" lede="One level, step-free throughout. Every gallery opens from the atrium; the Long Room is reached through Gallery III.">
        <div className="btn-row mt-6">
          <Link href="/museum?tour=1" className="btn btn--primary">
            Take the tour in 3D
          </Link>
          <a href={identityAssetUrl("visitor-map")} className="btn" download="calce-visitor-map.svg">
            Download the map (SVG)
          </a>
        </div>
      </PageHead>
      <section className="section section--tight">
        <div className="container">
          <MapExplorer svg={mapSvg({ tour: true, works: true })} />
        </div>
      </section>
      <section className="section section--plaster" aria-labelledby="tour">
        <div className="container split">
          <div className="sticky">
            <span className="eyebrow">About 60 minutes</span>
            <h2 id="tour" className="h2">
              The guided tour
            </h2>
            <p className="mt-4" style={{ maxWidth: "36ch" }}>
              {tourStops.length} stops from the forecourt, through the Royal Salon, to the darkened chamber. In the building, tours leave reception at 11:00 and 15:00. Online, the 3D museum walks you from stop to stop.
            </p>
            <Link href="/museum?tour=1" className="text-link mt-4">
              Start the tour in 3D
            </Link>
          </div>
          <ol className="tour-list">
            {tourStops.map((s) => {
              const work = s.artworkId ? getArtwork(s.artworkId) : undefined;
              return (
                <li key={s.id}>
                  <div>
                    <span className="eyebrow">{roomById(s.room).name}</span>
                    <h3 className="h3">{s.title}</h3>
                    <p className="mt-4" style={{ maxWidth: "60ch" }}>
                      {s.narration}
                    </p>
                    {work && (
                      <Link href={`/collection/${work.id}`} className="text-link">
                        {work.title}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </>
  );
}
