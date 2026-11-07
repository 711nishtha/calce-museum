"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { InlineSvg } from "@/components/ui/InlineSvg";
import { ticketSvg } from "@/graphics/identity";
import { BOOKING_STORAGE_KEY, GUIDED_TOUR_PRICE, ticketTypes, tourTimeFor, type Booking } from "@/lib/booking";
import { formatLongDate, formatPrice } from "@/lib/format";

function admits(b: Booking): string {
  const parts = ticketTypes.filter((t) => b.quantities[t.id] > 0).map((t) => `${t.label} ×${b.quantities[t.id]}`);
  const n = Object.values(b.quantities).reduce((a, c) => a + c, 0);
  return `Admits ${n} · ${parts.join(", ")}${b.guidedTour ? ` · Tour ${tourTimeFor(b.slot)} ×${b.guidedTour}` : ""}`;
}

export function BookingConfirmation() {
  const [state, setState] = useState<{ status: "loading" } | { status: "missing" } | { status: "ok"; booking: Booking }>({ status: "loading" });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(BOOKING_STORAGE_KEY);
      const booking = raw ? (JSON.parse(raw) as Booking) : null;
      setState(booking?.reference ? { status: "ok", booking } : { status: "missing" });
    } catch {
      setState({ status: "missing" });
    }
  }, []);

  if (state.status === "loading") return <p className="soft">Loading your booking…</p>;

  if (state.status === "missing")
    return (
      <div className="stack-lg" style={{ maxWidth: 640 }}>
        <h1 className="h1">No booking found</h1>
        <p>We couldn’t find a booking in this browser session. Confirmations are kept only until you close the tab.</p>
        <Link href="/tickets" className="btn btn--primary">
          Book tickets
        </Link>
      </div>
    );

  const b = state.booking;
  return (
    <div className="stack-lg">
      <div>
        <span className="eyebrow">Reservation {b.reference}</span>
        <h1 className="h1" tabIndex={-1}>
          See you on {formatLongDate(b.date).split(" ").slice(0, 3).join(" ")}
        </h1>
        <p className="lede mt-4">
          Entry from {b.slot}. Please arrive within thirty minutes of your time{b.guidedTour ? `; your guided tour leaves reception at ${tourTimeFor(b.slot)}` : ""}.
        </p>
      </div>

      <div className="notice notice--warm" role="note">
        <strong>Demonstration only.</strong> No payment was taken and no email was sent. This ticket is a design sample and is not valid for entry.
      </div>

      <figure className="ticket-figure" style={{ margin: 0 }}>
        <InlineSvg
          svg={ticketSvg({ reference: b.reference, date: formatLongDate(b.date), slot: b.slot, admits: admits(b), name: b.name, demo: true })}
          label={`Ticket ${b.reference} for ${b.name}, ${formatLongDate(b.date)} at ${b.slot}. ${admits(b)}.`}
        />
      </figure>

      <dl className="meta" style={{ maxWidth: 520 }}>
        {ticketTypes
          .filter((t) => b.quantities[t.id] > 0)
          .map((t) => (
            <div key={t.id} style={{ display: "contents" }}>
              <dt>
                {t.label} × {b.quantities[t.id]}
              </dt>
              <dd>{formatPrice(t.price * b.quantities[t.id])}</dd>
            </div>
          ))}
        {b.guidedTour > 0 && (
          <>
            <dt>Guided tour × {b.guidedTour}</dt>
            <dd>{formatPrice(GUIDED_TOUR_PRICE * b.guidedTour)}</dd>
          </>
        )}
        <dt>Total due at the desk</dt>
        <dd>
          <strong>€{b.total}</strong>
        </dd>
        {b.accessNeeds && (
          <>
            <dt>Access notes</dt>
            <dd>{b.accessNeeds}</dd>
          </>
        )}
      </dl>

      <div className="btn-row">
        <button type="button" className="btn" onClick={() => window.print()}>
          Print this page
        </button>
        <Link href="/visit" className="btn">
          Plan your visit
        </Link>
        <Link href="/museum" className="btn btn--primary">
          Preview the galleries in 3D
        </Link>
      </div>
    </div>
  );
}
