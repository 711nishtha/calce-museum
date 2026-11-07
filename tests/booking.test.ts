import { describe, expect, it } from "vitest";
import {
  bookableDates,
  bookingReference,
  computeTotal,
  emptyDraft,
  finaliseBooking,
  remainingCapacity,
  timeSlots,
  tourTimeFor,
  validateDetails,
  validateSelection,
  type BookingDraft,
} from "@/lib/booking";

// 2026-11-10 is a Tuesday, 2026-11-09 a Monday, 2026-11-12 a Thursday.
function findOpenSlot(date: string) {
  return timeSlots(date).find((s) => remainingCapacity(date, s) >= 10)!;
}

function draft(patch: Partial<BookingDraft> = {}): BookingDraft {
  const date = "2026-11-10";
  return { ...emptyDraft(), date, slot: findOpenSlot(date), name: "Ada Visitor", email: "ada@example.com", ...patch, quantities: { ...emptyDraft().quantities, adult: 2, ...patch.quantities } };
}

describe("dates and slots", () => {
  it("never offers Mondays", () => {
    const dates = bookableDates(new Date(2026, 10, 2), 14);
    expect(dates).not.toContain("2026-11-09");
    expect(dates).toContain("2026-11-10");
    expect(dates.length).toBe(12);
  });

  it("offers half-hourly slots until 90 minutes before closing, later on Thursdays", () => {
    expect(timeSlots("2026-11-10")[0]).toBe("10:00");
    expect(timeSlots("2026-11-10").at(-1)).toBe("16:30");
    expect(timeSlots("2026-11-12").at(-1)).toBe("19:30");
    expect(timeSlots("2026-11-09")).toEqual([]);
  });

  it("simulates capacity deterministically", () => {
    expect(remainingCapacity("2026-11-10", "10:00")).toBe(remainingCapacity("2026-11-10", "10:00"));
  });

  it("assigns the next guided tour after entry", () => {
    expect(tourTimeFor("10:30")).toBe("11:00");
    expect(tourTimeFor("11:00")).toBe("11:00");
    expect(tourTimeFor("14:00")).toBe("15:00");
    expect(tourTimeFor("16:00")).toBeNull();
  });
});

describe("pricing and validation", () => {
  it("totals tickets and tours", () => {
    const d = draft({ quantities: { adult: 2, reduced: 1, youth: 1, member: 0, companion: 0 }, guidedTour: 2 });
    expect(computeTotal(d)).toBe(16 * 2 + 11 + 0 + 8 * 2);
  });

  it("accepts a complete booking", () => {
    expect(validateSelection(draft())).toEqual({});
    expect(validateDetails(draft())).toEqual({});
  });

  it("rejects missing date, slot and tickets", () => {
    const e = validateSelection({ ...emptyDraft() });
    expect(Object.keys(e).sort()).toEqual(["date", "slot", "tickets"]);
  });

  it("rejects companion-only and under-18-only bookings", () => {
    expect(validateSelection(draft({ quantities: { adult: 0, reduced: 0, youth: 0, member: 0, companion: 1 } })).tickets).toMatch(/companion/i);
    expect(validateSelection(draft({ quantities: { adult: 0, reduced: 0, youth: 2, member: 0, companion: 0 } })).tickets).toMatch(/under 18/i);
  });

  it("rejects more tour places than tickets and late tours", () => {
    expect(validateSelection(draft({ guidedTour: 3 })).guidedTour).toBeDefined();
    expect(validateSelection(draft({ slot: "16:00", guidedTour: 1 })).guidedTour).toMatch(/15:00/);
  });

  it("validates contact details", () => {
    expect(validateDetails(draft({ email: "not-an-email" })).email).toBeDefined();
    expect(validateDetails(draft({ name: " " })).name).toBeDefined();
  });

  it("creates a reference and refuses invalid bookings", () => {
    let i = 0;
    const seq = () => (i++ % 10) / 10;
    expect(bookingReference(seq)).toMatch(/^CAL-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    const b = finaliseBooking(draft(), seq, new Date("2026-11-03T10:00:00Z"));
    expect(b.total).toBe(32);
    expect(() => finaliseBooking({ ...emptyDraft() })).toThrow();
  });
});
