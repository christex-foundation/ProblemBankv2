"use client";

import { useEffect, useMemo, useState } from "react";
import type { Universe as U, UniverseNode } from "@/lib/universe";

interface MapUniverseProps {
  universe: U;
  /** Pre-projected label positions and text. */
  labels: Array<{ name: string; x: number; y: number }>;
  focus?: Set<string> | null;
  searchQuery?: string;
  className?: string;
  /** Visual theme. `light` (default) is the original `/map` look. `dark`
   * is used when embedded inside the Matrix's #0a0a0a canvas. */
  theme?: "light" | "dark";
  /** When set, only mention nodes whose `problem === focusProblem` are
   * considered lit (in addition to passing the `focus` respondent filter).
   * Respondent nodes are still lit by the `focus` set. Used by Matrix
   * problem pages so the map highlights ONLY the drug-abuse mentions, not
   * every mention from those respondents. */
  focusProblem?: string | null;
  /** Render the respondent-to-mention edges. Defaults to true. Pass false
   * for cleaner hero contexts where the lines read as noise. */
  showEdges?: boolean;
  /** When true, render only the mention dots for the active `focusProblem`.
   * Hides all respondent nodes and any mention nodes for other problems.
   * Used by the landing-page sticky map so each scroll scene's dots reflect
   * only its own problem. */
  problemOnly?: boolean;
  /** Per-problem color override. When a mention node's `problem` matches a
   * key, the dot uses that color instead of the build-time category color.
   * Pass `PROBLEM_COLOR` from `lib/categories` to paint each problem in its
   * own signature hue. */
  problemColors?: Record<string, string>;
}

// On the dark background the data's native colours (greys + dark category
// hues) almost vanish. Map them to brighter variants so the dots actually
// read against #0a0a0a. Light theme passes the original colour through.
function colorForTheme(
  color: string,
  isAcute: boolean,
  theme: "light" | "dark",
): string {
  if (theme === "light") return color;
  // Build-script colours (see scripts/build-data.mjs):
  //   GREY      = "#1c1b18"            — non-acute mentions
  //   Economy   = "#c8442a"  (red)
  //   Infra     = "#2f5e3e"  (dark green)
  //   Social    = "#3b5b9a"  (blue)
  //   Safety    = "#8a6d3b"  (brown)
  switch (color.toLowerCase()) {
    case "#1c1b18":
      return "rgba(255,255,255,0.45)"; // non-acute → light grey, still recedes
    case "#c8442a":
      return "#ff7a5c";
    case "#2f5e3e":
      return "#6dbb86";
    case "#3b5b9a":
      return "#7da3e8";
    case "#8a6d3b":
      return "#d6b075";
    default:
      // Unknown colour — leave it, but boost saturation for acute dots.
      return isAcute ? color : color;
  }
}

// Per-theme colour token lookup. Keeps the JSX free of `theme === "dark" ? ...`
// branching at every paint site.
const THEMES = {
  light: {
    wrapperBg: "",
    bgFill: "var(--background)",
    edgeStroke: "#0e0d0b",
    labelFill: "var(--foreground)",
    labelOutline: "var(--background)",
    dotHoverStroke: "var(--foreground)",
    tooltipCard: "bg-paper border border-foreground/20",
    tooltipText: "text-foreground",
    tooltipMuted: "text-muted",
    tooltipDivider: "border-foreground/10",
    tooltipItalic: "text-foreground/85",
    tooltipBadgeBorder: "border-foreground",
  },
  dark: {
    wrapperBg: "bg-[#0a0a0a]",
    bgFill: "#0a0a0a",
    edgeStroke: "rgba(255,255,255,0.25)",
    labelFill: "rgba(255,255,255,0.78)",
    labelOutline: "#0a0a0a",
    dotHoverStroke: "rgba(255,255,255,0.95)",
    tooltipCard: "bg-[#1a1a1a] border border-white/15 text-white",
    tooltipText: "text-white",
    tooltipMuted: "text-white/55",
    tooltipDivider: "border-white/10",
    tooltipItalic: "text-white/85",
    tooltipBadgeBorder: "border-white",
  },
} as const;

