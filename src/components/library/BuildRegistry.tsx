'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-response';
import BuilderRepoActivity from '@/components/library/BuilderRepoActivity';
import { Eyebrow } from '@/design/typography';
import { Button, RuleLine } from '@/design/primitives';

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

const INPUT_CLASS =
  'w-full px-4 py-3 text-base bg-paper border border-foreground/15 hover:border-foreground/30 focus:border-foreground focus:border-2 focus:outline-none transition-soft';

const SECONDARY_BTN =
  'inline-flex items-center justify-center px-6 py-3 text-[11px] uppercase tracking-[0.22em] font-semibold border border-foreground text-foreground transition-soft hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed';

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
        list.map((b) =>
          b.userId === myUserId ? { ...b, repoUrl: repoUrl || null } : b,
        ),
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
    <section className="my-12">
      <header className="mb-6">
        <Eyebrow tone="muted" size="sm">
          Build Registry
        </Eyebrow>
        <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-[-0.005em]">
          {list.length === 0
            ? 'No one is building this yet.'
            : `${list.length} ${list.length === 1 ? 'builder' : 'builders'} on it.`}
        </h2>
      </header>

      {list.length > 0 && (
        <ul className="border-t border-foreground/15 mb-8">
          {list.map((b) => (
            <li
              key={b.id}
              className="border-b border-foreground/15 py-5 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={`/builders/${b.userId}`}
                  className="link-underline font-medium"
                >
                  {b.name ?? 'Anonymous builder'}
                </Link>
                {b.userId === myUserId && (
                  <span className="text-[10px] uppercase tracking-[0.22em] text-accent">
                    You
                  </span>
                )}
              </div>
              {b.repoUrl && (
                <a
                  href={b.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-sm text-foreground/55 break-all"
                >
                  {b.repoUrl}
                </a>
              )}
              {b.repoUrl && <BuilderRepoActivity repoUrl={b.repoUrl} />}
            </li>
          ))}
        </ul>
      )}

      {!myEntry ? (
        <Button
          variant="accent"
          onClick={register}
          disabled={registering}
          className="disabled:opacity-50"
        >
          {registering ? 'Registering…' : "I'm building this"}
        </Button>
      ) : (
        <div className="border border-foreground/15 bg-paper p-6 md:p-8">
          <div className="flex flex-col gap-6">
            <div>
              <Eyebrow tone="accent" size="sm">
                You&apos;re registered
              </Eyebrow>
              <p className="mt-2 text-base text-foreground/90">
                Pin a public repo so others can follow your work.
              </p>
            </div>

            {(kitUrl || demoUrl) && (
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-foreground/55">
                {kitUrl && (
                  <a
                    href={kitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline hover:text-foreground transition-soft"
                  >
                    Open starter kit
                  </a>
                )}
                {demoUrl && (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline hover:text-foreground transition-soft"
                  >
                    Open live demo
                  </a>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="builder-repo-url"
                className="block text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/55 mb-2"
              >
                Your repo URL
                <span className="ml-2 normal-case tracking-normal text-foreground/45 font-normal">
                  (optional)
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="builder-repo-url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/your-user/your-repo"
                  className={`${INPUT_CLASS} flex-1`}
                />
                <button
                  onClick={saveRepo}
                  disabled={savingRepo}
                  className={SECONDARY_BTN}
                >
                  {savingRepo ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/55 mb-2">
                Badge for your README
              </label>
              <pre className="text-xs bg-background border border-foreground/15 p-3 overflow-x-auto whitespace-pre-wrap break-all font-mono">
                {badgeMarkdown}
              </pre>
              <button onClick={copyBadge} className={`${SECONDARY_BTN} mt-3`}>
                Copy
              </button>
            </div>

            <RuleLine />

            <button
              onClick={unregister}
              className="self-start text-[11px] uppercase tracking-[0.22em] font-semibold text-foreground/45 hover:text-accent transition-soft"
            >
              Remove me from registry
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
