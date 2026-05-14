import { NextResponse } from 'next/server';
import { startOfWeek, endOfWeek } from 'date-fns';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MAX_VOTES_PER_WEEK, UNVOTE_WINDOW_MS } from '@/lib/enums';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: submissionId } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { status: true },
  });
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (submission.status === 'live' || submission.status === 'not_viable') {
    return NextResponse.json({ error: 'Voting is closed for this problem' }, { status: 400 });
  }

  const existing = await prisma.vote.findUnique({
    where: { userId_submissionId: { userId, submissionId } },
  });
  if (existing) {
    return NextResponse.json({ error: 'Already voted' }, { status: 400 });
  }

  // ISO week, Monday start, per spec
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const usedThisWeek = await prisma.vote.count({
    where: { userId, votedAt: { gte: weekStart, lte: weekEnd } },
  });
  if (usedThisWeek >= MAX_VOTES_PER_WEEK) {
    return NextResponse.json(
      {
        error: 'Weekly vote limit reached',
        remaining: 0,
        resetsAt: endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
      },
      { status: 400 },
    );
  }

  const [, updated] = await prisma.$transaction([
    prisma.vote.create({ data: { userId, submissionId } }),
    prisma.submission.update({
      where: { id: submissionId },
      data: { voteCount: { increment: 1 } },
      select: { voteCount: true },
    }),
  ]);

  return NextResponse.json({
    voteCount: updated.voteCount,
    remaining: MAX_VOTES_PER_WEEK - usedThisWeek - 1,
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

  const vote = await prisma.vote.findUnique({
    where: { userId_submissionId: { userId, submissionId } },
  });
  if (!vote) return NextResponse.json({ error: 'Not voted' }, { status: 400 });

  const elapsed = Date.now() - vote.votedAt.getTime();
  if (elapsed > UNVOTE_WINDOW_MS) {
    return NextResponse.json(
      { error: 'Unvote window expired. Votes are permanent after 5 minutes.' },
      { status: 400 },
    );
  }

  const [, updated] = await prisma.$transaction([
    prisma.vote.delete({ where: { userId_submissionId: { userId, submissionId } } }),
    prisma.submission.update({
      where: { id: submissionId },
      data: { voteCount: { decrement: 1 } },
      select: { voteCount: true },
    }),
  ]);

  return NextResponse.json({ voteCount: updated.voteCount });
}
