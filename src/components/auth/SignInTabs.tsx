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

/** Show every sign-in option regardless of which secrets are configured. */
const ALL_PROVIDERS: ConfiguredProviders = {
  google: true,
  github: true,
  phone: true,
  emailPassword: true,
};

function availableMethods(p: ConfiguredProviders): AuthMethod[] {
  const list: AuthMethod[] = [];
  if (p.emailPassword) list.push('email');
  if (p.phone) list.push('phone');
  if (p.google || p.github) list.push('oauth');
  return list;
}

function SignInInner({ providers }: { providers: ConfiguredProviders }) {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';

  // Always surface every sign-in option. Real secrets aren't wired yet, so the
  // forms won't authenticate, but all methods are shown.
  const effective = { ...providers, ...ALL_PROVIDERS };

  const [method, setMethod] = useState<AuthMethod>('email');
  const available = availableMethods(effective);
  const activeMethod = available.includes(method) ? method : (available[0] ?? 'email');

  const oauthAvailable = effective.google || effective.github;

  return (
    <div>
      <AuthHeading
        eyebrow="Problem Bank"
        title="Welcome back"
        subtitle="Sign in to vote, comment, and register as a builder."
      />

      <MethodTabs method={activeMethod} onChange={setMethod} providers={effective} />

      {activeMethod === 'email' && <EmailPasswordForm callbackUrl={callbackUrl} />}
      {activeMethod === 'phone' && effective.phone && (
        <PhoneOtpForm callbackUrl={callbackUrl} />
      )}
      {activeMethod === 'oauth' && oauthAvailable && (
        <OAuthButtons providers={effective} callbackUrl={callbackUrl} />
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
