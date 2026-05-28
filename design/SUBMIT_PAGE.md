# Submit Modal

Recipe for the "raise a problem" flow. Companion to `LIBRARY_PAGES.md` (library list + detail), `COMPONENTS.md` (primitives), and `TOKENS.md` (visual language). This file captures the layout, the data seam, the combined submit + signup flow, and the validation states.

Status: **prototype, sample data only**. The flow renders without `next-auth`, `@supabase/supabase-js`, `sonner`, or `zod` installed. Real auth + persistence wiring lives in `src/app/_archive/` and gets reattached when the production app picks this design up.

---

## 1. Routing + file map

The form lives in **one surface**: a modal mounted on top of `/feed` (and `/feed/[id]`). There is no `/feed/submit` route. The earlier intercepting-routes wiring was removed: the URL never changes when the modal opens, and a refresh closes it.

```
src/app/feed/
├── layout.tsx                     ← wraps children in RaiseModalProvider
├── page.tsx                       ← /feed (list), uses <RaiseButton> + <RaiseLink>
└── [id]/page.tsx                  ← /feed/[id] (detail), uses <RaiseButton> in the closer

src/components/feed/
├── RaiseModalProvider.tsx         ← client provider, holds modal open state, renders SubmitModal
├── RaiseButton.tsx                ← client button trigger (clone of ButtonLink styling) → openRaiseModal()
├── RaiseLink.tsx                  ← client inline-link trigger for empty states → openRaiseModal()
├── SubmitModal.tsx                ← modal shell (overlay, X-close, Esc, scroll lock, hero) wrapping SubmitForm
├── SubmitForm.tsx                 ← the form itself (client). Owns its own submitted-state success view.
└── SubmissionForm.tsx             ← legacy form (next-auth + tiptap + sonner). Kept for reference, not rendered.

src/lib/
├── enums.ts                       ← SECTORS, URGENCY_LABELS, MAX_TITLE_LEN (existing)
└── submit.ts                      ← submitProblem({ ... }) seam. Sample no-op today; Supabase + NextAuth tomorrow.
```

The CTAs that used to link to `/feed/submit` are now React buttons that call `openRaiseModal()` from `RaiseModalProvider`'s context:

- `/feed/page.tsx` hero CTA → `<RaiseButton variant="accent">`
- `/feed/page.tsx` dark closer CTA → `<RaiseButton variant="accent">`
- `/feed/page.tsx` empty-state link → `<RaiseLink>`
- `/feed/[id]/page.tsx` dark closer CTA → `<RaiseButton variant="accent">`

`src/app/robots.ts` no longer disallows `/feed/submit` (the route is gone).

---

## 2. Data seam

The form talks to **one function**, `submitProblem(input)` from `src/lib/submit.ts`. Today it resolves a fake id after a short delay; in production it'll POST to `/api/submissions` (mirroring the archived route at `_archive/api/submissions/route.ts`). Same shape, same call site.

```ts
// src/lib/submit.ts
export type SubmitInput = {
  title: string;
  problem: string;          // plain text, no Tiptap in the prototype
  toolIdea: string;
  signsItsWorking: string[]; // optional; empty array if none
  sector: Sector;
  urgency: UrgencyKey;
  // Combined-signup payload, present only when the submitter is anonymous:
  account?:
    | { method: 'email'; email: string }
    | { method: 'phone'; phone: string; channel: 'sms' | 'whatsapp' }
    | { method: 'google' }
    | { method: 'github' };
  turnstileToken: string;
};

export type SubmitResult =
  | { ok: true; submissionId: string; signedIn: boolean }
  | { ok: false; error: string; field?: keyof SubmitInput };

export async function submitProblem(input: SubmitInput): Promise<SubmitResult>;
```

When auth + Supabase land, only the body of `submitProblem` changes. The form imports, the validation rules, and the page layout stay.

---

## 3. The modal

`SubmitForm` is the source of truth for fields, validation, and the inline success view. It does NOT navigate on submit: it sets an internal `submitted` state to one of two terminal values and renders the matching success block in place.

