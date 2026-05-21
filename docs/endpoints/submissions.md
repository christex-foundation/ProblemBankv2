# Submissions

Community feed submissions.

## `GET /api/submissions`

List submissions, sortable and filterable.

### Auth

None.

### Query

```ts
{
  sort?: 'votes' | 'recent' | 'urgency',   // default 'votes'
  category?: string,
  urgency?: 'critical' | 'high' | 'medium' | 'low',
  status?: 'submitted' | 'under_review' | 'research_in_progress' | 'not_viable' | 'live',
  limit?: number,                          // 1..100, default 50
}
```

Schema: `ListSubmissionsQuerySchema` in `src/app/api/submissions/_schemas.ts`.

### Response

`200 OK` —
```ts
{
  submissions: Submission[]   // see SubmissionSchema
}
```

Each `Submission` includes a nested `user: { id, name }` for the author. `voteCount` and `commentCount` are denormalized counters maintained by the app.

### Errors

- `400 validation_failed` — bad query params.
- `500 internal_error` — DB error.

---

## `POST /api/submissions`

Create a new submission.

### Auth

**Deferred.** Body currently includes `userId` (dev identity). Marked `TODO(auth)` in the route — swap to `await auth()` when auth lands.

### Turnstile

Required. Body must include a valid `turnstileToken`. In dev, the Turnstile lib has a fallback (`src/lib/turnstile.ts`) that returns `true` if `TURNSTILE_SECRET_KEY` is unset.

### Body

```ts
{
  userId: string (uuid),                   // TODO(auth): remove
  title: string (1..80),
  description: string (1..),
  potentialSolution?: string,
  urgency: 'critical' | 'high' | 'medium' | 'low',
  category: string (1..60),
  turnstileToken: string
}
```

Schema: `CreateSubmissionSchema` in `src/app/api/submissions/_schemas.ts`.

### Response

`201 Created` —
```ts
{ submission: Submission }
```

### Errors

- `400 validation_failed` — schema check failed. `error.fields` lists per-field issues.
- `400 turnstile_failed` — Turnstile rejected the token.
- `500 internal_error` — DB insert failed.
