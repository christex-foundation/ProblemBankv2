"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  forceCenter,
  forceCollide,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import type { Universe as U } from "@/lib/universe";
import { CATEGORY_COLOR, PROBLEM_CATEGORY } from "@/lib/categories";
import { slugifyProblem } from "@/lib/problemSlugs";
import { ACUTE_COLOR, AcuteArc } from "./AcuteArc";
import { MapUniverse } from "./MapUniverse";
import { MatrixMapToggle, type ViewMode } from "./MatrixMapToggle";
import { MAP_LABELS } from "@/lib/communities";
import { Nav } from "./Nav";

interface MatrixViewProps {
  universe: U;
  /** Same respondents, projected onto the Freetown peninsula. Loaded from
   * map-layout.json. Used when the user toggles to the Map view. */
  mapUniverse: U;
}

interface Bubble {
  id: string;
  label: string;
  count: number;
  /** For problem bubbles: how many of the mentions are flagged top-priority. */
  acute: number;
  category: keyof typeof CATEGORY_COLOR;
  // Set after force-pack
  x: number;
  y: number;
  r: number;
}

const VIEW_W = 1300;
const VIEW_H = 820;
const MIN_R = 52;
const MAX_R = 150;

function buildBubbles(universe: U, dimension: "problem" | "community"): Bubble[] {
  if (dimension === "problem") {
    const counts = new Map<string, number>();
    const acuteCounts = new Map<string, number>();
    for (const n of universe.nodes) {
      if (n.kind === "mention" && n.problem) {
        counts.set(n.problem, (counts.get(n.problem) ?? 0) + 1);
        if (n.isAcute)
          acuteCounts.set(n.problem, (acuteCounts.get(n.problem) ?? 0) + 1);
      }
    }
    const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const max = entries[0]?.[1] ?? 1;
    return entries.map(([problem, count]) => {
      const cat = PROBLEM_CATEGORY[problem as keyof typeof PROBLEM_CATEGORY];
      // Sqrt-scale so area is proportional to count (not radius)
      const r = MIN_R + Math.sqrt(count / max) * (MAX_R - MIN_R);
      return {
        id: problem,
        label: SHORT_PROBLEM[problem] ?? problem,
        count,
        acute: acuteCounts.get(problem) ?? 0,
        category: cat,
        x: VIEW_W / 2 + (Math.random() - 0.5) * 200,
        y: VIEW_H / 2 + (Math.random() - 0.5) * 200,
        r,
      };
    });
  }
  // Community dimension — acute share would always be 100% (every respondent
  // has exactly one top-priority mention), so we leave the arc off.
  const counts = new Map<string, number>();
  for (const n of universe.nodes) {
    if (n.kind === "respondent") {
      counts.set(n.community, (counts.get(n.community) ?? 0) + 1);
    }
  }
  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] ?? 1;
  return entries.map(([community, count]) => {
    return {
      id: community,
      label: community,
      count,
      acute: 0,
      category: "Social services" as keyof typeof CATEGORY_COLOR,
      x: VIEW_W / 2 + (Math.random() - 0.5) * 200,
      y: VIEW_H / 2 + (Math.random() - 0.5) * 200,
      r: MIN_R + Math.sqrt(count / max) * (MAX_R - MIN_R),
    };
  });
}

const SHORT_PROBLEM: Record<string, string> = {
  "Water or sanitation problems": "WATER",
  "Drug or substance abuse": "DRUGS",
  Unemployment: "UNEMPLOYMENT",
  Insecurity: "INSECURITY",
  "Poor education": "EDUCATION",
  "Poor healthcare": "HEALTHCARE",
  Poverty: "POVERTY",
  "Mental health challenges": "MENTAL HEALTH",
  "Gender-based violence": "GBV",
  Other: "OTHER",
};

const PAD = 14;

