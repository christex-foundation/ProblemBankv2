'use client';

import type { ReactNode } from 'react';
import { useRaiseModal } from './RaiseModalProvider';

/**
 * Inline text trigger for the raise-a-problem modal, styled like the
 * link-underline pattern. Used in places where ButtonLink would be too
 * heavy (empty states, in-flow links).
 */
export function RaiseLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { openRaiseModal } = useRaiseModal();
  return (
    <button
      type="button"
      onClick={openRaiseModal}
      className={[
        'link-underline text-[11px] uppercase tracking-[0.28em] font-semibold text-accent',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}
