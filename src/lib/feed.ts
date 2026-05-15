import { getSupabase } from '@/lib/supabase';
import {
  GAINING_TRACTION_WINDOW_DAYS,
  GAINING_TRACTION_MIN_DISTINCT_DAYS,
} from '@/lib/enums';

/**
 * Gaining Traction is computed at query time — never stored. A submission qualifies when
 * its votes are spread across at least N distinct days inside a rolling M-day window.
 * Computed via the gaining_traction_ids() Postgres function declared in 0001_init.sql.
 */
export async function getGainingTractionIds(): Promise<Set<string>> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('gaining_traction_ids', {
    window_days: GAINING_TRACTION_WINDOW_DAYS,
    min_distinct_days: GAINING_TRACTION_MIN_DISTINCT_DAYS,
  });
  if (error) throw error;
  const rows = (data ?? []) as { submissionId: string }[];
  return new Set(rows.map((r) => r.submissionId));
}
