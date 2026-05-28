# Library Pages

Page-level recipes for `/library` (index) and `/library/[slug]` (entry detail). Companion to `COMPONENTS.md` (primitives) and `TOKENS.md` (visual language). This file captures the layouts, the data seam, and the spacing rhythm — the things you'd need to recreate or extend without re-deriving from the code.

Status: **shipped in Week 2**. Treat as the baseline. Iterate additively rather than restructuring.

---

## 1. Routing + file map

```
src/app/library/
├── page.tsx              ← /library (list)
└── [slug]/page.tsx       ← /library/[slug] (detail)

src/components/library/
├── FilterDropdown.tsx    ← used on /library
├── DocumentPolaroids.tsx ← used on /library/[slug]
├── LibraryBuilders.tsx   ← used on /library/[slug]
├── DocumentTabs.tsx      ← legacy, no longer rendered
├── BuildRegistry.tsx     ← legacy (next-auth client), no longer rendered
├── BuilderRepoActivity.tsx ← legacy
└── EntryMark.tsx         ← available, currently unused (see COMPONENTS.md §6d)

src/components/
├── LibraryNav.tsx        ← top nav for both pages
└── Footer.tsx            ← global footer (shared with landing)

src/lib/library.ts        ← data seam + bucket-color helpers
src/data/sampleLibraryEntries.ts ← sample entries fed through the seam
```

Both pages live OUTSIDE the `src/app/(public)/` route group. That group was moved into `src/app/_archive/` because its layout depends on `next-auth` (not installed in this prototype repo). Anything inside `_*` is ignored by Next's router.

---

## 2. Data seam

The pages talk to **one function** — `getLibraryEntries({ sector?, urgency? })` from `src/lib/library.ts`. Today it returns sample entries from `src/data/sampleLibraryEntries.ts`; in production it'll return Supabase rows. Same shape, same call site — swap the implementation, page code doesn't change.

```ts
// src/lib/library.ts
export async function getLibraryEntries(query: LibraryQuery = {}): Promise<LibraryEntry[]>;
export async function getLibraryEntry(slug: string): Promise<LibraryEntry | null>;
```

Two derivation helpers also live in this file and are imported by the pages:

```ts
sectorBadgeTone(sector: string): BadgeTone;       // 8 sectors → 4 tones
urgencyBadge(urgency: UrgencyKey): {variant, tone};
problemStatementPreview(html: string, max = 160): string; // strips tags + truncates
```

When wiring Supabase, only the bodies of `getLibraryEntries` / `getLibraryEntry` change. The helpers and the page imports stay.

---

## 3. `/library` — the list page

### Structure (top → bottom)

```
LibraryNav                                            ← sticky, slim
└── main (min-h-screen flex flex-col)
    ├── flex-1 wrapper                                ← keeps Footer at bottom
    │   ├── Hero Section (pad="sm")
    │   │   ├── 12-col grid
    │   │   │   ├── col-span-2: eyebrows
    │   │   │   │   • "CHRISTEX FOUNDATION" (accent)
    │   │   │   │   • "INDEX OF PROBLEMS" (muted)
    │   │   │   │   • "Vol. 01 · 2026" (faint, num)
    │   │   │   └── col-span-10:
    │   │   │       • <LibraryHeadline />   (display SVG, viewBox tight)
    │   │   │       • <Lede>                (serif, max-w-[60ch])
    │   │   │       • Stat strip: 3 cells   (border-t, last cell accent)
    │   │   ├── Filter row (mt-12 md:mt-16)
    │   │   │   ├── col-span-2: "FILTER THE SHELF" eyebrow
    │   │   │   └── col-span-10: 3-col grid of FilterDropdown
    │   │   │     (Sector / Urgency / Source, justify-items-center)
    │   │   └── <RuleLine tone="strong" /> (mt-8 md:mt-10)
    │   │   └── Cards grid (mt-8 md:mt-10)
    │   │       <ul grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
    │   │           border-t border-l border-foreground/15>
    │   │         {entries.map} <li bg-background border-r border-b>
    │   │                        <ShelfCard ... />
    │   │
    │   └── Closer Section (pad="md" tone="foreground")
    │       ├── 12-col grid, items-end
    │       │   ├── col-span-7: eyebrow + headline + body
    │       │   └── col-span-5: ButtonLink (Visit feed) + Raise CTA
    │       │       both min-w-[220px] to read as a pair
    │       └── Tagline (tone="onDark", align="right")
    │
    └── <Footer />
```

### Hero details

