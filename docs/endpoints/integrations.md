# Integrations

External-service helpers.

---

## `POST /api/cloudinary/sign`

Generate signed upload credentials so the browser can upload directly to Cloudinary without ever seeing the API secret.

### Auth

**Deferred.** No gate in this pass. `TODO(auth)` — any authenticated user once auth lands. Must not ship to prod open.

### Body

```ts
{
  folder?: string  // 1..120, defaults to 'problem-bank/submissions'
}
```

Schema: `CloudinarySignSchema` in `src/app/api/cloudinary/sign/_schemas.ts`.

### Response

`200 OK` —
```ts
{
  signature: string,
  timestamp: number,        // Unix seconds
  cloudName: string,        // NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  apiKey: string,           // CLOUDINARY_API_KEY (public)
  folder: string
}
```

### Errors

- `400 validation_failed`
- `500 upload_unconfigured` — one of `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` is missing on the server.

---

## `GET /api/github/activity?repo=...`

Look up the public `pushed_at` timestamp for a GitHub repository. Used by the library page's `BuilderRepoActivity` component to show "Last push: ..." per builder.

### Auth

None.

### Query

```ts
{
  repo: string  // 1..300 — full URL or any string; parseGitHubRepo validates
}
```

Schema: `GithubActivityQuerySchema`.

### Response

`200 OK` —
```ts
{ lastPushed: string | null }   // ISO 8601 or null
```

Returns `null` (not an error) when:
- The URL is not a `github.com` URL.
- The repo doesn't exist or is private (GitHub returns 404 to unauthenticated requests).
- The GitHub API request errors out.

### Caching

The upstream fetch is cached 24h via Next's `next: { revalidate: 86400 }`. Setting `GITHUB_API_TOKEN` raises the rate limit.

### Errors

- `400 validation_failed` — `repo` missing.
