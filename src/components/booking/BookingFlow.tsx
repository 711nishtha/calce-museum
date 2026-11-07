"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BOOKING_STORAGE_KEY,
  GUIDED_TOUR_PRICE,
  MAX_TICKETS,
  bookableDates,
  computeTotal,
  emptyDraft,
  finaliseBooking,
  remainingCapacity,
  ticketCount,
  ticketTypes,
  timeSlots,
  toISODate,
  tourTimeFor,
  validateDetails,
  validateSelection,
  type BookingDraft,
  type BookingErrors,
  type TicketTypeId,
} from "@/lib/booking";
import { formatLongDate, formatPrice } from "@/lib/format";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const secureRandom = () => crypto.getRandomValues(new Uint32Array(1))[0]! / 2 ** 32;

function Calendar({ value, onChange, today }: { value: string | null; onChange: (iso: string) => void; today: Date }) {
  const open = useMemo(() => new Set(bookableDates(today, 35)), [today]);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const monthLabel = (d: Date) => d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const firstMonth = monthLabel(days[0]!);
  const lastMonth = monthLabel(days[days.length - 1]!);
  return (
    <div>
      <p className="h4" aria-hidden="true" style={{ marginBottom: "var(--space-3)" }}>
        {firstMonth === lastMonth ? firstMonth : `${firstMonth} – ${lastMonth}`}
      </p>
      <div className="calendar" role="group" aria-label="Choose a date">
        {DOW.map((d) => (
          <span key={d} className="calendar__dow" aria-hidden="true">
            {d}
          </span>
        ))}
        {days.map((d) => {
          const iso = toISODate(d);
          const available = open.has(iso);
          const isMonday = d.getDay() === 1;
          return (
            <button
              key={iso}
              type="button"
              className="calendar__day"
              disabled={!available}
              aria-pressed={value === iso}
              aria-label={`${formatLongDate(iso)}${available ? "" : isMonday ? ", closed" : ", not available"}`}
              onClick={() => onChange(iso)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <p className="small soft mt-4">Closed on Mondays. Bookings open five weeks ahead.</p>
    </div>
  );
}

function Qty({ label, value, onStep, min = 0, max }: { label: string; value: number; onStep: (delta: 1 | -1) => void; min?: number; max: number }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onStep(-1)} disabled={value <= min} aria-label={`Remove one ${label}`}>
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onStep(1)} disabled={value >= max} aria-label={`Add one ${label}`}>
        +
      </button>
    </div>
  );
}

export function BookingFlow() {
  const router = useRouter();
  const [today, setToday] = useState<Date | null>(null);
  const [draft, setDraft] = useState<BookingDraft>(emptyDraft);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => setToday(new Date()), []);

  const n = ticketCount(draft.quantities);
  const total = computeTotal(draft);
  const slots = draft.date ? timeSlots(draft.date) : [];
  const tourTime = tourTimeFor(draft.slot);
  const update = (patch: Partial<BookingDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const stepQty = (id: TicketTypeId, delta: number) =>
    setDraft((d) => {
      const next = Math.max(0, d.quantities[id] + delta);
      if (delta > 0 && ticketCount(d.quantities) >= MAX_TICKETS) return d;
      const quantities = { ...d.quantities, [id]: next };
      return { ...d, quantities, guidedTour: Math.min(d.guidedTour, ticketCount(quantities)) };
    });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const all = { ...validateSelection(draft), ...validateDetails(draft) };
    setErrors(all);
    if (Object.keys(all).length) {
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setSubmitting(true);
    try {
      const booking = finaliseBooking(draft, secureRandom);
      sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(booking));
      router.push("/tickets/confirmation");
    } catch {
      setSubmitting(false);
      setErrors({ tickets: "Something went wrong preparing your booking. Please try again." });
    }
  }

  const errorList = Object.entries(errors).filter(([, v]) => v);

  return (
    <form className="booking" onSubmit={submit} noValidate>
      <div>
        {errorList.length > 0 && (
          <div ref={errorRef} tabIndex={-1} className="notice notice--warm" role="alert" style={{ marginBottom: "var(--space-6)" }}>
            <p style={{ fontWeight: 600 }}>Please check the following:</p>
            <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
              {errorList.map(([k, v]) => (
                <li key={k}>
                  <a href={`#step-${k === "slot" ? "time" : k === "name" || k === "email" ? "details" : k === "guidedTour" ? "tickets" : k}`}>{v}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <fieldset className="booking-step" id="step-date">
          <legend className="booking-step__head">
            <span className="booking-step__num">1</span>
            <span className="h3">Date</span>
          </legend>
          <div className="booking-step__body">
            {today ? <Calendar value={draft.date} today={today} onChange={(iso) => update({ date: iso, slot: null })} /> : <p className="soft">Loading available dates…</p>}
            {errors.date && <p className="error mt-4">{errors.date}</p>}
          </div>
        </fieldset>

        <fieldset className="booking-step" id="step-time">
          <legend className="booking-step__head">
            <span className="booking-step__num">2</span>
            <span className="h3">Entry time</span>
          </legend>
          <div className="booking-step__body">
            {!draft.date ? (
              <p className="soft">Choose a date to see entry times.</p>
            ) : (
              <div className="slot-grid" role="group" aria-label={`Entry times on ${formatLongDate(draft.date)}`}>
                {slots.map((s) => {
                  const past = today !== null && draft.date === toISODate(today) && s <= `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;
                  const left = past ? 0 : remainingCapacity(draft.date!, s);
                  return (
                    <button key={s} type="button" className="slot" disabled={left === 0} aria-pressed={draft.slot === s} onClick={() => update({ slot: s })}>
                      <span>{s}</span>
                      <small>{past ? "Passed" : left === 0 ? "Full" : left < 8 ? `${left} left` : "Available"}</small>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.slot && <p className="error mt-4">{errors.slot}</p>}
          </div>
        </fieldset>

        <fieldset className="booking-step" id="step-tickets">
          <legend className="booking-step__head">
            <span className="booking-step__num">3</span>
            <span className="h3">Tickets</span>
          </legend>
          <div className="booking-step__body">
            {ticketTypes.map((t) => (
              <div key={t.id} className="qty-row">
                <div>
                  <span className="h4">{t.label}</span> <span className="soft">· {formatPrice(t.price)}</span>
                  {t.note && <p className="small soft" style={{ margin: 0 }}>{t.note}</p>}
                </div>
                <Qty label={`${t.label} ticket`} value={draft.quantities[t.id]} max={MAX_TICKETS - n + draft.quantities[t.id]} onStep={(delta) => stepQty(t.id, delta)} />
              </div>
            ))}
            <div className="qty-row">
              <div>
                <span className="h4">Guided tour</span> <span className="soft">· +{formatPrice(GUIDED_TOUR_PRICE)} per person</span>
                <p className="small soft" style={{ margin: 0 }}>
                  {!draft.slot ? "Tours leave reception at 11:00 and 15:00." : tourTime ? `You would join the ${tourTime} tour.` : "No tour leaves after this entry time."}
                </p>
              </div>
              <Qty label="guided tour place" value={draft.guidedTour} max={draft.slot && !tourTime ? 0 : n} onStep={(delta) => setDraft((d) => ({ ...d, guidedTour: Math.max(0, Math.min(ticketCount(d.quantities), d.guidedTour + delta)) }))} />
            </div>
            {errors.tickets && <p className="error mt-4">{errors.tickets}</p>}
            {errors.guidedTour && <p className="error mt-4">{errors.guidedTour}</p>}
          </div>
        </fieldset>

        <fieldset className="booking-step" id="step-details">
          <legend className="booking-step__head">
            <span className="booking-step__num">4</span>
            <span className="h3">Your details</span>
          </legend>
          <div className="booking-step__body stack" style={{ maxWidth: 520 }}>
            <div className="field">
              <label htmlFor="b-name">Name for the booking</label>
              <input id="b-name" className="input" autoComplete="name" value={draft.name} aria-invalid={!!errors.name} aria-describedby={errors.name ? "b-name-err" : undefined} onChange={(e) => update({ name: e.target.value })} />
              {errors.name && <p id="b-name-err" className="error">{errors.name}</p>}
            </div>
            <div className="field">
              <label htmlFor="b-email">Email</label>
              <input id="b-email" className="input" type="email" autoComplete="email" inputMode="email" value={draft.email} aria-invalid={!!errors.email} aria-describedby={errors.email ? "b-email-err" : "b-email-hint"} onChange={(e) => update({ email: e.target.value })} />
              {errors.email ? <p id="b-email-err" className="error">{errors.email}</p> : <p id="b-email-hint" className="small soft" style={{ margin: 0 }}>In this demonstration nothing is sent.</p>}
            </div>
            <div className="field">
              <label htmlFor="b-access">Access requirements (optional)</label>
              <textarea id="b-access" className="textarea" value={draft.accessNeeds} onChange={(e) => update({ accessNeeds: e.target.value })} />
            </div>
          </div>
        </fieldset>
      </div>

      <aside className="summary" aria-labelledby="summary-title">
        <h2 id="summary-title" className="h3">
          Your visit
        </h2>
        <div className="mt-4">
          <div className="summary__line">
            <span>Date</span>
            <span>{draft.date ? formatLongDate(draft.date) : "—"}</span>
          </div>
          <div className="summary__line">
            <span>Entry</span>
            <span>{draft.slot ?? "—"}</span>
          </div>
          {ticketTypes
            .filter((t) => draft.quantities[t.id] > 0)
            .map((t) => (
              <div key={t.id} className="summary__line">
                <span>
                  {t.label} × {draft.quantities[t.id]}
                </span>
                <span>{formatPrice(t.price * draft.quantities[t.id])}</span>
              </div>
            ))}
          {draft.guidedTour > 0 && (
            <div className="summary__line">
              <span>
                Guided tour{tourTime ? ` ${tourTime}` : ""} × {draft.guidedTour}
              </span>
              <span>{formatPrice(GUIDED_TOUR_PRICE * draft.guidedTour)}</span>
            </div>
          )}
          <div className="summary__total" aria-live="polite">
            <span>Total</span>
            <span>€{total}</span>
          </div>
        </div>
        <button type="submit" className="btn btn--primary mt-6" style={{ width: "100%" }} disabled={submitting}>
          {submitting ? "Reserving…" : "Confirm reservation"}
        </button>
        <p className="small soft mt-4" style={{ marginBottom: 0 }}>
          This is a demonstration booking. No payment is taken and the confirmation is not valid for entry.
        </p>
      </aside>
    </form>
  );
}
