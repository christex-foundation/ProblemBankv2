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

### Width convention

The Button primitive does not bake a width. Buttons are content-sized by default; when two sit together as a paired CTA (e.g. the closer on `/library`), apply a shared `min-w-[220px]` at the call site to keep them visually balanced. Verified pattern, not a hard rule.

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

**Status:** Both `Paper` and `Card` shipped in `src/design/primitives.tsx`. `Card` is the consumer-facing interactive surface (Library shelf tiles, feed cards, builder cards, notification rows); `Paper` remains for non-interactive floating surfaces (dropdown panels, polaroid frames).

### API

```ts
<Card as="article" interactive className="..." />
```

| Prop | Default | Use |
|---|---|---|
| `interactive` | `true` | Adds `hover:border-foreground/40` + `focus-visible:border-foreground/40` for clickable cards. Set `false` for static tiles. |
| `as` | `"div"` | Override the rendered element (e.g. `"article"`). |
| `className` | — | Appended after the base classes; pass layout/spacing here. |

Base styling: `block bg-paper border border-foreground/15 p-6 md:p-7 transition-soft`. Cards do NOT carry a tone variant; surface color comes from the wrapping `Section` or an explicit `bg-*` className (e.g. the library shelf cards use `bg-shelf` on their `<li>` wrapper).

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

**Status:** Shipped in `src/design/primitives.tsx`. Used on Library cards, detail-page hero badges, and the library filter row.

### API

```ts
<Badge variant="pill" tone="accent">…</Badge>
```

| Prop | Values | Default |
|---|---|---|
| `variant` | `tag` / `pill` / `solid` | `pill` |
| `tone` | `default` / `accent` / `muted` / `faint` / `infrastructure` / `social` / `safety` | `default` |
| `className` | — | appended last |

### Sector → tone helper

The sector palette has only four token buckets but the schema defines eight sectors. The mapping lives in `src/lib/library.ts` as `sectorBadgeTone()`:

| Sector | Tone |
|---|---|
| Health, Education | `social` |
| Agriculture, Infrastructure | `infrastructure` |
| Finance, Logistics, Energy | `safety` |
| Other | `muted` |

The accent color is reserved for the everyday "this matters" cue (origin: community, critical urgency), so no sector is permanently routed to `accent`.

### Urgency → variant + tone helper

`urgencyBadge()` in `src/lib/library.ts` returns:

| Urgency | Variant | Tone |
|---|---|---|
| critical | `solid` | `accent` |
| high | `pill` | `accent` |
| medium | `pill` | `muted` |
| low | `pill` | `faint` |

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

## 5. DocumentPolaroids

**Status:** Shipped in `src/components/library/DocumentPolaroids.tsx`. Used on the `/library/[slug]` "The kit" section.

> Replaces the original "DocumentTabs" idea. Tabs forced a single-doc-at-a-time read with 5 ghosted slots for the docs an entry didn't have; polaroids show only what exists and treat each PDF as its own object on the page. `DocumentTabs.tsx` still exists in `src/components/library/` as a legacy file; new work uses `DocumentPolaroids`.

### Anatomy

```
                       ┌─────────────────────┐
                       │ ┌─────────────────┐ │
                       │ │  01 / 5    PDF  │ │   ← count strip
                       │ │                 │ │
                       │ │     CONCEPT     │ │   ← label, 2 lines, centered
                       │ │      NOTE       │ │
                       │ │                 │ │
                       │ └─────────────────┘ │
                       └─────────────────────┘   ← polaroid frame: shadow-md
                              (tilted ±1–3°)
```

### Layout

The grid is row-driven, not column-driven, so partial counts read as balanced rows:

| Doc count | Row split |
|---|---|
| 1 | `[1]` |
| 2 | `[2]` |
| 3 | `[3]` |
| 4 | `[2, 2]` |
| 5 | `[3, 2]` (second row centered under the first) |
| 6 | `[3, 3]` |

Mobile (< sm): single column always.

### Per-card visual

