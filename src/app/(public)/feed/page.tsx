import Link from 'next/link';
import { startOfWeek, endOfWeek } from 'date-fns';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { getGainingTractionIds } from '@/lib/feed';
import {
  SECTORS,
  type DisplayStatus,
  type UrgencyKey,
  MAX_VOTES_PER_WEEK,
} from '@/lib/enums';
import FeedCard from '@/components/feed/FeedCard';
import type { SubmissionRow, VoteRow } from '@/types/database';

export const dynamic = 'force-dynamic';

type SortKey = 'votes' | 'recent' | 'urgency';

interface SearchParams {
  sort?: SortKey;
  category?: string;
  urgency?: UrgencyKey;
  status?: 'submitted' | 'under_review' | 'research_in_progress' | 'not_viable' | 'live';
}

type SubmissionWithUser = SubmissionRow & {
  user: { id: string; name: string | null } | null;
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'votes', label: 'Top' },
  { key: 'recent', label: 'Recent' },
  { key: 'urgency', label: 'By urgency' },
];

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const sort: SortKey = sp.sort ?? 'votes';

  const session = await auth();

  let submissions: SubmissionWithUser[] = [];
  let gainingIds = new Set<string>();
  const myVotes = new Map<string, Date>();
  let votesRemaining = MAX_VOTES_PER_WEEK;
  let dbError: string | null = null;

  try {
    const supabase = getSupabase();
    let query = supabase
      .from('Submission')
      .select('*, user:User(id, name)')
      .limit(50);
    if (sp.category) query = query.eq('category', sp.category);
    if (sp.urgency) query = query.eq('urgency', sp.urgency);
    if (sp.status) query = query.eq('status', sp.status);
    query =
      sort === 'recent'
        ? query.order('createdAt', { ascending: false })
        : sort === 'urgency'
          ? query.order('urgency', { ascending: true })
          : query.order('voteCount', { ascending: false });

    const [{ data: subs }, gaining] = await Promise.all([
      query as unknown as Promise<{ data: SubmissionWithUser[] | null }>,
      getGainingTractionIds(),
    ]);
    submissions = subs ?? [];
    gainingIds = gaining;

    if (session?.user) {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
      const { data: allUserVotes } = (await supabase
        .from('Vote')
        .select('submissionId, votedAt')
        .eq('userId', session.user.id)
        .gte('votedAt', weekStart)
        .lte('votedAt', weekEnd)) as {
        data: Pick<VoteRow, 'submissionId' | 'votedAt'>[] | null;
      };
      (allUserVotes ?? []).forEach((v) => myVotes.set(v.submissionId, new Date(v.votedAt)));
      votesRemaining = Math.max(0, MAX_VOTES_PER_WEEK - (allUserVotes?.length ?? 0));
    }
  } catch (err) {
    dbError =
      err instanceof Error
        ? err.message
        : 'Database not reachable. Check Supabase env vars.';
  }

  function paramsWith(key: string, value: string | null) {
    const params = new URLSearchParams();
    if (sp.sort) params.set('sort', sp.sort);
    if (sp.category) params.set('category', sp.category);
    if (sp.urgency) params.set('urgency', sp.urgency);
    if (sp.status) params.set('status', sp.status);
    if (value === null) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Community Feed</h1>
          <p className="text-sm text-gray-600">
            Problems raised by Sierra Leoneans. Vote — three per week — on what matters most.
          </p>
          {session?.user && (
            <p className="text-xs text-gray-500 mt-1">
              {votesRemaining} of {MAX_VOTES_PER_WEEK} votes remaining this week
            </p>
          )}
        </div>
        <Link
          href="/feed/submit"
          className="bg-black text-white rounded px-4 py-2 text-sm"
        >
          + Submit
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-3 text-sm">
        {SORT_OPTIONS.map((s) => (
          <Link
            key={s.key}
            href={`/feed${paramsWith('sort', s.key)}`}
            className={`underline ${sort === s.key ? 'font-medium' : 'text-gray-600'}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6 text-xs">
        <Link
          href={`/feed${paramsWith('category', null)}`}
          className={`px-2 py-1 rounded border ${!sp.category ? 'bg-black text-white border-black' : 'border-gray-200'}`}
        >
          All sectors
        </Link>
        {SECTORS.map((s) => (
          <Link
            key={s}
            href={`/feed${paramsWith('category', s)}`}
            className={`px-2 py-1 rounded border ${sp.category === s ? 'bg-black text-white border-black' : 'border-gray-200'}`}
          >
            {s}
          </Link>
        ))}
      </div>

      {dbError ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-4 text-sm">
          <p className="font-medium">Database not configured.</p>
          <p className="mt-1">{dbError}</p>
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-gray-500">No submissions yet.</p>
      ) : (
        <ul className="space-y-3">
          {submissions.map((s) => {
            const displayStatus: DisplayStatus =
              s.status === 'submitted' && gainingIds.has(s.id)
                ? 'gaining_traction'
                : (s.status as DisplayStatus);

            return (
              <FeedCard
                key={s.id}
                id={s.id}
                title={s.title}
                category={s.category}
                urgency={s.urgency as UrgencyKey}
                status={displayStatus}
                voteCount={s.voteCount}
                commentCount={s.commentCount}
                authorName={s.user?.name ?? null}
                myVotedAt={myVotes.get(s.id)?.toISOString() ?? null}
              />
            );
          })}
        </ul>
      )}
    </main>
  );
}
