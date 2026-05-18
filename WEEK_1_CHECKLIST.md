# Week 1 — Daily checklist

Goal by end of week:
- `.env.local` filled, schema applied to staging Supabase, Twilio approval submitted, you signed in as admin, every non-phone-OTP flow working locally + on Vercel preview.
- **Design system v1 drafted** (tokens + primitive components) ready to apply in Week 2.
- **Admin dashboard redesign drafted** (layout, metrics, sketches, query plan) ready to implement in Week 2.

Each day has two tracks:
- **Track A — Config & verification** (ops, accounts, smoke tests)
- **Track B — Design** (drafting / spec / sketches — outputs are committed `design/*.md` files, not code)

Block durations are real-time estimates; clock anchors are illustrative. Shift to fit your day.

---

## Day 1 (Mon) — Critical path + design audit

**Daily schedule (~6 h focused work):**

| Block | Time | Track | Task |
|---|---|---|---|
| 1 | 09:00–09:30 | A | Submit Twilio WhatsApp approval |
| 2 | 09:30–10:45 | A | Supabase staging project + apply schema |
| 3 | 11:00–11:45 | A | Google OAuth app |
| 4 | 11:45–12:30 | A | Fill `.env.local` + first sign-in smoke |
| — | 12:30–13:30 | — | Lunch |
| 5 | 13:30–13:45 | A | Promote yourself to admin |
| 6 | 13:45–14:45 | B | Reference review → `design/REFERENCES.md` |
| 7 | 14:45–15:30 | B | Audience + tone → `design/INTENT.md` |
| 8 | 15:30–16:00 | B | Constraint list → `design/CONSTRAINTS.md` |
| — | 16:00–16:15 | — | Day 1 gate check |

### Track A — Config

- [ ] **Submit Twilio WhatsApp Business approval — FIRST** *(30 min)*
  - Twilio Console → Messaging → Senders → WhatsApp senders → Request new number.
  - **Why first:** 1–2 week lead time. Blocks Week 4 if you delay.
  - Done: status shows "Pending Approval".

- [ ] **Supabase staging + schema** *(75 min)*
  - New project `problem-bank-staging`. Region `eu-west-2 (London)`. Save DB password.
  - Settings → API → copy `Project URL` (`SUPABASE_URL`) + `service_role` key (`SUPABASE_SERVICE_ROLE_KEY`).
  - SQL Editor → paste `supabase/migrations/0001_init.sql` → Run. Confirm 9 tables in Table Editor.
  - Done: schema applied, env values captured.

- [ ] **Google OAuth** *(45 min)*
  - Project "Problem Bank" → OAuth consent (External) → app name + email + logo.
  - Credentials → OAuth client ID → Web app. Redirect: `http://localhost:3000/api/auth/callback/google`.
  - Copy Client ID + Secret.

- [ ] **Fill `.env.local` + first smoke** *(45 min)*
  - `NEXTAUTH_SECRET = $(openssl rand -base64 32)`, `NEXTAUTH_URL=http://localhost:3000`, Supabase + Google vars.
  - `npm run dev` → `localhost:3000` should load Library grid without yellow banner.
  - `/signin` → Continue with Google → sign in.
  - Done: `User` row visible in Supabase.

- [ ] **Promote to admin** *(15 min)*
  - SQL Editor: `UPDATE "User" SET role='admin' WHERE email='you@christex.foundation';`
  - Sign out + back in. `/admin/dashboard` should render.

### Track B — Design audit

