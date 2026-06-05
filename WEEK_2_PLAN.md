# Week 2 — Plan (Engineer + Designer, with Week 1 carryover)

**Dates:** Mon 2026-05-25 → Fri 2026-05-29.

**Reality check:** Week 1 ran on a different track than `WEEK_1_CHECKLIST.md` planned. The Designer Day 1-3 spec docs landed (PR #6, post-hoc), but Day 4-5 are open. The Engineer track shipped a landing page and three unmerged bnjox PRs (#1 skills, #2 api-setup, #3 api hardening) instead of the operational Phase 0 + Phase 1 work. So Week 2 absorbs that carryover before starting fresh Phase 2 work.

**This week, by end of Friday:**

**Engineer ships:**
1. All Phase 0 / Phase 1 operational setup confirmed and finished (Supabase finish, Vercel preview new)
2. PR #1 merged, PR #2 closed (already), PR #3 (reviewed) merged
3. Submission / vote / comment / auth flows re-verified on the live preview
4. Original Phase 2 seeding + Gaining Traction + filter QA done
5. Outstanding local gaps closed: password reset via Resend, account merging, status fan-out, content team kickoff

**Designer ships:**
1. `design/ADMIN_DASHBOARD.md` (Week 1 Day 4 carryover)
2. `design/README.md` linking everything (Week 1 Day 5 carryover)
3. Design QA pass on the live Vercel preview, issues filed (Week 1 Day 5 carryover)
4. The four spec-only primitives from `COMPONENTS.md` (Input, Card, Badge/Tag, DocumentTabs, Empty/Loading/Error) ratified or revised
5. Week 3 implementation order agreed with Engineer

---

## Carryover from Week 1

### Engineer carryover (operational, blocks everything)

| Item | Reason it slipped | Lands on |
|---|---|---|
| Twilio WhatsApp Business approval submitted | Not started | Day 1 (FIRST) |
| Supabase staging project + schema applied | started | Day 1 |
| Google OAuth + `.env.local` filled + admin promotion | Not started | Day 1 |
| GitHub OAuth | Not started | Day 2 |
| Cloudflare Turnstile | Not started | Day 2 |
| Resend domain verification | Not started | Day 2 |
| Cloudinary account + unsigned preset | Not started | Day 2 |
| Vercel preview connected + env vars set + first deploy | Not started | Day 3 |
| Submission / vote / comment / auth smoke flows | shipped | Day 4 |
| Content team kickoff for first Library entry | Not started | Day 4 |
| PR #1 (skills tooling) review + merge | Not reviewed | Day 2 (easy slot) |
| PR #2 (api-setup server scaffold) review + merge | closed | Day 3 |
| PR #3 (api hardening + zod + docs) review + merge | reviewed | Day 3 (biggest) |

### Designer carryover

| Item | Reason it slipped | Lands on |
|---|---|---|
| `design/ADMIN_DASHBOARD.md` | Designer track didn't start | Day 1-2 |
| `design/README.md` linking the six docs | Same | Day 3 |
| Design QA on the Vercel preview | Preview didn't exist | Day 4 |
| Week 2/3 implementation order agreed with Engineer | Same | Day 5 |
| Flesh out spec-only primitives in `COMPONENTS.md` | Documented as spec-only in PR #6 | Day 3 |

---

## Daily rhythm

| 09:00-09:15 | Both | Daily sync, yesterday's blockers, today's targets, hand-offs |
| 09:15-...   | -    | Track work in parallel |
| 16:30-16:45 | Both | EOD check-in, verify gates |

**Hard cross-track hand-offs this week:**

- **EOD Wed (Day 3):** Engineer's Vercel preview must be live so Designer can QA it Thursday.
- **EOD Thu (Day 4):** Designer's `ADMIN_DASHBOARD.md` complete so Engineer can scope it for Week 3.

---

# Engineer Track A

Total ~5-7h focused work/day. This week is heavy on operational setup that should have happened Day 1 of Week 1.

---

## Day 1 (Mon 2026-05-25) - Phase 0 critical path (mostly verification)

Most of Day 1 is verifying what already works locally and finishing the partial Supabase setup. Time saved goes to pulling Day 2/3 forward.

**Schedule:**

| Time | Task |
|---|---|
| 09:15-09:45 | Submit Twilio WhatsApp Business approval (FIRST, only if not already submitted) |
| 09:45-10:30 | Finish Supabase staging: confirm both migrations applied, copy keys |
| 10:30-11:00 | Sanity-check `.env.local` + local sign-in (already-shipped flows) |
| 11:00-12:00 | Promote to admin if not already; confirm `/admin/dashboard` |
| 13:00-14:30 | Pull Day 2 work forward: Resend domain verification (DNS propagation has a long tail) |
| 14:30-16:30 | Begin Vercel project setup (Day 3 work pulled forward) |

- [ ] **Submit Twilio WhatsApp approval** (30m). Console → Messaging → Senders → WhatsApp senders → Request a new number. Approval has a 1-2 week lead time and blocks phone OTP in Week 6. Skip if already submitted; confirm submission date is logged.
- [ ] **Finish Supabase staging** (45m). Supabase setup is marked started in the carryover. Confirm `problem-bank-staging` exists in region `eu-west-2 (London)`, `0001_init.sql` has been run (9 tables visible), and `0002_comment_parent.sql` from PR #3 has been run (Comment has `commentParentId` column). If either migration is missing, run it now. Confirm `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are in `.env.local`.
- [ ] **Sanity-check `.env.local` + local sign-in** (30m). Auth smoke flows are marked shipped, so this is verify-don't-recreate. `npm run dev`, `/signin`, sign in with Google, confirm the `User` row is still there.
- [ ] **Confirm admin role** (15m). SQL editor: `SELECT id, email, role FROM "User" WHERE email='you@christex.foundation';` If role isn't `admin`, run `UPDATE "User" SET role='admin' WHERE email='you@christex.foundation';` and re-sign-in.
- [ ] **Resend domain** (30m, pulled from Day 2). API key → `.env.local`. Domains → add `christex.foundation`, verify DKIM/SPF via Cloudflare DNS. Propagation can take 5-60 min; start it early so it's ready by the password-reset test on Day 4.

### Day 1 gate (Engineer)

- [ ] WhatsApp approval submitted (date logged)
- [ ] Staging Supabase confirmed: both migrations applied
- [ ] Local sign-in still works
- [ ] You are admin
- [ ] Resend domain verification kicked off (waiting on DNS)

---

## Day 2 (Tue 2026-05-26) - Verify remaining accounts + PR #1 merge + PR #3 merge

Submission and auth flows are shipped locally, so the underlying accounts (Google OAuth, GitHub OAuth, Turnstile, Cloudinary) must already be wired. This day verifies each one and patches any gaps, then closes out the merge work since PR #3 is already reviewed and PR #2 is already closed.

**Schedule:**

| Time | Task |
|---|---|
| 09:15-09:35 | Verify GitHub OAuth (sign-in + `githubUrl` populated) |
| 09:35-09:55 | Verify Turnstile widget on `/feed/submit` |
| 09:55-10:15 | Verify Cloudinary upload from `/feed/submit` |
| 10:15-10:45 | Verify Resend DNS propagated (from Day 1) |
| 11:00-12:00 | Review + merge PR #1 (skills tooling) |
| 13:30-15:00 | Merge PR #3 (already reviewed); resolve any rebase conflict on main |
| 15:00-16:30 | Local smoke after PR #3 merge: error envelope, comment-closed 403, build-registry 409 |

- [ ] **Verify GitHub OAuth** (20m). Sign out, sign in with GitHub locally, confirm a `User` row with `githubUrl` populated. If broken, fix `.env.local` keys; this auth path needs to keep working through the PR #3 merge.
- [ ] **Verify Turnstile** (20m). Visit `/feed/submit`, widget renders. Submit without a token (DevTools → block the Turnstile request) → expect a `400 turnstile_failed` per PR #3's error taxonomy.
- [ ] **Verify Cloudinary** (20m). Submit a problem with an inline image. Image lands in `problem-bank/submissions/`. If broken: confirm unsigned preset `problem_bank_unsigned` exists in folder `problem-bank`, and the 4 Cloudinary env vars are set.
- [ ] **Confirm Resend DNS** (30m). Domains → check status. If still pending, escalate or move password-reset verification to Day 4 EOD.
- [ ] **Review + merge PR #1** (60m). Pure tooling: `.agents/skills/` reference material. Spot-check `SKILL.md` files, confirm no runtime impact. Squash-merge.
- [ ] **Merge PR #3** (90m). Already marked reviewed in the carryover. Pull origin/main, rebase the PR branch, resolve any conflict, squash-merge. The PR description's "TODO(auth)" markers are intentional — leave them.
- [ ] **Post-merge local smoke** (90m). On merged main: `/api/health` returns the new envelope; `/api/library/[id]/build-registry` POST twice → second is `409 already_registered`; `/api/submissions/[id]/comments` POST on a post-`submitted` submission → `403 comment_closed`. These are PR #3's behavior changes — confirm them now while local context is loaded.

### Day 2 gate (Engineer)

- [ ] GitHub OAuth + Turnstile + Cloudinary verified
- [ ] Resend DNS resolved (or escalated)
- [ ] PR #1 merged
- [ ] PR #3 merged; local smoke confirms new error envelope

---

## Day 3 (Wed 2026-05-27) - Vercel preview live (Designer hand-off)

PR #2 is closed and PR #3 merged on Day 2, so today is entirely about getting a preview URL into the Designer's hands by EOD. Whatever doesn't fit gets pulled into Day 4 because Designer QA is the gating constraint.

**Schedule:**

| Time | Task |
|---|---|
| 09:15-09:35 | Connect repo to Vercel + Preview env vars |
| 09:35-09:50 | Update OAuth callbacks for preview URL |
| 09:50-10:50 | Sign-in smoke on the deployed preview (Google + GitHub + email) |
| 11:00-12:30 | Submission + vote + comment smoke on preview (re-verifying the shipped-locally flows) |
| 13:30-14:30 | Hand preview URL to Designer; pair on the first 15-min QA scan |
| 14:30-16:30 | Pull Day 5 forward: begin Phase 2 seed data + commit `supabase/seed/dev_phase2.sql` |

- [ ] **Connect repo to Vercel** (20m). Import `christex-foundation/ProblemBankv2`. Framework: Next.js. Build: `npm run build`. Settings → Environment Variables → bulk paste `.env.local` into Preview scope. Leave `NEXTAUTH_URL` + `NEXT_PUBLIC_BASE_URL` blank for Preview (Vercel injects them).
- [ ] **Update OAuth callbacks** (15m). Google + GitHub: add Vercel preview URL.
- [ ] **Sign-in smoke on preview** (60m). Incognito → preview URL. Google, GitHub, and email/password all sign in. (Email signup is already shipped locally per the carryover; re-confirm on preview.)
- [ ] **Submission / vote / comment smoke on preview** (90m). The flows are shipped locally; verify they survive the preview environment. Particular attention: Cloudinary uploads (Vercel preview hostname must be in the unsigned-preset allowed list if you locked it down) and Turnstile (must accept `*.vercel.app`).
- [ ] **Designer pairing** (60m). Send preview URL, walk Designer through the surfaces that exist (`/`, `/feed`, `/feed/submit`, `/signin`, `/library`, `/admin/dashboard`). First-pass QA notes get filed Thursday.
- [ ] **Seed data, pulled from Day 5** (2h). Author `supabase/seed/dev_phase2.sql`: 9 submissions across 4 categories × 3 urgencies × 4 statuses. Commit it. Tomorrow's Gaining Traction work can build on this.

### Day 3 gate (Engineer)

- [ ] Vercel preview live and signed-in (all three non-phone auth methods)
- [ ] Submission / vote / comment confirmed working on preview
- [ ] Preview URL handed to Designer
- [ ] `supabase/seed/dev_phase2.sql` committed

**Cross-track hand-off:** Designer has preview URL by 13:30 (earlier than original plan because Day 1/2 freed up time).

---

## Day 4 (Thu 2026-05-28) - Close outstanding gaps + content kickoff

Submission / vote / comment / auth flows are shipped, so today focuses on the still-open items: full status fan-out QA (marked partial), password reset, account merging, and the content team kickoff. Edge cases get a single block, not a half-day.

**Schedule:**

| Time | Task |
|---|---|
| 09:15-10:00 | Status fan-out: full Notification audit (the partial work from Week 1) |
| 10:00-10:45 | Edge cases (mid-upload drop, max title, empty body, PR #3 error codes) |
| 10:45-11:15 | Password reset via Resend |
| 11:15-11:35 | Account merging |
| 11:45-12:30 | Phase 2 Gaining Traction verification (pulled from Day 5) |
| 13:30-14:30 | Phase 2 filter QA (pulled from Day 5) |
| 14:45-15:30 | Content team kickoff (Engineer hosts, Designer joins last 15m) |
| 15:30-16:30 | File bugs from the day as GitHub issues |

- [ ] **Status fan-out audit** (45m). Comments + status is marked partial in the carryover. Verify the full path: comment on `submitted` → admin moves to `under_review` → reload public detail → input gone, existing comment readable, `Notification` rows created for submitter + every prior distinct commenter (not the actor). Then status to `live` → fan-out fires again with the Library entry link if linked.
- [ ] **Edge cases** (45m). Empty description → submit disabled. Title at 80 chars → no truncation. Mid-upload network drop → form preserves text. PR #3 error envelope spot-checks if not covered Tuesday.
- [ ] **Password reset via Resend** (30m). `/reset` → enter email → click link in inbox → set new password → sign in. Depends on Resend DNS confirmed Day 1/2.
- [ ] **Account merging** (20m). Sign out of email account; sign in with Google using the same email → still one `User` row.
- [ ] **Gaining Traction** (45m, pulled from Day 5). Generate 5 votes across 5 different days for one seeded submission. Reload `/feed`, confirm "Gaining Traction" displays. Reduce to 2 distinct days, confirm it disappears.
- [ ] **Filter QA** (60m, pulled from Day 5). Every combination: `/feed?sort=votes&category=Health`, `?sort=recent`, `?sort=urgency`, `?status=under_review`. Confirm order and counts.
- [ ] **Content team kickoff** (45m). Walk team through `/admin/library/new` live on staging. Hand them the 6-PDF spec. Confirm first entry topic + target completion (aim end of Week 5).

### Day 4 gate (Engineer)

- [ ] Status fan-out fully verified (Notifications correct, no self-notification)
- [ ] Password reset works end-to-end
- [ ] Account merging confirmed
- [ ] Gaining Traction + filter QA green
- [ ] Content team has started; target date captured

---

## Day 5 (Fri 2026-05-29) - Phase 3 prep + Week 3 plan

Seed + Gaining Traction + filter QA landed on Day 4 (pulled forward). Day 5 is a planning + buffer day: review Phase 3 (voting + comments + unvote QA from `IMPLEMENTATION_PLAN.md` §8) so Week 3 starts running, scope the admin dashboard redesign with the Designer, and absorb any Week 2 spillover.

**Schedule:**

| Time | Task |
|---|---|
| 09:15-10:30 | Read Phase 3 in `IMPLEMENTATION_PLAN.md`; pre-load Week 3 voting QA |
| 10:45-12:00 | Buffer / spillover from Day 4 |
| 13:00-14:30 | Walk through Designer's `ADMIN_DASHBOARD.md`; scope engineering work |
| 14:30-15:30 | Week 3 plan with Designer (joint) |
| 15:30-16:30 | Week 2 wrap: update PR statuses, file spillover as issues |

- [ ] **Phase 3 pre-load** (75m). Read `IMPLEMENTATION_PLAN.md` §8 Phase 3. Vote 3/week rule, 5-min unvote window, voting disabled UI on `live` / `not_viable`, comments closing on status change. The code is in the repo; verify what's wired vs what needs work so Week 3 Day 1 starts hot.
- [ ] **Spillover buffer** (75m). Anything that didn't land on Day 4. If Day 4 went clean, use this for a Sentry install (`@sentry/nextjs`) or to fix `design`-tagged issues filed Thursday.
- [ ] **Scope admin dashboard** (90m). Open `design/ADMIN_DASHBOARD.md`. Per panel, write a one-line engineering estimate + flag any RPC that needs new SQL. Identify what blocks first.
- [ ] **Week 3 plan with Designer** (60m). With Designer, lock implementation order for the four spec-only primitives + admin dashboard redesign + Phase 3 voting/comments QA. Carry anything that slipped from this week.
- [ ] **Wrap** (60m). Update PR statuses (#1 merged, #2 closed, #3 merged, #6 docs merged or carried). File a `week-2-spillover` issue for anything pushed.

### Day 5 gate (Engineer)

- [ ] Phase 3 read; Week 3 voting work pre-scoped
- [ ] Admin dashboard engineering estimates attached to each panel
- [ ] Week 3 plan agreed with Designer
- [ ] Spillover filed as issues

---

s # Designer Track B

Total ~3-5h focused output/day. Continuing the editorial / paper / whisper-motion system established in PR #4 and documented in PR #6.

---

## Day 1 (Mon 2026-05-25) - Admin dashboard audit + answer-list

**Schedule:**

| Time | Task |
|---|---|

| 09:15-10:15 | Open `/admin/dashboard` (after Engineer has it on localhost); note what's missing |
| 10:30-11:45 | Pick the 5-7 questions the dashboard should answer |
| 13:00-15:00 | Layout sketch (paper or Figma) of proposed panels |
| 15:00-16:30 | Capture as `design/ADMIN_DASHBOARD.md` draft (sections 1-3) |

- [ ] **Audit** (60m). Engineer should have local staging up by EOD Day 1. If not, audit against the unconnected codebase: walk `src/app/admin/dashboard/page.tsx`, list every panel and decide if it earns its place.
- [ ] **Answer-list** (75m). Pick 5-7 questions a Christex admin must answer at a glance every morning. Examples from the original brief: "How many new submissions this week?", "Which Library entries have stale builders?", "Anything awaiting review more than 3 days?"
- [ ] **Layout sketch** (2h). Wireframe new layout. Suggested zones from Week 1 brief: hero strip (weekly metrics), pipeline funnel, action queue, engagement chart, top sectors bar, recent activity feed.
- [ ] **Draft sections 1-3 of `ADMIN_DASHBOARD.md`** (90m). Audit findings, answer-list, layout sketch (ASCII or link to Figma).

### Day 1 gate (Designer)

- [ ] Audit notes captured
- [ ] 5-7 answer-list questions agreed
- [ ] Layout sketch drafted

---

## Day 2 (Tue 2026-05-26) - Admin dashboard data + chart plan

**Schedule:**

| Time | Task |
|---|---|
| 09:15-11:00 | Per-panel Supabase query / RPC plan (consult Engineer) |
| 11:15-12:00 | Chart library decision + reuse audit |
| 13:00-15:00 | Component spec for new primitives the dashboard needs |
| 15:00-16:30 | `ADMIN_DASHBOARD.md` finished (sections 4-6) |

- [ ] **Per-panel data plan** (105m). Per panel, write the Supabase query or RPC. Decide RPC vs inline. Net-new SQL functions to add (`weekly_volume()`, `pipeline_counts()`, etc.). Decide refresh model (`force-dynamic` on render).
- [ ] **Chart library + reuse** (45m). Recharts vs Tremor vs hand-rolled SVG bars. Pick one with a one-line reason. List new components to spec (metric card, stat-with-delta, bar chart wrapper, activity row).
- [ ] **Component specs** (2h). Anatomy + variants + states for the dashboard-only primitives. Add as a section in `ADMIN_DASHBOARD.md` or extend `COMPONENTS.md`.
- [ ] **Finish `ADMIN_DASHBOARD.md`** (90m). Sections 4 (data/RPC plan), 5 (chart choice), 6 (component reuse + new primitives).

### Day 2 gate (Designer)

- [ ] `design/ADMIN_DASHBOARD.md` complete
- [ ] Chart library chosen, one-line rationale captured
- [ ] New dashboard primitives specced

---

## Day 3 (Wed 2026-05-27) - design/README.md + flesh out spec-only primitives

**Schedule:**

| Time | Task |
|---|---|
| 09:15-10:30 | `design/README.md` |
| 10:45-12:30 | Input / Textarea / Select primitive — fully spec the missing states |
| 13:30-14:30 | Card primitive — define the consumer-facing variant (vs Paper surface) |
| 14:30-15:30 | Badge + Tag primitive |
| 15:30-16:30 | DocumentTabs primitive |

- [ ] **`design/README.md`** (75m). Single landing page linking to `INTENT`, `CONSTRAINTS`, `REFERENCES`, `TOKENS`, `COMPONENTS`, `ADMIN_DASHBOARD`. One-paragraph summary of the design system at the top. Reading order for a new contributor: INTENT → CONSTRAINTS → TOKENS → COMPONENTS → ADMIN_DASHBOARD → REFERENCES (last because it's reference material, not action).
- [ ] **Input / Textarea / Select** (105m). The Day-3 spec in `COMPONENTS.md` is missing `disabled`, `active`, `loading button` states. Fill them. Decide native vs custom Select.
- [ ] **Card** (60m). The Paper surface ships; the Card composite does not. Spec it: header (eyebrow + meta), title, body slot, footer slot, interactive states.
- [ ] **Badge + Tag** (60m). Three variants in `COMPONENTS.md` (tag, pill, solid). Pick the canonical one for each domain (status, urgency, sector). Lock the color map.
- [ ] **DocumentTabs** (60m). Confirm PDF viewer choice (iframe vs link out) before locking the spec.

### Day 3 gate (Designer)

- [ ] `design/README.md` published
- [ ] Four primitives upgraded from spec-only to full spec

---

## Day 4 (Thu 2026-05-28) - Design QA on Vercel preview

**Schedule:**

| Time | Task |
|---|---|
| 09:15-09:30 | Daily sync — confirm preview is up |
| 09:30-11:30 | Design QA walkthrough on mobile DevTools (Slow 3G, CPU 4×) |
| 11:30-12:30 | File issues tagged `design` |
| 13:30-15:30 | Empty / loading / error state primitive — fully spec |
| 15:30-16:30 | Iterate on whatever QA revealed weak in TOKENS or COMPONENTS |

- [ ] **Design QA on preview** (2h). Walk the preview URL with mobile DevTools + Slow 3G. For each surface (`/`, `/feed`, `/feed/submit`, `/signin`, `/library`, `/admin/dashboard`), note every gap between the current UI and the design system in `TOKENS.md` / `COMPONENTS.md`.
- [ ] **File issues** (60m). One GitHub issue per gap, tagged `design`. Include the page + selector + screenshot.
- [ ] **Empty / loading / error states** (2h). Final spec-only primitive from `COMPONENTS.md` §7. Lock the empty-state anatomy, the skeleton shapes, the 404 / 500 / db-not-configured banner copy.
- [ ] **Iterate on docs** (60m). If QA revealed a token or component spec is wrong, update the doc same-day so Week 3 implementation reads from the correct version.

### Day 4 gate (Designer)

- [ ] Design QA pass complete
- [ ] Issues filed
- [ ] All seven primitives in `COMPONENTS.md` now have full specs (not spec-only)

---

## Day 5 (Fri 2026-05-29) - Week 3 implementation plan with Engineer

**Schedule:**

| Time | Task |
|---|---|
| 09:15-11:00 | Buffer for any doc revisions revealed yesterday |
| 11:00-12:30 | Re-render `design/README.md` with all six docs (was five) |
| 13:30-14:30 | Wrap, summarize what was deferred to Week 3 |
| 14:30-15:30 | Week 3 plan with Engineer |
| 15:30-16:30 | Self-review of the whole `design/` folder for inconsistencies |

- [ ] **README refresh** (90m). Add `ADMIN_DASHBOARD.md` and update component status table.
- [ ] **Week 3 plan with Engineer** (60m). Sequence:
  1. Replace ad-hoc Tailwind in `Nav`, `Footer`, sign-in / sign-up / reset pages with primitives.
  2. Build the four spec-only primitives in `src/components/ui/` (Input, Card, Badge, DocumentTabs, Empty/Loading/Error).
  3. Admin dashboard redesign per `ADMIN_DASHBOARD.md`.
  4. Apply tokens consistently across `/feed`, `/library/[slug]`.
- [ ] **Folder self-review** (60m). Read all six `design/*.md` docs end-to-end. Catch any drift between `TOKENS.md` and `tokens.ts`. Catch any contradiction between `INTENT.md` and `COMPONENTS.md`.

### Day 5 gate (Designer)

- [ ] All Week 1 carryover closed
- [ ] All seven primitives have full specs
- [ ] Week 3 implementation order agreed with Engineer
- [ ] `design/` folder internally consistent

---

# End-of-week health check

## Engineer

- [ ] Phase 0 + Phase 1 complete (all accounts, env, schema, Vercel preview, admin user)
- [ ] PRs #1, #2 (or closed), #3 merged
- [ ] All non-phone-OTP sign-in methods confirmed on preview
- [ ] Submission / vote / comment / status fan-out verified on preview
- [ ] Phase 2 seeding + Gaining Traction + filter QA all green
- [ ] Content team has started; first Library entry target date captured

## Designer

- [ ] All seven `design/*.md` docs committed and consistent
- [ ] `design/ADMIN_DASHBOARD.md` ready for Week 3 implementation
- [ ] All seven primitives in `COMPONENTS.md` upgraded to full spec
- [ ] Design QA issues filed against the preview

## Content + ops

- [ ] First Library entry research underway
- [ ] WhatsApp approval status checked; escalate to Twilio if no movement after 4 business days

## Risk register coming out of Week 2

- **Twilio WhatsApp approval** — if not approved by end of Week 2, escalate. SMS-only fallback acceptable per spec; phone OTP work in Week 6 still proceeds.
- **PR #3 merge** — biggest risk this week. If review reveals scope creep, slice further or revert specific commits. Don't block Phase 2 QA on it; the QA can run on `main + PR #3 reverted` if needed.
- **Phase 2 schedule** — originally a full week; this week absorbs only Days 2-5 of it because Day 1 of Phase 2 (submission smoke) doubles as Engineer Day 4 here. If filter QA reveals real bugs, push to Week 3 Day 1.
- **Designer spec depth** — fleshing out four primitives in two days (Day 3 + Day 4) is tight. If only three of four land fully, push the fourth to Week 3 Day 1.

---

## Daily totals at a glance

| Day | Engineer | Designer | Cross-track event |
|---|---|---|---|
| Mon | ~5.5h focused | ~5h focused | - |
| Tue | ~5h focused | ~5.5h focused | - |
| Wed | ~6h focused | ~5h focused | **EOD: Engineer preview live for Designer** |
| Thu | ~5h focused | ~5h focused | **Content kickoff (joint last 15m); Designer QAs preview** |
| Fri | ~5h focused | ~3.5h focused + Week 3 plan | **Week 3 plan together** |

---

*Week 3 = design implementation + admin dashboard redesign + apply tokens everywhere. Then `QA_CHECKLIST.md` in Week 4-5 and `LAUNCH_RUNBOOK.md` for T-7 to launch. The Phase-N labels in `IMPLEMENTATION_PLAN.md` shift right by one week to account for this carryover.*
