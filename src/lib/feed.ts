import { getSupabase } from '@/lib/supabase';
import {
  GAINING_TRACTION_WINDOW_DAYS,
  GAINING_TRACTION_MIN_DISTINCT_DAYS,
  type DisplayStatus,
  type UrgencyKey,
} from '@/lib/enums';
import type {
  SampleFeedComment,
  SampleFeedEntry,
} from '@/data/sampleFeedEntries';
import type { CommentRow, SubmissionRow } from '@/types/database';

export type FeedEntry = SampleFeedEntry;

export type FeedSort = 'votes' | 'recent' | 'urgency';
export type FeedStatusFilter = Exclude<DisplayStatus, 'gaining_traction'>;

export interface FeedFilters {
  sort: FeedSort;
  sector?: string;
  urgency?: UrgencyKey;
  status?: FeedStatusFilter;
}

const DEFAULT_AUTHOR_LOCATION = 'Freetown';

type SubmissionWithAuthor = SubmissionRow & {
  user: { id: string; name: string | null } | null;
};

type CommentWithAuthor = CommentRow & {
  user: { id: string; name: string | null } | null;
};

interface CommentUpvoteState {
  /** commentId → total upvote count */
  counts: Map<string, number>;
  /** commentIds the current viewer has upvoted */
  viewerVoted: Set<string>;
}

function mapRowToEntry(
  row: SubmissionWithAuthor,
  gainingTraction?: Set<string>,
  comments?: SampleFeedComment[],
): FeedEntry {
  return {
    id: row.id,
    title: row.title,
    body: row.description,
    sector: row.category,
    urgency: row.urgency,
    status: gainingTraction?.has(row.id) ? 'gaining_traction' : row.status,
    voteCount: row.voteCount,
    commentCount: row.commentCount,
    authorName: row.user?.name ?? 'Anonymous',
    authorLocation: DEFAULT_AUTHOR_LOCATION,
    submittedAt: row.createdAt,
    ...(comments ? { comments } : {}),
  };
}

function authorName(row: CommentWithAuthor): string {
  return row.user?.name ?? 'Anonymous';
}

function shapeComment(
  row: CommentWithAuthor,
  upvotes: CommentUpvoteState,
  replyToName?: string,
): SampleFeedComment {
  return {
    id: row.id,
    authorName: authorName(row),
    authorLocation: DEFAULT_AUTHOR_LOCATION,
    body: row.content,
    createdAt: row.createdAt,
    upvoteCount: upvotes.counts.get(row.id) ?? 0,
    viewerUpvoted: upvotes.viewerVoted.has(row.id),
    ...(replyToName ? { replyToName } : {}),
  };
}

function shapeComments(
  rows: CommentWithAuthor[],
  upvotes: CommentUpvoteState,
): SampleFeedComment[] {
  const repliesByParent = new Map<string, CommentWithAuthor[]>();
  const topLevel: CommentWithAuthor[] = [];

  for (const row of rows) {
    if (row.parentCommentId) {
      const bucket = repliesByParent.get(row.parentCommentId) ?? [];
      bucket.push(row);
      repliesByParent.set(row.parentCommentId, bucket);
    } else {
      topLevel.push(row);
    }
  }

  return topLevel.map((parent) => {
    const replies = (repliesByParent.get(parent.id) ?? []).map((reply) =>
      shapeComment(reply, upvotes, authorName(parent)),
    );
    const parentShape = shapeComment(parent, upvotes);
    return replies.length > 0 ? { ...parentShape, replies } : parentShape;
  });
}

async function loadCommentUpvotes(
  supabase: ReturnType<typeof getSupabase>,
  commentIds: string[],
  viewerId: string | undefined,
): Promise<CommentUpvoteState> {
  if (commentIds.length === 0) {
    return { counts: new Map(), viewerVoted: new Set() };
  }

  const { data, error } = await supabase
    .from('CommentVote')
    .select('commentId, userId')
    .in('commentId', commentIds);
  if (error) throw error;

  const counts = new Map<string, number>();
  const viewerVoted = new Set<string>();
  for (const row of (data ?? []) as { commentId: string; userId: string }[]) {
    counts.set(row.commentId, (counts.get(row.commentId) ?? 0) + 1);
    if (viewerId && row.userId === viewerId) viewerVoted.add(row.commentId);
  }
  return { counts, viewerVoted };
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
  return rows.map((row) => mapRowToEntry(row, gainingTraction));
}

export async function getFeedEntryById(
  id: string,
  viewerId?: string,
): Promise<FeedEntry | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('Submission')
    .select('*, user:User(id, name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: commentRows, error: commentError } = await supabase
    .from('Comment')
    .select('*, user:User!Comment_userId_fkey(id, name)')
    .eq('submissionId', id)
    .order('createdAt', { ascending: true });
  if (commentError) throw commentError;

  const rows = (commentRows ?? []) as CommentWithAuthor[];
  const upvotes = await loadCommentUpvotes(
    supabase,
    rows.map((r) => r.id),
    viewerId,
  );
  const comments = shapeComments(rows, upvotes);
  return mapRowToEntry(data as SubmissionWithAuthor, undefined, comments);
}

export async function getRelatedFeedEntries(
  currentId: string,
  limit = 3,
): Promise<FeedEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('Submission')
    .select('*, user:User(id, name)')
    .neq('id', currentId)
    .order('voteCount', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = (data ?? []) as SubmissionWithAuthor[];
  return rows.map((row) => mapRowToEntry(row));
}
