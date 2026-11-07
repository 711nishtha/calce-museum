/** The CALCE arch mark as a React SVG. Matches `mark()` in src/graphics/identity.ts. */
export function BrandMark({ className, ink = "currentColor", sun = "var(--terracotta)" }: { className?: string; ink?: string; sun?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 64" aria-hidden="true" focusable="false">
      <path d="M9,58 V26 A15,15 0 0 1 39,26 V58" fill="none" stroke={ink} strokeWidth="3.4" />
      <circle cx="24" cy="26" r="5.6" fill={sun} />
      <line x1="2" y1="58" x2="46" y2="58" stroke={ink} strokeWidth="3.4" />
    </svg>
  );
}
