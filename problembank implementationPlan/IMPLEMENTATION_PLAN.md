# Problem Bank — Implementation Plan (Junior-Dev Edition)

> This plan is written so a junior developer can pick up any phase and execute without architectural guesswork. Every task lists exact commands, file paths, acceptance criteria, and common pitfalls. Current as of the most recent commit on `christex-foundation/ProblemBankv2` main.

---

## 0. TL;DR

Build the Problem Bank platform at `build.christex.foundation`: a research-backed library of Sierra Leone's unsolved problems + a community feed where people raise and vote on new problems. Spec is `ProblemBank v2.docx` (Concept Note, PRD, Technical Design, 10 user flows, Roadmap). Tech Design is the contract.

- **Repo:** `christex-foundation/ProblemBankv2` (this is the home — not the old hackathon repo).
- **Data layer:** **Supabase Postgres**, accessed via `@supabase/supabase-js` with the service-role key on the server only. No Prisma. No browser-side Supabase. RLS is on; service-role bypasses it.
- **No `/hackathon` route.** The legacy hackathon app stays on its own host and is mapped to `build.christex.foundation/hackathon` at the hosting layer (Cloudflare / Vercel rewrites). The Next.js app in this repo does not know about it.
- **Auth:** NextAuth v5 with four sign-in methods (phone OTP via Twilio Verify, email/password, Google, GitHub). Account merging by email.
- **Other infrastructure:** Cloudinary for files (PDFs, Tiptap images, infographics), Cloudflare Turnstile for bot protection, Resend for password-reset email only.
- **Deadline:** End of June 2026.

---

## 1. How to use this plan

### Daily rhythm
- Each phase = 1 calendar week (Mon–Sun work week).
- Each week is broken into **Day 1–Day 5** tasks. Junior dev picks the next unfinished task.
- Each task has: **Goal → Steps → Acceptance criteria → Common pitfalls**.

### Git workflow
- One branch per task. Naming: `phase{N}/{kebab-task-name}` (e.g. `phase2/submission-form`).
- PRs target `main`. Squash-merge.
- Commit message format: `<phase>: <short imperative>` (e.g. `phase2: add submission form`).
- Never commit `.env*` (already in `.gitignore`).

### Definition of "done" per task
- All acceptance criteria pass locally.
- New code has no `console.log`, no `TODO` without a tracked follow-up, no commented-out blocks.
- TypeScript: zero errors (`npm run typecheck`).
- ESLint: zero errors (`npm run lint`).
- Manual smoke test in browser before opening PR.

### When to ask for help vs. proceed
- If a step says "decide between X and Y" and you have no preference → pick the one listed first ("recommended").
- If a Supabase / Cloudinary / Vercel UI doesn't match the instructions (UIs change), screenshot and ask.
- If a test fails twice with the same error → ask. Don't loop in frustration.

---

## 2. Prerequisites

### On your machine
- **Node** v20.x or v22.x (LTS). Verify: `node -v`
- **npm** ships with Node — no extra install. Verify: `npm -v`. The repo's `.npmrc` enables `legacy-peer-deps` (needed while next-auth v5 beta still peer-depends on Next 14/15).
- **Git** any recent version. Verify: `git --version`
- **gh CLI** (GitHub CLI). Verify: `gh --version`. Login: `gh auth login`
- **VS Code** with extensions:
  - Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
  - ESLint (`dbaeumer.vscode-eslint`)
- A modern Chrome or Edge for DevTools mobile/network throttling.
- **(optional)** Supabase CLI for type generation: `brew install supabase/tap/supabase`

### Accounts you'll need (create or get added to)
| Service | URL | Used for | Owner |
|---|---|---|---|
| GitHub | github.com | Source control, OAuth provider | Christex Foundation org |
| Vercel | vercel.com | Hosting | Christex Foundation team |
| Supabase | supabase.com | Postgres DB | Christex Foundation org |
| Cloudinary | cloudinary.com | Files (PDFs, images, infographics) | Christex Foundation |
| Cloudflare | dash.cloudflare.com | Turnstile + DNS for build.christex.foundation | Christex Foundation |
| Google Cloud | console.cloud.google.com | Google OAuth client | Christex Foundation |
| Twilio | twilio.com | WhatsApp + SMS OTP delivery | Christex Foundation |
| Resend | resend.com | Email (password reset only) | Christex Foundation |

Get added with write access on all of these before starting Day 1.

---

## 3. Glossary

| Term | Meaning |
|---|---|
| **Library entry** | A research-validated, Christex-published problem with 6 PDF docs + optional infographic + optional POC |
| **Submission** | A community-raised problem on the feed, may eventually become a Library entry |
| **POC** | Proof of Concept — a starter kit GitHub repo + live demo URL |
| **Build Registry** | The list of users who clicked "I'm building this" on a Library entry |
| **Gaining Traction** | A *displayed* status computed at query time (votes spread across multiple days). **Never stored in DB.** Computed by the `gaining_traction_ids()` Postgres function. |
| **Tiptap** | Headless rich-text editor we use for submission body + admin problem statement |
| **Deferred upload** | Tiptap images are cached as browser blob URLs and only uploaded to Cloudinary on form submit |
| **Turnstile** | Cloudflare's reCAPTCHA alternative; widget on submission/comment/signup forms |
| **NextAuth** | Auth library; JWT sessions, 4 providers |
| **Service role key** | Supabase admin key. Bypasses RLS. **Server-only.** Never expose to the client. |

