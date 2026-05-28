"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Universe as U, UniverseNode } from "@/lib/universe";
import { CATEGORIES, CATEGORY_COLOR } from "@/lib/categories";
import { MapUniverse } from "./MapUniverse";
import { Nav } from "./Nav";

interface MapScrollyProps {
  universe: U;
  labels: Array<{ name: string; x: number; y: number }>;
}

interface Lens {
  id: string;
  title: string;
  matcher: ((n: UniverseNode) => boolean) | null;
}

const SHORT_PROBLEM: Record<string, string> = {
  "Water or sanitation problems": "Water",
  "Drug or substance abuse": "Drugs",
  "Mental health challenges": "Mental health",
  "Gender-based violence": "GBV",
  "Poor healthcare": "Healthcare",
  "Poor education": "Education",
};

const LENSES: Lens[] = [
  { id: "all", title: "Every voice on the map", matcher: null },
  {
    id: "water",
    title: "Where water is the loudest cry",
    matcher: (n) => {
      const t = n.topPriorityText.toLowerCase();
      return (
        t.includes("water") ||
        t.includes("sanitation") ||
        t.includes("toilet") ||
        t.includes("drainage")
      );
    },
  },
  {
    id: "drugs",
    title: "Where kush has taken hold",
    matcher: (n) => {
      const t = n.topPriorityText.toLowerCase();
      return t.includes("drug") || t.includes("kush") || t.includes("substance");
    },
  },
  {
    id: "jobs",
    title: "Where jobs are the loudest cry",
    matcher: (n) => {
      const t = n.topPriorityText.toLowerCase();
      return t.includes("unemploy") || t.includes("job");
    },
  },
  {
    id: "youth",
    title: "Where the young live",
    matcher: (n) => n.ageBand === "18-25",
  },
  {
    id: "women",
    title: "Where women are speaking from",
    matcher: (n) => n.gender === "Female",
  },
  {
    id: "skills",
    title: "Where skills, not aid, is the ask",
    matcher: (n) => n.topSupport === "Skills training",
  },
];

