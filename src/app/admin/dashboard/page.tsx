import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { STATUS_LABELS, type DisplayStatus } from '@/lib/enums';
import type { LibraryEntryRow, SubmissionStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

const STATUSES: SubmissionStatus[] = [
  'submitted',
  'under_review',
  'research_in_progress',
  'not_viable',
  'live',
];

type EntryListing = Pick<
  LibraryEntryRow,
  'id' | 'slug' | 'title' | 'publishedAt' | 'badgeFetchCount'
> & {
  buildRegistry: { count: number }[];
};

export default async function AdminDashboard() {
  const supabase = getSupabase();

  const counts = await Promise.all(
    STATUSES.map((s) =>
      supabase
        .from('Submission')
        .select('id', { count: 'exact', head: true })
        .eq('status', s)
        .then((res) => [s, res.count ?? 0] as const),
    ),
  );
  const statusMap = new Map(counts);
  const totalSubmissions = counts.reduce((acc, [, c]) => acc + c, 0);

  const { data: recentEntries } = (await supabase
    .from('LibraryEntry')
    .select(
      'id, slug, title, publishedAt, badgeFetchCount, buildRegistry:BuildRegistry(count)',
    )
    .order('createdAt', { ascending: false })
    .limit(5)) as { data: EntryListing[] | null };

  const { data: topBadges } = (await supabase
    .from('LibraryEntry')
    .select('id, slug, title, badgeFetchCount')
    .gt('badgeFetchCount', 0)
    .order('badgeFetchCount', { ascending: false })
    .limit(5)) as {
    data: Pick<LibraryEntryRow, 'id' | 'slug' | 'title' | 'badgeFetchCount'>[] | null;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-gray-600 mb-8">Total submissions: {totalSubmissions}</p>

      <section className="mb-10">
        <h2 className="font-semibold mb-3">Submissions by status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/submissions?status=${s}`}
              className="border rounded p-4 hover:shadow-sm transition-shadow"
            >
              <p className="text-xs text-gray-500">{STATUS_LABELS[s as DisplayStatus]}</p>
              <p className="text-2xl font-bold mt-1">{statusMap.get(s) ?? 0}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-semibold mb-3">Recent Library entries</h2>
        {(recentEntries ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">No entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {(recentEntries ?? []).map((e) => (
              <li
                key={e.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <Link href={`/library/${e.slug}`} className="font-medium underline">
                    {e.title}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {e.publishedAt
                      ? `Published ${new Date(e.publishedAt).toLocaleDateString()}`
                      : 'Draft'}{' '}
                    · {e.buildRegistry?.[0]?.count ?? 0} builders
                  </p>
                </div>
                <Link href={`/admin/library/${e.id}/edit`} className="text-sm underline">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-3">Badge engagement (top 5)</h2>
        {(topBadges ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">No badge fetches yet.</p>
        ) : (
          <ul className="space-y-2">
            {(topBadges ?? []).map((b) => (
              <li key={b.id} className="border rounded p-3 flex justify-between">
                <Link href={`/library/${b.slug}`} className="underline">
                  {b.title}
                </Link>
                <span className="text-sm text-gray-600">{b.badgeFetchCount} fetches</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
