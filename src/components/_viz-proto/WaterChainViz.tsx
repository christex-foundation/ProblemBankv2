'use client';

/**
 * THROWAWAY prototypes — three creative directions for the "water chain"
 * section (Figure 2), replacing the box → arrow → box flowchart. All three
 * embody the finding as *water behaviour*: one cause cascading into three
 * human costs, raised unprompted by ~200 residents.
 *
 * Shared palette: coral accent on cream paper, depth from opacity, scroll
 * drives the motion. Delete this file + the /viz-preview/water-chain route
 * once a direction is chosen.
 */

import { useEffect, useRef, useState } from 'react';

const ACCENT = '#c8442a';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export type ChainOutcome = { label: string; quote?: string; who?: string };
export type ChainData = {
  /** The causes, in order, chained top → bottom (the "upstream"). */
  causes: string[];
  /** The human costs the cause spills into. */
  outcomes: ChainOutcome[];
};

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
/** Local 0→1 for the slice [a,b] of a global progress value. */
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 2);

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

/**
 * Scroll-linked 0→1 as the element rises through the viewport middle. Same
 * band as the ProblemRose so the motion rhythm matches the rest of the page.
 */
function useScrollProgress<T extends Element>() {
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
      const start = vh * 0.85;
      const end = vh * 0.35;
      setProgress(clamp((start - center) / (start - end)));
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
  }, [reduced]);
  return { ref, progress };
}

/** Reveal helper: fade + rise driven by a local 0→1. */
function rise(t: number, y = 16) {
  const e = easeOut(t);
  return {
    opacity: t <= 0 ? 0 : e,
    transform: `translateY(${(1 - e) * y}px)`,
  };
}

/* ────────────────────────────────────────────────────────────────────────
 * A — DOWNHILL CASCADE
 * A vertical stream pours from the source downward and forks into the three
 * human costs. The "water level" descends with scroll, filling each link as
 * it reaches it, then the fork spills into the outcomes.
 * ──────────────────────────────────────────────────────────────────────── */

/** A thin vertical pipe whose coral fill descends with `t` (0→1). */
function Pipe({ t, h }: { t: number; h: number }) {
  return (
    <div className="relative mx-auto w-[3px]" style={{ height: h }}>
      <div className="absolute inset-0 bg-foreground/10 rounded-full" />
      <div
        className="absolute inset-x-0 top-0 rounded-full bg-accent"
        style={{ height: `${easeOut(t) * 100}%`, boxShadow: `0 0 10px ${ACCENT}66` }}
      />
      {/* leading drop at the water front */}
      <div
        className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent"
        style={{
          top: `calc(${easeOut(t) * 100}% - 4px)`,
          opacity: t > 0 && t < 1 ? 1 : 0,
          boxShadow: `0 0 12px ${ACCENT}`,
          transition: 'opacity 200ms linear',
        }}
      />
    </div>
  );
}

function CauseCard({ text, source, t }: { text: string; source?: boolean; t: number }) {
  return (
    <div
      className={`px-6 py-4 text-center text-sm md:text-base leading-snug border ${
        source
          ? 'bg-accent text-background border-accent font-semibold'
          : 'bg-paper text-foreground/85 border-foreground/20'
      }`}
      style={{ ...rise(t), transition: `opacity 500ms ${EASE}, transform 500ms ${EASE}` }}
    >
      {source && (
        <div className="text-[10px] uppercase tracking-[0.22em] text-background/70 mb-1">
          The source
        </div>
      )}
      {text}
    </div>
  );
}

