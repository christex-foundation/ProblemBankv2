'use client';

import { useState } from 'react';
import {
  SECTORS,
  URGENCY_LABELS,
  MAX_TITLE_LEN,
  type Sector,
  type UrgencyKey,
} from '@/lib/enums';
import { submitProblem, type SubmitAccount } from '@/lib/submit';
import { Eyebrow, Lede } from '@/design/typography';
import { Button, ButtonLink, Input, Select, Textarea } from '@/design/primitives';

type Props = {
  signedIn?: boolean;
};

type AccountMethod = SubmitAccount['method'] | null;

export default function SubmitForm({ signedIn = false }: Props) {
  const [submitted, setSubmitted] = useState<null | 'live' | 'pending-email'>(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [toolIdea, setToolIdea] = useState('');
  const [criteria, setCriteria] = useState<string[]>([]);
  const [sector, setSector] = useState<Sector>(SECTORS[0]);
  const [urgency, setUrgency] = useState<UrgencyKey>('medium');

  const [accountMethod, setAccountMethod] = useState<AccountMethod>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+232');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [humanConfirmed, setHumanConfirmed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleOk = title.trim().length > 0;
  const problemOk = problem.trim().length > 0;
  const toolIdeaOk = toolIdea.trim().length > 0;
  const accountOk = signedIn || isAccountReady(accountMethod, { email, phone });
  const canSubmit =
    titleOk && problemOk && toolIdeaOk && accountOk && humanConfirmed && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const account = signedIn ? undefined : buildAccount(accountMethod, { email, phone, channel });
      const result = await submitProblem({
        title: title.trim(),
        problem: problem.trim(),
        toolIdea: toolIdea.trim(),
        signsItsWorking: criteria.map((c) => c.trim()).filter(Boolean),
        sector,
        urgency,
        account,
        turnstileToken: 'prototype-stub',
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (account?.method === 'email') {
        setPendingEmail(account.email);
        setSubmitted('pending-email');
      } else {
        setSubmitted('live');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSubmitted(null);
    setPendingEmail('');
    setTitle('');
    setProblem('');
    setToolIdea('');
    setCriteria([]);
    setSector(SECTORS[0]);
    setUrgency('medium');
    setAccountMethod(null);
    setEmail('');
    setPhone('+232');
    setChannel('whatsapp');
    setHumanConfirmed(false);
    setError(null);
  }

  if (submitted === 'pending-email') {
    return (
      <div className="max-w-[680px] space-y-8">
        <div>
          <Eyebrow tone="accent" size="sm">
            Check your email.
          </Eyebrow>
          <h2 className="mt-3 font-black tracking-[-0.03em] leading-[0.95] text-[clamp(1.75rem,5vw,2.75rem)]">
            One link away.
          </h2>
          <div className="mt-5">
            <Lede>
              We sent a link to{' '}
              <span className="text-foreground font-semibold">{pendingEmail}</span>. Click it to
              confirm your account and publish your card to the feed.
            </Lede>
          </div>
          <p className="mt-4 text-sm text-foreground/55 leading-[1.6] max-w-[55ch]">
            Didn't see it? Check spam, or{' '}
            <button
              type="button"
              onClick={reset}
              className="text-foreground hover:text-accent underline-offset-4 hover:underline transition-soft"
            >
              try a different method
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  if (submitted === 'live') {
    return (
      <div className="max-w-[680px] space-y-8">
        <div>
          <Eyebrow tone="accent" size="sm">
            Submitted.
          </Eyebrow>
          <h2 className="mt-3 font-black tracking-[-0.03em] leading-[0.95] text-[clamp(1.75rem,5vw,2.75rem)]">
            The feed gets it <span className="text-accent">next.</span>
          </h2>
          <div className="mt-5">
            <Lede>
              Watch your card on the feed. If it gains traction across the week, it moves up
              the shelf and into the Library research queue.
            </Lede>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <ButtonLink href="/feed" variant="primary" className="w-full sm:w-[240px]">
            View on the feed
          </ButtonLink>
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            className="w-full sm:w-[240px]"
          >
            Raise another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-[680px]">
      {/* SHORT TITLE */}
      <FieldShell label="Short title" required>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE_LEN}
          placeholder="e.g. Public accountability for reps"
        />
        <div className="flex items-center justify-between mt-2">
          <Helper>Shown on pipeline cards. Keep it concise.</Helper>
          <span
            className={`text-[10px] tabular-nums uppercase tracking-[0.22em] ${
              title.length >= MAX_TITLE_LEN ? 'text-accent' : 'text-foreground/35'
            }`}
          >
            {title.length}/{MAX_TITLE_LEN}
          </span>
        </div>
      </FieldShell>

      {/* WHAT'S THE PROBLEM? */}
      <FieldShell label="What's the problem?" required>
        <Textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          rows={4}
          placeholder="e.g. There's no easy way to know if a politician actually showed up to parliament."
        />
      </FieldShell>

      {/* WHAT COULD THE TOOL DO? */}
      <FieldShell label="What could the tool do?" required>
        <Textarea
          value={toolIdea}
          onChange={(e) => setToolIdea(e.target.value)}
          rows={4}
          placeholder="e.g. A searchable database of rep attendance, pulled from the official record."
        />
      </FieldShell>

      {/* HOW WILL WE KNOW IT'S WORKING? */}
      <FieldShell label="How will we know it's working?" optional>
        <Helper className="mb-3">
          Add a few clear signs builders can aim for, like open source, works on a basic phone,
          covers every district.
        </Helper>
        <ul className="space-y-2">
          {criteria.map((c, i) => (
            <li key={i} className="flex items-center gap-2">
              <span aria-hidden className="text-foreground/35 text-sm shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <Input
                size="sm"
                value={c}
                onChange={(e) => {
                  const next = [...criteria];
                  next[i] = e.target.value;
                  setCriteria(next);
                }}
                placeholder={`Sign ${i + 1}`}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setCriteria(criteria.filter((_, idx) => idx !== i))}
                aria-label={`Remove sign ${i + 1}`}
                className="shrink-0 w-8 h-8 inline-flex items-center justify-center text-foreground/45 hover:text-accent transition-soft"
              >
                <span aria-hidden className="text-base leading-none">
                  ×
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setCriteria([...criteria, ''])}
          className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/55 hover:text-accent transition-soft"
        >
          <span aria-hidden>+</span> Add a sign
        </button>
      </FieldShell>

      {/* DETAILS — sector + urgency */}
      <div className="pt-8 border-t border-foreground/10">
        <Eyebrow tone="muted" size="sm" className="mb-4">
          Details
        </Eyebrow>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FieldShell label="Sector" required compact>
            <Select
              value={sector}
              onChange={(e) => setSector(e.target.value as Sector)}
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </FieldShell>
          <FieldShell label="Urgency" required compact>
            <Select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as UrgencyKey)}
            >
              {(Object.keys(URGENCY_LABELS) as UrgencyKey[]).map((k) => (
                <option key={k} value={k}>
                  {URGENCY_LABELS[k]}
                </option>
              ))}
            </Select>
          </FieldShell>
        </div>
      </div>

      {/* ACCOUNT BLOCK — only if anonymous */}
      {!signedIn && (
        <AccountBlock
          method={accountMethod}
          onPick={setAccountMethod}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          channel={channel}
          setChannel={setChannel}
        />
      )}

      {/* Human check + submit */}
      <div className="pt-8 border-t border-foreground/10 space-y-6">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={humanConfirmed}
            onChange={(e) => setHumanConfirmed(e.target.checked)}
            className="mt-1 w-4 h-4 accent-foreground"
          />
          <span className="text-sm text-foreground/70 leading-[1.5]">
            I'm a person, not a bot. (Turnstile widget mounts here in production when{' '}
            <code className="text-xs px-1 bg-foreground/[0.06]">
              NEXT_PUBLIC_TURNSTILE_SITE_KEY
            </code>{' '}
            is set.)
          </span>
        </label>

        {error && (
          <div
            role="alert"
            className="text-sm text-accent border border-accent/40 bg-accent/[0.06] px-4 py-3"
          >
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={!canSubmit}
            className="w-full sm:w-[280px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : submitLabel(signedIn, accountMethod)}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────

function FieldShell({
  label,
  required,
  optional,
  compact,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Eyebrow tone="muted" size="sm" className={compact ? 'mb-2' : 'mb-3'}>
        {label}
        {optional && (
          <span className="ml-2 text-foreground/35 normal-case tracking-normal font-normal">
            (optional)
          </span>
        )}
        {required && <span aria-hidden className="ml-1 text-accent">*</span>}
      </Eyebrow>
      {children}
    </div>
  );
}

function Helper({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-xs text-foreground/55 leading-[1.5] ${className}`}>{children}</p>
  );
}

function submitLabel(signedIn: boolean, method: AccountMethod): string {
  if (signedIn) return 'Submit';
  switch (method) {
    case 'email':
      return 'Send sign-in link';
    case 'phone':
      return 'Send code';
    case 'google':
      return 'Continue with Google';
    case 'github':
      return 'Continue with GitHub';
    default:
      return 'Submit and create account';
  }
}

function isAccountReady(
  method: AccountMethod,
  fields: { email: string; phone: string },
): boolean {
  if (method === 'email') {
    return /\S+@\S+\.\S+/.test(fields.email);
  }
  if (method === 'phone') {
    return /^\+\d{6,}$/.test(fields.phone);
  }
  return method === 'google' || method === 'github';
}

function buildAccount(
  method: AccountMethod,
  fields: { email: string; phone: string; channel: 'sms' | 'whatsapp' },
): SubmitAccount | undefined {
  if (method === 'email') return { method: 'email', email: fields.email };
  if (method === 'phone')
    return { method: 'phone', phone: fields.phone, channel: fields.channel };
  if (method === 'google') return { method: 'google' };
  if (method === 'github') return { method: 'github' };
  return undefined;
}

// ─── account block ──────────────────────────────────────────────────────

function AccountBlock(props: {
  method: AccountMethod;
  onPick: (m: AccountMethod) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  channel: 'sms' | 'whatsapp';
  setChannel: (v: 'sms' | 'whatsapp') => void;
}) {
  const { method, onPick } = props;

  const options: { key: NonNullable<AccountMethod>; label: string; hint?: string }[] = [
    { key: 'phone', label: 'Continue with phone', hint: 'We send you a code' },
    { key: 'email', label: 'Continue with email', hint: 'We email you a link' },
    { key: 'google', label: 'Continue with Google', hint: 'Use your Google account' },
    { key: 'github', label: 'Continue with GitHub', hint: 'Use your GitHub account' },
  ];

  return (
    <div className="pt-8 border-t border-foreground/10">
      <div className="bg-paper border border-foreground/15 p-6 md:p-7">
        <Eyebrow tone="accent" size="sm">
          First time?
        </Eyebrow>
        <h2 className="mt-3 font-semibold tracking-[-0.015em] text-xl md:text-2xl leading-[1.2] text-foreground max-w-[28ch]">
          Submit and create your account in one step.
        </h2>
        <p className="mt-3 text-sm md:text-base text-foreground/55 leading-[1.5] max-w-[44ch]">
          Pick how you want to sign in. We'll save your submission once you confirm.
        </p>

        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((opt) => {
            const active = method === opt.key;
            return (
              <li key={opt.key}>
                <button
                  type="button"
                  onClick={() => onPick(active ? null : opt.key)}
                  aria-pressed={active}
                  className={`w-full flex items-center justify-between gap-4 px-4 py-3 border transition-soft text-left ${
                    active
                      ? 'border-foreground bg-foreground/[0.04]'
                      : 'border-foreground/15 hover:border-foreground/40'
                  }`}
                >
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    {opt.hint && (
                      <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground/45">
                        {opt.hint}
                      </span>
                    )}
                  </span>
                  <span
                    aria-hidden
                    className={`text-[11px] uppercase tracking-[0.22em] font-semibold transition-soft ${
                      active ? 'text-accent' : 'text-foreground/30'
                    }`}
                  >
                    {active ? '✓' : '→'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Expanded fields for the picked method. Google + GitHub need no
           inline UI: clicking Submit hands off to the provider's own sign-in. */}
        {method === 'email' && (
          <div className="mt-6 space-y-3 border-t border-foreground/10 pt-6">
            <Input
              type="email"
              value={props.email}
              onChange={(e) => props.setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <p className="text-xs text-foreground/55 leading-[1.5]">
              We email you a link. Your card publishes when you click it.
            </p>
          </div>
        )}

        {method === 'phone' && (
          <div className="mt-6 space-y-3 border-t border-foreground/10 pt-6">
            <Input
              type="tel"
              value={props.phone}
              onChange={(e) => props.setPhone(e.target.value)}
              placeholder="+232 7X XXX XXX"
              autoComplete="tel"
            />
            <div className="flex gap-2">
              {(['whatsapp', 'sms'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => props.setChannel(c)}
                  aria-pressed={props.channel === c}
                  className={`flex-1 px-3 py-2 text-[11px] uppercase tracking-[0.22em] font-semibold border transition-soft ${
                    props.channel === c
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-foreground/15 text-foreground/70 hover:border-foreground/40'
                  }`}
                >
                  {c === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
