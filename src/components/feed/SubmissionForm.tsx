'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'sonner';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { uploadTiptapImages } from '@/lib/cloudinary-client';
import { apiErrorMessage } from '@/lib/api-response';
import { SECTORS, URGENCY_LABELS, MAX_TITLE_LEN } from '@/lib/enums';

type Urgency = keyof typeof URGENCY_LABELS;

export default function SubmissionForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [potentialSolution, setPotentialSolution] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('medium');
  const [category, setCategory] = useState<string>(SECTORS[0]);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  // Strip empty HTML markers Tiptap leaves behind so we can correctly require content.
  const descriptionEmpty = !description || description === '<p></p>';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const descUp = await uploadTiptapImages(description);
      const solUp = potentialSolution && potentialSolution !== '<p></p>'
        ? await uploadTiptapImages(potentialSolution)
        : null;

      const totalDropped = descUp.imagesDropped + (solUp?.imagesDropped ?? 0);
      if (totalDropped > 0) {
        toast.warning(
          `Image uploads disabled — ${totalDropped} image${totalDropped === 1 ? '' : 's'} skipped.`,
        );
      }

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: descUp.html,
          potentialSolution: solUp?.html,
          urgency,
          category,
          turnstileToken,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(apiErrorMessage(data) ?? 'Failed to submit');
      }

      toast.success('Submission published');
      router.push('/feed');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl" suppressHydrationWarning>
      <div>
        <label className="block text-sm font-medium">
          Title <span className="text-gray-500">(max {MAX_TITLE_LEN} chars)</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE_LEN}
          required
          className="w-full border rounded px-3 py-2 mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          {title.length}/{MAX_TITLE_LEN}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">What is the problem?</label>
        <div className="mt-1">
          <TiptapEditor value={description} onChange={setDescription} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">
          What could be done to address it? <span className="text-gray-500">(optional)</span>
        </label>
        <div className="mt-1">
          <TiptapEditor value={potentialSolution} onChange={setPotentialSolution} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Urgency</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as Urgency)}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            {Object.entries(URGENCY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {siteKey ? (
        <Turnstile siteKey={siteKey} onSuccess={setTurnstileToken} />
      ) : (
        <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
          Bot protection not configured (set NEXT_PUBLIC_TURNSTILE_SITE_KEY). Submitting will fail
          in production until configured.
        </p>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={
          !title ||
          descriptionEmpty ||
          (!turnstileToken && !!siteKey) ||
          submitting
        }
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        suppressHydrationWarning
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  );
}
