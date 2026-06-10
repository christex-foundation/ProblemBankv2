# Problem Bank: Design Document

A complete reference and inspiration brief for the Problem Bank product, built by Christex Foundation. This covers the design philosophy, every foundational token, every primitive and component, every page, and every data visualization including the generative and scroll driven pieces.

Use this two ways:
1. As a faithful system spec if you want to reuse the actual building blocks.
2. As a creative reference if you want the look, feel, voice, and motion language to inform something new.

Nothing here is paraphrased loosely. Values are quoted from the source so you can lift them directly.

---

## Part 1: The Idea Behind the Design

### What the product is
Problem Bank is a research backed library of community named problems in Sierra Leone. Two doors fill the shelves: a public community feed where people raise and vote on problems, and Christex originated field research. Both feed one unified Library of decision ready entries, each packaged with the documents a team needs to start building.

### The design personality
The whole system reads like a printed research journal that happens to live on the web. Think editorial, archival, and quietly confident. It is institutional but never sterile, and it is warm rather than corporate.

Five ideas drive every decision:

1. **Paper, not screen.** The base surface is a warm beige, not white. Cards float on a slightly lighter paper tone. A film grain overlay sits over everything to give an analog, printed texture.
2. **One voice of color.** A single terracotta accent does almost all the emphasis work. Sector colors exist but are reserved and semantic. Restraint is the point.
3. **Type as structure.** Sans serif for interface, serif for narrative and feature copy. All caps eyebrows with wide letter spacing act as the journal's running heads. Numbers are tabular and treated as a design element.
4. **Motion that whispers.** Animation is short in distance, slow in timing, and low in opacity change. It settles content into place rather than performing. Everything respects reduced motion preferences.
5. **Data as craft.** Charts are not off the shelf. They are bespoke SVG and canvas pieces with hand built geometry, scroll choreography, and the same editorial restraint as the rest of the system.

### The voice
Copy is plain, declarative, and human. Headlines are short statements ("Water runs through everything.", "Put it on the feed.", "The burden is not spread evenly."). It invites rather than instructs ("Pull a chair up.", "Be the first."). It hedges honestly with data ("most", "nearly all") and never overclaims.

---

## Part 2: Foundations (Design Tokens)

Two sources of truth are kept in sync: `src/design/tokens.ts` (build time constants) and `src/app/globals.css` (runtime CSS variables). Tailwind v4 is configured CSS first inside an `@theme inline` block in globals.css, not a separate config file.

### Color

**Surfaces and ink**
| Token | Value | Role |
|---|---|---|
| `--background` | `#F8F0E7` | Warm pale beige, the page base |
| `--paper` | `#faf8f3` | Floating panels, cards, dropdowns, tabs |
| `--shelf` | `#F1E7DB` | Library shelf cards |
| `--foreground` | `#0e0e0d` | Default ink, near black |
| `--muted` | `#6e6a62` | Secondary ink (used with alpha) |
| `--rule` | `#1a1a1a` | Strong rule lines |
| `--accent` | `#c8442a` | Terracotta, the single accent |
| `--on-dark` | `#f8f0e7` | Warm off white text on dark surfaces |

**Category / sector colors** (semantic, used sparingly)
| Token | Value | Sector |
|---|---|---|
| `--cat-economy` | `#c8442a` | Economy (shares the accent) |
| `--cat-infrastructure` | `#2f5e3e` | Infrastructure (dark green) |
| `--cat-social` | `#3b5b9a` | Social (blue) |
| `--cat-safety` | `#8a6d3b` | Safety (olive / tan) |

**Dark canvas surfaces** (for the immersive Matrix style data views)
| Token | Value |
|---|---|
| `--surface-dark` | `#0a0a0a` |
| `--surface-dark-raised` | `#1a1a1a` |
| `--surface-dark-sunken` | `#111111` |

**Ink emphasis ramp.** Rather than many grey tokens, the system layers alpha on `--foreground`:
- primary 100%, body 90%, secondary 75%, muted 55%, faint 45%, whisper 30%.

This shows up everywhere as `text-foreground/90`, `text-foreground/55`, `border-foreground/15`, and so on.

