"use client";

/**
 * Whisper-scale motion primitives.
 *
 * Visual values (durations, easings, distances) live in CSS custom
 * properties set in globals.css, which mirror motion in tokens.ts. These
 * primitives only toggle the right data attribute or animation class; CSS
 * does the work.
 */

import { usePathname } from "next/navigation";
import { Children, cloneElement, createElement, isValidElement, useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactElement, ReactNode, RefObject } from "react";

import { motion } from "./tokens";

type RevealDistance = "whisper" | "soft";

/**
 * Fades + lifts children into place when they enter the viewport. Fires
 * once. Server-rendered HTML ships with data-reveal="out", so the initial
 * paint already matches the off state; no flash.
 */
export function Reveal({
  children,
  as: As = "div",
  delay = 0,
  distance = "whisper",
  threshold = motion.reveal.threshold,
  rootMargin = motion.reveal.rootMargin,
  className,
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  distance?: RevealDistance;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSeen(true);
            obs.disconnect();
            return;
          }
        }
      },
      { threshold, rootMargin },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  const mergedStyle: CSSProperties = {
    ...style,
    ...(delay
      ? ({ ["--reveal-delay" as string]: `${delay}ms` } as CSSProperties)
      : null),
  };

  return createElement(
    As,
    {
      ref,
      "data-reveal": seen ? "in" : "out",
      "data-reveal-distance": distance,
      className,
      style: mergedStyle,
    },
    children,
  );
}

/**
 * Stagger helper. Wrap a list of <Reveal> children and the stagger gap is
 * applied automatically by index. Children must accept `delay` as a prop.
 */
export function RevealGroup({
  children,
  gap = motion.stagger.base,
  baseDelay = 0,
}: {
  children: ReactNode;
  gap?: number;
  baseDelay?: number;
}) {
  let visibleIndex = 0;
  return (
    <>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        const element = child as ReactElement<{ delay?: number }>;
        const existing = element.props.delay ?? 0;
        const delay = baseDelay + visibleIndex * gap + existing;
        visibleIndex += 1;
        return cloneElement(element, { delay });
      })}
    </>
  );
}

/**
 * Heading entry treatment: opacity + small letter-spacing settle. Use on
 * H1/Lede. For body copy, use <Reveal> instead.
 */
export function TextReveal({
  children,
  as: As = "span",
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSeen(true);
            obs.disconnect();
            return;
          }
        }
      },
      { threshold: motion.reveal.threshold, rootMargin: motion.reveal.rootMargin },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const mergedStyle: CSSProperties = {
    ...style,
    ...(delay
      ? ({ ["--reveal-delay" as string]: `${delay}ms` } as CSSProperties)
      : null),
  };

  return createElement(
    As,
    {
      ref,
      "data-text-reveal": seen ? "in" : "out",
      className,
      style: mergedStyle,
    },
    children,
  );
}

/* ─── Scroll-driven primitives ────────────────────────────────────────── */

/**
 * Returns a 0..1 scroll progress for the given element ref.
 *
 * `anchor` selects the mapping:
 *
 *  - "through" (default): 0 when the element's top edge enters the viewport
 *    from the bottom; 1 when the element's bottom edge leaves through the
 *    top. Tracks travel through the whole viewport — useful for animating
 *    something the entire time a section is on screen.
 *
 *  - "enter-from-bottom": 0 when the element's top edge is at the bottom of
 *    the viewport (not yet visible); 1 when the element's bottom edge has
 *    reached the bottom of the viewport (element fully in view). Useful for
 *    "reveal as you scroll past the bottom" patterns: progress saturates
 *    once the element is fully visible, so content stays revealed as the
 *    user keeps scrolling.
 *
 * Updates are throttled to requestAnimationFrame.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  {
    anchor = "through",
    scrollSpan = 1,
  }: {
    anchor?: "through" | "enter-from-bottom";
    /**
     * Multiplies the scroll distance over which progress runs from 0 to 1.
     * Default 1 (animation completes when the element is fully in view in
     * enter-from-bottom mode). Values > 1 make the animation slower —
     * progress reaches 1 only after the element has scrolled `scrollSpan ×
     * height` past its entry point.
     */
    scrollSpan?: number;
  } = {},
): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Lerp factor per rAF tick. ~0.18 converges within ~22 frames (~350ms)
    // and gives an inertial, editorial follow. CSS transitions are kept
    // short so this hook is the dominant smoother.
    const LERP = 0.18;
    const EPSILON = 0.0008;

    let raf: number | null = null;
    let target = 0;
    let current = 0;

    const computeTarget = (): number => {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      let v: number;
      if (anchor === "enter-from-bottom") {
        const denom = Math.max(1, rect.height * scrollSpan);
        v = (vh - rect.top) / denom;
      } else {
        const total = rect.height * scrollSpan + vh;
        v = (vh - rect.top) / total;
      }
      return Math.max(0, Math.min(1, v));
    };

    const tick = () => {
      const delta = target - current;
      if (Math.abs(delta) < EPSILON) {
        current = target;
        setProgress(current);
        raf = null;
        return;
      }
      current = current + delta * LERP;
      setProgress(current);
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = computeTarget();
      if (raf === null) raf = requestAnimationFrame(tick);
    };

    target = computeTarget();
    current = target;
    setProgress(current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, anchor, scrollSpan]);

  return progress;
}

