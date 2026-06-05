'use client';

/**
 * The water chain as threaded dominoes (Figure 2).
 *
 * A coral thread winds through a line of standing tiles. As the thread draws
 * on scroll, its front reaches each tile and topples it, so tracing the line
 * and triggering the chain reaction are the same gesture: the causes knock
 * into the human costs. Fallen tiles lie along the thread.
 *
 * Renders a horizontal serpentine on desktop and a vertical one on mobile.
 * Thread draw and tile topple share the same scroll position, so the front
 * meets each tile exactly as it falls. Under reduced motion the chain rests
 * fully toppled and labelled.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

const ACCENT = '#c8442a';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
// The thread finishes drawing at this scroll position (< 1), so the final
// tile and label have headroom to fully reveal before progress caps at 1.
const DRAW_END = 0.82;

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

/** Scroll-linked 0→1 as the element rises through the viewport middle. */
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
      setProgress(clamp((vh * 0.85 - center) / (vh * 0.85 - vh * 0.32)));
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

type Node = { label: string; cost: boolean; x: number; y: number; tPos: number; fallenAngle: number };

/** Smooth cubic path through the node base points (a clean serpentine). */
function smoothPath(pts: { x: number; y: number }[]) {
  return pts.reduce((acc, pt, i) => {
    if (i === 0) return `M${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const mx = (prev.x + pt.x) / 2;
    return `${acc} C${mx} ${prev.y}, ${mx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');
}

function Chain({
  causes,
  effects,
  orientation,
}: {
  causes: string[];
  effects: string[];
  orientation: 'horizontal' | 'vertical';
}) {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>();
  const horizontal = orientation === 'horizontal';

  const { W, H, nodes, d } = useMemo(() => {
    const labels = [
      ...causes.map((label) => ({ label, cost: false })),
      ...effects.map((label) => ({ label, cost: true })),
    ];
    const n = labels.length;
    const W = horizontal ? 1000 : 360;
    const H = horizontal ? 340 : 110 + (n - 1) * 132;
    const pts = labels.map((l, i) => {
      const f = n > 1 ? i / (n - 1) : 0;
      const x = horizontal ? lerp(110, W - 110, f) : i % 2 === 0 ? 116 : 150;
      const y = horizontal ? (i % 2 === 0 ? 212 : 150) : lerp(64, H - 56, f);
      // the scroll position at which the thread front reaches this node. The
      // whole thread finishes drawing at DRAW_END (< 1), leaving headroom for
      // the final tile + label to fully reveal before progress caps at 1.
      const tPos = DRAW_END * f;
      return { ...l, x, y, tPos };
    });
    // each tile topples in the thread's local direction, so the fallen tiles
    // lie head-to-tail down the line. On mobile they simply lean aside.
    const nodes: Node[] = pts.map((nd, i) => {
      let fallenAngle = 78;
      if (horizontal) {
        if (i === n - 1) {
          // the final tile rests flat, lying along a straight horizontal line
          fallenAngle = 90;
        } else {
          const dx = pts[i + 1].x - pts[i].x;
          const dy = pts[i + 1].y - pts[i].y;
          fallenAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        }
      }
      return { ...nd, fallenAngle };
    });
    const d = smoothPath(nodes);
    return { W, H, nodes, d };
  }, [causes, effects, horizontal]);

  const midY = H / 2;

  // Track the thread's draw front so a coral pulse can ride it. getPointAtLength
  // is a client-only DOM read, so it runs in effects (null on the server / at rest).
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  const [pulse, setPulse] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, [d]);
  useEffect(() => {
    if (!len || !pathRef.current || p <= 0.02 || p >= DRAW_END) {
      setPulse(null);
      return;
    }
    const pt = pathRef.current.getPointAtLength(clamp(p / DRAW_END) * len);
    setPulse({ x: pt.x, y: pt.y });
  }, [p, len]);

  return (
    <div ref={ref} className="relative mx-auto w-full" style={{ maxWidth: W }}>
      {/* the thread the tiles stand on; its front is locked to scroll position */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        aria-hidden
      >
        <path d={d} fill="none" className="text-foreground/10" stroke="currentColor" strokeWidth={3.5} />
        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke={ACCENT}
          strokeWidth={5.5}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - clamp(p / DRAW_END)}
          style={{ filter: `drop-shadow(0 0 6px ${ACCENT}40)` }}
        />
        {/* the pull, where the thread starts */}
        <circle cx={nodes[0].x - (horizontal ? 6 : 0)} cy={nodes[0].y - (horizontal ? 0 : 6)} r={6} fill={ACCENT} opacity={clamp(p * 8)} />

        {/* a small footing where each tile stands, revealed as the thread arrives */}
        {nodes.map((node) => (
          <circle
            key={`foot-${node.label}`}
            cx={node.x}
            cy={node.y}
            r={3}
            fill={node.cost ? ACCENT : 'var(--foreground)'}
            opacity={seg(p, node.tPos - 0.04, node.tPos + 0.02) * (node.cost ? 0.9 : 0.5)}
          />
        ))}

        {/* the impact pulse riding the draw front: a bright core with an
            expanding halo where the chain reaction is currently striking */}
        {pulse && (
          <g style={{ pointerEvents: 'none' }}>
            <circle cx={pulse.x} cy={pulse.y} r={5} fill={ACCENT} opacity={0.5}>
              <animate attributeName="r" values="5;15;5" dur="1.1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="1.1s" repeatCount="indefinite" />
            </circle>
            <circle
              cx={pulse.x}
              cy={pulse.y}
              r={5}
              fill={ACCENT}
              style={{ filter: `drop-shadow(0 0 9px ${ACCENT})` }}
            />
          </g>
        )}
      </svg>

      {/* reserve the box height so the percentage-positioned tiles have room */}
      <div style={{ paddingTop: `${(H / W) * 100}%` }} />

      {/* contact shadow that deepens as each tile drops */}
      {nodes.map((node) => {
        const fall = seg(p, node.tPos, node.tPos + 0.14);
        return (
          <div
            key={`shadow-${node.label}`}
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: `${(node.x / W) * 100}%`,
              top: `${(node.y / H) * 100}%`,
              width: 40,
              height: 11,
              transform: 'translate(-50%, -40%)',
              background: 'radial-gradient(ellipse, rgba(14,14,13,0.22), transparent 70%)',
              filter: 'blur(2px)',
              opacity: easeOut(fall) * 0.7,
            }}
          />
        );
      })}

      {/* tiles topple as the thread front reaches each, lying down the line */}
      {nodes.map((node) => {
        const fall = seg(p, node.tPos, node.tPos + 0.14);
        const angle = lerp(0, node.fallenAngle, easeOut(fall));
        const fallen = fall > 0.6;
        const pip = node.cost ? 'rgba(248,240,231,0.92)' : 'rgba(248,240,231,0.85)';
        return (
          <div
            key={`tile-${node.label}`}
            className="absolute"
            style={{
              left: `${(node.x / W) * 100}%`,
              top: `${(node.y / H) * 100}%`,
              width: 20,
              height: 62,
              transformOrigin: '50% 100%',
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            }}
          >
            <div
              className={`relative h-full w-full rounded-[4px] ${node.cost ? 'bg-accent' : 'bg-foreground/80'}`}
              style={{
                boxShadow: fallen
                  ? `2px 4px 12px ${node.cost ? `${ACCENT}40` : 'rgba(14,14,13,0.28)'}`
                  : '0 3px 6px rgba(14,14,13,0.2)',
              }}
            >
              {/* domino face: a divider and a pip in each half */}
              <span className="absolute inset-x-[3px] top-1/2 h-px -translate-y-1/2" style={{ background: 'rgba(248,240,231,0.4)' }} />
              <span className="absolute left-1/2 top-[26%] h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: pip }} />
              <span className="absolute left-1/2 top-[74%] h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: pip }} />
              {/* top-edge highlight for a little dimension */}
              <span className="absolute inset-0 rounded-[4px]" style={{ boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.22)' }} />
            </div>
          </div>
        );
      })}

      {/* labels surface as each tile falls */}
      {nodes.map((node) => {
        const fall = seg(p, node.tPos + 0.04, node.tPos + 0.16);
        const labelAbove = horizontal && node.y < midY;
        const top = horizontal
          ? labelAbove
            ? node.y - 112
            : node.y + 14
          : node.y - 28;
        const left = horizontal ? node.x : node.x + 24;
        return (
          <div
            key={`label-${node.label}`}
            className={`absolute w-[150px] ${horizontal ? 'text-center -translate-x-1/2' : 'text-left'}`}
            style={{
              left: `${(left / W) * 100}%`,
              top: `${(top / H) * 100}%`,
              opacity: fall,
              transform: `${horizontal ? 'translateX(-50%)' : ''} translateY(${(1 - fall) * 6}px)`,
              transition: `opacity 360ms ${EASE}`,
            }}
          >
            <div className={`text-[10px] uppercase tracking-[0.2em] ${node.cost ? 'text-accent' : 'text-foreground/40'}`}>
              {node.cost ? 'Cost' : 'Cause'}
            </div>
            <div className="mt-0.5 font-semibold text-foreground text-sm leading-snug">{node.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function WaterChainThread({ causes, effects }: { causes: string[]; effects: string[] }) {
  const summary = `${causes.join(', then ')}, toppling into ${effects.join(', ')}.`;
  return (
    <figure role="img" aria-label={`The water chain: ${summary}`}>
      <div className="hidden md:block">
        <Chain causes={causes} effects={effects} orientation="horizontal" />
      </div>
      <div className="md:hidden">
        <Chain causes={causes} effects={effects} orientation="vertical" />
      </div>
      {/* accessible fallback */}
      <ol className="sr-only">
        {[...causes, ...effects].map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ol>
    </figure>
  );
}
