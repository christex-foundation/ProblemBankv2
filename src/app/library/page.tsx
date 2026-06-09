import Link from 'next/link';
import type { Metadata } from 'next';
import { SECTORS, URGENCY_LABELS, type UrgencyKey } from '@/lib/enums';
import {
  Section,
  Container,
  Stack,
  RuleLine,
  GrainOverlay,
} from '@/design/primitives';
import { Eyebrow, Lede } from '@/design/typography';
import {
  getLibraryEntries,
  problemStatementPreview,
  urgencyBadge,
  type LibraryEntry,
} from '@/lib/library';
import { SiteNav } from '@/components/SiteNav';
import { Footer } from '@/components/Footer';
import { FilterDropdown } from '@/components/library/FilterDropdown';
import { Reveal } from '@/design/motion';
import { CommunityProblemMatrix } from '@/components/reports/CommunityProblemMatrix';
import { report as communityNeedsReport } from '@/data/reports/community-needs-assessment';

export const metadata: Metadata = {
  title: 'Library · Problem Bank',
  description:
    'A research-backed index of Sierra Leone’s unsolved problems. Each entry arrives decision-ready, with a full documentation set.',
};

interface SearchParams {
  sector?: string;
  urgency?: UrgencyKey;
  origin?: 'research' | 'community';
  /** Items per page: '6' | '24' | 'all'. Absent/invalid means the default, 12. */
  perPage?: string;
  /** 1-based page index. Absent means page 1. */
  page?: string;
}

const PER_PAGE_DEFAULT = 12;
const PER_PAGE_OPTIONS = [6, 24];

