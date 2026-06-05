'use client';

/**
 * THROWAWAY prototypes — round 2. Three *conceptual* reframes of the water
 * chain, none of them a water-shaped flowchart:
 *
 *   1. ClockEaten     — the finding as a stolen 24-hour day.
 *   2. VoicesConverge — ~200 unprompted responses snapping into one chain.
 *   3. WordsIgnite    — the chain as a sentence the residents co-wrote.
 *
 * Coral accent on cream paper, scroll drives the motion. Delete this file +
 * the /viz-preview/water-chain route once a direction is chosen.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

const ACCENT = '#c8442a';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 2);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
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

/** Scroll-linked 0→1 as the element rises through the viewport middle. */
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

/** One-shot in-view flag. */
function useInView<T extends HTMLElement>(threshold = 0.55) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && (setInView(true), obs.disconnect()),
      { threshold },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [inView, threshold]);
  return { ref, inView };
}

/* ════════════════════════════════════════════════════════════════════════
 * 1 — THE DAY, EATEN  (a stolen 24-hour clock)
 * The reframe: water-fetching does not "cause" problems, it eats the day.
 * A radial 24h dial; coral blocks are the hours swallowed by the walk for
 * water; each bite dims the life it took (sleep, study, the trading day).
 * ════════════════════════════════════════════════════════════════════════ */

type Activity = 'night' | 'sleep' | 'dawn' | 'morning' | 'school' | 'market' | 'home';
const TONE: Record<Activity, number> = {
  night: 0.05,
  sleep: 0.08,
  dawn: 0.12,
  morning: 0.12,
  school: 0.2,
  market: 0.15,
  home: 0.1,
};
// what each hour of the day is *meant* for
const HOUR_ACT: Activity[] = [
  'night', // 0
  'sleep', 'sleep', 'sleep', 'sleep', // 1-4
  'dawn', // 5
  'morning', 'morning', // 6-7
  'school', 'school', 'school', 'school', 'school', 'school', // 8-13
  'market', 'market', 'market', 'market', // 14-17
  'home', 'home', 'home', 'home', // 18-21
  'sleep', 'sleep', // 22-23
];
// the hours the walk for water takes, and the cost each one carries
const STOLEN: { h: number; note?: string; sub?: string }[] = [
  { h: 0, note: 'Girls fetch at midnight', sub: 'walking unlit roads, exposed to harm' },
  { h: 5 },
  { h: 6, note: 'Study time goes first', sub: 'the morning hours never reach the classroom' },
  { h: 14, note: 'The trading day is cut', sub: 'hours off the stall are income lost' },
];
const GROUP_LABELS: { act: Activity; label: string }[] = [
  { act: 'sleep', label: 'Sleep' },
  { act: 'school', label: 'School' },
  { act: 'market', label: 'Market' },
  { act: 'home', label: 'Home' },
];

