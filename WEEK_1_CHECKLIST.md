# Week 1 — Daily checklist

Goal by end of week:
- `.env.local` filled with real values, schema applied to staging Supabase, Twilio WhatsApp approval submitted, you signed in as admin, every non-phone-OTP flow working locally + on a Vercel preview.
- **Problem Bank design system v1 drafted** (tokens + primitive components) ready to apply in Week 2.
- **Admin dashboard redesign drafted** (layout, metrics, sketches) ready to implement in Week 2.

Each day has two tracks:
- **Track A — Config & verification** (existing tasks, mostly ops work).
- **Track B — Design** (drafting work, no shipping required — output is a doc / spec / sketch).

The two tracks are parallel; if you're one person, do Track A in the morning when fresh and Track B in the afternoon when account UIs are loading.

---

## Day 1 (Mon) — Critical path + design audit

### Track A — Config

- [ ] **Submit Twilio WhatsApp Business approval — FIRST** *(30 min)*
  - Twilio Console → Messaging → Senders → WhatsApp senders → Request new number.
  - **Why first:** 1–2 week lead time. Blocks Week 4 if you delay.
  - Done: status shows "Pending Approval".

- [ ] **Supabase staging project** *(60 min)*
  - New project `problem-bank-staging`. Region `eu-west-2 (London)`. Strong DB password (1Password).
  - Settings → API → copy `Project URL` + `service_role` key.
  - Done: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` saved.

- [ ] **Apply schema** *(15 min)*
  - SQL Editor → paste `supabase/migrations/0001_init.sql` → Run.
  - Done: 9 tables visible in Table Editor.

- [ ] **Google OAuth** *(45 min)*
  - Project "Problem Bank" → OAuth consent (External) → app name + support email + logo.
  - Credentials → OAuth client ID → Web app. Redirect: `http://localhost:3000/api/auth/callback/google`.
  - Done: Client ID + Secret saved.

### Track B — Design system audit (≈3 h)

- [ ] **Reference review** *(60 min)*
  - Pull every visual asset you have: christex.foundation site, existing logos in `public/images/`, hackathon's old palette (`#f9f2e9` cream + `#E6B800` yellow if relevant).
  - List visual systems you admire that fit "Sierra Leone-facing, research-backed, credible, mobile-first": e.g. Stripe Docs, Vercel Marketing, Notion, frontier-market analogues like Flutterwave or Andela.
  - Done: a short reference doc (call it `design/REFERENCES.md` — create if needed) with screenshots / links + one-line notes per reference.

- [ ] **Audience + tone** *(45 min)*
  - For each user type, what does the design need to convey?
    - **Entrepreneur / Developer:** trustworthy, build-ready, professional
    - **Investor:** credibility, evidence, gravity
    - **Community contributor (mobile-first SL):** approachable, fast, low-bandwidth
  - Write 3 sentences of design intent (in `design/INTENT.md`).
  - Done: intent doc committed.

- [ ] **Constraint list** *(30 min)*
  - Mobile-first (smallest target: ~360px wide).
  - Body text ≥ 16px (WCAG + bright outdoor light readability).
  - Contrast ≥ 4.5:1 for body, 3:1 for large text.
  - Slow 3G first-paint < 3s — no heavy decorative assets / animations on critical paths.
  - Decoy font is already in `/public/fonts/` if you want to keep it; else strip.
  - Done: `design/CONSTRAINTS.md` written.

---

## Day 2 (Tue) — Tokens + remaining auth providers

### Track A — Config

- [ ] **GitHub OAuth** *(30 min)*
  - org → Developer settings → OAuth Apps → New. Homepage `https://build.christex.foundation`.
  - Callbacks: `https://build.christex.foundation/api/auth/callback/github` + `http://localhost:3000/api/auth/callback/github`.
  - Add `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` to `.env.local`.
  - Done: GitHub sign-in works locally; `User.githubUrl` populated.

