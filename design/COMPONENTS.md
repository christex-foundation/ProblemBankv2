# Components

Primitive specs. The Designer Day 3 brief asks for seven primitives:

1. Button
2. Input / Textarea / Select
3. Card + Surface
4. Badge + Tag
5. DocumentTabs
6. Nav + Footer
7. Empty / loading / error states

Each section below carries:

- **Status** (shipped in `src/design/` / shipped ad-hoc / not yet built)
- **Anatomy** (ASCII diagram)
- **Variants, sizes, states**
- **A11y notes**
- **Source files** when applicable

---

## 1. Button

**Status:** Shipped in `src/design/primitives.tsx` (`Button`, `ButtonLink`).

### Anatomy

```
┌────────────────────────────────────┐
│  ⎯ ⎯ ⎯ ⎯  LABEL TEXT  ⎯ ⎯ ⎯ ⎯     │   ← uppercase, 11px, tracking 0.28em
└────────────────────────────────────┘   ← px-8 py-4, square corners
       ▲                       ▲
       └── 32px horizontal pad │
                               └── 16px vertical pad
```

### Variants

| Variant | Default | Hover |
|---|---|---|
| `primary` | `bg-foreground text-background` | `bg-accent text-background` |
| `accent` | `bg-accent text-background` | `bg-foreground text-background` |
| `outline` | `border border-foreground text-foreground` | `bg-foreground text-background` |
| `ghost` | `text-foreground` | `text-accent` |

### Sizes

Single size shipped: `px-8 py-4, text-[11px] uppercase tracking-[0.28em] font-semibold`. **Open: sm / lg variants not yet specced** — Week 2 should add them when the feed surfaces need a `sm` button (vote, comment submit).

### States

| State | Treatment |
|---|---|
| Default | Variant baseline |
| Hover | Variant hover row above |
| Focus | Browser default ring (no override) |
| Active | (not yet specced) |
| Disabled | (not yet specced) |
| Loading | (not yet specced; Week 2 needs this for `SubmissionForm`) |
| Icon-only | (not yet specced) |

### A11y

- Anchor variant (`ButtonLink`) renders a `Link`; semantic.
- Color contrast: `bg-foreground text-background` is ~12:1, accent-on-foreground is ~5:1, both pass AA.
- No `outline: none` overrides in the system as of this writing.

### Source

`src/design/primitives.tsx:117–165`. Used on landing page hero (`page.tsx:131,134`) and "Get informed!" closer (`page.tsx:170–183` — inline, not via primitive; should refactor to `<ButtonLink>` in Week 2).

---

## 2. Input / Textarea / Select

**Status:** **Not yet built** as a primitive. Existing form fields (`SubmissionForm`, `BuilderProfileEditor`, sign-in tabs) use ad-hoc Tailwind classes. Specced here for Week 2.

### Anatomy

```
LABEL TEXT                              ← 11px, uppercase, tracking-0.22em, mb-2
┌────────────────────────────────────┐
│  Placeholder or input value         │  ← px-4 py-3, text-base (16px floor)
└────────────────────────────────────┘  ← border-foreground/15, hover border-foreground/30
Helper text or error message            ← 12px, muted or accent on error
                              42 / 80   ← optional counter, right-aligned, tabular-num
```

### Variants

- `text` (default Input)
- `email`, `password`, `url`, `tel` (same visual, native type)
- `textarea` (multi-line, `min-h-[120px]`, resize-y)
- `select` (native `<select>` styled to match; no custom dropdown in v1)

### Sizes

- `md` (default): `py-3 text-base`
- `sm`: `py-2 text-sm` (for compact admin surfaces only)

### States

| State | Treatment |
|---|---|
| Default | `border-foreground/15` |
| Hover | `border-foreground/30` |
| Focus | `border-foreground border-2` (uses border-width change, not ring, to match the editorial feel) |
| Disabled | `bg-foreground/5 text-foreground/45 cursor-not-allowed` |
| Error | `border-accent` + helper text in `text-accent` |
| With counter | Counter renders below-right; turns `text-accent` when within 5 chars of max |

### A11y

