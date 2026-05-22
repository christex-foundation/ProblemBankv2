# Design Tokens

The visual language as values. Two files own the truth and must stay in sync:

- **`src/design/tokens.ts`** — JS/TS constants for anything that needs a literal value at build time (motion math, SVG fills, gradients in JS).
- **`src/app/globals.css`** — CSS custom properties on `:root` and a Tailwind `@theme inline` block so utility classes (`bg-background`, `text-accent`, etc.) resolve to the same values.

When a value changes, update both. The token file repeats this warning at the top of each section.

---

## Color

All colors live as CSS custom properties on `:root`. JS imports them as `var(--…)` strings via `color.*` in `tokens.ts`.

### Surface + ink

| Token | Hex | CSS var | Tailwind | Usage |
|---|---|---|---|---|
| `color.background` | `#cecbba` | `--background` | `bg-background` | Page background. Warm beige, the default canvas. |
| `color.paper` | `#faf8f3` | `--paper` | `bg-paper` | Floating cards, search bars, kit tiles. Brighter than background. |
| `color.foreground` | `#0e0e0d` | `--foreground` | `text-foreground` | Default ink. Near-black, not pure. |
| `color.muted` | `#6e6a62` | `--muted` | (use `text-foreground/55`) | Reserved for non-text muted ink. Prefer alpha on foreground for text. |
| `color.rule` | `#1a1a1a` | `--rule` | (custom) | Rule lines at strong weight. `RuleLine tone="strong"` resolves here. |
| `color.accent` | `#c8442a` | `--accent` | `bg-accent` / `text-accent` | The single accent. Used for verbs, highlights, hover states, accent headlines, selection. |

### Category colors

For the four broad sectors used in the Problem Bank. Sourced from `tokens.ts:17–22`.

| Token | Hex | CSS var |
|---|---|---|
| `category.economy` | `#c8442a` | `--cat-economy` (shares accent) |
| `category.infrastructure` | `#2f5e3e` | `--cat-infrastructure` |
| `category.social` | `#3b5b9a` | `--cat-social` |
| `category.safety` | `#8a6d3b` | `--cat-safety` |

> Note: `economy` and `accent` share `#c8442a`. Intentional; the economy is the default "this matters" category.

### Text emphasis (alpha ramp on foreground)

Use as Tailwind utilities like `text-foreground/55`. The discrete steps live in `emphasis` (`tokens.ts:29–36`) so primitives can reach for them by name.

| Token | Alpha | Where |
|---|---|---|
| `emphasis.primary` | 100% | Headlines |
| `emphasis.body` | 90% | Body copy |
| `emphasis.secondary` | 75% | Secondary body, captions |
| `emphasis.muted` | 55% | Eyebrow labels, footnotes, taglines |
| `emphasis.faint` | 45% | Decorative / structural text (numerals on kit grid) |
| `emphasis.whisper` | 30% | Dividers, in-progress states |

---

## Type

Inter (sans) + system serif. Loaded in `src/app/layout.tsx:7`.

### Families

| Token | Stack |
|---|---|
| `type.family.sans` | `var(--font-inter), system-ui, sans-serif` |
| `type.family.serif` | `ui-serif, Georgia, "Times New Roman", serif` |

### Size scale (px)

| Token | Value | Typical use |
|---|---|---|
| `micro` | 10 | Stat labels, footer rights line |
| `eyebrow` | 11 | Section eyebrows (uppercase, 0.32em tracking) |
| `caption` | 12 | Image captions, form helper text |
| `body` | 14 | Default body |
| `bodyLg` | 16 | Mobile body floor |
| `lede` | 20 | Section lede start |
| `ledeLg` | 24 | Section lede emphasis (the `<Lede>` primitive base) |
| `h3` | 28 | Sub-section headings |
| `h2` | 40 | Section headings |
| `h1` | 64 | Page headings |
| `display` | 128 | Hero headlines (in practice, SVG headlines go even bigger via `textLength`) |

### Tracking (letter-spacing, em)

| Token | Value | Use |
|---|---|---|
| `tight` | `-0.025em` | Stat numerals |
| `snug` | `-0.005em` | H3 headings |
| `normal` | `0` | Body |
| `wide` | `0.02em` | Italic serif taglines |
| `label` | `0.18em` | Kit doc labels |
| `eyebrow` | `0.28em` | Buttons, secondary eyebrows |
| `eyebrowLoose` | `0.32em` | Primary eyebrows |

### Leading

