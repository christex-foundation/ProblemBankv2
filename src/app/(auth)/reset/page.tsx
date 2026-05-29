'use client';

import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-response';
import { Button, Paper } from '@/design/primitives';
import { AuthHeading, AuthField, AuthHelp } from '@/components/auth/AuthUI';

export default function ResetRequestPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/auth/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken: token }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(apiErrorMessage(data) ?? 'Failed');
      }
      setSent(true);
      toast.success('Check your email for a reset link');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AuthHeading
        eyebrow="Problem Bank"
        title="Reset password"
        subtitle="Enter your email and we'll send a reset link. Phone-only and OAuth accounts must reset through their original provider."
      />

      {sent ? (
        <Paper className="p-5">
          <p className="text-sm leading-relaxed text-foreground/75">
            If an account exists for{' '}
            <span className="text-foreground">{email}</span>, a reset link has
            been sent. It expires in one hour.
          </p>
        </Paper>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5">
          <AuthField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {siteKey ? (
            <Turnstile siteKey={siteKey} onSuccess={setToken} />
          ) : (
            <AuthHelp>Bot protection not configured.</AuthHelp>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={busy || !email || (!token && !!siteKey)}
            className="w-full disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </div>
  );
}
