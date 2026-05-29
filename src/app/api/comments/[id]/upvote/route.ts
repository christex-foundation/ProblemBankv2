import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { apiError, apiOk, parseOrError } from '@/lib/api-response';
import { API_ERROR_CODES } from '@/lib/api-error-codes';
import type { CommentRow } from '@/types/database';

const ParamsSchema = z.object({ id: z.string().uuid() });

async function countUpvotes(
  supabase: ReturnType<typeof getSupabase>,
  commentId: string,
): Promise<number> {
  const { count } = await supabase
    .from('CommentVote')
    .select('commentId', { count: 'exact', head: true })
    .eq('commentId', commentId);
  return count ?? 0;
}

async function ensureCommentExists(
  supabase: ReturnType<typeof getSupabase>,
  commentId: string,
): Promise<boolean> {
  const { data } = (await supabase
    .from('Comment')
    .select('id')
    .eq('id', commentId)
    .maybeSingle()) as { data: Pick<CommentRow, 'id'> | null };
  return !!data;
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return apiError(API_ERROR_CODES.unauthorized, 401, 'Sign in required.');
  }

  const parsedParams = parseOrError(ParamsSchema, await params);
  if (!parsedParams.ok) return parsedParams.response;
  const commentId = parsedParams.data.id;

  const supabase = getSupabase();
  if (!(await ensureCommentExists(supabase, commentId))) {
    return apiError(API_ERROR_CODES.not_found, 404, 'Comment not found.');
  }

  // Idempotent: PK conflict on (commentId, userId) means the user already
  // upvoted — we still return the current count.
  const { error: insertErr } = await supabase
    .from('CommentVote')
    .insert({ commentId, userId: session.user.id } as never);

  if (insertErr && !/duplicate key/i.test(insertErr.message)) {
    return apiError(
      API_ERROR_CODES.internal_error,
      500,
      insertErr.message ?? 'Failed to upvote.',
    );
  }

  const upvoteCount = await countUpvotes(supabase, commentId);
  return apiOk({ upvoteCount, viewerUpvoted: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return apiError(API_ERROR_CODES.unauthorized, 401, 'Sign in required.');
  }

  const parsedParams = parseOrError(ParamsSchema, await params);
  if (!parsedParams.ok) return parsedParams.response;
  const commentId = parsedParams.data.id;

  const supabase = getSupabase();
  if (!(await ensureCommentExists(supabase, commentId))) {
    return apiError(API_ERROR_CODES.not_found, 404, 'Comment not found.');
  }

  const { error: delErr } = await supabase
    .from('CommentVote')
    .delete()
    .eq('commentId', commentId)
    .eq('userId', session.user.id);

  if (delErr) {
    return apiError(
      API_ERROR_CODES.internal_error,
      500,
      delErr.message ?? 'Failed to remove upvote.',
    );
  }

  const upvoteCount = await countUpvotes(supabase, commentId);
  return apiOk({ upvoteCount, viewerUpvoted: false });
}
