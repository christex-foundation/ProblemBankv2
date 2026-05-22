import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import type { LibraryEntryRow } from '@/types/database';

export const dynamic = 'force-dynamic';

type EntryListing = Pick<
  LibraryEntryRow,
  'id' | 'slug' | 'title' | 'sector' | 'publishedAt'
> & {
  buildRegistry: { count: number }[];
  documents: { count: number }[];
};

export default async function AdminLibraryList() {
  const { data } = (await getSupabase()
    .from('LibraryEntry')
    .select(
      'id, slug, title, sector, publishedAt, buildRegistry:BuildRegistry(count), documents:Document(count)',
    )
    .order('createdAt', { ascending: false })) as { data: EntryListing[] | null };

  const entries = data ?? [];

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
          {entries.map((e) => {
            const docCount = e.documents?.[0]?.count ?? 0;
            const builderCount = e.buildRegistry?.[0]?.count ?? 0;
            return (
              <li
                key={e.id}
                className="border rounded p-3 flex flex-wrap items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{e.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {e.sector} ·{' '}
                    {e.publishedAt ? (
                      <span className="text-green-700">
                        Published {new Date(e.publishedAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-yellow-700">Draft</span>
                    )}{' '}
                    · {docCount}/6 docs · {builderCount} builders
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
