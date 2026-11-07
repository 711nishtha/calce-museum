import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/ui/PageHead";
import { articles, getArticle } from "@/content/journal";
import { formatDate } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = getArticle((await params).slug);
  return a ? { title: a.title, description: a.dek } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const next = articles[(articles.indexOf(article) + 1) % articles.length]!;
  return (
    <article>
      <PageHead crumbs={[{ href: "/journal", label: "Journal" }, { label: article.title }]} eyebrow={`${article.category} · ${formatDate(article.date)}`} title={article.title} lede={article.dek}>
        <p className="small soft mt-6">By {article.author}</p>
      </PageHead>
      <div className="section">
        <div className="container">
          <div className="prose" style={{ marginInline: "auto", fontSize: "var(--step-1)" }}>
            {article.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </div>
      <aside className="section section--stone" aria-label="Next story">
        <div className="container">
          <span className="eyebrow">Next</span>
          <Link href={`/journal/${next.slug}`} className="article-entry">
            <h2 className="article-entry__title">{next.title}</h2>
            <p className="soft">{next.dek}</p>
          </Link>
        </div>
      </aside>
    </article>
  );
}
