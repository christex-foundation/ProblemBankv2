"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Universe as U } from "@/lib/universe";
import { CATEGORY_COLOR } from "@/lib/categories";
import { Nav } from "./Nav";

interface StackScrollyProps {
  universe: U;
}

// Order top-to-bottom in the stack (top peels off first as you scroll).
const COMMUNITY_ORDER = [
  "Aberdeen",
  "Kroobay",
  "Fourah Bay",
  "Fourah Bay College",
  "Grafton",
];

const SHORT_PROBLEM: Record<string, string> = {
  "Water or sanitation problems": "Water",
  "Drug or substance abuse": "Drugs",
  "Mental health challenges": "Mental health",
  "Gender-based violence": "GBV",
  "Poor healthcare": "Healthcare",
  "Poor education": "Education",
};

interface CommunitySummary {
  community: string;
  count: number;
  topProblems: string[];
  quotes: string[];
  category: string;
}

function buildSummaries(universe: U): CommunitySummary[] {
  const respondents = universe.nodes.filter((n) => n.kind === "respondent");
  const respMentions = new Map<string, Set<string>>();
  for (const n of universe.nodes) {
    if (n.kind === "mention" && n.problem) {
      let s = respMentions.get(n.respondentId);
      if (!s) {
        s = new Set();
        respMentions.set(n.respondentId, s);
      }
      s.add(n.problem);
    }
  }

  return COMMUNITY_ORDER.map((community) => {
    const inCommunity = respondents.filter((n) => n.community === community);
    const count = inCommunity.length;

    const counts = new Map<string, number>();
    for (const n of inCommunity) {
      const probs = respMentions.get(n.respondentId) ?? new Set();
      for (const p of probs) counts.set(p, (counts.get(p) ?? 0) + 1);
    }
    const topProblems = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([p]) => SHORT_PROBLEM[p] ?? p);

    // Collect every readable whyUrgent quote from this community for the
    // scrolling testimonial marquee. Cap at a sensible number for loop length.
    const quotes = inCommunity
      .map((n) => n.whyUrgent?.trim())
      .filter((q): q is string => !!q && q.length >= 30 && q.length <= 320)
      .filter((q, i, arr) => arr.indexOf(q) === i) // dedupe
      .slice(0, 14);

    const acuteNode = inCommunity.find((n) => n.isAcute);
    const category = acuteNode?.category ?? "Social services";

    return { community, count, topProblems, quotes, category };
  });
}

// Slab geometry — isometric 3D box: top rhombus + right and left side faces.
const SLAB_W = 580; // horizontal diameter of the top rhombus
const SLAB_H = 240; // vertical diameter of the top rhombus
const SLAB_T = 34; // slab thickness in screen Y units
const STACK_GAP = 130; // px between slab centers in default stack
const TOP_PATH = `M 0 -${SLAB_H / 2} L ${SLAB_W / 2} 0 L 0 ${SLAB_H / 2} L -${SLAB_W / 2} 0 Z`;
const RIGHT_FACE_PATH = `M ${SLAB_W / 2} 0 L 0 ${SLAB_H / 2} L 0 ${SLAB_H / 2 + SLAB_T} L ${SLAB_W / 2} ${SLAB_T} Z`;
const LEFT_FACE_PATH = `M -${SLAB_W / 2} 0 L 0 ${SLAB_H / 2} L 0 ${SLAB_H / 2 + SLAB_T} L -${SLAB_W / 2} ${SLAB_T} Z`;

// SVG viewBox dimensions. Wider than tall, with the origin shifted left of
// centre so the slabs sit right-of-centre while long left-side labels
// (e.g. "FOURAH BAY COLLEGE") still fit in the canvas.
const VIEW_W = 1180;
const VIEW_H = 880;
const VIEW_X = -640; // viewBox min-x; shifts content right of centre
const VIEW_Y = -VIEW_H / 2;