function packBubbles(bubbles: Bubble[]): Bubble[] {
  // Stage 1 — full force pack with strong collide
  const sim = forceSimulation(
    bubbles as unknown as { x: number; y: number; r: number }[],
  )
    .force("center", forceCenter(VIEW_W / 2, VIEW_H / 2).strength(0.07))
    .force("x", forceX(VIEW_W / 2).strength(0.06))
    .force("y", forceY(VIEW_H / 2).strength(0.08))
    .force(
      "charge",
      forceManyBody().strength((d) => -((d as unknown as Bubble).r * 0.5)),
    )
    .force(
      "collide",
      forceCollide<Bubble>()
        .radius((d) => d.r + 8)
        .strength(1)
        .iterations(10),
    )
    .stop();
  for (let i = 0; i < 900; i++) sim.tick();

  // Stage 2 — soft clamp into bounds, then a long collide-only pass with
  // gentle X/Y centering to resolve any overlaps the clamp introduced.
  for (const b of bubbles) {
    b.x = Math.min(VIEW_W - b.r - PAD, Math.max(b.r + PAD, b.x));
    b.y = Math.min(VIEW_H - b.r - PAD, Math.max(b.r + PAD, b.y));
  }
  const settle = forceSimulation(
    bubbles as unknown as { x: number; y: number; r: number }[],
  )
    .force(
      "collide",
      forceCollide<Bubble>()
        .radius((d) => d.r + 8)
        .strength(1)
        .iterations(12),
    )
    .force("x", forceX(VIEW_W / 2).strength(0.02))
    .force("y", forceY(VIEW_H / 2).strength(0.03))
    .stop();
  for (let i = 0; i < 400; i++) settle.tick();
  // No final clamp — trust the collide-only settle. If a bubble drifts past
  // the edge slightly, the SVG just clips it; we don't want to re-introduce
  // overlaps by snapping back into bounds.
  return bubbles;
}

