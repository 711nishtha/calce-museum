import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";

export default function NotFound() {
  return (
    <main className="section" style={{ minHeight: "100svh", display: "grid", alignItems: "center" }}>
      <div className="container stack-lg" style={{ maxWidth: 720 }}>
        <BrandMark className="brand__mark" />
        <span className="eyebrow">404</span>
        <h1 className="h1">This room is closed</h1>
        <p className="lede">The page you were looking for has moved or never existed. Every gallery is still open from the atrium.</p>
        <div className="btn-row">
          <Link href="/" className="btn btn--primary">
            Return to the atrium
          </Link>
          <Link href="/exhibitions" className="btn">
            Exhibitions
          </Link>
        </div>
      </div>
    </main>
  );
}
