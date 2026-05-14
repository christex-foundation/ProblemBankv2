'use client';

import { useEffect, useState } from 'react';

export default function BuilderRepoActivity({ repoUrl }: { repoUrl: string }) {
  const [lastPushed, setLastPushed] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/github/activity?repo=${encodeURIComponent(repoUrl)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setLastPushed(d.lastPushed ?? null);
      })
      .catch(() => {
        if (!cancelled) setLastPushed(null);
      });
    return () => {
      cancelled = true;
    };
  }, [repoUrl]);

  if (lastPushed === undefined) {
    return <p className="text-xs text-gray-400 mt-1">Checking activity…</p>;
  }
  if (!lastPushed) return null; // Silently hide for private/invalid/404 repos.

  return (
    <p className="text-xs text-gray-600 mt-1">
      Last push: {new Date(lastPushed).toLocaleDateString()}
    </p>
  );
}