- [ ] **Reference review → `design/REFERENCES.md`** *(60 min)*
  - Pull every existing asset (christex.foundation site, logos in `public/images/`, hackathon's old palette if useful).
  - List visual systems to study: Stripe Docs, Vercel Marketing, Notion, frontier-market analogues.
  - One-line commentary per reference.

- [ ] **Audience + tone → `design/INTENT.md`** *(45 min)*
  - For each user type (entrepreneur / developer, investor, community contributor), one paragraph: what should the design make them feel?
  - Three sentences of overall design intent.

- [ ] **Constraint list → `design/CONSTRAINTS.md`** *(30 min)*
  - Mobile-first (360px target), body text ≥ 16px, contrast ≥ 4.5:1, Slow 3G first-paint < 3s, no heavy decoration on critical paths, font decision on Decoy + Geist.

### Day 1 gate
- [ ] WhatsApp approval submitted
- [ ] Schema applied to staging Supabase
- [ ] Google sign-in working locally
- [ ] You are admin
- [ ] 3 design docs committed

---

## Day 2 (Tue) — Remaining auth + tokens

**Daily schedule (~5.5 h focused work):**

| Block | Time | Track | Task |
|---|---|---|---|
| 1 | 09:00–09:30 | A | GitHub OAuth app |
| 2 | 09:30–09:50 | A | Cloudflare Turnstile |
| 3 | 09:50–10:20 | A | Resend domain + API key |
| 4 | 10:30–12:00 | B | Color palette → `design/TOKENS.md` |
| — | 12:00–13:00 | — | Lunch |
| 5 | 13:00–14:00 | B | Type scale → `design/TOKENS.md` |
| 6 | 14:15–15:15 | B | Spacing + radius + shadow + motion → `design/TOKENS.md` |
| 7 | 15:30–16:00 | B | Map tokens to Tailwind 4 plan |

### Track A — Auth + bot protection + email

- [ ] **GitHub OAuth** *(30 min)*
  - Org → Developer settings → OAuth Apps → New. Homepage `https://build.christex.foundation`.
  - Callbacks: production + `http://localhost:3000/api/auth/callback/github`.
  - Add `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` to `.env.local`.
  - Done: GitHub sign-in works locally; `User.githubUrl` populated.

- [ ] **Cloudflare Turnstile** *(20 min)*
  - Add site `build.christex.foundation` (Managed). Hostnames: production, `localhost`, `*.vercel.app`.
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` → `.env.local`.
  - Done: widget renders on `/feed/submit`.

- [ ] **Resend** *(30 min)*
  - API Key → `.env.local` as `RESEND_API_KEY`. `EMAIL_FROM=noreply@christex.foundation`.
  - Domains → add `christex.foundation` → verify DKIM/SPF via Cloudflare DNS.
  - Done: domain shows "Verified".

### Track B — Design tokens

- [ ] **Color palette** *(90 min)*
  - Primary brand, secondary, neutral scale (12 steps), semantic (success/warning/error/info), surface (page bg / card bg / elevated bg).
  - Run every text/bg pair through a contrast checker.
  - Hex values + intended usage per token.

- [ ] **Type scale** *(60 min)*
  - Font stack decision: heading + body + mono (Decoy + Geist or replacements).
  - Scale 12 → 72 px. Line heights, weights, letter spacing.
  - Mobile defaults: body 16px floor.

- [ ] **Spacing + radius + shadow + motion** *(60 min)*
  - Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
  - Radius: sm / md / lg / full.
  - Shadow: 3 elevation levels.
  - Motion: durations + easings.

- [ ] **Tailwind 4 mapping plan** *(30 min)*
  - Sketch how each token lands in the `@theme` block of `globals.css`.
  - List which Tailwind utilities you'll use vs. need custom classes.

### Day 2 gate
- [ ] Google, GitHub, locally-working sign-ins
- [ ] Turnstile widget renders
- [ ] Resend domain verified
- [ ] `design/TOKENS.md` complete

---

## Day 3 (Wed) — Cloudinary + component primitives

**Daily schedule (~5.5 h focused work):**

| Block | Time | Track | Task |
|---|---|---|---|
| 1 | 09:00–09:30 | A | Cloudinary account + upload preset |
| 2 | 09:30–10:15 | A | Submission flow smoke (vote, unvote, lock) |
| 3 | 10:30–11:00 | A | Comments + status flow smoke |
| 4 | 11:00–11:45 | B | Button spec → `design/COMPONENTS.md` |
| — | 11:45–12:45 | — | Lunch |
| 5 | 12:45–13:30 | B | Input / Textarea / Select spec |
| 6 | 13:30–14:00 | B | Card + Surface spec |
| 7 | 14:15–14:45 | B | Badge + Tag spec |
| 8 | 14:45–15:05 | B | DocumentTabs spec |
| 9 | 15:05–15:35 | B | Nav + Footer spec |
| 10 | 15:35–15:55 | B | Empty + loading + error states |

### Track A — Cloudinary + flow smoke

- [ ] **Cloudinary** *(30 min)*
  - `Cloud name` + `API Key` + `API Secret`. Unsigned preset `problem_bank_unsigned`, folder `problem-bank`.
  - Add 4 Cloudinary vars to `.env.local`. Restart dev server.
  - Done: image uploaded from `/feed/submit` lands in `problem-bank/submissions/`.

- [ ] **Submission flow** *(45 min)*
  - Submit 3 problems across sectors. One with inline image.
  - Vote, unvote within 5 min, lock after 5 min (mutate `votedAt` in SQL), 4th vote blocked.

- [ ] **Comments + status flow** *(30 min)*
  - Comment as admin → appears.
  - `/admin/submissions` → change status to `under_review` → reload public detail → comment input gone, existing comment readable, `Notification` row created.

### Track B — Component primitives spec

Each component: variants, sizes, states (default/hover/active/focus/disabled), a11y notes, anatomy. **No code yet** — just the spec in `design/COMPONENTS.md`.

- [ ] **Button** *(45 min)* — primary, secondary, ghost, destructive, link; sm/md/lg; loading; icon-only.
- [ ] **Input / Textarea / Select** *(45 min)* — label + placeholder + helper + error; counter pattern (used by title/bio/comment).
- [ ] **Card + Surface** *(30 min)* — used by every list grid + builder card + notification row.
- [ ] **Badge + Tag** *(30 min)* — submission statuses, urgency, sector.
- [ ] **DocumentTabs** *(20 min)* — 6 tabs, active/inactive/disabled.
- [ ] **Nav + Footer** *(30 min)* — desktop + mobile menu pattern.
- [ ] **Empty / loading / error** *(20 min)* — empty feed, empty library, "DB not configured", 404, 500.

### Day 3 gate
- [ ] Voting, commenting, status fan-out all verified
- [ ] `design/COMPONENTS.md` complete (all 7 primitives)

---

## Day 4 (Thu) — Auth edge cases + admin dashboard design

**Daily schedule (~6 h focused work):**

| Block | Time | Track | Task |
|---|---|---|---|
| 1 | 09:00–09:30 | A | Email + password signup |
| 2 | 09:30–09:50 | A | Password reset via Resend |
| 3 | 09:50–10:05 | A | Account merging |
| 4 | 10:15–11:15 | A | Content team kickoff sync |
| 5 | 11:15–12:15 | B | Dashboard audit + answer-list → `design/ADMIN_DASHBOARD.md` |
| — | 12:15–13:15 | — | Lunch |
| 6 | 13:15–14:45 | B | Layout sketch (paper / Figma / ASCII) |
| 7 | 15:00–16:00 | B | Data + RPC plan per panel |
| 8 | 16:00–16:30 | B | Chart library decision + component reuse audit |

### Track A — Auth edge cases + content kickoff

- [ ] **Email + password signup** *(30 min)*
  - Sign out of Google. `/signup` → Email tab → name + email + password (≥ 8) → auto-signs in.
  - Sign out → `/signin` → Email tab → same credentials → signs in.

- [ ] **Password reset via Resend** *(20 min)*
  - `/reset` → email → click link in inbox → new password → sign in.

- [ ] **Account merging** *(15 min)*
  - Sign in with Google using your email/password account's email → still one `User` row.

- [ ] **Content team kickoff** *(60 min)*
  - Walk Christex content team through `/admin/library/new` live on staging.
  - Hand them the docx spec for the 6 PDFs.
  - Confirm first Library entry topic + completion target (aim end of Week 5).

### Track B — Admin dashboard redesign

- [ ] **Dashboard audit + answer-list** *(60 min)*
  - Open current `/admin/dashboard`. Note what's missing for daily admin use.
  - Pick the 5–7 questions a glance at the dashboard should answer (this week's submission volume, sectors trending, pipeline stuck points, Library entries with builders but no recent activity, etc.).

- [ ] **Layout sketch** *(90 min)*
  - Wireframe new layout (paper / Figma / ASCII). Suggested zones:
    - **Hero strip:** week metrics (submissions, votes, voters, comments).
    - **Pipeline:** funnel Submitted → Gaining Traction → Under Review → Live with counts → filtered submission list links.
    - **Action queue:** awaiting review / hit Gaining Traction last 7 days / Library entries with stale builders.
    - **Engagement:** weekly volume chart (8 weeks).
    - **Top sectors:** horizontal bar.
    - **Recent activity:** last 10 events feed.

- [ ] **Data + RPC plan** *(60 min)*
  - Per panel, write the Supabase query or RPC needed.
  - Decide RPC vs inline; list new SQL functions to add (`weekly_volume()`, `pipeline_counts()`, etc.).
  - Decide refresh model (`force-dynamic` on render; no polling at this scale).

- [ ] **Chart library + component reuse** *(30 min)*
  - Recharts vs Tremor vs hand-rolled SVG bars — pick one with a one-line reason.
  - List new components to spec (metric card, stat-with-delta, bar chart wrapper, activity row).

### Day 4 gate
- [ ] All three sign-in methods (Google, GitHub, email/password) confirmed
- [ ] Reset email arrives + new password works
- [ ] Account merging verified
- [ ] Content team has started
- [ ] `design/ADMIN_DASHBOARD.md` complete

---

## Day 5 (Fri) — Vercel staging + apply tokens

**Daily schedule (~5 h focused work):**

| Block | Time | Track | Task |
|---|---|---|---|
| 1 | 09:00–09:20 | A | Connect repo to Vercel + Preview env vars |
| 2 | 09:20–09:35 | A | Update OAuth callbacks for preview URL |
| 3 | 09:35–10:35 | A | Smoke test deployed preview |
| 4 | 10:45–11:45 | B | Update `globals.css` `@theme` with tokens |
| — | 11:45–12:45 | — | Lunch |
| 5 | 12:45–13:30 | B | Apply tokens to layout chrome (Nav, Footer, root) |
| 6 | 13:30–14:15 | B | Apply tokens to homepage + FeedCard |
| 7 | 14:15–14:35 | B | Document the system → `design/README.md` |
| 8 | 14:35–15:00 | — | End-of-week gate check |

### Track A — Vercel preview deploy

- [ ] **Connect repo to Vercel** *(20 min)*
  - Import `christex-foundation/ProblemBankv2`. Framework: Next.js. Build: `npm run build`.
  - Settings → Environment Variables → bulk paste from `.env.local` into Preview scope.
  - Leave `NEXTAUTH_URL` + `NEXT_PUBLIC_BASE_URL` blank for Preview.
  - Don't fill Production scope yet.

- [ ] **Update OAuth callbacks** *(15 min)*
  - Google + GitHub: add Vercel preview URL.
  - Turnstile already allows `*.vercel.app`.

- [ ] **Smoke test deployed** *(60 min)*
  - Incognito → preview URL.
  - Sign in (Google, GitHub, email/password).
  - Submit, vote, comment, register on Library entry.
  - `/admin/dashboard` (as admin), `/api/health` → 200.

### Track B — Apply tokens (implementation, optional / spillable)

If Day 2 tokens are still in flux, push this block to Week 2 Day 1.

- [ ] **Update Tailwind theme** *(60 min)*
  - In `src/app/globals.css`, replace placeholder theme with token set (`@theme { --color-…, --font-…, --spacing-…, --radius-… }`).

- [ ] **Apply to layout chrome** *(45 min)*
  - Update `ProblemBankNav`, `Footer`, root `layout.tsx` to use new tokens.

- [ ] **Apply to homepage + feed** *(45 min)*
  - Library grid card on `/`, `FeedCard` on `/feed` — token-driven colors + spacing + type.

- [ ] **Document the system** *(20 min)*
  - `design/README.md` linking to all the design docs created this week.

### Day 5 gate
- [ ] Staging deployed to Vercel preview
- [ ] OAuth works on the preview URL
- [ ] All non-phone-OTP flows verified on the deployed URL
- [ ] (Stretch) Tokens applied to layout + home + feed

---

## End-of-week health check

**Config:**
- [ ] `.env.local` has 14 of 15 values filled (only Twilio still blank if WhatsApp pending). SMS-only path: `TWILIO_*` keys can be filled today.
- [ ] Schema applied to staging Supabase
- [ ] Vercel preview deployed + smoke-tested
- [ ] Google + GitHub + email/password sign-in all working
- [ ] You can publish a Library entry end-to-end via Admin CMS

**Design:**
- [ ] `design/REFERENCES.md`, `design/INTENT.md`, `design/CONSTRAINTS.md`, `design/TOKENS.md`, `design/COMPONENTS.md`, `design/ADMIN_DASHBOARD.md`, `design/README.md` all committed
- [ ] Admin dashboard wireframe + data plan ready for Week 2 implementation
- [ ] (Stretch) Tokens applied to layout + homepage + feed

**Content + ops:**
- [ ] Christex content team has started on the first Library entry; target completion captured
- [ ] WhatsApp approval status checked — escalate to Twilio if no movement after 4 business days

If any item is not ticked, slip that to Day 1 of Week 2 and shift the rest of Week 2 down. Don't proceed to Week 2 with broken Day 5 items.

---

## Daily totals at a glance

| Day | Track A | Track B | Total | Theme |
|---|---|---|---|---|
| Mon | 3h | 2.25h | 5.25h | Critical-path setup + design audit |
| Tue | 1.5h | 4h | 5.5h | Auth providers + tokens |
| Wed | 1.75h | 3.7h | 5.5h | Files & flow smoke + component spec |
| Thu | 2h | 4h | 6h | Auth edge cases + admin dashboard redesign |
| Fri | 1.6h | 2.8h | 4.4h | Vercel preview + apply tokens (stretch) |
| **Total** | **9.85h** | **16.75h** | **26.65h** | |

Design (Track B) is the larger half of the week. If you're a solo operator, Track A in the morning while you're fresh, Track B in the afternoon when account-creation UIs would just be loading anyway.

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

*Week 2 = implement design tokens + admin dashboard redesign + apply across remaining pages. Then `QA_CHECKLIST.md` in Week 3 and `LAUNCH_RUNBOOK.md` for T-7 → launch.*
