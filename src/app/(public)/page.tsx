import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { SECTORS, URGENCY_LABELS, type UrgencyKey } from '@/lib/enums';
import type { LibraryEntryRow } from '@/types/database';

export const dynamic = 'force-dynamic';

interface SearchParams {
  sector?: string;
  urgency?: UrgencyKey;
}

type EntryListing = Pick<
  LibraryEntryRow,
  'id' | 'slug' | 'title' | 'sector' | 'urgency'
> & {
  buildRegistry: { count: number }[];
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  let entries: EntryListing[] = [];
  let dbError: string | null = null;

  try {
    const supabase = getSupabase();
    let query = supabase
      .from('LibraryEntry')
      .select('id, slug, title, sector, urgency, buildRegistry:BuildRegistry(count)')
      .not('publishedAt', 'is', null)
      .order('publishedAt', { ascending: false });
    if (sp.sector) query = query.eq('sector', sp.sector);
    if (sp.urgency) query = query.eq('urgency', sp.urgency);
    const { data, error } = (await query) as { data: EntryListing[] | null; error: unknown };
    if (error) {
      dbError = error instanceof Error ? error.message : 'Database not reachable';
    } else {
      entries = data ?? [];
    }
  } catch (err) {
    dbError =
      err instanceof Error
        ? err.message
        : 'Database not reachable. Check Supabase env vars.';
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">Problem Bank</h1>
        <p className="text-lg text-gray-700 mt-2 max-w-2xl">
          Research-backed problems worth building for in Sierra Leone. Every entry comes with a full
          documentation set — read, download, build, and ship.
        </p>
        <div className="flex flex-wrap gap-3 mt-4 text-sm">
          <Link href="/feed" className="underline">
            Community feed →
          </Link>
        </div>
      </header>

      <section className="mb-8 flex flex-wrap gap-2 text-xs">
        <Link
          href="/"
          className={`px-3 py-1.5 rounded border ${!sp.sector ? 'bg-black text-white border-black' : 'border-gray-200'}`}
        >
          All sectors
        </Link>
        {SECTORS.map((s) => (
          <Link
            key={s}
            href={`/?sector=${encodeURIComponent(s)}`}
            className={`px-3 py-1.5 rounded border ${sp.sector === s ? 'bg-black text-white border-black' : 'border-gray-200'}`}
          >
            {s}
          </Link>
        ))}
      </section>

      {dbError ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-4 text-sm">
          <p className="font-medium">Database not configured.</p>
          <p className="mt-1">{dbError}</p>
          <p className="mt-2">
            Fill in <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> in <code>.env.local</code>, then run the
            migration in <code>supabase/migrations/0001_init.sql</code>.
          </p>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">Entries coming soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((e) => {
            const builders = e.buildRegistry?.[0]?.count ?? 0;
            return (
              <Link
                key={e.id}
                href={`/library/${e.slug}`}
                className="border rounded p-5 hover:shadow-sm transition-shadow block"
              >
                <h2 className="font-semibold leading-tight">{e.title}</h2>
                <p className="text-xs text-gray-600 mt-2">
                  {e.sector} · Urgency: {URGENCY_LABELS[e.urgency as UrgencyKey]} · {builders}{' '}
                  builder{builders === 1 ? '' : 's'}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
