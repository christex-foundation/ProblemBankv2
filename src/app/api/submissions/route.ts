import { getSupabase } from '@/lib/supabase';
import { verifyTurnstile } from '@/lib/turnstile';
import { apiError, apiOk, parseOrError } from '@/lib/api-response';
import { API_ERROR_CODES } from '@/lib/api-error-codes';
import type { SubmissionRow } from '@/types/database';
import {
  CreateSubmissionSchema,
  ListSubmissionsQuerySchema,
} from './_schemas';

export async function POST(req: Request) {
  // TODO(auth): replace dev userId with auth() session.user.id once auth lands.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(API_ERROR_CODES.validation_failed, 400, 'Body must be JSON.');
  }

  const parsed = parseOrError(CreateSubmissionSchema, body);
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  const ip = req.headers.get('x-forwarded-for') ?? undefined;
  if (!(await verifyTurnstile(input.turnstileToken, ip))) {
    return apiError(API_ERROR_CODES.turnstile_failed, 400, 'Bot check failed.');
  }

  const { data, error } = (await getSupabase()
    .from('Submission')
    .insert({
      userId: input.userId,
      title: input.title.trim(),
      description: input.description,
      potentialSolution: input.potentialSolution ?? null,
      urgency: input.urgency,
      category: input.category,
    } as never)
    .select('*')) as { data: SubmissionRow[] | null; error: { message: string } | null };

  if (error || !data?.[0]) {
    return apiError(
      API_ERROR_CODES.internal_error,
      500,
      error?.message ?? 'Failed to create submission.',
    );
  }

  return apiOk({ submission: data[0] }, { status: 201 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = parseOrError(
    ListSubmissionsQuerySchema,
    Object.fromEntries(url.searchParams),
  );
  if (!parsed.ok) return parsed.response;
  const { sort, category, urgency, status, limit } = parsed.data;

  const supabase = getSupabase();
  let query = supabase
    .from('Submission')
    .select('*, user:User(id, name)')
    .limit(limit ?? 50);

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
  if (error) {
    return apiError(API_ERROR_CODES.internal_error, 500, error.message);
  }

  return apiOk({ submissions: data ?? [] });
}
