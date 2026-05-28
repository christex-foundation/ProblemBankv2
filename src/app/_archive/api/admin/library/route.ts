import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import type { LibraryEntryRow } from '@/types/database';

const DocSchema = z.object({
  docType: z.enum([
    'concept_note',
    'prd',
    'technical_design',
    'user_flows',
    'roadmap',
    'pitch_deck',
  ]),
  url: z.string().url(),
  fileName: z.string().min(1).max(200),
});

const BaseSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, or dashes'),
  title: z.string().min(1).max(200),
  problemStatement: z.string().min(1),
  sector: z.string().min(1).max(60),
  urgency: z.enum(['critical', 'high', 'medium', 'low']),
  kitUrl: z.string().url().optional().or(z.literal('')).nullable(),
  demoUrl: z.string().url().optional().or(z.literal('')).nullable(),
  infographicUrl: z.string().url().optional().or(z.literal('')).nullable(),
  linkedSubmissionId: z.string().optional().nullable().or(z.literal('')),
  documents: z.array(DocSchema).optional().default([]),
  publish: z.boolean().default(false),
});

const CreateSchema = BaseSchema;
const UpdateSchema = BaseSchema.extend({ id: z.string().min(1) });

function emptyToNull(v: string | null | undefined): string | null {
  if (!v) return null;
  if (v.trim() === '') return null;
  return v;
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

  const data = parsed.data;
  const userId = session.user.id;
  const supabase = getSupabase();

  const { data: entryRows, error: entryErr } = (await supabase
    .from('LibraryEntry')
    .insert({
      slug: data.slug,
      title: data.title,
      problemStatement: data.problemStatement,
      sector: data.sector,
      urgency: data.urgency,
      kitUrl: emptyToNull(data.kitUrl),
      demoUrl: emptyToNull(data.demoUrl),
      infographicUrl: emptyToNull(data.infographicUrl),
      publishedAt: data.publish ? new Date().toISOString() : null,
      createdBy: userId,
    } as never)
    .select('*')) as { data: LibraryEntryRow[] | null; error: unknown };
  if (entryErr || !entryRows?.[0]) {
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
  const entry = entryRows[0];

  if (data.documents.length > 0) {
    await supabase
      .from('Document')
      .insert(
        data.documents.map((d) => ({
          libraryEntryId: entry.id,
          docType: d.docType,
          cloudinaryUrl: d.url,
          fileName: d.fileName,
        })) as never,
      );
  }

  const linked = emptyToNull(data.linkedSubmissionId ?? null);
  if (linked) {
    await supabase
      .from('Submission')
      .update({ libraryEntryId: entry.id } as never)
      .eq('id', linked);
  }

  return NextResponse.json({ entry }, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const supabase = getSupabase();

  const { data: existing } = (await supabase
    .from('LibraryEntry')
    .select('publishedAt')
    .eq('id', data.id)
    .maybeSingle()) as { data: Pick<LibraryEntryRow, 'publishedAt'> | null };
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const publishedAt = data.publish
    ? existing.publishedAt ?? new Date().toISOString()
    : null;

  const { data: updatedRows, error: updErr } = (await supabase
    .from('LibraryEntry')
    .update({
      slug: data.slug,
      title: data.title,
      problemStatement: data.problemStatement,
      sector: data.sector,
      urgency: data.urgency,
      kitUrl: emptyToNull(data.kitUrl),
      demoUrl: emptyToNull(data.demoUrl),
      infographicUrl: emptyToNull(data.infographicUrl),
      publishedAt,
    } as never)
    .eq('id', data.id)
    .select('*')) as { data: LibraryEntryRow[] | null; error: unknown };
  if (updErr || !updatedRows?.[0]) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
  const updated = updatedRows[0];

  if (data.documents.length > 0) {
    await supabase.from('Document').upsert(
      data.documents.map((d) => ({
        libraryEntryId: updated.id,
        docType: d.docType,
        cloudinaryUrl: d.url,
        fileName: d.fileName,
      })) as never,
      { onConflict: 'libraryEntryId,docType' },
    );
  }

  const linked = emptyToNull(data.linkedSubmissionId ?? null);
  if (linked) {
    await supabase
      .from('Submission')
      .update({ libraryEntryId: updated.id } as never)
      .eq('id', linked);
  }

  return NextResponse.json({ entry: updated });
}
