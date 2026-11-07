/**
 * Renders a generated SVG string inline so it can use the page's web fonts.
 * Strings come only from our own generators in src/graphics, which escape all text.
 */
export function InlineSvg({ svg, label, className }: { svg: string; label?: string; className?: string }) {
  return (
    <div
      className={`svg-frame${className ? ` ${className}` : ""}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
