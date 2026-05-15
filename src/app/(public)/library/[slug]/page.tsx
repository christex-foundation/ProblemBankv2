import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSupabase } from '@/lib/supabase';
import { URGENCY_LABELS, type UrgencyKey } from '@/lib/enums';
import DocumentTabs from '@/components/library/DocumentTabs';
import BuildRegistry from '@/components/library/BuildRegistry';
import type {
  BuildRegistryRow,
  DocumentRow,
  LibraryEntryRow,
} from '@/types/database';

export const dynamic = 'force-dynamic';

type EntryFull = LibraryEntryRow & {
  documents: DocumentRow[];
  buildRegistry: (BuildRegistryRow & {
    user: { id: string; name: string | null; githubUrl: string | null } | null;
  })[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let entry: Pick<LibraryEntryRow, 'title' | 'problemStatement' | 'publishedAt'> | null = null;
  try {
    const { data } = (await getSupabase()
      .from('LibraryEntry')
      .select('title, problemStatement, publishedAt')
      .eq('slug', slug)
      .maybeSingle()) as {
      data: Pick<LibraryEntryRow, 'title' | 'problemStatement' | 'publishedAt'> | null;
    };
    entry = data;
  } catch {
    // DB error — return minimal metadata.
  }
  if (!entry || !entry.publishedAt) {
    return { title: 'Not found · Problem Bank' };
  }
  const description = entry.problemStatement
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  return {
    title: `${entry.title} · Problem Bank`,
    description,
    openGraph: {
      title: entry.title,
      description,
      type: 'article',
      url: `/library/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: entry.title,
      description,
    },
  };
}

export default async function LibraryEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: entry } = (await getSupabase()
    .from('LibraryEntry')
    .select(
      '*, documents:Document(*), buildRegistry:BuildRegistry(*, user:User(id, name, githubUrl))',
    )
    .eq('slug', slug)
    .maybeSingle()) as { data: EntryFull | null };

  if (!entry || !entry.publishedAt) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold leading-tight">{entry.title}</h1>
        <p className="text-sm text-gray-600 mt-2">
          {entry.sector} · Urgency: {URGENCY_LABELS[entry.urgency as UrgencyKey]} · Published{' '}
          {new Date(entry.publishedAt).toLocaleDateString()}
        </p>
      </header>

      <article
        className="prose max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: entry.problemStatement }}
      />

      {entry.infographicUrl && (
        <iframe
          src={entry.infographicUrl}
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-[500px] border rounded mb-6"
          title={`Infographic: ${entry.title}`}
        />
      )}

      <DocumentTabs documents={entry.documents} />

      {(entry.kitUrl || entry.demoUrl) && (
        <section className="my-8 border rounded p-4">
          <h2 className="font-semibold mb-2">Proof of Concept</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            {entry.kitUrl && (
              <a
                href={entry.kitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Starter kit on GitHub →
              </a>
            )}
            {entry.demoUrl && (
              <a
                href={entry.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Live demo →
              </a>
            )}
          </div>
        </section>
      )}

      <BuildRegistry
        entryId={entry.id}
        entrySlug={entry.slug}
        builders={(entry.buildRegistry ?? []).map((b) => ({
          id: b.id,
          userId: b.userId,
          name: b.user?.name ?? null,
          githubUrl: b.user?.githubUrl ?? null,
          repoUrl: b.repoUrl,
          registeredAt: b.registeredAt,
        }))}
        kitUrl={entry.kitUrl}
        demoUrl={entry.demoUrl}
      />

      <section className="my-8 border-t pt-6 text-sm text-gray-600">
        <h2 className="font-semibold text-gray-800 mb-2">Get in touch</h2>
        <p>
          Investors or development organizations: contact{' '}
          <a href="mailto:eng@christex.foundation" className="underline">
            Christex Foundation
          </a>{' '}
          or reach out to a builder directly via their profile.
        </p>
      </section>
    </main>
  );
}
