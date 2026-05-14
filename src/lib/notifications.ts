import { prisma } from '@/lib/prisma';
import { type SubmissionStatus } from '@prisma/client';

/**
 * Send notifications to the submitter + everyone who has commented on a submission,
 * triggered by an admin-driven status change.
 */
export async function notifyStatusChange(submissionId: string, newStatus: SubmissionStatus) {
  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      comments: { select: { userId: true }, distinct: ['userId'] },
    },
  });
  if (!sub) return;

  const recipients = new Set<string>();
  recipients.add(sub.userId);
  sub.comments.forEach((c) => recipients.add(c.userId));

  let title = `Status changed: ${sub.title.slice(0, 60)}`;
  let body = `Status is now ${newStatus}.`;
  let link: string | null = `/feed/${submissionId}`;

  if (newStatus === 'live' && sub.libraryEntryId) {
    const entry = await prisma.libraryEntry.findUnique({
      where: { id: sub.libraryEntryId },
      select: { slug: true },
    });
    if (entry) {
      title = `Now in the Library: ${sub.title.slice(0, 60)}`;
      body = 'This problem is now a published Library entry.';
      link = `/library/${entry.slug}`;
    }
  }

  await prisma.notification.createMany({
    data: Array.from(recipients).map((userId) => ({
      userId,
      type: 'status_change' as const,
      title,
      body,
      link,
    })),
  });
}

/**
 * Notify the submitter and everyone who has previously commented (except the new commenter).
 */
export async function notifyNewComment(submissionId: string, commenterId: string) {
  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { comments: { select: { userId: true }, distinct: ['userId'] } },
  });
  if (!sub) return;

  const recipients = new Set<string>();
  if (sub.userId !== commenterId) recipients.add(sub.userId);
  sub.comments.forEach((c) => {
    if (c.userId !== commenterId) recipients.add(c.userId);
  });

  if (recipients.size === 0) return;

  await prisma.notification.createMany({
    data: Array.from(recipients).map((userId) => ({
      userId,
      type: 'new_comment' as const,
      title: `New comment on: ${sub.title.slice(0, 60)}`,
      body: '',
      link: `/feed/${submissionId}`,
    })),
  });
}
