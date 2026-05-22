'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-response';

const STATUSES = [
  'submitted',
  'under_review',
  'research_in_progress',
  'not_viable',
  'live',
] as const;

type Status = (typeof STATUSES)[number];

export default function StatusUpdater({
  submissionId,
  current,
}: {
  submissionId: string;
  current: Status;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(current);
  const [saving, setSaving] = useState(false);

  async function save(next: Status) {
    if (next === status) return;
    if (!confirm(`Change status to ${next}? Notifications will be sent.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(apiErrorMessage(data) ?? 'Failed to update');
      }
      setStatus(next);
      toast.success(`Status updated to ${next}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={status}
      onChange={(e) => save(e.target.value as Status)}
      disabled={saving}
      className="border rounded px-2 py-1 text-sm"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
