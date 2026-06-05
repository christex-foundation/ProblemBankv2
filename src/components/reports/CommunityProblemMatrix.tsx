"use client";

import { useEffect, useMemo, useState } from "react";
import {
  forceCollide,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import { AcuteArc } from "@/components/AcuteArc";

/**
 * Report-embedded twin of the /matrix bubble viz, restyled for the light
 * editorial page. Two flows only:
 *   1. Overview — one bubble per problem, sized by respondents who named it.
 *   2. Detail   — click a problem to drill into community bubbles, each
 *                 showing the respondent count (the number) and an arc for
 *                 that community's prevalence share.
 *
 * Built entirely from the report's static `communityProblems` figures (no
 * respondent-level universe), so the arc encodes prevalence %, not the
 * /matrix "acute" top-priority share.
 */

interface CommunitySeries {
  name: string;
  n?: number;
  values: number[];
  highlight?: boolean;
}

interface CommunityProblemMatrixProps {
  categories: string[];
  series: CommunitySeries[];
  /**
   * What a drill-down bubble represents. Defaults to communities; pass
   * { singular: 'group', plural: 'groups' } when the series are not communities
   * (e.g. communities vs students) so the breadcrumb/footer copy stays correct.
   */
  entity?: { singular: string; plural: string };
  /**
   * The big number on each bubble (and what its size encodes). 'count' shows
   * respondents (default); 'pct' shows the raw prevalence value (e.g. 68),
   * matching a bar chart of the same figures. The value is printed bare (no
   * '%' sign) so it reads as the source number.
   */
  primaryMetric?: "count" | "pct";
  /** Show the small sub-label under the big number (default true). */
  showSubLabel?: boolean;
  /**
   * Chromeless, display-only mode for embedding (e.g. a Library card): drops
   * the bordered/filled container, the header and footer rows, and the
   * click-to-drill interaction. Hover styling is retained. Default false.
   */
  bare?: boolean;
  /**
   * Multiplies every bubble radius (default 1). Use >1 to make the figure read
   * larger when embedded small, e.g. on a Library card. Packing adapts to the
   * scaled radii within the same viewBox.
   */
  sizeScale?: number;
}

const DEFAULT_ENTITY = { singular: 'community', plural: 'communities' };

interface Bubble {
  id: string;
  label: string;
  /** Respondents (the big number). */
  count: number;
  /** Prevalence share, drawn as the arc + sub-label. */
  pct: number;
  x: number;
  y: number;
  r: number;
}

const VIEW_W = 1200;
const VIEW_H = 640;
const MIN_R = 44;
const MAX_R = 118;
const PAD = 18;
/** Keep-out margin from the viewBox edge — covers the hover glow ring
 * (r + 14, 14px wide) and the 1.07 hover scale so nothing clips. */
const EDGE = 26;
/** Coral report accent, used for the prevalence arc. */
const ARC_COLOR = "var(--accent)";

/** Spelled-out problem names for the detail header — bubbles stay short. */
const FULL_LABEL: Record<string, string> = {
  GBV: "Gender-based violence",
};
/** App red/accent for the hover highlight. */
const HOVER_COLOR = "var(--accent)";

/** count of respondents in a community who named the problem at index `ci`. */
function communityCount(s: CommunitySeries, ci: number): number {
  return Math.round(((s.values[ci] ?? 0) / 100) * (s.n ?? 0));
}

/**
 * Break a long multi-word label into two balanced lines so it fits inside the
 * bubble (SVG text doesn't wrap). Short or single-word labels stay on one line.
 */
function splitLabel(label: string): string[] {
  const words = label.split(" ");
  if (words.length < 2 || label.length <= 14) return [label];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ").length;
    const b = words.slice(i).join(" ").length;
    const diff = Math.abs(a - b);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

type Metric = "count" | "pct";

function sizeBubbles(
  raw: Array<Omit<Bubble, "x" | "y" | "r">>,
  metric: Metric = "count",
  scale = 1,
): Bubble[] {
  const max = raw.reduce((m, b) => Math.max(m, b[metric]), 0) || 1;
  return raw.map((b) => ({
    ...b,
    x: VIEW_W / 2 + (Math.random() - 0.5) * 200,
    y: VIEW_H / 2 + (Math.random() - 0.5) * 200,
    r: (MIN_R + Math.sqrt(b[metric] / max) * (MAX_R - MIN_R)) * scale,
  }));
}

/**
 * One bubble per problem. In 'count' mode the number is total respondents and
 * the % is the blended share. In 'pct' mode the number is the sum of every
 * series' value for that problem (e.g. Water = communities 68 + students 69 =
 * 137), so the overview totals the figures you drill into.
 */
function buildOverview(
  props: CommunityProblemMatrixProps,
  metric: Metric,
  scale = 1,
): Bubble[] {
  const totalN = props.series.reduce((s, c) => s + (c.n ?? 0), 0) || 1;
  const raw = props.categories.map((label, ci) => {
    const count = props.series.reduce((s, c) => s + communityCount(c, ci), 0);
    const pct =
      metric === "pct"
        ? props.series.reduce((s, c) => s + (c.values[ci] ?? 0), 0)
        : Math.round((count / totalN) * 100);
    return { id: label, label, count, pct };
  });
  raw.sort((a, b) => b[metric] - a[metric]);
  return sizeBubbles(raw, metric, scale);
}

/** One bubble per series (community / group) for a single problem. */
function buildDetail(
  props: CommunityProblemMatrixProps,
  ci: number,
  metric: Metric,
  scale = 1,
): Bubble[] {
  const raw = props.series.map((s) => ({
    id: s.name,
    label: s.name,
    count: communityCount(s, ci),
    pct: s.values[ci] ?? 0,
  }));
  raw.sort((a, b) => b[metric] - a[metric]);
  return sizeBubbles(raw, metric, scale);
}

function packBubbles(bubbles: Bubble[]): Bubble[] {
  if (bubbles.length === 0) return bubbles;
  const clamp = (b: Bubble) => {
    b.x = Math.min(VIEW_W - b.r - EDGE, Math.max(b.r + EDGE, b.x));
    b.y = Math.min(VIEW_H - b.r - EDGE, Math.max(b.r + EDGE, b.y));
  };
  // Single simulation with a strong collide and gentle centering. We clamp
  // every tick so the bounds and the collide constraint resolve together —
  // a one-shot clamp at the end just shoves edge bubbles back onto neighbors.
  const sim = forceSimulation(
    bubbles as unknown as { x: number; y: number; r: number }[],
  )
    .force("x", forceX(VIEW_W / 2).strength(0.035))
    .force("y", forceY(VIEW_H / 2).strength(0.05))
    .force(
      "charge",
      forceManyBody().strength((d) => -((d as unknown as Bubble).r * 0.35)),
    )
    .force(
      "collide",
      forceCollide<Bubble>()
        .radius((d) => d.r + PAD)
        .strength(1)
        .iterations(16),
    )
    .stop();
  for (let i = 0; i < 700; i++) {
    sim.tick();
    for (const b of bubbles) clamp(b);
  }
  return bubbles;
}

export function CommunityProblemMatrix(props: CommunityProblemMatrixProps) {
  // null = overview (per problem); a category index = detail (per community).
  const [selected, setSelected] = useState<number | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const entity = props.entity ?? DEFAULT_ENTITY;
  const metric: Metric = props.primaryMetric ?? "count";
  const bare = props.bare ?? false;
  const sizeScale = props.sizeScale ?? 1;

  const initial = useMemo(
    () =>
      selected === null
        ? buildOverview(props, metric, sizeScale)
        : buildDetail(props, selected, metric, sizeScale),
    [props, selected, metric, sizeScale],
  );

  // Two-stage layout matching /matrix: render at center, then on the next
  // frame swap in packed positions so CSS transitions animate them out.
  useEffect(() => {
    setBubbles(initial.map((b) => ({ ...b, x: VIEW_W / 2, y: VIEW_H / 2 })));
    const packed = packBubbles(initial.map((b) => ({ ...b })));
    let cancelled = false;
    let rafA = 0;
    let rafB = 0;
    rafA = requestAnimationFrame(() => {
      rafB = requestAnimationFrame(() => {
        if (!cancelled) setBubbles(packed);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
    };
  }, [initial]);

  const isDetail = selected !== null;
  const problemLabel = isDetail
    ? FULL_LABEL[props.categories[selected]] ?? props.categories[selected]
    : null;

  return (
    <div
      className={
        bare
          ? "relative"
          : "relative rounded-xl border border-foreground/10 bg-foreground/[0.02] overflow-hidden"
      }
    >
      {/* Header — breadcrumb / back control, mirrors MatrixDetail's. */}
      {!bare && (
      <div className="flex items-baseline justify-between gap-4 px-6 pt-5 md:px-8">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-foreground/45">
          {isDetail ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setHoverId(null);
                  setSelected(null);
                }}
                className="hover:text-foreground transition-colors"
              >
                Problems
              </button>
              <span className="text-foreground/30">›</span>
              <span className="text-foreground">{problemLabel}</span>
            </>
          ) : (
            <span className="text-foreground">By problem</span>
          )}
        </div>
        <span className="hidden sm:inline text-[10px] uppercase tracking-[0.22em] text-accent">
          {isDetail
            ? "Click Problems to go back"
            : `Click a problem to see it by ${entity.singular}`}
        </span>
      </div>
      )}

      <div className={bare ? "" : "px-3 pb-3 pt-1 md:px-4"}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block select-none text-foreground"
          role="img"
          aria-label={
            isDetail
              ? `${entity.plural} affected by ${problemLabel}`
              : "Problems sized by respondents who named them"
          }
        >
          {bubbles.map((b) => {
            const isHovered = hoverId === b.id;
            const isOtherHovered = hoverId !== null && !isHovered;
            return (
              <g
                key={b.id}
                style={{
                  transform: `translate(${b.x}px, ${b.y}px)`,
                  transition:
                    "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <g
                  style={{
                    transform: isHovered ? "scale(1.07)" : "scale(1)",
                    transformOrigin: "0 0",
                    transition:
                      "transform 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease",
                    opacity: isOtherHovered ? 0.3 : 1,
                  }}
                >
                  {isHovered && (
                    <>
                      <circle
                        cx={0}
                        cy={0}
                        r={b.r + 14}
                        fill="none"
                        stroke={HOVER_COLOR}
                        strokeOpacity={0.16}
                        strokeWidth={14}
                        className="pointer-events-none"
                      />
                      <circle
                        cx={0}
                        cy={0}
                        r={b.r + 5}
                        fill="none"
                        stroke={HOVER_COLOR}
                        strokeOpacity={0.45}
                        strokeWidth={4}
                        className="pointer-events-none"
                      />
                    </>
                  )}
                  {/* Concentric dotted rings */}
                  {[0.85, 0.7, 0.55, 0.4].map((scale, ringI) => (
                    <circle
                      key={ringI}
                      cx={0}
                      cy={0}
                      r={b.r * scale}
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity={isHovered ? 0.32 : 0.12}
                      strokeWidth={0.5}
                      strokeDasharray="2 4"
                      style={{ transition: "stroke-opacity 240ms ease" }}
                    />
                  ))}
                  {/* Prevalence arc */}
                  {b.pct > 0 && (
                    <AcuteArc r={b.r} pct={b.pct} color={ARC_COLOR} />
                  )}
                  {/* Outer rim */}
                  <circle
                    cx={0}
                    cy={0}
                    r={b.r}
                    fill={
                      isHovered
                        ? "color-mix(in srgb, var(--accent) 6%, transparent)"
                        : "transparent"
                    }
                    stroke={isHovered ? HOVER_COLOR : "currentColor"}
                    strokeOpacity={isHovered ? 0.95 : 0.22}
                    strokeWidth={isHovered ? 1.8 : 0.8}
                    onMouseEnter={() => setHoverId(b.id)}
                    onMouseLeave={() =>
                      setHoverId((cur) => (cur === b.id ? null : cur))
                    }
                    onFocus={() => setHoverId(b.id)}
                    onBlur={() =>
                      setHoverId((cur) => (cur === b.id ? null : cur))
                    }
                    onClick={() => {
                      // Overview bubbles drill into the per-community detail;
                      // detail bubbles are terminal (no further flow). Bare mode
                      // is display-only, so no drill at all.
                      if (!bare && !isDetail) {
                        const ci = props.categories.indexOf(b.id);
                        if (ci >= 0) {
                          setHoverId(null);
                          setSelected(ci);
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        (e.key === "Enter" || e.key === " ") &&
                        !bare &&
                        !isDetail
                      ) {
                        e.preventDefault();
                        const ci = props.categories.indexOf(b.id);
                        if (ci >= 0) {
                          setHoverId(null);
                          setSelected(ci);
                        }
                      }
                    }}
                    tabIndex={bare || isDetail ? undefined : 0}
                    role={bare || isDetail ? undefined : "button"}
                    aria-label={
                      bare || isDetail
                        ? undefined
                        : `${b.label}: ${b.count} (${b.pct}%). View by ${entity.singular}.`
                    }
                    className="focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    style={{
                      cursor: bare || isDetail ? "default" : "pointer",
                      transition:
                        "stroke-opacity 240ms ease, fill 240ms ease, stroke-width 240ms ease",
                    }}
                  />
                  {/* Label */}
                  {(() => {
                    const lines = splitLabel(b.label);
                    const fontSize = b.r > 110 ? 15 : 12;
                    const lh = fontSize + 1;
                    return (
                      <text
                        x={0}
                        y={lines.length > 1 ? -8 - lh : -8}
                        textAnchor="middle"
                        fontSize={fontSize}
                        fontWeight={600}
                        fill="currentColor"
                        fillOpacity={isHovered ? 0.95 : 0.72}
                        className="uppercase pointer-events-none"
                        style={{
                          letterSpacing: "0.1em",
                          transition: "fill-opacity 240ms ease",
                        }}
                      >
                        {lines.map((ln, li) => (
                          <tspan key={li} x={0} dy={li === 0 ? 0 : lh}>
                            {ln}
                          </tspan>
                        ))}
                      </text>
                    );
                  })()}
                  {/* The number */}
                  <text
                    x={0}
                    y={b.r > 110 ? 22 : 14}
                    textAnchor="middle"
                    fontSize={b.r > 110 ? 34 : b.r > 80 ? 24 : 18}
                    fontWeight={300}
                    fill="currentColor"
                    fillOpacity={0.92}
                    className="num pointer-events-none"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {metric === "pct" ? b.pct : b.count.toLocaleString()}
                  </text>
                  {/* Sub-label: the count when the big number is a %, else the % */}
                  {props.showSubLabel !== false && b.r > 64 && b.pct > 0 && (
                    <text
                      x={0}
                      y={b.r > 110 ? 42 : 30}
                      textAnchor="middle"
                      fontSize={b.r > 110 ? 11 : 9.5}
                      fill={ARC_COLOR}
                      className="uppercase pointer-events-none"
                      style={{ letterSpacing: "0.16em" }}
                    >
                      {metric === "pct"
                        ? `${b.count.toLocaleString()} named it`
                        : `${b.pct}% ${isDetail ? `of ${entity.singular}` : "overall"}`}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </svg>
        {/* Text-equivalent of the bubble chart for screen readers. */}
        <ul className="sr-only">
          {bubbles.map((b) => (
            <li key={b.id}>
              {b.label}: {b.count} ({b.pct}%)
            </li>
          ))}
        </ul>
      </div>

      {/* Footer total — mirrors the matrix grand-total line. */}
      {!bare && (
      <div className="flex items-baseline justify-between gap-4 px-6 pb-5 md:px-8">
        <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/45">
          {isDetail
            ? `${problemLabel} · ${bubbles.length} ${entity.plural}`
            : `${bubbles.length} problems`}
        </div>
      </div>
      )}
    </div>
  );
}
