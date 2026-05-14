import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MAX_BIO_LEN } from '@/lib/enums';

const ProfileSchema = z.object({
  name: z.string().min(1).max(80).optional().nullable(),
  bio: z.string().max(MAX_BIO_LEN).optional().nullable(),
  contactEmail: z.string().email().optional().nullable().or(z.literal('')),
  githubUrl: z.string().url().optional().nullable().or(z.literal('')),
  websiteUrl: z.string().url().optional().nullable().or(z.literal('')),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value === '' || value === undefined) data[key] = null;
    else if (value !== null) data[key] = value;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      bio: true,
      contactEmail: true,
      githubUrl: true,
      websiteUrl: true,
    },
  });

  return NextResponse.json({ user });
}
