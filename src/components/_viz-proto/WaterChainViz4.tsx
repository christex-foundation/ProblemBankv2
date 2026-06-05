'use client';

/**
 * THROWAWAY prototypes — round 4. Three more mechanics to explore beside the
 * survivors (clock, words, dominoes, thread):
 *
 *   Fracture — organic: one stress cracks and branches into the costs.
 *   GearTrain — mechanical: water turns, the machine grinds out the outcomes.
 *   Stain    — spread: it seeps from the source until it covers everything.
 *
 * Coral on cream, scroll drives the motion. Delete with the other rounds.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

const ACCENT = '#c8442a';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 2);

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

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
 * A — FRACTURE  (one stress, cracking into the costs)
 * Water is the stress; the crack branches outward across the panel, each
 * fork reaching a human cost. Grows on scroll like a fracture spreading.
 * ════════════════════════════════════════════════════════════════════════ */

type Seg = {
  x0: number; y0: number; x1: number; y1: number;
  t0: number; t1: number; leaf?: string; cost?: boolean; twig?: boolean;
};

const FRACTURE: Seg[] = [
  { x0: 70, y0: 190, x1: 300, y1: 188, t0: 0, t1: 0.22 }, // trunk
  { x0: 300, y0: 188, x1: 430, y1: 74, t0: 0.22, t1: 0.46, leaf: 'School lost', cost: true },
  { x0: 300, y0: 188, x1: 560, y1: 196, t0: 0.24, t1: 0.5 }, // trunk 2
  { x0: 560, y0: 196, x1: 780, y1: 86, t0: 0.5, t1: 0.74, leaf: 'Income lost', cost: true },
  { x0: 560, y0: 196, x1: 830, y1: 320, t0: 0.5, t1: 0.78, leaf: 'Girls at risk in the dark', cost: true },
  // cosmetic twigs for an organic crack
  { x0: 300, y0: 188, x1: 360, y1: 280, t0: 0.3, t1: 0.42, twig: true },
  { x0: 430, y0: 74, x1: 470, y1: 40, t0: 0.46, t1: 0.54, twig: true },
  { x0: 560, y0: 196, x1: 620, y1: 150, t0: 0.5, t1: 0.6, twig: true },
];

function jagged(s: Seg, steps: number, amp: number, rng: () => number) {
  const dx = s.x1 - s.x0;
  const dy = s.y1 - s.y0;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  let d = `M${s.x0} ${s.y0}`;
  for (let i = 1; i <= steps; i++) {
    const f = i / steps;
    const j = i === steps ? 0 : (rng() - 0.5) * amp;
    d += ` L${(s.x0 + dx * f + nx * j).toFixed(1)} ${(s.y0 + dy * f + ny * j).toFixed(1)}`;
  }
  return d;
}

