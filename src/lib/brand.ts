/**
 * Identity tokens in TypeScript, mirrored in src/styles/tokens.css.
 * SVG generators and the 3D materials read colours from here so that print, web and
 * the virtual building share one palette.
 */
export const palette = {
  limestone: "#E8DFCE",
  sand: "#C8B69A",
  terracotta: "#A75F40",
  olive: "#777C58",
  walnut: "#674B3A",
  ivory: "#F5F0E7",
} as const;

/** Supporting colours derived for accessible text, states and print. */
export const support = {
  ink: "#2A211B", // primary text — walnut-black
  inkSoft: "#5C4E44", // secondary text on ivory/limestone (AA)
  terracottaDeep: "#8C4A2F", // terracotta for small text and links on light grounds (AA)
  oliveDeep: "#585C3E", // olive for small text (AA)
  plaster: "#EFE8DB", // between ivory and limestone, for raised surfaces
  line: "#D6CBB8", // hairlines on ivory
  prussian: "#2E4560", // Salt & Light exhibition accent
  night: "#1C1713", // dark mode / installation ground
} as const;

export type PaletteName = keyof typeof palette;

export const fonts = {
  display: "var(--font-display, 'Instrument Serif'), 'Iowan Old Style', Georgia, serif",
  text: "var(--font-text, 'Instrument Sans'), 'Helvetica Neue', Arial, sans-serif",
} as const;

/** WCAG relative luminance */
export function luminance(hex: string): number {
  const v = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(v.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
