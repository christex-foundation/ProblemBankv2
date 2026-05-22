'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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
      <p className="text-gray-600 mb-2">{error.message || 'Unexpected error'}</p>
      {error.digest && (
        <p className="text-xs text-gray-400 mb-6">Reference: {error.digest}</p>
      )}
      <div className="flex gap-3 justify-center text-sm">
        <button
          type="button"
          onClick={reset}
          className="bg-black text-white rounded px-4 py-2"
        >
          Try again
        </button>
        <Link href="/" className="border rounded px-4 py-2">
          Home
        </Link>
      </div>
    </main>
  );
}
