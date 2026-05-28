import Link from 'next/link';
import { Eyebrow } from '@/design/typography';
import { ButtonLink } from '@/design/primitives';
import type { SampleBuilder } from '@/data/sampleLibraryEntries';

interface Props {
  entrySlug: string;
  builders: SampleBuilder[];
  /** Suppress the internal section header (eyebrow + count headline) when
   *  the calling section provides its own intro/tagline above. */
  hideHeader?: boolean;
  /** Hide the public list of builders (names + repo URLs + join dates).
   *  Use on public-facing surfaces where the registry detail is gated to
   *  signed-in users. The count + CTA still render. */
  hideList?: boolean;
}

/**
 * Sample-data stub for the production BuildRegistry. Renders the current
 * builders + a "I'm building this" CTA that points to /signin. No client
 * interactivity — the real component (with next-auth + API calls) lives in
 * src/components/library/BuildRegistry.tsx and is wired up in production.
 */
export function LibraryBuilders({
  entrySlug,
  builders,
  hideHeader = false,
  hideList = false,
}: Props) {
  return (
    <section className={hideHeader ? '' : 'my-12'}>
      {!hideHeader && (
        <header className="mb-6">
          <Eyebrow tone="muted" size="sm">
            Build Registry
          </Eyebrow>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-[-0.005em]">
            {builders.length === 0
              ? 'No one is building this yet.'
              : `${builders.length} ${builders.length === 1 ? 'builder' : 'builders'} on it.`}
          </h2>
        </header>
      )}

      {!hideList && builders.length > 0 && (
        <ul className="border-t border-foreground/15 mb-8">
          {builders.map((b) => (
            <li
              key={b.id}
              className="border-b border-foreground/15 py-5 flex flex-col gap-2"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Link
                  href={`/builders/${b.userId}`}
                  className="link-underline font-medium"
                >
                  {b.name}
                </Link>
                <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/45 num">
                  Joined{' '}
                  {new Date(b.registeredAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
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
              {!b.repoUrl && b.githubUrl && (
                <a
                  href={b.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-sm text-foreground/45"
                >
                  {b.githubUrl}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col items-start gap-4">
        <ButtonLink
          variant="accent"
          href={`/signin?callbackUrl=${encodeURIComponent(`/library/${entrySlug}`)}`}
        >
          I&apos;m building this
        </ButtonLink>
        <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/45 whitespace-nowrap">
          Sign in to register, pin your repo, and grab the README badge.
        </p>
      </div>

    </section>
  );
}
