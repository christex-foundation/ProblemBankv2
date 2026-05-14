import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyTurnstile } from '@/lib/turnstile';
import { MIN_PASSWORD_LEN, MAX_PASSWORD_LEN } from '@/lib/enums';

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(MIN_PASSWORD_LEN).max(MAX_PASSWORD_LEN),
  name: z.string().min(1).max(80).optional(),
  turnstileToken: z.string().min(1),
});

export async function POST(req: Request) {
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

  const ip = req.headers.get('x-forwarded-for') ?? undefined;
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return NextResponse.json({ error: 'Bot check failed' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return NextResponse.json(
      { error: 'Email already registered. Sign in instead.' },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
