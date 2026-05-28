import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getSupabase } from '@/lib/supabase';
import { verifyTurnstile } from '@/lib/turnstile';
import { MIN_PASSWORD_LEN, MAX_PASSWORD_LEN } from '@/lib/enums';

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(MIN_PASSWORD_LEN).max(MAX_PASSWORD_LEN),
  name: z.string().min(1).max(80).optional(),
  turnstileToken: z.string().optional(),
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

  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('User')
    .select('id')
    .eq('email', parsed.data.email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: 'Email already registered. Sign in instead.' },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const { error } = await supabase.from('User').insert({
    email: parsed.data.email,
    name: parsed.data.name ?? null,
    passwordHash,
  } as never);
  if (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