export function CascadeChain({ data }: { data: ChainData }) {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>();

  // sequential timeline down the cascade
  const tCause1 = seg(p, 0.0, 0.12);
  const tPipe1 = seg(p, 0.12, 0.32);
  const tCause2 = seg(p, 0.3, 0.44);
  const tFork = seg(p, 0.46, 0.7);
  const outcomeStart = 0.62;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <CauseCard text={data.causes[0]} source t={tCause1} />
      <Pipe t={tPipe1} h={56} />
      {data.causes[1] && <CauseCard text={data.causes[1]} t={tCause2} />}

      {/* fork + outcomes share a width so the three streams land on the columns */}
      <div className="w-full max-w-[720px]">
        <Pipe t={seg(p, 0.44, 0.5)} h={28} />
        <svg
          viewBox="0 0 1000 110"
          preserveAspectRatio="none"
          className="w-full h-[70px] md:h-[90px] block"
          aria-hidden
        >
          {[166, 500, 834].map((x, i) => {
            const d =
              x === 500
                ? 'M500 0 L500 110'
                : `M500 0 C500 64, ${x} 40, ${x} 110`;
            // each branch fills slightly after the previous
            const bt = seg(tFork, i * 0.12, 0.6 + i * 0.12);
            return (
              <path
                key={x}
                d={d}
                fill="none"
                stroke={ACCENT}
                strokeWidth={3}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - bt}
                style={{ filter: `drop-shadow(0 0 6px ${ACCENT}55)` }}
              />
            );
          })}
        </svg>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {data.outcomes.map((o, i) => {
            const t = seg(p, outcomeStart + i * 0.1, outcomeStart + 0.18 + i * 0.1);
            return (
              <div
                key={o.label}
                className="border border-accent/40 bg-accent/[0.06] p-5 text-center"
                style={{
                  ...rise(t),
                  transition: `opacity 520ms ${EASE}, transform 520ms ${EASE}`,
                }}
              >
                <div className="font-semibold text-foreground leading-snug">{o.label}</div>
                {o.quote && (
                  <>
                    <p className="mt-3 font-serif italic text-sm text-foreground/70 leading-[1.5]">
                      “{o.quote}”
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-foreground/40">
                      {o.who}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * B — SINGLE DROP, WIDENING RINGS
 * One drop strikes the surface (the cause) and concentric ripples expand;
 * each consequence sits where a ring reaches it. One small cause, widening
 * human consequences.
 * ──────────────────────────────────────────────────────────────────────── */

export function RippleChain({ data }: { data: ChainData }) {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>();

  const W = 760;
  const H = 560;
  const cx = W / 2;
  const cy = 250;

  // the drop falls in, splashes, then rings expand outward
  const tDrop = seg(p, 0.0, 0.18);
  const tSplash = seg(p, 0.16, 0.26);
  const tRings = seg(p, 0.24, 0.78);

  // three consequences sit on the lower arc: lower-left, bottom, lower-right
  const angles = [Math.PI * 0.86, Math.PI * 0.5, Math.PI * 0.14];
  const ringR = 250;

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[760px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block overflow-visible" aria-hidden>
        {/* expanding rings */}
        {[0, 1, 2, 3].map((i) => {
          const rt = seg(tRings, i * 0.12, 0.55 + i * 0.12);
          const r = easeOut(rt) * (ringR + 30) * ((i + 1) / 4);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={Math.max(0.001, r)}
              fill="none"
              stroke={ACCENT}
              strokeWidth={2}
              opacity={rt * (0.55 - i * 0.1)}
            />
          );
        })}

        {/* radial connectors to each consequence */}
        {angles.map((a, i) => {
          const x = cx + Math.cos(a) * ringR;
          const y = cy + Math.sin(a) * ringR;
          const lt = seg(tRings, 0.35 + i * 0.08, 0.7 + i * 0.08);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + (x - cx) * easeOut(lt)}
              y2={cy + (y - cy) * easeOut(lt)}
              stroke={ACCENT}
              strokeWidth={1.5}
              strokeDasharray="2 4"
              opacity={0.4 * lt}
            />
          );
        })}

        {/* the falling drop */}
        <circle
          cx={cx}
          cy={40 + (cy - 40) * easeOut(tDrop)}
          r={tDrop < 1 ? 7 : 0}
          fill={ACCENT}
          opacity={tDrop > 0 && tSplash < 1 ? 1 : 0}
        />
        {/* splash core */}
        <circle cx={cx} cy={cy} r={10 + easeOut(tSplash) * 6} fill={ACCENT} opacity={tSplash} />
      </svg>

      {/* center cause label */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 text-center w-[200px]"
        style={{
          left: `${(cx / W) * 100}%`,
          top: `${(cy / H) * 100}%`,
          ...rise(tSplash, 8),
        }}
      >
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
          One cause
        </div>
        <div className="mt-1 font-semibold text-foreground leading-snug text-sm">
          {data.causes.join(' · ')}
        </div>
      </div>

      {/* consequences pinned where each ring lands */}
      {data.outcomes.map((o, i) => {
        const a = angles[i] ?? Math.PI * 0.5;
        const x = cx + Math.cos(a) * ringR;
        const y = cy + Math.sin(a) * ringR;
        const t = seg(tRings, 0.45 + i * 0.08, 0.8 + i * 0.08);
        const left = (x / W) * 100;
        const align = left < 40 ? 'right' : left > 60 ? 'left' : 'center';
        const tx = align === 'center' ? '-50%' : align === 'left' ? '0' : '-100%';
        const ty = 8 + (1 - easeOut(t)) * 10; // rise from below, merged with anchor offset
        return (
          <div
            key={o.label}
            className="absolute w-[210px] max-w-[46vw]"
            style={{
              left: `${left}%`,
              top: `${(y / H) * 100}%`,
              transform: `translate(${tx}, ${ty}px)`,
              textAlign: align === 'center' ? 'center' : (align as 'left' | 'right'),
              opacity: t <= 0 ? 0 : easeOut(t),
              transition: `opacity 500ms ${EASE}`,
            }}
          >
            <div className="inline-block border-b-2 border-accent/50 pb-1 font-semibold text-foreground text-sm leading-snug">
              {o.label}
            </div>
            {o.quote && (
              <p className="mt-2 font-serif italic text-xs text-foreground/65 leading-[1.5]">
                “{o.quote}”
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * C — THE CURRENT (river)
 * A river flows left → right with a day → night gradient. The cause is
 * upstream, the midnight-fetch stretch midstream, then the river deposits
 * the three consequences downstream. Cards reveal L→R as the current flows.
 * ──────────────────────────────────────────────────────────────────────── */

export function CurrentChain({ data }: { data: ChainData }) {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();

  // two wave tiles per band on a 200% track; -50% loops seamlessly
  const wave = (mid: number, amp: number) =>
    `M0 ${mid} Q120 ${mid - amp} 240 ${mid} T480 ${mid} T720 ${mid} T960 ${mid} T1200 ${mid} T1440 ${mid} L1440 200 L0 200 Z`;

  return (
    <div ref={ref}>
      {/* the river band */}
      <div className="relative h-[150px] md:h-[180px] w-full overflow-hidden">
        <svg className="absolute inset-0 w-0 h-0" aria-hidden>
          <defs>
            <linearGradient id="riverDayNight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.5" />
              <stop offset="55%" stopColor={ACCENT} stopOpacity="0.4" />
              <stop offset="100%" stopColor="#241f1c" stopOpacity="0.85" />
            </linearGradient>
          </defs>
        </svg>
        {[
          { mid: 70, amp: 14, op: 0.5, drift: reduced ? '' : 'wave-drift-slow' },
          { mid: 92, amp: 20, op: 0.9, drift: reduced ? '' : 'wave-drift' },
        ].map((b, i) => (
          <div key={i} className={`absolute inset-0 flex w-[200%] ${b.drift}`}>
            {[0, 1].map((k) => (
              <svg
                key={k}
                viewBox="0 0 1440 200"
                preserveAspectRatio="none"
                className="w-1/2 h-full"
              >
                <path d={wave(b.mid, b.amp)} fill="url(#riverDayNight)" opacity={b.op} />
              </svg>
            ))}
          </div>
        ))}

        {/* upstream / midstream labels on the river */}
        <div
          className="absolute left-[4%] top-1/2 -translate-y-1/2 max-w-[34%]"
          style={{ ...rise(seg(p, 0.0, 0.2), 8) }}
        >
          <div className="text-[10px] uppercase tracking-[0.22em] text-background/80">Upstream</div>
          <div className="font-semibold text-background text-sm md:text-base leading-snug">
            {data.causes[0]}
          </div>
        </div>
        <div
          className="absolute left-[42%] top-1/2 -translate-y-1/2 max-w-[30%]"
          style={{ ...rise(seg(p, 0.18, 0.4), 8) }}
        >
          <div className="text-[10px] uppercase tracking-[0.22em] text-background/70">
            After dark
          </div>
          <div className="font-semibold text-background text-sm md:text-base leading-snug">
            {data.causes[1]}
          </div>
        </div>
        <div className="absolute right-3 bottom-2 text-[10px] uppercase tracking-[0.22em] text-background/55">
          night ▸
        </div>
      </div>

      {/* deposits downstream — connectors drop from the river to each card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {data.outcomes.map((o, i) => {
          const t = seg(p, 0.35 + i * 0.12, 0.55 + i * 0.12);
          return (
            <div key={o.label} className="flex flex-col items-center">
              <div
                className="h-7 w-px bg-accent origin-top"
                style={{ transform: `scaleY(${easeOut(t)})` }}
              />
              <div
                className="w-full border-t-2 border-accent bg-paper p-5 text-center"
                style={{
                  ...rise(t, 14),
                  transition: `opacity 520ms ${EASE}, transform 520ms ${EASE}`,
                }}
              >
                <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/40 mb-2">
                  Downstream
                </div>
                <div className="font-semibold text-foreground leading-snug">{o.label}</div>
                {o.quote && (
                  <>
                    <p className="mt-3 font-serif italic text-sm text-foreground/70 leading-[1.5]">
                      “{o.quote}”
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-foreground/40">
                      {o.who}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