- Always render `<label>` with `htmlFor`. Eyebrow-style labels still need a real label element, not just visual text.
- Error messages: `aria-describedby` linking input to the helper-text element; `aria-invalid="true"` when in error.
- Counter is decorative; the authoritative max is `maxLength` on the input.

### Open questions

- Custom select vs native: native wins on mobile; we accept the styling inconsistency.
- Password show/hide affordance — needed for `/signup`?

---

## 3. Card + Surface

**Status:** `Paper` surface shipped in `primitives.tsx`. A consumer-facing `Card` (for `FeedCard`, `BuilderCard`, notification rows) is **not yet built**; existing instances are ad-hoc.

### Anatomy (Paper)

```
┌────────────────────────────────────┐
│                                    │
│        (content slot)              │   ← bg-paper, border hairline 15%
│                                    │   ← shadow-sm (very subtle)
└────────────────────────────────────┘
```

### Anatomy (Card — proposed)

```
┌────────────────────────────────────┐
│ EYEBROW · CATEGORY      02 days    │   ← top row: eyebrow + meta
│                                    │
│ Card Title — up to two lines       │   ← H3 weight
│                                    │
│ Optional body copy, two lines      │   ← body sm, muted
│ truncated to keep grid even.       │
│                                    │
│ ──────────────────────────────     │   ← RuleLine
│ 12 votes · 3 comments  →           │   ← footer meta + chevron
└────────────────────────────────────┘
```

### Variants

| Surface | Use |
|---|---|
| `Paper` | Floating tile (kit grid cells if we tile them, search bar background) |
| `Card` (proposed) | `FeedCard`, `BuilderCard`, library grid item, notification row |

### Sizes

Cards are layout-driven (fill their grid cell). No size variants.

### States

| State | Treatment |
|---|---|
| Default | Hairline border |
| Hover (interactive cards only) | `border-foreground/30` + `transition-soft` |
| Focus | Same as hover, via `:focus-visible` |
| Active / pressed | (not yet specced) |
| Loading skeleton | Reuses the shape; pulses via the empty-state pattern (§7) |

### A11y

- Interactive cards: wrap entire card in `<Link>` or `<button>`. The chevron is decorative, do not give it a separate tabstop.
- Don't rely on hover-only affordance.

### Source (existing)

`src/design/primitives.tsx:172–192` (`Paper`).

---

## 4. Badge + Tag

**Status:** **Not yet built.** Submission statuses, urgency, sector all need consistent treatment. Specced here.

### Anatomy

```
 ▌ STATUS LABEL          ← 10px uppercase tracking-0.22em, leading-tight
 ▲
 └── 2px left rule in category color (variant `tag`)
```

Or, for `pill` variant:

```
┌───────────────────┐
│  STATUS LABEL     │   ← px-2.5 py-1, square corners, hairline border
└───────────────────┘
```

### Variants

| Variant | Visual | Use |
|---|---|---|
| `tag` | Left rule (2px) + text, no border | Inline metadata under a card title |
| `pill` | Hairline border, square corners (consistent with system), padded | Status chips on a `FeedCard`, urgency on a Library entry |
| `solid` | Filled background, foreground text | Critical urgency only; uses `bg-accent text-background` |

### Color mapping

| Domain | Token | Variant |
|---|---|---|
| `submitted` | `foreground/55` | pill (muted) |
| `gaining_traction` | `accent` | pill |
| `under_review` | `cat-social` | pill |
| `live` | `cat-infrastructure` | pill |
| `not_viable` | `foreground/30` | pill (faint) |
| Urgency: critical | `accent` | solid |
| Urgency: high | `accent` | pill |
| Urgency: medium | `foreground/55` | pill |
| Urgency: low | `foreground/30` | pill |
| Sector: Health | (TBD; pick from category) | tag |
| Sector: Agriculture | `cat-infrastructure` | tag |
| Sector: Education | `cat-social` | tag |
| Sector: Economy | `cat-economy` | tag |

### A11y

- Color is never the only signal; the label text carries meaning.
- "Gaining Traction" is computed, not stored; rendering layer must trust the RPC, not the row.

