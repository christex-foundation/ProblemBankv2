// Server-only Supabase client. Uses the service-role key, which bypasses RLS.
// All Problem Bank data access lives in API routes + server components that
// have already authenticated the caller via NextAuth, so service-role is the
// correct privilege level here. Never import this file from a Client Component.
//
// We deliberately do NOT pass a generic Database type to createClient; the
// supabase-js type machinery is fiddly with hand-written Database types and
// the marginal type safety isn't worth the friction. Consumers cast results
// against the row types in `@/types/database` when they need typed access.

import 'server-only';
import { createClient, type SupabaseClient as RawSupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const globalForSupabase = globalThis as unknown as {
  __supabase?: RawSupabaseClient;
};

function makeClient(): RawSupabaseClient {
  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)',
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: { schema: 'public' },
  });
}

export function getSupabase(): RawSupabaseClient {
  if (!globalForSupabase.__supabase) {
    globalForSupabase.__supabase = makeClient();
  }
  return globalForSupabase.__supabase;
}

export type SupabaseClient = RawSupabaseClient;

/**
 * supabase-js' write builders (`insert`, `update`, `upsert`) default their
 * payload generic to `never` when no Database type is supplied. We assert
 * payloads `as never` at the boundary; consumers should still type their
 * shapes against `@/types/database` row types for editor support.
 *
 * Pattern:
 *   await getSupabase().from('User').insert(payload as never).select('*');
 *   await getSupabase().from('User').update(patch as never).eq('id', id);
 */
