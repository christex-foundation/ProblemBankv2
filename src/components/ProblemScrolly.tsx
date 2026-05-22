"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapUniverse } from "./MapUniverse";
import { PROBLEM_COLOR } from "@/lib/categories";
import type { Universe } from "@/lib/universe";

export interface ProblemScene {
  /** Display label shown to the user. */
  problem: string;
  /** Canonical problem string from the survey enum — fed to MapUniverse so
   * only mentions for this problem light up. */
  problemKey: string;
  quote: string;
  respondentId: string;
  community: string;
  ageBand: string;
  gender: string;
  /** Respondent IDs whose biggestProblems includes this problem. */
  focusIds: string[];
}

interface Props {
  scenes: ProblemScene[];
  universe: Universe;
  labels: Array<{ name: string; x: number; y: number }>;
}

export function ProblemScrolly({ scenes, universe, labels }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const compute = () => {
      // activeIndex flips when the comment card is centered in the viewport.
      const focus = window.innerHeight / 2;
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

  const focusSet = useMemo(
    () => new Set(scenes[activeIndex]?.focusIds ?? []),
    [scenes, activeIndex],
  );

  return (
    <section className="relative">
      {/* Sticky map fills the viewport */}
      <div className="sticky top-0 h-screen z-0 overflow-hidden bg-background">
        <div className="absolute inset-0 flex items-start justify-center">
          <div className="w-full h-full max-w-[1200px] max-h-[80vh] px-6 mt-8">
            <MapUniverse
              universe={universe}
              labels={labels}
              focus={focusSet}
              focusProblem={scenes[activeIndex]?.problemKey ?? null}
              showEdges={false}
              problemColors={PROBLEM_COLOR}
            />
          </div>
        </div>
      </div>

      {/* Comments scroll past on top of the sticky map. Each scene is
          h-screen so the user scrolls one viewport per comment. */}
      <div className="relative z-10 -mt-[100vh]">
        {scenes.map((s, i) => (
          <div
            key={s.problem}
            className="h-screen flex items-end justify-center px-6 pb-[14vh] pointer-events-none"
          >
            <div
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="bg-background text-foreground px-5 py-5 text-center w-full max-w-[420px] pointer-events-auto transition-opacity duration-500"
              style={{ opacity: i === activeIndex ? 1 : 0.35 }}
            >
              <div className="inline-block px-2 py-0.5 bg-accent text-background text-[9px] uppercase tracking-[0.26em] font-semibold mb-3">
                {s.problem}
              </div>
              <blockquote className="font-serif text-base md:text-lg leading-[1.4]">
                &ldquo;{s.quote}&rdquo;
              </blockquote>
              <div className="mt-3 text-[9px] uppercase tracking-[0.22em] text-foreground/55">
                <span className="num font-semibold text-foreground/85">
                  {s.respondentId}
                </span>
                <span className="text-foreground/25 mx-2">&middot;</span>
                <span>{s.community}</span>
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
          </div>
        ))}
      </div>
    </section>
  );
}
