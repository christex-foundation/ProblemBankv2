# Admin

CMS endpoints. In production these require an admin role.

**Auth — DEFERRED.** Every admin route is open in this pass. `TODO(auth)` markers in the routes — once auth lands, the gate is `session.user.role === 'admin'` else `403 not_admin`.

---

## `POST /api/admin/library`

Create a new library entry. Optionally publishes it on create and links a feed submission to it.

### Body

```ts
{
  createdBy: string (uuid),    // TODO(auth): remove (session.user.id)
  slug: string,                // ^[a-z0-9-]+$, 1..80
  title: string,               // 1..200
  problemStatement: string,
  sector: string,              // 1..60
  urgency: 'critical' | 'high' | 'medium' | 'low',
  kitUrl?: string | "" | null,
  demoUrl?: string | "" | null,
  infographicUrl?: string | "" | null,
  linkedSubmissionId?: string | "" | null,
  documents?: Array<{
    docType: 'concept_note' | 'prd' | 'technical_design' | 'user_flows' | 'roadmap' | 'pitch_deck',
    url: string,
    fileName: string  // 1..200
  }>,
  publish?: boolean   // default false → publishedAt = null (draft)
}
```

Schema: `CreateLibraryEntrySchema` in `src/app/api/admin/library/_schemas.ts`.

### Response

`201 Created` —
```ts
{ entry: LibraryEntryRow }
```

### Side effects

- If `documents` has entries, they're inserted with `(libraryEntryId, docType)` unique.
- If `linkedSubmissionId` is set, that submission's `libraryEntryId` is updated.

### Errors

- `400 validation_failed`
- `409 duplicate_slug` — slug is already in use.
- `500 internal_error`

---

## `PATCH /api/admin/library`

Update an existing entry. Body includes the `id`.

### Body

`UpdateLibraryEntrySchema` — same as `CreateLibraryEntrySchema` plus `id: string (uuid)`.

### Response

`200 OK` —
```ts
{ entry: LibraryEntryRow }
```

### Publishing rules

- `publish: true` on an unpublished entry sets `publishedAt = now()`.
- `publish: true` on an already-published entry **preserves** the existing `publishedAt` (re-publishing doesn't bump the date).
- `publish: false` sets `publishedAt = null` (saves as draft, removes from public Library grid).

### Side effects

- `documents` are upserted on `(libraryEntryId, docType)` so a re-uploaded PDF replaces the old row.
- `linkedSubmissionId` reassigns the link.

### Errors

- `400 validation_failed`
- `404 not_found` — entry id doesn't exist.
- `409 duplicate_slug`
- `500 internal_error`

---

## `PATCH /api/admin/submissions/[id]/status`

Move a submission through the status workflow.

### Params

- `id` — Submission UUID.

### Body

```ts
{
  status: 'submitted' | 'under_review' | 'research_in_progress' | 'not_viable' | 'live',
  libraryEntryId?: string | ""   // UUID to link, "" to unlink
}
```

Schema: `UpdateStatusSchema`.

### Response

`200 OK` — `{ ok: true }`.

### Side effects

- `Submission.status` and (optionally) `libraryEntryId` are updated.
- If the status actually changed (`existing.status !== input.status`), `notifyStatusChange(id, input.status)` fires asynchronously and inserts `Notification` rows for the submitter and all distinct prior commenters. The notifications API surface is deferred but rows still write.

### Errors

- `400 validation_failed`
- `404 not_found` — submission doesn't exist.
- `500 internal_error`
