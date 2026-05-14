import { NextResponse } from 'next/server';
import { startOfWeek, endOfWeek } from 'date-fns';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MAX_VOTES_PER_WEEK } from '@/lib/enums';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ votes: [], remaining: MAX_VOTES_PER_WEEK, signedIn: false });
  }
  const userId = session.user.id;
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const votes = await prisma.vote.findMany({
    where: { userId, votedAt: { gte: weekStart, lte: weekEnd } },
    select: { submissionId: true, votedAt: true },
  });

  return NextResponse.json({
    votes: votes.map((v) => ({ submissionId: v.submissionId, votedAt: v.votedAt.toISOString() })),
    remaining: Math.max(0, MAX_VOTES_PER_WEEK - votes.length),
    signedIn: true,
  });
}
