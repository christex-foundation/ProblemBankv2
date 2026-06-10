/**
 * Warm amber for the "acute" signal — bright against dark canvases, reads as
 * urgency without competing with category palettes elsewhere on the page.
 */
export const ACUTE_COLOR = "#ffb454";

/**
 * Renders an arc on the outer rim of a bubble at origin (0, 0), drawn from
 * 12 o'clock clockwise. Length = pct/100 of the full circle.
 *
 * Used everywhere "acute share" is encoded so the visual language stays
 * identical across the Matrix views.
 */
export function AcuteArc({
  r,
  pct,
  color = ACUTE_COLOR,
  strokeWidth = 2.2,
}: {
  r: number;
  pct: number;
  color?: string;
  strokeWidth?: number;
}) {
  if (pct <= 0) return null;
  const clamped = Math.min(100, Math.max(0, pct));
  if (clamped >= 99.9) {
    return (
      <circle
        cx={0}
        cy={0}
        r={r}
        fill="none"
        stroke={color}
        strokeOpacity={0.9}
        strokeWidth={strokeWidth}
        className="pointer-events-none"
      />
    );
  }
  const angle = (clamped / 100) * 360;
  const startRad = (-90 * Math.PI) / 180;
  const endRad = ((-90 + angle) * Math.PI) / 180;
  // Coordinates are rounded because Math.cos/sin are not bit-identical across
  // JS engines; full-precision floats in the path string cause SSR hydration
  // mismatches when the server and browser run different V8 versions.
  const x1 = (Math.cos(startRad) * r).toFixed(2);
  const y1 = (Math.sin(startRad) * r).toFixed(2);
  const x2 = (Math.cos(endRad) * r).toFixed(2);
  const y2 = (Math.sin(endRad) * r).toFixed(2);
  const largeArc = angle > 180 ? 1 : 0;
  const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeOpacity={0.95}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className="pointer-events-none"
    />
  );
}
