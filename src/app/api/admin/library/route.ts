import { getSupabase } from '@/lib/supabase';
import { apiError, apiOk, parseOrError } from '@/lib/api-response';
import { API_ERROR_CODES } from '@/lib/api-error-codes';
import type { LibraryEntryRow } from '@/types/database';
import {
  CreateLibraryEntrySchema,
  UpdateLibraryEntrySchema,
} from './_schemas';

// TODO(auth): every method here requires the caller to be an admin. Once
// auth lands, gate with `session.user.role !== 'admin'` and return
// 403 not_admin. In this pass the routes are open and the body carries
// the dev `createdBy` userId on POST.

function emptyToNull(v: string | null | undefined): string | null {
  if (!v) return null;
  if (v.trim() === '') return null;
  return v;
}

async function readJson(req: Request): Promise<unknown | Response> {
  try {
    return await req.json();
  } catch {
    return apiError(API_ERROR_CODES.validation_failed, 400, 'Body must be JSON.');
  }
}

export async function POST(req: Request) {
  const body = await readJson(req);
  if (body instanceof Response) return body;

  const parsed = parseOrError(CreateLibraryEntrySchema, body);
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  const supabase = getSupabase();
  const { data: entryRows, error: entryErr } = (await supabase
    .from('LibraryEntry')
    .insert({
      slug: input.slug,
      title: input.title,
      problemStatement: input.problemStatement,
      sector: input.sector,
      urgency: input.urgency,
      kitUrl: emptyToNull(input.kitUrl),
      demoUrl: emptyToNull(input.demoUrl),
      infographicUrl: emptyToNull(input.infographicUrl),
      publishedAt: input.publish ? new Date().toISOString() : null,
      createdBy: input.createdBy,
    } as never)
    .select('*')) as { data: LibraryEntryRow[] | null; error: { code?: string; message: string } | null };

  if (entryErr || !entryRows?.[0]) {
    // Postgres unique violation code is 23505 — surface as a stable code.
    if (entryErr?.code === '23505') {
      return apiError(API_ERROR_CODES.duplicate_slug, 409, 'Slug already exists.');
    }
    return apiError(
      API_ERROR_CODES.internal_error,
      500,
      entryErr?.message ?? 'Failed to create entry.',
    );
  }
  const entry = entryRows[0];

  const docsForInsert = input.documents ?? [];
  if (docsForInsert.length > 0) {
    await supabase.from('Document').insert(
      docsForInsert.map((d) => ({
        libraryEntryId: entry.id,
        docType: d.docType,
        cloudinaryUrl: d.url,
        fileName: d.fileName,
      })) as never,
    );
  }

  const linked = emptyToNull(input.linkedSubmissionId ?? null);
  if (linked) {
    await supabase
      .from('Submission')
      .update({ libraryEntryId: entry.id } as never)
      .eq('id', linked);
  }

  return apiOk({ entry }, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await readJson(req);
  if (body instanceof Response) return body;

  const parsed = parseOrError(UpdateLibraryEntrySchema, body);
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  const supabase = getSupabase();
  const { data: existing } = (await supabase
    .from('LibraryEntry')
    .select('publishedAt')
    .eq('id', input.id)
    .maybeSingle()) as { data: Pick<LibraryEntryRow, 'publishedAt'> | null };

  if (!existing) {
    return apiError(API_ERROR_CODES.not_found, 404, 'Library entry not found.');
  }

  const publishedAt = input.publish
    ? existing.publishedAt ?? new Date().toISOString()
    : null;

  const { data: updatedRows, error: updErr } = (await supabase
    .from('LibraryEntry')
    .update({
      slug: input.slug,
      title: input.title,
      problemStatement: input.problemStatement,
      sector: input.sector,
      urgency: input.urgency,
      kitUrl: emptyToNull(input.kitUrl),
      demoUrl: emptyToNull(input.demoUrl),
      infographicUrl: emptyToNull(input.infographicUrl),
      publishedAt,
    } as never)
    .eq('id', input.id)
    .select('*')) as { data: LibraryEntryRow[] | null; error: { code?: string; message: string } | null };

  if (updErr || !updatedRows?.[0]) {
    if (updErr?.code === '23505') {
      return apiError(API_ERROR_CODES.duplicate_slug, 409, 'Slug already exists.');
    }
    return apiError(
      API_ERROR_CODES.internal_error,
      500,
      updErr?.message ?? 'Failed to update entry.',
    );
  }
  const updated = updatedRows[0];

  const docsForUpsert = input.documents ?? [];
  if (docsForUpsert.length > 0) {
    await supabase.from('Document').upsert(
      docsForUpsert.map((d) => ({
        libraryEntryId: updated.id,
        docType: d.docType,
        cloudinaryUrl: d.url,
        fileName: d.fileName,
      })) as never,
      { onConflict: 'libraryEntryId,docType' },
    );
  }

  const linked = emptyToNull(input.linkedSubmissionId ?? null);
  if (linked) {
    await supabase
      .from('Submission')
      .update({ libraryEntryId: updated.id } as never)
      .eq('id', linked);
  }

  return apiOk({ entry: updated });
}
