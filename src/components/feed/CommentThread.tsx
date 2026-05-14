'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'sonner';
import { MAX_COMMENT_LEN } from '@/lib/enums';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
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

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, turnstileToken: token }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to comment');
      }
      setComments([...comments, data.comment]);
      setText('');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to comment');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 border-t pt-6">
      <h2 className="font-semibold mb-4">Comments ({comments.length})</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-gray-500 mb-4">No comments yet.</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {comments.map((c) => (
            <li key={c.id} className="border rounded p-3">
              <p className="text-sm font-medium">{c.user.name ?? 'Anonymous'}</p>
              <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
              <p className="mt-2 whitespace-pre-wrap">{c.content}</p>
            </li>
          ))}
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
