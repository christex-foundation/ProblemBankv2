'use client';

import type { ReactNode } from 'react';
import { useRaiseModal } from './RaiseModalProvider';

type Variant = 'primary' | 'accent' | 'outline' | 'outlineInverse' | 'ghost';

const BASE =
  'inline-flex items-center justify-center px-8 py-4 text-[11px] uppercase tracking-[0.22em] font-semibold transition-soft';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-foreground text-background hover:bg-accent hover:text-background',
  accent: 'bg-accent text-background hover:bg-foreground hover:text-background',
  outline:
    'border border-foreground text-foreground hover:bg-foreground hover:text-background',
  outlineInverse:
    'border border-background text-background hover:bg-background hover:text-foreground',
  ghost: 'text-foreground hover:text-accent',
};

/**
 * Visual clone of ButtonLink that triggers the raise-a-problem modal via the
 * RaiseModalProvider context. Use it anywhere the CTA used to point at
 * /feed/submit; that route no longer exists.
 */
export function RaiseButton({
  children,
  variant = 'primary',
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const { openRaiseModal } = useRaiseModal();
  return (
    <button
      type="button"
      onClick={openRaiseModal}
      className={[BASE, VARIANT[variant], className].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  );
}
