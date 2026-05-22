'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import PhoneOtpForm from '@/components/auth/PhoneOtpForm';
import EmailPasswordForm from '@/components/auth/EmailPasswordForm';
import type { ConfiguredProviders } from '@/lib/auth-providers';

type Method = 'phone' | 'email' | 'oauth';

function pickInitialMethod(providers: ConfiguredProviders): Method {
  if (providers.emailPassword) return 'email';
  if (providers.phone) return 'phone';
  return 'oauth';
}

function SignInInner({ providers }: { providers: ConfiguredProviders }) {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';
  const [method, setMethod] = useState<Method>(pickInitialMethod(providers));

  const oauthAvailable = providers.google || providers.github;

  return (
    <main className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold">Sign in to Problem Bank</h1>
      <p className="text-sm text-gray-600 mt-1 mb-6">
        {providers.phone || oauthAvailable
          ? 'Email is enabled. Phone and OAuth depend on local configuration.'
          : 'Sign in with email and password.'}
      </p>

      <div className="flex border rounded overflow-hidden mb-6 text-sm">
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={`flex-1 px-3 py-2 ${method === 'email' ? 'bg-black text-white' : ''}`}
        >
          Email
        </button>
        {providers.phone && (
          <button
            type="button"
            onClick={() => setMethod('phone')}
            className={`flex-1 px-3 py-2 border-l ${method === 'phone' ? 'bg-black text-white' : ''}`}
          >
            Phone
          </button>
        )}
        {oauthAvailable && (
          <button
            type="button"
            onClick={() => setMethod('oauth')}
            className={`flex-1 px-3 py-2 border-l ${method === 'oauth' ? 'bg-black text-white' : ''}`}
          >
            {providers.google && providers.github
              ? 'Google · GitHub'
              : providers.google
                ? 'Google'
                : 'GitHub'}
          </button>
        )}
      </div>

      {method === 'email' && <EmailPasswordForm callbackUrl={callbackUrl} />}
      {method === 'phone' && providers.phone && <PhoneOtpForm callbackUrl={callbackUrl} />}
      {method === 'oauth' && oauthAvailable && (
        <div className="space-y-3">
          {providers.google && (
            <button
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full border rounded px-4 py-3 text-left hover:bg-gray-50"
            >
              Continue with Google
            </button>
          )}
          {providers.github && (
            <button
              onClick={() => signIn('github', { callbackUrl })}
              className="w-full border rounded px-4 py-3 text-left hover:bg-gray-50"
            >
              Continue with GitHub
            </button>
          )}
        </div>
      )}
    </main>
  );
}

export default function SignInTabs({ providers }: { providers: ConfiguredProviders }) {
  return (
    <Suspense fallback={<div className="p-12">Loading…</div>}>
      <SignInInner providers={providers} />
    </Suspense>
  );
}