- **`submitted === 'live'`** — card is on the feed already. Fires when the submitter is signed-in, OR when an anonymous flow completed inline (phone OTP confirmed, OAuth returned). Block reads `Submitted.` / `The feed gets it next.` with two buttons: `View on the feed` (link to `/feed`, closes the modal) and `Raise another` (resets local form state).
- **`submitted === 'pending-email'`** — card is pending and the magic link is in the user's inbox. Fires only on the email path. Block reads `Check your email.` / `One link away.` with the email address echoed back, plus a `try a different method` reset.

### Open / close lifecycle

```
User clicks <RaiseButton> or <RaiseLink>
  → openRaiseModal() in RaiseModalProvider
  → isOpen = true
  → <SubmitModal onClose={closeRaiseModal}> mounts with <SubmitForm />

User closes via X / Esc / overlay click
  → onClose() → closeRaiseModal()
  → isOpen = false
  → Modal unmounts, SubmitForm state goes with it (fresh form next open)
```

The URL never changes. No history entry, no shareable URL, no refresh restoration. A refresh during open closes the modal. This is the deliberate "modal-only" tradeoff: simpler mental model, no route-state bookkeeping, the form is purely a UI overlay.

### Modal shell anatomy

```
<SubmitModal>
└── fixed inset-0 z-[70]                                  ← overlay container
    ├── backdrop button                                    ← click closes
    │   bg-foreground/45 backdrop-blur-sm
    └── sheet (max-w-[760px], full-bleed on mobile)
        ├── top strip                                     ← px-6 md:px-10, pt-6 md:pt-8
        │   • RAISE A PROBLEM eyebrow (accent, left)
        │   • X-close round button (right, 9×9)
        └── scrollable column                              ← max-h-[92vh] on md+, full on mobile
            ├── <h1> "Drop your idea."                     (clamp(2rem, 6vw, 3.5rem))
            ├── <Body size="md" tone="muted">              (max-w-[60ch], mt-5 md:mt-6)
            │   "No code needed. Add a short title..."
            └── <SubmitForm />                             (mt-10 md:mt-12)
```

Body scroll is locked while the modal is open (`document.body.style.overflow = 'hidden'`).

### Form layout

Single column, `max-w-[680px]`. No editor (Tiptap is out of scope for the prototype, the production form keeps it). Fields render in the order below. Labels use the `Eyebrow` primitive at `size="sm"`, tone `muted`. Helper text below each field is `text-xs text-foreground/55`.

| # | Label                                | Input                              | Required | Notes                                                                                                                                                |
|---|--------------------------------------|------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | `SHORT TITLE`                        | text input, `maxLength={80}`       | yes      | Placeholder: `e.g. Public accountability for reps`. Helper: `Shown on pipeline cards. Keep it concise.` Counter: `{title.length}/80` (text-foreground/45). |
| 2 | `WHAT'S THE PROBLEM?`                | textarea, `rows={4}`               | yes      | Placeholder: `e.g. There's no easy way to know if a politician actually showed up to parliament.`                                                       |
| 3 | `WHAT COULD THE TOOL DO?`            | textarea, `rows={4}`               | yes      | Placeholder: `e.g. A searchable database of rep attendance, pulled from the official record.`                                                          |
| 4 | `HOW WILL WE KNOW IT'S WORKING?`     | repeatable text inputs             | no       | Optional. Bullet list with `+ Add criterion` link. Helper: `Add a few clear signs builders can aim for, like open source, works on a basic phone, covers every district.` |
| 5 | `SECTOR` (collapsed under "Details") | native `<select>`, options=SECTORS | yes      | Defaults to first sector. Needed so the entry slots into the existing `/feed` filters.                                                                |
| 6 | `URGENCY`                            | native `<select>`, options=URGENCY | yes      | Defaults to `medium`.                                                                                                                                  |

Sector + Urgency sit in a "Details" subgrid below field 4, two columns on `sm:`, one on mobile. They aren't in the source mockup but they're load-bearing for filtering on `/feed`. The screen reads top-down as "describe it, then triage it".

