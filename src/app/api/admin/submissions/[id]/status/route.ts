import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { notifyStatusChange } from '@/lib/notifications';
import type { SubmissionRow } from '@/types/database';

const Schema = z.object({
  status: z.enum([
    'submitted',
    'under_review',
    'research_in_progress',
    'not_viable',
    'live',
  ]),
  libraryEntryId: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const supabase = getSupabase();
  const { data: existing } = (await supabase
    .from('Submission')
    .select('status, libraryEntryId')
    .eq('id', id)
    .maybeSingle()) as {
    data: Pick<SubmissionRow, 'status' | 'libraryEntryId'> | null;
  };
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const patch: Record<string, string | null> = { status: parsed.data.status };
  if (parsed.data.libraryEntryId !== undefined) {
    patch.libraryEntryId = parsed.data.libraryEntryId || null;
  }
  const { error } = await supabase
    .from('Submission')
    .update(patch as never)
    .eq('id', id);
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

  if (existing.status !== parsed.data.status) {
    notifyStatusChange(id, parsed.data.status).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
