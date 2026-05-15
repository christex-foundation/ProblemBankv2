import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { parseGitHubRepo } from '@/lib/github';
import type { BuildRegistryRow } from '@/types/database';

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

  const supabase = getSupabase();
  const { data: entry } = await supabase
    .from('LibraryEntry')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: existing } = await supabase
    .from('BuildRegistry')
    .select('id')
    .eq('userId', userId)
    .eq('libraryEntryId', id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'Already registered' }, { status: 400 });
  }

  const { data, error } = (await supabase
    .from('BuildRegistry')
    .insert({ userId, libraryEntryId: id, repoUrl } as never)
    .select('*, user:User(id, name, githubUrl)')) as {
    data: BuildRegistryRow[] | null;
    error: unknown;
  };
  if (error || !data?.[0]) {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }

  return NextResponse.json({ record: data[0] }, { status: 201 });
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

  const { data, error } = (await getSupabase()
    .from('BuildRegistry')
    .update({ repoUrl } as never)
    .eq('userId', userId)
    .eq('libraryEntryId', id)
    .select('*')) as { data: BuildRegistryRow[] | null; error: unknown };
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  if (!data?.[0]) return NextResponse.json({ error: 'Not registered' }, { status: 404 });
  return NextResponse.json({ record: data[0] });
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

  const { error } = await getSupabase()
    .from('BuildRegistry')
    .delete()
    .eq('userId', userId)
    .eq('libraryEntryId', id);
  if (error) return NextResponse.json({ error: 'Not registered' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
