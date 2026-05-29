'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/design/primitives';
import { AuthField } from '@/components/auth/AuthUI';

export default function EmailPasswordForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await signIn('email-password', {
        email,
        password,
        callbackUrl,
        redirect: false,
      });
      if (res?.error) {
        toast.error('Wrong email or password');
      } else if (res?.url) {
        window.location.href = res.url;
      } else if (res?.ok) {
        window.location.href = callbackUrl;
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <AuthField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <div>
        <AuthField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <p className="mt-2 text-right">
          <Link
            href="/reset"
            className="link-underline text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/55"
          >
            Forgot password?
          </Link>
        </p>
      </div>
      <Button
        type="submit"
        variant="primary"
        disabled={busy || !email || !password}
        className="w-full disabled:opacity-50"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
