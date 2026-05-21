# Health

`GET /api/health`

Liveness + readiness check. Used by uptime monitors and the launch runbook.

## Auth

None — public.

## Request

No body, query, or path params.

## Response

```ts
{
  ok: boolean,
  checks: Record<string, { ok: boolean, error?: string }>,
  timestamp: string  // ISO 8601
}
```

Schema: `src/app/api/health/_schemas.ts` → `HealthResponseSchema`.

### Status codes

- `200` — `ok: true`, every check passed.
- `503` — `ok: false`, at least one check failed. The response body still uses the same shape; the failing check has `ok: false` and may include an `error` string.

### Checks

- `db` — service-role connection to Supabase, count-only query on `User`.
- `env_<NAME>` — presence (not value) of `NEXTAUTH_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `CLOUDINARY_API_KEY`.

## Notes

This endpoint deliberately does **not** use the standard `{ error: { code, message } }` envelope. External monitors and dashboards consume the `{ ok, checks }` shape; treating "one env missing" as an API error would force callers to special-case the parse. The 503 status code carries the "something is unhealthy" signal.