- **Frame**: `bg-paper border border-foreground/15 shadow-md p-4 pb-5 w-[240px] md:w-[280px]`. On hover the shadow lifts (`shadow-lg`) and the card straightens + scales to 1.04.
- **Page area**: `aspect-[3/4] bg-background border border-foreground/10 p-4 flex flex-col`. Count strip at top (`01 / N` left, `PDF` right), label centered in the remaining space.
- **Label**: split across (up to) 2 lines via `labelTwoLines()`. Single-word labels (`PRD`, `Roadmap`) stay on one line. Class: `text-center font-black tracking-[-0.02em] leading-[1.05] text-2xl md:text-3xl text-foreground`.
- **Tilt**: deterministic from `doc.id` hash, picked from `[-rotate-3, -rotate-2, -rotate-1, rotate-1, rotate-2, rotate-3]`. Same id → same tilt every render.

### Variants

Single variant.

### States

| State | Treatment |
|---|---|
| Default | Tilted ±1–3°, `shadow-md` |
| Hover | `rotate-0 scale-[1.04] shadow-lg` (300ms transition-all) |
| Focus | Browser `:focus-visible` on the `<a>` |
| Empty | Renders an italic placeholder ("No documents have been added to this entry yet.") |

### A11y

- Each polaroid is an `<a>` with `title="Open {label} ({fileName})"` and `target="_blank" rel="noopener noreferrer"`.
- Tilt is purely decorative; reading order is preserved by sorting items into canonical kit order (`DOC_TYPES` from `src/lib/enums.ts`) before render.

### Source

`src/components/library/DocumentPolaroids.tsx`.

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

| Variant | Use | Source |
|---|---|---|
| `marketing` | Landing page only; full wordmark + sign-in CTA | inline in `src/app/page.tsx` |
| `explore` | Mode-switcher between the data exploration surfaces | `src/components/Nav.tsx` |
| `library` | Slim sticky top nav for `/library` and `/library/[slug]`; matches the marketing pattern, NO auth dependencies (safe to use without `next-auth` installed) | `src/components/LibraryNav.tsx` |
| `app` (proposed, production-only) | `/feed`, `/admin/*` — adds the notifications bell + avatar. Lives in the archived production code at `src/app/_archive/`; uses `ProblemBankNav` which requires `next-auth`. | `src/components/ProblemBankNav.tsx` |

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

## 6b. FilterDropdown

**Status:** Shipped in `src/components/library/FilterDropdown.tsx`. Used on `/library` for the Sector / Urgency / Source filter row. Editorial dropdown; not a generic form select.

### Anatomy

```
SECTOR  ALL ▼               ← button: muted label + current value + caret
       └──────────┐
                  │ ALL            ← active option (accent)
                  │ HEALTH         ← option rows, hairline-separated
                  │ EDUCATION
                  │ AGRICULTURE
                  └────────────────
```

### API

```ts
<FilterDropdown
  label="Sector"
  active={sp.sector ?? ''}
  options={[
    { value: '', label: 'All', href: '/library' },
    { value: 'Health', label: 'Health', href: '/library?sector=Health' },
    …
  ]}
/>
```

The server-side parent **precomputes the hrefs** so the dropdown stays presentational. The component only owns open/close state.

### Behavior

- Click toggles. Outside click + `Escape` close.
- Options are Next `<Link>`s with `scroll={false}` so the page keeps its scroll position after a filter change.
- Label tint flips: muted gray when the active value is the empty/default; accent when a filter is applied.

### A11y

- Button: `aria-haspopup="listbox"`, `aria-expanded={open}`.
- Panel: `role="listbox"` with `aria-label={label}`.
- Options: `role="option"`, `aria-selected={isActive}`.

### Source

`src/components/library/FilterDropdown.tsx`.

---

## 6c. LibraryBuilders

**Status:** Shipped in `src/components/library/LibraryBuilders.tsx`. Used inside the Registry tagline block on `/library/[slug]`. Sample-data stub for the production `BuildRegistry` component (which lives at `src/_archive/.../BuildRegistry.tsx` and requires `next-auth`).

### API

```ts
<LibraryBuilders
  entrySlug={entry.slug}
  builders={entry.builders}
  hideHeader
  hideList
/>
```

