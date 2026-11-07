import type { Metadata } from "next";
import Link from "next/link";
import { HoursTable } from "@/components/site/OpeningStatus";
import { InlineSvg } from "@/components/ui/InlineSvg";
import { PageHead } from "@/components/ui/PageHead";
import { accessibility, facilities, faqs, gettingHere, museum } from "@/content/visit";
import { mapSvg } from "@/graphics/map-svg";
import { GUIDED_TOUR_PRICE, ticketTypes } from "@/lib/booking";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Visit", description: "Opening hours, tickets, accessibility, facilities and how to reach CALCE." };

export default function VisitPage() {
  return (
    <>
      <PageHead eyebrow="Plan your visit" title="Visit CALCE" lede="Most visitors spend around two hours. Allow a little longer if you would like lunch in the garden." />

      <section className="section" aria-labelledby="hours">
        <div className="container split split--even">
          <div>
            <h2 id="hours" className="h2">
              Opening hours
            </h2>
            <p className="mt-4 soft">Last entry 90 minutes before closing. Late opening every Thursday.</p>
            <div className="mt-6">
              <HoursTable />
            </div>
          </div>
          <div>
            <h2 className="h2">Tickets</h2>
            <table className="hours mt-6">
              <caption className="visually-hidden">Ticket prices</caption>
              <tbody>
                {ticketTypes.map((t) => (
                  <tr key={t.id}>
                    <th scope="row">
                      {t.label}
                      {t.note && <span className="soft small"> · {t.note}</span>}
                    </th>
                    <td>{formatPrice(t.price)}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row">
                    Guided tour <span className="soft small">· 60 minutes, 11:00 and 15:00</span>
                  </th>
                  <td>+{formatPrice(GUIDED_TOUR_PRICE)}</td>
                </tr>
              </tbody>
            </table>
            <div className="btn-row mt-6">
              <Link href="/tickets" className="btn btn--primary">
                Book a timed entry
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--plaster" aria-labelledby="getting-here">
        <div className="container split">
          <div>
            <h2 id="getting-here" className="h2">
              Getting here
            </h2>
            <address className="mt-6" style={{ fontStyle: "normal" }}>
              {museum.address[0]}
              <br />
              {museum.address[1]}
            </address>
          </div>
          <ul className="info-list">
            {gettingHere.map((g) => (
              <li key={g.mode}>
                <h3>{g.mode}</h3>
                <p>{g.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="access-title" id="access">
        <div className="container split">
          <div>
            <h2 id="access-title" className="h2">
              Accessibility
            </h2>
            <p className="mt-4 soft" style={{ maxWidth: "36ch" }}>
              If you have a question about access, ask at reception or write to {museum.email}.
            </p>
          </div>
          <ul className="info-list">
            {accessibility.map((a) => (
              <li key={a.title}>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--stone" aria-labelledby="facilities">
        <div className="container split">
          <div>
            <h2 id="facilities" className="h2">
              In the building
            </h2>
            <Link href="/map" className="text-link mt-4">
              Map &amp; guided tour
            </Link>
          </div>
          <div>
            <ul className="info-list">
              {facilities.map((f) => (
                <li key={f.title}>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </li>
              ))}
            </ul>
            <figure className="map-figure mt-7">
              <InlineSvg svg={mapSvg({})} label="Plan of CALCE showing the forecourt, reception, shop, café, sculpture garden, atrium and four galleries." />
            </figure>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq">
        <div className="container split">
          <h2 id="faq" className="h2">
            Questions
          </h2>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
