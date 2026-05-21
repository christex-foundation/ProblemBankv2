# Builders

User-profile editing. Replaces the previous `/api/me/profile` route — in the deferred-auth world the target user is identified by the path `[id]` instead of the session.

## `PATCH /api/builders/[id]`

Update a builder's profile fields. Any field omitted is left untouched; a field set to `""` or `null` is cleared (stored as `NULL`).

### Auth

**Deferred.** Anyone can PATCH any profile in this pass. `TODO(auth)` in the route — once auth lands, the gate is `session.user.id === id` else `403 not_owner`.

### Params

- `id` — User UUID.

### Body

```ts
{
  name?: string | null,         // 1..80
  bio?: string | null,          // ..160
  contactEmail?: string | "" | null,
  githubUrl?: string | "" | null,    // any URL — github.com is not enforced here
  websiteUrl?: string | "" | null
}
```

Schema: `UpdateProfileSchema` in `src/app/api/builders/[id]/_schemas.ts`.

### Response

`200 OK` —
```ts
{ user: Profile }
```

`Profile` includes `id`, `name`, `bio`, `contactEmail`, `githubUrl`, `websiteUrl`.

### Errors

- `400 validation_failed` — bad body or path. Per-field messages in `error.fields`.
- `404 not_found` — no user with that id.
- `500 internal_error` — DB update failed.

## Migration note

`/api/me/profile` has been removed. The `BuilderProfileEditor` component now takes a `userId` prop and posts to `/api/builders/{userId}`.
