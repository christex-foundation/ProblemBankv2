'use client';

import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'sonner';

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
        throw new Error(data.error ?? 'Failed');
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
    <main className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-2">Reset password</h1>
      <p className="text-sm text-gray-600 mb-6">
        Enter your email and we&apos;ll send a reset link. Phone-only and OAuth accounts must reset
        through their original provider.
      </p>

      {sent ? (
        <div className="border rounded p-4 bg-green-50 border-green-200">
          <p className="text-sm">
            If an account exists for {email}, a reset link has been sent. It expires in one hour.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
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
          {siteKey ? (
            <Turnstile siteKey={siteKey} onSuccess={setToken} />
          ) : (
            <p className="text-xs text-yellow-700">Bot protection not configured.</p>
          )}
          <button
            type="submit"
            disabled={busy || !email || (!token && !!siteKey)}
            className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </main>
  );
}
