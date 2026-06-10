"use client";

/**
 * Problem Rose — a Nightingale / polar-area bloom. Each problem is a petal
 * sharing an equal angle; the petal's *area* encodes the share (radius scales
 * with √value, so twice the percentage is twice the ink, not four times).
 * Blooms open when scrolled into view; hover a petal to focus it and read the
 * exact figure in the hub. Coral throughout, depth from opacity.
 */

import { useEffect, useMemo, useRef, useState } from "react";

import { accentHex } from "@/design/tokens";

export interface RoseItem {
  label: string;
  value: number;
}

const ACCENT = accentHex;

/**
 * Scroll-linked reveal progress centered on the viewport middle: 0 when the
 * element's center sits in the lower viewport, 0.5 exactly at the viewport
 * center, 1 once it has risen into the upper viewport. Drives the petals so
 * they bloom one at a time as the section passes through the centre.
 */
function useScrollProgress<T extends Element>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = rect.top + rect.height / 2;
      // tight band around the viewport middle so all petals reveal within a
      // short scroll burst, before the tall rose drifts off-screen
      const start = vh * 0.6; // center just below middle
      const end = vh * 0.4; // center just above middle
      const p = (start - center) / (start - end);
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return { ref, progress };
}

/** True on phone-width viewports, so the bloom can size its labels up where
 * the SVG renders small enough that the desktop label size is unreadable. */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof matchMedia === "undefined") return;
    const mq = matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const on = () => setIsMobile(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return isMobile;
}

function petalPath(cx: number, cy: number, a0: number, a1: number, r: number, sweep = 1) {
  // Coordinates are rounded because Math.cos/sin are not bit-identical across
  // JS engines; full-precision floats in the path string cause SSR hydration
  // mismatches when the server and browser run different V8 versions.
  const x0 = (cx + Math.cos(a0) * r).toFixed(2);
  const y0 = (cy + Math.sin(a0) * r).toFixed(2);
  const x1 = (cx + Math.cos(a1) * r).toFixed(2);
  const y1 = (cy + Math.sin(a1) * r).toFixed(2);
  const rr = r.toFixed(2);
  return `M${cx} ${cy} L${x0} ${y0} A${rr} ${rr} 0 0 ${sweep} ${x1} ${y1} Z`;
}

/** Labels we always keep on a single line, regardless of length. */
const SINGLE_LINE = new Set(["Water, sanitation & waste"]);

