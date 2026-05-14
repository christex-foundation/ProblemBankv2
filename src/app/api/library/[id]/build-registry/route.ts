import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseGitHubRepo } from '@/lib/github';

const RegisterSchema = z.object({
  repoUrl: z.string().url().max(300).optional().or(z.literal('')),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = RegisterSchema.safeParse(body);
  const rawRepo = parsed.success ? parsed.data.repoUrl : '';
  const repoUrl = rawRepo && parseGitHubRepo(rawRepo) ? rawRepo : null;

  const entry = await prisma.libraryEntry.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existing = await prisma.buildRegistry.findUnique({
    where: { userId_libraryEntryId: { userId, libraryEntryId: id } },
  });
  if (existing) {
    return NextResponse.json({ error: 'Already registered' }, { status: 400 });
  }

  const record = await prisma.buildRegistry.create({
    data: { userId, libraryEntryId: id, repoUrl },
    include: { user: { select: { id: true, name: true, githubUrl: true } } },
  });

  return NextResponse.json({ record }, { status: 201 });
}

const UpdateSchema = z.object({
  repoUrl: z.string().max(300).optional().or(z.literal('')),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const repoUrl =
    parsed.data.repoUrl && parsed.data.repoUrl.trim() !== ''
      ? parseGitHubRepo(parsed.data.repoUrl)
        ? parsed.data.repoUrl
        : null
      : null;

  try {
    const updated = await prisma.buildRegistry.update({
      where: { userId_libraryEntryId: { userId, libraryEntryId: id } },
      data: { repoUrl },
    });
    return NextResponse.json({ record: updated });
  } catch {
    return NextResponse.json({ error: 'Not registered' }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  try {
    await prisma.buildRegistry.delete({
      where: { userId_libraryEntryId: { userId, libraryEntryId: id } },
    });
  } catch {
    return NextResponse.json({ error: 'Not registered' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
