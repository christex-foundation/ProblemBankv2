import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { verifyTurnstile } from '@/lib/turnstile';
import { MAX_TITLE_LEN } from '@/lib/enums';
import type { SubmissionRow } from '@/types/database';

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
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return NextResponse.json({ error: 'Bot check failed' }, { status: 400 });
  }

  const { data, error } = (await getSupabase()
    .from('Submission')
    .insert({
      userId: session.user.id,
      title: parsed.data.title.trim(),
      description: parsed.data.description,
      potentialSolution: parsed.data.potentialSolution ?? null,
      urgency: parsed.data.urgency,
      category: parsed.data.category,
    } as never)
    .select('*')) as { data: SubmissionRow[] | null; error: unknown };

  if (error) {
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
  return NextResponse.json({ submission: data?.[0] }, { status: 201 });
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

  const supabase = getSupabase();
  let query = supabase
    .from('Submission')
    .select('*, user:User(id, name)')
    .limit(limit);

  if (category) query = query.eq('category', category);
  if (urgency) query = query.eq('urgency', urgency);
  if (status) query = query.eq('status', status);

  query =
    sort === 'recent'
      ? query.order('createdAt', { ascending: false })
      : sort === 'urgency'
        ? query.order('urgency', { ascending: true })
        : query.order('voteCount', { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ submissions: data ?? [] });
}
