import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminLibraryList() {
  const entries = await prisma.libraryEntry.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      sector: true,
      publishedAt: true,
      _count: { select: { buildRegistry: true, documents: true } },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Library entries</h1>
        <Link
          href="/admin/library/new"
          className="bg-black text-white rounded px-4 py-2 text-sm"
        >
          + New entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-500 text-sm">No entries yet.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="border rounded p-3 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{e.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {e.sector} ·{' '}
                  {e.publishedAt ? (
                    <span className="text-green-700">
                      Published {e.publishedAt.toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-yellow-700">Draft</span>
                  )}{' '}
                  · {e._count.documents}/6 docs · {e._count.buildRegistry} builders
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                {e.publishedAt && (
                  <Link href={`/library/${e.slug}`} className="underline" target="_blank">
                    View
                  </Link>
                )}
                <Link href={`/admin/library/${e.id}/edit`} className="underline">
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
