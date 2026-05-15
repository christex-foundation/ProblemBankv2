# Problem Bank

A research-backed intelligence platform for Sierra Leone's most important unsolved problems. Read, download, build.

Owned and operated by **Christex Foundation**. Deployed at [build.christex.foundation](https://build.christex.foundation).

## What's in here

Two surfaces in one Next.js app:

- **Library** — fully researched, Christex-published problem entries with six PDF documents, an optional infographic, an optional Proof of Concept, and a Build Registry of people working on each problem.
- **Community feed** — anyone can raise a problem they experience in Sierra Leone and suggest what could be done. The community votes (3 per week, 5-minute unvote window). High-signal problems inform what Christex researches next.

The legacy hackathon app is hosted separately and mapped to `/hackathon` at the hosting layer; this repo does not include it.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Database | Supabase Postgres (`@supabase/supabase-js`, service-role on the server only) |
| Auth | NextAuth.js v5 — phone OTP, email/password, Google, GitHub |
| Rich text | Tiptap with deferred Cloudinary image upload |
| Files | Cloudinary (PDFs, images, infographic HTML) |
| Bot protection | Cloudflare Turnstile |
| OTP delivery | Twilio Verify (WhatsApp + SMS) |
| Email | Resend (password reset only) |
| Hosting | Vercel |

No Prisma. No browser-side Supabase. No ORM.

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Fill in .env.local with real values from your Supabase + OAuth + Cloudinary + Turnstile setup.

# Apply the schema to your Supabase project:
# Supabase dashboard → SQL Editor → paste contents of supabase/migrations/0001_init.sql → Run.

npm run dev
# Open http://localhost:3000
```

Until `.env.local` is filled, DB-backed pages show a "Database not configured" banner instead of crashing.

## Becoming an admin

After signing in once, promote yourself via Supabase SQL Editor:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'you@christex.foundation';
```

Sign out and back in so the JWT picks up the new role, then visit `/admin/dashboard`.

## Scripts

```bash
npm run dev        # Next.js dev server (Turbopack)
npm run build      # Production build
npm start          # Run the built app
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run db:types   # (optional) regenerate src/types/database.types.ts from Supabase
```

`.npmrc` sets `legacy-peer-deps=true` because next-auth v5 beta still
peer-depends on Next 14/15 while we run Next 16. Remove the flag once
next-auth's stable release lands.

## Project structure

```
src/
├── app/
│   ├── (public)/        ← Library grid, /feed, /library/[slug], /builders/[id], /notifications
│   ├── (auth)/          ← /signin, /signup, /reset, /reset/confirm
│   ├── admin/           ← /admin/* — role-guarded
│   ├── api/             ← submissions, votes, comments, build-registry, badge, notifications, admin/*
│   ├── layout.tsx, robots.ts, sitemap.ts, not-found.tsx, error.tsx, global-error.tsx
├── components/          ← Problem Bank-specific UI
├── lib/                 ← supabase.ts, auth.ts, feed.ts, notifications.ts, github.ts, badge.ts, twilio.ts, turnstile.ts, cloudinary-client.ts, enums.ts
└── types/database.ts    ← hand-written row types matching supabase/migrations/0001_init.sql

supabase/
└── migrations/0001_init.sql   ← single source of truth schema
```

## Environment variables

See `.env.local.example` for the full list. The Supabase block is intentionally minimal — server-only, service-role:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

We **don't** need `NEXT_PUBLIC_SUPABASE_*` because the browser never talks to Supabase directly. Every read and write goes through API routes or server components that have already authenticated the caller via NextAuth.

## Pre-launch + launch

- `QA_CHECKLIST.md` — full QA pass across the 10 user flows plus performance, accessibility, and security.
- `LAUNCH_RUNBOOK.md` — T-7 / T-3 / T-1 / launch day / rollback / post-launch checklist.

## License

Owned by Christex Foundation. Contact [eng@christex.foundation](mailto:eng@christex.foundation).