---

## 4. Phase 0: External account & service setup (Day 1 of Week 1)

Do this **first thing on Day 1** because Twilio WhatsApp Business approval has a 1–2 week lead time and blocks the phone-OTP work in Week 6.

Store every secret in 1Password / team vault. Don't paste into Slack/email.

### 4.1 Supabase
1. https://supabase.com → New project → name `problem-bank-staging`.
2. Region: `eu-west-2 (London)` (closest to Sierra Leone with strong PoPs).
3. Strong DB password — save it.
4. After provisioning (~2 min): **Project Settings → API** → copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**secret, server-only**)
5. SQL Editor → paste the contents of `supabase/migrations/0001_init.sql` from the repo → Run. Verify the 9 tables appear in the Table Editor.
6. Repeat all of the above for a second project: `problem-bank-prod`.

> **Note:** We do **not** use Supabase Auth. Sessions are owned by NextAuth (JWT). We also do **not** need the anon key — the app server is the only Supabase caller.

### 4.2 Cloudinary
1. https://cloudinary.com → Dashboard → copy `Cloud name`, `API Key`, `API Secret`.
2. Settings → Upload → Add upload preset:
   - Name: `problem_bank_unsigned`
   - Signing mode: **Unsigned**
   - Folder: `problem-bank`
   - Save.

### 4.3 Cloudflare Turnstile
1. Cloudflare dashboard → Turnstile → Add site → `build.christex.foundation`.
2. Widget mode: **Managed**.
3. Hostnames: `build.christex.foundation`, `localhost`, `*.vercel.app`.
4. Copy `Site key` and `Secret key`.

### 4.4 Google OAuth
1. https://console.cloud.google.com → project `Problem Bank`.
2. APIs & Services → OAuth consent screen → External → fill app name, support email, logo.
3. Credentials → Create credentials → OAuth client ID → Web application.
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://build.christex.foundation/api/auth/callback/google`
   - (add Vercel preview URLs after the first deploy)
5. Copy Client ID + Secret.

### 4.5 GitHub OAuth
1. Org settings → Developer settings → OAuth Apps → New OAuth App.
2. Name: `Problem Bank`. Homepage URL: `https://build.christex.foundation`.
3. Authorization callback URL: `https://build.christex.foundation/api/auth/callback/github`. After creation, add localhost as a second callback.
4. Copy Client ID + Secret.

### 4.6 Twilio Verify (phone OTP)
1. Console → Verify → Services → Create → `Problem Bank`. Enable SMS + WhatsApp.
2. Copy `Account SID`, `Auth Token`, `Verify Service SID`.
3. **WhatsApp approval (slow step):** Messaging → Senders → WhatsApp senders → Request a new number. Submit Meta WhatsApp Business approval **today**. SMS works immediately while WhatsApp pending.

### 4.7 Resend
1. https://resend.com → API Keys → create.
2. Domains → add `christex.foundation` → verify Cloudflare DNS records.
3. Copy API key.

### 4.8 Vercel
Done after Phase 1 when the repo is scaffolded. You'll connect the project then.

### 4.9 Capture in `.env.local`
Use this template (also in `.env.local.example`):

