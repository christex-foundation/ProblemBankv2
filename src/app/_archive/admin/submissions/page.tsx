import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { SECTORS } from '@/lib/enums';
import StatusUpdater from '@/components/admin/StatusUpdater';
import type { SubmissionRow, SubmissionStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

interface SearchParams {
  status?: SubmissionStatus;
  category?: string;
  urgency?: 'critical' | 'high' | 'medium' | 'low';
}

const STATUSES: SubmissionStatus[] = [
  'submitted',
  'under_review',
  'research_in_progress',
  'not_viable',
  'live',
];

type SubmissionRowWithUser = SubmissionRow & {
  user: { name: string | null; email: string | null } | null;
};

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const supabase = getSupabase();
  let query = supabase
    .from('Submission')
    .select('*, user:User(name, email)')
    .order('createdAt', { ascending: false });
  if (sp.status) query = query.eq('status', sp.status);
  if (sp.category) query = query.eq('category', sp.category);
  if (sp.urgency) query = query.eq('urgency', sp.urgency);

  const { data, error } = (await query) as {
    data: SubmissionRowWithUser[] | null;
    error: unknown;
  };

  function paramsWith(key: keyof SearchParams, value: string | null) {
    const params = new URLSearchParams();
    if (sp.status) params.set('status', sp.status);
    if (sp.category) params.set('category', sp.category);
    if (sp.urgency) params.set('urgency', sp.urgency);
    if (value === null) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  const submissions = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Submissions</h1>

      {error ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3 text-sm mb-4">
          Database error — check Supabase credentials.
        </div>
      ) : null}

      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <Link
          href={`/admin/submissions${paramsWith('status', null)}`}
          className={`px-2 py-1 border rounded ${!sp.status ? 'bg-black text-white border-black' : ''}`}
        >
          All statuses
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/submissions${paramsWith('status', s)}`}
            className={`px-2 py-1 border rounded ${sp.status === s ? 'bg-black text-white border-black' : ''}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        <Link
          href={`/admin/submissions${paramsWith('category', null)}`}
          className={`px-2 py-1 border rounded ${!sp.category ? 'bg-black text-white border-black' : ''}`}
        >
          All sectors
        </Link>
        {SECTORS.map((s) => (
          <Link
            key={s}
            href={`/admin/submissions${paramsWith('category', s)}`}
            className={`px-2 py-1 border rounded ${sp.category === s ? 'bg-black text-white border-black' : ''}`}
          >
            {s}
          </Link>
        ))}
      </div>

      {submissions.length === 0 ? (
        <p className="text-gray-500 text-sm">No submissions match.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Submitter</th>
                <th className="py-2 pr-3">Sector</th>
                <th className="py-2 pr-3">Urgency</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Votes</th>
                <th className="py-2 pr-3">Comments</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="py-2 pr-3">
                    <Link href={`/feed/${s.id}`} className="underline" target="_blank">
                      {s.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-gray-600">
                    {s.user?.name ?? s.user?.email ?? 'Anonymous'}
                  </td>
                  <td className="py-2 pr-3 text-gray-600">{s.category}</td>
                  <td className="py-2 pr-3 text-gray-600">{s.urgency}</td>
                  <td className="py-2 pr-3">
                    <StatusUpdater submissionId={s.id} current={s.status} />
                  </td>
                  <td className="py-2 pr-3">{s.voteCount}</td>
                  <td className="py-2 pr-3">{s.commentCount}</td>
                  <td className="py-2 pr-3 text-xs text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
