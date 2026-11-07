import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand" aria-label="CALCE — The Cultural Salon, home">
          <BrandMark className="brand__mark" />
          <span className="brand__word" aria-hidden="true">
            CALCE
          </span>
          <span className="brand__sub" aria-hidden="true">
            The Cultural
            <br />
            Salon
          </span>
        </Link>
        <nav className="nav" aria-label="Primary">
          <NavLinks />
        </nav>
        <div className="header-actions">
          <Link href="/museum" className="btn btn--small btn--ghost-3d">
            Enter the museum
          </Link>
          <Link href="/tickets" className="btn btn--primary btn--small">
            Book tickets
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
