"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Universe as U } from "@/lib/universe";
import { Nav } from "./Nav";

interface WorldViewProps {
  universe: U;
}

// Order top-to-bottom, matching Stack.
const COMMUNITY_ORDER = [
  "Aberdeen",
  "Kroobay",
  "Fourah Bay",
  "Fourah Bay College",
  "Grafton",
];

// McCandless-style palette: one hue per hub. These read like the Water World
// image — teal / gold / sage / rust / slate.
const COMMUNITY_COLOR: Record<string, string> = {
  Aberdeen: "#2d7a8a",
  Kroobay: "#c69147",
  "Fourah Bay": "#6a8b4d",
  "Fourah Bay College": "#a8533a",
  Grafton: "#7a6a5a",
};

const SHORT_PROBLEM: Record<string, string> = {
  "Water or sanitation problems": "water & sanitation",
  "Drug or substance abuse": "drug abuse",
  "Mental health challenges": "mental health",
  "Gender-based violence": "gender violence",
  "Poor healthcare": "healthcare",
  "Poor education": "education",
  Unemployment: "unemployment",
  Poverty: "poverty",
  Insecurity: "insecurity",
  Other: "other",
};

interface WorldNode {
  id: string;
  level: 0 | 1 | 2;
  label: string;
  count: number;
  /** Optional sub-label (percentage / share). */
  share?: string;
  parent: string | null;
  color: string;
  x: number;
  y: number;
  r: number;
  /** Original problem name (for tooltip). */
  problem?: string;
  /** Original community name (for tooltip). */
  community?: string;
  /** Which side of the bubble to render the text label. */
  labelSide: "left" | "right";
}

const VIEW_W = 1500;
const VIEW_H = 1240;

// Root at upper-left, mirroring "TOTAL WATER" in the McCandless image.
const ROOT_X = 240;
const ROOT_Y = 160;

// Hubs cascade down with alternating fan directions so each fan claims its
// own quadrant and doesn't bleed into the neighbour. Coordinates are tuned
// for 1500 × 1240; the resolveCollisions pass cleans up any residual overlap.
const HUB_LAYOUT: Record<string, { x: number; y: number; fanDeg: number }> = {
  Aberdeen:             { x: 600, y: 220, fanDeg: 35 },    // fan upper-right
  Kroobay:              { x: 1110, y: 410, fanDeg: 15 },   // fan right
  "Fourah Bay":         { x: 480, y: 620, fanDeg: 175 },   // fan left
  "Fourah Bay College": { x: 1150, y: 830, fanDeg: 20 },   // fan right
  Grafton:              { x: 520, y: 1050, fanDeg: 200 },  // fan lower-left
};

// Half-arc width (degrees) over which a hub's leaves fan out around fanDeg.
const FAN_HALF_ARC = 55;
// Distance from hub center to leaf center.
const LEAF_RADIUS = 175;
// Minimum gap (px) between any two non-related bubbles.
const COLLIDE_PAD = 6;

// Map mention counts to radii with a soft sqrt curve so a 30-count bubble
// reads as bigger than a 5-count one without dwarfing the small ones.
function radiusFor(count: number, scale: number, min: number) {
  return Math.max(min, Math.sqrt(count) * scale);
}