export default async function LibraryIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const allEntries = await getLibraryEntries({
    sector: sp.sector,
    urgency: sp.urgency,
  });
  const entries = sp.origin
    ? allEntries.filter((e) => e.origin === sp.origin)
    : allEntries;

  const hasFilters = Boolean(sp.sector || sp.urgency || sp.origin);

  // Pagination — URL-driven and server-rendered, same as the filters.
  const isAll = sp.perPage === 'all';
  const perPage = isAll
    ? Infinity
    : PER_PAGE_OPTIONS.includes(Number(sp.perPage))
      ? Number(sp.perPage)
      : PER_PAGE_DEFAULT;
  const total = entries.length;
  const pageCount = isAll ? 1 : Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Number(sp.page) || 1), pageCount);
  const start = isAll ? 0 : (page - 1) * perPage;
  const pageEntries = isAll ? entries : entries.slice(start, start + perPage);
  const shownFrom = total === 0 ? 0 : start + 1;
  const shownTo = isAll ? total : Math.min(start + perPage, total);

  // Filter and per-page links reset to page 1 (drop ?page); page nav keeps
  // the active filters and per-page choice.
  const baseSp: SearchParams = {
    sector: sp.sector,
    urgency: sp.urgency,
    origin: sp.origin,
    perPage: sp.perPage,
  };

  const totalEntries = allEntries.length;
  const totalSectors = new Set(allEntries.map((e) => e.sector)).size;
  const totalBuilders = allEntries.reduce(
    (acc, e) => acc + e.builders.length,
    0,
  );

  return (
    <main className="relative bg-background text-foreground min-h-screen flex flex-col">
      <GrainOverlay />
      <SiteNav active="library" />

      <div className="flex-1 flex flex-col">

      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <Section pad="sm">
        <Container size="wide">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-2">
              <Reveal>
                <Eyebrow tone="accent" size="sm">
                  Christex Foundation
                </Eyebrow>
                <Eyebrow tone="muted" size="sm" className="mt-2">
                  Index of problems
                </Eyebrow>
                <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-foreground/45 num">
                  Vol. 01 &middot; 2026
                </p>
              </Reveal>
            </div>

            <div className="col-span-12 md:col-span-10">
              <Reveal delay={90}>
                <LibraryHeadline />
              </Reveal>
              <Reveal delay={180}>
                <Lede tone="muted" className="mt-10 md:mt-12 max-w-[60ch]">
                  A working index of Sierra Leone&rsquo;s unsolved problems.
                  Each entry has been studied, written up, and packaged with
                  the documents a team needs to start building. Two doors fill
                  these shelves: Christex Foundation research, and problems the
                  community raised in the feed.
                </Lede>
              </Reveal>

              {/* Stat strip — full column width, directly under the lede. */}
              <Reveal delay={270} className="mt-10 md:mt-12 grid grid-cols-3 border-t border-foreground/15">
                <StatCell
                  value={String(totalEntries).padStart(2, '0')}
                  label="Entries on the shelf"
                />
                <StatCell
                  value={String(totalSectors).padStart(2, '0')}
                  label="Sectors covered"
                />
                <StatCell
                  value={String(totalBuilders).padStart(2, '0')}
                  label="Builders engaged"
                  accent
                />
              </Reveal>
            </div>
          </div>

          {/* Filter — sticky on scroll so it stays reachable while browsing
             the shelf below; pinned just under the slim top nav. */}
          <div className="sticky top-[56px] z-20 mt-12 md:mt-16 bg-background/95 backdrop-blur-sm">
          <div className="grid grid-cols-12 gap-6 md:gap-10 pt-5 md:pt-6">
            <div className="col-span-12 md:col-span-2">
              <Eyebrow tone="muted" size="sm">
                Filter the shelf
              </Eyebrow>
            </div>
            <div className="col-span-12 md:col-span-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-baseline justify-items-center gap-x-6 lg:gap-x-10 gap-y-3">
                <FilterDropdown
                  label="Sector"
                  active={sp.sector ?? ''}
                  options={[
                    { value: '', label: 'All', href: href({ ...baseSp, sector: undefined }) },
                    ...SECTORS.map((s) => ({
                      value: s,
                      label: s,
                      href: href({ ...baseSp, sector: s }),
                    })),
                  ]}
                />
                <FilterDropdown
                  label="Urgency"
                  active={sp.urgency ?? ''}
                  options={[
                    { value: '', label: 'Any', href: href({ ...baseSp, urgency: undefined }) },
                    ...(Object.keys(URGENCY_LABELS) as UrgencyKey[]).map((u) => ({
                      value: u,
                      label: URGENCY_LABELS[u],
                      href: href({ ...baseSp, urgency: u }),
                    })),
                  ]}
                />
                <FilterDropdown
                  label="Source"
                  active={sp.origin ?? ''}
                  options={[
                    { value: '', label: 'Any', href: href({ ...baseSp, origin: undefined }) },
                    {
                      value: 'research',
                      label: 'Christex research',
                      href: href({ ...baseSp, origin: 'research' }),
                    },
                    {
                      value: 'community',
                      label: 'Community',
                      href: href({ ...baseSp, origin: 'community' }),
                    },
                  ]}
                />
                <FilterDropdown
                  label="Per page"
                  active={sp.perPage ?? ''}
                  options={[
                    { value: '6', label: '6', href: href({ ...baseSp, perPage: '6' }) },
                    { value: '', label: '12', href: href({ ...baseSp, perPage: undefined }) },
                    { value: '24', label: '24', href: href({ ...baseSp, perPage: '24' }) },
                    { value: 'all', label: 'All', href: href({ ...baseSp, perPage: 'all' }) },
                  ]}
                />
              </div>
            </div>
          </div>
          <RuleLine tone="strong" className="mt-6 md:mt-8" />
          </div>

          {/* The shelf — kept inside the hero so the cards sit the same
             distance below the rule as the filter sits above it.
             Borders live on each card (not on the grid background) so empty
             cells in the last row stay invisible. */}
          {entries.length > 0 ? (
            <>
              <ul className="mt-8 md:mt-10 grid grid-cols-1">
                {pageEntries.map((entry, idx) => (
                  <li
                    key={entry.id}
                    className="bg-background border-b border-foreground/15"
                  >
                    <Reveal delay={Math.min(idx * 60, 360)}>
                      <ShelfCard entry={entry} index={start + idx + 1} />
                    </Reveal>
                  </li>
                ))}
              </ul>
              {pageCount > 1 && (
                <Pagination
                  from={shownFrom}
                  to={shownTo}
                  total={total}
                  hasPrev={page > 1}
                  hasNext={page < pageCount}
                  prevHref={href({
                    ...baseSp,
                    page: page - 1 > 1 ? String(page - 1) : undefined,
                  })}
                  nextHref={href({ ...baseSp, page: String(page + 1) })}
                />
              )}
            </>
          ) : (
            <div className="mt-8 md:mt-10">
              <EmptyState hasFilters={hasFilters} />
            </div>
          )}
        </Container>
      </Section>

      {/* ─── Closer ─────────────────────────────────────────────────── */}
      {/* The feed-themed closer ("Raise it on the feed", Visit the feed /
          Raise a problem) is hidden for this milestone while the feed and
          sign-in flows are off the UI. The /feed route still works directly. */}

      </div>

      <Footer />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Pieces
// ─────────────────────────────────────────────────────────────────────

function href(next: SearchParams): string {
  const params = new URLSearchParams();
  if (next.sector) params.set('sector', next.sector);
  if (next.urgency) params.set('urgency', next.urgency);
  if (next.origin) params.set('origin', next.origin);
  if (next.perPage) params.set('perPage', next.perPage);
  if (next.page) params.set('page', next.page);
  const q = params.toString();
  return q ? `/library?${q}` : '/library';
}

/**
 * Minimal page navigation: a "showing X–Y of N" counter flanked by Prev/Next.
 * Server-rendered links; disabled ends render as inert text. Uses scroll={false}
 * so the viewport stays on the shelf when the page changes, matching the filters.
 */
function Pagination({
  from,
  to,
  total,
  hasPrev,
  hasNext,
  prevHref,
  nextHref,
}: {
  from: number;
  to: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  prevHref: string;
  nextHref: string;
}) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const arrow =
    'text-[11px] uppercase tracking-[0.22em] font-semibold transition-soft';
  return (
    <nav
      aria-label="Library pagination"
      className="mt-10 md:mt-12 flex items-center justify-between gap-6"
    >
      {hasPrev ? (
        <Link
          href={prevHref}
          scroll={false}
          className={`${arrow} link-underline text-foreground/70 hover:text-accent`}
        >
          ← Prev
        </Link>
      ) : (
        <span className={`${arrow} text-foreground/25`} aria-hidden>
          ← Prev
        </span>
      )}

      <span className="num text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/55">
        {pad(from)} – {pad(to)} of {pad(total)}
      </span>

      {hasNext ? (
        <Link
          href={nextHref}
          scroll={false}
          className={`${arrow} link-underline text-foreground/70 hover:text-accent`}
        >
          Next →
        </Link>
      ) : (
        <span className={`${arrow} text-foreground/25`} aria-hidden>
          Next →
        </span>
      )}
    </nav>
  );
}

