import Link from "next/link";

export interface Crumb {
  href?: string;
  label: string;
}

export function PageHead({ eyebrow, title, lede, crumbs, children }: { eyebrow?: string; title: string; lede?: string; crumbs?: Crumb[]; children?: React.ReactNode }) {
  return (
    <header className="page-head">
      <div className="container">
        {crumbs && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol>
              {crumbs.map((c, i) => (
                <li key={c.label}>
                  {c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="page-head__title">{title}</h1>
        {lede && <p className="lede page-head__lede">{lede}</p>}
        {children}
      </div>
    </header>
  );
}
