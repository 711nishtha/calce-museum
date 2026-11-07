/** Registry of downloadable identity assets, served from /media/identity/[id]. */
import { exhibitions } from "@/content/exhibitions";
import { products } from "@/content/shop";
import { atriumWayfinding, brochureSvg, catalogueSvg, gallerySignSvg, logoSvg, posterSvg, socialSvg, ticketSvg, wayfindingSvg } from "./identity";
import { mapSvg } from "./map-svg";
import { productMockupSvg } from "./merch-svg";

export type AssetCategory = "Logo" | "Poster" | "Catalogue" | "Signage" | "Ticket" | "Map" | "Brochure" | "Social" | "Merchandise";

export interface IdentityAsset {
  id: string;
  title: string;
  category: AssetCategory;
  spec: string;
  render: () => string;
}

export const SAMPLE_TICKET = {
  reference: "CAL-SAMP-LE26",
  date: "Thursday 12 November 2026",
  slot: "18:30",
  admits: "Admits 2 · Adult ×1, Reduced ×1 · Guided tour",
  name: "Sample visitor",
  demo: true,
};

export const identityAssets: IdentityAsset[] = [
  { id: "logo-primary", title: "Primary lockup", category: "Logo", spec: "Horizontal · ivory ground", render: () => logoSvg("primary") },
  { id: "logo-reversed", title: "Reversed lockup", category: "Logo", spec: "Horizontal · walnut ground", render: () => logoSvg("reversed") },
  { id: "logo-stacked", title: "Stacked lockup", category: "Logo", spec: "For square formats", render: () => logoSvg("stacked") },
  { id: "logo-mark", title: "Arch mark", category: "Logo", spec: "Favicon, stamps, small use", render: () => logoSvg("mark") },
  ...exhibitions.map((ex) => ({ id: `poster-${ex.id}`, title: `${ex.title} — poster`, category: "Poster" as const, spec: "A2 · 420 × 594 mm", render: () => posterSvg(ex, "arch") })),
  ...exhibitions.map((ex) => ({ id: `poster-type-${ex.id}`, title: `${ex.title} — type poster`, category: "Poster" as const, spec: "A2 · 420 × 594 mm", render: () => posterSvg(ex, "type") })),
  ...exhibitions.map((ex) => ({ id: `catalogue-${ex.id}`, title: `${ex.title} — catalogue cover`, category: "Catalogue" as const, spec: "210 × 270 mm", render: () => catalogueSvg(ex) })),
  ...exhibitions.map((ex) => ({ id: `sign-${ex.id}`, title: `Gallery ${ex.number} entrance sign`, category: "Signage" as const, spec: "600 × 900 mm · limestone panel", render: () => gallerySignSvg(ex) })),
  { id: "wayfinding-atrium", title: "Atrium wayfinding", category: "Signage", spec: "900 mm wide · walnut panel", render: () => wayfindingSvg(atriumWayfinding) },
  { id: "ticket-sample", title: "Timed-entry ticket", category: "Ticket", spec: "200 × 80 mm · print-at-home and mobile", render: () => ticketSvg(SAMPLE_TICKET) },
  { id: "visitor-map", title: "Visitor map", category: "Map", spec: "Generated from the building plan", render: () => mapSvg({ tour: false, works: true }) },
  { id: "brochure-outside", title: "Season brochure — outside", category: "Brochure", spec: "A4 trifold · 297 × 210 mm", render: () => brochureSvg("outside") },
  { id: "brochure-inside", title: "Season brochure — inside", category: "Brochure", spec: "A4 trifold · 297 × 210 mm", render: () => brochureSvg("inside") },
  ...exhibitions.map((ex) => ({ id: `social-square-${ex.id}`, title: `${ex.title} — feed`, category: "Social" as const, spec: "1080 × 1080 px", render: () => socialSvg(ex, "square") })),
  ...exhibitions.slice(0, 2).map((ex) => ({ id: `social-story-${ex.id}`, title: `${ex.title} — story`, category: "Social" as const, spec: "1080 × 1920 px", render: () => socialSvg(ex, "story") })),
  ...products.map((p) => ({ id: `merch-${p.id}`, title: p.name, category: "Merchandise" as const, spec: p.details, render: () => productMockupSvg(p) })),
];

export function getAsset(id: string): IdentityAsset | undefined {
  return identityAssets.find((a) => a.id === id);
}
