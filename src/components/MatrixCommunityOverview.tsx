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
import { CATEGORY_COLOR, PROBLEM_CATEGORY } from "@/lib/categories";
import { slugify, slugifyProblem } from "@/lib/problemSlugs";
import { ACUTE_COLOR, AcuteArc } from "./AcuteArc";
import { MapUniverse } from "./MapUniverse";
import { MatrixMapToggle, type ViewMode } from "./MatrixMapToggle";
import { MAP_LABELS } from "@/lib/communities";

interface MatrixCommunityOverviewProps {
  community: string;
  universe: U;
  mapUniverse: U;
}

const SHORT_PROBLEM: Record<string, string> = {
  "Water or sanitation problems": "WATER & SANITATION",
  "Drug or substance abuse": "DRUG ABUSE",
  "Mental health challenges": "MENTAL HEALTH",
  "Gender-based violence": "GENDER VIOLENCE",
  "Poor healthcare": "HEALTHCARE",
  "Poor education": "EDUCATION",
  Unemployment: "UNEMPLOYMENT",
  Poverty: "POVERTY",
  Insecurity: "INSECURITY",
  Other: "OTHER",
};

interface Bubble {
  id: string; // canonical Problem name
  label: string; // short upper-case label
  count: number;
  acute: number;
  category: keyof typeof CATEGORY_COLOR;
  x: number;
  y: number;
  r: number;
}

const VIEW_W = 1300;
const VIEW_H = 760;
const MIN_R = 60;
const MAX_R = 180;
const PAD = 16;

function buildBubbles(universe: U, community: string): Bubble[] {
  // For each problem flagged by respondents in THIS community, count unique
  // respondents + how many named it as their #1 priority (acute).
  const respByProblem = new Map<string, Set<string>>();
  const acuteByProblem = new Map<string, Set<string>>();

  for (const n of universe.nodes) {
    if (n.kind !== "mention") continue;
    if (!n.problem) continue;
    if (n.community !== community) continue;
    let set = respByProblem.get(n.problem);
    if (!set) {
      set = new Set();
      respByProblem.set(n.problem, set);
    }
    set.add(n.respondentId);
    if (n.isAcute) {
      let aset = acuteByProblem.get(n.problem);
      if (!aset) {
        aset = new Set();
        acuteByProblem.set(n.problem, aset);
      }
      aset.add(n.respondentId);
    }
  }

  const entries = Array.from(respByProblem.entries())
    .map(([problem, set]) => ({
      problem,
      count: set.size,
      acute: acuteByProblem.get(problem)?.size ?? 0,
    }))
    .sort((a, b) => b.count - a.count);
  if (entries.length === 0) return [];
  const max = entries[0].count;

  return entries.map((e) => ({
    id: e.problem,
    label: SHORT_PROBLEM[e.problem] ?? e.problem.toUpperCase(),
    count: e.count,
    acute: e.acute,
    category: PROBLEM_CATEGORY[e.problem as keyof typeof PROBLEM_CATEGORY],
    x: VIEW_W / 2 + (Math.random() - 0.5) * 200,
    y: VIEW_H / 2 + (Math.random() - 0.5) * 200,
    r: MIN_R + Math.sqrt(e.count / max) * (MAX_R - MIN_R),
  }));
}

