'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Fires once when the element scrolls into view; drives the chart animations. */
function useInView<T extends HTMLElement>() {
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
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [inView]);
  return { ref, inView };
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

type Item = { label: string; value: number; accent?: boolean; count?: number };

/** Horizontal bars: labels left, animated fill, value right. */
export function BarList({
  items,
  max,
  unit = '%',
  showCount = false,
}: {
  items: Item[];
  max?: number;
  unit?: string;
  showCount?: boolean;
}) {
  const { ref, inView } = useInView<HTMLUListElement>();
  const top = max ?? Math.max(...items.map((i) => i.value));
  return (
    <ul ref={ref} className="space-y-3">
      {items.map((it, i) => (
        <li key={it.label} className="flex items-center gap-3">
          <span className="w-[42%] shrink-0 text-[11px] md:text-xs text-foreground/70 leading-tight">
            {it.label}
          </span>
          <div className="flex-1 h-2.5 bg-foreground/[0.08]">
            <div
              className={`h-full ${it.accent ? 'bg-accent' : 'bg-foreground'}`}
              style={{
                width: inView ? `${(it.value / top) * 100}%` : '0%',
                transition: `width 900ms ${EASE} ${i * 65}ms`,
              }}
            />
          </div>
          <span className="shrink-0 w-12 text-right tabular-nums text-[11px] md:text-xs font-semibold text-foreground/80">
            {it.value}
            {unit}
            {showCount && it.count != null && (
              <span className="text-foreground/40 font-normal"> ({it.count})</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

type Series = { name: string; n?: number; values: number[]; highlight?: boolean };

// Fixed (purge-safe) palette for non-highlighted series.
const SERIES_BG = ['bg-foreground/80', 'bg-foreground/45', 'bg-foreground/25', 'bg-foreground/15'];

/** The series legend — swatch · name · n=. Shared by top/bottom placement. */
function SeriesLegend({ series }: { series: Series[] }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {series.map((s, si) => (
        <span
          key={s.name}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-foreground/60"
        >
          <span className={`h-2.5 w-2.5 ${s.highlight ? 'bg-accent' : SERIES_BG[si % SERIES_BG.length]}`} />
          {s.name}
          {s.n != null && <span className="text-foreground/35 normal-case tracking-normal">n={s.n}</span>}
        </span>
      ))}
    </div>
  );
}

/**
 * Grouped vertical bars by category, one series highlighted in accent.
 * - `valueLabels` prints each bar's value just above it.
 * - `legend: 'top' | 'bottom'` places the series key (default 'bottom').
 * - `axisLabel` prints a small left-aligned caption under the baseline.
 */
export function GroupedBars({
  categories,
  series,
  unit = '%',
  valueLabels = false,
  legend = 'bottom',
  axisLabel,
}: {
  categories: string[];
  series: Series[];
  unit?: string;
  valueLabels?: boolean;
  legend?: 'top' | 'bottom';
  axisLabel?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const max = Math.max(...series.flatMap((s) => s.values));
  // Leave headroom above the tallest bar when value labels sit on top.
  const scale = valueLabels ? 0.86 : 1;

  return (
    <div ref={ref}>
      {legend === 'top' && (
        <div className="mb-8">
          <SeriesLegend series={series} />
        </div>
      )}
      <div className="flex items-end gap-2 md:gap-4 h-52 md:h-64 border-b border-foreground/15">
        {categories.map((cat, ci) => (
          <div key={cat} className="flex-1 flex flex-col justify-end h-full">
            <div className="flex items-end justify-center gap-1.5 md:gap-2.5 h-full">
              {series.map((s, si) => {
                const v = s.values[ci] ?? 0;
                const color = s.highlight ? 'bg-accent' : SERIES_BG[si % SERIES_BG.length];
                return (
                  <div
                    key={s.name}
                    className="flex h-full w-full max-w-[28px] flex-col items-center justify-end"
                  >
                    {valueLabels && (
                      <span
                        className="mb-1.5 text-[10px] md:text-[11px] font-semibold tabular-nums text-foreground/70"
                        style={{
                          opacity: inView ? 1 : 0,
                          transition: `opacity 500ms ${EASE} ${ci * 60 + si * 40 + 200}ms`,
                        }}
                      >
                        {v}
                      </span>
                    )}
                    <div
                      title={`${s.name}: ${v}${unit}`}
                      className={`w-full ${color}`}
                      style={{
                        height: inView ? `${(v / max) * 100 * scale}%` : '0%',
                        transition: `height 800ms ${EASE} ${ci * 60 + si * 40}ms`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 md:gap-4 mt-2">
        {categories.map((cat) => (
          <span
            key={cat}
            className="flex-1 text-center text-[9px] md:text-[10px] uppercase tracking-[0.08em] text-foreground/50 leading-tight"
          >
            {cat}
          </span>
        ))}
      </div>
      {axisLabel && (
        <div className="mt-3 text-[9px] md:text-[10px] uppercase tracking-[0.16em] text-foreground/40">
          {axisLabel}
        </div>
      )}
      {legend === 'bottom' && (
        <div className="mt-5">
          <SeriesLegend series={series} />
        </div>
      )}
    </div>
  );
}

/** The water-chain flow diagram (Figure 2). */
export function WaterChain({
  steps,
  outcomes,
}: {
  steps: string[];
  outcomes: string[];
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const node = (text: string, accent = false) => (
    <div
      key={text}
      className={`border px-4 py-3 text-sm leading-snug ${
        accent
          ? 'border-accent/40 bg-accent/[0.06] text-foreground'
          : 'border-foreground/20 bg-paper text-foreground/80'
      }`}
    >
      {text}
    </div>
  );
  return (
    <div
      ref={ref}
      className="grid md:grid-cols-[1.1fr_auto_1fr] gap-4 md:gap-6 items-center"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(12px)',
        transition: `opacity 700ms ${EASE}, transform 700ms ${EASE}`,
      }}
    >
      <div className="space-y-3">
        {steps.map((s) => node(s))}
      </div>
      <div aria-hidden className="text-accent text-2xl text-center md:rotate-0 rotate-90">→</div>
      <div className="space-y-3">{outcomes.map((o) => node(o, true))}</div>
    </div>
  );
}

/** Counts up to `value` on scroll-in. */
export function CountUp({
  value,
  className,
  prefix = '',
  suffix = '',
}: {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1100;
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

/**
 * Springy scale + fade reveal, the card "pops" in on scroll. Use a stagger
 * (delay = index * ~90ms) across a row of cards for the cascade.
 */
export function PopIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(16px) scale(0.92)',
        transition:
          `opacity 480ms ${EASE} ${delay}ms, ` +
          // overshoot easing gives the pop
          `transform 560ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}

const STACK_BG = ['bg-foreground', 'bg-accent', 'bg-foreground/35'];

/** Single proportional stacked bar with a legend (e.g. sample composition). */
export function StackedBar({
  segments,
}: {
  segments: { label: string; value: number }[];
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const total = segments.reduce((a, s) => a + s.value, 0);
  return (
    <div ref={ref}>
      <div className="flex h-3.5 w-full overflow-hidden border border-foreground/15">
        {segments.map((s, i) => (
          <div
            key={s.label}
            className={STACK_BG[i % STACK_BG.length]}
            style={{
              width: inView ? `${(s.value / total) * 100}%` : '0%',
              transition: `width 900ms ${EASE} ${i * 120}ms`,
            }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {segments.map((s, i) => (
          <span key={s.label} className="inline-flex items-center gap-2 text-[11px]">
            <span className={`h-2.5 w-2.5 ${STACK_BG[i % STACK_BG.length]}`} />
            <span className="text-foreground/65">{s.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
