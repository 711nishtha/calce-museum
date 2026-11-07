import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { PageHead } from "@/components/ui/PageHead";

export const metadata: Metadata = { title: "Book tickets", description: "Book a timed entry to CALCE." };

export default function TicketsPage() {
  return (
    <>
      <PageHead eyebrow="Tickets" title="Book a timed entry" lede="Choose a day and time, then the tickets you need. Under 18s, members and companions go free." />
      <section className="section section--tight">
        <div className="container">
          <BookingFlow />
        </div>
      </section>
    </>
  );
}
