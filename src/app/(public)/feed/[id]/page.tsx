import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { getGainingTractionIds } from '@/lib/feed';
import {
  STATUS_LABELS,
  URGENCY_LABELS,
  type DisplayStatus,
  type UrgencyKey,
} from '@/lib/enums';
import VoteButton from '@/components/feed/VoteButton';
import CommentThread from '@/components/feed/CommentThread';
import type { CommentRow, SubmissionRow, VoteRow } from '@/types/database';

export const dynamic = 'force-dynamic';

type SubmissionWithUser = SubmissionRow & {
  user: { id: string; name: string | null } | null;
};

type CommentWithUser = CommentRow & {
  user: { id: string; name: string | null } | null;
};

export default async function SubmissionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const supabase = getSupabase();

  const { data: submission } = (await supabase
    .from('Submission')
    .select('*, user:User(id, name)')
    .eq('id', id)
    .maybeSingle()) as { data: SubmissionWithUser | null };
  if (!submission) notFound();

  const [isGainingTraction, myVote, comments] = await Promise.all([
    submission.status === 'submitted'
      ? getGainingTractionIds().then((s) => s.has(submission.id))
      : Promise.resolve(false),
    session?.user
      ? (supabase
          .from('Vote')
          .select('votedAt')
          .eq('userId', session.user.id)
          .eq('submissionId', submission.id)
          .maybeSingle() as unknown as Promise<{
          data: Pick<VoteRow, 'votedAt'> | null;
        }>)
      : Promise.resolve({ data: null } as { data: Pick<VoteRow, 'votedAt'> | null }),
    supabase
      .from('Comment')
      .select('*, user:User(id, name)')
      .eq('submissionId', submission.id)
      .order('createdAt', { ascending: true }) as unknown as Promise<{
      data: CommentWithUser[] | null;
    }>,
  ]);

  const myVotedAt = myVote.data?.votedAt ?? null;
  const commentRows = comments.data ?? [];

  const displayStatus: DisplayStatus =
    submission.status === 'submitted' && isGainingTraction
      ? 'gaining_traction'
      : (submission.status as DisplayStatus);

  const votingDisabled = submission.status === 'live' || submission.status === 'not_viable';
  const commentsOpen = submission.status === 'submitted';

  let closedReason: string | undefined;
  if (submission.status === 'under_review' || submission.status === 'research_in_progress') {
    closedReason = 'Comments are closed while Christex Foundation is researching this problem.';
  } else if (submission.status === 'not_viable') {
    closedReason = 'This problem was determined not viable. Comments are closed.';
  } else if (submission.status === 'live') {
    closedReason = 'This problem is now a Library entry. Comments are closed.';
  }

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <VoteButton
            submissionId={submission.id}
            initialCount={submission.voteCount}
            initialVotedAt={myVotedAt}
            disabled={votingDisabled}
            disabledReason={
              submission.status === 'live'
                ? 'This problem is now a Library entry.'
                : 'This problem was determined not viable.'
            }
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight">{submission.title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            by {submission.user?.name ?? 'Anonymous'} ·{' '}
            {new Date(submission.createdAt).toLocaleDateString()}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-3">
            <span>{submission.category}</span>
            <span>Urgency: {URGENCY_LABELS[submission.urgency as UrgencyKey]}</span>
            <span>Status: {STATUS_LABELS[displayStatus]}</span>
          </div>
        </div>
      </div>

      <section className="prose max-w-none mt-8">
        <h2 className="text-lg font-semibold">The problem</h2>
        <article dangerouslySetInnerHTML={{ __html: submission.description }} />

        {submission.potentialSolution && (
          <>
            <h2 className="text-lg font-semibold mt-6">Potential solution</h2>
            <article
              dangerouslySetInnerHTML={{ __html: submission.potentialSolution }}
            />
          </>
        )}
      </section>

      <CommentThread
        submissionId={submission.id}
        initialComments={commentRows.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          parentCommentId: c.parentCommentId,
          user: c.user ?? { id: c.userId, name: null },
        }))}
        open={commentsOpen}
        closedReason={closedReason}
      />
    </main>
  );
}
