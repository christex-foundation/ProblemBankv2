# Constraints

Hard limits the design system has to live within. Some are inherited from the audience (Sierra Leone, low-bandwidth, mobile-heavy); some are choices we already shipped in `src/design/` and `globals.css`.

---

## Audience constraints

| Constraint | Source | Implication |
|---|---|---|
| **Mobile-first, 360px target** | Sierra Leone phone-first audience, primary product spec | Every page is designed for a 360px viewport before any `md:` overrides. `Section`'s default padding is `px-6` (24px) at base. |
| **Body text ≥ 16px** | Readability on low-end Android | `Body size="md"` resolves to `text-base md:text-lg` (16px → 18px). `Body size="sm"` (14px) is only for metadata, never running copy. |
| **Contrast ≥ 4.5:1** | WCAG AA, low-light reading | The neutral palette already meets it: `--foreground: #0e0e0d` on `--background: #cecbba` is ~12:1. `text-foreground/55` on background is ~5:1 (passes). `text-foreground/45` is the floor for non-essential text only. |
| **Slow 3G first-paint < 3s** | Sierra Leone bandwidth | No webfont serif (system stack). One webfont sans (Inter) with `display: swap`. No images above the fold on landing; the hero is text + animated DOM nodes, no raster. |
| **No heavy decoration on critical paths** | Same | The `/feed/submit`, `/signin`, `/library/[slug]` surfaces will not get film grain, scroll-driven reveals, or `SynapserHero`-style animation. Those are landing-only. |

---

## Accessibility constraints

| Constraint | How it shows up in code |
|---|---|
| **`prefers-reduced-motion` respected** | `globals.css:262–281` disables all reveal, page-transition, scroll-driven, and grain animations under the media query. Every motion primitive degrades to a static state. |
| **Focus states visible** | `link-underline` uses `:focus-visible`. Buttons inherit browser focus rings (no `outline: none` overrides anywhere in the system as of this writing). |
| **Decorative SVG marked `aria-hidden`** | All display-scale SVG headlines (`<text>` in `EqualWidthHeadline`, `BuildWhatMattersHeadline`, etc.) carry `aria-hidden` on the SVG and `role="img" aria-label="..."` on the wrapping div. So screen readers read the headline as a single string, not letter-by-letter. |
| **Tabular numerals for counts** | `.num` and `.tabular` classes in `globals.css` force `font-variant-numeric: tabular-nums`. Use on every stat, vote count, timestamp. |
| **Color is never the only signal** | Status badges (Week 2+) must pair color with text. Voting and category coloring already uses both. |

---

## Performance constraints

| Constraint | Mechanism |
|---|---|
| **One webfont** | Inter only, via `next/font/google` (`src/app/layout.tsx:7`). System serif stack for all serif copy. |
| **No client JS for static reveals** | `Reveal`, `TextReveal` set `data-reveal="out"` server-side so the initial paint has no flash. Hydration only flips the attribute on intersection. |
| **No animation library** | Motion is CSS-only (`globals.css`). React side just toggles data attributes and inline CSS variables. No Framer Motion, no GSAP, no react-spring. |
| **Three.js / WebGL is opt-in** | `SynapserHero`, `EntriesFlow3D`, `LibraryConstellation`, `Universe` use `@react-three/*` and only run on pages that import them. Library / feed / admin pages do not pay this cost. |
| **Background animations pause when off-screen** | The grain overlay is `position: fixed` so it never re-layouts. Scroll-driven reveals stop computing once `IntersectionObserver` reports out-of-view. |

---

## Visual-system constraints (self-imposed)

These are choices we already made. Changing them means a system-wide audit.

| Choice | Where | Why locked |
|---|---|---|
| **Single accent color** | `--accent: #c8442a`, `tokens.ts:16` | The whole landing page relies on accent being the only attention color. Adding a second accent breaks the hierarchy. |
| **No shadows** | `tokens.ts` only ships `border.hairline` and `border.card`; no `shadow` token | We use rules (`RuleLine`, `RuleColumn`) and borders for separation, not elevation. Materializes the "editorial / paper" feel. |
| **No rounded corners** | Buttons, papers, cards: all square (`tokens.ts` has no radius scale) | Same reason. Right angles read as institutional / printed, not consumer SaaS. |
| **Vertical rhythm in `vh`, not `px`** | `Section` primitive uses `pt-[6vh] md:pt-[10vh] pb-[14vh] md:pb-[18vh]` and similar | Sections breathe the same way at any viewport height. Trade-off: harder to predict pixel-exact spacing. |
| **Headlines stretch via SVG `textLength`** | `EqualWidthHeadline`, `BuildWhatMattersHeadline`, etc. | Lets us hit display-scale type without relying on a webfont with that weight, and makes every line span the same width regardless of character count. Trade-off: not selectable text, must duplicate copy in `aria-label`. |

---

## Out of scope this week

The original Day 1 brief expected a Designer to define these as well. Until then they're open:

- A radius scale (we have zero radii in tokens).
- A shadow scale (we have zero shadows).
- A dark theme (CSS variables are themable but no `:root.dark` exists).
- Component states for `Input`, `Select`, `Textarea` (no primitives yet, see `COMPONENTS.md`).
- A semantic color set (success/warning/error/info) beyond the four category colors.

---

*Constraints that block Week 2 implementation should be filed as GitHub issues tagged `design-blocker`.*
