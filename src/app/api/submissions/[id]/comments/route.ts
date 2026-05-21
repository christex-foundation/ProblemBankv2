import { getSupabase } from '@/lib/supabase';
import { verifyTurnstile } from '@/lib/turnstile';
import { notifyNewComment } from '@/lib/notifications';
import { apiError, apiOk, parseOrError } from '@/lib/api-response';
import { API_ERROR_CODES } from '@/lib/api-error-codes';
import type { CommentRow, SubmissionRow } from '@/types/database';
import { CommentParamsSchema, CreateCommentSchema } from './_schemas';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const rawParams = await params;
  const parsedParams = parseOrError(CommentParamsSchema, rawParams);
  if (!parsedParams.ok) return parsedParams.response;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('Comment')
    .select('*, user:User(id, name)')
    .eq('submissionId', parsedParams.data.id)
    .order('createdAt', { ascending: true });

  if (error) return apiError(API_ERROR_CODES.internal_error, 500, error.message);
  return apiOk({ comments: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // TODO(auth): replace dev userId with auth() session.user.id.
  const rawParams = await params;
  const parsedParams = parseOrError(CommentParamsSchema, rawParams);
  if (!parsedParams.ok) return parsedParams.response;
  const submissionId = parsedParams.data.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(API_ERROR_CODES.validation_failed, 400, 'Body must be JSON.');
  }

  const parsedBody = parseOrError(CreateCommentSchema, body);
  if (!parsedBody.ok) return parsedBody.response;
  const input = parsedBody.data;

  const ip = req.headers.get('x-forwarded-for') ?? undefined;
  if (!(await verifyTurnstile(input.turnstileToken, ip))) {
    return apiError(API_ERROR_CODES.turnstile_failed, 400, 'Bot check failed.');
  }

  const supabase = getSupabase();
  const { data: submission } = (await supabase
    .from('Submission')
    .select('status, commentCount')
    .eq('id', submissionId)
    .maybeSingle()) as { data: Pick<SubmissionRow, 'status' | 'commentCount'> | null };

  if (!submission) {
    return apiError(API_ERROR_CODES.not_found, 404, 'Submission not found.');
  }

  // Comments close as soon as a submission moves past `submitted`.
  if (submission.status !== 'submitted') {
    return apiError(
      API_ERROR_CODES.comment_closed,
      403,
      'Comments are closed for this problem.',
    );
  }

  const { data: rows, error } = (await supabase
    .from('Comment')
    .insert({
      userId: input.userId,
      submissionId,
      content: input.content,
    } as never)
    .select('*, user:User(id, name)')) as { data: CommentRow[] | null; error: { message: string } | null };

  if (error || !rows?.[0]) {
    return apiError(
      API_ERROR_CODES.internal_error,
      500,
      error?.message ?? 'Failed to create comment.',
    );
  }

  await supabase
    .from('Submission')
    .update({ commentCount: (submission.commentCount ?? 0) + 1 } as never)
    .eq('id', submissionId);

  notifyNewComment(submissionId, input.userId).catch(() => {});

  return apiOk({ comment: rows[0] }, { status: 201 });
}
