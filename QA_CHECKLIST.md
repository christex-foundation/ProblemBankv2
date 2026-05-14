# Problem Bank — Pre-launch QA checklist

Walk every flow on **staging** (Vercel preview with staging Supabase) before flipping to production. Mark each box as you go. Anything ✗ → file a GitHub issue with reproduction steps before continuing.

Prereqs:
- `.env.local` filled with all real values from `.env.local.example`
- `pnpm db:migrate` run against staging Supabase
- `pnpm db:seed` run once so the Library + feed have content
- Mark your test user as admin: `UPDATE "User" SET role = 'admin' WHERE email = 'you@example.com';`

---

## Flow 1 — Sign Up and Sign In

### Phone OTP (primary)
- [ ] `/signup` → Phone tab → enter SL phone in E.164 (`+232...`)
- [ ] Choose WhatsApp → receive code on WhatsApp → enter → signed in, redirected to `/`
- [ ] Sign out → repeat with SMS channel → signed in
- [ ] Enter wrong code 3× → fourth attempt is blocked with a "locked" message (15 min)
- [ ] DB: `User` row has `phone` populated, `email` null, `passwordHash` null

### Email + password
- [ ] `/signup` → Email tab → name, email, password (≥8) → account created → auto-signed-in
- [ ] Sign out → `/signin` → Email tab → same credentials → signed in
- [ ] Try signing up again with the same email → error: "Email already registered"
- [ ] Wrong password → "Wrong email or password" toast, no session
- [ ] `/reset` → enter email → receive reset email via Resend → click link → set new password → sign in with new password

### Google OAuth
- [ ] `/signin` → Google · GitHub tab → Continue with Google → Google consent → returned signed in
- [ ] DB: `User` row created with email matching Google account

### GitHub OAuth
- [ ] `/signin` → Continue with GitHub → GitHub consent → returned signed in
- [ ] DB: `User.githubUrl` is populated with `https://github.com/<handle>`

### Account merging (CRITICAL)
- [ ] Sign up with email `test@example.com` + password
- [ ] Sign out → sign in with Google using same `test@example.com`
- [ ] DB: Only one `User` row exists with this email (not duplicated)

---

## Flow 2 — Submit a Problem
- [ ] Signed in → `/feed/submit` loads (unsigned redirects to `/signin?callbackUrl=/feed/submit`)
- [ ] Fill title (verify counter shows `n/80`), rich-text description, optional solution
- [ ] Insert an inline image via the toolbar → see blob: URL inline → submit
- [ ] After submit: redirected to `/feed`, new submission visible at top, image renders via Cloudinary URL (check the image src in DevTools — should start with `https://res.cloudinary.com/...`)
- [ ] Required-field validation: empty title or description → submit button stays disabled
- [ ] Turnstile not solved → button stays disabled
- [ ] Cloudinary upload: check Cloudinary Media Library → image is in `problem-bank/submissions` folder

---

## Flow 3 — Vote and Unvote
- [ ] `/feed` → click upvote on a submission → count increments, button fills, "unvote 5s" indicator counts down from 300
- [ ] Click again within 5 min → count decrements, button empties (vote returns to budget)
- [ ] Vote on 3 different submissions → header shows "0 of 3 votes remaining this week"
- [ ] Try a 4th vote → blocked with warning toast "You have used all 3 votes this week. Resets Monday."
- [ ] Manually edit DB: `UPDATE "Vote" SET "votedAt" = NOW() - INTERVAL '6 minutes' WHERE ...` for one of your votes → reload → try unvote → blocked with "Unvote window expired"
- [ ] Voting on a submission with status `live` or `not_viable` → vote button is disabled
- [ ] Unsigned user clicks vote → redirected to `/signin?callbackUrl=...`

---

## Flow 4 — Comment
- [ ] `/feed/[id]` for a `submitted` problem → comment box visible (signed in)
- [ ] Post a comment → appears immediately, count increments on the feed card
- [ ] Admin changes status to `under_review` in `/admin/submissions` → reload submission page → comment input is gone, existing comment still visible, message "Comments are closed while Christex Foundation is researching this problem."
- [ ] Unsigned user → "Sign in to comment" link in place of input
- [ ] Verify Turnstile required before posting

---

## Flow 5 — Library Discovery
- [ ] `/` (no auth required) → Library grid shows published entries
- [ ] Filter by sector → only matching entries shown
- [ ] Click an entry → `/library/[slug]` loads with all metadata
- [ ] All 6 document tabs render. Click each → PDF downloads / opens
- [ ] If entry has an infographic → renders as sandboxed iframe
- [ ] If entry has no infographic → no placeholder shown
- [ ] POC section shows kit + demo links → open in new tab
- [ ] Page is accessible without signing in
- [ ] Try a non-existent slug → custom 404 page

---

## Flow 6 — Build Registry
- [ ] Unsigned user clicks "I'm building this" → redirected to `/signin?callbackUrl=...`
- [ ] Signed in user clicks → immediately registered, builder card appears
- [ ] Post-registration panel shows: kit link, demo link, badge snippet, repo URL field
- [ ] Copy badge → success toast
- [ ] Paste a public GitHub repo URL → save → "Last push: ..." appears within seconds
- [ ] Paste a private repo URL → URL saved but no activity shown, no error visible
- [ ] Paste an invalid URL (not github.com) → URL rejected and stored as null
- [ ] Click "Remove me from registry" → confirmation prompt → confirm → card removed
- [ ] Re-register on the same entry → succeeds (no duplicate)
- [ ] Try registering twice without unregistering → 400 "Already registered"

---

