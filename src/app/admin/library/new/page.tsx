import { getSupabase } from '@/lib/supabase';
import EntryForm from '@/components/admin/EntryForm';
import type { SubmissionRow } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function NewLibraryEntryPage() {
  // Offer unlinked submissions for linking, sorted by status then most-voted.
  const { data } = (await getSupabase()
    .from('Submission')
    .select('id, title')
    .is('libraryEntryId', null)
    .order('status', { ascending: true })
    .order('voteCount', { ascending: false })
    .limit(50)) as { data: Pick<SubmissionRow, 'id' | 'title'>[] | null };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Library entry</h1>
      <EntryForm submissions={data ?? []} />
    </div>
  );
}
