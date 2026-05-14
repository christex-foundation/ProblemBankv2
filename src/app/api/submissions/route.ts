import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyTurnstile } from '@/lib/turnstile';
import {
  MAX_TITLE_LEN,
  CATEGORIES,
} from '@/lib/enums';

const CreateSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE_LEN),
  description: z.string().min(1),
  potentialSolution: z.string().optional(),
  urgency: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.string().min(1).max(60),
  turnstileToken: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const ip = req.headers.get('x-forwarded-for') ?? undefined;
  const ok = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (!ok) {
    return NextResponse.json({ error: 'Bot check failed' }, { status: 400 });
  }

  const submission = await prisma.submission.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title.trim(),
      description: parsed.data.description,
      potentialSolution: parsed.data.potentialSolution,
      urgency: parsed.data.urgency,
      category: parsed.data.category,
    },
  });

  return NextResponse.json({ submission }, { status: 201 });
}

const ListQuerySchema = z.object({
  sort: z.enum(['votes', 'recent', 'urgency']).default('votes'),
  category: z.string().optional(),
  urgency: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  status: z
    .enum(['submitted', 'under_review', 'research_in_progress', 'not_viable', 'live'])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = ListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }
  const { sort, category, urgency, status, limit } = parsed.data;

  const where: Prisma.SubmissionWhereInput = {};
  if (category) where.category = category;
  if (urgency) where.urgency = urgency;
  if (status) where.status = status;

  const orderBy: Prisma.SubmissionOrderByWithRelationInput =
    sort === 'recent'
      ? { createdAt: 'desc' }
      : sort === 'urgency'
        ? { urgency: 'asc' }
        : { voteCount: 'desc' };

  const submissions = await prisma.submission.findMany({
    where,
    orderBy,
    take: limit,
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ submissions });
}
