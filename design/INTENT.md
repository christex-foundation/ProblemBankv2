# Intent

What the Problem Bank should feel like to each kind of person who lands on it, and the three-sentence overall design intent that the system serves.

Reverse-documented from the landing page work in PR #4 / #5. Treat as a working statement until the Designer ratifies.

---

## Overall design intent

The Problem Bank is a **library**, not an app. It should feel like a piece of editorial work: considered, slow, weighty. The reader is meant to understand that the problems inside have been researched and the kits inside have been built to a standard, before they are asked to do anything. Then, when the action does arrive ("Browse the library", "Raise a problem"), it should feel earned.

Three sentences:

1. **Editorial over interactive.** Heavy serif lede paragraphs, oversized display headlines, vertical rhythm in `vh`. The page reads top-to-bottom like a long-form piece, not a SaaS landing.
2. **Whisper motion.** Movement is short (6–12px), slow (260–900ms), and only ever in service of revealing copy that is already there. No hover springs, no skeuomorphic affordances, no bouncing call-to-action.
3. **One accent, used sparingly.** A single warm red-orange (`--accent: #c8442a`) carries every verb, every "this matters" cue, every highlighted word. Everything else is ink-on-paper.

---

## Audiences

The product spec lists three primary audiences. Each gets a paragraph of what they should *feel* when the page loads.

### Entrepreneur / developer ("I might build this")

They should feel that the work *before* their work is already done. The phrase "the work before the work" is on the page for a reason: a developer scanning the library is looking for a problem worth their time, and the design's job is to say "this has been researched, the kit is ready, you can start tomorrow" without yelling. The CTA "Browse the library" appears twice (hero + closing dark section) but never in the middle, because the middle is meant for them to be convinced. Quiet confidence, not a sales pitch.

### Investor / funder ("Is this real?")

They should feel that the methodology is credible. The respondent quotes pulled from `loadResponses()` and surfaced in `ProblemScrolly` are the proof: real names, ages, communities. The "decision-ready" tagline and the six-PDF kit grid (Concept Note, PRD, Technical Design, Wireframes, Roadmap, Pitch Deck) are the institutional cues that signal "this is not a hackathon project." Density of evidence over density of decoration.

### Community contributor ("Can I add my problem?")

They should feel that there is room for them. The "Two paths, one library" section is the answer: the library has problems originated by Christex Foundation **and** problems raised by the community, and both run through the same pipeline. The "Raise a problem" outline-style CTA sits next to the accent-style "Browse" so neither path is privileged visually. Egalitarian, not hierarchical.

---

## Tone of voice

The design system enforces a copy register. Patterns the page uses:

- **Imperative, two words, capitalized**: BUILD WHAT MATTERS. TWO PATHS ONE LIBRARY. EACH ENTRY ARRIVES. Used in display-scale SVG headlines (see `EqualWidthHeadline` and the per-section headline functions in `src/app/page.tsx`).
- **Italic serif closing line**: "decision-ready.", "an optional proof of concept.", "Different doors. Same standard." Always lowercase, always with the accent term inline.
- **Plain-language body**: 14–18px serif paragraphs, no jargon, no acronyms expanded inline.
- **Eyebrow labels in caps + extreme tracking**: `text-[11px] uppercase tracking-[0.32em]` (`<Eyebrow>` primitive). Used to mark section purpose without competing with the headline.

---

## What the design is **not**

- Not a dashboard. No data viz on the marketing surface.
- Not a "modern SaaS" landing. No gradients, no rounded glassy cards, no avatar wall of trust.
- Not animated for delight. Motion exists to draw attention to copy, never to entertain.
- Not mobile-tablet-desktop-responsive in the templated sense; it is mobile-first with explicit `md:` breakpoints chosen per-component, not via a grid.

---

*Owner: Designer (when onboarded). Engineer owns the implementation in `src/design/`.*
