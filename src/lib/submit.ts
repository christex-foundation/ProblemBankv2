// Data seam for /feed/submit. Today this resolves a fake id; in production it
// POSTs to /api/submissions (see _archive/api/submissions/route.ts) and routes
// account creation through the combined submit + signup flow.
//
// Same shape, same call site: swap the body when auth + Supabase land.

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

export async function submitProblem(_input: SubmitInput): Promise<SubmitResult> {
  await new Promise((r) => setTimeout(r, 600));
  return {
    ok: true,
    submissionId: 'sample_' + Math.random().toString(36).slice(2, 10),
    signedIn: !_input.account,
  };
}
