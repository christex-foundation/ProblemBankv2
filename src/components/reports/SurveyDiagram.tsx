'use client';

import { useEffect, useRef, useState } from 'react';
import { PopIn } from './Charts';

// "About this survey" as a blueprint. The hub sits at the centre and the
// survey's metadata is scattered across a faint graph-paper grid (spade.com
// style). Connectors are routed orthogonally, never diagonally: a horizontal
// bus runs out from the hub at y=50 and a vertical riser branches up/down to
// each card. The top-left "Communities" node is a tree root: its riser is the
// trunk, and each community (+ FBC) is its own card branching off it. On
// desktop the whole thing is choreographed against scroll: grid fades in, the
// headline fades + scales up, the bus runs outward, risers branch and cards pop
// in top-to-bottom, the community cards cascading down the trunk. Scrubbed.
type Node = {
  id: string;
  label: string;
  value: string;
  x: number;
  y: number;
  delay: number;
  accent?: boolean;
};

const HUB = { x: 50, y: 50 };

// SVG user space matches the 16:10 box so scaling is uniform (clean dashes).
const VW = 1600;
const VH = 1000;

// Communities tree geometry (all % of the box). The trunk is the Communities
// riser; each community card branches off it down the top-left, clear of the hub.
const TRUNK_X = 8;
const ROOT_Y = 9;
const BRANCH_FIRST_Y = 15;
const BRANCH_STEP_Y = 4.3;
const STUB_END = 17;
const CARD_X = 25;
const branchY = (i: number) => BRANCH_FIRST_Y + i * BRANCH_STEP_Y;

// Two rows around the centred hub, per the sketch:
//   top:    Communities tree (left) ......... 615 forms / 609 valid (right)
//   centre:               About this survey.
//   bottom: April 2026 (left) .. 6 enumerators / English & Krio .. Conversations (right)
const NODES: Node[] = [
  { id: 'communities', label: 'Communities', value: '', x: TRUNK_X, y: ROOT_Y, delay: 0 },
  { id: 'collected', label: 'Collected', value: '615 forms', x: 80, y: 16, delay: 60 },
  { id: 'valid', label: 'Valid', value: '609', x: 80, y: 34, delay: 120, accent: true },
  { id: 'fieldwork', label: 'Field work', value: 'April 2026', x: 16, y: 74, delay: 180 },
  { id: 'enumerators', label: 'Enumerators', value: '6', x: 45, y: 73, delay: 240 },
  { id: 'languages', label: 'Languages', value: 'English & Krio', x: 45, y: 88, delay: 300 },
  { id: 'conversations', label: 'Conversations', value: 'Community leaders', x: 74, y: 78, delay: 200, accent: true },
];

const BUS_MIN = Math.min(...NODES.map((n) => n.x));
const BUS_MAX = Math.max(...NODES.map((n) => n.x));
// Vertical extent of the cards — they reveal top-to-bottom, so each card's
// timing is keyed off how far down it sits.
const Y_MIN = Math.min(...NODES.map((n) => n.y));
const Y_MAX = Math.max(...NODES.map((n) => n.y));

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Normalise p into a [a,b] sub-window → 0..1. */
const seg = (p: number, a: number, b: number) => (a === b ? 0 : clamp((p - a) / (b - a)));

/**
 * Per-card timing off the global scroll progress. Cards higher up start first;
 * lower ones follow as the section scrolls further into view. The riser draws,
 * then the card pops in just behind it.
 */
function timing(n: Node, p: number) {
  const yFrac = Y_MAX === Y_MIN ? 0 : (n.y - Y_MIN) / (Y_MAX - Y_MIN);
  const begin = 0.5 + yFrac * 0.3; // top card ~0.5 → bottom card ~0.8
  return {
    riser: seg(p, begin, begin + 0.12),
    card: seg(p, begin + 0.05, begin + 0.18),
  };
}

/** Per-community-card timing — they cascade down the trunk after it draws. */
function branchTiming(i: number, p: number) {
  const base = 0.56 + i * 0.045;
  return {
    stub: seg(p, base, base + 0.08),
    card: seg(p, base + 0.03, base + 0.13),
  };
}

/**
 * Scroll progress 0..1 for the element: 0 as it enters from the bottom, 1 once
 * it has risen into the upper viewport. Scrubbed, so scrolling back lowers it.
 * Honours prefers-reduced-motion by pinning to the finished state.
 */
