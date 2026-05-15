import { NextResponse } from 'next/server';
import { startOfWeek, endOfWeek } from 'date-fns';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { MAX_VOTES_PER_WEEK, UNVOTE_WINDOW_MS } from '@/lib/enums';
import type { SubmissionRow, VoteRow } from '@/types/database';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: submissionId } = await params;
  const supabase = getSupabase();

  const { data: submission } = (await supabase
    .from('Submission')
    .select('status, voteCount')
    .eq('id', submissionId)
    .maybeSingle()) as { data: Pick<SubmissionRow, 'status' | 'voteCount'> | null };
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (submission.status === 'live' || submission.status === 'not_viable') {
    return NextResponse.json({ error: 'Voting is closed for this problem' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('Vote')
    .select('id')
    .eq('userId', userId)
    .eq('submissionId', submissionId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'Already voted' }, { status: 400 });
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
  const { count: usedThisWeek } = await supabase
    .from('Vote')
    .select('id', { count: 'exact', head: true })
    .eq('userId', userId)
    .gte('votedAt', weekStart)
    .lte('votedAt', weekEnd);

  if ((usedThisWeek ?? 0) >= MAX_VOTES_PER_WEEK) {
    return NextResponse.json(
      {
        error: 'Weekly vote limit reached',
        remaining: 0,
        resetsAt: weekEnd,
      },
      { status: 400 },
    );
  }

  const { error: insertErr } = await supabase
    .from('Vote')
    .insert({ userId, submissionId } as never);
  if (insertErr) {
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }

  const nextCount = (submission.voteCount ?? 0) + 1;
  await supabase
    .from('Submission')
    .update({ voteCount: nextCount } as never)
    .eq('id', submissionId);

  return NextResponse.json({
    voteCount: nextCount,
    remaining: MAX_VOTES_PER_WEEK - (usedThisWeek ?? 0) - 1,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: submissionId } = await params;
  const supabase = getSupabase();

  const { data: vote } = (await supabase
    .from('Vote')
    .select('id, votedAt')
    .eq('userId', userId)
    .eq('submissionId', submissionId)
    .maybeSingle()) as { data: Pick<VoteRow, 'id' | 'votedAt'> | null };
  if (!vote) return NextResponse.json({ error: 'Not voted' }, { status: 400 });

  const elapsed = Date.now() - new Date(vote.votedAt).getTime();
  if (elapsed > UNVOTE_WINDOW_MS) {
    return NextResponse.json(
      { error: 'Unvote window expired. Votes are permanent after 5 minutes.' },
      { status: 400 },
    );
  }

  const { error: delErr } = await supabase
    .from('Vote')
    .delete()
    .eq('userId', userId)
    .eq('submissionId', submissionId);
  if (delErr) {
    return NextResponse.json({ error: 'Failed to unvote' }, { status: 500 });
  }

  const { data: subRow } = (await supabase
    .from('Submission')
    .select('voteCount')
    .eq('id', submissionId)
    .maybeSingle()) as { data: Pick<SubmissionRow, 'voteCount'> | null };
  const newCount = Math.max(0, (subRow?.voteCount ?? 1) - 1);
  await supabase
    .from('Submission')
    .update({ voteCount: newCount } as never)
    .eq('id', submissionId);

  return NextResponse.json({ voteCount: newCount });
}
