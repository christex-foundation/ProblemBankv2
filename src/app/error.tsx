'use client';

import { useEffect } from 'react';
import { Button, ButtonLink } from '@/design/primitives';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook for Sentry / posthog / etc. later.
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-md mx-auto py-24 px-4 text-center">
      <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
      <p className="text-foreground/70 mb-2">{error.message || 'Unexpected error'}</p>
      {error.digest && (
        <p className="text-xs text-foreground/45 mb-6">Reference: {error.digest}</p>
      )}
      <div className="flex gap-3 justify-center">
        <Button type="button" onClick={reset} variant="primary" size="sm">
          Try again
        </Button>
        <ButtonLink href="/" variant="outline" size="sm">
          Home
        </ButtonLink>
      </div>
    </main>
  );
}
