import { getSupabase } from '@/lib/supabase';
import {
  GAINING_TRACTION_WINDOW_DAYS,
  GAINING_TRACTION_MIN_DISTINCT_DAYS,
  type DisplayStatus,
  type UrgencyKey,
} from '@/lib/enums';
import type { SampleFeedEntry } from '@/data/sampleFeedEntries';
import type { SubmissionRow } from '@/types/database';

export type FeedEntry = SampleFeedEntry;

export type FeedSort = 'votes' | 'recent' | 'urgency';
export type FeedStatusFilter = Exclude<DisplayStatus, 'gaining_traction'>;

export interface FeedFilters {
  sort: FeedSort;
  sector?: string;
  urgency?: UrgencyKey;
  status?: FeedStatusFilter;
}

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

type SubmissionWithAuthor = SubmissionRow & {
  user: { id: string; name: string | null } | null;
};

export async function getFeedEntries(filters: FeedFilters): Promise<FeedEntry[]> {
  const supabase = getSupabase();
  let query = supabase.from('Submission').select('*, user:User(id, name)');

  if (filters.sector) query = query.eq('category', filters.sector);
  if (filters.urgency) query = query.eq('urgency', filters.urgency);
  if (filters.status) query = query.eq('status', filters.status);

  query =
    filters.sort === 'recent'
      ? query.order('createdAt', { ascending: false })
      : filters.sort === 'urgency'
        ? query.order('urgency', { ascending: true }).order('voteCount', { ascending: false })
        : query.order('voteCount', { ascending: false });

  const [{ data, error }, gainingTraction] = await Promise.all([
    query,
    getGainingTractionIds(),
  ]);
  if (error) throw error;

  const rows = (data ?? []) as SubmissionWithAuthor[];

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.description,
    sector: row.category,
    urgency: row.urgency,
    status: gainingTraction.has(row.id) ? 'gaining_traction' : row.status,
    voteCount: row.voteCount,
    commentCount: row.commentCount,
    authorName: row.user?.name ?? 'Anonymous',
    submittedAt: row.createdAt,
  }));
}
