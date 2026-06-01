'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-response';
import { MIN_PASSWORD_LEN } from '@/lib/enums';
import { Button } from '@/design/primitives';
import { AuthHeading, AuthField } from '@/components/auth/AuthUI';

function ConfirmInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(apiErrorMessage(data) ?? 'Reset failed');
      toast.success('Password updated. Sign in.');
      router.push('/signin');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div>
        <AuthHeading
          eyebrow="Problem Bank"
          title="Link incomplete"
          subtitle="This reset link is missing its token."
        />
        <Link
          href="/reset"
          className="link-underline text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AuthHeading eyebrow="Problem Bank" title="Choose a new password" />
      <form onSubmit={submit} className="flex flex-col gap-5">
        <AuthField
          id="password"
          label="New password"
          hint={`(min ${MIN_PASSWORD_LEN})`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={MIN_PASSWORD_LEN}
          required
          autoComplete="new-password"
        />
        <AuthField
          id="confirm"
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={busy || password.length < MIN_PASSWORD_LEN}
          className="w-full disabled:opacity-50"
        >
          {busy ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetConfirmPage() {
  return (
    <Suspense
      fallback={
        <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">
          Loading…
        </p>
      }
    >
      <ConfirmInner />
    </Suspense>
  );
}
