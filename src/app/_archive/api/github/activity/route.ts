import { NextResponse } from 'next/server';
import { fetchRepoLastPushed } from '@/lib/github';

export async function GET(req: Request) {
  const repo = new URL(req.url).searchParams.get('repo');
  if (!repo) return NextResponse.json({ error: 'repo query required' }, { status: 400 });
  const lastPushed = await fetchRepoLastPushed(repo);
  return NextResponse.json({ lastPushed });
}
