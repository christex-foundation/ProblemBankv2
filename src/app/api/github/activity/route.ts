import { fetchRepoLastPushed } from '@/lib/github';
import { apiOk, parseOrError } from '@/lib/api-response';
import { GithubActivityQuerySchema } from './_schemas';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = parseOrError(
    GithubActivityQuerySchema,
    Object.fromEntries(url.searchParams),
  );
  if (!parsed.ok) return parsed.response;

  const lastPushed = await fetchRepoLastPushed(parsed.data.repo);
  return apiOk({ lastPushed });
}
