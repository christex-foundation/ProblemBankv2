import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { MIN_PASSWORD_LEN, MAX_PASSWORD_LEN } from '@/lib/enums';

const Schema = z.object({
  token: z.string().min(1),
  password: z.string().min(MIN_PASSWORD_LEN).max(MAX_PASSWORD_LEN),
});

export async function POST(req: Request) {
  if (!process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

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

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  let userId: string;
  try {
    const { payload } = await jwtVerify(parsed.data.token, secret);
    if (payload.kind !== 'password-reset' || typeof payload.sub !== 'string') {
      throw new Error('Invalid token');
    }
    userId = payload.sub;
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
