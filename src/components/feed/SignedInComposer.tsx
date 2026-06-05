'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-response';
import { MAX_COMMENT_LEN } from '@/lib/enums';

export function SignedInComposer({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(apiErrorMessage(data) ?? 'Failed to post comment');
        return;
      }
      setText('');
      startTransition(() => router.refresh());
    } catch {
      toast.error('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-foreground/15 bg-paper rounded-xl px-5 py-5 md:px-6 md:py-6 flex flex-col gap-5"
    >
      <label htmlFor="comment-body" className="sr-only">
        Your comment
      </label>
      <textarea
        id="comment-body"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={MAX_COMMENT_LEN}
        placeholder="What do you think?"
        className="w-full resize-y bg-transparent text-base md:text-lg text-foreground placeholder:text-foreground/40 leading-[1.55] focus:outline-none"
      />
      <div className="flex items-center justify-between gap-3">
        <span aria-live="polite" className="text-[10px] text-foreground/40 num">
          {text.length}/{MAX_COMMENT_LEN}
        </span>
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-foreground text-foreground text-sm font-semibold transition-soft hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? 'Posting…' : 'Post comment'}
        </button>
      </div>
    </form>
  );
}
