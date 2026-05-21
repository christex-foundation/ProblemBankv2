import { getSupabase } from '@/lib/supabase';
import { apiError, apiOk, parseOrError } from '@/lib/api-response';
import { API_ERROR_CODES } from '@/lib/api-error-codes';
import type { UserRow } from '@/types/database';
import { BuilderParamsSchema, UpdateProfileSchema } from './_schemas';

// PATCH /api/builders/[id] — update a builder's profile.
//
// TODO(auth): once auth lands, require session.user.id === id else
// return 403 not_owner. In this pass the path :id alone identifies the
// caller — there is no session.

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const rawParams = await params;
  const parsedParams = parseOrError(BuilderParamsSchema, rawParams);
  if (!parsedParams.ok) return parsedParams.response;
  const userId = parsedParams.data.id;

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    return apiError(API_ERROR_CODES.validation_failed, 400, 'Body must be JSON.');
  }

  const parsedBody = parseOrError(UpdateProfileSchema, body);
  if (!parsedBody.ok) return parsedBody.response;

  // Empty string → null; explicit null → null; undefined → leave untouched.
  const patch: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(parsedBody.data)) {
    if (value === '' || value === null) patch[key] = null;
    else if (value !== undefined) patch[key] = value;
  }

  const { data, error } = (await getSupabase()
    .from('User')
    .update(patch as never)
    .eq('id', userId)
    .select('id, name, bio, contactEmail, githubUrl, websiteUrl')) as {
    data: Pick<UserRow, 'id' | 'name' | 'bio' | 'contactEmail' | 'githubUrl' | 'websiteUrl'>[] | null;
    error: { message: string } | null;
  };

  if (error) {
    return apiError(API_ERROR_CODES.internal_error, 500, error.message);
  }
  if (!data?.[0]) {
    return apiError(API_ERROR_CODES.not_found, 404, 'User not found.');
  }

  return apiOk({ user: data[0] });
}
