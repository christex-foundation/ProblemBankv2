import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendOtp, isTwilioConfigured } from '@/lib/twilio';
import { verifyTurnstile } from '@/lib/turnstile';

const Schema = z.object({
  phone: z
    .string()
    .regex(/^\+\d{8,15}$/, 'Phone must be in E.164 format (e.g. +23230xxxxxxx)'),
  channel: z.enum(['sms', 'whatsapp']),
  turnstileToken: z.string().optional(),
});

export async function POST(req: Request) {
  if (!isTwilioConfigured()) {
    return NextResponse.json(
      { error: 'Phone OTP not configured yet. Use Google or GitHub for now.' },
      { status: 503 },
    );
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

  const ip = req.headers.get('x-forwarded-for') ?? undefined;
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return NextResponse.json({ error: 'Bot check failed' }, { status: 400 });
  }

  try {
    await sendOtp(parsed.data.phone, parsed.data.channel);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to send code';
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