---

## 5. DocumentTabs

**Status:** **Not yet built.** Required for `/library/[slug]` (six PDF tabs: Concept Note / PRD / Technical Design / Wireframes / Roadmap / Pitch Deck).

### Anatomy

```
┌─── ACTIVE ─────┬─ Inactive ─┬─ Inactive ─┬─ Inactive ─┬─ Inactive ─┬─ Inactive ─┐
│ Concept Note   │   PRD      │ Tech…      │ Wire…      │ Road…      │ Pitch…     │
└────────────────┴────────────┴────────────┴────────────┴────────────┴────────────┘
                                                                                    
   2px accent underline only under active tab; others underlined hairline on hover.

┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                │
│                       Active tab's PDF content / embed                         │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Variants

Single variant. Tabs themselves are uppercase eyebrow-style (`text-[11px] tracking-[0.22em] uppercase`).

### Sizes

- Desktop: tab bar fills container, equal-width cells.
- Mobile (< 640px): horizontal scroll with `overflow-x-auto`, snap on each tab.

### States

| State | Treatment |
|---|---|
| Inactive | `text-foreground/55`, no underline |
| Hover | `text-foreground`, hairline underline (uses `link-underline` utility) |
| Active | `text-foreground`, 2px accent underline |
| Disabled | `text-foreground/30 cursor-not-allowed` — used when a doc type isn't uploaded for this entry |
| Focus | `:focus-visible` ring (browser default) |

### A11y

- Use `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `aria-labelledby` on the panel.
- Arrow-key navigation between tabs (left/right).
- The PDF panel is the focusable content; pressing the active tab again does nothing.

### Open

- PDF viewer: embedded iframe vs link out. Decide before Week 4.

---

## 6. Nav + Footer

**Status:** **Both shipped ad-hoc.** Two navs exist (`src/components/Nav.tsx` for the explore-mode pages, the inline nav inside `src/app/page.tsx:73–109` for the landing). Footer in `src/components/Footer.tsx`. Specced here as a primitive for Week 2 consolidation.

### Nav anatomy (landing/marketing)

```
┌──────────────────────────────────────────────────────────────────────┐
│  PROBLEM BANK         Library · Feed · About    [Sign in]            │
│  ▲                    ▲                          ▲                   │
│  └── wordmark, 11px   └── 10px nav links         └── outline button   │
└──────────────────────────────────────────────────────────────────────┘
   background: backdrop-blur over bg-background/60, hairline bottom border
```

### Nav anatomy (explore: galaxy/map/stack/matrix/world)

```
 GALAXY · MAP · STACK · MATRIX · WORLD
   ▲       ▲
   │       └── inactive: text-foreground/40
   └── active: text-foreground font-semibold
```

10px uppercase tracking 0.22em. Separators are middle dots at `text-foreground/20`.

### Variants

| Variant | Use |
|---|---|
| `marketing` | Landing page only; full wordmark + sign-in CTA |
| `explore` | Mode-switcher between the data exploration surfaces (`src/components/Nav.tsx`) |
| `app` (proposed) | `/feed`, `/library`, `/admin/*` — needs the notifications bell + avatar |

### States

| State | Treatment |
|---|---|
| Default link | Variant baseline |
| Active link | `font-semibold`, current ink color |
| Hover | `text-foreground/75` or `text-foreground` (depending on variant) |

### Footer anatomy

```
┌──────────────────────────────────────────────────────────────────────┐
│  © 2026 PROBLEM BANK     [ⓘ ⓦ X ⓣ ⓨ ⓘ]            TERMS & CONDITIONS │
│  ▲                       ▲                          ▲                │
│  ▲ 11px caps, muted      └── 6 social icons         └── accent link  │
└──────────────────────────────────────────────────────────────────────┘
   background: bg-foreground (dark), text: bg-background/55
```

Social icons (from `react-icons/si`): Discord, WhatsApp, X, TikTok, YouTube, Instagram. Icon hover: `text-background`.

### A11y

- Nav: `<nav aria-label="...">`. Active link gets `aria-current="page"`.
- Footer social links: each anchor has `aria-label="<network name>"`; icons are `aria-hidden`.

