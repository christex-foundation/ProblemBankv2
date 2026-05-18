# Week 1 — Two-track daily checklist

**This is a two-person week.** Track A is the **Engineer**, Track B is the **Designer**. They work in parallel, all five days, and sync briefly at the start and end of each day. Neither track waits on the other except where called out explicitly.

By end of week:

**Engineer ships:** `.env.local` filled, schema on staging Supabase, Twilio approval submitted, every non-phone-OTP flow working locally + on a Vercel preview. Christex content team kicked off.

**Designer ships:** A committed `design/` folder containing `REFERENCES.md`, `INTENT.md`, `CONSTRAINTS.md`, `TOKENS.md`, `COMPONENTS.md`, and `ADMIN_DASHBOARD.md` — all drafted to a level where Week 2 implementation can read from them without follow-up questions.

Time estimates are for focused work. Pad both tracks with reading / debug / iteration time per real day.

---

## Daily rhythm

| 09:00–09:15 | Both | Daily sync — yesterday's blockers, today's targets, anything one needs from the other |
| 09:15– …    | — | Work the day's track in parallel |
| 16:30–16:45 | Both | End-of-day check-in — verify gates, spot tomorrow's risks |

The only hard cross-track handoff this week is at **EOD Day 2**: Designer's `design/TOKENS.md` should be done so the Engineer (if Day 5 stretch is in play) can apply them. If tokens slip, the engineer skips the Day 5 stretch — no other dependency.

---

# 👷 Engineer — Track A

Total ≈ 4–6 h focused work/day, balance is debug + code reading + Week 2 prep.

---

## Day 1 (Mon) — Critical path setup

**Schedule:**

| Time | Task |
|---|---|
| 09:15–09:45 | Submit Twilio WhatsApp approval (FIRST) |
| 09:45–11:00 | Supabase staging project + apply schema |
| 11:15–12:00 | Google OAuth app |
| 13:00–13:45 | Fill `.env.local` + first sign-in smoke |
| 13:45–14:00 | Promote yourself to admin |
| 14:00–16:30 | Code reading + Week 2 prep (read `src/lib/auth.ts`, `src/lib/supabase.ts`, schema migration) |

- [ ] **Submit Twilio WhatsApp Business approval** *(30 min)*
  - Console → Messaging → Senders → WhatsApp senders → Request new number.
  - Why first: 1–2 week lead time. Blocks Week 4 phone-OTP work if you delay.

- [ ] **Supabase staging + schema** *(75 min)*
  - New project `problem-bank-staging`. Region `eu-west-2 (London)`. Save DB password.
  - Settings → API → copy `Project URL` (`SUPABASE_URL`) + `service_role` key (`SUPABASE_SERVICE_ROLE_KEY`).
  - SQL Editor → paste `supabase/migrations/0001_init.sql` → Run.
  - Done: 9 tables visible in Table Editor.

- [ ] **Google OAuth** *(45 min)*
  - Project "Problem Bank" → OAuth consent (External) → app name + email + logo.
  - Credentials → OAuth client ID → Web app. Redirect: `http://localhost:3000/api/auth/callback/google`.
  - Copy Client ID + Secret.

- [ ] **Fill `.env.local` + first smoke** *(45 min)*
  - `NEXTAUTH_SECRET = $(openssl rand -base64 32)`, `NEXTAUTH_URL=http://localhost:3000`, Supabase + Google vars.
  - `npm run dev`, visit `/signin`, sign in with Google.
  - Done: `User` row visible in Supabase.

- [ ] **Promote to admin** *(15 min)*
  - SQL Editor: `UPDATE "User" SET role='admin' WHERE email='you@christex.foundation';`
  - Sign out + back in. `/admin/dashboard` should render.

### Day 1 gate (Engineer)
- [ ] WhatsApp approval submitted
- [ ] Staging Supabase live with schema
- [ ] Google sign-in working locally
- [ ] You are admin

---

## Day 2 (Tue) — Remaining auth providers + bot protection + email

**Schedule:**

| Time | Task |
|---|---|
| 09:15–09:45 | GitHub OAuth app |
| 09:45–10:05 | Cloudflare Turnstile |
| 10:15–10:45 | Resend domain + API key |
| 11:00–12:30 | Code reading: `src/app/api/auth/*`, `src/components/auth/*` |
| 13:30–16:30 | Buffer / debug / write small SQL helpers for QA in coming days |

