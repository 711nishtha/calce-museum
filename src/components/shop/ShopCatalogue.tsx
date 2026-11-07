"use client";

import { useEffect, useState } from "react";
import { InlineSvg } from "@/components/ui/InlineSvg";
import { products } from "@/content/shop";
import type { ShopProduct } from "@/content/types";
import { formatPrice } from "@/lib/format";
import { useBag } from "@/state/bag";

const categories: (ShopProduct["category"] | "All")[] = ["All", "Book", "Print", "Object", "Textile"];

/** Mockup SVG strings are generated on the server and passed in, keeping generators out of the client bundle. */
export function ShopCatalogue({ mockups }: { mockups: Record<string, string> }) {
  const { items, add, remove, clear } = useBag();
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [reserved, setReserved] = useState<string | null>(null);

  useEffect(() => {
    void useBag.persist.rehydrate();
  }, []);

  const lines = Object.entries(items)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
    .filter((l): l is { product: ShopProduct; qty: number } => !!l.product);
  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const shown = category === "All" ? products : products.filter((p) => p.category === category);

  return (
    <>
      <div className="filters">
        <fieldset>
          <legend className="label">Category</legend>
          <div className="chips">
            {categories.map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <ul className="product-grid" style={{ listStyle: "none", margin: 0, padding: 0, paddingBottom: lines.length ? 260 : 0 }}>
        {shown.map((p) => (
          <li key={p.id} className="product">
            <InlineSvg svg={mockups[p.id]!} label={`${p.name} — product illustration`} />
            <div className="product__head">
              <h2 className="product__name h4">{p.name}</h2>
              <span className="product__price">{formatPrice(p.price)}</span>
            </div>
            <p className="small" style={{ margin: "var(--space-2) 0" }}>
              {p.description}
            </p>
            <p className="small soft">{p.details}</p>
            <button type="button" className="btn btn--small" onClick={() => add(p.id)} aria-label={`Add ${p.name} to your reservation`}>
              Add to reservation{items[p.id] ? ` (${items[p.id]})` : ""}
            </button>
          </li>
        ))}
      </ul>

      {(lines.length > 0 || reserved) && (
        <aside className="bag" aria-labelledby="bag-title">
          {reserved ? (
            <div className="stack">
              <h2 id="bag-title" className="h3">
                Reserved for collection
              </h2>
              <p className="small">
                Reference <strong>{reserved}</strong>. In the museum your items would be held at the shop desk for seven days. This is a demonstration — nothing has been charged or set aside.
              </p>
              <button type="button" className="btn btn--small" onClick={() => setReserved(null)}>
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 id="bag-title" className="h3" style={{ marginBottom: "var(--space-3)" }}>
                Your reservation
              </h2>
              <ul>
                {lines.map((l) => (
                  <li key={l.product.id}>
                    <span>
                      {l.product.name} × {l.qty}
                    </span>
                    <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {formatPrice(l.product.price * l.qty)}
                      <button type="button" className="chip" style={{ minHeight: 32, padding: "0 10px" }} onClick={() => remove(l.product.id)} aria-label={`Remove one ${l.product.name}`}>
                        −
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="summary__total" style={{ marginTop: 0 }}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="btn-row mt-4">
                <button
                  type="button"
                  className="btn btn--primary btn--small"
                  onClick={() => {
                    const ref = `SHOP-${Math.floor(crypto.getRandomValues(new Uint32Array(1))[0]! % 9000) + 1000}`;
                    clear();
                    setReserved(ref);
                  }}
                >
                  Reserve for collection
                </button>
                <button type="button" className="btn btn--small" onClick={clear}>
                  Empty
                </button>
              </div>
              <p className="small soft" style={{ margin: "var(--space-3) 0 0" }}>
                Pay when you collect at the museum shop. Online payment is not available.
              </p>
            </>
          )}
        </aside>
      )}
    </>
  );
}
