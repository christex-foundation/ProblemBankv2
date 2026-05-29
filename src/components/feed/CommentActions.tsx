'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-response';
import { MAX_COMMENT_LEN } from '@/lib/enums';
import { SignInTrigger } from './SignInPrompt';

interface Props {
  commentId: string;
  submissionId: string;
  authorName: string;
  callbackPath: string;
  signedIn: boolean;
  canReply: boolean;
  initialUpvoteCount: number;
  initialViewerUpvoted: boolean;
  /** When false the submission is past `submitted` and the comment composer is closed. */
  repliesOpen: boolean;
}

export function CommentActions({
  commentId,
  submissionId,
  authorName,
  callbackPath,
  signedIn,
  canReply,
  initialUpvoteCount,
  initialViewerUpvoted,
  repliesOpen,
}: Props) {
  const router = useRouter();
  const [count, setCount] = useState(initialUpvoteCount);
  const [voted, setVoted] = useState(initialViewerUpvoted);
  const [busy, setBusy] = useState(false);
  const [replying, setReplying] = useState(false);
  const [, startTransition] = useTransition();

  async function toggleUpvote() {
    if (busy) return;
    const wasVoted = voted;
    setBusy(true);
    setVoted(!wasVoted);
    setCount((c) => c + (wasVoted ? -1 : 1));
    try {
      const res = await fetch(`/api/comments/${commentId}/upvote`, {
        method: wasVoted ? 'DELETE' : 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setVoted(wasVoted);
        setCount((c) => c + (wasVoted ? 1 : -1));
        toast.error(apiErrorMessage(data) ?? 'Upvote failed');
        return;
      }
      setCount(data.upvoteCount);
      setVoted(data.viewerUpvoted);
    } catch {
      setVoted(wasVoted);
      setCount((c) => c + (wasVoted ? 1 : -1));
      toast.error('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mt-1 flex items-center gap-5 text-[10px] uppercase tracking-[0.22em] font-semibold">
        {signedIn ? (
          <button
            type="button"
            onClick={toggleUpvote}
            disabled={busy}
            aria-pressed={voted}
            aria-label={
              voted
                ? `Remove upvote on ${authorName}'s comment`
                : `Upvote ${authorName}'s comment`
            }
            className={`inline-flex items-baseline gap-1.5 transition-soft disabled:cursor-wait ${
              voted ? 'text-accent' : 'text-foreground/45 hover:text-accent'
            }`}
          >
            <span>{voted ? 'Upvoted' : 'Upvote'}</span>
            {count > 0 ? <span className="num text-foreground/55">({count})</span> : null}
          </button>
        ) : (
          <SignInTrigger
            callbackPath={callbackPath}
            ariaLabel={`Upvote ${authorName}'s comment`}
            className="inline-flex items-baseline gap-1.5 text-foreground/45 hover:text-accent transition-soft"
          >
            <span>Upvote</span>
            {count > 0 ? <span className="num text-foreground/55">({count})</span> : null}
          </SignInTrigger>
        )}
        {canReply &&
          (signedIn ? (
            <button
              type="button"
              onClick={() => repliesOpen && setReplying((r) => !r)}
              disabled={!repliesOpen}
              aria-expanded={replying}
              aria-label={`Reply to ${authorName}`}
              className="text-foreground/45 hover:text-accent transition-soft disabled:opacity-50 disabled:hover:text-foreground/45"
              title={repliesOpen ? undefined : 'Replies are closed for this problem.'}
            >
              {replying ? 'Cancel' : 'Reply'}
            </button>
          ) : (
            <SignInTrigger
              callbackPath={callbackPath}
              ariaLabel={`Reply to ${authorName}`}
              className="text-foreground/45 hover:text-accent transition-soft"
            >
              Reply
            </SignInTrigger>
          ))}
      </div>
      {replying && repliesOpen && signedIn && (
        <ReplyComposer
          submissionId={submissionId}
          parentCommentId={commentId}
          replyToName={authorName}
          onCancel={() => setReplying(false)}
          onPosted={() => {
            setReplying(false);
            startTransition(() => router.refresh());
          }}
        />
      )}
    </>
  );
}

function ReplyComposer({
  submissionId,
  parentCommentId,
  replyToName,
  onCancel,
  onPosted,
}: {
  submissionId: string;
  parentCommentId: string;
  replyToName: string;
  onCancel: () => void;
  onPosted: () => void;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, parentCommentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(apiErrorMessage(data) ?? 'Failed to reply');
        return;
      }
      setText('');
      onPosted();
    } catch {
      toast.error('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 border border-foreground/15 bg-paper rounded-xl px-4 py-4 flex flex-col gap-3"
    >
      <label htmlFor={`reply-${parentCommentId}`} className="sr-only">
        Reply to {replyToName}
      </label>
      <textarea
        id={`reply-${parentCommentId}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={MAX_COMMENT_LEN}
        placeholder={`Reply to ${replyToName}…`}
        className="w-full resize-y bg-transparent text-[15px] md:text-base text-foreground placeholder:text-foreground/40 leading-[1.55] focus:outline-none"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] text-foreground/40 num">
          {text.length}/{MAX_COMMENT_LEN}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/55 hover:text-foreground transition-soft"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-foreground text-foreground text-xs font-semibold transition-soft hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Posting…' : 'Post reply'}
          </button>
        </div>
      </div>
    </form>
  );
}
