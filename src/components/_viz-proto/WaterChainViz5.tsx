'use client';

/**
 * THROWAWAY prototypes — round 5. Expansions of the domino mechanic, one of
 * them blended with the thread:
 *
 *   ThreadedDominoes — a thread winds through a line of tiles and topples
 *                      each as the drawing front reaches it (domino × thread).
 *   BranchingDominoes — the fall forks: two causes knock into three parallel
 *                       runs, one per human cost.
 *
 * Coral on cream, scroll drives the motion. Delete with the other rounds.
 */

import { useEffect, useRef, useState } from 'react';

const ACCENT = '#c8442a';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

function useScrollProgress<T extends Element>(band: [number, number] = [0.85, 0.3]) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    const node = ref.current;
    if (!node) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = rect.top + rect.height / 2;
      setProgress(clamp((vh * band[0] - center) / (vh * band[0] - vh * band[1])));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, band]);
  return { ref, progress };
}

/* ════════════════════════════════════════════════════════════════════════
 * A — THREADED DOMINOES  (domino × thread)
 * A coral thread winds through a line of standing tiles. As the thread draws
 * along its route, the front reaches each tile and topples it; the fallen
 * tiles lie along the thread, so the line and the chain reaction are one.
 * ════════════════════════════════════════════════════════════════════════ */

const W = 1000;
const H = 360;

// tile base points along a gentle serpentine, with the chain's draw position
const NODES: { x: number; y: number; label: string; cost?: boolean; quote?: string; who?: string; tPos: number }[] = [
  { x: 110, y: 210, label: 'Water is far', tPos: 0.02 },
  { x: 320, y: 150, label: 'Fetched at midnight', tPos: 0.26 },
  {
    x: 510, y: 215, label: 'School lost', cost: true, tPos: 0.5,
    quote: 'The time used to study is what they spend searching for water.', who: 'Aberdeen',
  },
  { x: 700, y: 150, label: 'Income lost', cost: true, tPos: 0.72 },
  {
    x: 890, y: 212, label: 'Girls at risk in the dark', cost: true, tPos: 0.9,
    quote: 'Most of our girls wake at midnight to fetch water.', who: 'Aberdeen',
  },
];