**Text selection:** `::selection { background: rgba(200, 68, 42, 0.45); }` (accent at 45%).

### Typography

**Families**
- Sans: `var(--font-inter), system-ui, sans-serif` (Inter, loaded via `next/font/google`, variable, `display: swap`, latin subset).
- Serif: `ui-serif, Georgia, "Times New Roman", serif`.
- Mono: `var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.

Body sets Inter stylistic features: `font-feature-settings: "ss01", "cv11";`.

**Size scale (px), from tokens.ts**
`micro 10`, `eyebrow 11`, `caption 12`, `body 14`, `bodyLg 16`, `lede 20`, `ledeLg 24`, `h3 28`, `h2 40`, `h1 64`, `display 128`.

Headings render fluid with `clamp()`:
- h1: `clamp(3rem, 8vw, 6.5rem)`, `leading-[0.95]`, `font-black`, `tracking-[-0.03em]`
- h2: `clamp(2rem, 4.2vw, 3.5rem)`, `leading-[1.05]`, `font-semibold`, `tracking-[-0.015em]`
- h3: `text-2xl md:text-3xl`, `font-semibold`, `tracking-[-0.005em]`, `leading-[1.2]`

**Letter spacing (tracking)**
`tight -0.025em`, `snug -0.005em`, `normal 0`, `wide 0.02em`, `label 0.18em`, `eyebrow 0.22em`, `eyebrowLoose 0.32em`. The signature move is the `0.22em` all caps eyebrow used on labels, buttons, badges, and meta.

**Line heights**
`none 1`, `tight 1.05`, `snug 1.2`, `body 1.5`, `loose 1.6`.

**Weights**
`regular 400`, `medium 500`, `semibold 600`, `bold 700`, `black 900`. Display headlines use black; section headlines use semibold.

**Numerals.** Numbers are tabular by convention. Utility classes: `.tabular`, `.num` (`tabular-nums` plus `ss01`), `.section-num`. Stats and counters lean on this heavily.

### Spacing and layout

**Section vertical rhythm** is expressed in viewport height so sections breathe relative to the screen:
- `sm`: `pt-[6vh] md:pt-[10vh] lg:pt-[8vh]` / `pb-[10vh] md:pb-[14vh] lg:pb-[11vh]`
- `md`: `pt-[10vh] md:pt-[16vh] lg:pt-[12vh]` / `pb-[14vh] md:pb-[18vh] lg:pb-[14vh]`
- `lg`: `pt-[12vh] md:pt-[18vh] lg:pt-[13vh]` / `pb-[14vh] md:pb-[20vh] lg:pb-[15vh]`

Horizontal section padding: `px-6 md:px-10` (24px to 40px).

**Container widths:** `narrow 760px`, `base 1100px`, `wide 1200px` (default), `full 1440px`.

**Stack gaps** (fixed set, JIT safe): `2, 3, 4, 6, 8, 10, 12, 16, 20, 24`.

### Borders, radius, shadow

- Hairline border (the workhorse): `1px solid color-mix(in srgb, var(--foreground) 15%, transparent)`, used everywhere as `border-foreground/15`. Hover deepens to `/30` or `/40`.
- Strong rule: `1px solid var(--foreground)`.
- Radius scale: `none 0`, `sm 4px`, `md 6px`, `lg 8px`, `xl 12px`, `full 9999px`. The aesthetic is mostly square corners; `full` is reserved for avatars and pills. Most cards and buttons have no radius at all.
- Shadows: `sm` = `0 1px 2px 0 rgb(0 0 0 / 0.05)` for resting cards; `card` = `0 8px 24px rgba(0,0,0,0.08)` for floating menus and popovers.

### Z-index layers
`z-30` nav, `z-40` user menu, `z-[60]` grain overlay, `z-[70]` submit modal, `z-[80]` sign in modal.

### Motion tokens

**Durations:** `fast 180ms`, `base 260ms`, `slow 460ms`, `deliberate 900ms`.
**Easing:** `standard cubic-bezier(.2,.85,.25,1)`, `overshoot cubic-bezier(.2,.85,.25,1.05)`, `inOut cubic-bezier(.65,0,.35,1)`.
**Distance:** `whisper 6px`, `soft 12px`.
**Stagger:** `tight 60ms`, `base 90ms`, `loose 140ms`.
**Reveal viewport:** threshold `0.12`, rootMargin `0px 0px -8% 0px`.

The shared `.transition-soft` utility animates background, color, border, opacity, transform, and letter spacing at `460ms` standard easing. The animated underline `.link-underline` grows a 1px line from `0%` to `100%` width over `260ms`.

**Reduced motion.** Under `prefers-reduced-motion: reduce`, all reveals, transitions, grain, and wave animations are disabled, and selection styling is simplified. This is a first class state, not an afterthought.

### The grain overlay (signature texture)
A fixed, pointer transparent SVG fractal noise layer mounted once per page. Driven by `effect.grain`: `opacity 0.34`, `blendMode multiply`, `tileSize 220px`, `baseFrequency 0.85`, `numOctaves 2`. It flickers via `@keyframes grain-shift` over `1.8s` in `steps(8)`. This single element is most of why the product feels printed rather than rendered.

---

## Part 3: Primitives and Components

All primitives live in `src/design/primitives.tsx` and `src/design/typography.tsx`. They provide surface and style only; interactivity is wired at the call site.

### Layout primitives
- **Section** — full width wrapper. `tone`: background / foreground (dark) / paper. `pad`: sm / md / lg. Swapping `tone="foreground"` flips the whole section to dark with inverted text, which is how closer sections and the landing finale are built.
- **Container** — centered max width (narrow / base / wide / full).
- **Stack** — vertical flex with a fixed gap and alignment.

### Button
Base: `inline-flex items-center justify-center uppercase tracking-[0.22em] font-semibold transition-soft`. Note buttons are always uppercase with wide tracking, and text size stays at `11px` across all sizes.

**Variants**
| Variant | Resting | Hover |
|---|---|---|
| `primary` | `bg-foreground text-background` | `bg-accent text-background` |
| `accent` | `bg-accent text-background` | `bg-foreground text-background` |
| `outline` | `border border-foreground text-foreground` | `bg-foreground text-background` |
| `ghost` | `text-foreground` | `text-accent` |
| `inverse` (on dark) | `bg-background text-foreground` | `bg-accent text-background` |
| `outlineInverse` (on dark) | `border border-background text-background` | `bg-background text-foreground` |

**Sizes:** `sm px-3 py-2`, `md px-8 py-4` (default), `lg px-10 py-5`, all `text-[11px]`.

`ButtonLink` is the same styling on a Next link. `RaiseButton` wraps Button and opens the raise a problem modal. `RaiseLink` is a lighter inline text trigger styled with `link-underline` in accent.

### Form controls
Shared base: `w-full bg-transparent border text-foreground placeholder:text-foreground/30 hover:border-foreground/30 focus:border-foreground focus:border-2 focus:outline-none transition-soft`. The focus treatment is a doubled 2px border on the foreground color, no glow ring. Resting border is `foreground/15`, error is `accent/60`.
- **Input** (sizes sm / md), **Textarea** (adds `resize-y leading-[1.55]`), **Select** (native, styled to match).

### Surfaces
- **Paper** — `bg-paper border border-foreground/15 shadow-sm`. Floating panels.
- **Card** — `block bg-paper border border-foreground/15 p-6 md:p-7 transition-soft`, interactive by default with `hover:border-foreground/40`. The editorial tile behind library entries, feed cards, and notification rows.

### Avatar
Initials circle. Sizes `sm w-8 h-8` / `md w-10 h-10`. Tones: `paper` (hairline) or `accent` (filled). `aria-hidden` by default because the name always sits adjacent.

### Badge
Base: `inline-flex items-center text-[10px] uppercase tracking-[0.22em] font-semibold leading-tight`.
- **tag** — a 2px left rule plus label, no border. The default for sector and status chips.
- **pill** — hairline border, square corners, `px-2.5 py-1`.
- **solid** — filled accent, reserved for critical urgency only.

Tones: default, accent, muted, faint, plus the three sector tones (infrastructure, social, safety) which pull from the category CSS variables.

### Rules
- **RuleLine** — `h-px w-full`, muted (`foreground/15`) or strong (`foreground`).
- **RuleColumn** — vertical `w-px h-full` equivalent.

### Typography components (typography.tsx)
- **Eyebrow** — all caps label. Sizes sm (`10px`) / md (`11px`), both `tracking-[0.22em]`. Tones accent (default) / foreground / muted / faint.
- **Heading** — semantic h1 to h4 mapped to the fluid clamp scale above.
- **Lede** — large serif feature copy, `font-serif text-2xl md:text-3xl leading-[1.5]`, with an italic variant for taglines.
- **Body** — `leading-[1.6]`, sizes sm / md / lg, tones body / muted / faint.
- **Tagline** — italic serif closing line, right aligned by default, with onLight / onDark tones. These are the "Researched.", "decision-ready.", "Different doors. Same standard." flourishes.
- **Stat** — tabular numeral callout: large value (`text-3xl md:text-4xl font-semibold tracking-[-0.025em]`) over a `10px` uppercase `tracking-[0.24em]` label.

### Navigation and chrome
- **SiteNav** — slim 56px bar. Variants `sticky` (`bg-background/80 backdrop-blur-sm border-b border-foreground/10`) and `overlay` (transparent for hero pages). Brand is an `11px` uppercase eyebrow. Tabs (Library, Feed) go muted to foreground, active gets `font-semibold` and `aria-current`. Signed out shows a pill link to sign in; signed in shows UserMenu.
- **Nav** — secondary nav for visualization pages, with light and dark variants and dot separators.
- **UserMenu** — accent avatar button opening a `w-48` menu (`border border-foreground/15 bg-background shadow-card`). Opens on click or hover with a 150ms close delay so the gap stays crossable. Escape and outside click close it. Full menu roles.
- **Footer** — dark band (`bg-foreground text-background`). Copyright in `11px` uppercase tabular, a row of social icons (Discord, WhatsApp, X, TikTok, YouTube, Instagram via react-icons) at `text-background/55` hovering to full, and a Terms link in accent. Order reflows between mobile and desktop.

### Interactive components
- **FilterDropdown** — the library and feed filter control. Trigger is `11px` uppercase with a label in `foreground/45` and value in `foreground` (or accent when filtered), plus an `8px` chevron that rotates 180 degrees on open. Panel is `min-w-[220px] bg-paper border border-foreground/20`, flips to right aligned near the viewport edge, full `role="listbox"` semantics, Escape and outside click to close.
- **FeedVoteButton** — the vote tile (`88px` mobile, `104px` desktop). Signed out is a link to sign in. Signed in unvoted is paper with a hairline; voted flips to `bg-accent text-background`. Holds a chevron icon, a large tabular count (`text-3xl md:text-4xl`), and an uppercase label. Enforces a 5 minute unvote window and a 3 votes per week server limit, with toasts on the edges.
- **EntryMark** — a unique SVG constellation mark per library entry, 3 to 5 dots placed deterministically from a hashed id, colored by sector, opacity varying 0.55 to 1.0. A small generative signature per entry.

### Modals
- **Modal** — behavior primitive: focus trap, Escape to close, body scroll lock, focus restored to trigger, full dialog roles. All visual styling passed in by the caller.
- **SubmitModal** ("Raise a problem") — full screen on mobile, `max-w-[760px]` centered card on desktop, overlay `bg-foreground/45 backdrop-blur-sm`. Headline "Drop your idea." at `clamp(2rem,6vw,3.5rem)` black.
- **SignInModal** — `max-w-md` paper panel with rounded corners (one of the few rounded surfaces), listing four auth methods (Phone OTP, Email/Password, Google, GitHub) as rows with hover arrows that nudge right and turn accent.

### Auth UI
- **AuthHeading / AuthField / AuthHelp** — the form scaffolding: accent eyebrow, h3 title, `10px` uppercase labels in `foreground/55`, hint text in `foreground/35`.
- **MethodTabs** — segmented Email / Phone / OAuth switcher in a single hairline box; active tab is `bg-foreground text-background`.
- **OAuthButtons** — full width hairline buttons inverting on hover.
- Sign up flow adds name, email, password (with min length), and a Cloudflare Turnstile widget.

### Motion primitives (motion.tsx + globals.css)
A small kit of scroll and mount choreography, all data attribute driven so the initial state is server rendered:
- **Reveal** — fade plus 6px (whisper) or 12px (soft) lift on entering the viewport. `transition: opacity 460ms, transform 460ms` standard easing.
- **RevealGroup** — auto staggers child Reveals (default 90ms gap).
- **TextReveal** — opacity plus a letter spacing settle (from `0.04em` to inherit) over 900ms, for headings.
- **ScrollWordReveal** — word by word reveal tied to scroll progress, with `strong` and `accent` per word options. This is the report's signature copy treatment.
- **ScrollWipeReveal** — a clip-path wipe left to right (or right to left) driven by scroll.
- **ScrollSlideReveal** — horizontal translate plus fade driven by scroll.
- **MountSlideReveal** — keyframe slide plus fade on mount for above the fold content.
- **PageTransition** — keyed remount on route change applying `page-enter` (opacity plus 6px lift over 900ms).

---

## Part 4: Pages

The app is Next.js App Router. Shared chrome (SiteNav, Footer, GrainOverlay, PageTransition, auth and modal providers) is mounted in the root layout. Root metadata: "Problem Bank, Universe of Problems".

A recurring page skeleton runs through the whole product: a two column hero (a narrow 2 column eyebrow rail on the left, a 10 column headline block on the right), an optional sticky filter bar at `top-56px`, the main content, and a dark closer section that flips to `tone="foreground"` with a tagline.

### Home `/`
The brand statement and methodology explainer. Sections in order:
1. **SynapserHero** — a full screen interactive physics word field (floating problem keywords) behind a centered headline "BUILD / WHAT MATTERS", subtitle, and dual CTAs ("Browse the library", "Raise a problem").
2. **The work before the work** — research methodology, dual reveal headlines, an explainer visual.
3. **Each entry arrives decision ready** — a 2 by 3 grid of the six kit documents (Concept Note, PRD, Technical Design, Wireframes, Roadmap, Pitch Deck).
4. **Two paths, one library** — the community feed and Christex research framed as parallel inputs, illustrated by the **LegoBuild** assembly visual.
5. **Get informed. Build. Ship.** — dark finale section with inverted scheme and closing CTA.

Voice: research forward, structural, "decision-ready".

### Feed `/feed`
The community leaderboard. Hero with eyebrows ("Christex Foundation", "Community feed", "Vol. 01 . 2026"), a stretched SVG title "COMMUNITY FEED", a lede explaining the rules ("Three votes per person, per week."), three Stat cards, and CTAs. A sticky filter row (Sort, Sector, Urgency, Status). A single column of **RankCard**s: serial number plus FeedVoteButton on the left rail, then urgency tag, sector badge, status badge, title, a 3 line serif preview, and meta (comments, author, location). The whole card is a link. Dark closer "Put it on the feed." with tagline "Different doors. Same standard." No numbered pagination; "What gains traction climbs the shelf."

### Feed detail `/feed/[id]`
A single problem with its discussion. Hero with back link, sector and date, large title, author and location, the full statement as serif lede, badges, and a large vote action. A discussion section ("{X} voices on this.") with a comment composer (sign in gated) and a recursive CommentList nested one level deep, each comment carrying an avatar, marked body, upvote, and reply. A right aligned status tagline section whose copy changes by lifecycle state (for example gaining_traction reads "The shelf is listening. / Climbing toward the Library."). Closer "Add your voice." with three related entries.

### Library `/library`
The catalog. Hero ("LIBRARY", "Index of problems", "Vol. 01 . 2026") with a lede and three Stat cards. Sticky filter row (Sector, Urgency, Source, Per page). A single column shelf of **ShelfCard**s: serial number, title, 2 line serif summary, and meta (sector tag, urgency, builders, origin label). Cards that carry data can render a **CommunityProblemMatrix** bubble chart on the right. Server side pagination shown as "01 . 12 of 24" with Prev/Next. Dark closer "Raise it on the feed."

### Library entry `/library/[slug]`
The full problem dossier. Hero with back link, sector, date, title, and an embedded visualization (an iframe slot, `h-320px` mobile to `h-560px` desktop). Then numbered sections with a large faint section number on the left and content on the right:
- **01 The problem** — "What we found in the field.", HTML rendered serif body.
- **Proof of concept** (when present) — "Skip the blank page.", with Live demo and Starter kit on GitHub buttons.
- **The registry** — "Pull a chair up.", "{N} builders on this entry.", a builder registry where people pin a repo to follow along and earn a README badge.
- **Closer** (dark) — "Investors, partners, builders.", three related entries, tagline.

This page is slated to become bespoke per report rather than one shared template, so treat its structure as a starting point rather than a fixed mold.

### Community Needs Assessment `/library/community-needs-assessment`
The flagship long form research report, and the fullest expression of the design language. 609 respondents across four communities and Fourah Bay College. A centered hero with an accent highlight box behind a key word, then a long sequence of numbered, scroll choreographed scenes. Highlights:
- **Method and sample** — a **SurveyDiagram** blueprint schematic, method paragraphs in ScrollWordReveal with coral markers, and stat cards.
- **01 Problems vs support** — "Water runs through everything." with a wave rippling through the text, a CountUp stat, **WaveLine** drift, and a pinned **ProblemRoseScene** bloom plus a mirrored support rose.
- **The water chain** — unprompted answers, a **WaterChainThread** domino visualization, and bordered quote boxes.
- **02 By community** — "The burden is not spread evenly." with a large interactive **CommunityProblemMatrix** and a 2 by 2 grid of community notes.
- **02B Leader conversations** and **04 Leader proposals** — threaded lettered entries with giant ghost index numbers, mono community names, and marked quotes on a vertical rule with nodes.
- **03 Free text asks** — type size encodes share, with ScrollWipeReveal, plus the report's "two reads of the same data" left then right rhythm.
- **05 Students** — a comparison Matrix with floating quote overlays.
- **06 Trust and barriers** and **07 Reach** — mirrored ProblemRoseScenes with coral callouts.
- **Recommendations** — a numbered thread with one item inverted in accent.
- **Colophon** — methodology label, base details, logo, and meta in mono and serif.

Voice: data driven, careful, community centered, action without prescription ("What the data says to do.").

### Builder profile `/(public)/builders/[id]`
A centered narrow profile: name, bio, contact links, a "Currently building" registry list with GitHub activity, and an owner only editor.

### Auth pages `/(auth)/signin`, `/signup`, `/reset`, `/reset/confirm`
A shared centered `max-w-[440px]` layout reusing the AuthUI scaffolding, OAuth buttons, method tabs, and Turnstile, with the same editorial chrome as the rest of the site.

### Not found `/*`
Centered "404" eyebrow, "Page not found", and home plus feed CTAs.

---

## Part 5: Data Visualization and Creative Spheres

This is the heart of the product's craft. Every chart is custom built. None are off the shelf libraries dropped in. They share an editorial palette, square root area scaling so size encodes magnitude honestly, scroll driven choreography, keyboard focus, and `sr-only` fallbacks for screen readers. The common easing vocabulary is `cubic-bezier(0.22, 1, 0.36, 1)` for editorial settle and `cubic-bezier(0.34, 1.56, 0.64, 1)` for a springy pop.

### Problem Rose (the signature "creative sphere")
`src/components/reports/ProblemRose.tsx`. A Nightingale / polar area bloom. Each problem is a petal at equal angular spacing (`(i/n) * 2π`) with a `0.035` radian gap. Petal radius scales by square root so area encodes value: `r = sqrt(value / maxV) * maxR`. The SVG is 620 by 620, center at (310, 310), max radius 232. Fill is the coral accent with opacity mapped to value (`0.32 + 0.58 * value/maxV`, so 32% to 90%). Labels wrap to at most two balanced lines and flip anchor by horizontal position. Petals bloom petal by petal as the reader scrolls, each owning its own slice of the scroll window with an easeOut scale.

**ProblemRoseScene** (`ProblemRoseScene.tsx`) is the pinned container: a `120vh` track with a sticky stage, the rose on the left or right (mirror mode supported), a lede alongside, and an optional tucked caption. Bloom is derived from scroll progress (`min(1, progress / 0.8)`) so the flower completes before it drifts away. This is the piece most people mean by "the spheres": a coral flower that unfurls as you read.

### Community Problem Matrix (force directed bubbles)
`src/components/reports/CommunityProblemMatrix.tsx`. An SVG bubble pack (viewBox 1200 by 640) laid out with d3-force: centering `forceX/forceY`, `forceManyBody` repulsion proportional to radius, and `forceCollide` with 18px padding over 700 ticks. Radius runs 44 to 118, scaled by count or percentage. Bubbles carry concentric dotted rings for depth, a prevalence arc on the rim, two line uppercase labels, and a large light weight number. It drills down: overview shows one bubble per problem, detail shows one bubble per affected community with a prevalence arc. Bubbles animate from a shared center into their packed positions over 900ms. Hover scales to 1.07, thickens the stroke, raises halo rings, and dims the rest to 0.3. Fully keyboard navigable (Enter or Space drills), with an `aria-label` naming the top three problems and an `sr-only` list. Supports a bare embed mode for Library cards.

### Acute Arc
`src/components/AcuteArc.tsx`. A small SVG arc drawn clockwise from 12 o'clock, length `(pct/100) * 360`, snapping to a full circle at >= 99.9%. Default color is a warm amber `#ffb454` (the "acute" signal), strokeWidth 2.2, round caps. Used as the prevalence rim on Matrix bubbles.

### Water Chain Thread (domino topple)
`src/components/reports/WaterChainThread.tsx`. A causal chain rendered as standing domino tiles along a serpentine cubic bezier thread. Desktop is horizontal (viewBox 1000 by 340), mobile is vertical with tiles alternating sides. A faint background thread sits under a glowing coral thread (`#c8442a`, strokeWidth 5.5, drop shadow) that draws via `strokeDashoffset`. As the reader scrolls, tiles topple in sequence following the thread direction (rotation lerped to a computed fallen angle), gaining a deepening shadow, and labels fade in (cost labels in accent, cause labels in `foreground/40`). An impact pulse rides the draw front using `getPointAtLength`. Tiles even carry domino pips for the analog detail.

### Survey Diagram (blueprint schematic)
`src/components/reports/SurveyDiagram.tsx`. A graph paper schematic of the survey method. A faint 28px grid (foreground at 6%) under a radial fade mask, an orthogonal connector tree (horizontal bus, vertical risers, branch lines that never go diagonal) drawn via dash animation, and metadata cards with spade style corner registration marks. The whole thing assembles on a single scroll timeline: grid fades, headline scales in, the bus draws outward, risers draw, then cards and community nodes pop in cascade. Honors reduced motion by pinning progress to complete, and falls back to a stacked grid on mobile.

### LegoBuild (pipeline assembly)
`src/components/LegoBuild.tsx`. The two doors to one library, shown as literal toy bricks. Two input columns (Community Feed and Christex Foundation) stack labeled bricks with rendered studs (14px circles with inset shadows for 3D), converging through dashed SVG bezier chutes with an arrowhead into a merged center stack (Research, then Vetted and Documented). Bricks rise into place (`translateY(-44px)` to 0) as scroll crosses thresholds, with the chutes appearing once the feed brick lands.

### Library Constellation
`src/components/LibraryConstellation.tsx`. Library entries as stars in an SVG sky (viewBox 1400 by 900), clustered by sector in a ring around center with hashed jitter for natural scatter, sized by builder count (plus a bump for a live proof of concept), colored by an independent sector palette (Health red, Education blue, Agriculture green, Finance brown, Logistics purple, Energy gold, Infrastructure grey, Other tan), and opacity raised for critical urgency. Hover scales 2.1 with two glow rings and a paper tooltip; the rest dim to 0.32. Fades in over 1.1s on mount.

### Map Universe
`src/components/MapUniverse.tsx`. Respondents and problem mentions as dots with faint connecting edges, in both a light theme and a dark Matrix theme (which swaps to brighter category colors and light ink). Supports focus sets, problem focus, text search, and a problem only mode. Hover scales 2.4 with glow rings and a metadata tooltip ("Acute . top priority" for acute mentions). This is the data engine behind the scrollytelling map.

### Synapser Hero (interactive word field)
`src/components/SynapserHero.tsx`. The landing centerpiece. A canvas 2D layer draws spoke lines from the central headline box out to floating serif italic keywords, plus proximity links between nearby words, with ray to box clipping so lines start and end at edges cleanly. The words run a small physics simulation: cursor repulsion (`700 / distance^2` within 110px), velocity damping (`*0.998`), speed clamps with a drift floor and random kick when stalled, AABB collision with the title box and viewport edges, and pointer dragging that imparts release momentum. Words stagger in over a 1500ms window with an easeInOutCubic alpha fade that also drives spoke length. The whole field is a 200vh sticky element that fades out as you scroll past. Because the words are real HTML, the hero stays searchable and accessible.

### Problem Scrolly
`src/components/ProblemScrolly.tsx`. A sticky full screen MapUniverse with respondent quote cards scrolling over it. The active card (nearest viewport center) drives which respondents and which problem light up on the map; inactive cards fade to 0.35. Scroll choreography with no explicit animation, just smooth state transitions on the map dots.

### Supporting chart kit
`src/components/reports/Charts.tsx` holds the smaller building blocks used through the report:
- **BarList** — horizontal bars, label at 42% width, animated fill (`width 900ms` staggered 65ms), accent or foreground fill.
- **GroupedBars** — vertical grouped bars with a series opacity ramp (`foreground/80, /45, /25, /15`) and an optional legend, growing from the baseline with cascading delays.
- **StackedBar** — one bar of proportional segments cycling `foreground, accent, foreground/35`, segments widening in 120ms steps.
- **WaterChainFlow** — a simpler cause to effect grid with accent arrows.
- **CountUp** — requestAnimationFrame number tween over 1100ms with an easeOut cubic.
- **PopIn** — springy scale and fade reveal using the overshoot easing.

### What ties the visualizations together
1. **Honest encoding.** Square root scaling for area, proportional widths, opacity tied to value.
2. **Scroll as narration.** Most pieces reveal on a scroll timeline rather than a one shot animation, so reading and seeing happen together.
3. **One palette.** Coral accent plus foreground ink plus the reserved sector colors, with the dark Matrix theme as the only alternate.
4. **Hand built geometry.** Polar petals, bezier threads, force layouts, ray clipped spokes. No generic chart library.
5. **Accessible by default.** Focusable nodes, keyboard triggers, aria labels, and `sr-only` data lists on every visualization.

---

## Part 6: Quick Start Cheat Sheet

If you want to capture this feel in a new design, start here:

- **Background** warm beige `#F8F0E7`, **ink** near black `#0e0e0d`, **one accent** terracotta `#c8442a`. Resist adding more color.
- **Type:** Inter for UI, a serif for narrative and quotes. Lean on `0.22em` uppercase eyebrows and tabular numerals.
- **Surfaces:** square corners, 1px hairline borders at 15% ink, paper colored cards, almost no shadow.
- **Buttons:** uppercase, wide tracking, solid ink default flipping to accent on hover, an inverse set for dark sections.
- **Motion:** short distances (6 to 12px), slow timing (260 to 900ms), `cubic-bezier(.2,.85,.25,1)`, and always honor reduced motion.
- **Texture:** a multiply blended film grain overlay at ~34% opacity over everything.
- **Layout:** two column hero (narrow eyebrow rail plus wide headline), section padding in `vh`, a dark closer section with an italic serif tagline.
- **Data:** build charts by hand, scale by area, narrate with scroll, color with the single accent, and make every node focusable.

### Source map
- Tokens: `src/design/tokens.ts`, `src/app/globals.css`
- Primitives: `src/design/primitives.tsx`, `src/design/typography.tsx`, `src/design/motion.tsx`
- Components: `src/components/` (and `src/components/reports/` for the report and chart kit)
- Pages: `src/app/`
