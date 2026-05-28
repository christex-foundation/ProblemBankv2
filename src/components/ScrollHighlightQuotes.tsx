"use client";

import { useEffect, useRef, useState } from "react";
import type { SurveyResponse } from "@/lib/types";

interface Props {
  quotes: SurveyResponse[];
}

export function ScrollHighlightQuotes({ quotes }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const compute = () => {
      // Active = whichever quote is closest to the bottom portion of the
      // viewport, since the sticky hero occupies the top.
      const focus = window.innerHeight * 0.75;
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
  }, [quotes.length]);

  return (
    <section className="relative px-6 md:px-10">
      <div className="max-w-[560px] mx-auto">
        {quotes.map((q, i) => (
          <div
            key={q.id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="h-screen flex flex-col items-center justify-center text-center transition-opacity duration-700 ease-out"
            style={{ opacity: i === activeIndex ? 1 : 0.12 }}
          >
            <blockquote className="font-serif text-2xl md:text-3xl leading-[1.3] text-foreground">
              &ldquo;{q.whyUrgent}&rdquo;
            </blockquote>
            <div className="mt-6 text-[10px] uppercase tracking-[0.24em] text-foreground/55">
              <span className="num font-semibold text-foreground/80">
                {q.id}
              </span>
              <span className="text-foreground/25 mx-2">&middot;</span>
              <span>{q.community}</span>
              <span className="text-foreground/25 mx-2">&middot;</span>
              <span>{q.ageBand}</span>
              {q.gender && (
                <>
                  <span className="text-foreground/25 mx-2">&middot;</span>
                  <span>{q.gender}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