| Token | Value |
|---|---|
| `none` | 1 |
| `tight` | 1.05 |
| `snug` | 1.2 |
| `body` | 1.5 |
| `loose` | 1.6 |

### Weight

| Token | Value |
|---|---|
| `regular` | 400 |
| `medium` | 500 |
| `semibold` | 600 |
| `bold` | 700 |
| `black` | 900 (used for display headlines) |

---

## Space

Vertical rhythm is in `vh` because section breathing should scale with viewport height. Horizontal padding is in `rem`.

| Token | Base | `md:` |
|---|---|---|
| `space.sectionPadX.base` | `1.5rem` (24px) | — |
| `space.sectionPadX.md` | — | `2.5rem` (40px) |
| `space.sectionPadY.sm` | `6vh` | `10vh` |
| `space.sectionPadY.md` | `10vh` | `16vh` |
| `space.sectionPadY.lg` | `14vh` | `20vh` |

### Container widths

| Token | px |
|---|---|
| `space.container.narrow` | 760 (lede + body) |
| `space.container.base` | 1100 |
| `space.container.wide` | 1200 (default landing-page container) |
| `space.container.full` | 1440 |

---

## Border

No shadow tokens. Borders + rules carry separation.

| Token | Value |
|---|---|
| `border.rule` | `1px solid var(--foreground)` |
| `border.hairline` | `1px solid color-mix(in srgb, var(--foreground) 15%, transparent)` |
| `border.card` | `1px solid color-mix(in srgb, var(--foreground) 15%, transparent)` |

---

## Motion

The "whisper" motion system. Values mirror between `tokens.ts` and `globals.css`.

### Duration (ms)

| Token | Value | Use |
|---|---|---|
| `fast` | 180 | Color transitions on hover |
| `base` | 260 | Default `transition-soft` short variant |
| `slow` | 460 | `Reveal` opacity + transform settle, `link-underline` |
| `deliberate` | 900 | `TextReveal` (headline letter-spacing settle), `motion-page-enter` |

### Easing

| Token | Curve | Use |
|---|---|---|
| `ease.standard` | `cubic-bezier(.2,.85,.25,1)` | Default for all reveal + page transitions |
| `ease.overshoot` | `cubic-bezier(.2,.85,.25,1.05)` | Reserved; not currently used |
| `ease.inOut` | `cubic-bezier(.65,0,.35,1)` | Reserved |

### Distance (px)

| Token | Value |
|---|---|
| `distance.whisper` | 6 |
| `distance.soft` | 12 |

### Stagger (ms)

For `<RevealGroup>` and per-index `delay` props.

| Token | Value |
|---|---|
| `stagger.tight` | 60 |
| `stagger.base` | 90 |
| `stagger.loose` | 140 |

### Reveal viewport

| Token | Value |
|---|---|
| `reveal.threshold` | 0.12 |
| `reveal.rootMargin` | `0px 0px -8% 0px` (fire slightly before fully in view) |

---

## Effect

Surface effects defined in JS but realized in CSS.

### Selection

`::selection { background: rgba(200, 68, 42, 0.45); }` — accent at 45% alpha. Stays readable on light and dark surfaces.

### Grain overlay

Driven by `effect.grain` in `tokens.ts`, painted by `<GrainOverlay />` in `src/design/primitives.tsx`. Flicker keyframes live in `globals.css`.

| Property | Value |
|---|---|
| `opacity` | 0.34 |
| `blendMode` | `multiply` |
| `tileSize` | 220px |
| `baseFrequency` | 0.85 |
| `numOctaves` | 2 |
| `animationDuration` | 1.8s |
| `animationSteps` | 8 |

Disabled under `prefers-reduced-motion: reduce` (only the animation; the static texture remains).

---

## Tailwind 4 `@theme` mapping

`src/app/globals.css:31–50` exposes a subset of tokens as Tailwind utilities. Anything **not** in this block has to be reached via arbitrary values or the JS `color.*` import.

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-paper: var(--paper);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-rule: var(--rule);
  --font-sans: var(--font-inter);
}
```

What's intentionally **not** in `@theme` yet:

- Category colors (use `var(--cat-*)` directly or extend the block when these get consumer-facing usage).
- Motion durations / easings (use the CSS classes like `.transition-soft` or the data-attribute primitives).
- Spacing / radius / shadow scales (we don't have radius or shadow; spacing uses Tailwind defaults + `vh` arbitrary values).

---

*Source of truth: `src/design/tokens.ts` + `src/app/globals.css`. This doc reflects values as of the merge of PR #5 on 2026-05-22.*