export function Fracture() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>();
  const W = 920;
  const H = 380;
  const paths = useMemo(() => {
    const rng = makeRng(13);
    return FRACTURE.map((s) => jagged(s, 6, s.twig ? 8 : 14, rng));
  }, []);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[920px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block overflow-visible" aria-hidden>
        {FRACTURE.map((s, i) => {
          const t = seg(p, s.t0, s.t1);
          return (
            <path
              key={i}
              d={paths[i]}
              fill="none"
              stroke={ACCENT}
              strokeWidth={s.twig ? 1.2 : s.cost ? 2.6 : 3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={s.twig ? 0.5 : 1}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - t}
              style={{ filter: s.twig ? undefined : `drop-shadow(0 0 5px ${ACCENT}44)` }}
            />
          );
        })}
        {/* origin */}
        <circle cx={70} cy={190} r={6} fill={ACCENT} opacity={clamp(p * 8)} />
        {FRACTURE.filter((s) => s.leaf).map((s, i) => {
          const t = seg(p, s.t1 - 0.02, s.t1 + 0.06);
          return <circle key={i} cx={s.x1} cy={s.y1} r={6} fill={ACCENT} opacity={t} />;
        })}
      </svg>

      <div
        className="absolute text-sm font-semibold text-foreground"
        style={{ left: `${(70 / W) * 100}%`, top: `${(190 / H) * 100}%`, transform: 'translate(-10%, 14px)', opacity: clamp(p * 8) }}
      >
        Water is far
      </div>
      {FRACTURE.filter((s) => s.leaf).map((s, i) => {
        const t = seg(p, s.t1 - 0.02, s.t1 + 0.06);
        const above = s.y1 < H / 2;
        const left = (s.x1 / W) * 100;
        return (
          <div
            key={i}
            className="absolute w-[160px]"
            style={{
              left: `${left}%`,
              top: `${((s.y1 + (above ? -40 : 18)) / H) * 100}%`,
              transform: `translate(${left > 70 ? '-70%' : '-20%'}, 0)`,
              opacity: t,
              transition: `opacity 360ms ${EASE}`,
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.2em] text-accent">Cost</div>
            <div className="font-semibold text-foreground text-sm leading-snug">{s.leaf}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * B — GEAR TRAIN  (water turns, the machine grinds out the outcomes)
 * A meshed train of gears. The water gear drives; each driven gear spins the
 * next and reveals its consequence. Inevitable, systemic.
 * ════════════════════════════════════════════════════════════════════════ */

const GEARS = [
  { r: 56, teeth: 14, label: 'Water is far', cost: false },
  { r: 40, teeth: 10, label: 'Midnight fetch', cost: false },
  { r: 50, teeth: 12, label: 'School lost', cost: true },
  { r: 38, teeth: 10, label: 'Income lost', cost: true },
  { r: 52, teeth: 13, label: 'Girls at risk', cost: true },
];

function Gear({ cx, cy, r, teeth, angle, cost }: { cx: number; cy: number; r: number; teeth: number; angle: number; cost: boolean }) {
  const col = cost ? ACCENT : '#0e0e0d';
  return (
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      {Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        const x0 = cx + Math.cos(a) * r;
        const y0 = cy + Math.sin(a) * r;
        const x1 = cx + Math.cos(a) * (r + 9);
        const y1 = cy + Math.sin(a) * (r + 9);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={col} strokeWidth={6} strokeLinecap="round" opacity={cost ? 0.9 : 0.55} />;
      })}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={5} opacity={cost ? 0.9 : 0.55} />
      <circle cx={cx} cy={cy} r={r * 0.32} fill="none" stroke={col} strokeWidth={4} opacity={cost ? 0.7 : 0.4} />
      {/* a spoke so the spin is legible */}
      <line x1={cx} y1={cy - r * 0.32} x2={cx} y2={cy - r} stroke={col} strokeWidth={4} opacity={cost ? 0.7 : 0.4} />
    </g>
  );
}

export function GearTrain() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>([0.9, 0.35]);
  const H = 300;
  const cy = 140;
  // mesh: each gear centre is the sum of touching radii from the previous
  const cxs: number[] = [];
  GEARS.forEach((g, i) => {
    if (i === 0) cxs.push(90 + g.r);
    else cxs.push(cxs[i - 1] + GEARS[i - 1].r + g.r - 6);
  });
  const W = cxs[cxs.length - 1] + GEARS[GEARS.length - 1].r + 30;

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[980px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block overflow-visible" aria-hidden>
        {GEARS.map((g, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          const angle = dir * easeOut(p) * 220 * (GEARS[0].r / g.r);
          return <Gear key={i} cx={cxs[i]} cy={cy} r={g.r} teeth={g.teeth} angle={angle} cost={g.cost} />;
        })}
      </svg>
      {GEARS.map((g, i) => {
        const t = seg(p, i * 0.12, i * 0.12 + 0.16);
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 w-[140px] text-center"
            style={{ left: `${(cxs[i] / W) * 100}%`, top: `${((cy + g.r + 16) / H) * 100}%`, opacity: t, transition: `opacity 350ms ${EASE}` }}
          >
            <div className={`text-[10px] uppercase tracking-[0.2em] ${g.cost ? 'text-accent' : 'text-foreground/40'}`}>
              {g.cost ? 'Cost' : 'Cause'}
            </div>
            <div className="font-semibold text-foreground text-sm leading-snug">{g.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * C — THE STAIN  (it seeps from the source until it covers everything)
 * A coral stain spreads from "water" and engulfs each consequence as it
 * reaches it; the label activates when the stain arrives.
 * ════════════════════════════════════════════════════════════════════════ */

const SPOTS = [
  { x: 14, y: 50, label: 'Water is far', cost: false, at: 0.0 },
  { x: 44, y: 28, label: 'School lost', cost: true, at: 0.32 },
  { x: 62, y: 70, label: 'Income lost', cost: true, at: 0.52 },
  { x: 86, y: 46, label: 'Girls at risk in the dark', cost: true, at: 0.72 },
];

export function Stain() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>([0.85, 0.35]);
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[900px] h-[360px]">
      {/* the spreading blobs */}
      {SPOTS.map((s, i) => {
        const grow = easeOut(seg(p, s.at, s.at + 0.28));
        return (
          <div
            key={`blob-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: 300,
              height: 300,
              transform: `translate(-50%, -50%) scale(${0.15 + grow})`,
              background: `radial-gradient(circle, ${ACCENT}cc 0%, ${ACCENT}55 38%, transparent 70%)`,
              filter: 'blur(14px)',
              opacity: 0.5 * grow + 0.1,
            }}
          />
        );
      })}
      {/* labels activate as the stain reaches them */}
      {SPOTS.map((s, i) => {
        const reached = seg(p, s.at + 0.05, s.at + 0.22);
        return (
          <div
            key={`lab-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center w-[150px]"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: reached > 0.5 ? '#F8F0E7' : 'rgba(14,14,13,0.4)', transition: 'color 400ms linear' }}
            >
              {s.cost ? 'Cost' : 'Source'}
            </div>
            <div
              className="font-semibold text-sm leading-snug"
              style={{ color: reached > 0.5 ? '#F8F0E7' : 'rgba(14,14,13,0.55)', transition: 'color 400ms linear' }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
      <p
        className="absolute bottom-0 left-0 right-0 text-center font-serif italic text-foreground/65 text-sm"
        style={{ opacity: seg(p, 0.7, 0.95) }}
      >
        Untreated, it does not stay in one place: it reaches into school, work and the night.
      </p>
    </div>
  );
}