- [ ] **GitHub OAuth** *(30 min)*
  - Org → Developer settings → OAuth Apps → New. Callbacks: production + `http://localhost:3000/api/auth/callback/github`.
  - Add `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` to `.env.local`.
  - Done: GitHub sign-in works locally; `User.githubUrl` populated.

- [ ] **Cloudflare Turnstile** *(20 min)*
  - Add site `build.christex.foundation` (Managed). Hostnames: production, `localhost`, `*.vercel.app`.
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` → `.env.local`.
  - Done: widget renders on `/feed/submit`.

- [ ] **Resend** *(30 min)*
  - API Key → `.env.local` as `RESEND_API_KEY`. `EMAIL_FROM=noreply@christex.foundation`.
  - Domains → add `christex.foundation` → verify DKIM/SPF via Cloudflare DNS (may take 5–60 min to propagate).

### Day 2 gate (Engineer)
- [ ] Google + GitHub sign-in working locally
- [ ] Turnstile widget renders
- [ ] Resend domain verified

---

## Day 3 (Wed) — Cloudinary + deep flow QA

**Schedule:**

| Time | Task |
|---|---|
| 09:15–09:45 | Cloudinary account + upload preset |
| 09:45–10:30 | Submission flow smoke |
| 10:45–11:15 | Comments + status flow smoke |
| 11:30–12:30 | Edge cases (network failure mid-upload, large file, max title length, …) |
| 13:30–16:30 | File any bugs as GitHub issues; light fixes as needed |

- [ ] **Cloudinary** *(30 min)*
  - `Cloud name`, `API Key`, `API Secret`. Unsigned preset `problem_bank_unsigned`, folder `problem-bank`.
  - 4 Cloudinary vars → `.env.local`. Restart dev server.
  - Done: image uploaded from `/feed/submit` lands in `problem-bank/submissions/`.

- [ ] **Submission flow smoke** *(45 min)*
  - Submit 3 problems across sectors. One with inline image.
  - Vote, unvote within 5 min, lock after 5 min (mutate `votedAt` in SQL), 4th vote in same week blocked.

- [ ] **Comments + status flow** *(30 min)*
  - Comment as admin → appears.
  - `/admin/submissions` → change status to `under_review` → reload public detail → comment input gone, existing comment readable, `Notification` row created.

- [ ] **Edge cases** *(60 min)*
  - Submit with empty description → button disabled. Title at 80/80 chars → no truncation. Network interruption mid-upload → form preserves text. Cast a 4th vote → blocked with toast.

### Day 3 gate (Engineer)
- [ ] Voting + comments + status fan-out all verified
- [ ] Bugs (if any) filed as GitHub issues

---

## Day 4 (Thu) — Auth edge cases + content team kickoff

**Schedule:**

| Time | Task |
|---|---|
| 09:15–09:45 | Email + password signup |
| 09:45–10:05 | Password reset via Resend |
| 10:05–10:20 | Account merging |
| 10:30–11:30 | Content team kickoff sync (Engineer hosts, Designer joins last 15 min) |
| 13:30–16:30 | Pair with Designer on `design/COMPONENTS.md` review; identify Week 2 implementation order |

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
  - Done: content team has started; target date captured.

### Day 4 gate (Engineer)
- [ ] All three sign-in methods (Google, GitHub, email/password) confirmed
- [ ] Reset email arrives + new password works
- [ ] Account merging verified
- [ ] Content team has started

---

## Day 5 (Fri) — Vercel staging deploy

**Schedule:**

| Time | Task |
|---|---|
| 09:15–09:35 | Connect repo to Vercel + Preview env vars |
| 09:35–09:50 | Update OAuth callbacks for preview URL |
| 09:50–10:50 | Smoke test deployed preview |
| 11:00–12:00 | **(stretch, depends on Designer Day 2)** Apply tokens to `globals.css` |
| 13:30–14:15 | **(stretch)** Apply tokens to Nav + Footer + root layout |
| 14:15–15:00 | **(stretch)** Apply tokens to homepage + FeedCard |
| 15:00–16:00 | End-of-week wrap, plan Week 2 with Designer |

- [ ] **Connect repo to Vercel** *(20 min)*
  - Import `christex-foundation/ProblemBankv2`. Framework: Next.js. Build: `npm run build`.
  - Settings → Environment Variables → bulk paste from `.env.local` into Preview scope.
  - Leave `NEXTAUTH_URL` + `NEXT_PUBLIC_BASE_URL` blank for Preview (Vercel sets them).
  - Don't fill Production scope yet — that's Week 5.

- [ ] **Update OAuth callbacks** *(15 min)*
  - Google + GitHub: add Vercel preview URL.
  - Turnstile already allows `*.vercel.app`.

- [ ] **Smoke test deployed** *(60 min)*
  - Incognito → preview URL.
  - Sign in (Google, GitHub, email/password).
  - Submit, vote, comment, register on Library entry.
  - `/admin/dashboard` (as admin), `/api/health` → 200.

- [ ] **(Stretch — apply tokens)** *(2.5 h)*
  - Only if `design/TOKENS.md` is committed.
  - Update `globals.css` `@theme` block with tokens.
  - Apply to `ProblemBankNav`, `Footer`, root `layout.tsx`.
  - Apply to homepage + `FeedCard` component.

### Day 5 gate (Engineer)
- [ ] Vercel preview deployed
- [ ] OAuth works on preview URL
- [ ] All non-phone-OTP flows verified on the deployed URL

---

# 🎨 Designer — Track B

Total ≈ 3–5 h focused output/day, plus thinking time.

Every output is a markdown file committed to `design/` in this repo. **No code this week** — Week 2 is implementation.

---

## Day 1 (Mon) — Reference + intent + constraints

**Schedule:**

| Time | Task |
|---|---|
| 09:15–10:15 | Reference review → `design/REFERENCES.md` |
| 10:30–11:15 | Audience + tone → `design/INTENT.md` |
| 11:15–11:45 | Constraint list → `design/CONSTRAINTS.md` |
| 13:00–16:30 | Sketch loose mood / direction (paper or Figma); not for sharing yet |

- [ ] **Reference review → `design/REFERENCES.md`** *(60 min)*
  - Pull every existing visual asset: christex.foundation site, logos in `public/images/`, any hackathon palette worth keeping.
  - List visual systems to study (Stripe Docs, Vercel Marketing, Notion, frontier-market analogues).
  - One-line commentary per reference.

- [ ] **Audience + tone → `design/INTENT.md`** *(45 min)*
  - For each user type (entrepreneur / developer, investor, community contributor), one paragraph: what should the design make them feel?
  - Three sentences of overall design intent.

- [ ] **Constraint list → `design/CONSTRAINTS.md`** *(30 min)*
  - Mobile-first (360px target), body text ≥ 16px, contrast ≥ 4.5:1, Slow 3G first-paint < 3s, no heavy decoration on critical paths, decision on Decoy + Geist fonts.

### Day 1 gate (Designer)
- [ ] 3 design docs committed: `REFERENCES.md`, `INTENT.md`, `CONSTRAINTS.md`
- [ ] Mood explored privately (not for review yet)

---

## Day 2 (Tue) — Token definition

**🔁 Cross-track handoff: `design/TOKENS.md` must be committed by EOD so the Engineer can apply tokens on Day 5 (or push to Week 2).**

**Schedule:**

| Time | Task |
|---|---|
| 09:15–10:45 | Color palette → `design/TOKENS.md` |
| 11:00–12:00 | Type scale |
| 13:00–14:00 | Spacing + radius + shadow + motion |
| 14:15–14:45 | Map tokens to Tailwind 4 `@theme` block |
| 15:00–16:30 | Review tokens against `INTENT.md` and `CONSTRAINTS.md`; tweak |

- [ ] **Color palette** *(90 min)*
  - Primary brand, secondary, neutral scale (12 steps), semantic (success/warning/error/info), surface (page bg / card bg / elevated bg).
  - Run every text/bg pair through a contrast checker (Stark, WebAIM).
  - Hex values + intended usage per token.

- [ ] **Type scale** *(60 min)*
  - Heading + body + mono font stack decision.
  - Scale: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60 / 72 px.
  - Line heights, weights, letter spacing.
  - Mobile defaults: body 16px floor.

- [ ] **Spacing + radius + shadow + motion** *(60 min)*
  - Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
  - Radius: sm / md / lg / full. Shadow: 3 levels. Motion: durations + easings.

- [ ] **Tailwind 4 mapping plan** *(30 min)*
  - Sketch how each token lands in the `@theme` block of `globals.css`.
  - List Tailwind utilities you'll use vs. custom classes.

### Day 2 gate (Designer)
- [ ] `design/TOKENS.md` complete and committed
- [ ] Tokens validated against `INTENT.md` and `CONSTRAINTS.md`

---

## Day 3 (Wed) — Component primitives spec

**Schedule:**

| Time | Task |
|---|---|
| 09:15–10:00 | Button spec → `design/COMPONENTS.md` |
| 10:15–11:00 | Input / Textarea / Select spec |
| 11:15–11:45 | Card + Surface spec |
| 13:00–13:30 | Badge + Tag spec |
| 13:45–14:05 | DocumentTabs spec |
| 14:15–14:45 | Nav + Footer spec |
| 14:45–15:05 | Empty / loading / error states |
| 15:15–16:30 | Component anatomy diagrams (Figma or sketch + screenshot) |

For each: variants, sizes, states (default/hover/active/focus/disabled), a11y notes, anatomy. **Spec only, no code.**

- [ ] **Button** *(45 min)* — primary, secondary, ghost, destructive, link; sm/md/lg; loading; icon-only.
- [ ] **Input / Textarea / Select** *(45 min)* — label + placeholder + helper + error; counter pattern.
- [ ] **Card + Surface** *(30 min)* — every list grid + builder card + notification row.
- [ ] **Badge + Tag** *(30 min)* — submission statuses, urgency, sector.
- [ ] **DocumentTabs** *(20 min)* — 6 tabs, active/inactive/disabled.
- [ ] **Nav + Footer** *(30 min)* — desktop + mobile menu pattern.
- [ ] **Empty / loading / error states** *(20 min)* — empty feed, empty library, "DB not configured", 404, 500.

### Day 3 gate (Designer)
- [ ] `design/COMPONENTS.md` complete (7 primitives)
- [ ] Anatomy diagrams attached or linked

---

## Day 4 (Thu) — Admin dashboard redesign

**Schedule:**

| Time | Task |
|---|---|
| 09:15–10:15 | Dashboard audit + answer-list → `design/ADMIN_DASHBOARD.md` |
| 10:30–12:00 | Layout sketch (paper / Figma / ASCII) |
| 13:00–14:00 | Data + RPC plan per panel (consult Engineer on what's feasible) |
| 14:15–14:45 | Chart library decision + component reuse audit |
| 14:45–15:30 | Join Engineer's content team kickoff (last 15 min) to hear research workflow |
| 15:30–16:30 | Sketch revisions based on the content team sync |

- [ ] **Dashboard audit + answer-list** *(60 min)*
  - Open current `/admin/dashboard` (Engineer's staging) and note what's missing for daily Christex admin use.
  - Pick the 5–7 questions a glance at the dashboard should answer.

- [ ] **Layout sketch** *(90 min)*
  - Wireframe new layout. Suggested zones:
    - **Hero strip:** week metrics (submissions, votes, voters, comments).
    - **Pipeline:** funnel Submitted → Gaining Traction → Under Review → Live with counts.
    - **Action queue:** awaiting review / hit Gaining Traction last 7 days / Library entries with stale builders.
    - **Engagement:** weekly volume chart (8 weeks).
    - **Top sectors:** horizontal bar.
    - **Recent activity:** last 10 events feed.

- [ ] **Data + RPC plan** *(60 min)*
  - Per panel, write the Supabase query or RPC needed.
  - Decide RPC vs inline; list new SQL functions to add (`weekly_volume()`, `pipeline_counts()`, etc.).
  - Decide refresh model (`force-dynamic` on render).

- [ ] **Chart library + component reuse** *(30 min)*
  - Recharts vs Tremor vs hand-rolled SVG bars — pick one with a one-line reason.
  - List new components to spec (metric card, stat-with-delta, bar chart wrapper, activity row).

### Day 4 gate (Designer)
- [ ] `design/ADMIN_DASHBOARD.md` complete
- [ ] Wireframe + data plan ready for Week 2 implementation

---

## Day 5 (Fri) — Polish, design QA, Week 2 plan

**Schedule:**

| Time | Task |
|---|---|
| 09:15–10:15 | `design/README.md` linking to all design docs |
| 10:30–11:30 | Design QA on Engineer's Vercel preview (when ready ~10:50) |
| 13:00–14:30 | Week 2 implementation plan with Engineer |
| 14:30–16:30 | Buffer / iterate on any doc revealed weak in QA |

- [ ] **`design/README.md`** *(60 min)*
  - Single landing page linking to `INTENT`, `CONSTRAINTS`, `REFERENCES`, `TOKENS`, `COMPONENTS`, `ADMIN_DASHBOARD`.
  - A one-paragraph summary of the design system at the top.

- [ ] **Design QA on Vercel preview** *(60 min)*
  - Walk through preview URL with mobile DevTools + Slow 3G.
  - Note every gap between current UI and target design system.
  - File as GitHub issues tagged `design`.

- [ ] **Week 2 implementation plan** *(90 min)*
  - With the Engineer, sequence the design implementation:
    1. Tokens → `globals.css`
    2. Primitive components → `src/components/ui/`
    3. Replace ad-hoc Tailwind in nav, footer, pages
    4. Admin dashboard redesign
  - Estimate per item; flag dependencies; lock the order.

### Day 5 gate (Designer)
- [ ] `design/README.md` published
- [ ] Design QA issues filed
- [ ] Week 2 implementation plan agreed with Engineer

---

# End-of-week health check (both)

## Engineer
- [ ] `.env.local` filled (Twilio fields OK to leave for WhatsApp if pending; SMS-only ready)
- [ ] Schema applied to staging Supabase
- [ ] Vercel preview deployed
- [ ] Google + GitHub + email/password sign-in all working
- [ ] Publishable Library entry through Admin CMS
- [ ] (Stretch) Tokens applied to layout + homepage + feed

## Designer
- [ ] All seven `design/*.md` docs committed
- [ ] Admin dashboard wireframe + data plan ready for Week 2
- [ ] Design QA issues filed against the preview

## Content + ops
- [ ] Christex content team has started on first Library entry; target completion captured
- [ ] WhatsApp approval status checked — escalate to Twilio if no movement after 4 business days

If either track is behind, slip those items to Day 1 of Week 2 and shift Week 2's plan down. Don't proceed with broken Day 5 items.

---

## Daily totals at a glance

| Day | Engineer | Designer | Cross-track event |
|---|---|---|---|
| Mon | ~3h focused, ~3h reading | ~2.25h focused | — |
| Tue | ~1.5h focused, ~5h reading/buffer | ~4h focused | **EOD: Designer commits TOKENS.md** |
| Wed | ~2.75h focused | ~3.7h focused | — |
| Thu | ~2h focused | ~4h focused | **Content kickoff (Engineer hosts, last 15 min joint)** |
| Fri | ~1.5h focused + optional 2.5h apply tokens | ~2.5h focused + Week 2 plan | **Design QA on preview; Week 2 plan together** |

---

## Communication

- **Daily sync (15 min, 09:00):** blockers, today's targets, hand-offs.
- **EOD check-in (15 min, 16:30):** what shipped, what's next, anything the other person needs to know.
- **Async:** drop blockers in a shared channel as they arise. Don't wait for sync.

The week's only hard dependency is **Tuesday EOD: tokens done** so apply-tokens on Friday can land. Everything else is independent.

---

## Quick reference

```bash
# Engineer
openssl rand -base64 32                  # NEXTAUTH_SECRET
npm run dev                              # restart after .env.local change
curl http://localhost:3000/api/health    # smoke check

# Supabase SQL editor — promote to admin
UPDATE "User" SET role = 'admin' WHERE email = 'you@christex.foundation';
```

Designer's work lands as commits to `design/`. No build / deploy step.

---

*Week 2 = implement design tokens + admin dashboard redesign + apply across remaining pages. Then `QA_CHECKLIST.md` in Week 3 and `LAUNCH_RUNBOOK.md` for T-7 → launch.*
