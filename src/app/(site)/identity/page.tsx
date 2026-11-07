import type { Metadata } from "next";
import Link from "next/link";
import { InlineSvg } from "@/components/ui/InlineSvg";
import { PageHead } from "@/components/ui/PageHead";
import { identityAssets, type AssetCategory } from "@/graphics/assets";
import { linked, namespaceIds } from "@/graphics/embed";
import { contrastRatio, palette, support } from "@/lib/brand";
import { identityAssetUrl } from "@/lib/paths";

export const metadata: Metadata = { title: "Identity & press", description: "The CALCE graphic identity: logo, typography, colour, grid, signage, print and digital assets." };

const swatches = [
  { name: "Limestone", hex: palette.limestone, use: "Primary ground, stone panels, map galleries" },
  { name: "Ivory", hex: palette.ivory, use: "Page ground, tickets, reversed type" },
  { name: "Sand", hex: palette.sand, use: "Rules on dark, inputs, secondary fills" },
  { name: "Terracotta", hex: palette.terracotta, use: "Accent, mark sun, large display numerals" },
  { name: "Olive", hex: palette.olive, use: "Landscape, status, Exhibition 02" },
  { name: "Walnut", hex: palette.walnut, use: "Wayfinding panels, dark sections" },
  { name: "Ink", hex: support.ink, use: "Text — AA on every light ground" },
  { name: "Ink soft", hex: support.inkSoft, use: "Secondary text, captions" },
  { name: "Terracotta deep", hex: support.terracottaDeep, use: "Links, primary buttons, small accent text" },
  { name: "Olive deep", hex: support.oliveDeep, use: "Small olive text, success" },
  { name: "Prussian", hex: support.prussian, use: "Exhibition 03 (cyanotype)" },
  { name: "Night", hex: support.night, use: "Footer, 3D interface panels" },
];

const typeScale = [
  { token: "--step-6", sample: "A salon for slow looking", cls: "display", note: "Display · Instrument Serif · hero only" },
  { token: "--step-5", sample: "The Weight of Stillness", cls: "h1", note: "Page titles" },
  { token: "--step-4", sample: "Now on view", cls: "h2", note: "Section titles" },
  { token: "--step-2", sample: "Arch for an Absent Door", cls: "h3", note: "Work titles, card titles" },
  { token: "--step-1", sample: "Find the joint where the stack seems least certain.", cls: "h4 italic", note: "Look-closer prompts (italic)" },
  { token: "--step-0", sample: "Every work is given room. Every gallery has a bench.", cls: "", note: "Body · Instrument Sans · 1.6 leading · 62ch measure" },
  { token: "--step--2", sample: "Exhibition 03 · Photography", cls: "eyebrow", note: "Labels · uppercase · 0.14em tracking" },
];

const spacing = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-5", "--space-6", "--space-7", "--space-8", "--space-9"];

const order: AssetCategory[] = ["Logo", "Poster", "Catalogue", "Signage", "Ticket", "Map", "Brochure", "Social", "Merchandise"];

