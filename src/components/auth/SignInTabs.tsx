'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PhoneOtpForm from '@/components/auth/PhoneOtpForm';
import EmailPasswordForm from '@/components/auth/EmailPasswordForm';
import {
  AuthHeading,
  MethodTabs,
  OAuthButtons,
  type AuthMethod,
} from '@/components/auth/AuthUI';
import type { ConfiguredProviders } from '@/lib/auth-providers';

function pickInitialMethod(providers: ConfiguredProviders): AuthMethod {
  if (providers.emailPassword) return 'email';
  if (providers.phone) return 'phone';
  return 'oauth';
}

function SignInInner({ providers }: { providers: ConfiguredProviders }) {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';
  const [method, setMethod] = useState<AuthMethod>(pickInitialMethod(providers));

  const oauthAvailable = providers.google || providers.github;

  return (
    <div>
      <AuthHeading
        eyebrow="Problem Bank"
        title="Welcome back"
        subtitle="Sign in to vote, comment, and register as a builder."
      />

      <MethodTabs method={method} onChange={setMethod} providers={providers} />

      {method === 'email' && <EmailPasswordForm callbackUrl={callbackUrl} />}
      {method === 'phone' && providers.phone && (
        <PhoneOtpForm callbackUrl={callbackUrl} />
      )}
      {method === 'oauth' && oauthAvailable && (
        <OAuthButtons providers={providers} callbackUrl={callbackUrl} />
      )}

      <p className="mt-8 text-center text-sm text-foreground/55">
        No account?{' '}
        <Link href="/signup" className="link-underline text-foreground">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function SignInTabs({
  providers,
}: {
  providers: ConfiguredProviders;
}) {
  return (
    <Suspense
      fallback={
        <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/45">
          Loading…
        </p>
      }
    >
      <SignInInner providers={providers} />
    </Suspense>
  );
}
