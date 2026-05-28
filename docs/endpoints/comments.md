# Comments

Comments on a submission. Comments close as soon as the submission moves past `submitted` status.

## `GET /api/submissions/[id]/comments`

List comments on a submission, ordered by `createdAt` ascending.

### Auth

None.

### Params

- `id` — submission UUID.

### Response

`200 OK` —
```ts
{ comments: Comment[] }
```

Each `Comment` includes a nested `user: { id, name }`. Schema: `CommentSchema` in `src/app/api/submissions/[id]/comments/_schemas.ts`.

### Errors

- `400 validation_failed` — `id` is not a UUID.
- `500 internal_error` — DB error.

---

## `POST /api/submissions/[id]/comments`

Post a comment on a submission.

### Auth

**Deferred.** Body includes `userId` (dev identity). `TODO(auth)` marker in the route.

### Turnstile

Required. `turnstileToken` in body. Dev fallback applies if `TURNSTILE_SECRET_KEY` is unset.

### Params

- `id` — submission UUID.

### Body

```ts
{
  userId: string (uuid),   // TODO(auth): remove
  content: string (1..2000),
  turnstileToken: string
}
```

Schema: `CreateCommentSchema`.

### Response

`201 Created` —
```ts
{ comment: Comment }
```

### Side effects

- `Submission.commentCount` is incremented by 1.
- `notifyNewComment(submissionId, userId)` fires — inserts `Notification` rows for the submitter and any distinct prior commenters (excluding the new commenter themselves). The notifications domain is itself deferred, but the rows still write.

### Errors

- `400 validation_failed` — schema check failed.
- `400 turnstile_failed` — Turnstile rejected.
- `404 not_found` — submission doesn't exist.
- `403 comment_closed` — submission status is not `submitted` (i.e., admin moved it to `under_review` or beyond).
- `500 internal_error` — DB insert failed.
