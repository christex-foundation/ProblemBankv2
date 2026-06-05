'use client';

import type { ReactNode } from 'react';
import { Button } from '@/design/primitives';
import { useRaiseModal } from './RaiseModalProvider';

type Variant = 'primary' | 'accent' | 'outline' | 'outlineInverse' | 'ghost';

/**
 * Button primitive wired to open the raise-a-problem modal via the
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
    <Button type="button" variant={variant} onClick={openRaiseModal} className={className}>
      {children}
    </Button>
  );
}
