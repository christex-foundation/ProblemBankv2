# `src/server/` — service-repository layer

All new server-side code lives here. The existing helpers under `src/lib/` are legacy
and stay where they are; they will be retired as individual routes are rebuilt.

## Layout

```
src/server/
  db/             # database client(s). Stable import path for the rest of the layer.
  repositories/   # data access. One method = one DB operation. No business logic.
  services/       # business logic. Compose repositories + external clients.
  auth/           # auth-only helpers (session readers, role guards) — added as needed.
  lib/            # shared server helpers (typed errors, etc.).
```

## Layer rules

**Repositories**
- Data access only. Each method maps to a single Supabase query.
- Return typed rows (use the interfaces in `@/types/database`).
- No cross-table orchestration. No external calls. No business rules.
- Throw on unexpected database errors; return `null` for "not found" lookups.

**Services**
- Hold business logic. Compose multiple repositories and external clients
  (Twilio, Resend, Cloudinary, etc.).
- Must not import `NextRequest` / `NextResponse`. Services know nothing about HTTP.
- Return plain data on success. Throw typed errors (`@/server/lib/errors`) on failure.

**Route handlers** (future, in `src/app/api/`)
- Thin. Zod-parse the input, call a service, format the response.
- Translate service-thrown errors into HTTP status codes.

## Import rules

- New code imports from `@/server/*`, never from `@/lib/*`.
- `@/server/*` modules use `import 'server-only'` at the top to prevent client bundling.
- `@/server/db/client` is the only file that reaches into `@/lib/supabase`. Everything
  else in the layer imports from `@/server/db/client`.

## Adding new code

1. Need DB access? Add a method to the appropriate `*.repository.ts` (or create one).
2. Need to orchestrate? Add a method to the appropriate `*.service.ts`.
3. Need to expose it via HTTP? Add a thin route handler in `src/app/api/...`
   that calls the service.
