import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { Resend } from 'resend';
import { getSupabase } from '@/lib/supabase';
import { verifyTurnstile } from '@/lib/turnstile';
import type { UserRow } from '@/types/database';

const Schema = z.object({
  email: z.string().email(),
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
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for') ?? undefined;
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return NextResponse.json({ error: 'Bot check failed' }, { status: 400 });
  }

  // Always return success so attackers can't enumerate emails.
  const successResponse = NextResponse.json({ ok: true });

  const { data: user } = (await getSupabase()
    .from('User')
    .select('id, passwordHash')
    .eq('email', parsed.data.email)
    .maybeSingle()) as { data: Pick<UserRow, 'id' | 'passwordHash'> | null };

  if (!user?.passwordHash) return successResponse;
  if (!process.env.NEXTAUTH_SECRET) return successResponse;
  if (!process.env.RESEND_API_KEY) {
    console.warn('Password reset requested but RESEND_API_KEY is not set');
    return successResponse;
  }

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const token = await new SignJWT({ sub: user.id, kind: 'password-reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const url = `${baseUrl}/reset/confirm?token=${token}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'noreply@christex.foundation',
      to: parsed.data.email,
      subject: 'Reset your Problem Bank password',
      html: `<p>Use the link below to reset your password. It expires in one hour.</p>
<p><a href="${url}">${url}</a></p>
<p>If you did not request this, ignore this email.</p>`,
    });
  } catch (err) {
    console.error('Password reset email failed', err);
  }

  return successResponse;
}
