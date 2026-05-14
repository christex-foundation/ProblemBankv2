// Helpers for fetching public GitHub repo activity. We do not authenticate by default;
// optionally a token is used to raise the rate limit. Activity is cached 24h via Next.js fetch.

export interface ParsedRepo {
  owner: string;
  repo: string;
}

export function parseGitHubRepo(url: string): ParsedRepo | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname !== 'github.com' && u.hostname !== 'www.github.com') return null;
    const parts = u.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/');
    if (parts.length < 2) return null;
    const [owner, repo] = parts;
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

export async function fetchRepoLastPushed(url: string): Promise<string | null> {
  const parsed = parseGitHubRepo(url);
  if (!parsed) return null;

  const headers: Record<string, string> = {
    'User-Agent': 'problem-bank',
    Accept: 'application/vnd.github+json',
  };
  if (process.env.GITHUB_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_API_TOKEN}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers,
      next: { revalidate: 60 * 60 * 24 }, // 24h cache
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { pushed_at?: string | null };
    return data.pushed_at ?? null;
  } catch {
    return null;
  }
}
