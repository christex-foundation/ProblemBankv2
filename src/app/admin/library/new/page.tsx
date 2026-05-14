import { prisma } from '@/lib/prisma';
import EntryForm from '@/components/admin/EntryForm';

export const dynamic = 'force-dynamic';

export default async function NewLibraryEntryPage() {
  // Offer recent submissions for linking — most-voted under_review or research_in_progress first.
  const submissions = await prisma.submission.findMany({
    where: { libraryEntryId: null },
    orderBy: [{ status: 'asc' }, { voteCount: 'desc' }],
    take: 50,
    select: { id: true, title: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Library entry</h1>
      <EntryForm submissions={submissions} />
    </div>
  );
}