function packBubbles(bubbles: Bubble[]): Bubble[] {
  if (bubbles.length === 0) return bubbles;
  const sim = forceSimulation(
    bubbles as unknown as { x: number; y: number; r: number }[],
  )
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

export function MatrixCommunityOverview({
  community,
  universe,
  mapUniverse,
}: MatrixCommunityOverviewProps) {
  const router = useRouter();
  const initial = useMemo(
    () => buildBubbles(universe, community),
    [universe, community],
  );
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("matrix");
  // Map focus: every respondent in this community.
  const focusSet = useMemo(() => {
    const set = new Set<string>();
    for (const n of universe.nodes) {
      if (n.kind === "respondent" && n.community === community) {
        set.add(n.respondentId);
      }
    }
    return set;
  }, [universe, community]);

  // Two-stage layout: bubbles emerge from canvas center, then pack into place.
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

  const totalRespondents = useMemo(() => {
    const ids = new Set<string>();
    for (const n of universe.nodes) {
      if (n.kind === "respondent" && n.community === community)
        ids.add(n.respondentId);
    }
    return ids.size;
  }, [universe, community]);
  const totalAcute = initial.reduce((s, b) => s + b.acute, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <header className="absolute top-6 md:top-8 left-6 md:left-10 right-6 md:right-10 flex items-baseline justify-between gap-6 z-20">
        <div className="min-w-0">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-white/55">
            <Link href="/matrix" className="hover:text-white transition-colors">
              Matrix
            </Link>
            <span className="text-white/30">›</span>
            <span className="text-white/55">Community</span>
            <span className="text-white/30">›</span>
            <span className="text-white">{community.toUpperCase()}</span>
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-white">
            {community}
          </h1>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-white/55">
            problems · sized by respondents who flagged each
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <Link
            href="/matrix"
            className="text-[10px] uppercase tracking-[0.22em] text-white/55 hover:text-white transition-colors"
          >
            ← Back to Matrix
          </Link>
          <MatrixMapToggle mode={viewMode} onChange={setViewMode} />
          <div className="text-right text-[10px] uppercase tracking-[0.18em] flex flex-col gap-1">
            <span className="num font-medium text-white">
              {totalRespondents} respondents
            </span>
            <span className="num text-white/55">
              {totalAcute} acute · {initial.length} problems
            </span>
          </div>
        </div>
      </header>

      {/* Legend explaining the amber acute signal. */}
      <div className="absolute top-32 md:top-36 left-6 md:left-10 z-10 max-w-[280px] border-l border-white/15 pl-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/55">
          <span
            aria-hidden
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: ACUTE_COLOR }}
          />
          <span>Acute share</span>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-white/75">
          The amber arc on each problem shows the share of{" "}
          <span className="text-white font-medium">{community}</span>{" "}
          respondents who named it as their single top priority — not just one
          of several concerns.
        </p>
      </div>

      {viewMode === "map" && (
        <div className="absolute inset-0 flex items-center justify-center px-6 md:px-10 pt-28 pb-10">
          <div className="relative w-full h-full max-w-[1500px]">
            <MapUniverse
              universe={mapUniverse}
              labels={MAP_LABELS}
              focus={focusSet}
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
          aria-label={`Problems flagged by respondents in ${community}`}
        >
          {bubbles.map((b) => {
            const isHovered = hoverId === b.id;
            const isOtherHovered = hoverId !== null && !isHovered;
            const acutePct =
              b.count > 0 ? Math.round((b.acute / b.count) * 100) : 0;
            const accent = CATEGORY_COLOR[b.category];
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
                  {b.acute > 0 && <AcuteArc r={b.r} pct={acutePct} />}
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
                    onClick={() =>
                      router.push(
                        `/matrix/${slugifyProblem(b.id)}/${slugify(community)}`,
                      )
                    }
                    style={{
                      cursor: "pointer",
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
                  <text
                    x={0}
                    y={b.r > 130 ? 22 : 14}
                    textAnchor="middle"
                    fontSize={b.r > 130 ? 36 : b.r > 90 ? 24 : 18}
                    fontWeight={300}
                    fill={
                      isHovered
                        ? "rgba(255,255,255,1)"
                        : "rgba(255,255,255,0.92)"
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
      </div>

      {initial.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white/55 text-sm">
          No respondents in {community}.
        </div>
      )}

      <footer className="absolute bottom-4 left-6 md:left-10 right-6 md:right-10 text-[10px] uppercase tracking-[0.18em] text-white/35 flex justify-between">
        <span>Christex Foundation · Problem Bank</span>
        <span>{community}</span>
      </footer>
    </div>
  );
}
