# Library Build Registry

A "build registry" entry says "I am a builder working on the library entry at this slug." Each user can have at most one row per library entry (DB unique constraint on `(userId, libraryEntryId)`).

`repoUrl` is permissive: any non-`github.com` URL is silently coerced to `null` (matches the QA spec — "GitHub validation: reject non-github.com URLs, null invalid URLs"). The UI surfaces "Last push: ..." only when a valid public repo URL is stored.

---

## `POST /api/library/[id]/build-registry`

Register the caller as a builder on a library entry.

### Auth

**Deferred.** Body includes `userId` (dev identity). `TODO(auth)` marker in the route.

### Params

- `id` — LibraryEntry UUID.

### Body

```ts
{
  userId: string (uuid),       // TODO(auth): remove
  repoUrl?: string (max 300)   // empty or non-github → stored as null
}
```

Schema: `RegisterSchema` in `src/app/api/library/[id]/build-registry/_schemas.ts`.

### Response

`201 Created` —
```ts
{ record: BuildRegistry }
```

### Errors

- `400 validation_failed` — bad body or path.
- `404 not_found` — library entry doesn't exist.
- `409 already_registered` — caller already has a registry row on this entry. Unregister via `DELETE` and re-`POST` to update.
- `500 internal_error` — DB insert failed.

---

## `PATCH /api/library/[id]/build-registry`

Update the caller's repo URL on this entry.

### Params

- `id` — LibraryEntry UUID.

### Body

```ts
{
  userId: string (uuid),       // TODO(auth): remove
  repoUrl?: string (max 300)
}
```

### Response

`200 OK` —
```ts
{ record: BuildRegistry }
```

### Errors

- `400 validation_failed` — bad body or path.
- `404 not_found` — no registry row for `(userId, libraryEntryId)`.
- `500 internal_error` — DB update failed.

---

## `DELETE /api/library/[id]/build-registry?userId=...`

Remove the caller's registry row on this entry.

### Params

- `id` — LibraryEntry UUID (path).
- `userId` — caller UUID (query, **TODO(auth)** — moves to session once auth lands).

### Response

`200 OK` — `{ ok: true }`.

### Errors

- `400 validation_failed` — missing `userId` query or bad path.
- `404 not_found` — DB delete error (also returned if nothing matched, to avoid disclosing whether the row existed).
