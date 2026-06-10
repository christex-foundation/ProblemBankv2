'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import { signIn } from 'next-auth/react';
import { Eyebrow, Heading, Body } from '@/design/typography';
import { Input } from '@/design/primitives';
import type { ConfiguredProviders } from '@/lib/auth-providers';

/**
 * Shared building blocks for the auth pages (/signin, /signup, /reset).
 * Centralised here so the two tab flows can't drift out of sync and every
 * field follows the Input spec in design/COMPONENTS.md §2 (square hairline
 * border, 16px text, uppercase label, border-width focus — not a ring).
 */

export type AuthMethod = 'phone' | 'email' | 'oauth';

export const authLabelCls =
  'block text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground/55';

/** Eyebrow + heading + optional subtitle, matching the page-hero rhythm. */
export function AuthHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className="mb-8">
      <Eyebrow tone="accent" size="sm">
        {eyebrow}
      </Eyebrow>
      <Heading level={1} size="h3" className="mt-3">
        {title}
      </Heading>
      {subtitle && (
        <Body tone="muted" size="sm" className="mt-3">
          {subtitle}
        </Body>
      )}
    </div>
  );
}

/** Labelled text input following the Input spec. `hint` renders inline, muted. */
export function AuthField({
  id,
  label,
  hint,
  ...rest
}: {
  id: string;
  label: string;
  hint?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>) {
  return (
    <div>
      <label htmlFor={id} className={authLabelCls}>
        {label}
        {hint && (
          <span className="ml-1.5 normal-case tracking-normal text-foreground/35">
            {hint}
          </span>
        )}
      </label>
      <Input id={id} className="mt-2" {...rest} />
    </div>
  );
}

/** Helper / hint line under a field or control. */
export function AuthHelp({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-[11px] leading-relaxed text-foreground/45">
      {children}
    </p>
  );
}

/** Editorial segmented control for the email / phone / oauth method switch. */
export function MethodTabs({
  method,
  onChange,
  providers,
}: {
  method: AuthMethod;
  onChange: (m: AuthMethod) => void;
  providers: ConfiguredProviders;
}) {
  const oauthAvailable = providers.google || providers.github;
  const oauthLabel =
    providers.google && providers.github
      ? 'Google · GitHub'
      : providers.google
        ? 'Google'
        : 'GitHub';

  const tabs = [
    { key: 'email' as const, label: 'Email', show: true },
    { key: 'phone' as const, label: 'Phone', show: providers.phone },
    { key: 'oauth' as const, label: oauthLabel, show: oauthAvailable },
  ].filter((t) => t.show);

  // A single method needs no switcher.
  if (tabs.length <= 1) return null;

  return (
    <div
      role="tablist"
      aria-label="Sign-in method"
      className="flex border border-foreground/20 mb-8"
    >
      {tabs.map((t, i) => {
        const active = method === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`flex-1 px-3 py-3.5 text-[10px] uppercase tracking-[0.22em] font-semibold transition-soft ${
              i > 0 ? 'border-l border-foreground/20' : ''
            } ${
              active
                ? 'bg-foreground text-background'
                : 'text-foreground/55 hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/** OAuth provider buttons (outline style), shared by sign-in and sign-up. */
export function OAuthButtons({
  providers,
  callbackUrl,
}: {
  providers: ConfiguredProviders;
  callbackUrl: string;
}) {
  const btnCls =
    'w-full border border-foreground/20 px-4 py-3.5 text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground hover:bg-foreground hover:text-background transition-soft';
  return (
    <div className="flex flex-col gap-3">
      {providers.google && (
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl })}
          className={btnCls}
        >
          Continue with Google
        </button>
      )}
      {providers.github && (
        <button
          type="button"
          onClick={() => signIn('github', { callbackUrl })}
          className={btnCls}
        >
          Continue with GitHub
        </button>
      )}
    </div>
  );
}
