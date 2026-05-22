"use client";

import { useEffect, useRef, useState } from "react";

type Brick = {
  id: string;
  label: string;
  width: number;
  studs: number;
  variant?: "accent";
  /** Section scroll progress (0..1) at which this brick snaps in. */
  threshold: number;
};

// Bricks are listed in visual order (index 0 = top of the visual stack).
// Higher-index bricks have LOWER thresholds so they appear first and the
// tower grows upward like a real lego build: foundation step at the
// bottom, climax brick on top.

const COMMUNITY_BRICKS: Brick[] = [
  {
    id: "c1",
    label: "Submitted through the community feed",
    width: 280,
    studs: 5,
    threshold: 0.12,
  },
  {
    id: "c2",
    label: "Getting Traction",
    width: 280,
    studs: 5,
    threshold: 0.24,
  },
];

// Christex-originated entries skip the public-feed stages and enter the
// shared pipeline directly, so this column has a single input brick.
const CHRISTEX_BRICKS: Brick[] = [
  { id: "x1", label: "Identifies", width: 280, studs: 5, threshold: 0.24 },
];

const CHUTES_THRESHOLD = 0.36;

const MERGED_BRICKS: Brick[] = [
  { id: "m1", label: "Research", width: 360, studs: 6, threshold: 0.46 },
  {
    id: "m2",
    label: "Vetted & Documented",
    width: 360,
    studs: 6,
    variant: "accent",
    threshold: 0.6,
  },
];

const ALL_THRESHOLDS = [0.12, 0.24, 0.36, 0.46, 0.6];

export default function LegoBuild() {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      rafRef.current = null;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalTravel = vh + rect.height;
      const traveled = vh - rect.top;
      const raw = Math.min(1, Math.max(0, traveled / totalTravel));
      let s = 0;
      for (const t of ALL_THRESHOLDS) if (raw >= t) s++;
      setStage((prev) => (prev !== s ? s : prev));
    };
    const schedule = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(update);
      }
    };
    // Defer initial update one frame so the first paint shows the empty
    // tower; the bricks then transition in as scroll updates fire.
    rafRef.current = requestAnimationFrame(update);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const crossedMax = stage > 0 ? ALL_THRESHOLDS[stage - 1] : -1;
  const passed = (t: number) => t <= crossedMax;

  return (
    <div
      ref={ref}
      className="w-full max-w-[1100px] mx-auto flex flex-col items-stretch"
    >
      <div className="grid grid-cols-2 gap-6 md:gap-16">
        <InputColumn
          title="Community Feed"
          subtitle="raised by communities"
          bricks={COMMUNITY_BRICKS}
          passed={passed}
          align="end"
        />
        <InputColumn
          title="Christex Foundation"
          subtitle="originated in-house"
          bricks={CHRISTEX_BRICKS}
          passed={passed}
          align="start"
        />
      </div>

      <ConvergeChutes visible={passed(CHUTES_THRESHOLD)} />

      <div className="flex flex-col items-center -mt-1">
        <BrickStack bricks={MERGED_BRICKS} passed={passed} />
        <div className="mt-6 text-[11px] uppercase tracking-[0.34em] text-foreground/55 font-semibold">
          One Library entry
        </div>
      </div>
    </div>
  );
}

function InputColumn({
  title,
  subtitle,
  bricks,
  passed,
  align,
}: {
  title: string;
  subtitle: string;
  bricks: Brick[];
  passed: (t: number) => boolean;
  align: "start" | "end";
}) {
  const itemsAlign = align === "end" ? "items-end" : "items-start";
  const textAlign = align === "end" ? "text-right" : "text-left";
  return (
    <div className={`flex flex-col ${itemsAlign} gap-5 h-full`}>
      <div className={textAlign}>
        <div className="text-[10px] uppercase tracking-[0.32em] text-accent font-semibold">
          {title}
        </div>
        <div className="mt-1 text-[12px] font-serif italic text-foreground/55">
          {subtitle}
        </div>
      </div>
      <div className="flex-1 min-h-4" />
      <BrickStack bricks={bricks} passed={passed} />
    </div>
  );
}

function BrickStack({
  bricks,
  passed,
}: {
  bricks: Brick[];
  passed: (t: number) => boolean;
}) {
  // bricks[0] is the visual top of the stack. The topmost CURRENTLY VISIBLE
  // brick gets studs (the ones below are covered).
  const topmostVisibleIdx = bricks.findIndex((b) => passed(b.threshold));
  return (
    <div className="flex flex-col">
      {bricks.map((brick, i) => (
        <BrickEl
          key={brick.id}
          brick={brick}
          showStuds={i === topmostVisibleIdx}
          visible={passed(brick.threshold)}
        />
      ))}
    </div>
  );
}

function BrickEl({
  brick,
  showStuds,
  visible,
}: {
  brick: Brick;
  showStuds: boolean;
  visible: boolean;
}) {
  const accent = brick.variant === "accent";
  const studCount = brick.studs;
  const bodyBg = accent ? "var(--accent)" : "var(--foreground)";
  const bodyColor = "var(--background)";
  const studBg = accent ? "var(--accent)" : "var(--foreground)";

  return (
    <div
      className="relative"
      style={{
        width: brick.width,
        transform: visible ? "translateY(0)" : "translateY(-44px)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 460ms cubic-bezier(.2,.85,.25,1.05), opacity 260ms",
      }}
    >
      {showStuds && (
        <div
          className="flex justify-around"
          style={{ paddingLeft: 18, paddingRight: 18, marginBottom: -3 }}
        >
          {Array.from({ length: studCount }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: studBg,
                boxShadow:
                  "inset 0 -2px 0 rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      )}
      <div
        className="font-semibold uppercase text-center relative"
        style={{
          background: bodyBg,
          color: bodyColor,
          padding: "18px 22px",
          letterSpacing: "0.18em",
          fontSize: 13,
          boxShadow:
            "0 2px 0 rgba(0,0,0,0.22), inset 0 -3px 0 rgba(0,0,0,0.18)",
        }}
      >
        <span
          aria-hidden
          className="absolute left-0 right-0 top-[6px] h-[1px]"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        {brick.label}
      </div>
    </div>
  );
}

function ConvergeChutes({ visible }: { visible: boolean }) {
  return (
    <>
      <svg
        viewBox="0 0 1100 140"
        className="hidden md:block w-full my-3"
        preserveAspectRatio="none"
        style={{ height: 140 }}
        aria-hidden
      >
        <defs>
          <marker
            id="lego-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--foreground)" />
          </marker>
        </defs>
        <path
          d="M 378 4 C 378 75, 550 80, 550 134"
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="1.5"
          strokeDasharray="5 6"
          markerEnd="url(#lego-arrow)"
          style={{
            opacity: visible ? 0.55 : 0,
            transition: "opacity 500ms",
          }}
        />
        <path
          d="M 722 4 C 722 75, 550 80, 550 134"
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="1.5"
          strokeDasharray="5 6"
          markerEnd="url(#lego-arrow)"
          style={{
            opacity: visible ? 0.55 : 0,
            transition: "opacity 500ms 80ms",
          }}
        />
      </svg>
      <div
        className="md:hidden flex justify-center my-6"
        style={{
          opacity: visible ? 0.55 : 0,
          transition: "opacity 500ms",
        }}
        aria-hidden
      >
        <svg width="20" height="34" viewBox="0 0 20 34">
          <line
            x1="10"
            y1="0"
            x2="10"
            y2="28"
            stroke="var(--foreground)"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
          <path
            d="M 4 24 L 10 32 L 16 24"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </>
  );
}