export function MatrixView({ universe, mapUniverse }: MatrixViewProps) {
  const router = useRouter();
  const [dimension, setDimension] = useState<"problem" | "community">("problem");
  const [viewMode, setViewMode] = useState<ViewMode>("matrix");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  // Two-stage layout: render bubbles at the canvas centre first, then on the
  // next frame swap in the packed positions. CSS transitions on the group
  // transform animate the circles smoothly into their final positions.
  useEffect(() => {
    const initial = buildBubbles(universe, dimension);
    // Stage 1: all bubbles centred — clones to keep object identity stable
    setBubbles(
      initial.map((b) => ({ ...b, x: VIEW_W / 2, y: VIEW_H / 2 })),
    );

    // Compute packed positions on a separate copy
    const packed = packBubbles(initial.map((b) => ({ ...b })));

    // Stage 2: after paint, update to packed positions → CSS transition kicks in
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
  }, [universe, dimension]);

  const total = useMemo(
    () => universe.nodes.filter((n) => n.kind === "respondent").length,
    [universe.nodes],
  );

  // For hover tooltip — find community breakdown for the hovered problem,
  // or top problems for hovered community.
  const hoverDetail = useMemo(() => {
    if (!hoverId) return null;
    if (dimension === "problem") {
      const breakdown = new Map<string, number>();
      for (const n of universe.nodes) {
        if (n.kind === "mention" && n.problem === hoverId) {
          breakdown.set(n.community, (breakdown.get(n.community) ?? 0) + 1);
        }
      }
      return Array.from(breakdown.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    }
    // community → top problems
    const breakdown = new Map<string, number>();
    for (const n of universe.nodes) {
      if (n.kind === "mention" && n.community === hoverId && n.problem) {
        breakdown.set(n.problem, (breakdown.get(n.problem) ?? 0) + 1);
      }
    }
    return Array.from(breakdown.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [hoverId, dimension, universe.nodes]);

  const hovered = bubbles.find((b) => b.id === hoverId);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Top header — brand on the left, nav on the right */}
      <header className="absolute top-6 md:top-8 left-6 md:left-10 right-6 md:right-10 z-20">
        <div className="flex items-baseline justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/55">
              Christex Foundation · Problem Bank
            </div>
            <h1 className="mt-1.5 text-[15px] font-semibold tracking-[-0.005em] leading-tight">
              The matrix
            </h1>
          </div>
          <Nav active="matrix" variant="dark" />
        </div>

        {/* Filters row — horizontal, sits under the title */}
        <div className="mt-5 flex items-center gap-8 flex-wrap">
          <FilterGroupRow label="Dimension">
            <FilterChip
              active={dimension === "problem"}
              onClick={() => setDimension("problem")}
            >
              Problem
            </FilterChip>
            <FilterChip
              active={dimension === "community"}
              onClick={() => setDimension("community")}
            >
              Community
            </FilterChip>
          </FilterGroupRow>
          <span className="h-4 w-px bg-white/15" aria-hidden />
          <FilterGroupRow label="Source">
            <FilterChip>Christex Survey</FilterChip>
          </FilterGroupRow>
          {dimension === "problem" && viewMode === "matrix" && (
            <>
              <span className="h-4 w-px bg-white/15" aria-hidden />
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ background: ACUTE_COLOR }}
                />
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/55">
                  Amber arc · top-priority share
                </span>
              </div>
            </>
          )}
          <span className="h-4 w-px bg-white/15" aria-hidden />
          <MatrixMapToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </header>

      {/* Map viz — only when toggled */}
      {viewMode === "map" && (
        <div className="absolute inset-0 flex items-center justify-center px-12 pt-44 md:pt-48 pb-24">
          <div className="relative w-full h-full max-w-[1500px]">
            <MapUniverse
              universe={mapUniverse}
              labels={MAP_LABELS}
              theme="dark"
            />
          </div>
        </div>
      )}

      {/* Bubble viz */}
      <div
        className="absolute inset-0 flex items-center justify-center px-12 pt-44 md:pt-48 pb-24"
        style={{ display: viewMode === "matrix" ? undefined : "none" }}
      >
        <div className="relative w-full h-full max-w-[1300px]">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block"
        >
          {bubbles.map((b, i) => {
            const isHovered = b.id === hoverId;
            const isOtherHovered = hoverId !== null && !isHovered;
            const tint =
              dimension === "problem"
                ? CATEGORY_COLOR[b.category]
                : "rgba(255,255,255,0.5)";
            return (
              <g
                key={b.id}
                style={{
                  // Outer transform handles position + entry stagger.
                  transform: `translate(${b.x}px, ${b.y}px)`,
                  transition:
                    "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
                  transitionDelay: `${i * 35}ms`,
                }}
              >
                {/* Inner group handles hover lift/scale + dimming */}
                <g
                  style={{
                    transform: isHovered ? "scale(1.07)" : "scale(1)",
                    transformOrigin: "0 0",
                    transition:
                      "transform 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease",
                    opacity: isOtherHovered ? 0.32 : 1,
                  }}
                >
                  {/* Three.js-style ambient glow ring — only when hovered */}
                  {isHovered && (
                    <>
                      <circle
                        cx={0}
                        cy={0}
                        r={b.r + 14}
                        fill="none"
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth={14}
                        className="pointer-events-none"
                      />
                      <circle
                        cx={0}
                        cy={0}
                        r={b.r + 5}
                        fill="none"
                        stroke="rgba(255,255,255,0.45)"
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
                      stroke={
                        isHovered
                          ? "rgba(255,255,255,0.45)"
                          : "rgba(255,255,255,0.18)"
                      }
                      strokeWidth={0.5}
                      strokeDasharray="2 4"
                      style={{ transition: "stroke 240ms ease" }}
                    />
                  ))}
                  {/* Acute-mention arc — visible only on the problem
                      dimension; on community bubbles every respondent has an
                      acute mention so the share is meaningless. */}
                  {dimension === "problem" && b.acute > 0 && (
                    <AcuteArc
                      r={b.r}
                      pct={Math.round((b.acute / Math.max(1, b.count)) * 100)}
                    />
                  )}
                  {/* Outer rim */}
                  <circle
                    cx={0}
                    cy={0}
                    r={b.r}
                    fill={isHovered ? "rgba(255,255,255,0.06)" : "transparent"}
                    stroke={
                      isHovered
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(255,255,255,0.25)"
                    }
                    strokeWidth={isHovered ? 1.6 : 0.8}
                    onMouseEnter={() => setHoverId(b.id)}
                    onMouseLeave={() =>
                      setHoverId((cur) => (cur === b.id ? null : cur))
                    }
                    onClick={() => {
                      if (dimension === "problem") {
                        router.push(`/matrix/${slugifyProblem(b.id)}`);
                      } else {
                        // Community dimension → community overview page.
                        router.push(`/matrix/community/${slugifyProblem(b.id)}`);
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      transition:
                        "stroke 240ms ease, fill 240ms ease, stroke-width 240ms ease",
                    }}
                  />
                  {/* Label */}
                  <text
                    x={0}
                    y={-8}
                    textAnchor="middle"
                    fontSize={b.r > 130 ? 16 : 12}
                    fontWeight={500}
                    fill={
                      isHovered
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(255,255,255,0.78)"
                    }
                    className="uppercase pointer-events-none"
                    style={{
                      letterSpacing: "0.12em",
                      transition: "fill 240ms ease",
                    }}
                  >
                    {b.label}
                  </text>
                  {/* Count */}
                  <text
                    x={0}
                    y={b.r > 130 ? 22 : 14}
                    textAnchor="middle"
                    fontSize={b.r > 130 ? 36 : b.r > 90 ? 24 : 18}
                    fontWeight={300}
                    fill="white"
                    className="num pointer-events-none"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {b.count.toLocaleString()}
                  </text>
                  {/* Acute sub-label — matches MatrixDetail / MatrixCommunityDetail */}
                  {dimension === "problem" && b.r > 70 && b.acute > 0 && (
                    <text
                      x={0}
                      y={b.r > 130 ? 44 : 30}
                      textAnchor="middle"
                      fontSize={b.r > 130 ? 11 : 9.5}
                      fill={ACUTE_COLOR}
                      className="uppercase pointer-events-none"
                      style={{ letterSpacing: "0.16em" }}
                    >
                      {b.acute} acute · {Math.round((b.acute / b.count) * 100)}%
                    </text>
                  )}
                  {/* Category tint dot when in problem mode */}
                  {dimension === "problem" && (
                    <circle
                      cx={0}
                      cy={-b.r * 0.55}
                      r={isHovered ? 4.5 : 3}
                      fill={tint}
                      className="pointer-events-none"
                      style={{ transition: "r 240ms ease" }}
                    />
                  )}
                </g>
              </g>
            );
          })}
        </svg>
        {hovered && hoverDetail && hoverDetail.length > 0 && (
          <HoverCard
            bubble={hovered}
            detail={hoverDetail}
            dimension={dimension}
            viewW={VIEW_W}
            viewH={VIEW_H}
          />
        )}
        </div>
      </div>

      {/* Bottom-left grand total */}
      <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 z-20">
        <div className="num text-5xl md:text-6xl font-light tracking-tight">
          {total.toLocaleString()}
        </div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 mt-1">
          total respondents
        </div>
      </div>

    </div>
  );
}

function FilterGroupRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/55 font-medium">
        {label}
      </span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "px-3 py-1.5 text-[11px] font-medium bg-white/10 text-white rounded text-left"
          : "px-3 py-1.5 text-[11px] text-white/45 hover:text-white/75 transition-colors text-left"
      }
    >
      {children}
    </button>
  );
}

function HoverCard({
  bubble,
  detail,
  dimension,
  viewW,
  viewH,
}: {
  bubble: Bubble;
  detail: Array<[string, number]>;
  dimension: "problem" | "community";
  viewW: number;
  viewH: number;
}) {
  // Card flips to the OPPOSITE side of the bubble's location so it never
  // runs off the viewport. Uses the shared SVG container as the positioning
  // origin so percentages map cleanly to viewBox coords.
  const isOnRight = bubble.x > viewW / 2;
  const isOnTop = bubble.y < viewH / 3;
  const isOnBottom = bubble.y > (2 * viewH) / 3;
  const xPercent = (bubble.x / viewW) * 100;
  const yPercent = (bubble.y / viewH) * 100;
  const horizontalShift = bubble.r + 18;
  const verticalAnchor = isOnTop ? "0%" : isOnBottom ? "-100%" : "-50%";

  const transform = isOnRight
    ? `translate(calc(-100% - ${horizontalShift}px), ${verticalAnchor})`
    : `translate(${horizontalShift}px, ${verticalAnchor})`;

  return (
    <div
      className="pointer-events-none absolute z-30"
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform,
        transition: "left 250ms ease, top 250ms ease, transform 250ms ease",
      }}
    >
      <div className="bg-[#1a1a1a] border border-white/15 rounded-md px-4 py-3 w-[230px] shadow-xl">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-medium">
          {dimension === "problem" ? "Top communities" : "Top problems"}
        </div>
        <div className="num text-3xl font-light mt-1 leading-none">
          {bubble.count}
        </div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-white/55 mt-1">
          {bubble.label}
        </div>
        <div className="mt-3 pt-2 border-t border-white/10 flex flex-col gap-1.5">
          {detail.map(([name, n]) => (
            <div
              key={name}
              className="grid grid-cols-[1fr_auto] items-baseline gap-3 text-[11px]"
            >
              <span className="text-white/75 truncate">{name}</span>
              <span className="num text-white/95 font-medium">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
