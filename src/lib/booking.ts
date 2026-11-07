/**
 * Ticket booking — a functional demonstration. Prices, slots and validation are real
 * logic; capacity is simulated deterministically and no payment is taken.
 */
import { hours } from "@/content/visit";

export type TicketTypeId = "adult" | "reduced" | "youth" | "member" | "companion";

export interface TicketType {
  id: TicketTypeId;
  label: string;
  note: string;
  price: number;
}

export const ticketTypes: TicketType[] = [
  { id: "adult", label: "Adult", note: "", price: 16 },
  { id: "reduced", label: "Reduced", note: "Students, over 65s, unemployed — ID at entry", price: 11 },
  { id: "youth", label: "Under 18", note: "Under 12s with an adult", price: 0 },
  { id: "member", label: "Member", note: "Friends of CALCE — card at entry", price: 0 },
  { id: "companion", label: "Companion", note: "Accompanying a disabled visitor", price: 0 },
];

export const GUIDED_TOUR_PRICE = 8;
export const GUIDED_TOUR_SLOTS = ["11:00", "15:00"] as const;
export const MAX_TICKETS = 10;
export const SLOT_CAPACITY = 40;

export type Quantities = Record<TicketTypeId, number>;

export interface BookingDraft {
  date: string | null; // YYYY-MM-DD
  slot: string | null; // HH:MM
  quantities: Quantities;
  guidedTour: number;
  name: string;
  email: string;
  accessNeeds: string;
}

export interface Booking extends Omit<BookingDraft, "date" | "slot"> {
  date: string;
  slot: string;
  reference: string;
  total: number;
  createdAt: string;
}

export const emptyQuantities = (): Quantities => ({ adult: 0, reduced: 0, youth: 0, member: 0, companion: 0 });

export const emptyDraft = (): BookingDraft => ({
  date: null,
  slot: null,
  quantities: emptyQuantities(),
  guidedTour: 0,
  name: "",
  email: "",
  accessNeeds: "",
});

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function weekdayIndexMondayFirst(iso: string): number {
  const d = new Date(`${iso}T12:00:00Z`);
  return (d.getUTCDay() + 6) % 7; // Monday = 0
}

export function hoursFor(iso: string) {
  return hours[weekdayIndexMondayFirst(iso)]!;
}

export function isOpen(iso: string): boolean {
  return hoursFor(iso).open !== null;
}

/** Bookable dates from `from` (inclusive) for `days` days, excluding closed days. */
export function bookableDates(from: Date, days = 35): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const iso = toISODate(d);
    if (isOpen(iso)) out.push(iso);
  }
  return out;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number) as [number, number];
  return h * 60 + m;
}

function fromMinutes(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/** Half-hourly entry slots; last entry 90 minutes before closing. */
export function timeSlots(iso: string): string[] {
  const h = hoursFor(iso);
  if (!h.open || !h.close) return [];
  const out: string[] = [];
  for (let t = toMinutes(h.open); t <= toMinutes(h.close) - 90; t += 30) out.push(fromMinutes(t));
  return out;
}

/** Deterministic simulated availability so the demo is stable across reloads. */
export function remainingCapacity(iso: string, slot: string): number {
  let h = 2166136261;
  for (const ch of `${iso}|${slot}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const r = (h >>> 0) % 100;
  if (r < 8) return 0;
  if (r < 25) return 1 + (r % 6);
  return SLOT_CAPACITY - (r % 18);
}

/** Guided tours leave at fixed times; a visitor joins the first one at or after their entry. */
export function tourTimeFor(slot: string | null): string | null {
  if (!slot) return null;
  return GUIDED_TOUR_SLOTS.find((t) => toMinutes(t) >= toMinutes(slot)) ?? null;
}

export function ticketCount(q: Quantities): number {
  return Object.values(q).reduce((a, b) => a + b, 0);
}

export function computeTotal(draft: Pick<BookingDraft, "quantities" | "guidedTour">): number {
  const tickets = ticketTypes.reduce((sum, t) => sum + t.price * draft.quantities[t.id], 0);
  return tickets + draft.guidedTour * GUIDED_TOUR_PRICE;
}

export type BookingErrors = Partial<Record<"date" | "slot" | "tickets" | "guidedTour" | "name" | "email", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateSelection(d: BookingDraft): BookingErrors {
  const e: BookingErrors = {};
  if (!d.date) e.date = "Choose a date for your visit.";
  else if (!isOpen(d.date)) e.date = "The museum is closed on Mondays.";
  if (!d.slot) e.slot = "Choose an entry time.";
  else if (d.date && !timeSlots(d.date).includes(d.slot)) e.slot = "That entry time is not available on this date.";
  const n = ticketCount(d.quantities);
  if (n === 0) e.tickets = "Add at least one ticket.";
  else if (n > MAX_TICKETS) e.tickets = `Online bookings are limited to ${MAX_TICKETS} tickets. For groups, please contact us.`;
  else if (d.quantities.companion > 0 && n - d.quantities.companion === 0) e.tickets = "A companion ticket must accompany another ticket.";
  else if (d.quantities.youth > 0 && n === d.quantities.youth) e.tickets = "Visitors under 18 should book alongside an adult, reduced, member or companion ticket.";
  else if (d.date && d.slot && n > remainingCapacity(d.date, d.slot)) e.tickets = "Not enough places remain at this time. Please choose another.";
  if (d.guidedTour > n) e.guidedTour = "Guided tour places cannot exceed the number of tickets.";
  else if (d.guidedTour > 0 && d.slot && !tourTimeFor(d.slot)) e.guidedTour = "The last guided tour leaves at 15:00. Choose an earlier entry to join it.";
  return e;
}

export function validateDetails(d: BookingDraft): BookingErrors {
  const e: BookingErrors = {};
  if (d.name.trim().length < 2) e.name = "Enter the name for the booking.";
  if (!EMAIL.test(d.email.trim())) e.email = "Enter a valid email address, for example name@example.com.";
  return e;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Reference such as CAL-7KQ2-M9XD; `random` is injectable for tests. */
export function bookingReference(random: () => number = Math.random): string {
  const pick = () => ALPHABET[Math.floor(random() * ALPHABET.length)]!;
  const block = () => Array.from({ length: 4 }, pick).join("");
  return `CAL-${block()}-${block()}`;
}

export function finaliseBooking(d: BookingDraft, random?: () => number, now: Date = new Date()): Booking {
  const errors = { ...validateSelection(d), ...validateDetails(d) };
  if (Object.keys(errors).length) throw new Error(`Invalid booking: ${Object.values(errors).join(" ")}`);
  return {
    ...d,
    date: d.date!,
    slot: d.slot!,
    name: d.name.trim(),
    email: d.email.trim(),
    total: computeTotal(d),
    reference: bookingReference(random),
    createdAt: now.toISOString(),
  };
}

export const BOOKING_STORAGE_KEY = "calce.booking";
