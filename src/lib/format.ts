import type { Exhibition, UpcomingExhibition } from "@/content/types";

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const full = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function parseISODate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function formatDate(iso: string): string {
  return full.format(parseISODate(iso));
}

export function formatLongDate(iso: string): string {
  return weekday.format(parseISODate(iso));
}

export function formatRange(opens: string, closes: string): string {
  const a = parseISODate(opens);
  const b = parseISODate(closes);
  const sameYear = a.getUTCFullYear() === b.getUTCFullYear();
  return `${dayMonth.format(a)}${sameYear ? "" : ` ${a.getUTCFullYear()}`} – ${dayMonth.format(b)} ${b.getUTCFullYear()}`;
}

export function formatPrice(euros: number): string {
  return euros === 0 ? "Free" : `€${euros.toFixed(euros % 1 === 0 ? 0 : 2)}`;
}

export type ExhibitionStatus = "current" | "upcoming" | "past";

export function exhibitionStatus(ex: Pick<Exhibition | UpcomingExhibition, "opens" | "closes">, today: Date = new Date()): ExhibitionStatus {
  const t = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (t < parseISODate(ex.opens).getTime()) return "upcoming";
  if (t > parseISODate(ex.closes).getTime()) return "past";
  return "current";
}

export function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function mediumLabel(m: string): string {
  return m.charAt(0).toUpperCase() + m.slice(1);
}
