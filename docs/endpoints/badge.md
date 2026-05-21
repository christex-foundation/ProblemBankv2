# Badge

`GET /api/badge/[slug]`

Public SVG badge for a published library entry — designed to embed in a README via `![](https://build.christex.foundation/api/badge/<slug>)`.

## Auth

None — public.

## Request

Path params: `slug` — the library entry slug (`^[a-z0-9-]+$`, max 120 chars). Schema: `src/app/api/badge/[slug]/_schemas.ts` → `BadgeParamsSchema`.

## Response

Always `Content-Type: image/svg+xml; charset=utf-8`. Cache headers: `no-cache, no-store, must-revalidate` (badge state changes when the entry's status changes).

### Status codes

- `200` — SVG of `Problem Bank · <title>` and a "Building" right segment.
- `404` — slug not found or malformed. Body is still SVG (`Problem Bank · Not Found / unknown`) so README embeds don't render as broken images. The standard JSON error envelope is **not** used here for the same reason.

## Side effects

On every successful fetch (fire-and-forget):
- Insert a row into `BadgePing` (`libraryEntryId`).
- Increment `LibraryEntry.badgeFetchCount` by 1.

Failures in the telemetry path are swallowed — they must not block the SVG response.

## Notes

The 30-char truncation on the title happens in `route.ts` after the DB read so the badge.ts helper stays simple.
