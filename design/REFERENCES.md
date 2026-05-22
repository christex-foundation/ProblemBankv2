# References

Visual and editorial inputs that shaped the Problem Bank design system as shipped in PR #4 / #5 (landing page + `src/design/` primitives). Captured post-hoc from the work; not a curated mood board from a fresh round.

---

## Visual systems studied

| Reference | What we took from it |
|---|---|
| **Synapser (synapser.com)** | The hero treatment: a physics-animated word field with a centered editorial overlay. Directly inspired `SynapserHero.tsx` and the ambient film-grain in `GrainOverlay` (`src/design/primitives.tsx`). Also the "whisper motion" idea: very small distances, slow easings, low opacity deltas. |
| **The Browser Company / Arc website** | Editorial typography at display scale, oversized black weights, layered SVG headlines that stretch via `textLength` (see `EqualWidthHeadline` in `src/app/page.tsx`). The pattern of an accent line + a neutral line stacked. |
| **Stripe Press / NYT editorial** | Serif lede paragraphs (`<Lede>`) following oversized sans-serif headlines. The italic "tagline" at section end ("decision-ready.", "an optional proof of concept."). |
| **Linear marketing site** | Tight section rhythm using `vh`-based padding (`Section` primitive's `pad="sm" | "md" | "lg"`). |
| **Vercel "Build" copy pattern** | The two-word imperative anchor ("BUILD WHAT MATTERS", "TWO PATHS ONE LIBRARY", "EACH ENTRY ARRIVES") with the verb in accent, the predicate in foreground. |

---

## Internal references reused

| Source | Status |
|---|---|
| `public/images/` (Christex logos, hackathon assets) | Not yet pulled into the landing page; available for the nav/footer when we replace the placeholder `Problem Bank` wordmark. |
| Christex Foundation site (christex.foundation) | Color anchor came from here in spirit (warm beige page, near-black ink, red-orange accent), but exact hex values were tuned in `src/design/tokens.ts`. |
| Hackathon-era palette | Not carried forward. The hackathon page used a brighter palette; the new system is intentionally muted and paper-like. |

---

## Type stack decision

| Family | Use | Where loaded |
|---|---|---|
| **Inter** (Google Fonts) | Sans for everything except lede / tagline. Loaded via `next/font/google` in `src/app/layout.tsx` and exposed as `--font-inter`. | `src/app/layout.tsx:7` |
| **System serif stack** (`ui-serif, Georgia, "Times New Roman", serif`) | Lede paragraphs, italic taglines. No webfont download. | `src/design/tokens.ts:44` (`type.family.serif`) |
| **Decoy** (proposed in the original plan) | Not adopted. We chose Inter + system serif to keep webfont weight low and avoid a custom license. Revisit if brand wants a more distinctive display face. |

---

## Open references for Week 2+

These weren't applied this week but are useful when filling out the rest of the system:

- **Notion**: empty-state illustrations, in-product tone of voice.
- **GitHub**: badge SVG pattern (we already have `/api/badge/[slug]`); their shield style is a viable visual baseline.
- **Stripe Docs**: long-form content rhythm for `/library/[slug]` document tabs.
- **Frontier-market analogues**: not yet sourced. Open question for the Designer when Day 1 properly happens — what visual systems do peers in the Africa-tech / civic-tech space use?

---

*This file is reverse-documented from PR #4 + #5. The original Designer Day 1 brief expected a curated reference review before code; replace this with the real version when Designer onboards.*
