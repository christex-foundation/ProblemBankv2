import { createElement } from "react";
import type { ElementType, ReactNode } from "react";

type Align = "left" | "center" | "right";

const ALIGN: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Small all-caps label used above section headlines and on chips.
 * Default size is the recurring 11px / 0.32em pattern from landing/main.
 */
export function Eyebrow({
  children,
  tone = "accent",
  size = "md",
  as: As = "div",
  align = "left",
  className,
}: {
  children: ReactNode;
  tone?: "accent" | "foreground" | "muted" | "faint";
  size?: "sm" | "md";
  as?: ElementType;
  align?: Align;
  className?: string;
}) {
  const sizeClass =
    size === "sm"
      ? "text-[10px] tracking-[0.22em]"
      : "text-[11px] tracking-[0.22em]";
  const toneClass = {
    accent: "text-accent",
    foreground: "text-foreground",
    muted: "text-foreground/55",
    faint: "text-foreground/45",
  }[tone];
  return createElement(
    As,
    {
      className: cx(
        "uppercase font-semibold",
        sizeClass,
        toneClass,
        ALIGN[align],
        className,
      ),
    },
    children,
  );
}

/**
 * Large serif body copy used for the "lede" paragraphs after a headline.
 * Italic variant covers the recurring closing tagline.
 */
export function Lede({
  children,
  italic = false,
  tone = "body",
  align = "left",
  className,
}: {
  children: ReactNode;
  italic?: boolean;
  tone?: "body" | "muted";
  align?: Align;
  className?: string;
}) {
  const toneClass = tone === "muted" ? "text-foreground/55" : "text-foreground/90";
  return (
    <p
      className={cx(
        "font-serif text-2xl md:text-3xl leading-[1.5]",
        italic && "italic tracking-[0.02em]",
        toneClass,
        ALIGN[align],
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Standard body paragraph. Use Lede for serif feature copy. */
export function Body({
  children,
  tone = "body",
  size = "md",
  align = "left",
  className,
}: {
  children: ReactNode;
  tone?: "body" | "muted" | "faint";
  size?: "sm" | "md" | "lg";
  align?: Align;
  className?: string;
}) {
  const sizeClass = {
    sm: "text-sm",
    md: "text-base md:text-lg",
    lg: "text-lg md:text-xl",
  }[size];
  const toneClass = {
    body: "text-foreground/90",
    muted: "text-foreground/55",
    faint: "text-foreground/45",
  }[tone];
  return (
    <p
      className={cx(
        sizeClass,
        toneClass,
        "leading-[1.6]",
        ALIGN[align],
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Italic-serif closing line. The recurring "Researched.", "decision-ready.",
 * etc. lines at section ends. Accent term is rendered inline via the
 * `accent` prop being a string.
 */
export function Tagline({
  children,
  align = "right",
  tone = "onLight",
  className,
}: {
  children: ReactNode;
  align?: Align;
  /** `onLight` (default) for paper/background surfaces; `onDark` for use
   *  inside Sections with `tone="foreground"`. */
  tone?: "onLight" | "onDark";
  className?: string;
}) {
  const toneClass =
    tone === "onDark" ? "text-background/55" : "text-foreground/55";
  return (
    <p
      className={cx(
        "font-serif italic text-2xl md:text-3xl tracking-[0.02em] leading-[1.4]",
        toneClass,
        ALIGN[align],
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Standard section heading (HTML, not SVG). Use EqualWidthHeadline from
 * landing/main when you need the stretched lockup; this is the everyday
 * h2 for content sections.
 */
export function Heading({
  children,
  level = 2,
  size = "h2",
  className,
}: {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4;
  size?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const Tag = `h${level}` as ElementType;
  const sizeClass = {
    h1: "text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] font-black tracking-[-0.03em]",
    h2: "text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.015em]",
    h3: "text-2xl md:text-3xl font-semibold tracking-[-0.005em] leading-[1.2]",
  }[size];
  return createElement(
    Tag,
    { className: cx(sizeClass, className) },
    children,
  );
}

/** Tabular-num numeric callout. */
export function Stat({
  value,
  label,
  accent = false,
}: {
  value: string | number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={cx(
          "num text-3xl md:text-4xl font-semibold tracking-[-0.025em]",
          accent && "text-accent",
        )}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/55">
        {label}
      </span>
    </div>
  );
}
