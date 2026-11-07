import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui/PageHead";
import { articles } from "@/content/journal";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Journal", description: "Essays, studio visits and notes on the architecture and materials of CALCE." };

export default function JournalPage() {
  const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date));
  const [lead, ...rest] = sorted;
  return (
    <>
      <PageHead eyebrow="Journal" title="Notes from the salon" lede="Essays, studio visits and notes on the building." />
      <section className="section">
        <div className="container">
          {lead && (
            <Link href={`/journal/${lead.slug}`} className="article-entry" style={{ borderTopWidth: 2, paddingTop: "var(--space-6)" }}>
              <span className="eyebrow">
                {lead.category} · {formatDate(lead.date)} · {lead.author}
              </span>
              <h2 className="h1" style={{ maxWidth: "18ch", marginTop: "var(--space-3)" }}>
                {lead.title}
              </h2>
              <p className="lede mt-4">{lead.dek}</p>
            </Link>
          )}
          <div className="article-list mt-7">
            {rest.map((a) => (
              <Link key={a.slug} href={`/journal/${a.slug}`} className="article-entry">
                <span className="eyebrow">
                  {a.category} · {formatDate(a.date)}
                </span>
                <h2 className="article-entry__title">{a.title}</h2>
                <p className="soft">{a.dek}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
