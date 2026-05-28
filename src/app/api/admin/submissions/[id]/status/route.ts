import { getSupabase } from '@/lib/supabase';
import { notifyStatusChange } from '@/lib/notifications';
import { apiError, apiOk, parseOrError } from '@/lib/api-response';
import { API_ERROR_CODES } from '@/lib/api-error-codes';
import type { SubmissionRow } from '@/types/database';
import { StatusParamsSchema, UpdateStatusSchema } from './_schemas';

// TODO(auth): require session.user.role === 'admin' else 403 not_admin.
// In this pass the route is open.

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const rawParams = await params;
  const parsedParams = parseOrError(StatusParamsSchema, rawParams);
  if (!parsedParams.ok) return parsedParams.response;
  const submissionId = parsedParams.data.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(API_ERROR_CODES.validation_failed, 400, 'Body must be JSON.');
  }

  const parsedBody = parseOrError(UpdateStatusSchema, body);
  if (!parsedBody.ok) return parsedBody.response;
  const input = parsedBody.data;

  const supabase = getSupabase();
  const { data: existing } = (await supabase
    .from('Submission')
    .select('status, libraryEntryId')
    .eq('id', submissionId)
    .maybeSingle()) as { data: Pick<SubmissionRow, 'status' | 'libraryEntryId'> | null };

  if (!existing) {
    return apiError(API_ERROR_CODES.not_found, 404, 'Submission not found.');
  }

  const patch: Record<string, string | null> = { status: input.status };
  if (input.libraryEntryId !== undefined) {
    patch.libraryEntryId = input.libraryEntryId || null;
  }

  const { error } = await supabase
    .from('Submission')
    .update(patch as never)
    .eq('id', submissionId);

  if (error) {
    return apiError(API_ERROR_CODES.internal_error, 500, error.message);
  }

  if (existing.status !== input.status) {
    notifyStatusChange(submissionId, input.status).catch(() => {});
  }

  return apiOk({ ok: true });
}
