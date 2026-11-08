import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { PageHead } from "@/components/ui/PageHead";

export const metadata: Metadata = { title: "Book tickets", description: "Book a timed entry to CALCE." };

export default function TicketsPage() {
  return (
    <>
      <PageHead eyebrow="Tickets" title="Book a timed entry" lede="Choose a day and time, then the tickets you need. Under 18s, members and companions go free.">
        <div className="notice notice--warm mt-6" role="note" style={{ maxWidth: 720 }}>
          <strong>This is a demonstration.</strong> CALCE is a fictional museum: the booking flow works end to end, but no payment is
          taken, nothing is emailed and the ticket you receive is not valid for entry. It takes about a minute.
        </div>
      </PageHead>
      <section className="section section--tight">
        <div className="container">
          <BookingFlow />
        </div>
      </section>
    </>
  );
}