export function MapScrolly({ universe, labels }: MapScrollyProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [query, setQuery] = useState("");
  const trackerRefs = useRef<Array<HTMLDivElement | null>>([]);

  const respondentSets = useMemo(() => {
    const respondents = universe.nodes.filter((n) => n.kind === "respondent");
    return LENSES.map((lens) => {
      if (lens.matcher === null) {
        return new Set(respondents.map((n) => n.respondentId));
      }
      const matcher = lens.matcher;
      const set = new Set<string>();
      for (const n of respondents) {
        if (matcher(n)) set.add(n.respondentId);
      }
      return set;
    });
  }, [universe.nodes]);

  const lensTopProblems = useMemo(() => {
    const respToProblems = new Map<string, Set<string>>();
    for (const n of universe.nodes) {
      if (n.kind === "mention" && n.problem) {
        let s = respToProblems.get(n.respondentId);
        if (!s) {
          s = new Set();
          respToProblems.set(n.respondentId, s);
        }
        s.add(n.problem);
      }
    }
    return respondentSets.map((set) => {
      const counts = new Map<string, number>();
      for (const id of set) {
        const probs = respToProblems.get(id);
        if (!probs) continue;
        for (const p of probs) counts.set(p, (counts.get(p) ?? 0) + 1);
      }
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([p]) => SHORT_PROBLEM[p] ?? p);
    });
  }, [universe.nodes, respondentSets]);

  const totalRespondents = useMemo(
    () => universe.nodes.filter((n) => n.kind === "respondent").length,
    [universe.nodes],
  );

  const totalCommunities = useMemo(() => {
    const set = new Set<string>();
    for (const n of universe.nodes) {
      if (n.kind === "respondent" && n.community) set.add(n.community);
    }
    return set.size;
  }, [universe.nodes]);

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
            best = parseInt(
              (e.target as HTMLElement).dataset.idx ?? "0",
              10,
            );
          }
        }
        if (best >= 0) setActiveIdx(best);
      },
      {
        rootMargin: "-30% 0px -30% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    trackerRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const goTo = (i: number) => {
    trackerRefs.current[i]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const activeFocus = LENSES[activeIdx].matcher
    ? respondentSets[activeIdx]
    : null;

  return (
    <div
      className="relative"
      style={{ height: `${LENSES.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <header className="absolute top-6 md:top-8 left-6 md:left-10 right-6 md:right-10 flex items-baseline justify-between gap-6 z-10">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/55">
              Christex Foundation · Problem Bank
            </div>
            <h1 className="mt-1.5 text-[15px] md:text-base font-semibold tracking-[-0.005em] text-foreground leading-tight max-w-[42ch]">
              Where {totalRespondents} Sierra Leoneans say it&apos;s broken — Freetown peninsula
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Nav active="map" />
            <div className="text-right text-[10px] uppercase tracking-[0.18em] flex flex-col gap-1">
              <span className="num font-medium text-foreground">
                {totalRespondents} respondents
              </span>
              <span className="num text-foreground/60">
                {totalCommunities} communities
              </span>
            </div>
          </div>
        </header>

        {/* Map fills the entire sticky viewport. UI overlays sit on top. */}
        <div className="absolute inset-0">
          <MapUniverse
            universe={universe}
            labels={labels}
            focus={activeFocus}
            searchQuery={query}
          />
        </div>

        <nav
          aria-label="Lenses"
          className="absolute right-6 md:right-10 top-32 md:top-36 flex flex-col gap-2.5 items-end z-10"
        >
          {LENSES.map((lens, i) => {
            const active = i === activeIdx;
            const passed = i < activeIdx;
            const count = respondentSets[i].size;
            const topProblems = lensTopProblems[i];
            return (
              <button
                key={lens.id}
                onClick={() => goTo(i)}
                className="group flex items-center gap-3 text-left"
              >
                {active ? (
                  <span className="flex flex-col items-end gap-1 whitespace-nowrap">
                    <span className="text-[13px] uppercase tracking-[0.16em] text-foreground font-semibold">
                      {lens.title}
                    </span>
                    <span className="flex items-baseline gap-3 text-[10px] uppercase tracking-[0.14em] font-medium">
                      {topProblems.length > 0 && (
                        <span className="text-foreground/55">
                          {topProblems.join(" · ")}
                        </span>
                      )}
                      <span className="num text-foreground/70">
                        {count} of {totalRespondents}
                      </span>
                    </span>
                  </span>
                ) : (
                  <span className="opacity-0 group-hover:opacity-100 text-[13px] uppercase tracking-[0.16em] text-foreground/75 font-semibold whitespace-nowrap transition-opacity">
                    {lens.title}
                    <span className="num font-medium ml-2 text-foreground/55">· {count}</span>
                  </span>
                )}
                <span
                  aria-hidden
                  className={
                    active
                      ? "block h-[3px] w-14 transition-all"
                      : "block h-[3px] w-8 group-hover:w-10 transition-all"
                  }
                  style={{
                    backgroundColor: active
                      ? "#0e0e0d"
                      : passed
                        ? "rgba(14, 14, 13, 0.32)"
                        : "rgba(14, 14, 13, 0.78)",
                  }}
                />
              </button>
            );
          })}
        </nav>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 md:bottom-8">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <aside
          aria-label="Legend"
          className="absolute left-6 md:left-10 bottom-24 md:bottom-28 flex flex-col gap-2 text-[11px] uppercase tracking-[0.16em]"
        >
          {CATEGORIES.map((c) => (
            <span key={c} className="flex items-center gap-2.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: CATEGORY_COLOR[c] }}
                aria-hidden
              />
              <span className="text-foreground/75 font-medium">{c}</span>
            </span>
          ))}
          <span className="flex items-center gap-2.5 mt-1 pt-2 border-t border-foreground/15">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "rgba(14,14,13,0.5)" }}
              aria-hidden
            />
            <span className="text-foreground/55 font-medium">
              Each dot · 1 voice
            </span>
          </span>
          <span className="text-[10px] tracking-[0.14em] text-foreground/40 font-medium normal-case mt-1">
            Sampled inside ward boundaries
          </span>
        </aside>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {LENSES.map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              trackerRefs.current[i] = el;
            }}
            data-idx={i}
            className="absolute left-0 right-0"
            style={{ top: `${i * 100}vh`, height: "100vh" }}
          />
        ))}
      </div>
    </div>
  );
}

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-paper/95 backdrop-blur border border-foreground/15 px-4 py-2.5 text-sm shadow-sm">
      <SearchIcon />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search community, problem, age…"
        className="bg-transparent outline-none w-72 placeholder:text-muted/70"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="text-muted hover:text-foreground"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <circle cx="5.5" cy="5.5" r="3.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8.5 8.5l3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
