import type { ShopProduct } from "./types";

export const products: ShopProduct[] = [
  {
    id: "catalogue-weight-of-stillness",
    name: "The Weight of Stillness — Catalogue",
    category: "Book",
    price: 38,
    description: "The exhibition catalogue, with essays by Livia Castellane and full-page plates of every work.",
    details: "Softcover with flaps, 176 pages, 24 × 30 cm. Printed on uncoated paper.",
    mockup: "catalogue",
    exhibitionId: "weight-of-stillness",
  },
  {
    id: "catalogue-salt-and-light",
    name: "Salt & Light — Catalogue",
    category: "Book",
    price: 34,
    description: "Plates of every print in the exhibition, with notes on each process written by the artists.",
    details: "Softcover, 144 pages, 22 × 28 cm. Cover printed in a single Prussian-blue ink.",
    mockup: "catalogue",
    exhibitionId: "salt-and-light",
  },
  {
    id: "poster-grammar-of-walls",
    name: "A Grammar of Walls — Poster",
    category: "Print",
    price: 22,
    description: "The exhibition poster, printed in four spot colours.",
    details: "50 × 70 cm, 170 gsm uncoated paper. Rolled in a tube.",
    mockup: "poster",
    exhibitionId: "grammar-of-walls",
  },
  {
    id: "tote-arch",
    name: "Arch Tote",
    category: "Textile",
    price: 24,
    description: "Heavy natural cotton tote printed with the CALCE arch mark in terracotta.",
    details: "38 × 42 cm, 340 gsm organic cotton, long handles.",
    mockup: "tote",
  },
  {
    id: "cup-terracotta",
    name: "Terracotta Cup",
    category: "Object",
    price: 18,
    description: "A small unglazed-exterior cup thrown for the café by a workshop in the hills behind Porto Calce.",
    details: "200 ml, glazed interior. Each cup varies slightly.",
    mockup: "cup",
  },
  {
    id: "scarf-limestone",
    name: "Limestone Linen Scarf",
    category: "Textile",
    price: 56,
    description: "Washed linen in the colour of the museum's walls, with a hand-rolled terracotta edge.",
    details: "70 × 190 cm, 100% linen, woven in Portugal.",
    mockup: "scarf",
  },
  {
    id: "notebook-cyanotype",
    name: "Cyanotype Notebook",
    category: "Object",
    price: 16,
    description: "A plain-page notebook whose cover is printed with a detail from Nadia Ferhat's Wild Fennel, 9 a.m.",
    details: "A5, 128 plain pages, lay-flat binding.",
    mockup: "notebook",
    exhibitionId: "salt-and-light",
  },
  {
    id: "postcards-set",
    name: "Exhibition Postcards",
    category: "Print",
    price: 12,
    description: "A set of eight postcards: two works from each of the four current exhibitions.",
    details: "Eight cards, 10.5 × 14.8 cm, in a printed sleeve.",
    mockup: "postcards",
  },
];

export function getProduct(id: string): ShopProduct | undefined {
  return products.find((p) => p.id === id);
}