export function StackScrolly({ universe }: StackScrollyProps) {
  const summaries = useMemo(() => buildSummaries(universe), [universe]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [entrySettled, setEntrySettled] = useState(false);
  const trackerRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Trigger entry animation on first mount: slabs scale + fade in with stagger.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    const t = window.setTimeout(() => setEntrySettled(true), 1700);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const vh = window.innerHeight;
        const center = vh / 2;
        let best = -1;
        let bestDist = Infinity;
        for (const e of visible) {
          const rect = e.boundingClientRect;
          const cardCenter = rect.top + rect.height / 2;
          const d = Math.abs(cardCenter - center);
          if (d < bestDist) {
            bestDist = d;
            best = parseInt((e.target as HTMLElement).dataset.idx ?? "0", 10);
          }
        }
        if (best >= 0) setActiveIdx(best);
      },
      {
        rootMargin: "-30% 0px -30% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    trackerRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goTo = (i: number) => {
    trackerRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const totalRespondents = summaries.reduce((s, c) => s + c.count, 0);
  const active = summaries[activeIdx];

  // Y offset for each slab in the stack: centered around 0, evenly spaced.
  const baseOffsetFor = (i: number) =>
    (i - (summaries.length - 1) / 2) * STACK_GAP;

  return (
    <div
      className="relative"
      style={{ height: `${summaries.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <header className="absolute top-6 md:top-8 left-6 md:left-10 right-6 md:right-10 flex items-baseline justify-between gap-6 z-20">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/55">
              Christex Foundation · Problem Bank
            </div>
            <h1 className="mt-1.5 text-[15px] md:text-base font-semibold tracking-[-0.005em] text-foreground leading-tight max-w-[42ch]">
              Five communities, layer by layer
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Nav active="stack" />
            <div className="text-right text-[10px] uppercase tracking-[0.18em] flex flex-col gap-1">
              <span className="num font-medium text-foreground">
                {totalRespondents} respondents
              </span>
              <span className="num text-foreground/60">
                {summaries.length} communities
              </span>
            </div>
          </div>
        </header>

        <div className="absolute inset-0 flex items-center justify-center px-6 md:px-10 pt-24 md:pt-28 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-6 md:gap-10 items-center w-full max-w-7xl">
            {/* Slab stack (left, dominant) */}
            <div className="relative w-full aspect-[7/5] max-h-[82vh] mx-auto">
              <svg
                viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_W} ${VIEW_H}`}
                className="w-full h-full block"
                aria-label="Stack of five community layers"
              >
                {/* Leader lines from each slab to its label position on the left */}
                {summaries.map((s, i) => {
                  if (i < activeIdx) return null;
                  const baseY = baseOffsetFor(i);
                  const labelX = VIEW_X + 30;
                  return (
                    <g key={`lead-${s.community}`} opacity={i === activeIdx ? 1 : 0.4}>
                      <line
                        x1={-SLAB_W / 2}
                        y1={baseY}
                        x2={labelX + 8}
                        y2={baseY}
                        stroke="rgba(14,14,13,0.35)"
                        strokeWidth={0.6}
                        strokeDasharray="2 4"
                      />
                    </g>
                  );
                })}

                {/* Render slabs from BOTTOM to TOP so upper slabs paint on top */}
                {[...summaries].reverse().map((s, idxFromBottom) => {
                  const i = summaries.length - 1 - idxFromBottom;
                  const isActive = i === activeIdx;
                  const isPeeled = i < activeIdx;
                  const baseY = baseOffsetFor(i);
                  // Peeled cards lift gently and stay as outline-only ghosts —
                  // they record the journey through the stack instead of vanishing.
                  const peelOffset = isPeeled ? -(activeIdx - i) * 18 - 12 : 0;
                  const opacity = isPeeled ? 0.45 : 1;
                  const stroke = isActive
                    ? CATEGORY_COLOR[s.category as keyof typeof CATEGORY_COLOR]
                    : "rgba(14,14,13,0.4)";
                  const fill = isActive ? "var(--paper)" : "transparent";

                  // Side face fills — colored when active, muted grey for the
                  // 'still ahead' slabs, fully transparent for peeled ghosts.
                  const rightFaceFill = isActive
                    ? `${stroke}55`
                    : isPeeled
                      ? "transparent"
                      : "rgba(14,14,13,0.05)";
                  const leftFaceFill = isActive
                    ? `${stroke}88`
                    : isPeeled
                      ? "transparent"
                      : "rgba(14,14,13,0.10)";
                  // Entry stagger: bottom slabs land first, upper slabs cascade
                  // in. After ~1.7s the delay clears so peel transitions feel
                  // instantaneous.
                  const entryDelay = entrySettled
                    ? 0
                    : (summaries.length - 1 - i) * 90;
                  const transformValue = mounted
                    ? `translateY(${baseY + peelOffset}px) scale(1)`
                    : `translateY(0px) scale(0.55)`;
                  const finalOpacity = mounted ? opacity : 0;
                  return (
                    <g
                      key={s.community}
                      style={{
                        transform: transformValue,
                        transition: `transform 900ms cubic-bezier(0.22, 1, 0.36, 1) ${entryDelay}ms, opacity 700ms ease ${entryDelay}ms`,
                        opacity: finalOpacity,
                        transformOrigin: "0 0",
                      }}
                    >
                      {/* Side faces — skipped for peeled ghosts so they read as outline-only */}
                      {!isPeeled && (
                        <>
                          <path
                            d={RIGHT_FACE_PATH}
                            fill={rightFaceFill}
                            stroke={stroke}
                            strokeWidth={isActive ? 1.4 : 0.7}
                            strokeDasharray={isActive ? "" : "3 4"}
                            strokeLinejoin="round"
                          />
                          <path
                            d={LEFT_FACE_PATH}
                            fill={leftFaceFill}
                            stroke={stroke}
                            strokeWidth={isActive ? 1.4 : 0.7}
                            strokeDasharray={isActive ? "" : "3 4"}
                            strokeLinejoin="round"
                          />
                        </>
                      )}
                      {/* Top face — peeled = dashed outline, active = filled,
                          ahead-of-active = dotted wireframe */}
                      <path
                        d={TOP_PATH}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isActive ? 2.2 : isPeeled ? 0.8 : 1.0}
                        strokeDasharray={
                          isActive ? "" : isPeeled ? "2 4" : "4 5"
                        }
                        strokeLinejoin="round"
                      />
                      {/* Active slab gets a soft halo + a glyph */}
                      {isActive && (
                        <>
                          <path
                            d={TOP_PATH}
                            fill="none"
                            stroke={stroke}
                            strokeOpacity={0.18}
                            strokeWidth={10}
                            strokeLinejoin="round"
                          />
                          <circle cx={0} cy={0} r={6} fill={stroke} />
                        </>
                      )}
                      {/* Side label (left of slab) */}
                      <text
                        x={-SLAB_W / 2 - 22}
                        y={7}
                        textAnchor="end"
                        fontSize={isActive ? 19 : 16}
                        fontWeight={isActive ? 800 : 700}
                        fill={
                          isActive
                            ? "var(--foreground)"
                            : isPeeled
                              ? "rgba(14,14,13,0.55)"
                              : "rgba(14,14,13,0.85)"
                        }
                        className="uppercase"
                        style={{ letterSpacing: "0.14em" }}
                      >
                        {s.community.toUpperCase()}
                      </text>
                      {/* Count on the right */}
                      <text
                        x={SLAB_W / 2 + 22}
                        y={8}
                        textAnchor="start"
                        fontSize={isActive ? 24 : 19}
                        fontWeight={isActive ? 800 : 700}
                        fill={
                          isActive
                            ? "var(--foreground)"
                            : isPeeled
                              ? "rgba(14,14,13,0.55)"
                              : "rgba(14,14,13,0.85)"
                        }
                        className="num"
                      >
                        {s.count}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Data panel (right, compact) */}
            <div className="px-2 md:px-0">
              <div className="text-[9px] uppercase tracking-[0.22em] text-muted">
                Layer {String(activeIdx + 1).padStart(2, "0")} / {String(summaries.length).padStart(2, "0")}
              </div>
              <h2
                className="mt-1.5 text-xl md:text-2xl font-semibold tracking-tight"
                style={{ color: CATEGORY_COLOR[active.category as keyof typeof CATEGORY_COLOR] }}
              >
                {active.community}
              </h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="num text-3xl font-semibold leading-none">
                  {active.count}
                </span>
                <span className="text-xs text-muted">respondents</span>
              </div>

              <div className="mt-5 text-[9px] uppercase tracking-[0.2em] text-muted">
                Top concerns
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {active.topProblems.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] border border-foreground/25 font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>

              {active.quotes.length > 0 && (
                <div className="mt-5">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-muted">
                    In their words
                  </div>
                  <div
                    className="mt-2 relative overflow-hidden h-[260px] max-w-xs"
                    style={{
                      maskImage:
                        "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
                    }}
                  >
                    <div
                      key={active.community}
                      className="flex flex-col gap-4 animate-marquee-vertical"
                    >
                      {[...active.quotes, ...active.quotes].map((q, i) => (
                        <blockquote
                          key={i}
                          className="pl-3 border-l-2 border-foreground/30 italic text-[11px] leading-relaxed text-foreground/80"
                        >
                          &ldquo;{q}&rdquo;
                        </blockquote>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll trackers — one per community */}
      <div className="absolute inset-0 pointer-events-none">
        {summaries.map((s, i) => (
          <div
            key={s.community}
            ref={(el) => {
              trackerRefs.current[i] = el;
            }}
            data-idx={i}
            className="absolute left-0 right-0"
            style={{ top: `${i * 100}vh`, height: "100vh" }}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
