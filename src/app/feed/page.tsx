import Link from 'next/link';
import type { Metadata } from 'next';
import {
  SECTORS,
  STATUS_LABELS,
  URGENCY_LABELS,
  type DisplayStatus,
  type UrgencyKey,
} from '@/lib/enums';
import {
  Section,
  Container,
  Stack,
  RuleLine,
} from '@/design/primitives';
import { Eyebrow, Lede, Tagline } from '@/design/typography';
import { SiteNav } from '@/components/SiteNav';
import { Footer } from '@/components/Footer';
import { FilterDropdown } from '@/components/library/FilterDropdown';
import { Reveal } from '@/design/motion';
import { FeedVoteButton } from '@/components/feed/FeedVoteButton';
import { RaiseButton } from '@/components/feed/RaiseButton';
import { RaiseLink } from '@/components/feed/RaiseLink';
import { auth } from '@/lib/auth';
import { getFeedEntries, type FeedEntry } from '@/lib/feed';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Community Feed · Problem Bank',
  description:
    'Problems raised by Sierra Leoneans. Vote on what matters most, and watch what gains traction climb the shelf into the Library.',
};

type SortKey = 'votes' | 'recent' | 'urgency';
type StatusFilter = Exclude<DisplayStatus, 'gaining_traction'>;

interface SearchParams {
  sort?: SortKey;
  sector?: string;
  urgency?: UrgencyKey;
  status?: StatusFilter;
}

const SORT_LABELS: Record<SortKey, string> = {
  votes: 'Most votes',
  recent: 'Recent',
  urgency: 'By urgency',
};

const STATUS_FILTER_KEYS: StatusFilter[] = [
  'submitted',
  'under_review',
  'research_in_progress',
  'live',
  'not_viable',
];