/**
 * Display-scale "LIBRARY" lockup. SVG with textLength so the word stretches
 * to fill the column width — same pattern as the landing-page headlines.
 */
function LibraryHeadline() {
  return (
    <div role="img" aria-label="Library" className="w-full">
      <svg
        viewBox="0 35 1000 195"
        className="block w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <text
          x={0}
          y={218}
          textLength={1000}
          lengthAdjust="spacingAndGlyphs"
          style={{
            fontFamily: 'inherit',
            fontSize: 260,
            fontWeight: 900,
            fill: 'var(--foreground)',
            letterSpacing: '-0.04em',
          }}
        >
          LIBRARY
        </text>
      </svg>
    </div>
  );
}

function StatCell({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="border-l first:border-l-0 border-foreground/15 px-4 py-6 md:px-6 md:py-8 flex flex-col gap-2">
      <span
        className={`num text-4xl md:text-6xl font-semibold tracking-[-0.025em] leading-none ${
          accent ? 'text-accent' : 'text-foreground'
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/55">
        {label}
      </span>
    </div>
  );
}

/**
 * Horizontal shelf card. Left (the clickable link): serial, display title,
 * the summary stacked directly beneath it (matched width), then footer meta
 * (sector, urgency, builders, origin). Right: the problem-bubble viz for
 * entries that carry one, kept a sibling of the link so bubble interactions
 * don't fight the card's navigation. Stacks vertically on small screens.
 */
function ShelfCard({ entry, index }: { entry: LibraryEntry; index: number }) {
  const urgency = urgencyBadge(entry.urgency);
  const preview = problemStatementPreview(entry.problemStatement, 320);
  const builders = entry.builders.length;
  const originLabel =
    entry.origin === 'community' ? 'Community' : 'Christex research';
  // Only the community survey carries a problem-bubble figure today.
  const bubbles =
    entry.slug === 'community-needs-assessment'
      ? communityNeedsReport.communityProblems
      : null;

  return (
    <article className="group h-full flex flex-col md:flex-row">
      {/* Left column — the link. Title, summary beneath it, then footer meta. */}
      <Link
        href={`/library/${entry.slug}`}
        className="flex flex-1 flex-col p-7 md:p-10 transition-soft hover:bg-foreground/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
        <span className="num text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground/35 mb-5">
          №&nbsp;{String(index).padStart(2, '0')}
        </span>

        <h3 className="font-black tracking-[-0.025em] text-3xl md:text-4xl leading-[1.05] group-hover:text-accent transition-soft">
          {entry.title}
        </h3>

        {/* Summary, under the title, same width as the title. */}
        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground/45 mb-3">
            Summary:
          </p>
          <p className="font-serif text-base md:text-[17px] leading-[1.55] text-foreground/75 line-clamp-2">
            {preview}
          </p>
        </div>

        {/* Footer meta */}
        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.22em] font-semibold">
          <span
            title={entry.sector}
            className="min-w-0 truncate border border-foreground/25 px-3 py-1 text-foreground/75 group-hover:border-foreground/60 transition-soft"
          >
            {entry.sector}
          </span>
          <span aria-hidden className="text-foreground/20">
            ·
          </span>
          <span
            className={
              urgency.tone === 'accent' ? 'text-accent' : 'text-foreground/55'
            }
          >
            {URGENCY_LABELS[entry.urgency]}
          </span>
          <span aria-hidden className="text-foreground/20">
            ·
          </span>
          <span className="text-foreground/55 num">
            {builders} {builders === 1 ? 'builder' : 'builders'}
          </span>
          <span
            className={`ml-auto ${
              entry.origin === 'community' ? 'text-accent' : 'text-foreground/45'
            }`}
          >
            {originLabel}
          </span>
        </div>
      </Link>

      {/* Right column — the problem-bubble figure, a sibling of the link so its
         own hover/click interactions stay independent of card navigation. */}
      {bubbles && (
        <div className="md:w-1/2 md:flex-shrink-0 p-5 md:p-6">
          <CommunityProblemMatrix
            bare
            sizeScale={1.4}
            categories={bubbles.categories}
            series={bubbles.series}
          />
        </div>
      )}
    </article>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="py-[14vh] text-center">
      <Stack gap={6} align="center">
        <Eyebrow tone="muted" size="sm" align="center">
          {hasFilters ? 'No matches on this shelf' : 'Coming soon'}
        </Eyebrow>
        <h2 className="font-semibold tracking-[-0.015em] text-3xl md:text-5xl leading-[1.05]">
          {hasFilters ? 'Nothing here yet.' : 'Entries land soon.'}
        </h2>
        <p className="max-w-[40ch] text-base text-foreground/55 leading-[1.6]">
          {hasFilters
            ? 'Try a different sector, urgency, or source, or clear the filters.'
            : 'The first Library entry will appear here once Christex publishes it.'}
        </p>
        {/* "Visit the feed" link hidden for this milestone. */}
        {hasFilters && (
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            <Link
              href="/library"
              className="link-underline text-[11px] uppercase tracking-[0.22em] font-semibold"
            >
              Clear filters
            </Link>
          </div>
        )}
      </Stack>
    </div>
  );
}
