'use client';

import { useState } from 'react';

export function SignedInComposer() {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    // Backend wiring is out of scope; clear the field after a tick.
    await new Promise((r) => setTimeout(r, 250));
    setText('');
    setSubmitting(false);
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
        placeholder="What do you think?"
        className="w-full resize-y bg-transparent text-base md:text-lg text-foreground placeholder:text-foreground/40 leading-[1.55] focus:outline-none"
      />
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-foreground text-foreground text-sm font-semibold transition-soft hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting…' : 'Post comment'}
        </button>
      </div>
    </form>
  );
}
