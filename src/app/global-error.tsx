'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          {error.message || 'Unexpected error'}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            background: 'black',
            color: 'white',
            border: 0,
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
