'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-response';
import BuilderRepoActivity from '@/components/library/BuilderRepoActivity';

interface Builder {
  id: string;
  userId: string;
  name: string | null;
  githubUrl: string | null;
  repoUrl: string | null;
  registeredAt: string;
}

interface Props {
  entryId: string;
  entrySlug: string;
  builders: Builder[];
  kitUrl: string | null;
  demoUrl: string | null;
}

export default function BuildRegistry({
  entryId,
  entrySlug,
  builders,
  kitUrl,
  demoUrl,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [list, setList] = useState(builders);
  const myUserId = session?.user?.id;
  const myEntry = myUserId ? list.find((b) => b.userId === myUserId) : null;
  const [repoUrl, setRepoUrl] = useState(myEntry?.repoUrl ?? '');
  const [savingRepo, setSavingRepo] = useState(false);
  const [registering, setRegistering] = useState(false);

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const badgeUrl = `${base}/api/badge/${entrySlug}`;
  const entryUrl = `${base || 'https://build.christex.foundation'}/library/${entrySlug}`;
  const badgeMarkdown = `[![Building on Problem Bank](${badgeUrl})](${entryUrl})`;

  async function register() {
    if (!session) {
      router.push(
        `/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    setRegistering(true);
    try {
      const res = await fetch(`/api/library/${entryId}/build-registry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(apiErrorMessage(data) ?? 'Failed to register');
      setList([
        ...list,
        {
          id: data.record.id,
          userId: data.record.userId,
          name: session.user?.name ?? null,
          githubUrl: data.record.user?.githubUrl ?? null,
          repoUrl: null,
          registeredAt: new Date().toISOString(),
        },
      ]);
      toast.success('Registered as builder');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setRegistering(false);
    }
  }

  async function saveRepo() {
    if (!myUserId) return;
    setSavingRepo(true);
    try {
      const res = await fetch(`/api/library/${entryId}/build-registry`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(apiErrorMessage(data) ?? 'Failed to save');
      }
      setList(
        list.map((b) => (b.userId === myUserId ? { ...b, repoUrl: repoUrl || null } : b)),
      );
      toast.success('Repo updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSavingRepo(false);
    }
  }

  async function unregister() {
    if (!myUserId) return;
    if (!confirm('Remove yourself from this build registry?')) return;
    const res = await fetch(`/api/library/${entryId}/build-registry`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setList(list.filter((b) => b.userId !== myUserId));
      toast.success('Unregistered');
    } else {
      toast.error('Failed to unregister');
    }
  }

  async function copyBadge() {
    try {
      await navigator.clipboard.writeText(badgeMarkdown);
      toast.success('Copied!');
    } catch {
      toast.error('Copy failed');
    }
  }

  return (
    <section className="my-8">
      <h2 className="text-lg font-semibold mb-3">Build Registry</h2>

      {list.length === 0 ? (
        <p className="text-sm text-gray-500 mb-3">
          No one is building this yet. Be the first.
        </p>
      ) : (
        <ul className="space-y-2 mb-4">
          {list.map((b) => (
            <li key={b.id} className="border rounded p-3">
              <Link href={`/builders/${b.userId}`} className="font-medium underline">
                {b.name ?? 'Anonymous builder'}
              </Link>
              {b.repoUrl && (
                <p className="text-xs text-gray-600 mt-1 break-all">
                  <a href={b.repoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    {b.repoUrl}
                  </a>
                </p>
              )}
              {b.repoUrl && <BuilderRepoActivity repoUrl={b.repoUrl} />}
            </li>
          ))}
        </ul>
      )}

      {!myEntry ? (
        <button
          onClick={register}
          disabled={registering}
          className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {registering ? 'Registering…' : "I'm building this"}
        </button>
      ) : (
        <div className="border rounded p-4 space-y-4 bg-gray-50">
          <p className="text-sm">You&apos;re registered as a builder.</p>

          {(kitUrl || demoUrl) && (
            <div className="flex flex-wrap gap-3 text-sm">
              {kitUrl && (
                <a
                  href={kitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Open starter kit
                </a>
              )}
              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Open live demo
                </a>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">
              Your repo URL <span className="text-gray-500">(optional)</span>
            </label>
            <div className="flex gap-2 mt-1">
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/your-user/your-repo"
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                onClick={saveRepo}
                disabled={savingRepo}
                className="px-3 py-2 border rounded"
              >
                Save
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Badge for your README</label>
            <pre className="text-xs bg-white border rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
              {badgeMarkdown}
            </pre>
            <button
              onClick={copyBadge}
              className="mt-2 px-3 py-1 border rounded text-sm"
            >
              Copy
            </button>
          </div>

          <button
            onClick={unregister}
            className="text-red-600 text-sm underline"
          >
            Remove me from registry
          </button>
        </div>
      )}
    </section>
  );
}
