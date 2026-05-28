import type { UrgencyKey } from '@/lib/enums';
import {
  SAMPLE_LIBRARY_ENTRIES,
  type SampleLibraryEntry,
} from '@/data/sampleLibraryEntries';

export type LibraryEntry = SampleLibraryEntry;

type BadgeTone =
  | 'default'
  | 'accent'
  | 'muted'
  | 'faint'
  | 'infrastructure'
  | 'social'
  | 'safety';

type BadgeVariant = 'tag' | 'pill' | 'solid';

export interface LibraryQuery {
  sector?: string;
  urgency?: UrgencyKey;
}

/**
 * The Library data seam. Today it serves curated sample entries so the
 * design prototype runs standalone. In production this is the swap point
 * for the Supabase-backed reader — same shape, real source.
 */
export async function getLibraryEntries(
  query: LibraryQuery = {},
): Promise<LibraryEntry[]> {
  let entries = [...SAMPLE_LIBRARY_ENTRIES];
  if (query.sector) entries = entries.filter((e) => e.sector === query.sector);
  if (query.urgency) entries = entries.filter((e) => e.urgency === query.urgency);
  entries.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return entries;
}

export async function getLibraryEntry(
  slug: string,
): Promise<LibraryEntry | null> {
  return SAMPLE_LIBRARY_ENTRIES.find((e) => e.slug === slug) ?? null;
}

/**
 * Map a sector label to a category color token. The token palette only has
 * four buckets, so we group the eight sectors deliberately rather than ad-hoc:
 * civic + people → social, land + grids → infrastructure, capital + flows →
 * safety, accent reserved for the everyday "this matters" cue elsewhere.
 */
export function sectorBadgeTone(sector: string): BadgeTone {
  switch (sector) {
    case 'Health':
    case 'Education':
      return 'social';
    case 'Agriculture':
    case 'Infrastructure':
      return 'infrastructure';
    case 'Finance':
    case 'Logistics':
    case 'Energy':
      return 'safety';
    default:
      return 'muted';
  }
}

export function urgencyBadge(urgency: UrgencyKey): {
  variant: BadgeVariant;
  tone: BadgeTone;
} {
  switch (urgency) {
    case 'critical':
      return { variant: 'solid', tone: 'accent' };
    case 'high':
      return { variant: 'pill', tone: 'accent' };
    case 'medium':
      return { variant: 'pill', tone: 'muted' };
    case 'low':
    default:
      return { variant: 'pill', tone: 'faint' };
  }
}

/**
 * Strip HTML and collapse whitespace from a Tiptap-serialized field to make
 * a plain-text preview. Used for card snippets and the detail-page lede.
 */
export function problemStatementPreview(html: string, max = 160): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}
