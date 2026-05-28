'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'sonner';
import PhoneOtpForm from '@/components/auth/PhoneOtpForm';
import { MIN_PASSWORD_LEN } from '@/lib/enums';

type Method = 'phone' | 'email' | 'oauth';

function SignUpInner() {
  const params = useSearchParams();
  const router = useRouter();
  const callbackUrl = params.get('callbackUrl') ?? '/';
  const [method, setMethod] = useState<Method>('phone');

  return (
    <main className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold">Create an account</h1>
      <p className="text-sm text-gray-600 mt-1 mb-6">
        Anyone can join. Phone, email, Google, or GitHub.
      </p>

      <div className="flex border rounded overflow-hidden mb-6 text-sm">
        <button
          type="button"
          onClick={() => setMethod('phone')}
          className={`flex-1 px-3 py-2 ${method === 'phone' ? 'bg-black text-white' : ''}`}
        >
          Phone
        </button>
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={`flex-1 px-3 py-2 border-l ${method === 'email' ? 'bg-black text-white' : ''}`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setMethod('oauth')}
          className={`flex-1 px-3 py-2 border-l ${method === 'oauth' ? 'bg-black text-white' : ''}`}
        >
          Google · GitHub
        </button>
      </div>

      {method === 'phone' && <PhoneOtpForm callbackUrl={callbackUrl} />}
      {method === 'email' && <EmailSignupForm callbackUrl={callbackUrl} router={router} />}
      {method === 'oauth' && (
        <div className="space-y-3">
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full border rounded px-4 py-3 text-left hover:bg-gray-50"
          >
            Continue with Google
          </button>
          <button
            onClick={() => signIn('github', { callbackUrl })}
            className="w-full border rounded px-4 py-3 text-left hover:bg-gray-50"
          >
            Continue with GitHub
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center mt-6">
        Already have an account?{' '}
        <Link href="/signin" className="underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}

function EmailSignupForm({
  callbackUrl,
  router,
}: {
  callbackUrl: string;
  router: ReturnType<typeof useRouter>;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [busy, setBusy] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/auth/email-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to sign up');

      // Sign in immediately after creation.
      const signin = await signIn('email-password', {
        email,
        password,
        callbackUrl,
        redirect: false,
      });
      if (signin?.error) {
        toast.success('Account created. Sign in.');
        router.push('/signin');
      } else if (signin?.url) {
        window.location.href = signin.url;
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Name (optional)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
          maxLength={80}
        />
      </div>
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
        <label className="block text-sm font-medium">
          Password <span className="text-gray-500">(min {MIN_PASSWORD_LEN} chars)</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={MIN_PASSWORD_LEN}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>
      {siteKey ? (
        <Turnstile siteKey={siteKey} onSuccess={setTurnstileToken} />
      ) : (
        <p className="text-xs text-yellow-700">Bot protection not configured.</p>
      )}
      <button
        type="submit"
        disabled={
          busy ||
          !email ||
          password.length < MIN_PASSWORD_LEN ||
          (!turnstileToken && !!siteKey)
        }
        className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {busy ? 'Creating…' : 'Create account'}
      </button>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-12">Loading…</div>}>
      <SignUpInner />
    </Suspense>
  );
}
