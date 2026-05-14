'use client';

import { useState, useEffect } from 'react';

interface CacheInfo {
  success: boolean;
  cache: {
    tags: string[];
    revalidationTimes: Record<string, string>;
    browserCache: Record<string, string>;
  };
  timestamp: string;
}

interface CacheMonitorProps {
  className?: string;
}

export default function CacheMonitor({ className = '' }: CacheMonitorProps) {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCacheInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/hackathon/api/cache');
      const data = await response.json();
      setCacheInfo(data);
    } catch (err) {
      setError('Failed to fetch cache info');
    } finally {
      setLoading(false);
    }
  };

  const invalidateCache = async (action: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/hackathon/api/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchCacheInfo(); // Refresh cache info
      } else {
        setError(data.error || 'Cache invalidation failed');
      }
    } catch (err) {
      setError('Failed to invalidate cache');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCacheInfo();
  }, []);

  if (!cacheInfo) {
    return (
      <div className={`p-4 border rounded-lg ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Cache Monitor</h3>
          <button
            onClick={fetchCacheInfo}
            disabled={loading}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <p className="text-gray-600">Loading cache information...</p>
      </div>
    );
  }

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cache Monitor</h3>
        <div className="flex gap-2">
          <button
            onClick={fetchCacheInfo}
            disabled={loading}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Cache Tags</h4>
          <div className="flex flex-wrap gap-2">
            {cacheInfo.cache.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Revalidation Times</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(cacheInfo.cache.revalidationTimes).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">{key}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Browser Cache</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(cacheInfo.cache.browserCache).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">{key}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Cache Actions</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => invalidateCache('invalidate-ideas')}
              disabled={loading}
              className="px-3 py-1 bg-yellow-500 text-white rounded disabled:opacity-50 text-sm"
            >
              Invalidate Ideas
            </button>
            <button
              onClick={() => invalidateCache('invalidate-tech-stacks')}
              disabled={loading}
              className="px-3 py-1 bg-yellow-500 text-white rounded disabled:opacity-50 text-sm"
            >
              Invalidate Tech Stacks
            </button>
            <button
              onClick={() => invalidateCache('invalidate-all')}
              disabled={loading}
              className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50 text-sm"
            >
              Invalidate All
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Last updated: {new Date(cacheInfo.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}








