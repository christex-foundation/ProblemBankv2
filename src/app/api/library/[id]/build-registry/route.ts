import { getSupabase } from '@/lib/supabase';
import { parseGitHubRepo } from '@/lib/github';
import { apiError, apiOk, parseOrError } from '@/lib/api-response';
import { API_ERROR_CODES } from '@/lib/api-error-codes';
import type { BuildRegistryRow } from '@/types/database';
import {
  BuildRegistryParamsSchema,
  DeleteQuerySchema,
  RegisterSchema,
  UpdateSchema,
} from './_schemas';

// Silently null any repoUrl that's empty or not a github.com URL. This is the
// QA-spec behavior (`null invalid URLs`) — the UI later shows "Last push: ..."
// only when there's a valid public repo to fetch.
function normalizeRepoUrl(input?: string): string | null {
  if (!input || !input.trim()) return null;
  return parseGitHubRepo(input) ? input.trim() : null;
}

async function parseEntryId(params: Promise<{ id: string }>) {
  const raw = await params;
  return parseOrError(BuildRegistryParamsSchema, raw);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // TODO(auth): replace dev userId with auth() session.user.id.
  const parsedParams = await parseEntryId(params);
  if (!parsedParams.ok) return parsedParams.response;
  const libraryEntryId = parsedParams.data.id;

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const parsedBody = parseOrError(RegisterSchema, body);
  if (!parsedBody.ok) return parsedBody.response;
  const { userId, repoUrl } = parsedBody.data;

  const supabase = getSupabase();
  const { data: entry } = await supabase
    .from('LibraryEntry')
    .select('id')
    .eq('id', libraryEntryId)
    .maybeSingle();
  if (!entry) return apiError(API_ERROR_CODES.not_found, 404, 'Library entry not found.');

  const { data: existing } = await supabase
    .from('BuildRegistry')
    .select('id')
    .eq('userId', userId)
    .eq('libraryEntryId', libraryEntryId)
    .maybeSingle();
  if (existing) {
    return apiError(
      API_ERROR_CODES.already_registered,
      409,
      'You are already registered as a builder on this entry.',
    );
  }

  const { data, error } = (await supabase
    .from('BuildRegistry')
    .insert({ userId, libraryEntryId, repoUrl: normalizeRepoUrl(repoUrl) } as never)
    .select('*')) as { data: BuildRegistryRow[] | null; error: { message: string } | null };

  if (error || !data?.[0]) {
    return apiError(
      API_ERROR_CODES.internal_error,
      500,
      error?.message ?? 'Failed to register.',
    );
  }

  return apiOk({ record: data[0] }, { status: 201 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // TODO(auth): replace dev userId with auth() session.user.id.
  const parsedParams = await parseEntryId(params);
  if (!parsedParams.ok) return parsedParams.response;
  const libraryEntryId = parsedParams.data.id;

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const parsedBody = parseOrError(UpdateSchema, body);
  if (!parsedBody.ok) return parsedBody.response;
  const { userId, repoUrl } = parsedBody.data;

  const { data, error } = (await getSupabase()
    .from('BuildRegistry')
    .update({ repoUrl: normalizeRepoUrl(repoUrl) } as never)
    .eq('userId', userId)
    .eq('libraryEntryId', libraryEntryId)
    .select('*')) as { data: BuildRegistryRow[] | null; error: { message: string } | null };

  if (error) {
    return apiError(API_ERROR_CODES.internal_error, 500, error.message);
  }
  if (!data?.[0]) {
    return apiError(API_ERROR_CODES.not_found, 404, 'Not registered.');
  }
  return apiOk({ record: data[0] });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // TODO(auth): replace dev userId with auth() session.user.id.
  const parsedParams = await parseEntryId(params);
  if (!parsedParams.ok) return parsedParams.response;
  const libraryEntryId = parsedParams.data.id;

  const url = new URL(req.url);
  const parsedQuery = parseOrError(DeleteQuerySchema, Object.fromEntries(url.searchParams));
  if (!parsedQuery.ok) return parsedQuery.response;
  const { userId } = parsedQuery.data;

  const { error } = await getSupabase()
    .from('BuildRegistry')
    .delete()
    .eq('userId', userId)
    .eq('libraryEntryId', libraryEntryId);

  if (error) {
    return apiError(API_ERROR_CODES.not_found, 404, 'Not registered.');
  }
  return apiOk({ ok: true });
}
