"use client";

import Link from "next/link";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="section">
      <div className="container stack-lg" style={{ maxWidth: 720 }}>
        <span className="eyebrow">Something went wrong</span>
        <h1 className="h1">We couldn’t open this page</h1>
        <p className="lede">Please try again. If the problem continues, the rest of the museum is still open.</p>
        <div className="btn-row">
          <button type="button" className="btn btn--primary" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