/**
 * Body copy that reveals word-by-word as the user scrolls past the block.
 *
 * By default the component self-tracks: progress runs 0..1 as the block
 * enters the viewport from the bottom, saturating once the block is fully
 * visible. So the reveal feels anchored to the text itself, not the
 * surrounding section. Pass `progress` to override (for cases where
 * multiple elements should share one scroll-driven value).
 *
 * Each word ships with an inline --t threshold; CSS in globals.css drives
 * its opacity off the container's --p variable. Inline emphasis is
 * expressed via segment objects with `strong` or `accent`.
 *
 * range = [start, end]: the progress window during which the reveal plays.
 * Words evenly stagger across the window with a small per-word ramp.
 */
export type ScrollWordSegment =
  | string
  | { text: string; strong?: boolean; accent?: boolean };

export function ScrollWordReveal({
  segments,
  progress: externalProgress,
  range = [0, 1],
  as: As = "p",
  className,
}: {
  segments: ScrollWordSegment[];
  /** Override the self-tracked progress. Useful when several blocks should share one value. */
  progress?: number;
  range?: [number, number];
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const selfProgress = useScrollProgress(ref, { anchor: "enter-from-bottom" });
  const progress = externalProgress ?? selfProgress;

  type Word = { word: string; strong: boolean; accent: boolean; spaceAfter: boolean };
  const words: Word[] = [];
  for (const seg of segments) {
    const text = typeof seg === "string" ? seg : seg.text;
    const strong = typeof seg !== "string" && !!seg.strong;
    const accent = typeof seg !== "string" && !!seg.accent;
    const tokens = text.split(/(\s+)/);
    for (const tok of tokens) {
      if (!tok) continue;
      if (/^\s+$/.test(tok)) {
        if (words.length > 0) words[words.length - 1].spaceAfter = true;
      } else {
        words.push({ word: tok, strong, accent, spaceAfter: false });
      }
    }
  }

  const n = Math.max(1, words.length);
  const [start, end] = range;
  const span = Math.max(0.0001, end - start);
  const localProgress = (progress - start) / span;

  // CSS ramps each word's opacity over 1/6 of --p (see [data-scroll-word]).
  // To guarantee every word — including the last — reaches full opacity by
  // --p = 1, compress the thresholds into [0, 1 - rampWidth] so the final
  // word starts revealing at p = 1 - rampWidth and finishes at p = 1.
  const RAMP_WIDTH = 1 / 6;
  const lastIdx = Math.max(1, n - 1);
  const tScale = 1 - RAMP_WIDTH;

  return createElement(
    As,
    {
      ref,
      className,
      "data-scroll-words": "",
      style: { ["--p" as string]: localProgress.toFixed(4) } as CSSProperties,
    },
    words.map((w, i) => {
      const t = (i / lastIdx) * tScale;
      const wordClass = [
        w.strong ? "text-foreground font-semibold" : null,
        w.accent ? "text-accent font-bold not-italic" : null,
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <span
          key={i}
          data-scroll-word=""
          data-strong={w.strong ? "" : undefined}
          data-accent={w.accent ? "" : undefined}
          className={wordClass || undefined}
          style={{ ["--t" as string]: t.toFixed(4) } as CSSProperties}
        >
          {w.word}
          {w.spaceAfter ? " " : ""}
        </span>
      );
    }),
  );
}

/**
 * Scroll-driven left-to-right clip-path wipe.
 *
 * Children are clipped from the right; as the wrapper's progress runs 0..1
 * the clip retracts, drawing the content in left-to-right. Self-tracks via
 * useScrollProgress(enter-from-bottom) by default, so it pairs naturally
 * with ScrollWordReveal — the wipe completes once the wrapper is fully
 * inside the viewport.
 *
 * Use for hero headlines, rules, or SVG marks that should "draw" into
 * place as the user reaches them.
 */
export function ScrollWipeReveal({
  children,
  progress: externalProgress,
  range = [0, 1],
  direction = "right",
  as: As = "div",
  className,
}: {
  children: ReactNode;
  /** Override the self-tracked progress so multiple wipes can share a value. */
  progress?: number;
  range?: [number, number];
  /** "right" wipes from left to right (default). "left" wipes from right to left. */
  direction?: "right" | "left";
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const selfProgress = useScrollProgress(ref, { anchor: "enter-from-bottom" });
  const progress = externalProgress ?? selfProgress;
  const [start, end] = range;
  const span = Math.max(0.0001, end - start);
  const local = Math.max(0, Math.min(1, (progress - start) / span));
  return createElement(
    As,
    {
      ref,
      className,
      "data-scroll-wipe": "",
      "data-wipe-direction": direction,
      style: { ["--p" as string]: local.toFixed(4) } as CSSProperties,
    },
    children,
  );
}

/**
 * Scroll-driven horizontal slide + fade.
 *
 * `from="left"` starts the children translated to the left of their final
 * position; `from="right"` starts them to the right. As progress runs 0..1
 * the translate retracts to 0 and opacity rises. Self-tracks via
 * useScrollProgress(enter-from-bottom) by default; pass `progress` to
 * share a value with sibling animations.
 *
 * `distance` is the start offset, defaulting to 30% of the element's own
 * width (HTML transform semantics). Override with any CSS length.
 */
export function ScrollSlideReveal({
  children,
  from = "left",
  distance = "30%",
  progress: externalProgress,
  range = [0, 1],
  scrollSpan = 1,
  as: As = "div",
  className,
  style,
}: {
  children: ReactNode;
  from?: "left" | "right";
  /** Start offset as a CSS length (defaults to 30% of element width). */
  distance?: string;
  /** Override the self-tracked progress so multiple slides can share a value. */
  progress?: number;
  range?: [number, number];
  /** Multiplier on the natural scroll length. >1 makes the slide slower. */
  scrollSpan?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const selfProgress = useScrollProgress(ref, { anchor: "enter-from-bottom", scrollSpan });
  const progress = externalProgress ?? selfProgress;
  const [start, end] = range;
  const span = Math.max(0.0001, end - start);
  const local = Math.max(0, Math.min(1, (progress - start) / span));
  const merged: CSSProperties = {
    ...style,
    ["--p" as string]: local.toFixed(4),
    ["--slide-distance" as string]: distance,
  } as CSSProperties;
  return createElement(
    As,
    {
      ref,
      className,
      "data-scroll-slide": "",
      "data-slide-from": from,
      style: merged,
    },
    children,
  );
}

/**
 * Mount-triggered horizontal slide + fade.
 *
 * Use this for elements that are already in the viewport on first paint
 * (hero headlines, above-the-fold content), where a scroll-driven reveal
 * would complete invisibly before the user can see it. The animation
 * plays once on mount via a CSS keyframe, so `delay` and `duration` are
 * deterministic — pick them to coordinate with surrounding entrance
 * animations (e.g. SynapserHero's overlay fade).
 *
 * Children that scroll-reveal once the page is below the fold should keep
 * using <ScrollSlideReveal /> instead.
 */
export function MountSlideReveal({
  children,
  from = "left",
  distance = "30%",
  delay = 0,
  duration = 900,
  as: As = "div",
  className,
  style,
}: {
  children: ReactNode;
  from?: "left" | "right";
  /** Start offset as a CSS length (defaults to 30% of element width). */
  distance?: string;
  /** Delay in ms before the animation begins. */
  delay?: number;
  /** Animation duration in ms. */
  duration?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}) {
  const merged: CSSProperties = {
    ...style,
    ["--ms-distance" as string]: distance,
    ["--ms-delay" as string]: `${delay}ms`,
    ["--ms-duration" as string]: `${duration}ms`,
  } as CSSProperties;
  return createElement(
    As,
    {
      className,
      "data-mount-slide": "",
      "data-slide-from": from,
      style: merged,
    },
    children,
  );
}

/**
 * Wraps the route subtree. On client-side navigation, the inner key resets
 * and the new tree mounts with the page-enter animation. The very first
 * mount (initial page load / hard refresh) is NOT animated, so the fade
 * does not stack on top of in-page entrance animations like SynapserHero's
 * own overlay fade. Leave outside <PageTransition> anything that should
 * not re-mount on navigation (e.g. <GrainOverlay />).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const firstPath = useRef<string | null>(null);
  if (firstPath.current === null) {
    firstPath.current = pathname;
  }
  const animate = pathname !== firstPath.current;
  return (
    <div key={pathname} className={animate ? "motion-page-enter" : undefined}>
      {children}
    </div>
  );
}