Field labels use the renamed copy (`HOW WILL WE KNOW IT'S WORKING?`) per the editorial direction, not "Acceptance criteria". See [[feedback-use-exact-copy]].

### Account block (anonymous users only)

Mounted under the form, above the submit button, ONLY when the submitter is not signed in. The block is a single editorial card with the eyebrow `FIRST TIME?`, headline `Submit and create your account in one step.`, lede `Pick how you want to sign in. We'll save your submission once you confirm.`

Four provider buttons stacked, each full-width on mobile, two-column on `sm:`:

| Method        | Label                       | Behavior                                                                                                                                          |
|---------------|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Phone OTP     | `Continue with phone`       | Inline reveals a phone input + channel toggle (sms / whatsapp). On submit, posts the form, sends OTP, routes to the OTP confirm screen, then back.  |
| Email magic link | `Continue with email`    | Inline reveals an email input only (no password). On submit, server creates a pending submission keyed to the email, sends a magic link. User clicks the link, account is created/merged, submission publishes. Form shows the "Check your email" terminal state in-place. |
| Google        | `Continue with Google`      | No inline expansion. The "Submit" button relabels to `Continue with Google`; clicking hands off directly to Google's own sign-in. Form state is persisted via `sessionStorage` keyed by a draft id, restored on return. |
| GitHub        | `Continue with GitHub`      | Same shape as Google: no inline expansion, "Submit" button relabels and hands off directly to GitHub.                                              |

Account merging rule (from `IMPLEMENTATION_PLAN.md`): if an email or phone matches an existing user, the new provider links onto that account and the submission attaches there. No duplicate accounts.

When the submitter is signed in, the account block is **not rendered**. The submit button alone handles everything.

### Submit button

Primary `Button` variant, full-width on mobile, `w-[280px]` on `sm+`. Disabled until: title is non-empty, problem + toolIdea are non-empty, sector + urgency are set, AND (signed-in OR account method is picked + its fields valid), AND a valid Turnstile token exists. Label flips to `Submitting…` while in-flight.

The button label adapts to the picked method, so the action reads as one decision rather than two:

| State                              | Label                          |
|------------------------------------|--------------------------------|
| Signed-in                          | `Submit`                       |
| Anonymous, no method picked yet    | `Submit and create account`    |
| Anonymous + `email`                | `Send sign-in link`            |
| Anonymous + `phone`                | `Send code`                    |
| Anonymous + `google`               | `Continue with Google`         |
| Anonymous + `github`               | `Continue with GitHub`         |

### Spacing rhythm