## Flow 7 — Builder Profile
- [ ] `/builders/[id]` (any visitor, no auth) → profile loads with name, bio, contact, "Currently Building"
- [ ] No contact details → contact section omitted entirely
- [ ] Owner views own profile → edit form appears below
- [ ] Update name, bio (verify 160 char counter), email, github, website → save → updates immediately
- [ ] Set bio over 160 chars → max-length stops input, save still succeeds at 160
- [ ] Builder cards with repos show last push date

---

## Flow 8 — Problem → Library Pipeline (admin)
- [ ] Admin: in `/admin/submissions`, change a submission status `submitted` → `under_review`
- [ ] Notifications DB: rows created for submitter + any prior commenters with `type=status_change`
- [ ] Submitter sees notification in bell + `/notifications`
- [ ] Change to `research_in_progress` → another notification
- [ ] Change to `live` (after publishing an entry that links this submission) → notification includes link to `/library/<slug>`
- [ ] Change to `not_viable` → submission shows "Not Viable" tag on feed
- [ ] Gaining Traction: seed 4 votes across 3 different days on a `submitted` submission → reload feed → status shows "Gaining Traction"
- [ ] Seed 4 votes all on same day → status stays "Submitted"

---

## Flow 9 — Admin CMS
- [ ] Non-admin tries `/admin/dashboard` → redirected to `/`
- [ ] Admin lands on dashboard → counts by status, recent entries, badge fetches
- [ ] `/admin/library/new` → fill form: title, slug (verify lowercase-only validation), Tiptap problem statement, sector, urgency, kit URL, demo URL
- [ ] Upload 6 PDF documents one at a time → each shows progress %, then file name with "Replace" button
- [ ] Optionally upload an HTML infographic file → renders as iframe on the live entry page
- [ ] Link to a community submission from the dropdown
- [ ] Save as draft → redirected to edit page, entry not visible at `/library/[slug]`
- [ ] Publish → entry appears in public Library at `/`
- [ ] Edit existing entry → values populate correctly, change something, update → reflected on live page
- [ ] "Update published entry" preserves `publishedAt`
- [ ] Save published entry as draft → entry unpublishes (removed from `/`)

---

## Flow 10 — Notifications
- [ ] Bell shows count badge when unread > 0; `9+` when ≥10
- [ ] Click bell → dropdown with 3 most recent notifications
- [ ] Click a notification → marked read (badge decrements), navigates to linked page
- [ ] "Mark all read" clears all unread + badge
- [ ] "See all" → `/notifications` with complete history
- [ ] Self-comment does not generate a notification to self
- [ ] Commenting on a problem you've already commented on does not double-notify
- [ ] Live-status notification includes link to `/library/<slug>`
- [ ] No email is sent for status changes or comments (only password reset)

---

## Performance & accessibility

### Mobile + 3G
- [ ] DevTools → Network → Slow 3G → reload `/feed` → first paint < 3s
- [ ] DevTools → CPU 4x slowdown + Slow 3G → submit form remains responsive
- [ ] Test on real low-end Android if available (Tecno Spark / Itel / etc.)

### Lighthouse (Chrome DevTools)
- [ ] `/` Performance ≥ 80, A11y ≥ 90, Best practices ≥ 90, SEO ≥ 90
- [ ] `/feed` same thresholds
- [ ] `/library/[slug]` same thresholds
- [ ] Fix any flagged issues (alt text, color contrast, button accessible names)

### WCAG 2.1 AA
- [ ] All images have alt text
- [ ] All buttons / links have accessible names
- [ ] Body text contrast ratio ≥ 4.5:1
- [ ] Keyboard nav works on submission form, feed, library entry
- [ ] Focus indicator visible on all interactive elements

---

## Security smoke
- [ ] POST to any `/api/admin/*` route as a non-admin → 403
- [ ] POST to `/api/submissions` without session → 401
- [ ] Send invalid Turnstile token to submission endpoint → 400 "Bot check failed"
- [ ] Try to vote 4th time → 400
- [ ] Try to unvote after 6 min → 400
- [ ] Try direct `prisma.user.update` via admin endpoint as a regular user → 403
- [ ] Check `/api/health` returns 200 with all checks ok in production
- [ ] `.env.local` is in `.gitignore` (`git check-ignore .env.local` returns exit 0)

---

## Static assets & SEO
- [ ] `/robots.txt` serves correctly, disallows `/admin/`, `/api/`, `/feed/submit`, `/notifications`
- [ ] `/sitemap.xml` lists `/`, `/feed`, and every published Library entry
- [ ] Library entry pages have proper OG meta tags (check via View Source)
- [ ] Custom 404 page renders for unknown routes
- [ ] Custom error page renders if a route throws

---

## Hackathon legacy regression
- [ ] `/hackathon` homepage renders unchanged
- [ ] `/hackathon/civic-hackathon`, `/hackathon/ideas`, `/hackathon/find-a-team`, `/hackathon/resources/kits`, `/hackathon/resources/tech`, `/hackathon/big5`, `/hackathon/about`, `/hackathon/terms` all render
- [ ] Airtable-backed features still work (Ideas list, TeamBoard, Tech stacks)
- [ ] No console errors in browser DevTools
- [ ] All internal `<Link>` navigation stays inside `/hackathon/*`

---

## Launch gate
- [ ] All flows above pass on staging
- [ ] First Library entry published via Admin CMS on production
- [ ] Domain `build.christex.foundation` resolves to Vercel deploy
- [ ] Production env vars set in Vercel
- [ ] Twilio WhatsApp approved (or SMS-only acceptable)
- [ ] Sentry / error monitoring wired (or accepted post-launch)
- [ ] Christex team trained on Admin CMS
- [ ] Announce launch 🎉
