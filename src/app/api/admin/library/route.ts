import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

  const entry = await prisma.libraryEntry.create({
    data: {
      slug: data.slug,
      title: data.title,
      problemStatement: data.problemStatement,
      sector: data.sector,
      urgency: data.urgency,
      kitUrl: emptyToNull(data.kitUrl),
      demoUrl: emptyToNull(data.demoUrl),
      infographicUrl: emptyToNull(data.infographicUrl),
      publishedAt: data.publish ? new Date() : null,
      createdBy: userId,
      documents: { create: data.documents.map((d) => ({
        docType: d.docType,
        cloudinaryUrl: d.url,
        fileName: d.fileName,
      })) },
    },
  });

  const linked = emptyToNull(data.linkedSubmissionId ?? null);
  if (linked) {
    await prisma.submission.update({
      where: { id: linked },
      data: { libraryEntryId: entry.id },
    });
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

  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.libraryEntry.findUnique({
      where: { id: data.id },
      select: { publishedAt: true },
    });
    if (!existing) throw new Error('Not found');

    const e = await tx.libraryEntry.update({
      where: { id: data.id },
      data: {
        slug: data.slug,
        title: data.title,
        problemStatement: data.problemStatement,
        sector: data.sector,
        urgency: data.urgency,
        kitUrl: emptyToNull(data.kitUrl),
        demoUrl: emptyToNull(data.demoUrl),
        infographicUrl: emptyToNull(data.infographicUrl),
        publishedAt: data.publish
          ? existing.publishedAt ?? new Date()
          : null,
      },
    });

    for (const d of data.documents) {
      await tx.document.upsert({
        where: {
          libraryEntryId_docType: { libraryEntryId: e.id, docType: d.docType },
        },
        update: { cloudinaryUrl: d.url, fileName: d.fileName },
        create: {
          libraryEntryId: e.id,
          docType: d.docType,
          cloudinaryUrl: d.url,
          fileName: d.fileName,
        },
      });
    }

    return e;
  });

  const linked = emptyToNull(data.linkedSubmissionId ?? null);
  if (linked) {
    await prisma.submission.update({
      where: { id: linked },
      data: { libraryEntryId: updated.id },
    });
  }

  return NextResponse.json({ entry: updated });
}
