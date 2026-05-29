// Data seam for /feed/submit. POSTs to /api/submissions for signed-in users.
// The anonymous signup-at-submit flow (email / phone / Google / GitHub at
// submission time) is not yet wired up — the RaiseButton is auth-gated, so
// users only reach this code path with an active session.

import { apiErrorMessage } from '@/lib/api-response';
import type { Sector, UrgencyKey } from './enums';

export type SubmitAccount =
  | { method: 'email'; email: string }
  | { method: 'phone'; phone: string; channel: 'sms' | 'whatsapp' }
  | { method: 'google' }
  | { method: 'github' };

export type SubmitInput = {
  title: string;
  problem: string;
  toolIdea: string;
  signsItsWorking: string[];
  sector: Sector;
  urgency: UrgencyKey;
  account?: SubmitAccount;
  turnstileToken: string;
};

export type SubmitResult =
  | { ok: true; submissionId: string; signedIn: boolean }
  | { ok: false; error: string; field?: keyof SubmitInput };

export async function submitProblem(input: SubmitInput): Promise<SubmitResult> {
  const payload = {
    title: input.title,
    description: input.problem,
    potentialSolution: input.toolIdea || undefined,
    category: input.sector,
    urgency: input.urgency,
    signsItsWorking: input.signsItsWorking,
    turnstileToken: input.turnstileToken,
  };

  let res: Response;
  try {
    res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, error: 'Network error. Please try again.' };
  }

  const json: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) {
      return { ok: false, error: 'Sign in required.' };
    }
    return { ok: false, error: apiErrorMessage(json) ?? 'Submission failed.' };
  }

  const submissionId =
    json && typeof json === 'object' && 'submission' in json
      ? (json as { submission: { id: string } }).submission?.id
      : undefined;

  if (!submissionId) {
    return { ok: false, error: 'Submission succeeded but response was malformed.' };
  }

  return { ok: true, submissionId, signedIn: true };
}