// Push overlapping leaves apart. Hubs and root stay fixed; only leaves move.
// A leaf is never pushed away from its own parent hub — the connecting edge
// would shear if it were.
function resolveCollisions(nodes: WorldNode[]) {
  const leaves = nodes.filter((n) => n.level === 2);
  for (let iter = 0; iter < 80; iter++) {
    let moved = false;
    for (let i = 0; i < leaves.length; i++) {
      const L = leaves[i];
      for (const N of nodes) {
        if (N === L) continue;
        if (L.parent === N.id) continue;
        const dx = L.x - N.x;
        const dy = L.y - N.y;
        const d2 = dx * dx + dy * dy;
        const minDist = L.r + N.r + COLLIDE_PAD;
        if (d2 < minDist * minDist && d2 > 0.0001) {
          const dist = Math.sqrt(d2);
          const overlap = minDist - dist;
          const ux = dx / dist;
          const uy = dy / dist;
          // Leaf-vs-leaf shares the push; leaf-vs-hub/root absorbs the full push.
          const shareSelf = N.level === 2 ? 0.5 : 1;
          L.x += ux * overlap * shareSelf;
          L.y += uy * overlap * shareSelf;
          if (N.level === 2) {
            N.x -= ux * overlap * 0.5;
            N.y -= uy * overlap * 0.5;
          }
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

function buildWorld(universe: U): WorldNode[] {
  const respondents = universe.nodes.filter((n) => n.kind === "respondent");
  const totalRespondents = respondents.length;

  // Count respondents per community.
  const respByCommunity = new Map<string, number>();
  for (const n of respondents) {
    respByCommunity.set(n.community, (respByCommunity.get(n.community) ?? 0) + 1);
  }

  // Count distinct problem mentions per community.
  // A respondent who mentions a problem multiple ways still counts once.
  const mentionsByCommunityProblem = new Map<string, Map<string, number>>();
  for (const n of universe.nodes) {
    if (n.kind !== "mention" || !n.problem) continue;
    let inner = mentionsByCommunityProblem.get(n.community);
    if (!inner) {
      inner = new Map();
      mentionsByCommunityProblem.set(n.community, inner);
    }
    inner.set(n.problem, (inner.get(n.problem) ?? 0) + 1);
  }

  const nodes: WorldNode[] = [];

  // Root — small translucent ring up top-left, like "TOTAL WATER".
  nodes.push({
    id: "root",
    level: 0,
    label: "ALL VOICES",
    count: totalRespondents,
    share: "100%",
    parent: null,
    color: "var(--foreground)",
    x: ROOT_X,
    y: ROOT_Y,
    r: 38,
    labelSide: "right",
  });

  for (const community of COMMUNITY_ORDER) {
    const hub = HUB_LAYOUT[community];
    if (!hub) continue;
    const count = respByCommunity.get(community) ?? 0;
    const color = COMMUNITY_COLOR[community] ?? "#888";
    const share = `${Math.round((count / totalRespondents) * 100)}%`;
    // If the fan points to the right, push the hub label to the left so it
    // doesn't collide with the leaves; vice versa.
    const fanGoesRight = Math.cos(hub.fanDeg * (Math.PI / 180)) > 0;
    nodes.push({
      id: `c:${community}`,
      level: 1,
      label: community,
      count,
      share,
      parent: "root",
      color,
      x: hub.x,
      y: hub.y,
      r: radiusFor(count, 5.4, 22),
      community,
      labelSide: fanGoesRight ? "left" : "right",
    });

    // Top 5 problems for this community as leaves, fanned in a radial arc
    // around the hub's fanDeg direction.
    const inner = mentionsByCommunityProblem.get(community);
    if (!inner) continue;
    const problems = Array.from(inner.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const totalMentionsHere = problems.reduce((s, [, c]) => s + c, 0) || 1;
    const n = problems.length;
    const arcStart = hub.fanDeg - FAN_HALF_ARC;
    const arcStep = n > 1 ? (FAN_HALF_ARC * 2) / (n - 1) : 0;

    for (let j = 0; j < n; j++) {
      const [problem, pcount] = problems[j];
      const angle = (arcStart + j * arcStep) * (Math.PI / 180);
      // Stretch radius slightly for the biggest leaf so a busy fan reads cleanly.
      const r = LEAF_RADIUS + (j === 0 ? 28 : 0);
      const lx = hub.x + r * Math.cos(angle);
      const ly = hub.y + r * Math.sin(angle);
      const pshare = `${Math.round((pcount / totalMentionsHere) * 100)}%`;
      // Leaf label goes on the outer side (away from the hub).
      const leafLabelSide: "left" | "right" =
        lx >= hub.x ? "right" : "left";
      nodes.push({
        id: `p:${community}:${problem}`,
        level: 2,
        label: SHORT_PROBLEM[problem] ?? problem,
        count: pcount,
        share: pshare,
        parent: `c:${community}`,
        color,
        x: lx,
        y: ly,
        r: radiusFor(pcount, 3.4, 7),
        problem,
        community,
        labelSide: leafLabelSide,
      });
    }
  }

  resolveCollisions(nodes);

  // After collision resolution, re-derive each leaf's label side based on its
  // final position relative to its parent — a pushed leaf may have flipped.
  for (const n of nodes) {
    if (n.level !== 2 || !n.parent) continue;
    const parent = nodes.find((p) => p.id === n.parent);
    if (parent) n.labelSide = n.x >= parent.x ? "right" : "left";
  }

  return nodes;
}

// Build the scroll-driven cascade: each edge gets a [start, end] window in
// [0, 1] scroll progress. Order is per-community — first the root→hub edge,
// then that community's leaf edges (largest leaf first). The last 0.15 of
// progress is a "settled" zone so the final state stays on screen as the user
// scrolls past.
interface EdgeWindow {
  start: number;
  end: number;
}

function computeCascade(nodes: WorldNode[]): Map<string, EdgeWindow> {
  const windows = new Map<string, EdgeWindow>();
  const ACTIVE_RANGE = 0.85; // animate cascade within first 85% of scroll
  const COMMUNITY_BUDGET = ACTIVE_RANGE / COMMUNITY_ORDER.length;
  const HUB_DUR = COMMUNITY_BUDGET * 0.28;
  const LEAVES_BUDGET = COMMUNITY_BUDGET - HUB_DUR;

  for (let ci = 0; ci < COMMUNITY_ORDER.length; ci++) {
    const community = COMMUNITY_ORDER[ci];
    const blockStart = ci * COMMUNITY_BUDGET;

    // Root → community hub edge.
    windows.set(`c:${community}`, {
      start: blockStart,
      end: blockStart + HUB_DUR,
    });

    // Community → leaves, ordered by mention count desc so the biggest
    // problems reveal first.
    const leaves = nodes
      .filter((n) => n.parent === `c:${community}`)
      .sort((a, b) => b.count - a.count);
    const n = leaves.length;
    if (n === 0) continue;
    const perLeaf = LEAVES_BUDGET / n;
    const leafBlockStart = blockStart + HUB_DUR;
    for (let li = 0; li < n; li++) {
      const start = leafBlockStart + li * perLeaf;
      windows.set(leaves[li].id, { start, end: start + perLeaf });
    }
  }

  return windows;
}

function curvedPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const dx = (x2 - x1) * 0.55;
  const c1x = x1 + dx;
  const c1y = y1;
  const c2x = x2 - dx;
  const c2y = y2;
  return `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`;
}

export function WorldView({ universe }: WorldViewProps) {
  const nodes = useMemo(() => buildWorld(universe), [universe]);
  const nodeById = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes],
  );
  const edgeWindows = useMemo(() => computeCascade(nodes), [nodes]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pathLengths, setPathLengths] = useState<Map<string, number>>(
    () => new Map(),
  );
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<Map<string, SVGPathElement | null>>(new Map());

  // Fade-in the SVG on first mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Measure each connector path's total length once the SVG mounts so we can
  // animate strokeDashoffset accurately.
  useEffect(() => {
    const m = new Map<string, number>();
    for (const [id, el] of pathRefs.current.entries()) {
      if (el) m.set(id, el.getTotalLength());
    }
    setPathLengths(m);
  }, [nodes]);

  // Track scroll progress through the section (0 at top → 1 at bottom).
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const sec = sectionRef.current;
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      const total = Math.max(1, sec.offsetHeight - window.innerHeight);
      const scrolled = Math.max(0, -rect.top);
      const p = Math.max(0, Math.min(1, scrolled / total));
      setScrollProgress(p);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Helper: how far into its draw window is a given edge?
  const edgeLocalProgress = (id: string) => {
    const w = edgeWindows.get(id);
    if (!w) return 1;
    if (w.end <= w.start) return 1;
    return Math.max(0, Math.min(1, (scrollProgress - w.start) / (w.end - w.start)));
  };

  const totalRespondents = nodes[0]?.count ?? 0;
  const hovered = hoverId ? nodeById.get(hoverId) : null;

  // Subtree highlighting: when hovering a hub, light its descendants;
  // when hovering a leaf, light its ancestor chain.
  const litSet = useMemo(() => {
    if (!hoverId) return null;
    const set = new Set<string>([hoverId]);
    const hov = nodeById.get(hoverId);
    if (!hov) return set;
    if (hov.level === 1) {
      // Light all leaves with this parent.
      for (const n of nodes) {
        if (n.parent === hov.id) set.add(n.id);
      }
      set.add("root");
    } else if (hov.level === 2) {
      if (hov.parent) set.add(hov.parent);
      set.add("root");
    } else if (hov.level === 0) {
      for (const n of nodes) set.add(n.id);
    }
    return set;
  }, [hoverId, nodeById, nodes]);

  // Pinpoint who's currently being "narrated" by the scroll: the community
  // whose window contains scrollProgress. Used to soft-highlight that hub.
  const activeCommunity =
    COMMUNITY_ORDER[
      Math.min(
        COMMUNITY_ORDER.length - 1,
        Math.floor((scrollProgress / 0.85) * COMMUNITY_ORDER.length),
      )
    ];

  return (
    <div
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "320vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <header className="absolute top-6 md:top-8 left-6 md:left-10 right-6 md:right-10 flex items-baseline justify-between gap-6 z-20">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/55">
              Christex Foundation · Problem Bank
            </div>
            <h1 className="mt-1.5 text-[15px] md:text-base font-semibold tracking-[-0.005em] text-foreground leading-tight max-w-[42ch]">
              World view — voices, communities, the problems they name
            </h1>
            <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-foreground/55">
              scrolling through <span className="text-foreground font-medium">{activeCommunity}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Nav active="world" />
            <div className="text-right text-[10px] uppercase tracking-[0.18em] flex flex-col gap-1">
              <span className="num font-medium text-foreground">
                {totalRespondents} respondents
              </span>
              <span className="num text-foreground/60">5 communities</span>
            </div>
          </div>
        </header>

        <div className="absolute inset-0 flex items-center justify-center px-6 md:px-10 pt-28 pb-12">
          <div className="relative w-full h-full max-w-[1600px] flex items-center justify-center">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full max-h-full block select-none"
            role="img"
            aria-label="A McCandless-style hierarchical bubble diagram of voices, communities, and problems."
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* Connectors layer — each path draws itself as scroll progress
                enters its window, via strokeDasharray + strokeDashoffset. */}
            <g>
              {nodes.map((n) => {
                if (!n.parent) return null;
                const p = nodeById.get(n.parent);
                if (!p) return null;
                const lit = litSet ? litSet.has(n.id) && litSet.has(p.id) : true;
                const baseOpacity = n.level === 1 ? 0.34 : 0.26;
                const len = pathLengths.get(n.id);
                const localP = edgeLocalProgress(n.id);
                const dashProps =
                  len !== undefined
                    ? {
                        strokeDasharray: len,
                        strokeDashoffset: len * (1 - localP),
                      }
                    : // Until lengths are measured, hide paths so they don't flash
                      // fully drawn for one frame.
                      { strokeDasharray: "0.001 9999" as const };
                return (
                  <path
                    key={`edge-${n.id}`}
                    ref={(el) => {
                      pathRefs.current.set(n.id, el);
                    }}
                    d={curvedPath(p.x, p.y, n.x, n.y)}
                    fill="none"
                    stroke={n.color}
                    strokeWidth={n.level === 1 ? 1.1 : 0.8}
                    strokeOpacity={lit ? baseOpacity : baseOpacity * 0.18}
                    strokeLinecap="round"
                    {...dashProps}
                    style={{
                      transition:
                        "stroke-opacity 320ms ease, stroke-dashoffset 80ms linear",
                    }}
                  />
                );
              })}
            </g>

            {/* Bubbles layer */}
            <g>
              {nodes.map((n) => {
                const isHover = hoverId === n.id;
                const isOtherHovered = hoverId !== null && !isHover;
                const lit = litSet ? litSet.has(n.id) : true;
                const hoverDim = isOtherHovered && !lit ? 0.22 : 1;
                const r = isHover ? n.r * 1.45 + 2 : n.r;
                const isRoot = n.level === 0;

                // Reveal tied to scroll: hubs and root are visible from the
                // start; leaves fade in once their connecting edge starts
                // drawing.
                let reveal = 1;
                if (n.level === 2) {
                  const lp = edgeLocalProgress(n.id);
                  reveal = Math.max(0, Math.min(1, (lp - 0.05) / 0.45));
                }
                const groupOpacity = hoverDim * reveal;

                return (
                  <g
                    key={n.id}
                    onMouseEnter={() => setHoverId(n.id)}
                    onMouseLeave={() =>
                      setHoverId((cur) => (cur === n.id ? null : cur))
                    }
                    style={{
                      cursor: "default",
                      opacity: groupOpacity,
                      transition: "opacity 220ms ease",
                      pointerEvents: reveal > 0.4 ? "auto" : "none",
                    }}
                  >
                    {isHover && (
                      <>
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={n.r * 2.6 + 6}
                          fill="none"
                          stroke={n.color}
                          strokeOpacity={0.12}
                          strokeWidth={6}
                          className="pointer-events-none"
                        />
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={n.r * 1.9 + 4}
                          fill="none"
                          stroke={n.color}
                          strokeOpacity={0.3}
                          strokeWidth={1.4}
                          className="pointer-events-none"
                        />
                      </>
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r}
                      fill={isRoot ? "var(--background)" : n.color}
                      fillOpacity={
                        isRoot ? 1 : n.level === 1 ? 0.78 : 0.62
                      }
                      stroke={n.color}
                      strokeWidth={
                        isRoot ? 1.6 : n.level === 1 ? 1.4 : 0.9
                      }
                      strokeOpacity={hoverDim}
                      style={{
                        transition:
                          "r 320ms cubic-bezier(0.22, 1, 0.36, 1), fill-opacity 320ms ease, stroke-opacity 320ms ease",
                      }}
                    />

                    {(() => {
                      // Place labels on whichever side the node prefers.
                      const onRight = n.labelSide === "right";
                      const anchor: "start" | "end" = onRight ? "start" : "end";
                      const offsetMain = onRight ? n.r + 12 : -(n.r + 12);
                      const offsetLeaf = onRight ? n.r + 8 : -(n.r + 8);
                      const tx = (off: number) => n.x + off;

                      if (n.level === 0) {
                        return (
                          <>
                            <text
                              x={tx(offsetMain + (onRight ? 2 : -2))}
                              y={n.y - 4}
                              textAnchor={anchor}
                              fontSize={11}
                              fontWeight={700}
                              fill="var(--foreground)"
                              className="uppercase"
                              style={{
                                letterSpacing: "0.18em",
                                opacity: hoverDim,
                                transition: "opacity 320ms ease",
                              }}
                            >
                              {n.label}
                            </text>
                            <text
                              x={tx(offsetMain + (onRight ? 2 : -2))}
                              y={n.y + 12}
                              textAnchor={anchor}
                              fontSize={12}
                              fill="var(--foreground)"
                              className="num"
                              style={{
                                opacity: hoverDim,
                                transition: "opacity 320ms ease",
                              }}
                            >
                              {n.count} respondents
                            </text>
                          </>
                        );
                      }

                      if (n.level === 1) {
                        return (
                          <>
                            <text
                              x={tx(offsetMain)}
                              y={n.y - 4}
                              textAnchor={anchor}
                              fontSize={13}
                              fontWeight={700}
                              fill={n.color}
                              className="uppercase"
                              style={{
                                letterSpacing: "0.14em",
                                opacity: hoverDim,
                                transition: "opacity 320ms ease",
                              }}
                            >
                              {n.label}
                            </text>
                            <text
                              x={tx(offsetMain)}
                              y={n.y + 12}
                              textAnchor={anchor}
                              fontSize={11}
                              fill="var(--foreground)"
                              fillOpacity={0.7}
                              className="num"
                              style={{
                                opacity: hoverDim,
                                transition: "opacity 320ms ease",
                              }}
                            >
                              {n.count} · {n.share}
                            </text>
                          </>
                        );
                      }

                      // Leaf
                      return (
                        <>
                          <text
                            x={tx(offsetLeaf)}
                            y={n.y - 2}
                            textAnchor={anchor}
                            fontSize={10.5}
                            fill={n.color}
                            fillOpacity={0.95}
                            style={{
                              opacity: hoverDim,
                              transition: "opacity 320ms ease",
                            }}
                          >
                            {n.label}
                          </text>
                          <text
                            x={tx(offsetLeaf)}
                            y={n.y + 10}
                            textAnchor={anchor}
                            fontSize={9.5}
                            fill="var(--foreground)"
                            fillOpacity={0.55}
                            className="num"
                            style={{
                              opacity: hoverDim,
                              transition: "opacity 320ms ease",
                            }}
                          >
                            {n.count} · {n.share}
                          </text>
                        </>
                      );
                    })()}
                  </g>
                );
              })}
            </g>
          </svg>

          {hovered && <Tooltip node={hovered} />}
          </div>
        </div>

        <footer className="absolute bottom-4 left-6 md:left-10 right-6 md:right-10 text-[10px] uppercase tracking-[0.18em] text-foreground/45 flex justify-between">
          <span>after David McCandless · Information is Beautiful</span>
          <span>
            scroll · <span className="num">{Math.round(scrollProgress * 100)}%</span>
          </span>
        </footer>
      </div>
    </div>
  );
}

function Tooltip({ node }: { node: WorldNode }) {
  const left = `${(node.x / VIEW_W) * 100}%`;
  const top = `${(node.y / VIEW_H) * 100}%`;
  const flipLeft = node.x > VIEW_W * 0.7;
  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        left,
        top,
        transform: flipLeft
          ? "translate(calc(-100% - 16px), -50%)"
          : "translate(16px, -50%)",
      }}
    >
      <div className="bg-paper border border-foreground/20 px-3 py-2 text-[11px] leading-tight shadow-sm min-w-[180px]">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
          {node.level === 0
            ? "All voices"
            : node.level === 1
              ? "Community"
              : "Problem"}
        </div>
        <div className="mt-1 font-medium">{node.label}</div>
        <div className="text-muted mt-0.5">
          <span className="num">{node.count}</span>
          {node.share ? ` · ${node.share}` : ""}
        </div>
        {node.level === 2 && node.community && (
          <div className="mt-1.5 text-foreground/60">in {node.community}</div>
        )}
      </div>
    </div>
  );
}
