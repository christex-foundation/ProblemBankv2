import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyTurnstile } from '@/lib/turnstile';
import { notifyNewComment } from '@/lib/notifications';
import { MAX_COMMENT_LEN } from '@/lib/enums';

const CommentSchema = z.object({
  content: z.string().min(1).max(MAX_COMMENT_LEN),
  turnstileToken: z.string().min(1),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: submissionId } = await params;
  const comments = await prisma.comment.findMany({
    where: { submissionId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ comments });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;
  const { id: submissionId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = CommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const ip = req.headers.get('x-forwarded-for') ?? undefined;
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return NextResponse.json({ error: 'Bot check failed' }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { status: true },
  });
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // Comments are only open on `submitted` (gaining_traction is computed from submitted).
  if (submission.status !== 'submitted') {
    return NextResponse.json({ error: 'Comments are closed for this problem' }, { status: 400 });
  }

  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: { userId, submissionId, content: parsed.data.content },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.submission.update({
      where: { id: submissionId },
      data: { commentCount: { increment: 1 } },
    }),
  ]);

  // Best-effort notification fan-out — don't block the response.
  notifyNewComment(submissionId, userId).catch(() => {});

  return NextResponse.json({ comment }, { status: 201 });
}