- Top strip → title: `pt-6 md:pt-8` inside the scroll column.
- Title → body: `mt-5 md:mt-6`.
- Body → form: `mt-10 md:mt-12`.
- Between form fields: `space-y-8` (more breathing room than the production form's `space-y-4`, since each field carries a helper line).

### Close behavior

X-button, overlay click, or Esc key all call `onClose()` → `closeRaiseModal()`. Browser back does nothing special (no URL state to pop). The X-close framing matches the source mockup and the existing `SignInModal` pattern (`src/components/feed/SignInPrompt.tsx`).

---

## 4. Combined submit + signup

The flow's whole point is to collapse "create an account" and "raise a problem" into one screen for first-timers. Two states:

### State A: signed-in submitter

1. Form fields fill.
2. Click `Submit`.
3. `submitProblem({ ...fields, turnstileToken })` runs, no `account` block in the payload.
4. On success, the form's internal `submitted` flag flips and the success block replaces the fields in place. Same result whether the form is in the page or in the modal.

### State B: anonymous submitter

1. Form fields fill.
2. The anonymous user picks a provider in the account block.
3. For phone or email, the picked block expands inline to gather the minimum it needs (phone + channel, or email only). Google and GitHub do not expand: clicking them only marks the method as picked, and the main Submit button relabels accordingly (`Continue with Google` / `Continue with GitHub`).
4. Click the (relabeled) Submit button.
5. `submitProblem({ ...fields, account, turnstileToken })` runs. Server-side, the production `/api/submissions` route:
   - Validates the Turnstile token.
   - Resolves the account: existing email or phone matches link onto that user (per the docs' "Account merging by email" rule); otherwise creates a new user.
   - **Email magic link**: writes the submission in a `pending` state keyed to the email, sends a magic link via Resend (the email provider already in `IMPLEMENTATION_PLAN.md`). The form shows the `pending-email` terminal state in-place. User clicks the link, the callback route finalizes the account and flips the submission to `submitted`.
   - **Google / GitHub**: persists the form payload in `sessionStorage` keyed by a draft id, then redirects to the provider's sign-in. On return, the callback route reads the draft, writes the submission, links it to the resolved user. The user lands back on `/feed` (or `/feed/submit?signed-in=1`) with the submission live, and sees the `live` terminal state.
   - **Phone OTP**: the server sends the code, the client routes to a code-entry screen, then back. Submission writes on code confirm. Form shows the `live` terminal state on return.
6. On success, the form's internal `submitted` state renders the matching block (`live` or `pending-email`). Clicking `View on the feed` closes the modal (or navigates from the page) to `/feed`.

The prototype builds the UI for both states and stubs the network call. The actual atomic write lives in production wiring (see `src/app/_archive/api/submissions/route.ts` + `_archive/api/auth/email-signup/route.ts`).

---

## 5. Validation + error states

| Condition                                     | Where shown                                       |
|-----------------------------------------------|---------------------------------------------------|
| Title empty                                   | Disable Submit. No inline error until first blur. |
| Title over 80                                 | Hard-stop via `maxLength`; counter goes accent.   |
| Problem or tool idea empty                    | Disable Submit. Inline error on first blur.        |
| Magic link send failed (rate limit, invalid) | Inline error under the email field after submit; form fields preserved. |
| Phone OTP failed                              | Toast or inline error in the OTP screen.           |
| Turnstile not solved                          | Disable Submit. Helper line `Confirm you're human.` |
| Server error                                  | Banner above the Submit button, retains all form state. |

Form state is preserved through every failure mode. The only thing that wipes state is a successful submit followed by clicking `Raise another` in the success block.

---

## 6. What's NOT in scope

- **No Tiptap.** The prototype uses plain textareas. The production form keeps Tiptap + Cloudinary image upload (see archived `SubmissionForm.tsx`).
- **No real auth.** The four provider buttons render and the matching inline blocks reveal for phone and email, but no `next-auth` call fires. The fallback "Sign in" link points to `/signin?callbackUrl=/feed`.
- **No Turnstile widget.** The form reserves a slot and a token field, but the widget only mounts when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set. Submission is otherwise gated by a local "I'm not a bot" placeholder checkbox.
- **No persistence.** `submitProblem` resolves a fake id. The feed list does not update with the new submission in the prototype.
- **No moderation queue.** The submission goes straight to feed status `submitted`. Library promotion is Christex-only and happens out-of-band; see [[problem-bank-library-sources]].
- **No `/feed/submit` route.** Deleted on purpose: the flow is modal-only. There is no shareable URL for the form, and a refresh closes the modal.

---

## 7. Archive convention

The earlier production `/feed/submit` lives at `src/app/_archive/(public)/feed/submit/page.tsx` (auth-gated redirect to `/signin?callbackUrl=/feed/submit`) and uses `src/components/feed/SubmissionForm.tsx` (Tiptap + Cloudinary + `next-auth` + `sonner` + Turnstile). Those files compile-skip in the current repo because anything under `_archive/` is ignored by Next's router. When production picks this design up, the archive's API route + form are the wiring destination: bring them back out, point them at the new field shape from this doc, and the data seam in `src/lib/submit.ts` swaps from a no-op to the real `/api/submissions` call. The production route can either stay modal-only (recommended for parity with this prototype) or reintroduce a page surface for SEO and deep-linking.

---

*Source of truth: `src/components/feed/RaiseModalProvider.tsx`, `src/components/feed/SubmitModal.tsx`, `src/components/feed/SubmitForm.tsx`, `src/components/feed/RaiseButton.tsx`. This doc lags those files; when the implementation moves, update here.*
