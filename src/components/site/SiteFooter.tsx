import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { hours, museum } from "@/content/visit";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <Link href="/" className="brand" style={{ color: "var(--limestone)" }} aria-label="CALCE home">
              <BrandMark className="brand__mark" />
              <span className="brand__word">CALCE</span>
            </Link>
            <p className="mt-4" style={{ maxWidth: "32ch" }}>
              {museum.tagline}.
            </p>
            <address style={{ fontStyle: "normal" }}>
              {museum.address[0]}
              <br />
              {museum.address[1]}
            </address>
          </div>
          <div>
            <h2>Visit</h2>
            <ul>
              <li><Link href="/visit">Plan your visit</Link></li>
              <li><Link href="/tickets">Book tickets</Link></li>
              <li><Link href="/map">Map &amp; guided tour</Link></li>
              <li><Link href="/museum">The 3D museum</Link></li>
              <li><Link href="/visit#access">Accessibility</Link></li>
            </ul>
          </div>
          <div>
            <h2>Explore</h2>
            <ul>
              <li><Link href="/exhibitions">Exhibitions</Link></li>
              <li><Link href="/collection">Collection</Link></li>
              <li><Link href="/artists">Artists</Link></li>
              <li><Link href="/journal">Journal</Link></li>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/identity">Identity &amp; press</Link></li>
            </ul>
          </div>
          <div>
            <h2>Hours</h2>
            <ul>
              {hours.map((d) => (
                <li key={d.day}>
                  {d.day.slice(0, 3)} · {d.open ? `${d.open}–${d.close}` : "Closed"}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="site-footer__base">
          <p style={{ margin: 0 }}>CALCE is a fictional museum. All artists, artworks and texts are original works of fiction.</p>
          <p style={{ margin: 0 }}>Ticket booking on this site is a demonstration — no payment is taken.</p>
        </div>
      </div>
    </footer>
  );
}
