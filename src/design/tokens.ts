/**
 * Single source of truth for the visual language.
 *
 * Colors live in CSS as custom properties (see globals.css) so they can be
 * themed and referenced from Tailwind utilities. Anything that needs a
 * literal value at build time (gradients in JS, SVG strings, motion math)
 * imports from here.
 */

export const color = {
  background: "var(--background)",
  paper: "var(--paper)",
  foreground: "var(--foreground)",
  muted: "var(--muted)",
  rule: "var(--rule)",
  accent: "var(--accent)",
  category: {
    economy: "var(--cat-economy)",
    infrastructure: "var(--cat-infrastructure)",
    social: "var(--cat-social)",
    safety: "var(--cat-safety)",
  },
} as const;

/**
 * Text emphasis ramp. Use as `text-foreground/55` style or via the
 * primitives. Captured as discrete steps to keep the palette consistent.
 */
export const emphasis = {
  primary: 100,
  body: 90,
  secondary: 75,
  muted: 55,
  faint: 45,
  whisper: 30,
} as const;

/**
 * Type ramp. Sizes are px and meant to be used inside the typography
 * primitives. Tracking values are em (Tailwind syntax).
 */
export const type = {
  family: {
    sans: "var(--font-inter), system-ui, sans-serif",
    serif: 'ui-serif, Georgia, "Times New Roman", serif',
  },
  size: {
    micro: 10,
    eyebrow: 11,
    caption: 12,
    body: 14,
    bodyLg: 16,
    lede: 20,
    ledeLg: 24,
    h3: 28,
    h2: 40,
    h1: 64,
    display: 128,
  },
  tracking: {
    tight: "-0.025em",
    snug: "-0.005em",
    normal: "0",
    wide: "0.02em",
    label: "0.18em",
    eyebrow: "0.28em",
    eyebrowLoose: "0.32em",
  },
  leading: {
    none: 1,
    tight: 1.05,
    snug: 1.2,
    body: 1.5,
    loose: 1.6,
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
} as const;

/**
 * Vertical rhythm for sections. Used by the Section primitive; values are
 * percent of viewport height so they scale across breakpoints.
 */
export const space = {
  sectionPadX: { base: "1.5rem", md: "2.5rem" },
  sectionPadY: {
    sm: { base: "6vh", md: "10vh" },
    md: { base: "10vh", md: "16vh" },
    lg: { base: "14vh", md: "20vh" },
  },
  container: {
    narrow: 760,
    base: 1100,
    wide: 1200,
    full: 1440,
  },
} as const;

/**
 * Motion constants for the whisper system.
 *
 * The look is editorial: short distances, low opacity deltas, slow easings.
 * Values here are the source of truth; globals.css mirrors them as CSS
 * custom properties so both JS and Tailwind utilities resolve the same
 * timing. When you change a value, update both places.
 */
export const motion = {
  duration: {
    fast: 180,
    base: 260,
    slow: 460,
    deliberate: 900,
  },
  ease: {
    standard: "cubic-bezier(.2,.85,.25,1)",
    overshoot: "cubic-bezier(.2,.85,.25,1.05)",
    inOut: "cubic-bezier(.65,0,.35,1)",
  },
  /** Travel distance for whisper-style reveals. Keep small (px). */
  distance: {
    whisper: 6,
    soft: 12,
  },
  /** Stagger between successive children in a Reveal group. */
  stagger: {
    tight: 60,
    base: 90,
    loose: 140,
  },
  /** Default reveal viewport thresholds for IntersectionObserver. */
  reveal: {
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px",
  },
} as const;

/** Border + rule treatments. */
export const border = {
  rule: "1px solid var(--foreground)",
  hairline: "1px solid color-mix(in srgb, var(--foreground) 15%, transparent)",
  card: "1px solid color-mix(in srgb, var(--foreground) 15%, transparent)",
} as const;

/**
 * Surface treatments that ship via globals.css. These constants are the
 * source-of-truth values; the CSS rules in globals.css MUST match. When you
 * settle on a new value in design review, update both places (or refactor
 * globals.css to read these via PostCSS).
 */
export const effect = {
  /** Page background hex (mirrors --background in globals.css). */
  background: "#cecbba",

  /** Text selection treatment. Mirrors ::selection in globals.css. */
  selection: {
    background: "rgba(200, 68, 42, 0.45)",
    description:
      "Translucent accent tint so highlighted text stays readable on light and dark surfaces.",
  },

  /** Synapser-style film grain. Mirrors .grain-overlay in globals.css. */
  grain: {
    opacity: 0.34,
    blendMode: "multiply" as const,
    tileSize: 220,
    baseFrequency: 0.85,
    numOctaves: 2,
    animationDuration: "1.8s",
    animationSteps: 8,
  },
} as const;