function annulus(cx: number, cy: number, r1: number, r2: number, a0: number, a1: number) {
  const pt = (r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = pt(r2, a0);
  const [x1, y1] = pt(r2, a1);
  const [x2, y2] = pt(r1, a1);
  const [x3, y3] = pt(r1, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${x0} ${y0} A${r2} ${r2} 0 ${large} 1 ${x1} ${y1} L${x2} ${y2} A${r1} ${r1} 0 ${large} 0 ${x3} ${y3} Z`;
}

export function ClockEaten() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>();
  const W = 720;
  const C = W / 2;
  const rIn = 150;
  const rOut = 240;
  // midnight at top, clockwise
  const aFor = (h: number) => -Math.PI / 2 + (h / 24) * Math.PI * 2;
  const GAP = 0.004;

  // group-label angles (mid of each contiguous activity run)
  const groupAngles = useMemo(() => {
    const out: Record<string, number> = {};
    GROUP_LABELS.forEach(({ act }) => {
      const hours = HOUR_ACT.map((a, h) => (a === act ? h : -1)).filter((h) => h >= 0);
      // handle sleep wrap (22,23,1,2,3,4) by averaging on the circle
      const sx = hours.reduce((s, h) => s + Math.cos(aFor(h + 0.5)), 0);
      const sy = hours.reduce((s, h) => s + Math.sin(aFor(h + 0.5)), 0);
      out[act] = Math.atan2(sy, sx);
    });
    return out;
  }, []);

  // how many stolen hours have been revealed at the current scroll position
  const eaten = STOLEN.filter((_, i) => p > (i + 0.5) / (STOLEN.length + 1)).length;
  const tickFor = (h: number) => -Math.PI / 2 + (h / 24) * Math.PI * 2;

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[680px]">
      <svg viewBox={`0 0 ${W} ${W}`} className="w-full h-auto block overflow-visible" aria-hidden>
        {/* the day's hours, toned by what they are meant for */}
        {HOUR_ACT.map((act, h) => {
          const a0 = aFor(h) + GAP;
          const a1 = aFor(h + 1) - GAP;
          return (
            <path
              key={`base-${h}`}
              d={annulus(C, C, rIn, rOut, a0, a1)}
              fill={`color-mix(in srgb, var(--foreground) ${TONE[act] * 100}%, transparent)`}
            />
          );
        })}

        {/* hours eaten by the walk for water — coral, popping in on scroll */}
        {STOLEN.map((s, i) => {
          const t = seg(p, (i + 0.5) / (STOLEN.length + 1), (i + 1.2) / (STOLEN.length + 1));
          const a0 = aFor(s.h) + GAP;
          const a1 = aFor(s.h + 1) - GAP;
          const aMid = (a0 + a1) / 2;
          const e = easeOut(t);
          return (
            <g key={`steal-${s.h}`} style={{ opacity: t }}>
              <path
                d={annulus(C, C, rIn - 6 * e, rOut + 6 * e, a0, a1)}
                fill={ACCENT}
                style={{ filter: `drop-shadow(0 0 ${10 * e}px ${ACCENT}88)` }}
              />
              {s.note && (
                <>
                  {/* leader from the ring out to the annotation */}
                  <line
                    x1={C + Math.cos(aMid) * (rOut + 8)}
                    y1={C + Math.sin(aMid) * (rOut + 8)}
                    x2={C + Math.cos(aMid) * (rOut + 36)}
                    y2={C + Math.sin(aMid) * (rOut + 36)}
                    stroke={ACCENT}
                    strokeWidth={1.5}
                    opacity={t}
                  />
                </>
              )}
            </g>
          );
        })}

        {/* orientation ticks: 12am / 6am / 12pm / 6pm */}
        {[
          { h: 0, label: '12am' },
          { h: 6, label: '6am' },
          { h: 12, label: '12pm' },
          { h: 18, label: '6pm' },
        ].map((tk) => {
          const a = tickFor(tk.h);
          const x = C + Math.cos(a) * (rIn - 16);
          const y = C + Math.sin(a) * (rIn - 16);
          return (
            <text
              key={tk.label}
              x={x}
              y={y + 3}
              textAnchor="middle"
              className="fill-foreground/35"
              style={{ fontSize: 10, letterSpacing: '0.08em' }}
            >
              {tk.label}
            </text>
          );
        })}

        {/* activity group labels around the ring */}
        {GROUP_LABELS.map(({ act, label }) => {
          const a = groupAngles[act];
          const x = C + Math.cos(a) * ((rIn + rOut) / 2);
          const y = C + Math.sin(a) * ((rIn + rOut) / 2);
          return (
            <text
              key={label}
              x={x}
              y={y + 3}
              textAnchor="middle"
              className="fill-foreground/55"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}
            >
              {label}
            </text>
          );
        })}

        {/* center readout */}
        <text x={C} y={C - 14} textAnchor="middle" fill={ACCENT} style={{ fontSize: 76, fontWeight: 800 }}>
          {eaten}
        </text>
        <text
          x={C}
          y={C + 18}
          textAnchor="middle"
          className="fill-foreground/70"
          style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}
        >
          hours eaten
        </text>
        <text x={C} y={C + 40} textAnchor="middle" className="fill-foreground/45" style={{ fontSize: 12 }}>
          from every single day
        </text>
      </svg>

      {/* HTML annotations, positioned over the SVG at each stolen hour */}
      {STOLEN.filter((s) => s.note).map((s) => {
        const i = STOLEN.indexOf(s);
        const a = aFor(s.h + 0.5);
        const x = C + Math.cos(a) * (rOut + 40);
        const y = C + Math.sin(a) * (rOut + 40);
        const left = (x / W) * 100;
        const t = seg(p, (i + 0.6) / (STOLEN.length + 1), (i + 1.3) / (STOLEN.length + 1));
        const anchor = left < 40 ? 'right' : left > 60 ? 'left' : 'center';
        const tx = anchor === 'center' ? '-50%' : anchor === 'left' ? '0' : '-100%';
        return (
          <div
            key={s.h}
            className="absolute w-[190px] max-w-[42vw]"
            style={{
              left: `${left}%`,
              top: `${(y / W) * 100}%`,
              transform: `translate(${tx}, -50%)`,
              textAlign: anchor === 'center' ? 'center' : (anchor as 'left' | 'right'),
              opacity: t,
              transition: `opacity 400ms ${EASE}`,
            }}
          >
            <div className="font-semibold text-foreground text-sm leading-snug">{s.note}</div>
            {s.sub && <div className="mt-1 text-[12px] text-foreground/55 leading-snug">{s.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2 — TWO HUNDRED STRANGERS, ONE SENTENCE  (voices converge)
 * The reframe: the punchline is that ~200 people raised this *unprompted and
 * independently*. So make the statistics the image: scattered responses,
 * tinted by community, snap into a single chain as you scroll.
 * ════════════════════════════════════════════════════════════════════════ */

const COMMUNITIES = [
  { name: 'Fourah Bay', color: ACCENT },
  { name: 'Grafton', color: '#7a6f64' },
  { name: 'Kroobay', color: '#b07d3b' },
  { name: 'Aberdeen', color: '#4f5b53' },
];

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function VoicesConverge() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>([0.9, 0.25]);
  const W = 1000;
  const H = 440;

  // the chain the dots resolve into
  const STOPS = [
    { x: 130, label: 'Water is far' },
    { x: 400, label: 'Fetched at midnight' },
    { x: 670, label: 'School & stall lost' },
    { x: 900, label: 'The walk home, in the dark' },
  ];
  const lineY = 250;

  const N = 188; // close to two hundred
  const dots = useMemo(() => {
    const rng = makeRng(7);
    const xs = STOPS.map((s) => s.x);
    const x0 = xs[0];
    const x1 = xs[xs.length - 1];
    return Array.from({ length: N }, () => {
      // scatter source: anywhere in the field
      const sx = lerp(40, W - 40, rng());
      const sy = lerp(30, H - 30, rng());
      // target: somewhere along the chain, with a little thickness + node clumps
      const clump = rng() < 0.5;
      let tx: number;
      if (clump) {
        const node = xs[Math.floor(rng() * xs.length)];
        tx = node + (rng() - 0.5) * 46;
      } else {
        tx = lerp(x0, x1, rng());
      }
      const ty = lineY + (rng() + rng() + rng() - 1.5) * 24;
      const tint = COMMUNITIES[Math.floor(rng() * COMMUNITIES.length)].color;
      const delay = ((tx - x0) / (x1 - x0)) * 0.35; // left forms first → sweep
      const r = 2 + rng() * 1.6;
      return { sx, sy, tx, ty, tint, delay, r };
    });
  }, []);

  const lineT = seg(p, 0.62, 0.9);

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block overflow-visible" aria-hidden>
        {/* the resolved chain line, drawn under the dots */}
        <polyline
          points={STOPS.map((s) => `${s.x},${lineY}`).join(' ')}
          fill="none"
          stroke={ACCENT}
          strokeWidth={2}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - lineT}
          opacity={0.5}
        />

        {dots.map((d, i) => {
          const t = clamp((easeInOut(p) - d.delay) / (1 - d.delay));
          const cx = lerp(d.sx, d.tx, t);
          const cy = lerp(d.sy, d.ty, t);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={d.r}
              fill={d.tint}
              opacity={lerp(0.32, 0.85, t)}
            />
          );
        })}

        {/* node markers + labels appear once the chain has formed */}
        {STOPS.map((s, i) => {
          const t = seg(p, 0.72 + i * 0.05, 0.92 + i * 0.05);
          return (
            <g key={s.label} style={{ opacity: t }}>
              <circle cx={s.x} cy={lineY} r={6} fill={ACCENT} />
              <text
                x={s.x}
                y={lineY - 22}
                textAnchor={i === 0 ? 'start' : i === STOPS.length - 1 ? 'end' : 'middle'}
                className="fill-foreground"
                style={{ fontSize: 15, fontWeight: 700 }}
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* legend + the statistical punchline */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {COMMUNITIES.map((c) => (
            <span key={c.name} className="inline-flex items-center gap-2 text-[11px] text-foreground/60">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
              {c.name}
            </span>
          ))}
        </div>
        <p
          className="font-serif italic text-foreground/70 text-sm md:text-base"
          style={{ opacity: lineT, transition: `opacity 500ms ${EASE}` }}
        >
          No question asked how problems affect daily life. ≈200 people described this chain anyway.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3 — IN THEIR OWN WORDS  (the sentence ignites)
 * The reframe: they *spoke* this chain. So the diagram is the sentence —
 * each clause igniting coral as it enters, a resident quote surfacing beside
 * the line it proves.
 * ════════════════════════════════════════════════════════════════════════ */

const CLAUSES: { lead: string; mark: string; tail: string; quote?: string; who?: string }[] = [
  { lead: '', mark: 'Water is far and scarce,', tail: '' },
  {
    lead: 'so they ',
    mark: 'fetch at midnight,',
    tail: '',
    quote: 'Most of our girls wake at midnight to fetch water.',
    who: 'Resident · Aberdeen',
  },
  {
    lead: 'so children ',
    mark: 'lose school,',
    tail: '',
    quote: 'The time used to study is what they spend on searching for water.',
    who: 'Resident · Aberdeen',
  },
  { lead: 'families ', mark: 'lose income,', tail: '' },
  {
    lead: 'and girls ',
    mark: 'walk home in the dark.',
    tail: '',
    quote: 'Because of the lack of a water facility, our children are getting pregnant.',
    who: 'Resident · Grafton',
  },
];

function Igniter({ children, on }: { children: ReactNode; on: boolean }) {
  return (
    <span
      className="box-decoration-clone font-semibold text-foreground"
      style={{
        backgroundImage: `linear-gradient(${ACCENT}40, ${ACCENT}40)`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 0.82em',
        backgroundSize: `${on ? 100 : 0}% 0.62em`,
        transition: `background-size 620ms ${EASE}`,
        padding: '0 0.04em',
      }}
    >
      {children}
    </span>
  );
}

function ClauseRow({ clause, index }: { clause: (typeof CLAUSES)[number]; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.6);
  return (
    <div
      ref={ref}
      className="grid md:grid-cols-[1fr_300px] gap-x-10 gap-y-3 items-baseline"
      style={{ paddingLeft: `${index * 1.6}rem` }}
    >
      <p
        className="font-serif text-3xl md:text-5xl leading-[1.12] text-foreground/85"
        style={{
          opacity: inView ? 1 : 0.25,
          transform: inView ? 'none' : 'translateY(10px)',
          transition: `opacity 500ms ${EASE}, transform 500ms ${EASE}`,
        }}
      >
        {clause.lead}
        <Igniter on={inView}>{clause.mark}</Igniter>
        {clause.tail}
      </p>
      {clause.quote && (
        <aside
          className="md:pt-2"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'none' : 'translateX(12px)',
            transition: `opacity 600ms ${EASE} 220ms, transform 600ms ${EASE} 220ms`,
          }}
        >
          <p className="font-serif italic text-foreground/70 text-sm leading-[1.5] border-l-2 border-accent/40 pl-3">
            “{clause.quote}”
          </p>
          <p className="mt-2 pl-3 text-[10px] uppercase tracking-[0.2em] text-foreground/40">
            {clause.who}
          </p>
        </aside>
      )}
    </div>
  );
}

export function WordsIgnite() {
  return (
    <div className="space-y-7 md:space-y-9">
      {CLAUSES.map((c, i) => (
        <ClauseRow key={c.mark} clause={c} index={i} />
      ))}
    </div>
  );
}
