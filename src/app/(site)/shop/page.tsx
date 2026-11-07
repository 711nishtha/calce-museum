import type { Metadata } from "next";
import { ShopCatalogue } from "@/components/shop/ShopCatalogue";
import { PageHead } from "@/components/ui/PageHead";
import { products } from "@/content/shop";
import { linked, namespaceIds } from "@/graphics/embed";
import { productMockupSvg } from "@/graphics/merch-svg";

export const metadata: Metadata = { title: "Shop", description: "Catalogues, prints and objects made with craftspeople from around the Mediterranean." };

export default function ShopPage() {
  return (
    <>
      <PageHead eyebrow="Museum shop" title="Objects for slow afternoons" lede="Catalogues, prints and things made with workshops around the Mediterranean. Reserve online and collect at the shop — no ticket needed." />
      <section className="section section--tight">
        <div className="container">
          <ShopCatalogue mockups={Object.fromEntries(products.map((p) => [p.id, namespaceIds(linked(() => productMockupSvg(p)), `shop-${p.id}`)]))} />
        </div>
      </section>
    </>
  );
}
