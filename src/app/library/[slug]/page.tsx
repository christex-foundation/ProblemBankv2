import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { URGENCY_LABELS } from '@/lib/enums';
import { LibraryBuilders } from '@/components/library/LibraryBuilders';
import { SiteNav } from '@/components/SiteNav';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/design/motion';
import {
  Section,
  Container,
  Badge,
  GrainOverlay,
} from '@/design/primitives';
import { Eyebrow, Lede, Tagline } from '@/design/typography';
import {
  getLibraryEntry,
  problemStatementPreview,
  sectorBadgeTone,
  urgencyBadge,
  type LibraryEntry,
} from '@/lib/library';
import { SAMPLE_LIBRARY_ENTRIES } from '@/data/sampleLibraryEntries';

export async function generateStaticParams() {
  return SAMPLE_LIBRARY_ENTRIES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getLibraryEntry(slug);
  if (!entry) return { title: 'Not found · Problem Bank' };
  const description = problemStatementPreview(entry.problemStatement, 160);
  return {
    title: `${entry.title} · Problem Bank`,
    description,
    openGraph: {
      title: entry.title,
      description,
      type: 'article',
      url: `/library/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: entry.title,
      description,
    },
  };
}

export default async function LibraryEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getLibraryEntry(slug);
  if (!entry) notFound();

  const sectorTone = sectorBadgeTone(entry.sector);
  const urgency = urgencyBadge(entry.urgency);
  const lede = problemStatementPreview(entry.problemStatement, 240);

  return (
    <main className="relative bg-background text-foreground min-h-screen flex flex-col">
      <GrainOverlay />
      <SiteNav active="library" />

      <article className="flex-1">
        {/* ─── Hero ──────────────────────────────────────────────── */}
        <Section pad="sm" className="!pt-[2vh] md:!pt-[3vh]">
          <Container size="wide">
            <Reveal className="mb-8 md:mb-12 text-[11px] uppercase tracking-[0.22em] text-foreground/55">
              <Link
                href="/library"
                className="link-underline hover:text-foreground transition-soft"
              >
                ← Back to the Library
              </Link>
            </Reveal>

            <div className="grid grid-cols-12 gap-6 md:gap-10">
              <div className="col-span-12 md:col-span-2">
                <Reveal delay={60}>
                  <Eyebrow tone="accent" size="sm">
                    Library entry
                  </Eyebrow>
                  <Eyebrow tone="muted" size="sm" className="mt-2">
                    {entry.sector}
                  </Eyebrow>
                  <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-foreground/45 num">
                    Filed{' '}
                    {new Date(entry.publishedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </Reveal>
              </div>

              <div className="col-span-12 md:col-span-10">
                <Reveal delay={120}>
                  <h1 className="font-black tracking-[-0.03em] leading-[0.95] text-[clamp(2.5rem,7vw,5.5rem)]">
                    {entry.title}
                  </h1>
                </Reveal>

                {/* Visualization sits right below the title and above the
                   description — the next important thing to see. */}
                <Reveal delay={240} className="mt-10 md:mt-12">
                  {entry.infographicUrl ? (
                    <div className="border border-foreground/15 bg-paper">
                      <iframe
                        src={entry.infographicUrl}
                        sandbox="allow-scripts allow-same-origin"
                        className="w-full h-[480px] md:h-[560px] block"
                        title={`Visualization: ${entry.title}`}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="border border-dashed border-foreground/20 bg-paper/50 p-10 md:p-14">
                      <Eyebrow tone="faint" size="sm">
                        Embed slot
                      </Eyebrow>
                      <p className="mt-3 font-serif text-xl md:text-2xl text-foreground/55 max-w-[44ch] leading-[1.5]">
                        Each entry carries a chart or dataset.{' '}
                        <span className="italic">Slot reserved.</span>
                      </p>
                    </div>
                  )}
                </Reveal>

                {lede && (
                  <Reveal delay={330}>
                    <Lede tone="muted" className="mt-10 md:mt-12 max-w-[60ch]">
                      {lede}
                    </Lede>
                  </Reveal>
                )}

                <Reveal delay={420} className="mt-10 flex flex-wrap items-center gap-3">
                  <Badge variant="tag" tone={sectorTone}>
                    {entry.sector}
                  </Badge>
                  <Badge variant={urgency.variant} tone={urgency.tone}>
                    Urgency · {URGENCY_LABELS[entry.urgency]}
                  </Badge>
                  <Badge
                    variant="pill"
                    tone={entry.origin === 'community' ? 'accent' : 'muted'}
                  >
                    {entry.origin === 'community'
                      ? 'Community'
                      : 'Christex research'}
                  </Badge>
                </Reveal>

              </div>
            </div>
          </Container>
        </Section>

        {/* ─── 01 The problem ────────────────────────────────────── */}
        <NumberedSection
          number="01"
          eyebrow="The problem"
          headline="What we found in the field."
          sectionClassName="!pt-[3vh] md:!pt-[5vh] !pb-[10vh] md:!pb-[14vh]"
        >
          <div
            className="font-serif text-xl md:text-2xl leading-[1.6] text-foreground/90 [&_p]:my-5 [&_a]:underline [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: entry.problemStatement }}
          />
        </NumberedSection>

        {/* ─── Proof of Concept — tagline-style transition under the problem
            section. Italic-serif lead + accent display, the same pattern as
            the closing "Different doors. Same standard." beat. */}
        {(entry.kitUrl || entry.demoUrl) && (
          <Section pad="sm" className="!pt-0 md:!pt-0">
            <Container size="wide">
              <div className="grid grid-cols-12 gap-6 md:gap-10">
                <div className="hidden md:block md:col-span-2" />
                <div className="col-span-12 md:col-span-10 text-right">
                  <Reveal>
                    <Eyebrow tone="accent" size="sm" align="right">
                      Proof of concept
                    </Eyebrow>
                  </Reveal>
                  <Reveal delay={90}>
                    <p className="mt-5 font-serif italic text-foreground/55 text-2xl md:text-3xl leading-[1.3] tracking-[0.02em]">
                      Skip the blank page.
                    </p>
                  </Reveal>
                  <Reveal delay={180}>
                    <p className="mt-2 font-black text-accent text-3xl md:text-4xl tracking-[-0.02em] leading-[1.1] max-w-[20ch] ml-auto">
                      A starter kit and a live demo come with this entry.
                    </p>
                  </Reveal>
                  <Reveal delay={270}>
                    <p className="mt-6 text-base md:text-lg text-foreground/55 leading-[1.6] max-w-[55ch] ml-auto">
                      Clone, run, read the code, then make it yours.
                    </p>
                  </Reveal>
                  <Reveal delay={360} className="mt-8 flex flex-wrap gap-3 justify-end">
                    {entry.demoUrl && (
                      <a
                        href={entry.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-8 py-4 text-[11px] uppercase tracking-[0.28em] font-semibold border border-foreground text-foreground transition-soft hover:bg-foreground hover:text-background"
                      >
                        Live demo
                      </a>
                    )}
                    {entry.kitUrl && (
                      <a
                        href={entry.kitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-8 py-4 text-[11px] uppercase tracking-[0.28em] font-semibold bg-foreground text-background transition-soft hover:bg-accent hover:text-background"
                      >
                        Starter kit on GitHub
                      </a>
                    )}
                  </Reveal>
                </div>
              </div>
            </Container>
          </Section>
        )}

        {/* ─── The Registry — tagline-style, mirror of PoC but left-aligned. */}
        <Section pad="sm">
          <Container size="wide">
            <div className="grid grid-cols-12 gap-6 md:gap-10">
              <div className="col-span-12 md:col-span-10 text-left">
                <Reveal>
                  <Eyebrow tone="accent" size="sm">
                    The registry
                  </Eyebrow>
                </Reveal>
                <Reveal delay={90}>
                  <p className="mt-5 font-serif italic text-foreground/55 text-2xl md:text-3xl leading-[1.3] tracking-[0.02em]">
                    Pull a chair up.
                  </p>
                </Reveal>
                <Reveal delay={180}>
                  <p className="mt-2 font-black text-accent text-3xl md:text-4xl tracking-[-0.02em] leading-[1.1] max-w-[20ch]">
                    {entry.builders.length === 0
                      ? 'No one is building this yet. Be the first.'
                      : `${entry.builders.length} ${entry.builders.length === 1 ? 'builder' : 'builders'} on this entry.`}
                  </p>
                </Reveal>
                <Reveal delay={270}>
                  <p className="mt-6 text-base md:text-lg text-foreground/55 leading-[1.6] max-w-[55ch]">
                    Pin your repo to follow alongside.
                    <br />
                    The README badge is yours after registering.
                  </p>
                </Reveal>

                <Reveal delay={360} className="mt-10">
                  <LibraryBuilders
                    entrySlug={entry.slug}
                    builders={entry.builders}
                    hideHeader
                    hideList
                  />
                </Reveal>
              </div>
              <div className="hidden md:block md:col-span-2" />
            </div>
          </Container>
        </Section>

        {/* ─── Closer ───────────────────────────────────────────── */}
        <Section pad="md" tone="foreground">
          <Container size="wide">
            <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
              <div className="col-span-12 md:col-span-7">
                <Reveal>
                  <Eyebrow tone="accent" size="sm">
                    Get in touch
                  </Eyebrow>
                  <h2 className="mt-4 font-semibold tracking-[-0.015em] text-3xl md:text-5xl leading-[1.05] max-w-[20ch] text-background">
                    Investors, partners, builders.
                  </h2>
                </Reveal>
                <Reveal delay={120}>
                  <p className="mt-8 max-w-[55ch] text-base md:text-lg text-background/70 leading-[1.6]">
                    Write to{' '}
                    <a
                      href="mailto:eng@christex.foundation"
                      className="link-underline text-accent"
                    >
                      eng@christex.foundation
                    </a>
                    , or reach a builder directly from their profile.
                  </p>
                </Reveal>
              </div>
              <Reveal delay={240} className="col-span-12 md:col-span-5">
                <RelatedNav slug={entry.slug} tone="onDark" />
              </Reveal>
            </div>
            <Reveal delay={360}>
              <Tagline tone="onDark" align="right" className="mt-20 md:mt-28">
                Different doors. Same{' '}
                <span className="text-accent font-bold not-italic">standard.</span>
              </Tagline>
            </Reveal>
          </Container>
        </Section>
      </article>

      <Footer />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Pieces
// ─────────────────────────────────────────────────────────────────────

interface NumberedSectionProps {
  number: string;
  eyebrow: string;
  headline: React.ReactNode;
  subhead?: string;
  tone?: 'background' | 'foreground' | 'paper';
  numberTone?: 'default' | 'accent';
  /** Pass-through className for the wrapping Section (lets callers tighten
   *  spacing when two same-tone sections sit back-to-back). */
  sectionClassName?: string;
  children: React.ReactNode;
}

function NumberedSection({
  number,
  eyebrow,
  headline,
  subhead,
  tone = 'background',
  numberTone = 'default',
  sectionClassName,
  children,
}: NumberedSectionProps) {
  const onDark = tone === 'foreground';
  const headlineCls = onDark
    ? 'text-background'
    : 'text-foreground';
  const subheadCls = onDark
    ? 'text-background/55'
    : 'text-foreground/55';
  const ruleCls = onDark ? 'bg-background/30' : 'bg-foreground/30';
  const numberCls =
    numberTone === 'accent'
      ? 'text-accent'
      : onDark
        ? 'text-background/15'
        : 'text-foreground/15';

  return (
    <Section pad="md" tone={tone} className={sectionClassName}>
      <Container size="wide">
        <div className="grid grid-cols-12 gap-6 md:gap-10 mb-14 md:mb-20">
          <div className="col-span-12 md:col-span-2">
            <p
              className={`num font-black tracking-[-0.04em] leading-none text-[clamp(3.5rem,6vw,6rem)] ${numberCls}`}
            >
              {number}
            </p>
          </div>
          <div className="col-span-12 md:col-span-10">
            <Eyebrow
              tone={onDark ? 'accent' : 'accent'}
              size="sm"
              className="mb-5"
            >
              {eyebrow}
            </Eyebrow>
            <h2
              className={`font-semibold tracking-[-0.015em] text-3xl md:text-5xl leading-[1.05] max-w-[22ch] ${headlineCls}`}
            >
              {headline}
            </h2>
            {subhead && (
              <p
                className={`mt-6 text-base md:text-lg max-w-[55ch] leading-[1.6] ${subheadCls}`}
              >
                {subhead}
              </p>
            )}
            <div className={`h-px w-full mt-10 ${ruleCls}`} aria-hidden />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="hidden md:block md:col-span-2" />
          <div className="col-span-12 md:col-span-10">{children}</div>
        </div>
      </Container>
    </Section>
  );
}

function RelatedNav({
  slug,
  tone = 'onLight',
}: {
  slug: string;
  tone?: 'onLight' | 'onDark';
}) {
  const others = SAMPLE_LIBRARY_ENTRIES.filter((e) => e.slug !== slug).slice(
    0,
    3,
  );
  const onDark = tone === 'onDark';
  const ruleCls = onDark ? 'border-background/15' : 'border-foreground/15';
  const titleCls = onDark
    ? 'font-medium leading-[1.3] text-background group-hover:text-accent transition-soft'
    : 'font-medium leading-[1.3]';
  const arrowCls = onDark
    ? 'text-background/30 group-hover:text-accent transition-soft'
    : 'text-foreground/30 group-hover:text-accent transition-soft';
  return (
    <div>
      <Eyebrow
        tone={onDark ? 'faint' : 'muted'}
        size="sm"
        className={`mb-4 ${onDark ? '!text-background/55' : ''}`}
      >
        Next on the shelf
      </Eyebrow>
      <ul className={`border-t ${ruleCls}`}>
        {others.map((e) => (
          <li key={e.id} className={`border-b ${ruleCls}`}>
            <Link
              href={`/library/${e.slug}`}
              className="flex items-baseline justify-between gap-4 py-4 group transition-soft"
            >
              <span className={titleCls}>{e.title}</span>
              <span
                aria-hidden
                className={`text-[11px] uppercase tracking-[0.28em] font-semibold ${arrowCls}`}
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Type-only re-export so unused-import warnings don't trigger.
export type { LibraryEntry };
