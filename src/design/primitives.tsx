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

/**
 * Card — interactive editorial tile used in list grids (library entries,
 * feed cards, builder cards, notification rows). Wrap in a Next Link or
 * button at the call site; this primitive provides the surface only.
 *
 * Spec: design/COMPONENTS.md §3.
 */
export function Card({
  children,
  interactive = true,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  interactive?: boolean;
  className?: string;
  as?: ElementType;
}) {
  return createElement(
    As,
    {
      className: cx(
        "block bg-paper border border-foreground/15 p-6 md:p-7 transition-soft",
        interactive && "hover:border-foreground/40 focus-visible:border-foreground/40",
        className,
      ),
    },
    children,
  );
}

type BadgeVariant = "tag" | "pill" | "solid";
type BadgeTone =
  | "default"
  | "accent"
  | "muted"
  | "faint"
  | "infrastructure"
  | "social"
  | "safety";

const BADGE_BASE =
  "inline-flex items-center text-[10px] uppercase tracking-[0.22em] font-semibold leading-tight";

const BADGE_TONE_TEXT: Record<BadgeTone, string> = {
  default: "text-foreground",
  accent: "text-accent",
  muted: "text-foreground/55",
  faint: "text-foreground/30",
  infrastructure: "text-[var(--cat-infrastructure)]",
  social: "text-[var(--cat-social)]",
  safety: "text-[var(--cat-safety)]",
};

const BADGE_TONE_RULE: Record<BadgeTone, string> = {
  default: "bg-foreground",
  accent: "bg-accent",
  muted: "bg-foreground/55",
  faint: "bg-foreground/30",
  infrastructure: "bg-[var(--cat-infrastructure)]",
  social: "bg-[var(--cat-social)]",
  safety: "bg-[var(--cat-safety)]",
};

const BADGE_TONE_BORDER: Record<BadgeTone, string> = {
  default: "border-foreground/40",
  accent: "border-accent/60",
  muted: "border-foreground/25",
  faint: "border-foreground/15",
  infrastructure: "border-[var(--cat-infrastructure)]/60",
  social: "border-[var(--cat-social)]/60",
  safety: "border-[var(--cat-safety)]/60",
};

/**
 * Badge / tag — status, urgency, sector chips. Three variants per spec:
 * - `tag`: 2px left rule + label, no border.
 * - `pill`: hairline border, square corners, padded.
 * - `solid`: filled accent only; reserve for critical urgency.
 *
 * Spec: design/COMPONENTS.md §4.
 */
export function Badge({
  children,
  variant = "pill",
  tone = "default",
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  tone?: BadgeTone;
  className?: string;
}) {
  if (variant === "tag") {
    return (
      <span className={cx(BADGE_BASE, BADGE_TONE_TEXT[tone], "gap-2", className)}>
        <span
          aria-hidden
          className={cx("w-[2px] h-3 inline-block", BADGE_TONE_RULE[tone])}
        />
        {children}
      </span>
    );
  }
  if (variant === "solid") {
    return (
      <span
        className={cx(
          BADGE_BASE,
          "bg-accent text-background px-2.5 py-1",
          className,
        )}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className={cx(
        BADGE_BASE,
        "border px-2.5 py-1",
        BADGE_TONE_TEXT[tone],
        BADGE_TONE_BORDER[tone],
        className,
      )}
    >
      {children}
    </span>
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
