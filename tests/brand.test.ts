import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, palette, support } from "@/lib/brand";
import { filterArtworks } from "@/lib/collection";
import { artworks } from "@/content/artworks";
import { exhibitionStatus, formatRange } from "@/lib/format";

describe("colour tokens", () => {
  it("mirrors the TypeScript palette in tokens.css", () => {
    const css = readFileSync("src/styles/tokens.css", "utf8").toLowerCase();
    for (const [name, hex] of Object.entries({ ...palette })) expect(css, name).toContain(hex.toLowerCase());
    for (const hex of Object.values(support)) expect(css).toContain(hex.toLowerCase());
  });

  it("meets WCAG AA for text pairs used in the interface", () => {
    const pairs: [string, string, number][] = [
      [support.ink, palette.ivory, 4.5],
      [support.ink, palette.limestone, 4.5],
      [support.inkSoft, palette.ivory, 4.5],
      [support.inkSoft, palette.limestone, 4.5],
      [support.terracottaDeep, palette.ivory, 4.5],
      [palette.ivory, support.terracottaDeep, 4.5],
      [palette.ivory, palette.walnut, 4.5],
      [palette.limestone, support.night, 4.5],
      [palette.sand, palette.walnut, 3],
      [palette.terracotta, palette.ivory, 3], // large display numerals only
    ];
    for (const [fg, bg, min] of pairs) expect(contrastRatio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(min);
  });
});

describe("format and collection helpers", () => {
  it("formats exhibition ranges across years", () => {
    expect(formatRange("2026-09-12", "2027-01-17")).toBe("12 Sept 2026 – 17 Jan 2027");
    expect(formatRange("2027-03-13", "2027-07-25")).toBe("13 Mar – 25 Jul 2027");
  });

  it("derives exhibition status from dates", () => {
    const ex = { opens: "2026-10-01", closes: "2026-12-01" };
    expect(exhibitionStatus(ex, new Date("2026-09-01"))).toBe("upcoming");
    expect(exhibitionStatus(ex, new Date("2026-11-03"))).toBe("current");
    expect(exhibitionStatus(ex, new Date("2027-01-01"))).toBe("past");
  });

  it("filters the collection by medium, exhibition and query", () => {
    expect(filterArtworks(artworks, { medium: "photography", exhibition: "all", query: "", sort: "gallery" }).every((w) => w.medium === "photography")).toBe(true);
    expect(filterArtworks(artworks, { medium: "all", exhibition: "collection", query: "", sort: "gallery" }).length).toBe(3);
    expect(filterArtworks(artworks, { medium: "all", exhibition: "all", query: "ferhat", sort: "title" }).length).toBe(4);
    expect(filterArtworks(artworks, { medium: "all", exhibition: "all", query: "zzz", sort: "gallery" })).toEqual([]);
  });
});