```bash
# NextAuth
NEXTAUTH_SECRET=                     # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Supabase (server-only — service-role bypasses RLS)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=problem_bank_unsigned

# Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Twilio (phone OTP)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SID=

# Email (password reset only)
RESEND_API_KEY=
EMAIL_FROM=noreply@christex.foundation

# GitHub API (optional — raises public rate limit)
GITHUB_API_TOKEN=

# Public base URL (used by the badge snippet)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 5. Stack reference

| Layer | Choice | Package |
|---|---|---|
| Framework | Next.js 16 (App Router, React 19) | `next@16` |
| Database | Supabase Postgres | (managed) |
| DB client | `@supabase/supabase-js` v2 | `@supabase/supabase-js` |
| Auth | NextAuth.js v5 (Auth.js beta) | `next-auth@beta` |
| Rich text | Tiptap | `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link` |
| Files | Cloudinary | `next-cloudinary`, `cloudinary` |
| Bot protection | Cloudflare Turnstile | `@marsidev/react-turnstile` |
| OTP | Twilio Verify | `twilio` |
| Email | Resend | `resend` |
| Toasts | Sonner | `sonner` |
| Hashing | bcryptjs | `bcryptjs` |
| JWT (reset) | jose | `jose` |
| Input validation | Zod | `zod` |
| Date math | date-fns | `date-fns` |
| Hosting | Vercel | (managed) |

No Prisma, no ORM. No browser-side Supabase. The legacy hackathon app does not run inside this repo.

---

## 6. Application structure (target)

```
src/
├── app/
│   ├── layout.tsx                            ← root: fonts, SessionProvider, Toaster, Footer
│   ├── globals.css
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── (public)/                             ← Problem Bank pages with ProblemBankNav layout
│   │   ├── layout.tsx                        ← nav + bell + sign-in
│   │   ├── page.tsx                          ← Library grid
│   │   ├── feed/page.tsx
│   │   ├── feed/[id]/page.tsx
│   │   ├── feed/submit/page.tsx
│   │   ├── library/[slug]/page.tsx
│   │   ├── builders/[id]/page.tsx
│   │   └── notifications/page.tsx
│   ├── (auth)/
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── reset/page.tsx
│   │   └── reset/confirm/page.tsx
│   ├── admin/                                ← URL: /admin/*
│   │   ├── layout.tsx                        ← role guard
│   │   ├── dashboard/page.tsx
│   │   ├── submissions/page.tsx
│   │   ├── library/page.tsx
│   │   ├── library/new/page.tsx
│   │   └── library/[id]/edit/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── auth/otp/send/route.ts
│       ├── auth/email-signup/route.ts
│       ├── auth/reset/{request,confirm}/route.ts
│       ├── submissions/route.ts
│       ├── submissions/[id]/{vote,comments}/route.ts
│       ├── library/[id]/build-registry/route.ts
│       ├── github/activity/route.ts          ← cached 24h
│       ├── badge/[slug]/route.ts             ← dynamic SVG + ping
│       ├── notifications/route.ts
│       ├── admin/library/route.ts
│       ├── admin/submissions/[id]/status/route.ts
│       ├── me/{votes,profile}/route.ts
│       ├── cloudinary/sign/route.ts          ← signed upload signature
│       └── health/route.ts
├── components/
│   ├── ProblemBankNav.tsx                    ← global top nav
│   ├── NotificationsBell.tsx
│   ├── SessionProviderWrapper.tsx
│   ├── Footer.tsx
│   ├── auth/{PhoneOtpForm,EmailPasswordForm}.tsx
│   ├── feed/{FeedCard,SubmissionForm,VoteButton,CommentThread}.tsx
│   ├── library/{DocumentTabs,BuildRegistry,BuilderRepoActivity}.tsx
│   ├── builders/BuilderProfileEditor.tsx
│   ├── admin/{StatusUpdater,EntryForm,DocumentUploader}.tsx
│   ├── editor/TiptapEditor.tsx
│   └── index.ts
├── lib/
│   ├── supabase.ts                           ← server-only singleton
│   ├── auth.ts                               ← NextAuth config, 4 providers
│   ├── cloudinary-client.ts                  ← Tiptap deferred upload helper
│   ├── enums.ts                              ← status, urgency, sector, doc type, limits
│   ├── feed.ts                               ← Gaining Traction RPC wrapper
│   ├── github.ts                             ← parse repo URL, fetch pushed_at
│   ├── badge.ts                              ← SVG generator
│   ├── notifications.ts                      ← create notifications on events
│   ├── turnstile.ts                          ← verify token server-side
│   └── twilio.ts                             ← OTP send / check wrappers
├── types/
│   └── database.ts                           ← hand-written row types
supabase/
└── migrations/
    └── 0001_init.sql                         ← single source of truth schema
```

---

## 7. Data model

The schema is defined once in `supabase/migrations/0001_init.sql`. Nine tables, five enums, one RPC, RLS enabled.

Tables (PascalCase identifiers, camelCase columns — quoted in SQL, plain in app code):

1. **User** — `id, email?, phone?, passwordHash?, name?, bio?, githubUrl?, contactEmail?, websiteUrl?, role, createdAt, updatedAt`
2. **Submission** — `id, userId, title, description, potentialSolution?, urgency, category, status, voteCount, commentCount, libraryEntryId?, createdAt`
3. **Vote** — `id, userId, submissionId, votedAt` (unique on `userId,submissionId`)
4. **Comment** — `id, userId, submissionId, content, createdAt`
5. **LibraryEntry** — `id, slug, title, problemStatement, sector, urgency, kitUrl?, demoUrl?, infographicUrl?, publishedAt?, createdBy, badgeFetchCount, createdAt, updatedAt`
6. **Document** — `id, libraryEntryId, docType, cloudinaryUrl, fileName, uploadedAt` (unique on `libraryEntryId,docType`)
7. **BuildRegistry** — `id, userId, libraryEntryId, repoUrl?, registeredAt` (unique on `userId,libraryEntryId`)
8. **BadgePing** — `id, libraryEntryId, pingedAt`
9. **Notification** — `id, userId, type, title, body, link?, read, createdAt`

Enums: `UserRole`, `SubmissionStatus` (no `gaining_traction` — it's computed), `Urgency`, `DocType`, `NotificationType`.

RPC: `gaining_traction_ids(window_days, min_distinct_days) RETURNS TABLE("submissionId" TEXT)` — used by `src/lib/feed.ts`.

Row types in TypeScript mirror this in `src/types/database.ts`.

To apply the schema on a new Supabase project: open the SQL Editor, paste `supabase/migrations/0001_init.sql`, run. Done.

---

## 8. Phase-by-phase implementation

> Dates assume Day 1 = first work day of the week. Skip weekends; if a task slips, push the rest of the week's tasks down a day.

---

## PHASE 1 — Project setup (Week 1)

**Goal:** A working repo with the schema migrated to staging Supabase, NextAuth scaffolded with Google + GitHub, deployed to Vercel preview, OTP provider approval submitted.

**Phase gate criteria:**
- [ ] `npm run dev` boots without errors
- [ ] Staging Supabase has all 9 tables
- [ ] Google + GitHub sign-in works on Vercel preview, creates a `User` row
- [ ] Twilio WhatsApp approval submitted (don't wait for it)

### Day 1 — Phase 0 + clone

**Task 1.1: Run through Phase 0 (§4)** — 3–4 hours.

**Task 1.2: Clone the repo**
```bash
gh repo clone christex-foundation/ProblemBankv2
cd ProblemBankv2
npm install
```

**Task 1.3: Set up `.env.local`**
Copy `.env.local.example` → `.env.local`, fill in the staging Supabase + OAuth values. Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`.

**Task 1.4: Apply the schema**
- Open the staging Supabase project → SQL Editor → New query.
- Paste the contents of `supabase/migrations/0001_init.sql`. Run.
- Verify in Table Editor: all 9 tables exist.

**Acceptance:** `npm run dev` runs. Visit `localhost:3000` — Library grid loads (empty: "Entries coming soon"). `/feed` shows "No submissions yet."

**Pitfall:** If the homepage shows the yellow "Database not configured" banner, your `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is empty or wrong. Re-check.

### Day 2 — Auth smoke test

**Task 1.5: Sign in with Google**
- Visit `/signin` → Google · GitHub tab → Continue with Google → consent.
- Check Supabase Table Editor → `User` table has one row with your email.

**Task 1.6: Sign in with GitHub**
- Sign out.
- Sign in with GitHub.
- Check `User` table: still one row (matched by email), `githubUrl` populated.

**Task 1.7: Promote yourself to admin**
- SQL Editor: `UPDATE "User" SET role = 'admin' WHERE email = 'you@christex.foundation';`
- Sign out and back in.
- Visit `/admin/dashboard` — should load instead of redirecting.

### Day 3 — Vercel preview

**Task 1.8: Connect repo to Vercel**
- Vercel → Add New → Project → import `christex-foundation/ProblemBankv2`.
- Framework preset: Next.js (auto-detected).
- Build command: `npm run build`. Install: `npm install`.
- Don't deploy yet — go to Environment Variables.

**Task 1.9: Set env vars in Vercel**
- Copy every variable from `.env.local.example` into Vercel Settings → Environment Variables.
- For Preview + Production scopes:
  - `NEXTAUTH_URL`: leave blank for Preview (Vercel sets it from `VERCEL_URL`); set to `https://build.christex.foundation` for Production.
  - All others: same values for now (use staging Supabase across both until prod is ready).

**Task 1.10: First deploy**
- `git push origin main` (you have nothing to push yet — but Vercel triggers on any push).
- Wait for build. Get a `https://<project>.vercel.app` URL.

**Task 1.11: Update OAuth callback URLs**
- Add the Vercel preview URL to Google + GitHub authorized callbacks.
- Smoke test sign-in on the deployed URL.

### Day 4–5 — Catch up + content kickoff

- Christex content team starts producing the first Library entry's 6 PDFs.
- Engineering can use these days to read through the repo and `src/lib/` files.

### Phase 1 gate
- All Phase 0 services set up
- Schema migrated to staging Supabase
- Google + GitHub working locally + on Vercel preview
- Twilio WhatsApp approval submitted

---

## PHASE 2 — Community feed & submissions (Week 2)

**Goal:** Signed-in users can submit problems with rich text + images. Feed renders with sort/filter. Gaining Traction status displays dynamically.

**Phase gate criteria:**
- [ ] Signed-in user submits a problem with inline image → image lands in Cloudinary → submission appears on `/feed`
- [ ] Sort by votes / recent / urgency works
- [ ] Filter by category, urgency, status works
- [ ] Gaining Traction displays for submissions with votes spread across ≥ 3 days in last 14
- [ ] Turnstile blocks submissions without a valid token

### What's already done
The form, API, feed page, and Gaining Traction RPC are in the repo. Day-by-day work in this phase is verifying it all hooks up cleanly to your staging Supabase + filling content gaps.

### Day 1 — Submission smoke test
- Visit `/feed/submit` → fill title, description (with inline image), submit.
- Verify in Supabase: a `Submission` row exists. The Cloudinary URL in `description` is reachable.
- Visit `/feed` → submission appears.

### Day 2 — Seed test data
Use the SQL editor to seed a handful of submissions across statuses, categories, urgencies, then test filters:
```sql
-- Pick your admin's id
SELECT id FROM "User" WHERE email = 'you@christex.foundation';

-- Insert 3 submissions for testing
INSERT INTO "Submission" ("userId", "title", "description", "urgency", "category")
VALUES
  ('<admin-id>', 'Cold-chain vaccines in Bonthe', '<p>...</p>', 'high', 'Health'),
  ('<admin-id>', 'Fertilizer authenticity in Kambia', '<p>...</p>', 'medium', 'Agriculture'),
  ('<admin-id>', 'Trades training certification in Pujehun', '<p>...</p>', 'high', 'Education');
```

### Day 3 — Gaining Traction verification
Seed votes across multiple days for one submission, then reload feed and confirm the status displays "Gaining Traction":
```sql
INSERT INTO "Vote" ("userId", "submissionId", "votedAt")
SELECT '<another-user-id>', '<submission-id>', now() - (i || ' days')::interval
FROM generate_series(0, 4) i;
```
This generates 5 votes across 5 different days → triggers the `gaining_traction_ids()` threshold.

### Day 4 — Filter QA
Test every filter combination:
- `/feed?sort=votes&category=Health` → only Health, by votes.
- `/feed?sort=recent` → by createdAt desc.
- `/feed?sort=urgency` → critical first.
- `/feed?status=under_review` → only Under Review.

### Day 5 — Submission edge cases
- Empty description → submit button disabled.
- Title > 80 chars → input stops at 80, no truncation needed.
- Network interruption mid-Cloudinary upload → form preserves text; user can retry.

---

## PHASE 3 — Voting, unvote, comments (Week 3)

**Goal:** Voting rules (3/week ISO, 5-min unvote) work end-to-end. Comments open/close based on submission status.

**Phase gate criteria:**
- [ ] 1st–3rd vote/week succeed; 4th blocked with toast
- [ ] Unvote within 5 min succeeds; after 5 min blocked
- [ ] Voting disabled UI on `live` / `not_viable`
- [ ] Comments work on `submitted` and computed `gaining_traction` only
- [ ] Changing status to `under_review` in admin causes comment input to disappear
- [ ] Votes-exhausted toast shows on the 3rd vote

### What's already done
`/api/submissions/[id]/vote` (POST + DELETE) and `/api/submissions/[id]/comments` are in the repo with VoteButton + CommentThread components.

### Day 1–2 — Vote QA
- Cast 3 votes from one account across 3 different submissions → 4th fails with toast.
- Unvote within 5 min → succeeds, returns to budget.
- Manually push a `votedAt` into the past:
  ```sql
  UPDATE "Vote" SET "votedAt" = now() - interval '6 minutes' WHERE id = '<vote-id>';
  ```
  Reload, try unvote → blocked.
- Sign out, click vote → redirected to `/signin?callbackUrl=...`.

### Day 3 — Comments QA
- Comment on a `submitted` problem → appears immediately, count increments.
- Admin (you) change status to `under_review` in `/admin/submissions` → reload submission page → input gone, existing comments still visible.
- Verify Turnstile required before posting.

### Day 4–5 — Notification fan-out
- Change a submission's status → check Notification rows for submitter + every prior distinct commenter.
- Post a new comment as a different user → original submitter + earlier commenters get notifications. The new commenter does not.

---

## PHASE 4 — Library, Build Registry, Badge (Week 4)

**Goal:** Public Library grid + entry detail, Build Registry, GitHub activity, badge SVG.

**Phase gate criteria:**
- [ ] `/` shows Library grid filterable by sector + urgency
- [ ] `/library/[slug]` renders entry with 6 document tabs, optional infographic, POC, Build Registry
- [ ] Signed-in user clicks "I'm building this" → registered → sees Kit/Demo/badge snippet/repo field
- [ ] Adding a public GitHub repo URL shows `lastPushedAt` on the builder card
- [ ] `/api/badge/[slug]` returns SVG, increments `badgeFetchCount`, creates `BadgePing`
- [ ] `/builders/[id]` shows public profile + edit form for owner

### Day 1 — Seed a Library entry
```sql
-- Capture your admin id first
INSERT INTO "LibraryEntry"
  ("slug", "title", "problemStatement", "sector", "urgency",
   "kitUrl", "demoUrl", "publishedAt", "createdBy")
VALUES
  ('cold-chain-bonthe',
   'Cold-chain logistics for vaccines in Bonthe District',
   '<p>Vaccines often spoil due to inconsistent refrigeration.</p>',
   'Health', 'high',
   'https://github.com/christexfoundation/cold-chain-starter',
   'https://cold-chain-demo.vercel.app',
   now(), '<admin-id>');

-- Document rows (all 6 types) — replace cloudinaryUrl with real PDFs
INSERT INTO "Document" ("libraryEntryId", "docType", "cloudinaryUrl", "fileName")
SELECT id, unnest(enum_range(NULL::"DocType")),
       'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
       'sample.pdf'
FROM "LibraryEntry" WHERE slug = 'cold-chain-bonthe';
```

### Day 2 — Build Registry & GitHub activity
- Sign in → `/library/cold-chain-bonthe` → click "I'm building this" → registered.
- Add a real public GitHub repo URL → reload → `BuilderRepoActivity` should fetch and show "Last push: …".
- Add a private or 404 repo URL → no activity shown, no visible error.

### Day 3 — Badge
- `curl http://localhost:3000/api/badge/cold-chain-bonthe` → SVG returned.
- Supabase: `SELECT * FROM "BadgePing" ORDER BY "pingedAt" DESC LIMIT 5;` → row created.
- `SELECT "badgeFetchCount" FROM "LibraryEntry" WHERE slug = 'cold-chain-bonthe';` → count incremented.

### Day 4–5 — Profile + accessibility
- `/builders/<your-user-id>` → public view, no contact section if you have no contact details.
- Edit name, bio (160 char counter), email, github, website → saves.
- Run Lighthouse on `/library/cold-chain-bonthe` → fix any contrast / alt text flags.

---

## PHASE 5 — Admin CMS (Week 5)

**Goal:** Christex Foundation team can manage submissions and create/publish Library entries through the UI.

**Phase gate criteria:**
- [ ] Non-admin visiting `/admin/*` redirects to `/`
- [ ] Dashboard shows submission counts by status, recent entries, badge engagement
- [ ] Admin can change a submission's status → notifications created
- [ ] Admin can create a Library entry: title, slug, Tiptap problem statement, sector, urgency, 6 PDF uploads, optional infographic HTML, kit + demo URLs, link to a submission, draft / publish
- [ ] Edit existing entry works, including unpublish (save as draft)

### What's already done
Admin layout with role guard, dashboard, submissions table, library list / new / edit pages, `EntryForm`, `DocumentUploader` (with Cloudinary signed upload + progress) are all in the repo.

### Day 1 — Dashboard QA
- `/admin/dashboard` → counts match what's in DB.
- Click a status pill → drills into `/admin/submissions?status=<x>`.
- Recent entries section lists your published + draft entries.

### Day 2 — Submissions management
- Change a submission's status via the dropdown → confirm pop-up → Notification rows appear in DB.
- Reload feed → status badge reflects the change.

### Day 3 — Create a Library entry
- `/admin/library/new` → fill the form, upload 6 real PDFs (one per tab), optional infographic HTML.
- Click "Save draft" → entry appears in `/admin/library` as Draft.
- Click "Publish" → entry appears in public `/`.

### Day 4 — Edit + unpublish
- `/admin/library/[id]/edit` → all fields populate.
- Change problem statement, replace a PDF → save → reflected on the public page.
- Save as draft → entry disappears from public `/`.

### Day 5 — Link submission → entry
- Create an entry while selecting a linked submission from the dropdown.
- Change the submission's status to `live` in `/admin/submissions` → submitter notification includes the Library entry link.

---

## PHASE 6 — Phone OTP, account merging, notifications UI (Week 6)

**Goal:** All 4 sign-in methods work end-to-end. Notifications surface in the UI.

**Phase gate criteria:**
- [ ] Phone OTP via WhatsApp AND SMS works
- [ ] Account merging: email signup, then Google sign-in with same email → one user row
- [ ] Bell shows correct unread count, dropdown shows 3 latest, Mark All Read works
- [ ] `/notifications` page shows full history
- [ ] Email-only signup with password works; password reset via Resend works

### What's already done
`/api/auth/otp/send`, NextAuth `phone-otp` + `email-password` credentials providers (with 3-attempt lockout), `/api/auth/email-signup`, `/api/auth/reset/{request,confirm}`, sign-in/sign-up/reset pages, notifications bell + page are all in the repo.

### Day 1 — Phone OTP end-to-end
- Twilio WhatsApp must be approved by now (or fall back to SMS).
- `/signup` → Phone tab → real SL number (`+232...`) → WhatsApp → enter code → signed in.
- Repeat with SMS channel.
- Wrong code 3× → lockout for 15 min.

### Day 2 — Email + reset
- `/signup` → Email tab → name + email + password ≥ 8 → account created, auto-signed-in.
- Sign out → `/signin` → Email tab → same credentials → signed in.
- `/reset` → enter email → check inbox (Resend logs in their dashboard) → click link → set new password → sign in.

### Day 3 — Account merging
- Sign up with email `test@example.com`.
- Sign out → sign in with Google using same email.
- Supabase: confirm only one `User` row with that email.

### Day 4 — Notifications UI
- Have a second account post a comment on your submission.
- Your bell shows badge `1`.
- Click bell → dropdown shows the comment notification.
- Click it → marked read → badge decrements → navigated to the submission.
- `/notifications` shows full history.

### Day 5 — Edge cases
- Self-comment doesn't generate a notification to self.
- Lockout clears after 15 min — wait or restart the dev server.
- Phone OTP without Twilio configured returns 503 with a friendly message.

---

## PHASE 7 — QA, hardening, launch (Week 7)

**Goal:** Production-ready. First Library entry published. Public launch.

### What's already done
`robots.ts`, `sitemap.ts`, `not-found.tsx`, `error.tsx`, `global-error.tsx`, `/api/health` are in the repo. Library entry pages emit OG metadata via `generateMetadata`.

### Day 1 — Full QA pass
Walk `QA_CHECKLIST.md` from the repo. Every flow.

### Day 2 — Mobile + 3G + accessibility
- DevTools → Slow 3G → reload `/feed` → first paint < 3s.
- CPU 4× slowdown + Slow 3G → submission form responsive.
- Lighthouse on `/`, `/feed`, `/library/[slug]` → ≥ 90 on Performance, A11y, Best practices, SEO.
- Test on a real low-end Android if available.

### Day 3 — Edge cases
- GitHub API: private repo → silent; invalid URL → rejected at form level; 404 repo → silent; rate-limited → cached / no crash.
- Gaining Traction: seed 5 votes on same day → status stays "Submitted". Spread across 3 days → "Gaining Traction".
- Infographic iframe across desktop + mobile.

### Day 4 — Production wiring
- Create `problem-bank-prod` Supabase if not done. Run `0001_init.sql`.
- Vercel → set all production env vars to point to prod Supabase.
- Cloudflare DNS: `build.christex.foundation` CNAME → Vercel.
- Vercel → Settings → Domains → add `build.christex.foundation`.
- Update `NEXTAUTH_URL` + `NEXT_PUBLIC_BASE_URL` to `https://build.christex.foundation`.
- Update OAuth callback URLs to include the production domain.
- (optional) Sentry: install `@sentry/nextjs`, wire `SENTRY_DSN`.

### Day 5 — Launch
- Admin signs in on prod → promote to admin in prod DB:
  ```sql
  UPDATE "User" SET role = 'admin' WHERE email = 'admin@christex.foundation';
  ```
- `/admin/library/new` → publish the first Library entry.
- Smoke test on prod from a fresh incognito browser.
- Announce.

---

## 9. Code patterns reference

### 9.1 Server-side auth guard (pages)
```ts
const session = await auth();
if (!session?.user) redirect('/signin');
if (session.user.role !== 'admin') redirect('/');
```

### 9.2 Server-side auth guard (API routes)
```ts
const session = await auth();
if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const userId = session.user.id;
```

### 9.3 Input validation with Zod
```ts
const Schema = z.object({ title: z.string().min(1).max(80) });
const parsed = Schema.safeParse(await req.json());
if (!parsed.success) {
  return NextResponse.json({ error: 'Invalid', issues: parsed.error.issues }, { status: 400 });
}
```

### 9.4 Supabase select with join
```ts
const { data } = await getSupabase()
  .from('Submission')
  .select('*, user:User(id, name)')
  .eq('status', 'submitted')
  .order('voteCount', { ascending: false })
  .limit(50);
```

### 9.5 Supabase insert + update (note the `as never` cast)
```ts
// Insert and return the row
const { data, error } = (await getSupabase()
  .from('Submission')
  .insert({ userId, title, description, urgency, category } as never)
  .select('*')) as { data: SubmissionRow[] | null; error: unknown };

// Update by predicate
await getSupabase()
  .from('Submission')
  .update({ voteCount: nextCount } as never)
  .eq('id', submissionId);
```
> Why `as never`: supabase-js v2 defaults its Insert/Update generics to `never` when no `Database` type is supplied. We chose not to pass a `Database` type because the matching shape it expects is fiddly and brittle. The cast is the deliberate trade-off — keep the row types in `@/types/database` for editor support on reads.

### 9.6 Supabase RPC (Gaining Traction)
```ts
const { data } = await getSupabase().rpc('gaining_traction_ids', {
  window_days: 14,
  min_distinct_days: 3,
});
const ids = (data ?? []) as { submissionId: string }[];
```

### 9.7 Optimistic UI pattern
```tsx
const [count, setCount] = useState(initial);
setCount((c) => c + 1);                      // optimistic
const res = await fetch(...);
if (!res.ok) setCount((c) => c - 1);         // revert
```

### 9.8 Cached GitHub fetch
```ts
const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
  next: { revalidate: 86400 },               // 24h
});
```

---

## 10. Environment variables — complete reference

| Key | Local | Vercel Preview | Vercel Prod | Notes |
|---|---|---|---|---|
| `NEXTAUTH_SECRET` | ✓ | ✓ | ✓ | `openssl rand -base64 32`. Different value per environment is fine; same within an env. |
| `NEXTAUTH_URL` | `http://localhost:3000` | (auto from VERCEL_URL) | `https://build.christex.foundation` |
| `SUPABASE_URL` | staging | staging | prod | Server-only |
| `SUPABASE_SERVICE_ROLE_KEY` | staging | staging | prod | **Secret. Server-only.** |
| `GOOGLE_CLIENT_ID` / `_SECRET` | ✓ | ✓ | ✓ |
| `GITHUB_CLIENT_ID` / `_SECRET` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✓ | ✓ | ✓ |
| `CLOUDINARY_API_KEY` / `_SECRET` | ✓ | ✓ | ✓ | Secret on Secret |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `problem_bank_unsigned` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | ✓ | ✓ | ✓ |
| `TURNSTILE_SECRET_KEY` | ✓ | ✓ | ✓ | Secret |
| `TWILIO_ACCOUNT_SID` / `_AUTH_TOKEN` / `_VERIFY_SID` | ✓ | ✓ | ✓ | Auth Token + Verify SID are secrets |
| `RESEND_API_KEY` | ✓ | ✓ | ✓ | Secret |
| `EMAIL_FROM` | `noreply@christex.foundation` |
| `GITHUB_API_TOKEN` | optional | optional | optional | Raises public rate limit |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | (auto) | `https://build.christex.foundation` |
| `SENTRY_DSN` | optional | ✓ | ✓ | Add when wiring Sentry |

We **don't** need `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the browser never talks to Supabase.

---

## 11. Common pitfalls

| Problem | Cause | Fix |
|---|---|---|
| Homepage shows yellow "Database not configured" | `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` empty | Fill in `.env.local`; restart dev server |
| `Supabase not configured` thrown at runtime | Same env vars missing in production | Set both in Vercel → Environment Variables → Production |
| `as never` cast linted away by an editor refactor | Auto-removed unsafe casts | Restore the cast — it's intentional. supabase-js v2 needs it |
| Insert returns `data: null` even though row was created | You forgot `.select('*')` after `.insert(...)` | `await supabase.from('X').insert(...).select('*')` |
| `gaining_traction_ids` RPC errors | Function not in this project's DB | Re-run `supabase/migrations/0001_init.sql` |
| RLS denies a query | Service-role key not set; you're using anon | Set `SUPABASE_SERVICE_ROLE_KEY` for the server; ensure `src/lib/supabase.ts` is using `getSupabase()`, not a freshly-made client |
| Importing `@/lib/supabase` in a Client Component fails to build | `server-only` import boundary | Move the query to a Server Component or API route; pass data down |
| `Configuration` error on NextAuth sign-in | `NEXTAUTH_SECRET` or `NEXTAUTH_URL` missing | Set both |
| OAuth redirect mismatch | Callback URL not registered in Google / GitHub | Add the exact URL (including `/api/auth/callback/<provider>`) |
| Tiptap images broken after submit | Forgot to call `uploadTiptapImages` before POSTing | Always upload before sending HTML |
| Hydration error on TiptapEditor | SSR mismatch | `immediatelyRender: false` is already set; don't remove |
| Turnstile widget always-invalid | Token reused | The component re-mounts on each submission; if you customise, ensure fresh token per submit |
| Twilio WhatsApp message not arriving | Sender not approved yet | Wait for Meta approval; SMS as fallback |
| Cloudinary "Invalid signature" | `folder` param differs between sign and upload | Use the same `folder` in both calls |
| Vote count drifts | Concurrent writes without serialisation | We currently do read-then-update. If contention shows up, move to a Postgres function or `UPDATE … SET voteCount = voteCount + 1 RETURNING` |
| Sitemap.xml is empty in production | DB query failed during build | Sitemap gracefully returns static-only routes on error; fix `SUPABASE_URL` in prod and redeploy |

---

## 12. Risks & open decisions

1. **WhatsApp Business API approval** — 1–2 week lead time, can block Week 6. Mitigation: submit Week 1 Day 1; SMS-only fallback acceptable per spec.
2. **Christex content production** — first Library entry's 6 PDFs + optional infographic + POC must be ready by Week 7 for launch.
3. **Tiptap deferred Cloudinary upload** — non-standard pattern; budget extra QA in Week 2.
4. **Admin CMS scope** — biggest single feature. If Week 5 slips, cut the "preview" mode (draft → publish is core).
5. **6.5-week timeline** is tight. The "Walk" phase (keyword search, multi-filter, weekly digest) stays deferred to post-launch.
6. **`as never` casts on writes** — a deliberate trade-off vs. fighting supabase-js generics. Acceptable; revisit if we generate types via `supabase gen types`.
7. **Service-role key on the server** — bypasses RLS. Acceptable because every API route authenticates the caller via NextAuth before touching the DB. If anon access is ever needed, add RLS policies to the affected tables in a new migration.
8. **Hackathon at `/hackathon`** — handled by the hosting layer, not by this Next.js app. If the hosting rewrite changes, this app doesn't care.

---

## 13. Verification — end-to-end smoke

After each phase gate, run from repo root:

```bash
# Local
npm install
npm run dev

# (in another shell)
npm run typecheck
npm run lint
```

Manual smoke flows in the browser (`localhost:3000`):

1. `/` — Library grid
2. `/feed` — Community feed
3. `/signin` — All 4 methods
4. `/admin/dashboard` (signed in as admin)
5. `/api/health` (curl) — should return `{ ok: true }` once all env vars are filled

**Launch gate (end of June 2026):**
- All 10 user flows pass in production
- ≥ 1 Library entry published
- `https://build.christex.foundation` live and TLS-clean
- `/api/health` returns 200 in production
- Twilio WhatsApp + SMS both working OR SMS-only confirmed acceptable
- Admin team trained on the CMS

---

*Document lives in this folder alongside `PHASE_0_CHECKLIST.md`, `QA_CHECKLIST.md`, and `LAUNCH_RUNBOOK.md` in the repo root. Update as scope or decisions change.*