function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  const [exit, setExit] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setP(1);
      setExit(0);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = rect.top + rect.height / 2;
      // Reveal: keyed to the section's centre rising to the viewport centre, so
      // everything (incl. the bottom row) is fully shown once it's centred.
      setP(clamp((vh - center) / (vh - vh * 0.5)));
      // Exit: once past centre, the diagram lifts and fades over a long stretch
      // (~0.6vh of scroll), handing off gradually to the body coming in below.
      setExit(clamp((vh * 0.4 - center) / (vh * 0.6)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return { ref, p, exit };
}

/** Registration ticks at the four corners of a card — the spade-style frame. */
function Corners({ accent }: { accent?: boolean }) {
  const c = accent ? 'border-accent/60' : 'border-foreground/40';
  return (
    <span aria-hidden>
      <span className={`absolute -left-px -top-px h-1.5 w-1.5 border-l border-t ${c}`} />
      <span className={`absolute -right-px -top-px h-1.5 w-1.5 border-r border-t ${c}`} />
      <span className={`absolute -bottom-px -left-px h-1.5 w-1.5 border-b border-l ${c}`} />
      <span className={`absolute -bottom-px -right-px h-1.5 w-1.5 border-b border-r ${c}`} />
    </span>
  );
}

type Community = { name: string; n: number; highlight?: boolean };
type Row = { name: string; n: number; highlight?: boolean; college?: boolean };

/** One community as its own compact paper card: name + respondent count. */
function CommunityCard({ name, n, highlight, college }: Row) {
  return (
    <div
      className={`relative flex w-full items-baseline gap-2 border bg-paper px-2.5 py-1.5 font-mono text-[11px] ${
        highlight ? 'border-accent/40' : 'border-foreground/15'
      }`}
    >
      <span className={highlight ? 'text-accent' : college ? 'text-foreground/60' : 'text-foreground/80'}>
        {name}
        {college && (
          <span className="ml-1 text-[8px] uppercase tracking-wider text-foreground/35">coll.</span>
        )}
      </span>
      <span className={`ml-auto tabular-nums ${highlight ? 'text-accent' : 'text-foreground/50'}`}>
        {n}
      </span>
      <Corners accent={highlight} />
    </div>
  );
}

/** The bordered metadata card (presentational). */
function CardBox({ label, value, accent }: Node) {
  return (
    <div
      className={`relative border bg-paper px-4 py-3 text-center font-mono ${
        accent ? 'border-accent/30' : 'border-foreground/15'
      }`}
    >
      <div className="text-[9px] uppercase tracking-[0.22em] text-foreground/45">{label}</div>
      <div className={`mt-1 text-sm font-medium ${accent ? 'text-accent' : 'text-foreground'}`}>
        {value}
      </div>
      <Corners accent={accent} />
    </div>
  );
}

export function SurveyDiagram({
  description,
  communities = [],
  college,
  asked = [],
}: {
  description?: string;
  communities?: Community[];
  college?: { name: string; n: number };
  asked?: string[];
}) {
  const { ref, p, exit } = useScrollProgress<HTMLDivElement>();

  // Timeline (all scrubbed off the single progress value):
  const grid = seg(p, 0.0, 0.2); // grid fades in first
  const head = seg(p, 0.12, 0.44); // headline fades + scales up
  const bus = seg(p, 0.42, 0.64); // bus runs outward from the hub
  const rootReveal = seg(p, 0.5, 0.58); // "COMMUNITIES" root label
  const askedReveal = seg(p, 0.62, 0.92); // "What we asked" chips, last to arrive

  // Community + college rows for the tree.
  const rows: Row[] = [
    ...communities,
    ...(college ? [{ name: college.name, n: college.n, college: true }] : []),
  ];

  return (
    <div ref={ref}>
      {/* ── Desktop: scatter on the grid, choreographed by scroll ──── */}
      <div
        className="hidden md:block"
        style={{ opacity: 1 - exit, transform: `translateY(${-exit * 26}px)` }}
      >
        <div className="relative aspect-[16/10] w-full">
        {/* Faint graph-paper grid, faded at the edges */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: grid,
            backgroundImage:
              'repeating-linear-gradient(to right, color-mix(in srgb, var(--foreground) 6%, transparent) 0 1px, transparent 1px 28px),' +
              'repeating-linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 6%, transparent) 0 1px, transparent 1px 28px)',
            maskImage: 'radial-gradient(ellipse 82% 82% at 50% 50%, #000 70%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 82% 82% at 50% 50%, #000 70%, transparent 100%)',
          }}
        />

        {/* Connector traces drawn with stroke-dash: bus runs out, risers branch */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${VW} ${VH}`}
          aria-hidden
        >
          {/* bus halves, each drawing outward from the hub */}
          {[BUS_MIN, BUS_MAX].map((end) => (
            <path
              key={end}
              d={`M ${HUB.x * 16} ${HUB.y * 10} H ${end * 16}`}
              fill="none"
              stroke="var(--foreground)"
              strokeOpacity={0.2}
              strokeWidth={1.4}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - bus}
            />
          ))}
          {/* a riser per card (the Communities riser is the tree trunk) */}
          {NODES.map((n) => {
            const { riser } = timing(n, p);
            return (
              <path
                key={n.id}
                d={`M ${n.x * 16} ${HUB.y * 10} V ${n.y * 10}`}
                fill="none"
                stroke={n.accent ? 'var(--accent)' : 'var(--foreground)'}
                strokeOpacity={n.accent ? 0.42 : 0.2}
                strokeWidth={1.4}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - riser}
              />
            );
          })}
          {/* a branch off the trunk to each community card */}
          {rows.map((r, i) => (
            <path
              key={r.name}
              d={`M ${TRUNK_X * 16} ${branchY(i) * 10} H ${STUB_END * 16}`}
              fill="none"
              stroke={r.highlight ? 'var(--accent)' : 'var(--foreground)'}
              strokeOpacity={r.highlight ? 0.42 : 0.22}
              strokeWidth={1.4}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - branchTiming(i, p).stub}
            />
          ))}
        </svg>

        {/* fine crosshairs where each riser taps the bus (fade with the riser) */}
        {NODES.map((n) => {
          const { riser } = timing(n, p);
          const c = n.accent ? 'bg-accent/55' : 'bg-foreground/30';
          return (
            <span
              key={n.id}
              aria-hidden
              className="absolute"
              style={{ left: `${n.x}%`, top: `${HUB.y}%`, opacity: riser }}
            >
              <span className={`absolute left-0 top-0 h-px w-2 -translate-x-1/2 -translate-y-1/2 ${c}`} />
              <span className={`absolute left-0 top-0 h-2 w-px -translate-x-1/2 -translate-y-1/2 ${c}`} />
            </span>
          );
        })}

        {/* scattered cards — each pops in just behind its riser (tree node skipped) */}
        {NODES.filter((n) => n.id !== 'communities').map((n) => {
          const { card } = timing(n, p);
          return (
            <div
              key={n.id}
              className="absolute"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                opacity: card,
                transform: `translate(-50%, -50%) translateY(${(1 - card) * 14}px) scale(${0.9 + 0.1 * card})`,
                willChange: 'transform, opacity',
              }}
            >
              <CardBox {...n} />
            </div>
          );
        })}

        {/* Communities: root label + an individual card per community, cascading */}
        <div
          className="absolute font-mono text-[10px] uppercase tracking-[0.22em] text-accent"
          style={{ left: `${TRUNK_X}%`, top: `${ROOT_Y}%`, transform: 'translateY(-50%)', opacity: rootReveal }}
        >
          Communities
        </div>
        {rows.map((r, i) => {
          const { card } = branchTiming(i, p);
          return (
            <div
              key={r.name}
              className="absolute w-[8.5rem]"
              style={{
                left: `${CARD_X}%`,
                top: `${branchY(i)}%`,
                opacity: card,
                transform: `translate(-50%, -50%) translateX(${(1 - card) * -6}px)`,
                willChange: 'transform, opacity',
              }}
            >
              <CommunityCard {...r} />
            </div>
          );
        })}

        {/* the hub — fades in and scales up, sits above the bus */}
        <div
          className="absolute w-fit max-w-[80%] bg-background/85 px-4 py-3 text-center backdrop-blur-[1px]"
          style={{
            left: `${HUB.x}%`,
            top: `${HUB.y}%`,
            opacity: head,
            transform: `translate(-50%, -50%) scale(${0.84 + 0.16 * head})`,
            willChange: 'transform, opacity',
          }}
        >
          <h3 className="whitespace-nowrap font-black leading-[0.95] tracking-[-0.03em] text-[3.25rem]">
            About this survey.
          </h3>
          {description && (
            <p className="mx-auto mt-4 w-full font-serif text-lg leading-relaxed text-foreground/70">
              {description}
            </p>
          )}
        </div>
        </div>

        {/* What we asked — centred, fading in/out with the grid */}
        {asked.length > 0 && (
          <div className="mt-10 text-center" style={{ opacity: askedReveal }}>
            <div className="mb-4 text-[10px] uppercase tracking-[0.22em] text-foreground/45">
              What we asked
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {asked.map((a) => (
                <span
                  key={a}
                  className="border border-foreground/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-foreground/70"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile: stacked fallback ─────────────────────────────── */}
      <div className="md:hidden">
        <h3 className="text-center font-black leading-[0.95] tracking-[-0.03em] text-3xl">
          About this survey.
        </h3>
        {description && (
          <p className="mx-auto mt-4 max-w-[44ch] text-center font-serif text-base leading-relaxed text-foreground/70">
            {description}
          </p>
        )}
        {rows.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 text-[10px] uppercase tracking-[0.22em] text-accent">Communities</div>
            <div className="grid grid-cols-2 gap-3">
              {rows.map((r) => (
                <CommunityCard key={r.name} {...r} />
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {NODES.filter((n) => n.id !== 'communities').map((n) => (
            <PopIn key={n.id} delay={n.delay}>
              <CardBox {...n} />
            </PopIn>
          ))}
        </div>
        {asked.length > 0 && (
          <div className="mt-8 text-center">
            <div className="mb-4 text-[10px] uppercase tracking-[0.22em] text-foreground/45">
              What we asked
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {asked.map((a) => (
                <PopIn
                  key={a}
                  className="border border-foreground/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-foreground/70"
                >
                  {a}
                </PopIn>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
