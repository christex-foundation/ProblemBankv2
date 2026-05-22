'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-response';
import { UNVOTE_WINDOW_MS } from '@/lib/enums';

interface Props {
  submissionId: string;
  initialCount: number;
  initialVotedAt?: string | null;
  disabled?: boolean;
  disabledReason?: string;
}

export default function VoteButton({
  submissionId,
  initialCount,
  initialVotedAt,
  disabled,
  disabledReason,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [votedAt, setVotedAt] = useState<Date | null>(
    initialVotedAt ? new Date(initialVotedAt) : null,
  );
  const [now, setNow] = useState(() => Date.now());
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  // Tick the clock once a second so the unvote window indicator stays current.
  useEffect(() => {
    if (!votedAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [votedAt]);

  const elapsed = votedAt ? now - votedAt.getTime() : 0;
  const canUnvote = !!votedAt && elapsed < UNVOTE_WINDOW_MS;
  const unvoteRemainingMs = canUnvote ? UNVOTE_WINDOW_MS - elapsed : 0;
  const unvoteSecsLeft = Math.max(0, Math.ceil(unvoteRemainingMs / 1000));

  async function toggle() {
    if (disabled) return;
    if (!session) {
      router.push(`/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (busy) return;

    const wasVoted = !!votedAt;
    if (wasVoted && !canUnvote) {
      toast.warning('Vote locked — unvote window passed');
      return;
    }

    // Optimistic
    setBusy(true);
    setCount((c) => c + (wasVoted ? -1 : 1));
    setVotedAt(wasVoted ? null : new Date());

    try {
      const res = await fetch(`/api/submissions/${submissionId}/vote`, {
        method: wasVoted ? 'DELETE' : 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        // Revert
        setCount((c) => c + (wasVoted ? 1 : -1));
        setVotedAt(wasVoted ? new Date(initialVotedAt!) : null);
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
        else if (r === 1) toast.info(`${r} vote left this week.`);
      }
      // Refresh server data so other surfaces (counts, lists) update.
      startTransition(() => router.refresh());
    } catch {
      // Revert on network error
      setCount((c) => c + (wasVoted ? 1 : -1));
      setVotedAt(wasVoted ? new Date(initialVotedAt!) : null);
      toast.error('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled || busy}
      title={disabled ? disabledReason : votedAt && !canUnvote ? 'Vote locked' : undefined}
      className={`inline-flex items-center gap-1 px-3 py-1 border rounded text-sm transition-colors ${
        votedAt
          ? 'border-black bg-black text-white'
          : 'border-gray-300 hover:border-black'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-pressed={!!votedAt}
    >
      <span aria-hidden="true">{votedAt ? '▲' : '△'}</span>
      <span>{count}</span>
      {canUnvote && (
        <span className="text-xs ml-1 opacity-75">unvote {unvoteSecsLeft}s</span>
      )}
    </button>
  );
}
