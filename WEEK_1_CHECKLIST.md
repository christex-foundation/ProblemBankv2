# Week 1 — Daily checklist

Goal by end of week: `.env.local` filled with real values, all OAuth + Cloudinary + Turnstile + Resend connected, schema applied to staging Supabase, Twilio WhatsApp approval submitted, you signed in as admin, every non-phone-OTP flow working locally.

Tick boxes as you go. Each task lists rough time + the "done" signal.

---

## Day 1 (Mon) — Critical path: Twilio + Supabase + Google

### Morning (≈2.5 h)

- [ ] **Submit Twilio WhatsApp Business approval — do this FIRST** *(30 min)*
  - Twilio Console → Messaging → Senders → WhatsApp senders → Request new number.
  - Follow Meta WhatsApp Business approval flow. Provide business name, logo, sample messages.
  - **Done when:** Twilio shows the WhatsApp sender as "Pending Approval".
  - **Why first:** 1–2 week lead time. This blocks Week 4 phone-OTP work if you delay.

- [ ] **Supabase staging project** *(60 min)*
  - supabase.com → New project → name `problem-bank-staging`. Region: `eu-west-2 (London)`.
  - Strong DB password — save in 1Password.
  - Settings → API → copy `Project URL` and `service_role` key.
  - **Done when:** You have `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` saved.

- [ ] **Apply schema** *(15 min)*
  - Open `supabase/migrations/0001_init.sql` from the repo.
  - Supabase dashboard → SQL Editor → New query → paste → Run.
  - Table Editor → confirm 9 tables (`User`, `Submission`, `Vote`, `Comment`, `LibraryEntry`, `Document`, `BuildRegistry`, `BadgePing`, `Notification`).
  - **Done when:** All 9 tables visible.

- [ ] **Google OAuth app** *(45 min)*
  - console.cloud.google.com → project "Problem Bank" → OAuth consent screen (External, fill name + support email + logo).
  - Credentials → Create OAuth client ID → Web application.
  - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`.
  - Copy Client ID + Secret.
  - **Done when:** Both values saved.

### Afternoon (≈2 h)

- [ ] **Fill `.env.local`** *(20 min)*
  - Copy `.env.local.example` → `.env.local` if not already.
  - Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`.
  - Fill in: `NEXTAUTH_SECRET`, `NEXTAUTH_URL=http://localhost:3000`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
  - Everything else stays empty for now.
  - **Done when:** File saved.

- [ ] **First smoke test** *(30 min)*
  - `npm install` (if not done).
  - `npm run dev`.
  - Visit `localhost:3000` — should load the Library grid with "Entries coming soon" (no yellow banner).
  - Visit `/signin` → click Continue with Google → consent → land back signed in.
  - **Done when:** Supabase Table Editor → `User` table has one row with your Google email.

- [ ] **Promote yourself to admin** *(5 min)*
  - Supabase SQL Editor: `UPDATE "User" SET role = 'admin' WHERE email = 'you@christex.foundation';`
  - Sign out, sign in again (so JWT picks up the new role).
  - Visit `/admin/dashboard` — should load instead of redirecting.
  - **Done when:** Admin dashboard renders.

### Day 1 gate
- [ ] WhatsApp approval submitted
- [ ] Staging Supabase live with schema applied
- [ ] Google sign-in working locally
- [ ] You are admin

---

## Day 2 (Tue) — Other auth + bot protection + email

- [ ] **GitHub OAuth app** *(30 min)*
  - github.com → org settings → Developer settings → OAuth Apps → New OAuth App.
  - Name: `Problem Bank`. Homepage: `https://build.christex.foundation`.
  - Callback: `https://build.christex.foundation/api/auth/callback/github`.
  - After creation, add second callback: `http://localhost:3000/api/auth/callback/github`.
  - Copy Client ID, generate Secret.
  - Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env.local`.
  - Restart dev server.
  - **Done when:** Sign in with GitHub works locally; `User.githubUrl` populated in DB.

- [ ] **Cloudflare Turnstile** *(20 min)*
  - dash.cloudflare.com → Turnstile → Add site → `build.christex.foundation`.
  - Widget mode: Managed.
  - Hostnames: `build.christex.foundation`, `localhost`, `*.vercel.app`.
  - Copy Site key and Secret key.
  - Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` to `.env.local`.
  - Restart dev server.
  - **Done when:** Visit `/feed/submit` (signed in) — the Turnstile widget appears at the bottom of the form.

