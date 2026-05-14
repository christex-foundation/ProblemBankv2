import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyStatusChange } from '@/lib/notifications';

const Schema = z.object({
  status: z.enum([
    'submitted',
    'under_review',
    'research_in_progress',
    'not_viable',
    'live',
  ]),
  libraryEntryId: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.submission.findUnique({
    where: { id },
    select: { status: true, libraryEntryId: true },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.submission.update({
    where: { id },
    data: {
      status: parsed.data.status,
      ...(parsed.data.libraryEntryId !== undefined
        ? { libraryEntryId: parsed.data.libraryEntryId || null }
        : {}),
    },
  });

  // Only notify if status actually changed.
  if (existing.status !== parsed.data.status) {
    notifyStatusChange(id, parsed.data.status).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
