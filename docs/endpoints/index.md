# Endpoints

Inventory of the HTTP surface under `src/app/api/**`. Updated as each domain is hardened.

## Conventions

- **Base URL:** flat under `/api/...` (no versioning prefix).
- **Mutation style:** Route Handlers only. No Server Actions.
- **Validation:** every request body, query, and path param is parsed with a zod schema colocated in `_schemas.ts` next to `route.ts`. Inferred TS types are exported for the UI.
- **Error envelope:** `{ error: { code: string, message: string, fields?: Record<string, string> } }`. Codes live in `src/lib/api-error-codes.ts`. Helpers `apiOk` / `apiError` / `parseOrError` live in `src/lib/api-response.ts`.
- **Auth — DEFERRED.** No endpoint enforces auth in this pass. Endpoints that would have used `auth()` accept a dev caller identity instead:
  - Mutation routes: `userId` field on body (zod-validated as a UUID).
  - Read routes that need a caller: `x-dev-user-id` header.
  - Admin routes: open, with `TODO(auth)` markers for the future role gate.

  When auth lands, the cleanup is mechanical: grep for `TODO(auth)`, swap to `await auth()`, remove the `userId` field from the schemas.
- **Voting — DEFERRED.** `/api/submissions/[id]/vote` and `/api/me/votes` are not hardened in this pass. Codes `vote_quota_exceeded` and `unvote_window_closed` are reserved.
- **Notifications — DEFERRED.** `/api/notifications` is not hardened in this pass. The notify side effects from `src/lib/notifications.ts` still fire from submission status changes and new comments.

## Status legend

- `hardened` — audited, zod-validated, error envelope, doc complete
- `partial` — exists, partially conformant
- `stub` — exists but incomplete
- `deferred` — explicitly out of scope this pass (auth, voting, notifications)
- `pending` — not yet touched

## Inventory

| Domain | Method | Path | Status | Doc |
|---|---|---|---|---|
| Health | GET | `/api/health` | hardened | [health.md](./health.md) |
| Badge | GET | `/api/badge/[slug]` | hardened | [badge.md](./badge.md) |
| Submissions | GET | `/api/submissions` | hardened | [submissions.md](./submissions.md) |
| Submissions | POST | `/api/submissions` | hardened | [submissions.md](./submissions.md) |
| Votes | POST | `/api/submissions/[id]/vote` | deferred | — |
| Votes | DELETE | `/api/submissions/[id]/vote` | deferred | — |
| Votes | GET | `/api/me/votes` | deferred | — |
| Comments | GET | `/api/submissions/[id]/comments` | hardened | [comments.md](./comments.md) |
| Comments | POST | `/api/submissions/[id]/comments` | hardened | [comments.md](./comments.md) |
| Notifications | GET | `/api/notifications` | deferred | — |
| Notifications | PATCH | `/api/notifications` | deferred | — |
| Library | POST | `/api/library/[id]/build-registry` | hardened | [library.md](./library.md) |
| Library | PATCH | `/api/library/[id]/build-registry` | hardened | [library.md](./library.md) |
| Library | DELETE | `/api/library/[id]/build-registry` | hardened | [library.md](./library.md) |
| Builders | PATCH | `/api/builders/[id]` | hardened | [builders.md](./builders.md) |
| Admin | POST | `/api/admin/library` | pending | [admin.md](./admin.md) |
| Admin | PATCH | `/api/admin/library` | pending | [admin.md](./admin.md) |
| Admin | PATCH | `/api/admin/submissions/[id]/status` | pending | [admin.md](./admin.md) |
| Integrations | POST | `/api/cloudinary/sign` | pending | [integrations.md](./integrations.md) |
| Integrations | GET | `/api/github/activity` | pending | [integrations.md](./integrations.md) |
| Auth | * | `/api/auth/**` | deferred | — |
