# Problem Bank — Launch runbook

A step-by-step you execute on launch day. Allow 90 minutes end-to-end. Run with a second person (one driving, one watching `/api/health` and Vercel logs).

---

## T-7 days

- [ ] Twilio WhatsApp Business approval status — `Approved` or fall back to SMS-only for launch
- [ ] Christex Foundation content team has finalised the first Library entry: 6 PDFs + optional infographic + (optional) starter kit repo + (optional) live demo URL
- [ ] All staging QA flows from `QA_CHECKLIST.md` pass
- [ ] Decide an admin user — `UPDATE "User" SET role='admin' WHERE email='admin@christex.foundation'` after they sign in once

## T-3 days

- [ ] Create a Supabase **production** project (`problem-bank-prod`), capture URL/keys
- [ ] Vercel project → Environment Variables → set all production values (different `NEXTAUTH_SECRET` from staging)
- [ ] Cloudflare → Turnstile site → add `build.christex.foundation` to allowed hostnames
- [ ] Google Cloud → OAuth client → add `https://build.christex.foundation/api/auth/callback/google` to authorized redirects
- [ ] GitHub OAuth app → add `https://build.christex.foundation/api/auth/callback/github` to callbacks
- [ ] Set up Sentry project, copy `SENTRY_DSN` (optional — can defer post-launch)

## T-1 day

- [ ] Final preview deploy on `problem-bank-v2` branch passes all `QA_CHECKLIST.md` smoke tests
- [ ] Push branch and merge to `main`:
  ```
  git push -u origin problem-bank-v2
  gh pr create --title "Problem Bank v2 launch" --body "See PHASE_0_CHECKLIST.md and IMPLEMENTATION_PLAN.md"
  # After review / approval:
  gh pr merge --squash
  ```
- [ ] Vercel auto-deploys `main` → wait for build success
- [ ] Run prod migration:
  ```
  DATABASE_URL=<prod_pooled> DIRECT_URL=<prod_direct> ./node_modules/.bin/prisma migrate deploy
  ```
- [ ] Smoke test prod URL (still on `*.vercel.app`): sign in with each method, submit a problem, view the seeded entry

## Launch day (T-0)

### 1. DNS cutover (15 min)
- [ ] Cloudflare DNS → add CNAME `build` pointing to Vercel's hostname (or use Vercel's automatic config)
- [ ] Vercel project → Settings → Domains → add `build.christex.foundation`
- [ ] Wait for SSL cert (usually < 5 min)
- [ ] Update `NEXTAUTH_URL` in Vercel **production** env to `https://build.christex.foundation`
- [ ] Update `NEXT_PUBLIC_BASE_URL` similarly
- [ ] Redeploy (Vercel → Deployments → Redeploy latest production)

### 2. First Library entry (15 min)
- [ ] Admin signs in via `/signin` on the prod domain
- [ ] Promote to admin in DB: `UPDATE "User" SET role='admin' WHERE email='...'`
- [ ] Sign out and back in (so JWT picks up the new role)
- [ ] `/admin/library/new` → fill all fields, upload 6 PDFs, optional infographic, kit + demo URLs, link to a community submission if applicable
- [ ] Click **Publish**
- [ ] Verify `/library/<slug>` renders correctly from incognito

### 3. Health checks (10 min)
- [ ] `curl https://build.christex.foundation/api/health` returns 200 with all checks `ok`
- [ ] `curl https://build.christex.foundation/sitemap.xml` includes the new entry
- [ ] `curl https://build.christex.foundation/robots.txt` correct
- [ ] `curl https://build.christex.foundation/api/badge/<slug>` returns an SVG, Cloudinary upload still works
- [ ] DB: `SELECT * FROM "BadgePing" ORDER BY "pingedAt" DESC LIMIT 5` shows the badge fetch above

### 4. Announce
- [ ] Christex Foundation socials
- [ ] Discord / WhatsApp community
- [ ] Optional: Product Hunt, MoCTI, partner mailing lists

---

## Rollback plan

If anything breaks badly:

1. **Vercel**: Deployments → previous successful production deploy → "Promote to Production". 30 second rollback, no DB changes touched.
2. **Database**: We do not destructively migrate on launch. The only schema change is the initial migration; nothing to roll back.
3. **DNS**: Remove the `build` CNAME in Cloudflare → the domain stops resolving. Vercel deploy is still reachable at `*.vercel.app`.

Avoid: `prisma migrate reset` in production. There is no path that requires this on launch.

---

## Post-launch (T+24h)

- [ ] Check Vercel function logs for errors
- [ ] Check Supabase logs for slow queries / lock contention
- [ ] Check Sentry (if wired) for unhandled exceptions
- [ ] Check Cloudinary usage dashboard for upload anomalies
- [ ] Check Twilio Verify dashboard for OTP send/verify rates and any failed deliveries
- [ ] Confirm the first community submission has been received and process is healthy

---

## Operating notes

### Promoting an admin
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'someone@christex.foundation';
```
User must sign out and back in so the JWT picks up the new role.

### Demoting an admin
```sql
UPDATE "User" SET role = 'user' WHERE id = '<cuid>';
```
Same — they have to re-auth.

### Deleting test data
```sql
-- Cascade-delete a test user and all their content:
DELETE FROM "User" WHERE email = 'test@example.com';
```

### Backups
Supabase runs daily backups on paid tiers. Confirm enabled in Project Settings → Database → Backups.

### Domain certificate renewal
Vercel auto-renews. No action needed unless we move off Vercel.

### Twilio Verify rate limits
- Free tier: ~100 verifications/day
- Production Verify Service: paid per verification
- If a number keeps failing, check Twilio Console → Verify → Verifications log

### Resend email deliverability
- Verify domain DKIM/SPF in Cloudflare DNS
- If reset emails land in spam, add `noreply@christex.foundation` to the org address book

---

## Phase 7 follow-ups (post-launch, not blocking)

- [ ] Sentry wiring (`@sentry/nextjs` + `SENTRY_DSN`)
- [ ] Posthog or Plausible analytics
- [ ] Weekly email digest of submissions a contributor has engaged with (PRD "Walk" phase)
- [ ] Keyword search across submissions and Library titles
- [ ] Multi-sector / multi-urgency filter on Library and feed
- [ ] Builder profile activity richness (per-day commit counts)
- [ ] Internationalisation if/when expanding beyond Sierra Leone
