# Phase 0 — External account setup (YOUR action)

These eight services need to be set up in browser UIs — I can't do them programmatically. Work through this in parallel while I execute Phase 1. Aim to complete by end of Day 1.

**Critical path:** Twilio WhatsApp approval (1–2 weeks). Submit on Day 1 even if everything else slips.

Use 1Password / team vault for all secrets. Don't paste into Slack/email.

---

## 1. Supabase (Postgres DB) — 10 min

1. https://supabase.com → sign in → New project.
2. Name: `problem-bank-staging`. Region: `eu-west-2 (London)`. Strong DB password (save it).
3. Wait ~2 min for provisioning.
4. **Project Settings → Database → Connection string → URI** — copy. This is `DATABASE_URL`.
5. Same page → **Direct connection** — copy. This is `DIRECT_URL` (used for migrations only).
6. **Project Settings → API** — copy `Project URL`, `anon public` key, `service_role` key.
7. Repeat all of the above for a second project: `problem-bank-prod`.

Capture in vault:
```
STAGING_DATABASE_URL=postgresql://...
STAGING_DIRECT_URL=postgresql://...
STAGING_SUPABASE_URL=https://....supabase.co
STAGING_SUPABASE_ANON_KEY=...
STAGING_SUPABASE_SERVICE_ROLE_KEY=...
# (and prod versions)
```

---

## 2. Cloudinary (files) — 5 min

1. https://cloudinary.com → sign in.
2. Dashboard → copy `Cloud name`, `API Key`, `API Secret`.
3. **Settings → Upload → Upload presets → Add upload preset**:
   - Name: `problem_bank_unsigned`
   - Signing mode: **Unsigned**
   - Folder: `problem-bank`
   - Save.

---

## 3. Cloudflare Turnstile (bot protection) — 5 min

1. https://dash.cloudflare.com → Turnstile → Add site.
2. Site name: `build.christex.foundation`. Widget mode: **Managed**.
3. Hostnames: `build.christex.foundation`, `localhost`, `*.vercel.app`.
4. Copy `Site key` and `Secret key`.

---

## 4. Google OAuth — 10 min

1. https://console.cloud.google.com → create/select project `Problem Bank`.
2. **APIs & Services → OAuth consent screen** → External → fill app name (`Problem Bank`), support email, logo.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. Authorized redirect URIs (add all):
   - `http://localhost:3000/api/auth/callback/google`
   - `https://build.christex.foundation/api/auth/callback/google`
   - You'll add the Vercel preview URL after the first deploy.
5. Copy Client ID + Client Secret.

---

## 5. GitHub OAuth — 5 min

1. https://github.com/organizations/<your-org>/settings/applications → New OAuth App (use org if available, otherwise personal at https://github.com/settings/developers).
2. Name: `Problem Bank`. Homepage URL: `https://build.christex.foundation`.
3. Authorization callback URL: `https://build.christex.foundation/api/auth/callback/github`.
4. After creation, **Add another callback URL**: `http://localhost:3000/api/auth/callback/github`. (GitHub now supports multiple.)
5. Copy Client ID. Generate a new client secret — copy.

---

## 6. Twilio Verify (phone OTP) — 30 min + 1–2 wk WhatsApp approval

1. https://twilio.com → sign in.
2. Console → **Verify → Services → Create service** → Name: `Problem Bank`.
3. Enable channels: SMS + WhatsApp.
4. Copy `Account SID`, `Auth Token` (top of console), `Verify Service SID` (in service settings).
5. **WhatsApp approval (slow):** Messaging → Senders → WhatsApp senders → Request a new WhatsApp number. Follow Twilio's Meta WhatsApp Business approval flow. **Submit today.** Approval takes 1–2 weeks. SMS works immediately while WhatsApp is pending.

---

## 7. Resend (email — password reset only) — 5 min

1. https://resend.com → sign up → API Keys → create.
2. Domains → Add `christex.foundation` → verify via Cloudflare DNS records.
3. Copy API key.

---

## 8. Vercel — done after Phase 1 finishes

You'll connect this to the forked repo after I scaffold it. I'll prompt you when ready.

---

## Hand-off

When complete, fill in `.env.local` in the forked repo (I'll create `.env.local.example` for you). Reach me when:
- All seven services above are set up
- WhatsApp approval **submitted** (no need to wait for approval to start coding)
- You have all secrets in 1Password
- You're ready for me to start environment-dependent work (Prisma migration, OAuth tests)

You can do Phase 0 in parallel with my Phase 1 scaffolding — Phase 1 doesn't need any of these secrets until the final step.