export default async function FeedIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const sort: SortKey = sp.sort ?? 'votes';
  const session = await auth();
  const signedIn = !!session?.user;

  const entries = await getFeedEntries(
    {
      sort,
      sector: sp.sector,
      urgency: sp.urgency,
      status: sp.status,
    },
    session?.user?.id,
  );

  const hasFilters = Boolean(sp.sector || sp.urgency || sp.status);

  const totalVoices = entries.length;
  const totalSectors = new Set(entries.map((e) => e.sector)).size;
  const totalVotes = entries.reduce((acc, e) => acc + e.voteCount, 0);

  return (
    <main className="relative bg-background text-foreground min-h-screen flex flex-col">
      <SiteNav active="feed" />

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
                    Community feed
                  </Eyebrow>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-foreground/45 num">
                    Vol. 01 &middot; 2026
                  </p>
                </Reveal>
              </div>

              <div className="col-span-12 md:col-span-10">
                <Reveal delay={90}>
                  <FeedHeadline />
                </Reveal>
                <Reveal delay={180}>
                  <Lede tone="muted" className="mt-10 md:mt-12 max-w-[60ch]">
                    Problems raised by Sierra Leoneans, voted on by Sierra
                    Leoneans. Three votes per person, per week. What gains
                    traction here gets researched and packaged into the Library
                    on the same standard as the rest.
                  </Lede>
                </Reveal>

                <Reveal
                  delay={270}
                  className="mt-10 md:mt-12 grid grid-cols-3 border-t border-foreground/15"
                >
                  <StatCell
                    value={String(totalVoices).padStart(2, '0')}
                    label="Voices on the feed"
                  />
                  <StatCell
                    value={String(totalSectors).padStart(2, '0')}
                    label="Sectors covered"
                  />
                  <StatCell
                    value={String(totalVotes).padStart(3, '0')}
                    label="Votes cast"
                    accent
                  />
                </Reveal>

                <Reveal delay={360} className="mt-10 md:mt-12 flex flex-wrap gap-3 justify-end">
                  <RaiseButton variant="accent" className="w-full sm:w-[280px]">
                    Raise a problem
                  </RaiseButton>
                  <Link
                    href="/library"
                    className="inline-flex w-full sm:w-[280px] items-center justify-center px-8 py-4 border border-foreground text-foreground text-[11px] uppercase tracking-[0.22em] font-semibold transition-soft hover:bg-foreground hover:text-background"
                  >
                    Browse the library
                  </Link>
                </Reveal>
              </div>
            </div>

            {/* Filter row — sticky on scroll so it stays reachable while
               browsing the list below; pinned just under the slim top nav. */}
            <div className="sticky top-[56px] z-20 mt-12 md:mt-16 bg-background/95 backdrop-blur-sm">
            <div className="grid grid-cols-12 gap-6 md:gap-10 pt-5 md:pt-6">
              <div className="col-span-12 md:col-span-2">
                <Eyebrow tone="muted" size="sm">
                  Filter the feed
                </Eyebrow>
              </div>
              <div className="col-span-12 md:col-span-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 items-baseline justify-items-center gap-x-4 sm:gap-x-8 gap-y-3">
                  <FilterDropdown
                    label="Sort"
                    active={sort === 'votes' ? '' : sort}
                    options={(Object.keys(SORT_LABELS) as SortKey[]).map(
                      (k) => ({
                        value: k === 'votes' ? '' : k,
                        label: SORT_LABELS[k],
                        href: href({ ...sp, sort: k === 'votes' ? undefined : k }),
                      }),
                    )}
                  />
                  <FilterDropdown
                    label="Sector"
                    active={sp.sector ?? ''}
                    options={[
                      {
                        value: '',
                        label: 'All',
                        href: href({ ...sp, sector: undefined }),
                      },
                      ...SECTORS.map((s) => ({
                        value: s,
                        label: s,
                        href: href({ ...sp, sector: s }),
                      })),
                    ]}
                  />
                  <FilterDropdown
                    label="Urgency"
                    active={sp.urgency ?? ''}
                    options={[
                      {
                        value: '',
                        label: 'Any',
                        href: href({ ...sp, urgency: undefined }),
                      },
                      ...(Object.keys(URGENCY_LABELS) as UrgencyKey[]).map(
                        (u) => ({
                          value: u,
                          label: URGENCY_LABELS[u],
                          href: href({ ...sp, urgency: u }),
                        }),
                      ),
                    ]}
                  />
                  <FilterDropdown
                    label="Status"
                    active={sp.status ?? ''}
                    options={[
                      {
                        value: '',
                        label: 'Any',
                        href: href({ ...sp, status: undefined }),
                      },
                      ...STATUS_FILTER_KEYS.map((s) => ({
                        value: s,
                        label: STATUS_LABELS[s],
                        href: href({ ...sp, status: s }),
                      })),
                    ]}
                  />
                </div>
              </div>
            </div>
            <RuleLine tone="strong" className="mt-6 md:mt-8" />
            </div>

            {/* The list — cards stack vertically with hairline dividers; rank
               lives in a fixed left rail so the eye scans the order quickly.

               No pagination here, by design. The feed is a ranked leaderboard
               ("what gains traction climbs the shelf"), so position is the
               information and a continuous scroll reads better than discrete
               pages. The sticky filter above is the primary way to narrow it.
               When the feed grows large enough that DOM weight / first render
               becomes a real cost, reach for "Load more" / infinite scroll
               (append, keep the ranking continuous) rather than the numbered
               page model used on /library. A top-N cap with a "showing top N"
               note is an acceptable interim step. The Library paginates because
               it's a catalog, not a ranking — different metaphor, different UX. */}
            {entries.length > 0 ? (
              <ul className="mt-8 md:mt-10 border-t border-foreground/15">
                {entries.map((entry, idx) => (
                  <li
                    key={entry.id}
                    className="border-b border-foreground/15 last:border-b-0"
                  >
                    <Reveal delay={Math.min(idx * 60, 360)}>
                      <RankCard
                        entry={entry}
                        index={idx + 1}
                        signedIn={signedIn}
                      />
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-8 md:mt-10">
                <EmptyState hasFilters={hasFilters} />
              </div>
            )}
          </Container>
        </Section>

        {/* ─── Closer ─────────────────────────────────────────────────── */}
        <Section pad="md" tone="foreground">
          <Container size="wide">
            <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
              <div className="col-span-12 md:col-span-7">
                <Eyebrow tone="accent" size="sm">
                  Got a problem worth raising?
                </Eyebrow>
                <h2 className="mt-4 font-black tracking-[-0.03em] leading-[0.95] text-[clamp(2.5rem,7vw,5rem)] text-background">
                  Put it on the <span className="text-accent">feed.</span>
                </h2>
                <p className="mt-8 max-w-[55ch] text-base md:text-lg text-background/55 leading-[1.6]">
                  One title, a few sentences, the sector it sits in. Three votes
                  a week per person decide what the community thinks matters
                  most. The top of the feed feeds the Library.
                </p>
              </div>
              <div className="col-span-12 md:col-span-5 flex flex-col sm:flex-row md:flex-col gap-4 md:items-end">
                <RaiseButton
                  variant="accent"
                  className="w-full sm:w-[280px] hover:!bg-background hover:!text-foreground"
                >
                  Raise a problem
                </RaiseButton>
                <Link
                  href="/library"
                  className="inline-flex w-full sm:w-[280px] items-center justify-center px-8 py-4 border border-background text-background text-[11px] uppercase tracking-[0.22em] font-semibold transition-soft hover:bg-background hover:text-foreground"
                >
                  Browse the library
                </Link>
              </div>
            </div>
            <Tagline tone="onDark" align="right" className="mt-20 md:mt-28">
              Different doors. Same{' '}
              <span className="text-accent font-bold not-italic">standard.</span>
            </Tagline>
          </Container>
        </Section>
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
  if (next.sort && next.sort !== 'votes') params.set('sort', next.sort);
  if (next.sector) params.set('sector', next.sector);
  if (next.urgency) params.set('urgency', next.urgency);
  if (next.status) params.set('status', next.status);
  const q = params.toString();
  return q ? `/feed?${q}` : '/feed';
}

/** Display-scale "COMMUNITY FEED" lockup; same stretch pattern as LIBRARY. */
function FeedHeadline() {
  return (
    <div role="img" aria-label="Community Feed" className="w-full">
      <svg
        viewBox="0 0 1000 240"
        className="block w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <text
          x={0}
          y={220}
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
          COMMUNITY FEED
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
    <div className="border-l first:border-l-0 border-foreground/15 px-3 py-5 sm:px-4 sm:py-6 md:px-6 md:py-8 flex flex-col gap-2">
      <span
        className={`num text-3xl sm:text-4xl md:text-6xl font-semibold tracking-[-0.025em] leading-none ${
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
 * Editorial rank card. Left rail carries the serial number and a tall
 * vote tile so the order reads at a glance; right column carries the
 * meta strip, title, body preview, and footer. Whole card is the link.
 */
function RankCard({
  entry,
  index,
  signedIn,
}: {
  entry: FeedEntry;
  index: number;
  signedIn: boolean;
}) {
  const urgencyLabel = URGENCY_LABELS[entry.urgency];
  const statusLabel = STATUS_LABELS[entry.status];
  const isUrgent = entry.urgency === 'critical' || entry.urgency === 'high';
  const isGaining = entry.status === 'gaining_traction';
  const isLive = entry.status === 'live';
  const isNotViable = entry.status === 'not_viable';

  return (
    <article className="group grid grid-cols-12 gap-6 md:gap-8 px-2 py-7 md:py-9 transition-soft hover:bg-foreground/[0.03]">
      {/* Left rail: rank + interactive vote tile. Lives outside the
         content link so clicking the tile doesn't navigate. */}
      <div className="col-span-12 md:col-span-2 flex md:flex-col items-start gap-5 md:gap-3">
        <p className="num text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground/35 md:mb-1">
          №&nbsp;{String(index).padStart(2, '0')}
        </p>
        <FeedVoteButton
          initialCount={entry.voteCount}
          initiallyVoted={entry.viewerVoted ?? false}
          initialVotedAt={entry.viewerVotedAt ?? null}
          submissionId={entry.id}
          signedIn={signedIn}
        />
      </div>

      {/* Right column: meta + title + body + footer — the whole block links
         through to the detail page. */}
      <Link
        href={`/feed/${entry.id}`}
        className="col-span-12 md:col-span-10 flex flex-col gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
          {/* Top meta strip — urgency + sector + status */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.22em] font-semibold">
            <span
              className={
                isUrgent ? 'text-accent' : 'text-foreground/55'
              }
            >
              {urgencyLabel}
            </span>
            <span aria-hidden className="text-foreground/20">
              ·
            </span>
            <span
              title={entry.sector}
              className="border border-foreground/25 px-2.5 py-1 text-foreground/75 group-hover:border-foreground/60 transition-soft"
            >
              {entry.sector}
            </span>
            <span aria-hidden className="text-foreground/20">
              ·
            </span>
            <span
              className={
                isGaining
                  ? 'text-accent'
                  : isLive
                    ? 'text-[var(--cat-infrastructure)]'
                    : isNotViable
                      ? 'text-foreground/30'
                      : 'text-foreground/55'
              }
            >
              {statusLabel}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-black tracking-[-0.025em] text-2xl md:text-[2rem] leading-[1.1] group-hover:text-accent transition-soft max-w-[28ch]">
            {entry.title}
          </h3>

          {/* Body preview */}
          <p className="font-serif text-base md:text-[17px] leading-[1.55] text-foreground/75 max-w-[64ch] line-clamp-3">
            {entry.body}
          </p>

          {/* Footer meta */}
          <div className="pt-4 border-t border-foreground/15 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] font-semibold">
            <span className="flex flex-wrap items-center gap-3">
              <span className="text-foreground/55 num">
                {entry.commentCount}{' '}
                {entry.commentCount === 1 ? 'comment' : 'comments'}
              </span>
              <span aria-hidden className="text-foreground/20">
                ·
              </span>
              <span className="text-foreground/55">
                {entry.authorName}
              </span>
              <span aria-hidden className="text-foreground/20">
                ·
              </span>
              <span className="text-foreground/40">
                {entry.authorLocation}
              </span>
            </span>
            <span
              aria-hidden
              className="text-foreground/40 group-hover:text-accent group-hover:translate-x-1 transition-all duration-200"
            >
              →
            </span>
          </div>
      </Link>
    </article>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="py-[14vh] text-center">
      <Stack gap={6} align="center">
        <Eyebrow tone="muted" size="sm" align="center">
          {hasFilters ? 'No matches on this filter' : 'The feed is open'}
        </Eyebrow>
        <h2 className="font-semibold tracking-[-0.015em] text-3xl md:text-5xl leading-[1.05]">
          {hasFilters ? 'Nothing here yet.' : 'Be the first voice.'}
        </h2>
        <p className="max-w-[40ch] text-base text-foreground/55 leading-[1.6]">
          {hasFilters
            ? 'Try a different sort, sector, urgency, or status, or clear the filters.'
            : 'The feed is the community door into the Library. Raise the first problem and start the conversation.'}
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {hasFilters && (
            <Link
              href="/feed"
              className="link-underline text-[11px] uppercase tracking-[0.22em] font-semibold"
            >
              Clear filters
            </Link>
          )}
          <RaiseLink>Raise a problem</RaiseLink>
        </div>
      </Stack>
    </div>
  );
}
