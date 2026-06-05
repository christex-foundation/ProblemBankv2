'use client';

/**
 * THROWAWAY prototypes — round 3. Three more reframes to sit beside the
 * keepers (the stolen clock + the igniting sentence), each on a different
 * *mechanic*:
 *
 *   ChainDominoes — physical causality: pull one, the rest fall.
 *   WeightScale   — evidence: the unprompted chain outweighs the tick-box.
 *   ThreadPull    — entanglement: one thread, everything attached to it.
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
 * A — CHAIN DOMINOES  (pull one, the rest fall)
 * The literal chain reaction: the first tile (water is far) tips and knocks
 * the next, the fall propagating into the three human costs.
 * ════════════════════════════════════════════════════════════════════════ */

const TILES: { label: string; cost?: boolean; quote?: string; who?: string }[] = [
  { label: 'Water is far' },
  { label: 'Fetched at midnight' },
  {
    label: 'School lost',
    cost: true,
    quote: 'The time used to study is what they spend searching for water.',
    who: 'Aberdeen',
  },
  { label: 'Income lost', cost: true },
  {
    label: 'Girls at risk in the dark',
    cost: true,
    quote: 'Most of our girls wake at midnight to fetch water.',
    who: 'Aberdeen',
  },
];

export function ChainDominoes() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>();
  const step = 0.16;
  return (
    <div ref={ref} className="flex flex-col md:flex-row md:items-end gap-8 md:gap-2">
      {TILES.map((tile, i) => {
        const t = seg(p, i * step, i * step + 0.2);
        const angle = lerp(0, 80, easeOut(t)); // tips clockwise, falling rightward
        const fallen = t > 0.6;
        return (
          <div key={tile.label} className="flex md:flex-col items-center gap-4 md:gap-0 md:flex-1">
            {/* the tile */}
            <div className="relative h-[100px] w-[18px] shrink-0 md:mb-5">
              <div
                className={`absolute bottom-0 left-0 h-full w-full rounded-[3px] ${
                  tile.cost ? 'bg-accent' : 'bg-foreground/75'
                }`}
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: 'bottom right',
                  boxShadow: fallen ? `4px 6px 14px ${ACCENT}33` : '0 2px 4px rgba(0,0,0,0.18)',
                  transition: 'box-shadow 300ms linear',
                }}
              />
            </div>
            {/* label reveals as the tile falls */}
            <div
              className="md:text-center"
              style={{
                opacity: t > 0.4 ? easeOut(seg(t, 0.4, 1)) : 0,
                transform: t > 0.4 ? 'none' : 'translateY(6px)',
                transition: `opacity 400ms ${EASE}, transform 400ms ${EASE}`,
              }}
            >
              <div className={`text-[10px] uppercase tracking-[0.2em] ${tile.cost ? 'text-accent' : 'text-foreground/40'}`}>
                {tile.cost ? 'Cost' : `Step ${i + 1}`}
              </div>
              <div className="mt-1 font-semibold text-foreground text-sm leading-snug">{tile.label}</div>
              {tile.quote && (
                <p className="mt-2 font-serif italic text-[12px] text-foreground/60 leading-[1.45] max-w-[22ch] md:mx-auto">
                  “{tile.quote}”
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * B — THE WEIGHT  (the unprompted chain outweighs the tick-box)
 * Anchored to the section's own thesis: "carries more weight than any
 * tick-box." A balance: the form's fixed options on the light side, the
 * lived chain (≈200 voices) stacking onto the heavy side until it tips.
 * ════════════════════════════════════════════════════════════════════════ */

const HEAVY = ['School lost', 'Income lost', 'Girls at risk', '≈200 unprompted voices'];

export function WeightScale() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>([0.9, 0.3]);
  const W = 760;
  const H = 420;
  const cx = W / 2;
  const pivotY = 120;
  const beamHalf = 240;

  const stacked = HEAVY.filter((_, i) => p > 0.15 + i * 0.16).length;
  const tilt = lerp(0, 0.22, easeOut(seg(p, 0.12, 0.85))) * (stacked / HEAVY.length || 0); // radians, right-down
  // beam ends
  const lx = cx - Math.cos(tilt) * beamHalf;
  const ly = pivotY - Math.sin(tilt) * beamHalf;
  const rx = cx + Math.cos(tilt) * beamHalf;
  const ry = pivotY + Math.sin(tilt) * beamHalf;
  const panDrop = 96;

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[700px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block overflow-visible" aria-hidden>
        {/* stand */}
        <line x1={cx} y1={pivotY} x2={cx} y2={H - 40} stroke="currentColor" className="text-foreground/25" strokeWidth={4} />
        <polygon points={`${cx - 26},${H - 40} ${cx + 26},${H - 40} ${cx},${H - 74}`} className="fill-foreground/20" />
        {/* beam */}
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="currentColor" className="text-foreground/60" strokeWidth={6} strokeLinecap="round" />
        <circle cx={cx} cy={pivotY} r={7} className="fill-foreground/70" />
        {/* pan hangers */}
        <line x1={lx} y1={ly} x2={lx} y2={ly + panDrop} className="text-foreground/30" stroke="currentColor" strokeWidth={1.5} />
        <line x1={rx} y1={ry} x2={rx} y2={ry + panDrop} stroke={ACCENT} strokeWidth={1.5} />
        {/* pans */}
        <path d={`M${lx - 60} ${ly + panDrop} Q${lx} ${ly + panDrop + 24} ${lx + 60} ${ly + panDrop}`} fill="none" className="text-foreground/40" stroke="currentColor" strokeWidth={3} />
        <path d={`M${rx - 60} ${ry + panDrop} Q${rx} ${ry + panDrop + 24} ${rx + 60} ${ry + panDrop}`} fill="none" stroke={ACCENT} strokeWidth={3} />
      </svg>

      {/* LIGHT pan content — the form's fixed options */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 text-center w-[150px]"
        style={{ left: `${(lx / W) * 100}%`, top: `${((ly + panDrop - 12) / H) * 100}%` }}
      >
        <div className="border border-foreground/25 bg-paper px-3 py-2">
          <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/40">The form</div>
          <div className="text-xs font-semibold text-foreground/70">9 fixed options</div>
          <div className="text-[10px] text-foreground/45">none of them water</div>
        </div>
      </div>

      {/* HEAVY pan content — the lived chain stacking up */}
      <div
        className="absolute -translate-x-1/2 flex flex-col-reverse items-center gap-1 w-[180px]"
        style={{ left: `${(rx / W) * 100}%`, top: `${((ry + panDrop - 16) / H) * 100}%`, transform: 'translate(-50%, -100%)' }}
      >
        {HEAVY.map((h, i) => (
          <div
            key={h}
            className="w-full bg-accent text-background text-[11px] font-semibold text-center py-1 px-2"
            style={{
              opacity: i < stacked ? 1 : 0,
              transform: i < stacked ? 'none' : 'translateY(-8px) scale(0.9)',
              transition: `opacity 360ms ${EASE}, transform 360ms ${EASE}`,
            }}
          >
            {h}
          </div>
        ))}
      </div>

      <p
        className="mt-4 text-center font-serif italic text-foreground/70"
        style={{ opacity: seg(p, 0.7, 0.95), transition: `opacity 500ms ${EASE}` }}
      >
        Raised unprompted across four places: more weight than any tick-box.
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * C — THE THREAD  (one thread, everything attached)
 * Pull the thread at "water" and it winds through every consequence. A
 * single line draws on scroll, kinking at each node; labels surface as the
 * drawing front reaches them.
 * ════════════════════════════════════════════════════════════════════════ */

const KNOTS = [
  { label: 'Water is far', cost: false },
  { label: 'Fetched at midnight', cost: false },
  { label: 'School lost', cost: true },
  { label: 'Income lost', cost: true },
  { label: 'Girls at risk in the dark', cost: true },
];

export function ThreadPull() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>([0.85, 0.3]);
  const W = 1000;
  const H = 360;
  // serpentine node positions — feels like a pulled thread, not a timeline
  const ys = [100, 250, 120, 250, 140];
  const xs = KNOTS.map((_, i) => lerp(90, W - 90, i / (KNOTS.length - 1)));
  const pts = KNOTS.map((_, i) => ({ x: xs[i], y: ys[i] }));

  // smooth path through the points
  const d = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const mx = (prev.x + pt.x) / 2;
    return `${acc} C${mx} ${prev.y}, ${mx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[1000px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block overflow-visible" aria-hidden>
        {/* faint full thread, then the coral draw on top */}
        <path d={d} fill="none" className="text-foreground/12" stroke="currentColor" strokeWidth={2} />
        <path
          d={d}
          fill="none"
          stroke={ACCENT}
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - easeOut(p)}
          style={{ filter: `drop-shadow(0 0 6px ${ACCENT}44)` }}
        />
        {/* the pull handle at the start */}
        <circle cx={pts[0].x - 4} cy={pts[0].y} r={6} fill={ACCENT} opacity={clamp(p * 6)} />

        {pts.map((pt, i) => {
          const reveal = (i + 0.35) / KNOTS.length;
          const t = clamp((p - reveal) * 6);
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={KNOTS[i].cost ? 7 : 5}
              fill={KNOTS[i].cost ? ACCENT : 'var(--background)'}
              stroke={ACCENT}
              strokeWidth={2}
              opacity={t}
            />
          );
        })}
      </svg>

      {pts.map((pt, i) => {
        const reveal = (i + 0.35) / KNOTS.length;
        const t = clamp((p - reveal) * 6);
        const above = pt.y < H / 2;
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 w-[150px] text-center"
            style={{
              left: `${(pt.x / W) * 100}%`,
              top: `${((pt.y + (above ? -52 : 30)) / H) * 100}%`,
              opacity: t,
              transform: `translate(-50%, ${(1 - t) * 6}px)`,
              transition: `opacity 350ms ${EASE}`,
            }}
          >
            <div
              className={`text-[10px] uppercase tracking-[0.2em] ${KNOTS[i].cost ? 'text-accent' : 'text-foreground/40'}`}
            >
              {KNOTS[i].cost ? 'Cost' : 'Cause'}
            </div>
            <div className="mt-0.5 font-semibold text-foreground text-sm leading-snug">
              {KNOTS[i].label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