export function MapUniverse({
  universe,
  labels,
  focus,
  searchQuery = "",
  className,
  theme = "light",
  focusProblem = null,
  showEdges = true,
  problemOnly = false,
  problemColors,
}: MapUniverseProps) {
  const tc = THEMES[theme];
  const { nodes, edges, width, height } = universe;
  const nodeById = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes],
  );

  // For each respondent, infer their primary problem from their first
  // mention node. Used to color respondent dots in the same problem hue
  // as their mention dots when `problemColors` is set.
  const respondentFirstProblem = useMemo(() => {
    const map = new Map<string, string>();
    for (const n of nodes) {
      if (n.kind !== "mention" || !n.problem) continue;
      if (!map.has(n.respondentId)) {
        map.set(n.respondentId, n.problem);
      }
    }
    return map;
  }, [nodes]);

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const searchMatches = useMemo(() => {
    if (!q) return null;
    const set = new Set<string>();
    for (const n of nodes) {
      const hay =
        `${n.community} ${n.topPriorityText ?? ""} ${n.problem ?? ""} ${n.gender} ${n.ageBand} ${n.respondentId}`.toLowerCase();
      if (hay.includes(q)) set.add(n.id);
    }
    return set;
  }, [q, nodes]);

  const focusActive = focus !== null && focus !== undefined;
  const isLit = (n: UniverseNode) => {
    if (focusActive && !focus!.has(n.respondentId)) return false;
    // When viewing a specific problem, narrow further: mentions must match
    // that problem. Respondent nodes pass through (they represent the person,
    // not a specific mention).
    if (focusProblem && n.kind === "mention" && n.problem !== focusProblem) {
      return false;
    }
    if (searchMatches && !searchMatches.has(n.id)) return false;
    return true;
  };

  const hovered = hoverId ? nodeById.get(hoverId) : null;

  return (
    <div className={`relative w-full h-full ${tc.wrapperBg} ${className ?? ""}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block select-none"
        role="img"
        aria-label="A stippled map of the Freetown peninsula with one dot per survey respondent."
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Plain background — no map. Only the named clusters speak. */}
        <rect x={0} y={0} width={width} height={height} fill={tc.bgFill} />

        {/* Edges — drawn faintly so they don't fight the stipple */}
        {showEdges && (
          <g>
            {edges.map((e, i) => {
              const s = nodeById.get(e.source);
              const t = nodeById.get(e.target);
              if (!s || !t) return null;
              const dim = !isLit(s) && !isLit(t);
              const baseOpacity = e.isAcute ? 0.22 : e.weight > 1 ? 0.1 : 0.05;
              return (
                <line
                  key={i}
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke={tc.edgeStroke}
                  strokeOpacity={dim ? baseOpacity * 0.18 : baseOpacity}
                  strokeWidth={0.5}
                  style={{ transition: "stroke-opacity 320ms ease" }}
                />
              );
            })}
          </g>
        )}

        {/* Respondent dots — sit on top of the stippled land */}
        <g>
          {nodes
            .filter((n) => {
              if (!problemOnly) return true;
              if (n.kind === "respondent") return false;
              if (focusProblem && n.problem !== focusProblem) return false;
              return true;
            })
            .map((n) => {
            const isHover = hoverId === n.id;
            const isOtherHovered = hoverId !== null && !isHover;
            const lit = isLit(n);
            const litOpacity = lit ? 1 : 0.13;
            const hoverDim = isOtherHovered ? 0.32 : 1;
            const opacity = litOpacity * hoverDim;
            const r = isHover ? n.r * 2.4 + 2 : n.r;
            return (
              <g key={n.id}>
                {(() => {
                  let perProblem: string | undefined;
                  if (problemColors) {
                    if (n.kind === "mention" && n.problem) {
                      perProblem = problemColors[n.problem];
                    } else if (n.kind === "respondent") {
                      // When a problem is in focus and this respondent is
                      // lit, they ARE in focus because they flagged it —
                      // paint them in the focused problem's color.
                      if (focusProblem && lit && problemColors[focusProblem]) {
                        perProblem = problemColors[focusProblem];
                      } else {
                        const first = respondentFirstProblem.get(
                          n.respondentId,
                        );
                        if (first) perProblem = problemColors[first];
                      }
                    }
                  }
                  const baseColor = perProblem ?? n.color;
                  const dotColor = colorForTheme(baseColor, n.isAcute, theme);
                  return (
                    <>
                      {isHover && (
                        <>
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r={n.r * 4.5}
                            fill="none"
                            stroke={dotColor}
                            strokeOpacity={0.14}
                            strokeWidth={6}
                            className="pointer-events-none"
                          />
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r={n.r * 3.2}
                            fill="none"
                            stroke={dotColor}
                            strokeOpacity={0.34}
                            strokeWidth={1.5}
                            className="pointer-events-none"
                          />
                        </>
                      )}
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={r}
                        fill={dotColor}
                        fillOpacity={(n.isAcute ? 1 : 0.85) * opacity}
                        stroke={isHover ? tc.dotHoverStroke : "none"}
                        strokeWidth={isHover ? 1.4 : 0}
                  onMouseEnter={() => setHoverId(n.id)}
                  onMouseLeave={() => setHoverId((cur) => (cur === n.id ? null : cur))}
                        style={{
                          cursor: "default",
                          transition:
                            "fill-opacity 320ms ease, r 280ms cubic-bezier(0.22, 1, 0.36, 1), stroke 240ms ease, stroke-width 240ms ease",
                        }}
                      />
                    </>
                  );
                })()}
              </g>
            );
          })}
        </g>

        {/* Labels — three tiers */}
        <g
          fontFamily="var(--font-inter), system-ui, sans-serif"
          textAnchor="middle"
          paintOrder="stroke"
          stroke={tc.labelOutline}
          strokeWidth={3}
          strokeLinejoin="round"
        >
          {labels.map((l) => (
            <text
              key={l.name}
              x={l.x}
              y={l.y}
              fill={tc.labelFill}
              fontSize={12}
              fontWeight={600}
              className="uppercase tracking-[0.18em]"
            >
              {l.name}
            </text>
          ))}
        </g>
      </svg>

      {hovered && (
        <Tooltip
          node={hovered}
          viewWidth={width}
          viewHeight={height}
          theme={theme}
        />
      )}
    </div>
  );
}

function Tooltip({
  node,
  viewWidth,
  viewHeight,
  theme,
}: {
  node: UniverseNode;
  viewWidth: number;
  viewHeight: number;
  theme: "light" | "dark";
}) {
  const tc = THEMES[theme];
  const left = `${(node.x / viewWidth) * 100}%`;
  const top = `${(node.y / viewHeight) * 100}%`;
  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{ left, top, transform: "translate(12px, -50%)" }}
    >
      <div
        className={`${tc.tooltipCard} px-3 py-2 text-[11px] leading-tight shadow-sm min-w-[220px]`}
      >
        {node.kind === "respondent" ? (
          <>
            <div className={`text-[10px] uppercase tracking-[0.18em] ${tc.tooltipMuted}`}>
              Respondent · {node.respondentId}
            </div>
            <div className="mt-1 font-medium">{node.community}</div>
            <div className={`${tc.tooltipMuted} mt-0.5`}>
              {node.ageBand} · {node.gender || "—"}
            </div>
            <div className={`mt-2 pt-2 border-t ${tc.tooltipDivider}`}>
              <div className={`text-[10px] uppercase tracking-[0.18em] ${tc.tooltipMuted}`}>
                Top priority
              </div>
              <div className="font-medium">{node.topPriorityText}</div>
            </div>
            {node.whyUrgent && (
              <div className={`mt-2 pt-2 border-t ${tc.tooltipDivider} max-w-[280px]`}>
                <div className={`text-[10px] uppercase tracking-[0.18em] ${tc.tooltipMuted}`}>
                  In their words
                </div>
                <div className={`mt-1 italic ${tc.tooltipItalic} leading-snug whitespace-normal`}>
                  &ldquo;{node.whyUrgent}&rdquo;
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={`text-[10px] uppercase tracking-[0.18em] ${tc.tooltipMuted}`}>
              Mention · {node.respondentId}
            </div>
            <div className="mt-1 font-medium">{node.problem}</div>
            <div className={`${tc.tooltipMuted} mt-0.5`}>
              {node.community} · {node.ageBand} · {node.gender || "—"}
            </div>
            {node.isAcute && (
              <div
                className={`mt-2 inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] border ${tc.tooltipBadgeBorder}`}
              >
                Acute · top priority
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