- [ ] **Cloudflare Turnstile** *(20 min)*
  - Add site `build.christex.foundation`. Managed widget. Hostnames: `build.christex.foundation`, `localhost`, `*.vercel.app`.
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` → `.env.local`.
  - Done: widget renders on `/feed/submit` when signed in.

- [ ] **Resend** *(30 min)*
  - API Key → add to `.env.local` as `RESEND_API_KEY`. `EMAIL_FROM=noreply@christex.foundation`.
  - Domains → add `christex.foundation` → verify DKIM/SPF via Cloudflare DNS.
  - Done: domain shows "Verified".

### Track B — Design tokens (≈4 h)

- [ ] **Color palette** *(90 min)*
  - Define and justify each role:
    - Primary brand (action, focus, links)
    - Secondary (accents, badges)
    - Neutral scale (12 steps from white → black for backgrounds, borders, text)
    - Semantic: success, warning, error, info
    - Surface (page bg, card bg, elevated bg)
  - Run every pair through a contrast checker (e.g. Stark, WebAIM).
  - Done: `design/TOKENS.md` with hex values + intended usage per token.

- [ ] **Type scale** *(60 min)*
  - Font families: heading + body + mono (decide if Decoy + Geist stay, swap one, etc.).
  - Scale: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60 / 72 px (or your preferred ratio).
  - Line heights, weights, letter spacing.
  - Mobile defaults: body 16px floor.
  - Done: type spec in `design/TOKENS.md`.

- [ ] **Spacing, radius, shadow, motion** *(60 min)*
  - Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px (or your choice).
  - Radius: sm / md / lg / full.
  - Shadow: subtle elevation (1 / 2 / 3 levels).
  - Motion: durations, easing curves.
  - Done: complete `design/TOKENS.md`.

- [ ] **Map tokens to Tailwind** *(30 min)*
  - Sketch how each token lands in `tailwind.config.ts` extensions (or `@theme` block in `globals.css` for Tailwind 4) — don't implement yet, just plan.
  - Done: notes on which Tailwind tokens to extend, in `design/TOKENS.md`.

---

## Day 3 (Wed) — Cloudinary + component primitives

### Track A — Config

- [ ] **Cloudinary** *(30 min)*
  - `Cloud name`, `API Key`, `API Secret`.
  - Upload preset `problem_bank_unsigned`, unsigned, folder `problem-bank`.
  - Four Cloudinary vars → `.env.local`. Restart dev server.
  - Done: upload an image in `/feed/submit` → lands in Cloudinary `problem-bank/submissions/`.

- [ ] **Submission flow smoke** *(45 min)*
  - Submit 3 problems across sectors. One with an inline image. Vote, unvote within 5 min, lock after 5 min (mutate `votedAt` in SQL), 4th vote blocked.
  - Done: all four behaviours observed.

- [ ] **Comments + status flow** *(30 min)*
  - Comment as admin → appears. Change submission status to `under_review` from `/admin/submissions` → comment input gone, existing comment readable, `Notification` row exists.
  - Done: status change closes comments + creates notification.

### Track B — Component primitives spec (≈4 h)

For each primitive: states (default / hover / active / focus / disabled), sizes (sm / md / lg if applicable), variants, accessibility notes, anatomy diagram. **Spec only — no implementation yet.**

- [ ] **Button** *(45 min)*
  - Variants: primary, secondary, ghost, destructive, link.
  - Sizes: sm (32px) / md (40px) / lg (48px — touch target on mobile).
  - Loading state. Icon-only variant.
  - Done: in `design/COMPONENTS.md`.

- [ ] **Input + Textarea + Select** *(45 min)*
  - Label position, placeholder, helper text, error message.
  - Disabled, read-only, focus ring.
  - Character counter pattern (used on title 80/80, bio 160/160, comment 2000).
  - Done: in `design/COMPONENTS.md`.

- [ ] **Card + Surface** *(30 min)*
  - Used for: Library entry grid card, feed card, builder card, notification row, admin entry row.
  - Border vs shadow elevation. Hover state for clickable cards.
  - Done: in `design/COMPONENTS.md`.

- [ ] **Badge + Tag** *(30 min)*
  - Status badges (Submitted, Gaining Traction, Under Review, Research in Progress, Not Viable, Live) — one color/icon per state.
  - Urgency tags (Critical, High, Medium, Low).
  - Sector tags (Health, Education, Agriculture, …).
  - Done: in `design/COMPONENTS.md`.

- [ ] **Document tab / DocumentTabs** *(20 min)*
  - 6 tabs (Concept Note, PRD, Tech Design, User Flows, Roadmap, Pitch Deck) — visual hierarchy when active vs not, disabled (missing) state.
  - Done: in `design/COMPONENTS.md`.

- [ ] **Nav + Footer** *(30 min)*
  - Top nav: logo, primary links, notifications bell, profile dropdown, sign-in CTA.
  - Mobile menu pattern.
  - Footer (already minimal — confirm content).
  - Done: in `design/COMPONENTS.md`.

- [ ] **Empty + loading + error states** *(20 min)*
  - Empty feed, empty library, empty notifications, "DB not configured" warning, 404, 500.
  - Done: in `design/COMPONENTS.md`.

---

## Day 4 (Thu) — Admin dashboard design + content kickoff

### Track A — Config (light day, ≈2 h)

- [ ] **Email + password signup** *(30 min)*
  - `/signup` → Email tab → name, email, password (≥ 8). Auto-signs in.
  - Sign out → `/signin` → Email tab → signs in.
  - Done: works end-to-end.

- [ ] **Password reset via Resend** *(20 min)*
  - `/reset` → enter email → check inbox → click link → set new password → sign in.
  - Done: reset email arrives, new password works.

- [ ] **Account merging** *(15 min)*
  - Sign out. Sign in with Google using the email/password account's email.
  - Done: one row in `User`, signed in.

- [ ] **Content team kickoff** *(60 min)*
  - Walk Christex content team through `/admin/library/new` on staging.
  - Hand them the docx spec for the 6 documents.
  - Confirm first Library entry topic + completion target (aim by end of Week 5).
  - Done: content team has started; target date captured.

### Track B — Admin dashboard design + plan (≈4 h)

The current `/admin/dashboard` shows 3 sections: status counts, recent entries, top badge fetches. It's functional but flat. Redesign it.

- [ ] **Audit current dashboard** *(20 min)*
  - Open `/admin/dashboard` on staging. Note what's missing for the people who'll use it daily (Christex Foundation research + ops team).
  - Done: bullet list of pain points / wishlist in `design/ADMIN_DASHBOARD.md`.

- [ ] **Define what the dashboard answers** *(40 min)*
  - Questions an admin should answer at a glance:
    - How many new submissions came in this week?
    - Which sectors are surfacing the most?
    - Which submissions are gaining traction *right now*?
    - Where are entries stuck in the pipeline?
    - How are published Library entries performing (badge fetches, builder count, GitHub activity)?
    - What needs my action today?
  - Pick the 5–7 questions that matter most. The rest go to follow-on views.
  - Done: question list in `design/ADMIN_DASHBOARD.md`.

- [ ] **Layout sketch** *(90 min)*
  - Wireframe (paper, Figma, or ASCII) the new layout. Suggested zones:
    - **Hero strip:** top metrics (this-week submissions, votes cast, unique voters, comments).
    - **Pipeline column:** funnel from Submitted → Gaining Traction → Under Review → Live, with counts + click-through to filtered submission lists.
    - **Action queue:** "Submissions awaiting review", "Submissions that hit Gaining Traction in last 7 days", "Library entries with builders but no recent GitHub activity".
    - **Engagement:** chart of weekly submission + vote volume (last 8 weeks).
    - **Top sectors:** horizontal bar of submission count by sector.
    - **Recent activity:** stream of last 10 events (new submission / vote spike / status change / new builder).
  - Done: wireframe pasted in `design/ADMIN_DASHBOARD.md`.

- [ ] **Data + RPC plan** *(60 min)*
  - For each panel, write the Supabase query or RPC it needs.
  - Decide which queries should be RPCs (`weekly_volume()`, `pipeline_counts()`, `stuck_entries()`) vs inline `from(...).select(...)`.
  - Decide refresh model: load on page render? Server-side only (`force-dynamic`)? No live polling needed at this scale.
  - Done: query plan written + a list of new SQL functions to add in a follow-on migration.

- [ ] **Chart library decision** *(15 min)*
  - Pick a lightweight chart lib: Recharts, Tremor, or simple SVG bars by hand. Tremor is dashboards-on-rails; Recharts gives more control.
  - Done: choice + one-line reason in `design/ADMIN_DASHBOARD.md`.

- [ ] **Component reuse check** *(15 min)*
  - Which Day 3 component primitives can be reused vs need extension (e.g. metric card, stat card with delta, bar chart wrapper, activity row).
  - Done: list of new components to spec.

---

## Day 5 (Fri) — Apply tokens + Vercel deploy

### Track A — Config

- [ ] **Connect repo to Vercel** *(20 min)*
  - Import `christex-foundation/ProblemBankv2`.
  - Settings → Environment Variables → bulk paste from `.env.local` into the Preview scope.
  - Leave `NEXTAUTH_URL` + `NEXT_PUBLIC_BASE_URL` blank for Preview (auto from `VERCEL_URL`).
  - Don't fill Production yet (Week 5).
  - Done: preview deploy succeeds.

- [ ] **Update OAuth callbacks** *(15 min)*
  - Add Vercel preview URL to Google + GitHub authorised callbacks.
  - Confirm Turnstile allows `*.vercel.app`.
  - Done: both providers updated.

- [ ] **Smoke test deployed** *(60 min)*
  - Incognito → preview URL.
  - Sign in (Google, GitHub, email/password).
  - Submit a problem. Vote. Comment. Register on the Library entry.
  - `/admin/dashboard` (as admin). `/api/health` → 200.
  - Done: every flow works on preview.

### Track B — Apply tokens to globals (≈3 h, optional / can slip to Week 2)

This is implementation work that depends on Day 2 tokens. If Day 2 design slipped, push this whole block.

- [ ] **Update Tailwind 4 theme** *(60 min)*
  - In `src/app/globals.css`, replace the placeholder theme block with your token set (`@theme { --color-…, --font-…, --spacing-…, --radius-… }`).
  - Done: tokens accessible as Tailwind utilities.

- [ ] **Apply to layout chrome** *(45 min)*
  - `Footer`, `ProblemBankNav`, root `layout.tsx` — use new tokens (colors, type, spacing).
  - Done: chrome reflects new design system.

- [ ] **Apply to homepage + feed card** *(45 min)*
  - Library grid card, FeedCard component — token-driven colors + spacing + type.
  - Done: visible polish on `/` and `/feed`.

- [ ] **Document the system** *(20 min)*
  - In `design/README.md` link to TOKENS, COMPONENTS, INTENT, CONSTRAINTS, ADMIN_DASHBOARD docs.
  - Done: design folder is navigable.

---

## End-of-week gate

**Config:**
- [ ] `.env.local` filled (Twilio fields OK to be empty if WhatsApp still pending — SMS-only path keeps you moving)
- [ ] Schema applied to staging Supabase
- [ ] Vercel preview deployed, all non-phone-OTP flows verified there
- [ ] Email + Google + GitHub sign-in all working
- [ ] Christex content team started on first Library entry

**Design:**
- [ ] `design/INTENT.md`, `design/CONSTRAINTS.md`, `design/TOKENS.md`, `design/COMPONENTS.md`, `design/ADMIN_DASHBOARD.md` all committed
- [ ] Admin dashboard wireframe + data plan ready for Week 2 implementation
- [ ] (Stretch) Tokens applied to layout + homepage + feed

**Twilio:**
- [ ] WhatsApp approval status checked — chase Twilio if no movement after 4 business days

If Track A is complete but Track B is half-done, the design work spills into Week 2 (push the implementation phase out a few days). If Track B is complete but Track A is half-done, you can't deploy — fix Track A first.

---

## Quick reference

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Restart dev server after editing .env.local
npm run dev

# Health check
curl http://localhost:3000/api/health | jq

# Promote a user to admin (Supabase SQL Editor)
UPDATE "User" SET role = 'admin' WHERE email = 'you@christex.foundation';
```

---

*When Week 1 is complete, Week 2 = implement the design tokens + admin dashboard redesign. Then jump to the deeper QA + content production weeks. See `LAUNCH_RUNBOOK.md` for T-7 → launch.*
