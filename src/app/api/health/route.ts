import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { ok: boolean; error?: string }> = {};

  // DB connectivity — a tiny select against any table.
  try {
    const { error } = await getSupabase()
      .from('User')
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    checks.db = { ok: true };
  } catch (err) {
    checks.db = { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }

  // Env presence (don't log values)
  const envChecks: Array<[string, string]> = [
    ['NEXTAUTH_SECRET', 'NEXTAUTH_SECRET'],
    ['SUPABASE_URL', 'SUPABASE_URL'],
    ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    ['NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'NEXT_PUBLIC_TURNSTILE_SITE_KEY'],
    ['CLOUDINARY_API_KEY', 'CLOUDINARY_API_KEY'],
  ];
  for (const [label, name] of envChecks) {
    checks[`env_${label}`] = { ok: !!process.env[name] };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    { ok: allOk, checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 },
  );
}
