import Link from "next/link";
import { createElement } from "react";
import type { ComponentProps, ElementType, ReactNode } from "react";

import { effect } from "./tokens";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ─── Layout ──────────────────────────────────────────────────────────── */

/**
 * Full-width section wrapper with horizontal padding and a vertical rhythm
 * preset. `tone` swaps the surface for dark/paper variants used on the
 * landing page.
 */
export function Section({
  children,
  tone = "background",
  pad = "md",
  className,
  as: As = "section",
}: {
  children: ReactNode;
  tone?: "background" | "foreground" | "paper";
  pad?: "sm" | "md" | "lg";
  className?: string;
  as?: ElementType;
}) {
  const padClass = {
    sm: "pt-[6vh] md:pt-[10vh] pb-[10vh] md:pb-[14vh]",
    md: "pt-[10vh] md:pt-[16vh] pb-[14vh] md:pb-[18vh]",
    lg: "pt-[12vh] md:pt-[18vh] pb-[14vh] md:pb-[20vh]",
  }[pad];
  const toneClass = {
    background: "bg-background text-foreground",
    foreground: "bg-foreground text-background",
    paper: "bg-paper text-foreground",
  }[tone];
  return createElement(
    As,
    {
      className: cx(
        "relative px-6 md:px-10",
        padClass,
        toneClass,
        className,
      ),
    },
    children,
  );
}

/** Centered max-width container. `size` picks one of the standard widths. */
export function Container({
  children,
  size = "wide",
  className,
}: {
  children: ReactNode;
  size?: "narrow" | "base" | "wide" | "full";
  className?: string;
}) {
  const sizeClass = {
    narrow: "max-w-[760px]",
    base: "max-w-[1100px]",
    wide: "max-w-[1200px]",
    full: "max-w-[1440px]",
  }[size];
  return (
    <div className={cx(sizeClass, "mx-auto", className)}>{children}</div>
  );
}

/** Vertical stack with a fixed gap. */
export function Stack({
  children,
  gap = 6,
  align = "stretch",
  className,
}: {
  children: ReactNode;
  gap?: 2 | 3 | 4 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  align?: "start" | "center" | "end" | "stretch";
  className?: string;
}) {
  // Tailwind JIT requires full class names at parse time, so map instead of
  // interpolating the value.
  const gapClass: Record<number, string> = {
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
    10: "gap-10",
    12: "gap-12",
    16: "gap-16",
    20: "gap-20",
    24: "gap-24",
  };
  const alignClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }[align];
  return (
    <div className={cx("flex flex-col", gapClass[gap], alignClass, className)}>
      {children}
    </div>
  );
}

/* ─── Button ──────────────────────────────────────────────────────────── */

type ButtonVariant = "primary" | "accent" | "outline" | "ghost";

const BUTTON_BASE =
  "inline-flex items-center justify-center px-8 py-4 text-[11px] uppercase tracking-[0.28em] font-semibold transition-soft";

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:bg-accent hover:text-background",
  accent:
    "bg-accent text-background hover:bg-foreground hover:text-background",
  outline:
    "border border-foreground text-foreground hover:bg-foreground hover:text-background",
  ghost:
    "text-foreground hover:text-accent",
};

/** Anchor-style button. Use ButtonLink for Next routes. */
export function Button({
  children,
  variant = "primary",
  className,
  ...rest
}: { variant?: ButtonVariant } & ComponentProps<"button">) {
  return (
    <button
      className={cx(BUTTON_BASE, BUTTON_VARIANT[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Button styled as a Next link. */
export function ButtonLink({
  children,
  variant = "primary",
  className,
  ...rest
}: { variant?: ButtonVariant } & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cx(BUTTON_BASE, BUTTON_VARIANT[variant], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

/* ─── Surfaces ────────────────────────────────────────────────────────── */

/**
 * Paper card. Provides the hairline border + paper background used for
 * cards floating over the page surface (search bar, kit tiles, etc.).
 */
export function Paper({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return createElement(
    As,
    {
      className: cx(
        "bg-paper border border-foreground/15 shadow-sm",
        className,
      ),
    },
    children,
  );
}

/** Horizontal divider hairline. */
export function RuleLine({
  tone = "muted",
  className,
}: {
  tone?: "muted" | "strong";
  className?: string;
}) {
  const toneClass =
    tone === "strong" ? "bg-foreground" : "bg-foreground/15";
  return (
    <div
      aria-hidden
      className={cx("h-px w-full", toneClass, className)}
    />
  );
}

/** Vertical divider hairline. */
export function RuleColumn({
  tone = "muted",
  className,
}: {
  tone?: "muted" | "strong";
  className?: string;
}) {
  const toneClass =
    tone === "strong" ? "bg-foreground" : "bg-foreground/15";
  return (
    <div
      aria-hidden
      className={cx("w-px h-full", toneClass, className)}
    />
  );
}

/**
 * Subtle film-grain overlay. Mount once per page that wants ambient texture.
 *
 * The static look (opacity, blend-mode, tile size, noise frequency) is
 * driven by `effect.grain` in tokens.ts so a single edit propagates
 * everywhere. The flicker animation lives in globals.css (@keyframes
 * grain-shift) because keyframes cannot be inlined cleanly.
 */
export function GrainOverlay() {
  const g = effect.grain;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${g.tileSize}' height='${g.tileSize}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${g.baseFrequency}' numOctaves='${g.numOctaves}' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>`;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[60] grain-overlay-motion"
      style={{
        inset: "-12%",
        opacity: g.opacity,
        mixBlendMode: g.blendMode,
        backgroundImage: `url("data:image/svg+xml;utf8,${svg}")`,
        backgroundSize: `${g.tileSize}px ${g.tileSize}px`,
        backgroundRepeat: "repeat",
        willChange: "transform",
      }}
    />
  );
}
