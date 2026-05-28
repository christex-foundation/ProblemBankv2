import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import EntryForm from '@/components/admin/EntryForm';
import { type UrgencyKey } from '@/lib/enums';
import type {
  DocumentRow,
  LibraryEntryRow,
  SubmissionRow,
} from '@/types/database';

export const dynamic = 'force-dynamic';

type EntryWithDocs = LibraryEntryRow & { documents: DocumentRow[] };

export default async function EditLibraryEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();

  const [entryResp, submissionsResp] = await Promise.all([
    supabase
      .from('LibraryEntry')
      .select('*, documents:Document(*)')
      .eq('id', id)
      .maybeSingle() as unknown as Promise<{ data: EntryWithDocs | null }>,
    supabase
      .from('Submission')
      .select('id, title')
      .is('libraryEntryId', null)
      .order('status', { ascending: true })
      .order('voteCount', { ascending: false })
      .limit(50) as unknown as Promise<{
      data: Pick<SubmissionRow, 'id' | 'title'>[] | null;
    }>,
  ]);

  const entry = entryResp.data;
  const submissions = submissionsResp.data ?? [];
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
          documents: (entry.documents ?? []).map((d) => ({
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