/** Up to two label lines, wrapped on a word boundary near the middle. */
function twoLines(label: string): [string, string?] {
  if (SINGLE_LINE.has(label)) return [label];
  const words = label.replace(" / ", "/").split(" ");
  if (words.length === 1) return [words[0]];
  let best = 1;
  let bestDiff = Infinity;
  const total = label.length;
  let acc = 0;
  for (let i = 0; i < words.length - 1; i++) {
    acc += words[i].length + 1;
    const diff = Math.abs(acc - total / 2);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i + 1;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

export function ProblemRose({
  items,
  className,
  progress: externalProgress,
  flip = false,
  unit = '%',
}: {
  items: RoseItem[];
  className?: string;
  /** When provided, drives the bloom externally (e.g. a pinned scene) and the
   * internal scroll measurement is ignored. */
  progress?: number;
  /** Lay petals out counter-clockwise, so the biggest sit on the left. */
  flip?: boolean;
  /** Suffix on each petal's value (default '%'; pass '' for raw counts). */
  unit?: string;
}) {
  const internal = useScrollProgress<HTMLDivElement>();
  const ref = internal.ref;
  const progress = externalProgress ?? internal.progress;

  // The SVG scales to its container, so on phones the rose renders at roughly
  // half size and the desktop label size becomes unreadable. Size labels up
  // there; line spacing is derived from the font so the block stays tidy.
  const isMobile = useIsMobile();
  const labelFont = isMobile ? 18 : 8;
  const lineGap = labelFont * 1.25;

  const W = 620;
  const cx = W / 2;
  const cy = W / 2;
  // petals fill more of the box; the remaining margin holds the labels
  const maxR = 232;
  const n = items.length;
  const gap = 0.035;
  const maxV = useMemo(() => Math.max(...items.map((i) => i.value)), [items]);

  const dir = flip ? -1 : 1;
  const sweep = flip ? 0 : 1;
  const petals = useMemo(
    () =>
      items.map((it, i) => {
        const a0 = dir * ((i / n) * Math.PI * 2) - Math.PI / 2 + dir * gap;
        const a1 = dir * (((i + 1) / n) * Math.PI * 2) - Math.PI / 2 - dir * gap;
        const aMid = (a0 + a1) / 2;
        const r = Math.sqrt(it.value / maxV) * maxR;
        return { ...it, a0, a1, aMid, r };
      }),
    [items, n, maxV, dir],
  );

  return (
    <div ref={ref} className={className}>
      <svg
        viewBox={isMobile ? `-110 -40 ${W + 220} ${W + 80}` : `0 0 ${W} ${W}`}
        className="w-full h-auto block select-none overflow-visible"
        role="img"
        aria-label={`Problems named, as a polar-area bloom. Highest: ${petals
          .slice()
          .sort((a, b) => b.value - a.value)
          .slice(0, 3)
          .map((p) => `${p.label} ${p.value}${unit}`)
          .join(", ")}.`}
      >
        {petals.map((p, i) => {
          // sit the label just past each petal's own tip, not on a shared ring
          const lr = p.r + labelFont + 12;
          // Rounded for the same engine-precision reason as petalPath.
          const lx = +(cx + Math.cos(p.aMid) * lr).toFixed(2);
          const ly = +(cy + Math.sin(p.aMid) * lr).toFixed(2);
          const anchor =
            Math.cos(p.aMid) > 0.25 ? "start" : Math.cos(p.aMid) < -0.25 ? "end" : "middle";
          const lines = twoLines(p.label);
          // nudge label block vertically so it sits centered on its anchor point
          const ty =
            ly -
            (lines.length === 2 ? labelFont * 0.75 : 0) -
            (Math.sin(p.aMid) < -0.6 ? labelFont : 0);
          // petal i owns the scroll window [i/n, (i+1)/n]; t is its local 0→1
          const t = Math.min(1, Math.max(0, progress * n - i));
          const eased = 1 - Math.pow(1 - t, 2); // easeOut
          return (
            <g key={p.label}>
              <path
                d={petalPath(cx, cy, p.a0, p.a1, p.r, sweep)}
                fill={ACCENT}
                fillOpacity={0.32 + 0.58 * (p.value / maxV)}
                style={{
                  transform: `scale(${0.02 + 0.98 * eased})`,
                  transformOrigin: `${cx}px ${cy}px`,
                }}
              />
              <g style={{ opacity: t }}>
                <text
                  x={lx}
                  y={ty}
                  textAnchor={anchor}
                  className="fill-foreground"
                  style={{ fontSize: labelFont, fontWeight: 600 }}
                >
                  {lines[0]}
                </text>
                {lines[1] && (
                  <text
                    x={lx}
                    y={ty + lineGap}
                    textAnchor={anchor}
                    className="fill-foreground"
                    style={{ fontSize: labelFont, fontWeight: 600 }}
                  >
                    {lines[1]}
                  </text>
                )}
                <text
                  x={lx}
                  y={ty + (lines[1] ? lineGap * 2 : lineGap)}
                  textAnchor={anchor}
                  fill={ACCENT}
                  style={{ fontSize: labelFont, fontWeight: 800 }}
                >
                  {p.value}
                  {unit}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* accessible fallback */}
      <ul className="sr-only">
        {items.map((it) => (
          <li key={it.label}>
            {it.label}: {it.value}
            {unit}
          </li>
        ))}
      </ul>
    </div>
  );
}