function smoothPath(pts: { x: number; y: number }[]) {
  return pts.reduce((acc, pt, i) => {
    if (i === 0) return `M${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const mx = (prev.x + pt.x) / 2;
    return `${acc} C${mx} ${prev.y}, ${mx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');
}

export function ThreadedDominoes() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>();
  const d = smoothPath(NODES);
  const drawn = easeOut(p);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[1000px]">
      {/* the thread the dominoes stand on */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        aria-hidden
      >
        <path d={d} fill="none" className="text-foreground/10" stroke="currentColor" strokeWidth={2} />
        <path
          d={d}
          fill="none"
          stroke={ACCENT}
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - drawn}
          style={{ filter: `drop-shadow(0 0 6px ${ACCENT}44)` }}
        />
        {/* pull handle */}
        <circle cx={NODES[0].x - 6} cy={NODES[0].y} r={6} fill={ACCENT} opacity={clamp(p * 8)} />
      </svg>

      {/* keep the box the right height for the % positions above */}
      <div style={{ paddingTop: `${(H / W) * 100}%` }} />

      {/* the tiles, toppling as the thread front reaches each */}
      {NODES.map((n, i) => {
        const fall = seg(p, n.tPos, n.tPos + 0.14);
        const angle = lerp(0, 78, easeOut(fall)); // topple toward the next tile
        const fallen = fall > 0.7;
        return (
          <div
            key={n.label}
            className="absolute"
            style={{
              left: `${(n.x / W) * 100}%`,
              top: `${(n.y / H) * 100}%`,
              width: 14,
              height: 74,
              transformOrigin: '50% 100%',
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            }}
          >
            <div
              className={`h-full w-full rounded-[3px] ${n.cost ? 'bg-accent' : 'bg-foreground/75'}`}
              style={{ boxShadow: fallen ? `3px 5px 12px ${ACCENT}33` : '0 2px 4px rgba(0,0,0,0.18)' }}
            />
          </div>
        );
      })}

      {/* labels surface as each tile falls */}
      {NODES.map((n) => {
        const fall = seg(p, n.tPos + 0.04, n.tPos + 0.18);
        const above = n.y < H / 2;
        return (
          <div
            key={`lab-${n.label}`}
            className="absolute -translate-x-1/2 w-[150px] text-center"
            style={{
              left: `${(n.x / W) * 100}%`,
              top: `${((n.y + (above ? -116 : 14)) / H) * 100}%`,
              opacity: fall,
              transform: `translate(-50%, ${(1 - fall) * 6}px)`,
              transition: `opacity 360ms ${EASE}`,
            }}
          >
            <div className={`text-[10px] uppercase tracking-[0.2em] ${n.cost ? 'text-accent' : 'text-foreground/40'}`}>
              {n.cost ? 'Cost' : 'Cause'}
            </div>
            <div className="mt-0.5 font-semibold text-foreground text-sm leading-snug">{n.label}</div>
            {n.quote && (
              <p className="mt-1 font-serif italic text-[11px] text-foreground/55 leading-[1.4]">“{n.quote}”</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * B — BRANCHING DOMINOES  (one push, three collapses)
 * The two causes topple in a row, then the fall forks: the impact runs down
 * three parallel tracks at once, each ending in a human cost.
 * ════════════════════════════════════════════════════════════════════════ */

function Tile({ t, cost, big }: { t: number; cost?: boolean; big?: boolean }) {
  const angle = lerp(0, 80, easeOut(t));
  const fallen = t > 0.7;
  return (
    <div className="relative shrink-0" style={{ width: 14, height: big ? 86 : 64 }}>
      <div
        className={`absolute bottom-0 left-0 h-full w-full rounded-[3px] ${cost ? 'bg-accent' : 'bg-foreground/75'}`}
        style={{
          transform: `rotate(${angle}deg)`,
          transformOrigin: 'bottom right',
          boxShadow: fallen ? `3px 5px 12px ${ACCENT}33` : '0 2px 4px rgba(0,0,0,0.18)',
        }}
      />
    </div>
  );
}

const BRANCHES = [
  { label: 'School lost', start: 0.4 },
  { label: 'Income lost', start: 0.5 },
  { label: 'Girls at risk in the dark', start: 0.6 },
];

export function BranchingDominoes() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>([0.9, 0.35]);
  const c1 = seg(p, 0.04, 0.2);
  const c2 = seg(p, 0.2, 0.36);
  const forkT = seg(p, 0.34, 0.46);

  return (
    <div ref={ref} className="relative">
      {/* the two causes, in a row */}
      <div className="flex items-end gap-3">
        <Tile t={c1} big />
        <Tile t={c2} big />
        {/* fork connector */}
        <svg viewBox="0 0 120 220" className="h-[200px] w-[120px] overflow-visible" aria-hidden>
          {[40, 110, 180].map((y, i) => (
            <path
              key={y}
              d={`M0 110 C60 110, 60 ${y}, 120 ${y}`}
              fill="none"
              stroke={ACCENT}
              strokeWidth={2}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - seg(forkT, i * 0.1, 0.7 + i * 0.1)}
              opacity={0.6}
            />
          ))}
        </svg>

        {/* the three parallel runs */}
        <div className="flex-1 flex flex-col gap-7">
          {BRANCHES.map((b) => {
            const runT = (k: number) => seg(p, b.start + k * 0.07, b.start + k * 0.07 + 0.14);
            const labelT = seg(p, b.start + 0.18, b.start + 0.32);
            return (
              <div key={b.label} className="flex items-center gap-3">
                <Tile t={runT(0)} />
                <Tile t={runT(1)} />
                <Tile t={runT(2)} cost />
                <div
                  className="ml-2 border-l-2 border-accent pl-3"
                  style={{ opacity: labelT, transform: `translateX(${(1 - labelT) * 8}px)`, transition: `opacity 360ms ${EASE}` }}
                >
                  <div className="text-[10px] uppercase tracking-[0.2em] text-accent">Cost</div>
                  <div className="font-semibold text-foreground text-sm leading-snug">{b.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex gap-6 text-[10px] uppercase tracking-[0.2em] text-foreground/40">
        <span>Water is far</span>
        <span>Fetched at midnight</span>
      </div>
    </div>
  );
}
