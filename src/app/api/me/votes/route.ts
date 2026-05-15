import { NextResponse } from 'next/server';
import { startOfWeek, endOfWeek } from 'date-fns';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { MAX_VOTES_PER_WEEK } from '@/lib/enums';
import type { VoteRow } from '@/types/database';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ votes: [], remaining: MAX_VOTES_PER_WEEK, signedIn: false });
  }
  const userId = session.user.id;
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();

  const { data } = (await getSupabase()
    .from('Vote')
    .select('submissionId, votedAt')
    .eq('userId', userId)
    .gte('votedAt', weekStart)
    .lte('votedAt', weekEnd)) as {
    data: Pick<VoteRow, 'submissionId' | 'votedAt'>[] | null;
  };

  const votes = data ?? [];
  return NextResponse.json({
    votes,
    remaining: Math.max(0, MAX_VOTES_PER_WEEK - votes.length),
    signedIn: true,
  });
}
