import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import EntryForm from '@/components/admin/EntryForm';
import { type UrgencyKey } from '@/lib/enums';

export const dynamic = 'force-dynamic';

export default async function EditLibraryEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [entry, submissions] = await Promise.all([
    prisma.libraryEntry.findUnique({
      where: { id },
      include: { documents: true },
    }),
    prisma.submission.findMany({
      where: { libraryEntryId: null },
      orderBy: [{ status: 'asc' }, { voteCount: 'desc' }],
      take: 50,
      select: { id: true, title: true },
    }),
  ]);

  if (!entry) notFound();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Library entry</h1>
        {entry.publishedAt && (
          <Link
            href={`/library/${entry.slug}`}
            target="_blank"
            className="text-sm underline"
          >
            View live →
          </Link>
        )}
      </div>
      <EntryForm
        initial={{
          id: entry.id,
          slug: entry.slug,
          title: entry.title,
          problemStatement: entry.problemStatement,
          sector: entry.sector,
          urgency: entry.urgency as UrgencyKey,
          kitUrl: entry.kitUrl,
          demoUrl: entry.demoUrl,
          infographicUrl: entry.infographicUrl,
          publishedAt: entry.publishedAt,
          documents: entry.documents.map((d) => ({
            docType: d.docType,
            cloudinaryUrl: d.cloudinaryUrl,
            fileName: d.fileName,
          })),
        }}
        submissions={submissions}
      />
    </div>
  );
}
