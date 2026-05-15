import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { MAX_BIO_LEN } from '@/lib/enums';
import type { UserRow } from '@/types/database';

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

  const patch: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value === '' || value === undefined) patch[key] = null;
    else if (value !== null) patch[key] = value;
  }

  const { data, error } = (await getSupabase()
    .from('User')
    .update(patch as never)
    .eq('id', userId)
    .select('id, name, bio, contactEmail, githubUrl, websiteUrl')) as {
    data: Pick<UserRow, 'id' | 'name' | 'bio' | 'contactEmail' | 'githubUrl' | 'websiteUrl'>[] | null;
    error: unknown;
  };
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

  return NextResponse.json({ user: data?.[0] });
}
