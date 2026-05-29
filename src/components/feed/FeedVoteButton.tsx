'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-response';
import { UNVOTE_WINDOW_MS } from '@/lib/enums';

/**
 * Editorial upvote tile for /feed cards.
 *
 * Sign-in-gated. When `signedIn` is false the tile renders as a Link to
 * /signin. When signed in, clicks call /api/submissions/{id}/vote, which
 * enforces the 3-votes-per-week limit and the 5-minute unvote window.
 */
export function FeedVoteButton({
  initialCount,
  initiallyVoted = false,
  initialVotedAt = null,
  signedIn = false,
  submissionId,
}: {
  initialCount: number;
  initiallyVoted?: boolean;
  /** ISO timestamp the viewer voted, when known. Drives the 5-minute unvote window after reload. */
  initialVotedAt?: string | null;
  signedIn?: boolean;
  /** Used both for the vote API call and the post-sign-in callback URL. */
  submissionId?: string;
}) {
  const router = useRouter();
  const [voted, setVoted] = useState(initiallyVoted);
  const [count, setCount] = useState(initialCount);
  const [votedAt, setVotedAt] = useState<Date | null>(
    initialVotedAt ? new Date(initialVotedAt) : null,
  );
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!votedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [votedAt]);

  const elapsed = votedAt ? now - votedAt.getTime() : 0;
  const canUnvote = !!votedAt && elapsed < UNVOTE_WINDOW_MS;

  if (!signedIn) {
    const callback = submissionId ? `/feed#${submissionId}` : '/feed';
    return (
      <Link
        href={`/signin?callbackUrl=${encodeURIComponent(callback)}`}
        aria-label={`Sign in to vote (${count} so far)`}
        title="Sign in to vote"
        onClick={(e) => e.stopPropagation()}
        className="group/vote w-[88px] md:w-[104px] flex flex-col items-center gap-1 px-3 py-4 border border-foreground/15 bg-paper text-foreground/55 transition-soft hover:border-foreground/45 hover:text-foreground focus-visible:outline-none focus-visible:border-foreground/45"
      >
        <Chevron tone="muted" />
        <span className="num text-3xl md:text-4xl font-semibold tracking-[-0.025em] leading-none mt-1 text-foreground/70 group-hover/vote:text-foreground transition-soft">
          {count}
        </span>
        <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground/35 group-hover/vote:text-accent transition-soft">
          <span className="group-hover/vote:hidden">{count === 1 ? 'Vote' : 'Votes'}</span>
          <span className="hidden group-hover/vote:inline">Sign in</span>
        </span>
      </Link>
    );
  }

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy || !submissionId) return;

    const wasVoted = voted;
    if (wasVoted && !canUnvote) {
      toast.warning('Vote locked — unvote window passed');
      return;
    }

    const prevVotedAt = votedAt;
    setBusy(true);
    setVoted(!wasVoted);
    setCount((c) => c + (wasVoted ? -1 : 1));
    setVotedAt(wasVoted ? null : new Date());

    try {
      const res = await fetch(`/api/submissions/${submissionId}/vote`, {
        method: wasVoted ? 'DELETE' : 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setVoted(wasVoted);
        setCount((c) => c + (wasVoted ? 1 : -1));
        setVotedAt(prevVotedAt);
        const msg = apiErrorMessage(data);
        if (data.remaining === 0) {
          toast.warning(msg ?? 'Out of votes this week. Resets Monday.');
        } else {
          toast.error(msg ?? 'Vote failed');
        }
        return;
      }
      setCount(data.voteCount);
      if (!wasVoted) {
        const r = data.remaining as number;
        if (r === 0) toast.warning('Last vote of the week used.');
        else if (r === 1) toast.info('1 vote left this week.');
      }
      startTransition(() => router.refresh());
    } catch {
      setVoted(wasVoted);
      setCount((c) => c + (wasVoted ? 1 : -1));
      setVotedAt(prevVotedAt);
      toast.error('Network error');
    } finally {
      setBusy(false);
    }
  }

  const locked = voted && !canUnvote;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy || locked}
      aria-pressed={voted}
      aria-label={
        locked
          ? `Already voted (${count}) — vote locked`
          : voted
            ? `Remove vote (${count})`
            : `Upvote (${count})`
      }
      title={locked ? 'You voted. Votes are permanent after 5 minutes.' : undefined}
      className={`group/vote w-[88px] md:w-[104px] flex flex-col items-center gap-1 px-3 py-4 border transition-soft cursor-pointer disabled:cursor-wait ${
        voted
          ? `bg-accent border-accent text-background ${locked ? 'disabled:cursor-not-allowed' : ''}`
          : 'bg-paper border-foreground/20 text-foreground hover:border-foreground/60 hover:bg-foreground/[0.03]'
      }`}
    >
      <Chevron tone={voted ? 'voted' : 'active'} />
      <span className="num text-3xl md:text-4xl font-semibold tracking-[-0.025em] leading-none mt-1">
        {count}
      </span>
      <span
        className={`text-[10px] uppercase tracking-[0.22em] font-semibold ${
          voted ? 'text-background/75' : 'text-foreground/45'
        }`}
      >
        {voted ? 'Voted' : count === 1 ? 'Vote' : 'Votes'}
      </span>
    </button>
  );
}

function Chevron({ tone }: { tone: 'muted' | 'active' | 'voted' }) {
  const toneClass =
    tone === 'voted'
      ? 'text-background'
      : tone === 'active'
        ? 'text-foreground/55 group-hover/vote:text-accent'
        : 'text-foreground/35 group-hover/vote:text-accent';
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden
      className={`transition-soft ${toneClass}`}
    >
      <path d="M2 11 L9 3 L16 11" />
    </svg>
  );
}