- [ ] **Resend (email)** *(30 min)*
  - resend.com → API Keys → create.
  - Domains → add `christex.foundation` → verify the DKIM/SPF records in Cloudflare DNS.
  - Add `RESEND_API_KEY` and `EMAIL_FROM=noreply@christex.foundation` to `.env.local`.
  - **Done when:** API key saved. Domain shows "Verified" in Resend (DNS propagation can take 5–60 min).

### Day 2 gate
- [ ] All 3 sign-in methods you have so far (Google, GitHub, locally) work
- [ ] Turnstile widget renders on submission form
- [ ] Resend domain verified

---

## Day 3 (Wed) — Cloudinary + admin walkthrough

- [ ] **Cloudinary account** *(30 min)*
  - cloudinary.com → Dashboard → copy `Cloud name`, `API Key`, `API Secret`.
  - Settings → Upload → Upload presets → Add:
    - Name: `problem_bank_unsigned`
    - Signing mode: **Unsigned**
    - Folder: `problem-bank`
    - Save.
  - Add to `.env.local`:
    - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
    - `CLOUDINARY_API_KEY`
    - `CLOUDINARY_API_SECRET`
    - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=problem_bank_unsigned`
  - Restart dev server.
  - **Done when:** `/feed/submit` → insert image via toolbar → submit → image lands in Cloudinary Media Library (`problem-bank/submissions/`).

- [ ] **End-to-end submission flow** *(45 min)*
  - Sign in as your admin user.
  - Submit 3 problems across different sectors (Health / Agriculture / Education) and urgencies. Include an inline image in at least one.
  - On `/feed`, vote on one — confirm count increments + 5-min unvote countdown.
  - Wait 5 min on another vote — confirm unvote becomes locked.
  - Cast a 4th vote in the same week — confirm blocked with toast.
  - **Done when:** All four behaviours observed.

- [ ] **Comments flow** *(20 min)*
  - On a submission detail page (signed in), post a comment — confirm it appears.
  - From `/admin/submissions`, change that submission's status to `under_review`.
  - Reload the public detail page — comment input gone, existing comment still visible.
  - Check `Notification` table — row created for the submitter.
  - **Done when:** Status change closes comments + creates notification.

- [ ] **Admin CMS dry-run** *(45 min)*
  - `/admin/library/new` — fill the form for a fake "test entry":
    - Title, slug (`test-entry`), Tiptap problem statement, sector, urgency, kit/demo URLs.
    - Upload 6 small dummy PDFs (one per docType). Optional: an HTML infographic.
    - Link to one of the submissions you just created.
  - Save draft → entry appears at `/admin/library` as Draft (not on public `/`).
  - Publish → entry appears on public `/library/test-entry`.
  - On `/library/test-entry`, click "I'm building this" — confirm you're registered.
  - **Done when:** Full draft → publish → register-as-builder loop works.

### Day 3 gate
- [ ] Cloudinary uploads working
- [ ] Voting + commenting + admin Library publish loop verified locally

---

## Day 4 (Thu) — Content team kickoff + auth edge cases

- [ ] **Content team alignment** *(60 min)*
  - Sync with Christex Foundation research team. Walk them through `/admin/library/new` live (use staging).
  - Hand them: list of the 6 PDF document types and what each should contain (mirror the docx spec — Concept Note, PRD, Technical Design, User Flows + Wireframes, Roadmap, Pitch Deck).
  - Confirm the first Library entry topic.
  - **Done when:** Content team has started; you have a target completion date for the first entry.

- [ ] **Email + password signup** *(30 min)*
  - Sign out of Google. `/signup` → Email tab → fill name/email/password (≥ 8 chars).
  - Submit → auto-signs you in.
  - Sign out → `/signin` → Email tab → same credentials → signed in.
  - **Done when:** Email signup + sign-in both work end-to-end.

- [ ] **Password reset (Resend)** *(20 min)*
  - `/reset` → enter your email → check inbox.
  - Click the link → set new password → sign in.
  - **Done when:** Reset email received and the new password works.

- [ ] **Account merging** *(15 min)*
  - Sign out. Sign in with Google using the same email as your email/password account.
  - Check Supabase: still one row for that email (not duplicated).
  - **Done when:** One user row, signed in.

- [ ] **Cleanup test data** *(15 min)*
  - Delete test entries / submissions / votes / comments from Supabase Table Editor (or via SQL). Leave the schema; just clear the data.
  - **Done when:** Tables are empty (or only contain real users you intend to keep).

### Day 4 gate
- [ ] All 3 currently-available sign-in methods (Google, GitHub, email/password) work
- [ ] Password reset email arrives + new password works
- [ ] Account merging verified
- [ ] Content production has started

---

## Day 5 (Fri) — Vercel staging deploy

- [ ] **Connect repo to Vercel** *(20 min)*
  - vercel.com → Add New → Project → import `christex-foundation/ProblemBankv2`.
  - Framework preset: Next.js (auto). Build: `npm run build`. Install: `npm install`.
  - **Don't deploy yet.** Go to Settings → Environment Variables.

- [ ] **Add env vars to Vercel (Preview scope)** *(30 min)*
  - Bulk-paste your `.env.local` contents into Preview env vars.
  - **Override two values:**
    - `NEXTAUTH_URL`: leave blank for Preview (Vercel sets from `VERCEL_URL`).
    - `NEXT_PUBLIC_BASE_URL`: leave blank for Preview.
  - Don't fill Production scope yet — that's Week 5.
  - **Done when:** All Preview vars set.

- [ ] **First deploy** *(15 min)*
  - `git push origin main` (or just trigger a redeploy from the Vercel UI).
  - Wait for build success.
  - Note the preview URL: `https://<project>.vercel.app`.
  - **Done when:** Build succeeds.

