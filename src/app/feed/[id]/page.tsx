import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  STATUS_LABELS,
  URGENCY_LABELS,
  type DisplayStatus,
} from '@/lib/enums';
import {
  Section,
  Container,
  Badge,
  GrainOverlay,
} from '@/design/primitives';
import { Eyebrow, Lede, Tagline } from '@/design/typography';
import { Reveal } from '@/design/motion';
import { SiteNav } from '@/components/SiteNav';
import { initialsFrom } from '@/lib/initials';
import { Footer } from '@/components/Footer';
import { FeedVoteButton } from '@/components/feed/FeedVoteButton';
import { CommentComposerStub } from '@/components/feed/CommentComposerStub';
import { CommentActions } from '@/components/feed/CommentActions';
import { RaiseButton } from '@/components/feed/RaiseButton';
import { auth } from '@/lib/auth';
import type { SampleFeedComment } from '@/data/sampleFeedEntries';
import {
  getFeedEntryById,
  getRelatedFeedEntries,
  type FeedEntry,
} from '@/lib/feed';
import { sectorBadgeTone, urgencyBadge } from '@/lib/library';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entry = await getFeedEntryById(id);
  if (!entry) return { title: 'Not found · Problem Bank' };
  const description = preview(entry.body, 160);
  return {
    title: `${entry.title} · Community Feed`,
    description,
    openGraph: {
      title: entry.title,
      description,
      type: 'article',
      url: `/feed/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: entry.title,
      description,
    },
  };
}

export default async function FeedEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const signedIn = !!session?.user;
  const entry = await getFeedEntryById(id, session?.user?.id);
  if (!entry) notFound();

  const related = await getRelatedFeedEntries(entry.id, 3);
  const repliesOpen =
    entry.status === 'submitted' || entry.status === 'gaining_traction';

  const sectorTone = sectorBadgeTone(entry.sector);
  const urgency = urgencyBadge(entry.urgency);
  const statusCopy = statusMicrocopy(entry.status);
  const totalComments = countComments(entry.comments ?? []);
  const submittedDate = new Date(entry.submittedAt).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric', year: 'numeric' },
  );

  return (
    <main className="relative bg-background text-foreground min-h-screen flex flex-col">
      <GrainOverlay />
      <SiteNav active="feed" />

      <article className="flex-1 font-serif">
        {/* ─── Hero ──────────────────────────────────────────────── */}
        <Section
          pad="sm"
          className="!pt-[2vh] md:!pt-[3vh] !pb-[3vh] md:!pb-[5vh]"
        >
          <Container size="wide">
            <Reveal className="mb-8 md:mb-12 text-[11px] uppercase tracking-[0.22em] text-foreground/55">
              <Link
                href="/feed"
                className="link-underline hover:text-foreground transition-soft"
              >
                ← Back to the feed
              </Link>
            </Reveal>

            <div className="grid grid-cols-12 gap-6 md:gap-10">
              <div className="col-span-12 md:col-span-2">
                <Reveal delay={60}>
                  <Eyebrow tone="accent" size="sm">
                    Community feed
                  </Eyebrow>
                  <Eyebrow tone="muted" size="sm" className="mt-2">
                    {entry.sector}
                  </Eyebrow>
                  <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-foreground/45 num">
                    Submitted {submittedDate}
                  </p>
                </Reveal>
              </div>

              <div className="col-span-12 md:col-span-10">
                <Reveal delay={120}>
                  <h1 className="font-black tracking-[-0.03em] leading-[0.95] text-[clamp(2.5rem,7vw,5.5rem)] max-w-[22ch]">
                    {entry.title}
                  </h1>
                </Reveal>

                <Reveal delay={210} className="mt-8 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.22em] font-semibold">
                  <span className="text-foreground/75">{entry.authorName}</span>
                  <span aria-hidden className="text-foreground/20">·</span>
                  <span className="text-foreground/45">
                    {entry.authorLocation}
                  </span>
                </Reveal>

                <Reveal delay={300}>
                  <Lede tone="muted" className="mt-10 md:mt-12 max-w-[60ch] whitespace-pre-line">
                    {entry.body}
                  </Lede>
                </Reveal>

                <Reveal
                  delay={390}
                  className="mt-10 flex flex-wrap items-center gap-3"
                >
                  <Badge variant="tag" tone={sectorTone}>
                    {entry.sector}
                  </Badge>
                  <Badge variant={urgency.variant} tone={urgency.tone}>
                    Urgency · {URGENCY_LABELS[entry.urgency]}
                  </Badge>
                  <Badge
                    variant="pill"
                    tone={
                      entry.status === 'gaining_traction'
                        ? 'accent'
                        : entry.status === 'live'
                          ? 'infrastructure'
                          : entry.status === 'not_viable'
                            ? 'faint'
                            : 'muted'
                    }
                  >
                    {STATUS_LABELS[entry.status]}
                  </Badge>
                </Reveal>

                {/* Vote action — the lead interaction on this page. */}
                <Reveal delay={480} className="mt-12 md:mt-14">
                  <div className="flex flex-wrap items-center gap-6 md:gap-8 border-t border-foreground/15 pt-8">
                    <FeedVoteButton
                      initialCount={entry.voteCount}
                      initiallyVoted={entry.viewerVoted ?? false}
                      initialVotedAt={entry.viewerVotedAt ?? null}
                      submissionId={entry.id}
                      signedIn={signedIn}
                    />
                    <p className="font-serif text-base md:text-lg text-foreground/55 leading-[1.55] max-w-[42ch]">
                      Three votes a week per person decide what climbs.
                      {!signedIn && ' Sign in to add yours.'}
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </Container>
        </Section>

        {/* ─── The discussion ───────────────────────────────────── */}
        <Section
          pad="md"
          className="!pt-[3vh] md:!pt-[5vh] !pb-[3vh] md:!pb-[5vh]"
        >
          <Container size="wide">
            <div className="grid grid-cols-12 gap-6 md:gap-10 mb-14 md:mb-20">
              <div className="hidden md:block md:col-span-2" />
              <div className="col-span-12 md:col-span-10">
                <Reveal>
                  <h2 className="font-semibold tracking-[-0.015em] text-3xl md:text-5xl leading-[1.05] max-w-[22ch] text-foreground">
                    {totalComments === 0
                      ? 'No one has weighed in yet.'
                      : `${totalComments} ${totalComments === 1 ? 'voice' : 'voices'} on this.`}
                  </h2>
                </Reveal>
                <Reveal delay={90}>
                  <p className="mt-6 text-base md:text-lg max-w-[55ch] leading-[1.6] text-foreground/55">
                    {entry.status === 'submitted' ||
                    entry.status === 'gaining_traction'
                      ? signedIn
                        ? 'Comments are open while the community is still weighing in.'
                        : 'Comments are open while the community is still weighing in. Sign in to join the conversation.'
                      : statusCopy.commentsNote}
                  </p>
                </Reveal>
                <div className="h-px w-full mt-10 bg-foreground/30" aria-hidden />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-6 md:gap-10">
              <div className="hidden md:block md:col-span-2" />
              <div className="col-span-12 md:col-span-10 flex flex-col gap-6">
                <CommentComposerStub
                  callbackPath={`/feed/${entry.id}`}
                  open={repliesOpen}
                  signedIn={signedIn}
                  submissionId={entry.id}
                />
                <CommentList
                  comments={entry.comments ?? []}
                  callbackPath={`/feed/${entry.id}`}
                  signedIn={signedIn}
                  submissionId={entry.id}
                  repliesOpen={repliesOpen}
                />
              </div>
            </div>
          </Container>
        </Section>

        {/* ─── What happens next — tagline beat ─────────────────── */}
        <Section pad="sm" className="!pt-0 md:!pt-0">
          <Container size="wide">
            <div className="grid grid-cols-12 gap-6 md:gap-10">
              <div className="hidden md:block md:col-span-2" />
              <div className="col-span-12 md:col-span-10 text-right">
                <Reveal>
                  <Eyebrow tone="accent" size="sm" align="right">
                    What happens next
                  </Eyebrow>
                </Reveal>
                <Reveal delay={90}>
                  <p className="mt-5 font-serif italic text-foreground/55 text-2xl md:text-3xl leading-[1.3] tracking-[0.02em]">
                    {statusCopy.taglineLede}
                  </p>
                </Reveal>
                <Reveal delay={180}>
                  <p className="mt-2 font-black text-accent text-3xl md:text-4xl tracking-[-0.02em] leading-[1.1] max-w-[20ch] ml-auto">
                    {statusCopy.taglineEmphasis}
                  </p>
                </Reveal>
                <Reveal delay={270}>
                  <p className="mt-6 text-base md:text-lg text-foreground/55 leading-[1.6] max-w-[55ch] ml-auto">
                    {statusCopy.taglineBody}
                  </p>
                </Reveal>
              </div>
            </div>
          </Container>
        </Section>

        {/* ─── Closer ───────────────────────────────────────────── */}
        <Section pad="md" tone="foreground">
          <Container size="wide">
            <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
              <div className="col-span-12 md:col-span-7">
                <Reveal>
                  <Eyebrow tone="accent" size="sm">
                    Got a related problem?
                  </Eyebrow>
                  <h2 className="mt-4 font-semibold tracking-[-0.015em] text-3xl md:text-5xl leading-[1.05] max-w-[22ch] text-background">
                    Add your voice.
                  </h2>
                </Reveal>
                <Reveal delay={120}>
                  <p className="mt-8 max-w-[55ch] text-base md:text-lg text-background/70 leading-[1.6]">
                    One title, a few sentences, the sector it sits in. The top
                    of the feed feeds the Library.
                  </p>
                </Reveal>
                <Reveal delay={240} className="mt-10 flex flex-wrap gap-3">
                  <RaiseButton
                    variant="accent"
                    className="min-w-[220px] hover:!bg-background hover:!text-foreground"
                  >
                    Raise a problem
                  </RaiseButton>
                  <Link
                    href="/feed"
                    className="inline-flex min-w-[220px] items-center justify-center px-8 py-4 border border-background text-background text-[11px] uppercase tracking-[0.22em] font-semibold transition-soft hover:bg-background hover:text-foreground"
                  >
                    Back to the feed
                  </Link>
                </Reveal>
              </div>
              <Reveal delay={300} className="col-span-12 md:col-span-5">
                <RelatedFeedNav related={related} tone="onDark" />
              </Reveal>
            </div>
            <Reveal delay={420}>
              <Tagline tone="onDark" align="right" className="mt-20 md:mt-28">
                Different doors. Same{' '}
                <span className="text-accent font-bold not-italic">
                  standard.
                </span>
              </Tagline>
            </Reveal>
          </Container>
        </Section>
      </article>

      <Footer />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Pieces
// ─────────────────────────────────────────────────────────────────────

/**
 * Comment list. Comments are visible to everyone; upvoting and replying are
 * gated behind sign-in by `CommentActions`. One level of nested replies —
 * the API rejects replies to replies.
 */
function CommentList({
  comments,
  callbackPath,
  signedIn,
  submissionId,
  repliesOpen,
}: {
  comments: SampleFeedComment[];
  callbackPath: string;
  signedIn: boolean;
  submissionId: string;
  repliesOpen: boolean;
}) {
  if (comments.length === 0) return null;

  return (
    <ul className="flex flex-col">
      {comments.map((c, i) => (
        <li
          key={c.id}
          className={`py-8 md:py-9 ${i === 0 ? '' : 'border-t border-foreground/15'}`}
        >
          <CommentItem
            comment={c}
            callbackPath={callbackPath}
            signedIn={signedIn}
            submissionId={submissionId}
            repliesOpen={repliesOpen}
          />
        </li>
      ))}
    </ul>
  );
}

/** Total comment count including all nested replies. */
function countComments(comments: SampleFeedComment[]): number {
  return comments.reduce(
    (acc, c) => acc + 1 + countComments(c.replies ?? []),
    0,
  );
}

function CommentItem({
  comment,
  callbackPath,
  signedIn,
  submissionId,
  repliesOpen,
  depth = 0,
}: {
  comment: SampleFeedComment;
  callbackPath: string;
  signedIn: boolean;
  submissionId: string;
  repliesOpen: boolean;
  depth?: number;
}) {
  const isReply = depth > 0;
  return (
    <div className="flex gap-3 md:gap-4">
      <Avatar name={comment.authorName} size={isReply ? 'sm' : 'md'} />
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <p
            className={`font-semibold text-foreground leading-tight ${isReply ? 'text-sm' : 'text-[15px] md:text-base'}`}
          >
            {comment.authorName}
          </p>
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground/40 flex flex-wrap items-baseline gap-2">
            {comment.authorLocation && (
              <>
                <span>{comment.authorLocation}</span>
                <span aria-hidden className="text-foreground/20">
                  ·
                </span>
              </>
            )}
            <span className="num">
              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </p>
        </div>
        <p
          className={`font-serif leading-[1.7] max-w-[64ch] text-foreground ${isReply ? 'text-[17px]' : 'text-[19px]'}`}
        >
          {comment.replyToName && (
            <span className="text-accent font-semibold not-italic">
              @{comment.replyToName}
            </span>
          )}
          {comment.replyToName ? ' ' : ''}
          {comment.body}
        </p>
        <CommentActions
          commentId={comment.id}
          submissionId={submissionId}
          authorName={comment.authorName}
          callbackPath={callbackPath}
          signedIn={signedIn}
          canReply={depth < 1}
          initialUpvoteCount={comment.upvoteCount ?? 0}
          initialViewerUpvoted={comment.viewerUpvoted ?? false}
          repliesOpen={repliesOpen}
        />
        {comment.replies && comment.replies.length > 0 && (
          <ul className="mt-5 pl-2 md:pl-3 border-l border-foreground/15 flex flex-col gap-8">
            {comment.replies.map((r) => (
              <li key={r.id}>
                <CommentItem
                  comment={r}
                  callbackPath={callbackPath}
                  signedIn={signedIn}
                  submissionId={submissionId}
                  repliesOpen={repliesOpen}
                  depth={depth + 1}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Avatar({
  name,
  size = 'md',
}: {
  name: string;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'md' ? 'w-10 h-10' : 'w-8 h-8';
  const fontSize = size === 'md' ? 'text-[11px]' : 'text-[10px]';
  return (
    <span
      aria-hidden
      className={`shrink-0 inline-flex ${dim} items-center justify-center rounded-full border border-foreground/15 bg-paper ${fontSize} uppercase tracking-[0.08em] font-semibold text-foreground/65`}
    >
      {initialsFrom(name)}
    </span>
  );
}

function RelatedFeedNav({
  related,
  tone = 'onLight',
}: {
  related: FeedEntry[];
  tone?: 'onLight' | 'onDark';
}) {
  const others = related;
  const onDark = tone === 'onDark';
  const ruleCls = onDark ? 'border-background/15' : 'border-foreground/15';
  const titleCls = onDark
    ? 'font-medium leading-[1.3] text-background group-hover:text-accent transition-soft'
    : 'font-medium leading-[1.3]';
  const arrowCls = onDark
    ? 'text-background/30 group-hover:text-accent transition-soft'
    : 'text-foreground/30 group-hover:text-accent transition-soft';

  return (
    <div>
      <Eyebrow
        tone={onDark ? 'faint' : 'muted'}
        size="sm"
        className={`mb-4 ${onDark ? '!text-background/55' : ''}`}
      >
        More on the feed
      </Eyebrow>
      <ul className={`border-t ${ruleCls}`}>
        {others.map((e) => (
          <li key={e.id} className={`border-b ${ruleCls}`}>
            <Link
              href={`/feed/${e.id}`}
              className="flex items-baseline justify-between gap-4 py-4 group transition-soft"
            >
              <span className={titleCls}>{e.title}</span>
              <span
                aria-hidden
                className={`text-[11px] uppercase tracking-[0.22em] font-semibold ${arrowCls}`}
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function preview(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

interface StatusMicrocopy {
  taglineLede: string;
  taglineEmphasis: string;
  taglineBody: string;
  commentsNote: string;
}

function statusMicrocopy(status: DisplayStatus): StatusMicrocopy {
  switch (status) {
    case 'gaining_traction':
      return {
        taglineLede: 'The shelf is listening.',
        taglineEmphasis: 'Climbing toward the Library.',
        taglineBody:
          'Enough voices across enough days have flagged this. Christex is reading it next.',
        commentsNote:
          'Comments are open while the community is still weighing in.',
      };
    case 'under_review':
      return {
        taglineLede: 'Researchers are reading.',
        taglineEmphasis: 'Quiet while we look into it.',
        taglineBody:
          'Comments close once the team picks something up so the record stays clean for the Library brief.',
        commentsNote:
          'Comments are closed while Christex Foundation is researching this problem.',
      };
    case 'research_in_progress':
      return {
        taglineLede: 'The brief is being written.',
        taglineEmphasis: 'Next stop, the Library.',
        taglineBody:
          'When the six documents are ready, this becomes a Library entry anyone can build with.',
        commentsNote:
          'Comments are closed while Christex Foundation is researching this problem.',
      };
    case 'live':
      return {
        taglineLede: 'It made it through.',
        taglineEmphasis: 'Now a Library entry.',
        taglineBody:
          'The full brief and starter kit are on the shelf. Pull it open and build.',
        commentsNote:
          'This problem is now a Library entry. Comments are closed here.',
      };
    case 'not_viable':
      return {
        taglineLede: 'We took a hard look.',
        taglineEmphasis: 'Not the right fit for the shelf.',
        taglineBody:
          'Reviewed and set aside, with a note explaining why. The record stays so the work is not lost.',
        commentsNote:
          'This problem was determined not viable. Comments are closed.',
      };
    case 'submitted':
    default:
      return {
        taglineLede: 'On the feed, gathering voices.',
        taglineEmphasis: 'Three votes a week per person.',
        taglineBody:
          'Enough support across enough distinct days and this climbs into Gaining Traction, then Christex picks it up.',
        commentsNote:
          'Comments are open while the community is still weighing in.',
      };
  }
}
