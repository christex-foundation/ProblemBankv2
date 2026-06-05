"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  forceManyBody,
  forceCenter,
} from "d3-force";
import type { Universe as U } from "@/lib/universe";
import type { Problem } from "@/lib/types";
import { CATEGORY_COLOR, PROBLEM_CATEGORY } from "@/lib/categories";
import { SHORT_PROBLEM, slugify, slugifyProblem } from "@/lib/problemSlugs";
import { ACUTE_COLOR, AcuteArc } from "./AcuteArc";
import { MapUniverse } from "./MapUniverse";
import { MatrixMapToggle, type ViewMode } from "./MatrixMapToggle";
import { MAP_LABELS } from "@/lib/communities";

interface MatrixDetailProps {
  problem: Problem;
  universe: U;
  mapUniverse: U;
}


interface Bubble {
  id: string;
  label: string;
  count: number;
  acute: number;
  x: number;
  y: number;
  r: number;
}

const VIEW_W = 1300;
const VIEW_H = 760;
const MIN_R = 60;
const MAX_R = 180;
const PAD = 16;

function buildBubbles(universe: U, problem: Problem): Bubble[] {
  // For each community, count unique respondents who flagged this problem,
  // and how many of those flagged it as their top priority (acute).
  const respByCommunity = new Map<string, Set<string>>();
  const acuteByCommunity = new Map<string, Set<string>>();

  for (const n of universe.nodes) {
    if (n.kind !== "mention" || n.problem !== problem) continue;
    let set = respByCommunity.get(n.community);
    if (!set) {
      set = new Set();
      respByCommunity.set(n.community, set);
    }
    set.add(n.respondentId);
    if (n.isAcute) {
      let aset = acuteByCommunity.get(n.community);
      if (!aset) {
        aset = new Set();
        acuteByCommunity.set(n.community, aset);
      }
      aset.add(n.respondentId);
    }
  }

  const entries = Array.from(respByCommunity.entries())
    .map(([community, set]) => ({
      community,
      count: set.size,
      acute: acuteByCommunity.get(community)?.size ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  if (entries.length === 0) return [];
  const max = entries[0].count;

  return entries.map((e) => ({
    id: e.community,
    label: e.community.toUpperCase(),
    count: e.count,
    acute: e.acute,
    x: VIEW_W / 2 + (Math.random() - 0.5) * 200,
    y: VIEW_H / 2 + (Math.random() - 0.5) * 200,
    r: MIN_R + Math.sqrt(e.count / max) * (MAX_R - MIN_R),
  }));
}

function packBubbles(bubbles: Bubble[]): Bubble[] {
  if (bubbles.length === 0) return bubbles;
  const sim = forceSimulation(bubbles as unknown as { x: number; y: number; r: number }[])
    .force("center", forceCenter(VIEW_W / 2, VIEW_H / 2))
    .force("charge", forceManyBody().strength(-30))
    .force("x", forceX(VIEW_W / 2).strength(0.06))
    .force("y", forceY(VIEW_H / 2).strength(0.08))
    .force(
      "collide",
      forceCollide<Bubble>()
        .radius((d) => d.r + PAD)
        .strength(1)
        .iterations(8),
    )
    .stop();
  for (let i = 0; i < 360; i++) sim.tick();

  for (const b of bubbles) {
    b.x = Math.min(VIEW_W - b.r - 6, Math.max(b.r + 6, b.x));
    b.y = Math.min(VIEW_H - b.r - 6, Math.max(b.r + 6, b.y));
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
  return bubbles;
}

export function MatrixDetail({
  problem,
  universe,
  mapUniverse,
}: MatrixDetailProps) {
  const router = useRouter();
  const initial = useMemo(() => buildBubbles(universe, problem), [universe, problem]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("matrix");
  // Respondent IDs of everyone who flagged this problem — used as the map's
  // focus set so the rest of the peninsula's dots fade back.
  const focusSet = useMemo(() => {
    const set = new Set<string>();
    for (const n of universe.nodes) {
      if (n.kind === "mention" && n.problem === problem) {
        set.add(n.respondentId);
      }
    }
    return set;
  }, [universe, problem]);

  // Two-stage layout matching MatrixView: render at center, then on rAF
  // swap in packed positions so CSS transitions animate them out.
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

  const category = PROBLEM_CATEGORY[problem];
  const accent = CATEGORY_COLOR[category];
  const shortLabel = SHORT_PROBLEM[problem] ?? problem.toUpperCase();
  const totalRespondents = initial.reduce((s, b) => s + b.count, 0);
  const totalAcute = initial.reduce((s, b) => s + b.acute, 0);

  return (
    <div className="min-h-screen bg-surface-dark text-on-dark relative overflow-hidden">
      <header className="absolute top-6 md:top-8 left-6 md:left-10 right-6 md:right-10 flex items-baseline justify-between gap-6 z-20">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-on-dark/55">
            <Link href="/matrix" className="hover:text-on-dark transition-soft">
              Matrix
            </Link>
            <span aria-hidden className="text-on-dark/30">›</span>
            <span aria-current="page" className="text-on-dark">{shortLabel}</span>
          </nav>
          <h1
            className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight"
            style={{ color: accent }}
          >
            {shortLabel}
          </h1>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.22em] text-on-dark/55">
            communities · sized by respondents who flagged this problem
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <Link
            href="/matrix"
            className="text-[10px] uppercase tracking-[0.22em] text-on-dark/55 hover:text-on-dark transition-soft"
          >
            ← Back to Matrix
          </Link>
          <MatrixMapToggle mode={viewMode} onChange={setViewMode} />
          <div className="text-right text-[10px] uppercase tracking-[0.22em] flex flex-col gap-1">
            <span className="num font-medium text-on-dark">
              {totalRespondents} respondents
            </span>
            <span className="num text-on-dark/55">
              {totalAcute} acute · {initial.length} communities
            </span>
          </div>
        </div>
      </header>

      {/* Legend explaining the amber acute signal — investor-facing.
          "Acute" can sound clinical, so we say it plain. */}
      <div className="hidden md:block absolute top-32 md:top-36 left-6 md:left-10 z-10 max-w-[280px] border-l border-on-dark/15 pl-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-on-dark/55">
          <span
            aria-hidden
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: ACUTE_COLOR }}
          />
          <span>Acute share</span>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-on-dark/75">
          The amber arc shows the share of respondents in each community who
          named this problem as <span className="text-on-dark font-medium">their single top priority</span>
          {" "}— not just one of several concerns. A long arc means it's an
          everyday emergency for those voices, not background noise.
        </p>
      </div>

      {viewMode === "map" && (
        <div className="absolute inset-0 flex items-center justify-center px-6 md:px-10 pt-28 pb-10">
          <div className="relative w-full h-full max-w-[1500px]">
            <MapUniverse
              universe={mapUniverse}
              labels={MAP_LABELS}
              focus={focusSet}
              focusProblem={problem}
              theme="dark"
            />
          </div>
        </div>
      )}

      <div
        className="absolute inset-0 flex items-center justify-center px-6 md:px-10 pt-28 pb-10"
        style={{ display: viewMode === "matrix" ? undefined : "none" }}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full max-h-[80vh] block select-none"
          role="img"
          aria-label={`Communities affected by ${shortLabel}`}
        >
          {bubbles.map((b) => {
            const isHovered = hoverId === b.id;
            const isOtherHovered = hoverId !== null && !isHovered;
            const acutePct = b.count > 0 ? Math.round((b.acute / b.count) * 100) : 0;
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
                    opacity: isOtherHovered ? 0.32 : 1,
                  }}
                >
                  {isHovered && (
                    <>
                      <circle
                        cx={0}
                        cy={0}
                        r={b.r + 14}
                        fill="none"
                        stroke="rgba(248,240,231,0.18)"
                        strokeWidth={14}
                        className="pointer-events-none"
                      />
                      <circle
                        cx={0}
                        cy={0}
                        r={b.r + 5}
                        fill="none"
                        stroke="rgba(248,240,231,0.45)"
                        strokeWidth={4}
                        className="pointer-events-none"
                      />
                    </>
                  )}
                  {[0.85, 0.7, 0.55, 0.4].map((scale, ringI) => (
                    <circle
                      key={ringI}
                      cx={0}
                      cy={0}
                      r={b.r * scale}
                      fill="none"
                      stroke={
                        isHovered
                          ? "rgba(248,240,231,0.45)"
                          : "rgba(248,240,231,0.18)"
                      }
                      strokeWidth={0.5}
                      strokeDasharray="2 4"
                      style={{ transition: "stroke 240ms ease" }}
                    />
                  ))}
                  {/* Acute-mention arc — drawn as a colored ring segment over
                      the outer rim to encode how many respondents named this
                      problem as their top priority. */}
                  {b.acute > 0 && (
                    <AcuteArc r={b.r} pct={acutePct} color={ACUTE_COLOR} />
                  )}
                  <circle
                    cx={0}
                    cy={0}
                    r={b.r}
                    fill={isHovered ? "rgba(248,240,231,0.06)" : "transparent"}
                    stroke={
                      isHovered
                        ? "rgba(248,240,231,0.95)"
                        : "rgba(248,240,231,0.25)"
                    }
                    strokeWidth={isHovered ? 1.6 : 0.8}
                    onMouseEnter={() => setHoverId(b.id)}
                    onMouseLeave={() =>
                      setHoverId((cur) => (cur === b.id ? null : cur))
                    }
                    onFocus={() => setHoverId(b.id)}
                    onBlur={() =>
                      setHoverId((cur) => (cur === b.id ? null : cur))
                    }
                    onClick={() =>
                      router.push(
                        `/matrix/${slugifyProblem(problem)}/${slugify(b.id)}`,
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(
                          `/matrix/${slugifyProblem(problem)}/${slugify(b.id)}`,
                        );
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${b.label}: ${b.count} respondents${
                      b.acute > 0 ? `, ${b.acute} acute` : ""
                    }. View details.`}
                    className="focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      cursor: "pointer",
                      outlineColor: "var(--on-dark)",
                      transition:
                        "stroke 240ms ease, fill 240ms ease, stroke-width 240ms ease",
                    }}
                  />
                  <text
                    x={0}
                    y={-8}
                    textAnchor="middle"
                    fontSize={b.r > 130 ? 16 : 12}
                    fontWeight={500}
                    fill={
                      isHovered
                        ? "rgba(248,240,231,0.95)"
                        : "rgba(248,240,231,0.78)"
                    }
                    className="uppercase pointer-events-none"
                    style={{
                      letterSpacing: "0.12em",
                      transition: "fill 240ms ease",
                    }}
                  >
                    {b.label}
                  </text>
                  <text
                    x={0}
                    y={b.r > 130 ? 22 : 14}
                    textAnchor="middle"
                    fontSize={b.r > 130 ? 36 : b.r > 90 ? 24 : 18}
                    fontWeight={300}
                    fill={
                      isHovered ? "rgba(248,240,231,1)" : "rgba(248,240,231,0.92)"
                    }
                    className="num pointer-events-none"
                    style={{ transition: "fill 240ms ease" }}
                  >
                    {b.count}
                  </text>
                  {b.r > 70 && b.acute > 0 && (
                    <text
                      x={0}
                      y={b.r > 130 ? 42 : 30}
                      textAnchor="middle"
                      fontSize={b.r > 130 ? 11 : 9.5}
                      fill={ACUTE_COLOR}
                      className="uppercase pointer-events-none"
                      style={{ letterSpacing: "0.16em" }}
                    >
                      {b.acute} acute · {acutePct}%
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
              {b.label}: {b.count} respondents
              {b.acute > 0 ? `, ${b.acute} acute` : ""}
            </li>
          ))}
        </ul>
      </div>

      {initial.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-on-dark/55 text-sm">
          No respondents flagged this problem.
        </div>
      )}

      <footer className="absolute bottom-4 left-6 md:left-10 right-6 md:right-10 text-[10px] uppercase tracking-[0.22em] text-on-dark/35 hidden md:flex justify-between">
        <span>Christex Foundation · Problem Bank</span>
        <span>{problem}</span>
      </footer>
    </div>
  );
}

