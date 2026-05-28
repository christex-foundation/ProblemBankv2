'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

/**
 * Wraps any inline trigger so clicking it opens the shared sign-in modal.
 * Used by the comment composer (whole-card trigger) and inline Reply
 * affordances on each comment. The modal renders the four auth methods
 * supported by the production /signin page; each option routes to
 * /signin?callbackUrl=<callbackPath>.
 */
export function SignInTrigger({
  callbackPath,
  children,
  className,
  ariaLabel,
}: {
  callbackPath: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </button>
      {open && (
        <SignInModal
          callbackPath={callbackPath}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function SignInModal({
  callbackPath,
  onClose,
}: {
  callbackPath: string;
  onClose: () => void;
}) {
  const callbackUrl = `/signin?callbackUrl=${encodeURIComponent(callbackPath)}`;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
      className="fixed inset-0 z-[80] flex items-center justify-center px-5 py-10"
    >
      <button
        type="button"
        aria-label="Close sign-in"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm cursor-default"
      />

      <div className="relative z-10 w-full max-w-md bg-paper border border-foreground/20 rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-start justify-between gap-4 px-7 pt-7">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-accent">
              Sign in
            </p>
            <h2
              id="signin-modal-title"
              className="mt-3 font-semibold tracking-[-0.015em] text-2xl md:text-[1.75rem] leading-[1.15] text-foreground max-w-[18ch]"
            >
              Join the conversation.
            </h2>
            <p className="mt-3 text-sm md:text-base text-foreground/55 leading-[1.5] max-w-[34ch]">
              Pick a method. Anything you read is open to everyone; posting
              needs an account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 -mt-1 -mr-1 inline-flex w-9 h-9 items-center justify-center rounded-full text-foreground/55 hover:text-foreground hover:bg-foreground/[0.06] transition-soft"
          >
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>

        <ul className="flex flex-col mt-7 border-t border-foreground/10">
          <SignInOption href={callbackUrl} label="Continue with phone" hint="OTP via SMS" />
          <SignInOption href={callbackUrl} label="Continue with email" hint="Email and password" />
          <SignInOption href={callbackUrl} label="Continue with Google" />
          <SignInOption href={callbackUrl} label="Continue with GitHub" />
        </ul>

        <div className="px-7 py-5 border-t border-foreground/10 text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground/45">
          New here?{' '}
          <Link
            href="/signup"
            className="link-underline text-accent ml-1"
            onClick={onClose}
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

function SignInOption({
  href,
  label,
  hint,
}: {
  href: string;
  label: string;
  hint?: string;
}) {
  return (
    <li className="border-b border-foreground/10 last:border-b-0">
      <Link
        href={href}
        className="group flex items-center justify-between gap-4 px-7 py-4 transition-soft hover:bg-foreground/[0.04]"
      >
        <span className="flex flex-col gap-1">
          <span className="text-sm md:text-base font-medium text-foreground">
            {label}
          </span>
          {hint && (
            <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground/45">
              {hint}
            </span>
          )}
        </span>
        <span
          aria-hidden
          className="text-[11px] uppercase tracking-[0.28em] font-semibold text-foreground/30 group-hover:text-accent group-hover:translate-x-1 transition-all duration-200"
        >
          →
        </span>
      </Link>
    </li>
  );
}
