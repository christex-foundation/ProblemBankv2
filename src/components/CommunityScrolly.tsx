"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import coastline from "@/data/sierra-leone-coastline.json";

export interface CommunityScene {
  name: string;
  lon: number;
  lat: number;
  quote: string;
  respondentId: string;
  ageBand: string;
  gender: string;
}

interface Props {
  scenes: CommunityScene[];
}

const MAP_W = 600;
const MAP_H = 380;

export function CommunityScrolly({ scenes }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const compute = () => {
      const focus = window.innerHeight * 0.7;
      let best = 0;
      let bestDist = Infinity;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const c = (rect.top + rect.bottom) / 2;
        const d = Math.abs(c - focus);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActiveIndex(best);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [scenes.length]);

  // Build map projection + country path once
  const { countryPath, points } = useMemo(() => {
    const fc = coastline as FeatureCollection<Geometry>;
    const proj = geoMercator().fitSize([MAP_W, MAP_H], fc);
    const path = geoPath(proj);
    const country = path(fc) ?? "";
    const projected = scenes.map((s) => {
      const xy = proj([s.lon, s.lat]);
      return { name: s.name, x: xy?.[0] ?? 0, y: xy?.[1] ?? 0 };
    });
    return { countryPath: country, points: projected };
  }, [scenes]);

  return (
    <section className="relative px-6 md:px-10">
      <div className="max-w-[640px] mx-auto">
        {scenes.map((s, i) => (
          <div
            key={s.name}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="h-screen flex flex-col items-center justify-center text-center transition-opacity duration-700 ease-out"
            style={{ opacity: i === activeIndex ? 1 : 0.15 }}
          >
            <SLMap
              countryPath={countryPath}
              points={points}
              activeIndex={i === activeIndex ? i : -1}
              focusIndex={i}
            />

            <div className="mt-6 text-[10px] uppercase tracking-[0.32em] text-accent font-semibold">
              {s.name}
            </div>
            <blockquote className="mt-4 font-serif text-2xl md:text-3xl leading-[1.3] text-foreground max-w-[560px]">
              &ldquo;{s.quote}&rdquo;
            </blockquote>
            <div className="mt-5 text-[10px] uppercase tracking-[0.24em] text-foreground/55">
              <span className="num font-semibold text-foreground/80">
                {s.respondentId}
              </span>
              <span className="text-foreground/25 mx-2">&middot;</span>
              <span>{s.ageBand}</span>
              {s.gender && (
                <>
                  <span className="text-foreground/25 mx-2">&middot;</span>
                  <span>{s.gender}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SLMap({
  countryPath,
  points,
  focusIndex,
}: {
  countryPath: string;
  points: { name: string; x: number; y: number }[];
  activeIndex: number;
  focusIndex: number;
}) {
  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="w-full max-w-[320px] block"
      role="img"
      aria-label="Sierra Leone, with community location highlighted."
    >
      <path
        d={countryPath}
        fill="var(--paper)"
        stroke="var(--foreground)"
        strokeOpacity={0.45}
        strokeWidth={0.8}
      />
      {points.map((p, j) => {
        const isFocus = j === focusIndex;
        return (
          <g key={p.name}>
            {isFocus && (
              <circle
                cx={p.x}
                cy={p.y}
                r={14}
                fill="var(--accent)"
                fillOpacity={0.16}
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={isFocus ? 5 : 3}
              fill={isFocus ? "var(--accent)" : "var(--foreground)"}
              fillOpacity={isFocus ? 1 : 0.35}
              style={{
                transition: "r 320ms ease, fill 320ms ease, fill-opacity 320ms ease",
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
