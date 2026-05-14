import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { URGENCY_LABELS, type UrgencyKey } from '@/lib/enums';
import DocumentTabs from '@/components/library/DocumentTabs';
import BuildRegistry from '@/components/library/BuildRegistry';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await prisma.libraryEntry
    .findUnique({
      where: { slug },
      select: { title: true, problemStatement: true, publishedAt: true },
    })
    .catch(() => null);
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

  const entry = await prisma.libraryEntry
    .findUnique({
      where: { slug },
      include: {
        documents: true,
        buildRegistry: {
          include: { user: { select: { id: true, name: true, githubUrl: true } } },
          orderBy: { registeredAt: 'asc' },
        },
      },
    })
    .catch(() => null);

  if (!entry || !entry.publishedAt) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold leading-tight">{entry.title}</h1>
        <p className="text-sm text-gray-600 mt-2">
          {entry.sector} · Urgency: {URGENCY_LABELS[entry.urgency as UrgencyKey]} · Published{' '}
          {entry.publishedAt.toLocaleDateString()}
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
        builders={entry.buildRegistry.map((b) => ({
          id: b.id,
          userId: b.user.id,
          name: b.user.name,
          githubUrl: b.user.githubUrl,
          repoUrl: b.repoUrl,
          registeredAt: b.registeredAt.toISOString(),
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
