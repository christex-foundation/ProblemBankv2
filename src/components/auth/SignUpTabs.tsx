'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'sonner';
import PhoneOtpForm from '@/components/auth/PhoneOtpForm';
import {
  AuthHeading,
  AuthField,
  AuthHelp,
  MethodTabs,
  OAuthButtons,
  type AuthMethod,
} from '@/components/auth/AuthUI';
import { Button } from '@/design/primitives';
import { apiErrorMessage } from '@/lib/api-response';
import { MIN_PASSWORD_LEN } from '@/lib/enums';
import type { ConfiguredProviders } from '@/lib/auth-providers';

function pickInitialMethod(providers: ConfiguredProviders): AuthMethod {
  if (providers.emailPassword) return 'email';
  if (providers.phone) return 'phone';
  return 'oauth';
}

function SignUpInner({ providers }: { providers: ConfiguredProviders }) {
  const params = useSearchParams();
  const router = useRouter();
  const callbackUrl = params.get('callbackUrl') ?? '/';
  const [method, setMethod] = useState<AuthMethod>(pickInitialMethod(providers));

  const oauthAvailable = providers.google || providers.github;

  return (
    <div>
      <AuthHeading
        eyebrow="Problem Bank"
        title="Create an account"
        subtitle="Join to raise problems, vote, and build in the open."
      />

      <MethodTabs method={method} onChange={setMethod} providers={providers} />

      {method === 'email' && (
        <EmailSignupForm callbackUrl={callbackUrl} router={router} />
      )}
      {method === 'phone' && providers.phone && (
        <PhoneOtpForm callbackUrl={callbackUrl} />
      )}
      {method === 'oauth' && oauthAvailable && (
        <OAuthButtons providers={providers} callbackUrl={callbackUrl} />
      )}

      <p className="mt-8 text-center text-sm text-foreground/55">
        Already have an account?{' '}
        <Link href="/signin" className="link-underline text-foreground">
          Sign in
        </Link>
      </p>
    </div>
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
      if (!res.ok) throw new Error(apiErrorMessage(data) ?? 'Failed to sign up');

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
    <form onSubmit={submit} className="flex flex-col gap-5">
      <AuthField
        id="name"
        label="Name"
        hint="(optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        autoComplete="name"
      />
      <AuthField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <AuthField
        id="password"
        label="Password"
        hint={`(min ${MIN_PASSWORD_LEN})`}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={MIN_PASSWORD_LEN}
        autoComplete="new-password"
      />
      {siteKey ? (
        <Turnstile siteKey={siteKey} onSuccess={setTurnstileToken} />
      ) : (
        <AuthHelp>Bot protection not configured.</AuthHelp>
      )}
      <Button
        type="submit"
        variant="primary"
        disabled={
          busy ||
          !email ||
          password.length < MIN_PASSWORD_LEN ||
          (!turnstileToken && !!siteKey)
        }
        className="w-full disabled:opacity-50"
      >
        {busy ? 'Creating…' : 'Create account'}
      </Button>
    </form>
  );
}

export default function SignUpTabs({
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
      <SignUpInner providers={providers} />
    </Suspense>
  );
}