- **LibraryHeadline** SVG: `viewBox="0 35 1000 195"` (cropped tight so the visible cap-height of "LIBRARY" aligns to the SVG's top edge, not 30px below it). `textLength={1000}` stretches the word to the column width.
- **Stat strip**: 3-cell grid with no gap, divided by `border-l` on each cell except the first. Values are `String(n).padStart(2, '0')` for tabular alignment. Last cell (`Builders engaged`) uses `accent`.

### Filter behavior

`FilterDropdown` is a tiny client component. Each option is a Next `<Link>` with `scroll={false}` so filter changes don't yank the page back to the top. Selected value highlights in `text-accent`; the unfiltered state shows the option labelled `All` / `Any`.

### Card grid

- Card surface = `bg-background` (matches the page, not lighter), per design review. The hairline grid (border-r + border-b on each `<li>`, border-l + border-t on the wrapper `<ul>`) provides the only structure.
- Bottom-row partial cells stay invisible because borders live on the cards, not on the wrapper background.

### Spacing rhythm

- Hero is `pad="sm"` (default top + bottom 6vh / 10vh).
- The dark closer uses `pad="md"`.
- Between filter, rule, and cards: `mt-8 md:mt-10` each — gives the eye consistent 32–40px beats inside the hero.

### Animation

Hero reveals on mount with a stagger (eyebrows base, headline +90, lede +180, stat strip +270). Each card reveals via `IntersectionObserver` with `idx * 60ms` delay (capped at 360ms). Pattern matches `globals.css` whisper motion (6px lift, 460ms, ease-standard).

---

## 4. `/library/[slug]` — the entry detail

### Structure (top → bottom)

```
LibraryNav
└── main (min-h-screen flex flex-col)
    ├── article (flex-1)
    │   ├── Hero Section (pad="sm" + !pt-[2vh] md:!pt-[3vh])
    │   │   ├── "← Back to the Library" link (top-left strip, mb-8 md:mb-12)
    │   │   ├── 12-col grid
    │   │   │   ├── col-span-2: eyebrows + filed date
    │   │   │   └── col-span-10:
    │   │   │       • <h1> display title       (clamp(2.5rem, 7vw, 5.5rem))
    │   │   │       • Visualization slot       (iframe or dashed-border placeholder)
    │   │   │       • <Lede> preview            (serif, max-w-[60ch])
    │   │   │       • Badges row                (sector tag + urgency pill + origin pill)
    │   │
    │   ├── NumberedSection "01 — The problem"
    │   │   (sectionClassName overrides pt + pb to ~3-5vh / 10-14vh)
    │   │
    │   ├── NumberedSection "02 — The kit"
    │   │   (sectionClassName overrides pt + pb to ~3-5vh)
    │   │   └── <DocumentPolaroids documents={entry.documents} />
    │   │
    │   ├── PoC tagline block (Section pad="sm" !pt-0)
    │   │   (only rendered when kitUrl or demoUrl is set; right-aligned)
    │   │
    │   ├── Registry tagline block (Section pad="sm")
    │   │   (always rendered; left-aligned mirror of PoC)
    │   │   └── <LibraryBuilders hideHeader hideList />
    │   │
    │   └── Closer Section (pad="md" tone="foreground")
    │       ├── 12-col grid, items-end
    │       │   ├── col-span-7: eyebrow + headline + body
    │       │   └── col-span-5: RelatedNav (tone="onDark")
    │       └── Tagline (tone="onDark", align="right")
    │
    └── <Footer />
```

### Two recurring section recipes

Both pages alternate between two recipes for content sections:

#### A. Numbered editorial section (`NumberedSection`)

Used for the spine of the detail page (sections 01 and 02). Defined locally in `src/app/library/[slug]/page.tsx`. Anatomy:

```
┌──── 12-col grid ────────────────────────────────────────────────────────┐
│ col-span-2          │ col-span-10                                       │
│ 02                  │ EYEBROW                                           │
│ (display numeral,   │ Headline (h2 size, max-w-[22ch])                  │
│  text-foreground/15)│ Subhead (optional, body lg, muted, max-w-[55ch])  │
│                     │ ─── strong rule (mt-10) ───────────────────────── │
└─────────────────────┴───────────────────────────────────────────────────┘
                       ↓ children render in col-span-10 below the rule
```

API:

```ts
<NumberedSection
  number="02"
  eyebrow="The kit"
  headline={…}
  subhead="optional…"
  tone="background" | "foreground" | "paper"
  numberTone="default" | "accent"
  sectionClassName="!pt-[3vh] md:!pt-[5vh] !pb-[3vh] md:!pb-[5vh]"
>
  {children}
</NumberedSection>
```

`sectionClassName` is the escape hatch for tight rhythm between consecutive sections.

#### B. Tagline section (PoC + Registry)

For sections that are CTAs rather than content (the PoC tagline before the buttons, the Registry tagline before the builders list). Anatomy:

```
EYEBROW (accent, sm, aligned left or right)
Italic serif: setup line.                          ← font-serif italic 2xl/3xl text-foreground/55
Bold display: emphasis line.                       ← font-black accent 3xl/4xl max-w-[20ch]
Muted body: details, optional two lines.           ← text-base/lg text-foreground/55 max-w-[55ch]
[CTA buttons] (aligned to match section align)
```

Used twice on the detail page: PoC right-aligned, Registry left-aligned. The pattern mirrors the closing `"Different doors. Same standard."` beat from the landing page. Defined inline in the page; not a primitive yet.

### Spacing pattern

Sections use `sectionClassName` to override the `pad="md"` defaults so consecutive same-tone sections sit at a consistent rhythm. The target gap between sections on this page is ~13vh (mobile) / ~19vh (md+). The recipe is:

```
01 The problem:  sectionClassName="!pt-[3vh] md:!pt-[5vh] !pb-[10vh] md:!pb-[14vh]"
02 The kit:      sectionClassName="!pt-[3vh] md:!pt-[5vh] !pb-[3vh] md:!pb-[5vh]"
PoC tagline:     className="!pt-0 md:!pt-0"       (sits flush under the polaroids)
Registry tagline: pad="sm" defaults                (no override)
```

When adding a new section to the spine, copy the `01` recipe.

### Animation

Hero stagger: back link → left rail (60) → title (120) → visualization (240) → lede (330) → badges (420). Polaroids stagger by `globalIdx * 80ms`. PoC + Registry tagline lines stagger by 90ms steps. Closer reveals base → body (120) → related nav (240) → tagline (360). All via `Reveal` from `src/design/motion.tsx`.

---

## 5. Visualization slot convention

Per the architecture note: each Library entry carries a unique data visualization, created in the admin dashboard (external) and embedded into the entry via `infographicUrl`. The detail page renders it directly under the title:

- If `entry.infographicUrl` is set → render a sandboxed iframe (`allow-scripts allow-same-origin`), `h-[480px] md:h-[560px]`, `bg-paper` frame with `border-foreground/15`.
- If null → render a dashed-border placeholder card on `bg-paper/50` with an "EMBED SLOT" eyebrow and "Slot reserved." italic body. Same dimensions so the page rhythm doesn't shift between entries with and without a viz.

Supabase will only ever supply the URL (and the rest of the entry metadata). The visualization HTML lives outside the app.

---

## 6. Archive convention

The folder `src/app/_archive/` holds the production app's full route tree — `(public)/`, `(auth)/`, `admin/`, `api/`, plus their supporting components. Next's router ignores any folder prefixed with `_`, so these routes 404 in this repo but compile-skip the missing-package errors (`next-auth`, `@supabase/supabase-js`, `sonner`, `zod`, …).

When the production app picks up this repo's design work, the archive is the destination wiring: bring those files back out, install the missing deps, and the data seam in `src/lib/library.ts` swaps from sample data to Supabase.

Two leftover files NOT in the archive but **also currently dead** in the rendered UI:

- `src/components/library/BuildRegistry.tsx` — production-style registry with `next-auth` + `sonner` imports. Won't compile until those land. Kept in `src/components/library/` because the active `LibraryBuilders.tsx` lives next to it; they're a paired before/after.
- `src/components/library/DocumentTabs.tsx` — interim component, superseded by `DocumentPolaroids`. Kept for reference until the polaroids treatment is fully validated.
- `src/components/library/BuilderRepoActivity.tsx` — only meaningful when wired to GitHub; left as-is.

---

## 7. What's NOT in scope on these pages

- **No auth.** Sign-in, register, badge mint, build-registry write — all live in `_archive/` and require `next-auth`. The "I'm building this" CTA on the registry only links to `/signin?callbackUrl=...` (which 404s in this repo).
- **No analytics / telemetry.** Mounts and reveals are local; nothing fires home.
- **No SSR data fetching beyond the sample seam.** `getLibraryEntries` is `async` so the swap to Supabase is one file; pages already await it correctly.

---

*Source of truth: `src/app/library/page.tsx`, `src/app/library/[slug]/page.tsx`, and the components / lib files listed in §1. This doc lags those files; when the page implementation moves, update here.*
