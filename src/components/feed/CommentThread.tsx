'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-response';
import { MAX_COMMENT_LEN } from '@/lib/enums';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentCommentId: string | null;
  user: { id: string; name: string | null };
}

interface Props {
  submissionId: string;
  initialComments: Comment[];
  /** True when the submission is in `submitted` or computed `gaining_traction`. */
  open: boolean;
  closedReason?: string;
}

export default function CommentThread({ submissionId, initialComments, open, closedReason }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyToken, setReplyToken] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const topLevel = comments.filter((c) => c.parentCommentId === null);
  const repliesByParent = comments.reduce<Record<string, Comment[]>>((acc, c) => {
    if (c.parentCommentId) (acc[c.parentCommentId] ??= []).push(c);
    return acc;
  }, {});

  async function postComment(
    content: string,
    parentCommentId: string | null,
    turnstileToken: string,
  ): Promise<Comment> {
    const res = await fetch(`/api/submissions/${submissionId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        turnstileToken,
        parentCommentId: parentCommentId ?? undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(apiErrorMessage(data) ?? 'Failed to comment');
    }
    return data.comment as Comment;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    try {
      const comment = await postComment(text, null, token);
      setComments([...comments, comment]);
      setText('');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to comment');
    } finally {
      setBusy(false);
    }
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (replyBusy || !replyText.trim() || !replyingTo) return;
    setReplyBusy(true);
    try {
      const comment = await postComment(replyText, replyingTo, replyToken);
      setComments([...comments, comment]);
      setReplyText('');
      setReplyingTo(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reply');
    } finally {
      setReplyBusy(false);
    }
  }

  function cancelReply() {
    setReplyingTo(null);
    setReplyText('');
  }

  return (
    <section className="mt-8 border-t pt-6">
      <h2 className="font-semibold mb-4">Comments ({comments.length})</h2>

      {topLevel.length === 0 ? (
        <p className="text-sm text-gray-500 mb-4">No comments yet.</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {topLevel.map((c) => {
            const replies = repliesByParent[c.id] ?? [];
            const isReplying = replyingTo === c.id;
            return (
              <li key={c.id} className="border rounded p-3">
                <p className="text-sm font-medium">{c.user.name ?? 'Anonymous'}</p>
                <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
                <p className="mt-2 whitespace-pre-wrap">{c.content}</p>

                {replies.length > 0 && (
                  <ul className="ml-6 mt-3 space-y-3 border-l pl-3">
                    {replies.map((r) => (
                      <li key={r.id} className="border rounded p-3">
                        <p className="text-sm font-medium">{r.user.name ?? 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(r.createdAt).toLocaleString()}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap">{r.content}</p>
                      </li>
                    ))}
                  </ul>
                )}

                {open && session && !isReplying && (
                  <button
                    type="button"
                    onClick={() => setReplyingTo(c.id)}
                    className="mt-3 text-xs text-gray-600 hover:underline"
                  >
                    Reply
                  </button>
                )}

                {open && session && isReplying && (
                  <form onSubmit={submitReply} className="mt-3 ml-6 space-y-2 border-l pl-3">
                    <label className="block text-sm font-medium">Reply</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      maxLength={MAX_COMMENT_LEN}
                      rows={3}
                      className="w-full border rounded p-2"
                      placeholder="Write a reply…"
                    />
                    <p className="text-xs text-gray-500">
                      {replyText.length}/{MAX_COMMENT_LEN}
                    </p>
                    {siteKey ? (
                      <Turnstile siteKey={siteKey} onSuccess={setReplyToken} />
                    ) : (
                      <p className="text-xs text-yellow-700">
                        Bot protection not configured (NEXT_PUBLIC_TURNSTILE_SITE_KEY missing).
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={!replyText.trim() || replyBusy || (!replyToken && !!siteKey)}
                        className="bg-black text-white rounded px-3 py-1.5 text-sm disabled:opacity-50"
                      >
                        {replyBusy ? 'Posting…' : 'Post reply'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelReply}
                        className="rounded px-3 py-1.5 text-sm text-gray-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!open ? (
        <p className="text-sm text-gray-500">
          {closedReason ?? 'Comments are closed for this problem.'}
        </p>
      ) : !session ? (
        <p className="text-sm">
          <a href="/signin" className="underline">
            Sign in
          </a>{' '}
          to comment.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm font-medium">Add a comment</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_COMMENT_LEN}
            rows={3}
            className="w-full border rounded p-2"
            placeholder="Add context, refine the problem, or build on what others have said."
          />
          <p className="text-xs text-gray-500">
            {text.length}/{MAX_COMMENT_LEN}
          </p>
          {siteKey ? (
            <Turnstile siteKey={siteKey} onSuccess={setToken} />
          ) : (
            <p className="text-xs text-yellow-700">
              Bot protection not configured (NEXT_PUBLIC_TURNSTILE_SITE_KEY missing).
            </p>
          )}
          <button
            type="submit"
            disabled={!text.trim() || busy || (!token && !!siteKey)}
            className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {busy ? 'Posting…' : 'Post comment'}
          </button>
        </form>
      )}
    </section>
  );
}
