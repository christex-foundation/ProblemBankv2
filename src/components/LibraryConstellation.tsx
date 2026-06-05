"use client";

import { useEffect, useMemo, useState } from "react";

export interface ConstellationEntry {
  id: string;
  title: string;
  sector: string;
  urgency: "critical" | "high" | "medium" | "low";
  builders: number;
  hasPoc: boolean;
}

interface Props {
  entries: ConstellationEntry[];
  className?: string;
}

const W = 1400;
const H = 900;

// Independent sector palette for the constellation viz. This is intentionally
// NOT the survey category palette (categoryHex / --cat-*): "sector" here is a
// different taxonomy (Health, Education, Finance…). Some hues coincide with the
// brand category colours but carry a different meaning, so they are declared
// standalone rather than referencing the category tokens.
const SECTOR_COLOR: Record<string, string> = {
  Health: "#c8442a",
  Education: "#3b5b9a",
  Agriculture: "#2f5e3e",
  Finance: "#8a6d3b",
  Logistics: "#7c4dff",
  Energy: "#e09c2a",
  Infrastructure: "#4a4a48",
  Other: "#9a9690",
};

interface Placed extends ConstellationEntry {
  x: number;
  y: number;
  r: number;
  color: string;
}

function hashInt(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

function placeEntries(entries: ConstellationEntry[]): Placed[] {
  const sectors = Array.from(new Set(entries.map((e) => e.sector)));
  const clusterCenters = new Map<string, { cx: number; cy: number }>();
  sectors.forEach((s, i) => {
    const t = (i / Math.max(sectors.length, 1)) * Math.PI * 2;
    const ringR = Math.min(W, H) * 0.32;
    clusterCenters.set(s, {
      cx: W / 2 + Math.cos(t) * ringR,
      cy: H / 2 + Math.sin(t) * ringR * 0.78,
    });
  });

  return entries.map((e) => {
    const center = clusterCenters.get(e.sector) ?? { cx: W / 2, cy: H / 2 };
    const ax = (hashInt(e.id + "x", 1000) / 1000 - 0.5) * 240;
    const ay = (hashInt(e.id + "y", 1000) / 1000 - 0.5) * 200;
    const r = 4 + Math.min(e.builders, 24) * 0.55 + (e.hasPoc ? 1.5 : 0);
    return {
      ...e,
      x: center.cx + ax,
      y: center.cy + ay,
      r,
      color: SECTOR_COLOR[e.sector] ?? "#6e6a62",
    };
  });
}

export function LibraryConstellation({ entries, className }: Props) {
  const placed = useMemo(() => placeEntries(entries), [entries]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const hovered = hoverId ? placed.find((p) => p.id === hoverId) ?? null : null;

  return (
    <div className={`relative w-full h-full ${className ?? ""}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block select-none"
        role="img"
        aria-label="A constellation of Problem Bank library entries, clustered by sector."
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <rect x={0} y={0} width={W} height={H} fill="var(--background)" />

        <g>
          {placed.map((p) => {
            const isHover = hoverId === p.id;
            const isOther = hoverId !== null && !isHover;
            const opacity = isOther ? 0.32 : 1;
            const r = isHover ? p.r * 2.1 + 2 : p.r;
            return (
              <g key={p.id}>
                {isHover && (
                  <>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={p.r * 4.5}
                      fill="none"
                      stroke={p.color}
                      strokeOpacity={0.14}
                      strokeWidth={6}
                      className="pointer-events-none"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={p.r * 3.0}
                      fill="none"
                      stroke={p.color}
                      strokeOpacity={0.34}
                      strokeWidth={1.5}
                      className="pointer-events-none"
                    />
                  </>
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill={p.color}
                  fillOpacity={(p.urgency === "critical" ? 1 : 0.78) * opacity}
                  stroke={isHover ? "var(--foreground)" : "none"}
                  strokeWidth={isHover ? 1.4 : 0}
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() =>
                    setHoverId((cur) => (cur === p.id ? null : cur))
                  }
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

      {hovered && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: `${(hovered.x / W) * 100}%`,
            top: `${(hovered.y / H) * 100}%`,
            transform: "translate(14px, -50%)",
          }}
        >
          <div className="bg-paper border border-foreground/20 px-3 py-2 text-[11px] leading-tight shadow-sm min-w-[240px]">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted">
              {hovered.sector} &middot;{" "}
              <span className="text-accent font-semibold">
                {hovered.urgency.toUpperCase()}
              </span>
            </div>
            <div className="mt-1 font-medium">{hovered.title}</div>
            <div className="mt-2 pt-2 border-t border-foreground/10 text-muted">
              <span className="num font-semibold text-foreground">
                {hovered.builders}
              </span>{" "}
              builder{hovered.builders === 1 ? "" : "s"}
              {hovered.hasPoc ? " · POC live" : ""}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
