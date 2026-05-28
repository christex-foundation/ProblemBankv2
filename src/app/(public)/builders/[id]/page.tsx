import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import BuilderProfileEditor from '@/components/builders/BuilderProfileEditor';
import BuilderRepoActivity from '@/components/library/BuilderRepoActivity';
import type { BuildRegistryRow, UserRow } from '@/types/database';

export const dynamic = 'force-dynamic';

type BuilderEntry = BuildRegistryRow & {
  libraryEntry: { title: string; slug: string } | null;
};

type ProfileShape = UserRow & {
  buildEntries: BuilderEntry[];
};

export default async function BuilderProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const { data: user } = (await getSupabase()
    .from('User')
    .select(
      '*, buildEntries:BuildRegistry(*, libraryEntry:LibraryEntry(title, slug))',
    )
    .eq('id', id)
    .maybeSingle()) as { data: ProfileShape | null };

  if (!user) notFound();
  // TODO(auth): restore session-based ownership check
  //   const isOwner = session?.user?.id === id;
  // Auth is deferred for this pass — every visitor sees the editor on every
  // profile so endpoints can be exercised end-to-end. Acknowledge the unused
  // session read here:
  void session;
  const isOwner = true;

  const hasContact = !!(user.contactEmail || user.githubUrl || user.websiteUrl);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{user.name ?? 'Anonymous builder'}</h1>
      {user.bio && <p className="text-gray-700 mt-2">{user.bio}</p>}

      {hasContact && (
        <section className="mt-4">
          <h2 className="font-semibold">Contact</h2>
          <ul className="text-sm space-y-1 mt-1">
            {user.contactEmail && (
              <li>
                <a href={`mailto:${user.contactEmail}`} className="underline">
                  {user.contactEmail}
                </a>
              </li>
            )}
            {user.githubUrl && (
              <li>
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {user.githubUrl}
                </a>
              </li>
            )}
            {user.websiteUrl && (
              <li>
                <a
                  href={user.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {user.websiteUrl}
                </a>
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-semibold mb-2">Currently Building</h2>
        {(user.buildEntries ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">Not registered on any Library entry yet.</p>
        ) : (
          <ul className="space-y-2">
            {user.buildEntries.map((b) => (
              <li key={b.id} className="border rounded p-3">
                {b.libraryEntry && (
                  <Link href={`/library/${b.libraryEntry.slug}`} className="font-medium underline">
                    {b.libraryEntry.title}
                  </Link>
                )}
                {b.repoUrl && (
                  <>
                    <p className="text-xs text-gray-600 mt-1 break-all">
                      <a
                        href={b.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {b.repoUrl}
                      </a>
                    </p>
                    <BuilderRepoActivity repoUrl={b.repoUrl} />
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {isOwner && (
        <BuilderProfileEditor
          userId={user.id}
          user={{
            name: user.name,
            bio: user.bio,
            contactEmail: user.contactEmail,
            githubUrl: user.githubUrl,
            websiteUrl: user.websiteUrl,
          }}
        />
      )}
    </main>
  );
}
