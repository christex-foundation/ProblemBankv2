import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { verifyTurnstile } from '@/lib/turnstile';
import { notifyNewComment } from '@/lib/notifications';
import { MAX_COMMENT_LEN } from '@/lib/enums';
import type { CommentRow, SubmissionRow } from '@/types/database';

const CommentSchema = z.object({
  content: z.string().min(1).max(MAX_COMMENT_LEN),
  turnstileToken: z.string().min(1),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: submissionId } = await params;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('Comment')
    .select('*, user:User(id, name)')
    .eq('submissionId', submissionId)
    .order('createdAt', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;
  const { id: submissionId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = CommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const ip = req.headers.get('x-forwarded-for') ?? undefined;
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return NextResponse.json({ error: 'Bot check failed' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: submission } = (await supabase
    .from('Submission')
    .select('status, commentCount')
    .eq('id', submissionId)
    .maybeSingle()) as { data: Pick<SubmissionRow, 'status' | 'commentCount'> | null };
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // Comments are only open on `submitted` (gaining_traction is computed from submitted).
  if (submission.status !== 'submitted') {
    return NextResponse.json({ error: 'Comments are closed for this problem' }, { status: 400 });
  }

  const { data: rows, error } = (await supabase
    .from('Comment')
    .insert({ userId, submissionId, content: parsed.data.content } as never)
    .select('*, user:User(id, name)')) as { data: CommentRow[] | null; error: unknown };
  if (error || !rows?.[0]) {
    return NextResponse.json({ error: 'Failed to comment' }, { status: 500 });
  }

  await supabase
    .from('Submission')
    .update({ commentCount: (submission.commentCount ?? 0) + 1 } as never)
    .eq('id', submissionId);

  notifyNewComment(submissionId, userId).catch(() => {});

  return NextResponse.json({ comment: rows[0] }, { status: 201 });
}