| Prop | Use |
|---|---|
| `entrySlug` | Used to construct the sign-in callback URL on the "I'm building this" CTA. |
| `builders` | Sample builder records from `SAMPLE_LIBRARY_ENTRIES`. |
| `hideHeader` | Suppress the internal eyebrow + count headline when the calling section provides its own tagline above (always set on the new Registry section). |
| `hideList` | Hide the public builders list (names + repo URLs + join dates). The badge / repo activity is gated to signed-in users, so the list isn't surfaced publicly. The CTA and the count (from the parent tagline) still render. |

The CTA is the only interactive piece: an `accent` `ButtonLink` whose `href` is `/signin?callbackUrl=/library/{slug}`. The companion caption ("Sign in to register, pin your repo, and grab the README badge.") is one-line via `whitespace-nowrap`.

---

## 6d. EntryMark

**Status:** Built (`src/components/library/EntryMark.tsx`) but **currently unused** in the active UI. Built as a per-entry visual signature — a small constellation of 3–5 dots, positions deterministically hashed from the entry id, fill in the entry's sector color. Originally rendered between the title and summary on the shelf cards; removed at design review because the dots competed with the editorial title hierarchy.

Kept on disk because (a) the deterministic-hash pattern is reusable for any future per-entry mark (e.g. a related-entries module, a Matrix-view dot per problem) and (b) it ties back to the full-page `LibraryConstellation` visual language.

### API

```ts
<EntryMark id={entry.id} sector={entry.sector} size={72} />
```

| Prop | Default | Use |
|---|---|---|
| `id` | — | Seed for dot positions and count. Same id always renders the same mark. |
| `sector` | — | Picks the dot color from `SECTOR_COLOR` (defined inside the file). |
| `size` | `60` | Width + height in CSS px. |
| `className` | — | Appended to the SVG. |

If reused, remove the explicit "currently unused" mark in this doc.

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
| `src/design/tokens.ts` | `color` (incl. `shelf`), `emphasis`, `type`, `space`, `motion`, `border`, `effect` |
| `src/design/typography.tsx` | `Eyebrow`, `Lede`, `Body`, `Tagline` (now `tone: "onLight" \| "onDark"`), `Heading`, `Stat` |
| `src/design/primitives.tsx` | `Section` (accepts `className` for pad overrides), `Container`, `Stack`, `Button`, `ButtonLink`, `Paper`, `Card`, `Badge`, `RuleLine`, `RuleColumn`, `GrainOverlay` |
| `src/design/motion.tsx` | `Reveal`, `RevealGroup`, `TextReveal`, `useScrollProgress`, `ScrollWordReveal`, `ScrollWipeReveal`, `ScrollSlideReveal`, `MountSlideReveal`, `PageTransition` (now `flex-1 flex flex-col` so nested sticky-footer patterns work) |
| `src/components/library/FilterDropdown.tsx` | `FilterDropdown` |
| `src/components/library/DocumentPolaroids.tsx` | `DocumentPolaroids` |
| `src/components/library/LibraryBuilders.tsx` | `LibraryBuilders` (props: `hideHeader`, `hideList`) |
| `src/components/LibraryNav.tsx` | `LibraryNav` |

Shipped status of the seven Day-3 primitives:

| Day-3 primitive | Status |
|---|---|
| Button | Shipped (`primitives.tsx`) |
| Input / Textarea / Select | **Not shipped** — spec only |
| Card + Surface | Both shipped (`Paper`, `Card`) |
| Badge + Tag | Shipped (`Badge` in `primitives.tsx`) |
| DocumentTabs | Superseded by `DocumentPolaroids` (§5) |
| Nav + Footer | `LibraryNav` shipped (`components/LibraryNav.tsx`); Footer shipped (`components/Footer.tsx`); `ProblemBankNav` archived under `_archive/` until auth wiring lands |
| Empty / loading / error | **Not shipped** — spec only |

Library-page-specific components added in Week 2 implementation: `FilterDropdown`, `DocumentPolaroids`, `LibraryBuilders`, `LibraryNav`. See their respective sections above and `app/library/page.tsx` + `app/library/[slug]/page.tsx` for usage.
