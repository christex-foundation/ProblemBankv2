'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Editorial upvote tile for /feed cards.
 *
 * Voting is sign-in-gated (each signed-in user gets 3 votes per week per
 * spec). The default `signedIn={false}` renders the tile as a Link to
 * /signin that hints "Sign in" on hover; when wired to auth, pass
 * `signedIn` and `initiallyVoted` from the server.
 *
 * Optimistic state is local — a reload resets it. Production wiring should
 * call the vote API and respect the 3/week + 5-min unvote rules from the
 * archived `VoteButton.tsx`.
 */
export function FeedVoteButton({
  initialCount,
  initiallyVoted = false,
  signedIn = false,
  submissionId,
}: {
  initialCount: number;
  initiallyVoted?: boolean;
  signedIn?: boolean;
  /** Used to build the post-sign-in callback URL. */
  submissionId?: string;
}) {
  const [voted, setVoted] = useState(initiallyVoted);
  const [count, setCount] = useState(initialCount);

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

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setVoted((v) => !v);
    setCount((c) => c + (voted ? -1 : 1));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={voted}
      aria-label={voted ? `Remove vote (${count})` : `Upvote (${count})`}
      className={`group/vote w-[88px] md:w-[104px] flex flex-col items-center gap-1 px-3 py-4 border transition-soft cursor-pointer ${
        voted
          ? 'bg-accent border-accent text-background'
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
