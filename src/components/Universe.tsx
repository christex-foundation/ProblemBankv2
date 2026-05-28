"use client";

import { useEffect, useMemo, useState } from "react";
import type { Universe as U, UniverseNode } from "@/lib/universe";

interface UniverseProps {
  universe: U;
  focus?: Set<string> | null;
  searchQuery?: string;
  className?: string;
}

export function Universe({
  universe,
  focus,
  searchQuery = "",
  className,
}: UniverseProps) {
  const { nodes, edges, width, height } = universe;
  const nodeById = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes],
  );

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Trigger fade-in on first mount.
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
    if (searchMatches && !searchMatches.has(n.id)) return false;
    return true;
  };

  const hovered = hoverId ? nodeById.get(hoverId) : null;

  return (
    <div className={`relative w-full h-full ${className ?? ""}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block select-none"
        role="img"
        aria-label="A network of every survey respondent and every problem mention they made."
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <rect x={0} y={0} width={width} height={height} fill="var(--background)" />

        <g>
          {edges.map((e, i) => {
            const s = nodeById.get(e.source);
            const t = nodeById.get(e.target);
            if (!s || !t) return null;
            const litS = isLit(s);
            const litT = isLit(t);
            const dim = !litS && !litT;
            const baseOpacity = e.isAcute ? 0.32 : e.weight > 1 ? 0.16 : 0.1;
            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="#0e0d0b"
                strokeOpacity={dim ? baseOpacity * 0.18 : baseOpacity}
                strokeWidth={0.65}
                style={{ transition: "stroke-opacity 320ms ease" }}
              />
            );
          })}
        </g>

        <g>
          {nodes.map((n) => {
            const isHover = hoverId === n.id;
            const isOtherHovered = hoverId !== null && !isHover;
            const lit = isLit(n);
            const litOpacity = lit ? 1 : 0.13;
            const hoverDim = isOtherHovered ? 0.32 : 1;
            const opacity = litOpacity * hoverDim;
            const r = isHover ? n.r * 2.4 + 2 : n.r;
            return (
              <g key={n.id}>
                {/* Three.js-style ambient halo — only on the hovered dot */}
                {isHover && (
                  <>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r * 4.5}
                      fill="none"
                      stroke={n.color}
                      strokeOpacity={0.14}
                      strokeWidth={6}
                      className="pointer-events-none"
                    />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r * 3.2}
                      fill="none"
                      stroke={n.color}
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
                  fill={n.color}
                  fillOpacity={(n.isAcute ? 1 : 0.85) * opacity}
                  stroke={isHover ? "var(--foreground)" : "none"}
                  strokeWidth={isHover ? 1.4 : 0}
                  onMouseEnter={() => setHoverId(n.id)}
                  onMouseLeave={() => setHoverId((cur) => (cur === n.id ? null : cur))}
                  style={{
                    cursor: "default",
                    transition:
                      "fill-opacity 320ms ease, r 280ms cubic-bezier(0.22, 1, 0.36, 1), stroke 240ms ease, stroke-width 240ms ease",
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {hovered && <Tooltip node={hovered} />}
    </div>
  );
}

function Tooltip({ node }: { node: UniverseNode }) {
  const left = `${(node.x / 1400) * 100}%`;
  const top = `${(node.y / 900) * 100}%`;
  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{ left, top, transform: "translate(12px, -50%)" }}
    >
      <div className="bg-paper border border-foreground/20 px-3 py-2 text-[11px] leading-tight shadow-sm min-w-[220px]">
        {node.kind === "respondent" ? (
          <>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
              Respondent · {node.respondentId}
            </div>
            <div className="mt-1 font-medium">{node.community}</div>
            <div className="text-muted mt-0.5">
              {node.ageBand} · {node.gender || "—"}
            </div>
            <div className="mt-2 pt-2 border-t border-foreground/10">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
                Top priority
              </div>
              <div className="font-medium">{node.topPriorityText}</div>
            </div>
            {node.whyUrgent && (
              <div className="mt-2 pt-2 border-t border-foreground/10 max-w-[280px]">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  In their words
                </div>
                <div className="mt-1 italic text-foreground/85 leading-snug whitespace-normal">
                  &ldquo;{node.whyUrgent}&rdquo;
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
              Mention · {node.respondentId}
            </div>
            <div className="mt-1 font-medium">{node.problem}</div>
            <div className="text-muted mt-0.5">
              {node.community} · {node.ageBand} · {node.gender || "—"}
            </div>
            {node.isAcute && (
              <div className="mt-2 inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] border border-foreground">
                Acute · top priority
              </div>
            )}
            {node.whyUrgent && (
              <div className="mt-2 pt-2 border-t border-foreground/10 max-w-[280px]">
                <div className="mt-1 italic text-foreground/85 leading-snug whitespace-normal">
                  &ldquo;{node.whyUrgent}&rdquo;
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
