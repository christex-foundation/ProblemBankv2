import { getSupabase } from '@/lib/supabase';
import type {
  SubmissionStatus,
  SubmissionRow,
  CommentRow,
  LibraryEntryRow,
} from '@/types/database';

/**
 * Notify the submitter + every distinct prior commenter that a submission's status changed.
 */
export async function notifyStatusChange(submissionId: string, newStatus: SubmissionStatus) {
  const supabase = getSupabase();

  const { data: sub } = (await supabase
    .from('Submission')
    .select('title, userId, libraryEntryId')
    .eq('id', submissionId)
    .maybeSingle()) as { data: Pick<SubmissionRow, 'title' | 'userId' | 'libraryEntryId'> | null };
  if (!sub) return;

  const { data: commenters } = (await supabase
    .from('Comment')
    .select('userId')
    .eq('submissionId', submissionId)) as { data: Pick<CommentRow, 'userId'>[] | null };

  const recipients = new Set<string>();
  recipients.add(sub.userId);
  (commenters ?? []).forEach((c) => recipients.add(c.userId));

  let title = `Status changed: ${sub.title.slice(0, 60)}`;
  let body = `Status is now ${newStatus}.`;
  let link: string | null = `/feed/${submissionId}`;

  if (newStatus === 'live' && sub.libraryEntryId) {
    const { data: entry } = (await supabase
      .from('LibraryEntry')
      .select('slug')
      .eq('id', sub.libraryEntryId)
      .maybeSingle()) as { data: Pick<LibraryEntryRow, 'slug'> | null };
    if (entry) {
      title = `Now in the Library: ${sub.title.slice(0, 60)}`;
      body = 'This problem is now a published Library entry.';
      link = `/library/${entry.slug}`;
    }
  }

  const rows = Array.from(recipients).map((userId) => ({
    userId,
    type: 'status_change' as const,
    title,
    body,
    link,
  }));
  if (rows.length > 0) {
    await supabase.from('Notification').insert(rows as never);
  }
}

/**
 * Notify the submitter and every distinct prior commenter (except the new commenter).
 */
export async function notifyNewComment(submissionId: string, commenterId: string) {
  const supabase = getSupabase();

  const { data: sub } = (await supabase
    .from('Submission')
    .select('title, userId')
    .eq('id', submissionId)
    .maybeSingle()) as { data: Pick<SubmissionRow, 'title' | 'userId'> | null };
  if (!sub) return;

  const { data: commenters } = (await supabase
    .from('Comment')
    .select('userId')
    .eq('submissionId', submissionId)) as { data: Pick<CommentRow, 'userId'>[] | null };

  const recipients = new Set<string>();
  if (sub.userId !== commenterId) recipients.add(sub.userId);
  (commenters ?? []).forEach((c) => {
    if (c.userId !== commenterId) recipients.add(c.userId);
  });

  if (recipients.size === 0) return;

  await supabase.from('Notification').insert(
    Array.from(recipients).map((userId) => ({
      userId,
      type: 'new_comment' as const,
      title: `New comment on: ${sub.title.slice(0, 60)}`,
      body: '',
      link: `/feed/${submissionId}`,
    })) as never,
  );
}
