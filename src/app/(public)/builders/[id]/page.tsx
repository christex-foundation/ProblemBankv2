import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import BuilderProfileEditor from '@/components/builders/BuilderProfileEditor';
import BuilderRepoActivity from '@/components/library/BuilderRepoActivity';
import {
  Section,
  Container,
  RuleLine,
  GrainOverlay,
  Card,
} from '@/design/primitives';
import { Eyebrow, Heading, Body } from '@/design/typography';
import { LibraryNav } from '@/components/LibraryNav';
import { Footer } from '@/components/Footer';
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

  // Only the signed-in owner of this profile may edit it.
  const isOwner = session?.user?.id === id;

  const buildEntries = user.buildEntries ?? [];
  const hasContact = !!(
    user.contactEmail ||
    user.githubUrl ||
    user.websiteUrl
  );

  return (
    <main className="relative bg-background text-foreground min-h-screen flex flex-col">
      <GrainOverlay />
      <LibraryNav active={null} />

      <div className="flex-1 flex flex-col">
        <Section pad="sm">
          <Container size="narrow">
            {/* ─── Hero ─────────────────────────────────────────────── */}
            <Eyebrow tone="accent" size="sm">
              Problem Bank
            </Eyebrow>
            <Eyebrow tone="muted" size="sm" className="mt-2">
              Builder profile
            </Eyebrow>
            <Heading level={1} size="h2" className="mt-6 max-w-[20ch]">
              {user.name ?? 'Anonymous builder'}
            </Heading>
            {user.bio && (
              <Body tone="muted" size="lg" className="mt-6 max-w-[60ch]">
                {user.bio}
              </Body>
            )}

            {/* ─── Contact ──────────────────────────────────────────── */}
            {hasContact && (
              <>
                <RuleLine className="mt-10 md:mt-12" />
                <Eyebrow tone="muted" size="sm" className="mt-8">
                  Contact
                </Eyebrow>
                <ul className="mt-4 flex flex-col gap-2 text-base">
                  {user.contactEmail && (
                    <li>
                      <a
                        href={`mailto:${user.contactEmail}`}
                        className="link-underline text-foreground/75"
                      >
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
                        className="link-underline text-foreground/75 break-all"
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
                        className="link-underline text-foreground/75 break-all"
                      >
                        {user.websiteUrl}
                      </a>
                    </li>
                  )}
                </ul>
              </>
            )}

            {/* ─── Currently building ───────────────────────────────── */}
            <RuleLine tone="strong" className="mt-10 md:mt-12" />
            <Eyebrow tone="muted" size="sm" className="mt-8">
              Currently building
            </Eyebrow>
            {buildEntries.length === 0 ? (
              <Body tone="faint" className="mt-4">
                Not registered on any Library entry yet.
              </Body>
            ) : (
              <ul className="mt-5 flex flex-col gap-4">
                {buildEntries.map((b) => (
                  <li key={b.id}>
                    <Card interactive={false}>
                      {b.libraryEntry && (
                        <Link
                          href={`/library/${b.libraryEntry.slug}`}
                          className="font-semibold text-lg tracking-[-0.01em] hover:text-accent transition-soft"
                        >
                          {b.libraryEntry.title}
                        </Link>
                      )}
                      {b.repoUrl && (
                        <>
                          <p className="mt-2 text-sm break-all">
                            <a
                              href={b.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-underline text-foreground/55"
                            >
                              {b.repoUrl}
                            </a>
                          </p>
                          <BuilderRepoActivity repoUrl={b.repoUrl} />
                        </>
                      )}
                    </Card>
                  </li>
                ))}
              </ul>
            )}

            {/* ─── Editor (owner only) ──────────────────────────────── */}
            {isOwner && (
              <>
                <RuleLine tone="strong" className="mt-10 md:mt-12" />
                <div className="mt-8">
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
                </div>
              </>
            )}
          </Container>
        </Section>
      </div>

      <Footer />
    </main>
  );
}
