import type { Metadata } from "next";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";

export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } };

export default function ConfirmationPage() {
  return (
    <section className="section">
      <div className="container">
        <BookingConfirmation />
      </div>
    </section>
  );
}
