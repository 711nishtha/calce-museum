import { describe, expect, it } from "vitest";
import { roomById } from "@/architecture/floorplan";
import { artists, getArtist } from "@/content/artists";
import { artworks, artworksByExhibition } from "@/content/artworks";
import { exhibitions } from "@/content/exhibitions";
import { articles } from "@/content/journal";
import { products } from "@/content/shop";
import { tourStops } from "@/content/tour";
import { artworkSvg } from "@/graphics/artwork-svg";
import { identityAssets } from "@/graphics/assets";

const unique = (xs: string[]) => new Set(xs).size === xs.length;

describe("content integrity", () => {
  it("uses unique ids everywhere", () => {
    expect(unique(artworks.map((a) => a.id))).toBe(true);
    expect(unique(artworks.map((a) => a.accession))).toBe(true);
    expect(unique(artists.map((a) => a.id))).toBe(true);
    expect(unique(exhibitions.map((e) => e.id))).toBe(true);
    expect(unique(articles.map((a) => a.slug))).toBe(true);
    expect(unique(products.map((p) => p.id))).toBe(true);
    expect(unique(identityAssets.map((a) => a.id))).toBe(true);
  });

  it("covers the four required media with at least four works each", () => {
    for (const m of ["sculpture", "painting", "photography", "installation"] as const) {
      const ex = exhibitions.filter((e) => e.medium === m);
      expect(ex.length, m).toBeGreaterThanOrEqual(1);
      expect(artworksByExhibition(ex[0]!.id).length, m).toBeGreaterThanOrEqual(4);
    }
  });

  it("links every artwork to a real artist and, if any, a real exhibition shown in its room", () => {
    for (const w of artworks) {
      expect(getArtist(w.artistId), w.id).toBeDefined();
      if (w.exhibitionId) {
        const ex = exhibitions.find((e) => e.id === w.exhibitionId);
        expect(ex, w.id).toBeDefined();
        if (w.placement.type !== "storage") expect(w.placement.room, w.id).toBe(ex!.room);
      }
    }
  });

  it("gives every artist at least one work and a full profile", () => {
    for (const a of artists) {
      expect(artworks.some((w) => w.artistId === a.id), a.id).toBe(true);
      expect(a.bio.length).toBeGreaterThanOrEqual(2);
      // fictional contemporaries carry a quote; historical masters are never given invented ones
      if (a.died) expect(a.quote).toBeUndefined();
      else expect(a.quote?.length ?? 0).toBeGreaterThan(10);
    }
  });

  it("assigns each exhibition to a gallery room that knows about it", () => {
    for (const e of exhibitions) {
      expect(roomById(e.room).exhibitionId).toBe(e.id);
      expect(e.statement.length).toBeGreaterThanOrEqual(3);
      expect(e.opens < e.closes).toBe(true);
    }
  });

  it("only references real artworks in the tour and shop", () => {
    for (const s of tourStops) if (s.artworkId) expect(artworks.some((a) => a.id === s.artworkId), s.id).toBe(true);
    for (const p of products) if (p.exhibitionId) expect(exhibitions.some((e) => e.id === p.exhibitionId), p.id).toBe(true);
  });

  it("contains no placeholder text", () => {
    const blob = JSON.stringify({ artworks, artists, exhibitions, articles, products, tourStops });
    expect(blob).not.toMatch(/lorem|ipsum|placeholder|TODO|TBD/i);
  });
});

describe("generated imagery", () => {
  it("renders a well-formed, deterministic SVG for every original artwork", () => {
    for (const w of artworks.filter((a) => a.visual.kind !== "image")) {
      const a = artworkSvg(w);
      expect(a.startsWith("<svg"), w.id).toBe(true);
      expect(a.endsWith("</svg>"), w.id).toBe(true);
      expect(a).not.toMatch(/NaN|undefined/);
      expect(artworkSvg(w)).toBe(a);
      expect(a.length, w.id).toBeLessThan(250_000);
    }
  });

  it("renders every identity asset without errors", () => {
    for (const asset of identityAssets) {
      const s = asset.render();
      expect(s.startsWith("<svg"), asset.id).toBe(true);
      expect(s).not.toMatch(/NaN|undefined/);
    }
  });
});

describe("reproductions", () => {
  it("credits every reproduction and ships its image", async () => {
    const { existsSync } = await import("node:fs");
    const repro = artworks.filter((a) => a.visual.kind === "image");
    expect(repro.length).toBeGreaterThanOrEqual(12);
    for (const w of repro) {
      if (w.visual.kind !== "image") continue;
      expect(existsSync(`public/paintings/${w.visual.file}`), w.id).toBe(true);
      expect(w.visual.source, w.id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(w.visual.holder.length, w.id).toBeGreaterThan(3);
      expect(w.materials, w.id).toMatch(/reproduction/);
      expect(exhibitions.find((e) => e.id === w.exhibitionId)?.reproductions, w.id).toBe(true);
      expect(getArtist(w.artistId)?.died, w.id).toBeDefined();
    }
  });
});

describe("3D renders on the website", () => {
  it("ships an image for every room the website shows as a render", async () => {
    const { existsSync } = await import("node:fs");
    const { roomView } = await import("@/lib/views");
    const { rooms } = await import("@/architecture/floorplan");
    const shown = rooms.map((r) => roomView(r.id)).filter((v): v is string => !!v);
    expect(shown.length).toBeGreaterThanOrEqual(6);
    for (const v of shown) expect(existsSync(`public${v}`), v).toBe(true);
    for (const e of exhibitions) expect(roomView(e.room), e.id).toBeDefined();
  });
});
