import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { STATUS_LABELS, type DisplayStatus } from '@/lib/enums';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [byStatus, recentEntries, topBadges] = await Promise.all([
    prisma.submission.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.libraryEntry.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        publishedAt: true,
        _count: { select: { buildRegistry: true } },
      },
    }),
    prisma.libraryEntry.findMany({
      take: 5,
      orderBy: { badgeFetchCount: 'desc' },
      select: { id: true, title: true, slug: true, badgeFetchCount: true },
      where: { badgeFetchCount: { gt: 0 } },
    }),
  ]);

  const statusMap = new Map(byStatus.map((s) => [s.status, s._count._all]));
  const totalSubmissions = byStatus.reduce((acc, s) => acc + s._count._all, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-gray-600 mb-8">
        Total submissions: {totalSubmissions}
      </p>

      <section className="mb-10">
        <h2 className="font-semibold mb-3">Submissions by status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(
            [
              'submitted',
              'under_review',
              'research_in_progress',
              'not_viable',
              'live',
            ] as const
          ).map((s) => (
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
        {recentEntries.length === 0 ? (
          <p className="text-sm text-gray-500">No entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {recentEntries.map((e) => (
              <li key={e.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <Link href={`/library/${e.slug}`} className="font-medium underline">
                    {e.title}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {e.publishedAt ? `Published ${e.publishedAt.toLocaleDateString()}` : 'Draft'} ·{' '}
                    {e._count.buildRegistry} builders
                  </p>
                </div>
                <Link
                  href={`/admin/library/${e.id}/edit`}
                  className="text-sm underline"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-3">Badge engagement (top 5)</h2>
        {topBadges.length === 0 ? (
          <p className="text-sm text-gray-500">No badge fetches yet.</p>
        ) : (
          <ul className="space-y-2">
            {topBadges.map((b) => (
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
