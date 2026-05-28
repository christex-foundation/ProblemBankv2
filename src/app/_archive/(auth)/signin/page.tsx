'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import PhoneOtpForm from '@/components/auth/PhoneOtpForm';
import EmailPasswordForm from '@/components/auth/EmailPasswordForm';

type Method = 'phone' | 'email' | 'oauth';

function SignInInner() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';
  const [method, setMethod] = useState<Method>('phone');

  return (
    <main className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold">Sign in to Problem Bank</h1>
      <p className="text-sm text-gray-600 mt-1 mb-6">
        Phone is primary. Email, Google, and GitHub also work.
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
      {method === 'email' && <EmailPasswordForm callbackUrl={callbackUrl} />}
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
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-12">Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}
