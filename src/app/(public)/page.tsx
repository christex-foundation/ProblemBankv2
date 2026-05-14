import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { SECTORS, URGENCY_LABELS, type UrgencyKey } from '@/lib/enums';

export const dynamic = 'force-dynamic';

interface SearchParams {
  sector?: string;
  urgency?: UrgencyKey;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const where: Prisma.LibraryEntryWhereInput = { publishedAt: { not: null } };
  if (sp.sector) where.sector = sp.sector;
  if (sp.urgency) where.urgency = sp.urgency;

  let entries: Awaited<ReturnType<typeof prisma.libraryEntry.findMany>> = [];
  let dbError: string | null = null;

  try {
    entries = await prisma.libraryEntry.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      include: { _count: { select: { buildRegistry: true } } },
    });
  } catch (err) {
    dbError =
      err instanceof Error
        ? err.message
        : 'Database not reachable. Check DATABASE_URL.';
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
          <Link href="/hackathon" className="underline text-gray-500">
            Hackathon (legacy)
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
            Fill in <code>DATABASE_URL</code> in <code>.env.local</code> after completing Phase 0.
          </p>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">Entries coming soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((e) => {
            const counts = (e as typeof e & { _count: { buildRegistry: number } })._count;
            return (
              <Link
                key={e.id}
                href={`/library/${e.slug}`}
                className="border rounded p-5 hover:shadow-sm transition-shadow block"
              >
                <h2 className="font-semibold leading-tight">{e.title}</h2>
                <p className="text-xs text-gray-600 mt-2">
                  {e.sector} · Urgency: {URGENCY_LABELS[e.urgency as UrgencyKey]} ·{' '}
                  {counts.buildRegistry} builder{counts.buildRegistry === 1 ? '' : 's'}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