- [ ] **Update OAuth callbacks** *(15 min)*
  - Google Cloud → Credentials → Authorized redirect URIs → add `https://<preview-url>.vercel.app/api/auth/callback/google`.
  - GitHub OAuth app → add `https://<preview-url>.vercel.app/api/auth/callback/github`.
  - Cloudflare Turnstile → confirm `*.vercel.app` is still in hostnames.
  - **Done when:** Both providers updated.

- [ ] **Smoke test deployed preview** *(45 min)*
  - Visit the preview URL in an incognito window.
  - Sign in with Google. Sign out. Sign in with GitHub.
  - Submit a problem. Vote. Comment.
  - Visit `/admin/dashboard` (sign in as admin first).
  - Visit `/api/health` — should return 200 with all checks `ok` *except* the Twilio one if WhatsApp still pending. (Or skip the Twilio check until Week 4.)
  - **Done when:** All flows work on the preview URL.

### Day 5 gate
- [ ] Staging deployed to Vercel preview
- [ ] OAuth works on preview URL
- [ ] All non-phone-OTP flows verified on the deployed URL

---

## End-of-week health check

- [ ] `.env.local` has 14 of 15 values filled (only Twilio still blank if WhatsApp approval pending). SMS-only path: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SID` can be filled immediately — SMS works without WhatsApp approval.
- [ ] Schema applied to staging Supabase
- [ ] Vercel preview deployed and smoke-tested
- [ ] You can sign in via Google, GitHub, and email/password (locally and on preview)
- [ ] You can publish a Library entry end-to-end via Admin CMS
- [ ] Christex content team has started producing the first real Library entry
- [ ] WhatsApp approval still pending — check status, escalate if not moving

If any item is **not** ticked, slip that to Day 1 of Week 2 and shift the rest of Week 2 down. Don't proceed to Week 2 with broken Day 5 items.

---

## Quick reference

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Restart dev server after editing .env.local
# Ctrl+C in the terminal running `npm run dev`, then:
npm run dev

# Health check
curl http://localhost:3000/api/health | jq

# Promote a user to admin
# In Supabase SQL Editor:
UPDATE "User" SET role = 'admin' WHERE email = 'you@christex.foundation';
```

---

*When Week 1 is complete, jump to `LAUNCH_RUNBOOK.md` for the T-7 → T-0 schedule. `QA_CHECKLIST.md` is your friend during Week 3 (full QA pass).*
