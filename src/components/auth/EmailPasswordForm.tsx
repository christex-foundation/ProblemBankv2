'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';

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
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 mt-1"
        />
        <p className="text-xs mt-1">
          <Link href="/reset" className="underline text-gray-600">
            Forgot password?
          </Link>
        </p>
      </div>
      <button
        type="submit"
        disabled={busy || !email || !password}
        className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="text-xs text-gray-500 text-center">
        No account?{' '}
        <Link href="/signup" className="underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
