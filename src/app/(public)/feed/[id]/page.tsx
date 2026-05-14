import { notFound } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getGainingTractionIds } from '@/lib/feed';
import {
  STATUS_LABELS,
  URGENCY_LABELS,
  type DisplayStatus,
  type UrgencyKey,
} from '@/lib/enums';
import VoteButton from '@/components/feed/VoteButton';
import CommentThread from '@/components/feed/CommentThread';

export const dynamic = 'force-dynamic';

type SubmissionWithUser = Prisma.SubmissionGetPayload<{
  include: { user: { select: { id: true; name: true } } };
}>;

export default async function SubmissionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  let submission: SubmissionWithUser | null = null;
  let isGainingTraction = false;
  let myVotedAt: Date | null = null;
  let comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    user: { id: string; name: string | null };
  }> = [];

  try {
    submission = await prisma.submission.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } } },
    });
    if (!submission) notFound();

    [isGainingTraction, myVotedAt, comments] = await Promise.all([
      submission.status === 'submitted'
        ? getGainingTractionIds().then((s) => s.has(submission!.id))
        : Promise.resolve(false),
      session?.user
        ? prisma.vote
            .findUnique({
              where: {
                userId_submissionId: {
                  userId: session.user.id,
                  submissionId: submission.id,
                },
              },
              select: { votedAt: true },
            })
            .then((v) => v?.votedAt ?? null)
        : Promise.resolve(null),
      prisma.comment.findMany({
        where: { submissionId: submission.id },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);
  } catch (err) {
    if (!submission) notFound();
    throw err;
  }

  if (!submission) notFound();

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
            initialVotedAt={myVotedAt?.toISOString() ?? null}
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
            by {submission.user.name ?? 'Anonymous'} ·{' '}
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
            <article dangerouslySetInnerHTML={{ __html: submission.potentialSolution }} />
          </>
        )}
      </section>

      <CommentThread
        submissionId={submission.id}
        initialComments={comments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          user: c.user,
        }))}
        open={commentsOpen}
        closedReason={closedReason}
      />
    </main>
  );
}