export default function IdentityPage() {
  return (
    <>
      <PageHead eyebrow="Identity & press" title="A grammar of arches and light" lede="One mark, two typefaces, six colours drawn from the building. The same system runs through the website, the 3D museum, print and signage.">
        <nav aria-label="On this page" className="mt-6">
          <ul className="chips" style={{ listStyle: "none", padding: 0 }}>
            {["Mark", "Colour", "Typography", "Space & grid", ...order.slice(1)].map((s) => (
              <li key={s}>
                <a className="chip" href={`#${s.toLowerCase().replace(/[^a-z]+/g, "-")}`} style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", color: "inherit" }}>
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHead>

      <section className="section" id="mark" aria-labelledby="mark-title">
        <div className="container split">
          <div>
            <h2 id="mark-title" className="h2">
              The mark
            </h2>
            <div className="prose mt-6 small">
              <p>An arched opening — the museum’s recurring threshold — with the sun of the atrium oculus at its springing point, standing on a single threshold line.</p>
              <p>The wordmark is set in Instrument Serif capitals with 16% tracking. Minimum sizes: mark 16 px / 6 mm; lockup 120 px / 30 mm wide. Clear space equals the width of the sun on every side.</p>
              <p>The sun may take any exhibition accent; the arch is always ink or ivory.</p>
            </div>
          </div>
          <div className="asset-grid">
            {identityAssets
              .filter((a) => a.category === "Logo")
              .map((a) => (
                <figure key={a.id} className="asset">
                  <InlineSvg svg={namespaceIds(linked(a.render), a.id)} label={a.title} />
                  <figcaption>
                    <span>
                      {a.title} <span className="soft">· {a.spec}</span>
                    </span>
                    <a href={identityAssetUrl(a.id)} download={`calce-${a.id}.svg`}>
                      SVG
                    </a>
                  </figcaption>
                </figure>
              ))}
          </div>
        </div>
      </section>

      <section className="section section--plaster" id="colour" aria-labelledby="colour-title">
        <div className="container">
          <div className="section__head">
            <h2 id="colour-title" className="h2">
              Colour
            </h2>
            <p className="small soft" style={{ maxWidth: "48ch", margin: 0 }}>
              Six core colours from the building, plus supporting tones tuned for accessible text. Contrast ratios are measured against Ivory and checked in the test suite.
            </p>
          </div>
          <div className="swatches">
            {swatches.map((s) => {
              const onIvory = contrastRatio(s.hex, palette.ivory);
              return (
                <div key={s.name} className="swatch">
                  <div className="swatch__chip" style={{ background: s.hex }} />
                  <dl className="meta">
                    <dt>{s.name}</dt>
                    <dd>{s.hex.toUpperCase()}</dd>
                    <dt>On ivory</dt>
                    <dd>
                      {onIvory.toFixed(2)}:1 {onIvory >= 4.5 ? "· AA text" : onIvory >= 3 ? "· large text" : "· decorative"}
                    </dd>
                  </dl>
                  <p className="small soft mt-4">{s.use}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="typography" aria-labelledby="type-title">
        <div className="container split">
          <div>
            <h2 id="type-title" className="h2">
              Typography
            </h2>
            <div className="prose small mt-6">
              <p>Instrument Serif carries titles, numerals and quotations; its narrow, high-contrast forms recall carved inscriptions. Instrument Sans carries everything that must be read quickly: body text, labels, interface and wayfinding.</p>
              <p>Both are licensed under the SIL Open Font License. The scale is fluid, stepping by roughly 1.2 on small screens and 1.33 on large ones.</p>
            </div>
          </div>
          <div>
            {typeScale.map((t) => (
              <div key={t.token} className="specimen">
                <div className="specimen__label">
                  <span>{t.token}</span>
                  <span>{t.note}</span>
                </div>
                <p className={t.cls} style={{ margin: 0, fontSize: t.cls === "display" ? "var(--step-5)" : undefined }}>
                  {t.sample}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--stone" id="space-grid" aria-labelledby="space-title">
        <div className="container split">
          <div>
            <h2 id="space-title" className="h2">
              Space &amp; grid
            </h2>
            <p className="small mt-6" style={{ maxWidth: "36ch" }}>
              A 4 px base unit and a twelve-column grid with fluid gutters (16–32 px) and margins (16–88 px). Images are cropped to arches: a semicircle across the full width of the frame.
            </p>
          </div>
          <div className="stack-lg">
            <div className="spacing-scale">
              {spacing.map((s) => (
                <div key={s}>
                  <code>{s}</code>
                  <span style={{ width: `var(${s})` }} />
                </div>
              ))}
            </div>
            <div className="grid-demo" aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} />
              ))}
            </div>
            <div className="btn-row">
              <Link href="/tickets" className="btn btn--primary">
                Primary button
              </Link>
              <Link href="/visit" className="btn">
                Secondary button
              </Link>
              <button type="button" className="chip" aria-pressed="true">
                Chip · selected
              </button>
              <button type="button" className="chip" aria-pressed="false">
                Chip
              </button>
            </div>
          </div>
        </div>
      </section>

      {order.slice(1).map((cat, i) => {
        const items = identityAssets.filter((a) => a.category === cat);
        const id = cat.toLowerCase().replace(/[^a-z]+/g, "-");
        return (
          <section key={cat} className={`section${i % 2 ? " section--plaster" : ""}`} id={id} aria-labelledby={`${id}-title`}>
            <div className="container">
              <div className="section__head">
                <h2 id={`${id}-title`} className="h2">
                  {cat === "Map" ? "Visitor map" : cat === "Ticket" ? "Tickets" : cat === "Social" ? "Social campaign" : cat === "Merchandise" ? "Merchandise" : `${cat}s`.replace("Signages", "Signage & wayfinding")}
                </h2>
                <span className="small soft">Print-ready SVG · download any asset</span>
              </div>
              <div className="asset-grid" style={cat === "Brochure" || cat === "Ticket" || cat === "Map" ? { gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 520px), 1fr))" } : undefined}>
                {items.map((a) => (
                  <figure key={a.id} className="asset">
                    <InlineSvg svg={namespaceIds(linked(a.render), a.id)} label={a.title} />
                    <figcaption>
                      <span>
                        {a.title}
                        <br />
                        <span className="soft">{a.spec}</span>
                      </span>
                      <a href={identityAssetUrl(a.id)} download={`calce-${a.id}.svg`}>
                        SVG
                      </a>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