### Source

`src/components/Nav.tsx`, `src/components/Footer.tsx`, inline nav at `src/app/page.tsx:73–109`.

---

## 7. Empty / Loading / Error states

**Status:** Not yet built as primitives. Most are inline strings on each page ("No submissions yet.", "Entries coming soon", the yellow "Database not configured" banner). Specced here.

### Anatomy (empty state)

```
                  ────────────────────
                  
                   EYEBROW LABEL
                   
                   Headline of why
                   this is empty
                   
                   One sentence of body
                   copy explaining what
                   to do next.
                   
                   ┌────────────────┐
                   │  PRIMARY CTA   │
                   └────────────────┘
                   
                  ────────────────────
```

Centered, max-width 480px, vertically padded `py-[14vh]`. Rules above + below for editorial framing.

### Variants

| Variant | Use | Treatment |
|---|---|---|
| `empty` | Feed has no submissions, library has no entries, notifications empty | Eyebrow + heading + body + CTA |
| `loading` | Suspense fallback, route transition | Skeleton shapes that match the eventual content (card skeletons for cards, line skeletons for text). No spinner. |
| `error` | Boundary catch, 500 | Same anatomy as empty, but eyebrow says "Something went wrong"; CTA is "Try again" / "Reload" |
| `404` | `not-found.tsx` | Same anatomy, headline "Not found", CTA back to `/` |
| `db-not-configured` | Yellow banner across the top of the page when `SUPABASE_URL` is empty | Sticky banner, full-width, `bg-accent/15 text-foreground`, dismissible (?) |

### Loading details

- Skeleton uses `bg-foreground/10` blocks at the shape's dimensions.
- Pulse animation: opacity oscillates 100% → 60% over 1.4s, ease-in-out. Disabled under `prefers-reduced-motion`.
- No spinner anywhere in the system. The whisper motion principle applies: motion only to reveal already-loaded content.

### A11y

- Empty / error: heading is `<h1>` or `<h2>` depending on context; not just visual.
- Loading: container has `aria-busy="true" aria-live="polite"`. Screen readers announce when the real content lands.
- Don't put critical info in the dismissible banner alone; surface it in the form too.

---

## Anatomy diagrams

All anatomy diagrams in this doc are ASCII so they live in the markdown. When we have a Figma file, replace each `### Anatomy` block with a Figma frame link and keep the ASCII as the fallback.

Open items for the Designer when onboarded:

- Convert all seven anatomies to Figma frames.
- Define the missing states marked above (`disabled` button, `loading` button, active card, etc.).
- Spec the loading-skeleton shapes for each card type.

---

## Cross-reference index

| File | Primitives provided |
|---|---|
| `src/design/tokens.ts` | `color`, `emphasis`, `type`, `space`, `motion`, `border`, `effect` |
| `src/design/typography.tsx` | `Eyebrow`, `Lede`, `Body`, `Tagline`, `Heading`, `Stat` |
| `src/design/primitives.tsx` | `Section`, `Container`, `Stack`, `Button`, `ButtonLink`, `Paper`, `RuleLine`, `RuleColumn`, `GrainOverlay` |
| `src/design/motion.tsx` | `Reveal`, `RevealGroup`, `TextReveal`, `useScrollProgress`, `ScrollWordReveal`, `ScrollWipeReveal`, `ScrollSlideReveal`, `MountSlideReveal`, `PageTransition` |

The seven Day-3 primitives map onto these as follows:

| Day-3 primitive | Status |
|---|---|
| Button | Shipped (`primitives.tsx`) |
| Input / Textarea / Select | **Not shipped** — spec only |
| Card + Surface | Surface shipped (`Paper`); Card **not shipped** |
| Badge + Tag | **Not shipped** — spec only |
| DocumentTabs | **Not shipped** — spec only |
| Nav + Footer | Shipped ad-hoc, **not as primitive** |
| Empty / loading / error | **Not shipped** — spec only |

Week 2 implementation order should be: Input → Card → Badge → DocumentTabs → Nav/Footer consolidation → Empty/Loading/Error.
