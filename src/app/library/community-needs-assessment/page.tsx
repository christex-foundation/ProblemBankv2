import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/SiteNav';
import { Footer } from '@/components/Footer';
import { Section, Container, GrainOverlay } from '@/design/primitives';
import { Eyebrow, Lede } from '@/design/typography';
import { Reveal, ScrollWordReveal, ScrollWipeReveal, type ScrollWordSegment } from '@/design/motion';
import { CountUp, PopIn } from '@/components/reports/Charts';
import { CommunityProblemMatrix } from '@/components/reports/CommunityProblemMatrix';
import { WaterChainThread } from '@/components/reports/WaterChainThread';
import { SurveyDiagram } from '@/components/reports/SurveyDiagram';
import { ProblemRoseScene } from '@/components/reports/ProblemRoseScene';
import { report } from '@/data/reports/community-needs-assessment';

// Method copy as word-reveal segments — keywords get the coral marker-highlight
// that wipes in word-by-word on scroll (same treatment as the home page).
const METHOD_PARA_1: ScrollWordSegment[] = [
  'Communities were chosen for their range of size, location and conditions. Within each, field teams worked through different sections (residential areas, markets and transport points), approaching people ',
  { text: 'systematically', strong: true },
  ' rather than only those easiest to reach, and aiming for a spread across gender, age and occupation. Of ',
  { text: '615 forms', strong: true },
  ' collected, 6 were set aside as ambiguous, leaving ',
  { text: '609', strong: true },
  '.',
];

const METHOD_PARA_2: ScrollWordSegment[] = [
  'Field teams surveyed residents in ',
  { text: 'April 2026', strong: true },
  ' using one questionnaire in ',
  { text: 'English and Krio', strong: true },
  ', covering demographics, problems, current coping, the support people want, their top priority, and what would stop them using a new service. ',
  { text: 'Six enumerators', strong: true },
  ' collected the bulk of responses. Most questions allowed multiple answers, so percentages sum to ',
  { text: 'more than 100', strong: true },
  '.',
];

const METHOD_PARA_3: ScrollWordSegment[] = [
  'Across all groups the sample skews ',
  { text: 'young and active', strong: true },
  '. On most problems men and women answered alike, with two exceptions: men reported ',
  { text: 'drug abuse (63% vs 49%)', strong: true },
  ' and ',
  { text: 'unemployment (51% vs 39%)', strong: true },
  ' more often. The four-community analysis covers ',
  { text: '476 respondents', strong: true },
  '; Fourah Bay College students (97) and on-campus residents (36) are reported separately.',
];

// Free-text analysis paragraphs as word-reveal segments — same coral
// marker-highlight treatment as the method copy, keywords get the wipe.
const FREETEXT_NOTE_1: ScrollWordSegment[] = [
  'People were not setting water aside in favour of skills; the support question gave them no way to ask for it. Among the 118 who wrote in, ',
  { text: '43% named water', strong: true },
  ' or WASH infrastructure and ',
  { text: '30% electricity', strong: true },
  '.',
];

const FREETEXT_NOTE_2: ScrollWordSegment[] = [
  'A handful asked for the specific ',
  { text: 'tools of a trade', strong: true },
  ' rather than training, where the barrier to earning is ',
  { text: 'equipment, not skill', strong: true },
  '.',
];

// Section 01 lede as word-reveal segments — keywords get the coral
// marker-highlight that wipes in word-by-word on scroll.
const COLOPHON_BASE: ScrollWordSegment[] = [
  'Prepared from field data collected by Christex Foundation, April 2026. Survey ',
  { text: 'n = 609', strong: true },
  '; community analysis ',
  { text: 'n = 476', strong: true },
  ' across Fourah Bay, Grafton, Kroobay and Aberdeen; FBC students ',
  { text: 'n = 97', strong: true },
  '; FBC campus residents ',
  { text: 'n = 36', strong: true },
  '. Leader discussions: ',
  { text: 'four group conversations', strong: true },
  ' across Aberdeen, FBC, Grafton/Polio and Kroobay.',
];

const PROBLEMS_LEDE: ScrollWordSegment[] = [
  'Asked for the biggest problems,',
  { br: true },
  'people answered with the ',
  { br: true },
  { text: 'conditions of daily survival', strong: true },
  '.',
];

// Counterpart lede for support requested — the original report's second
// sentence, the flip side of the problems lede.
const SUPPORT_LEDE: ScrollWordSegment[] = [
  'Asked what would help,',
  { br: true },
  'they named ',
  { text: 'skills and work', strong: true },
  '.',
];

// Fire reveals when content reaches the middle of the viewport, not the
// bottom edge: shrink the observer's bottom margin by ~42% and drop the
// threshold so any crossing of that centered line counts.
const CENTER_TRIGGER = { rootMargin: '0px 0px -42% 0px', threshold: 0 } as const;

export const metadata: Metadata = {
  title: `${report.title} · Problem Bank`,
  description: report.lede,
};

// Per-community read of Figure 3, shown as a 2×2 under the matrix. Marker
// colours match the bar-chart series (Kroobay highlighted in accent).
const COMMUNITY_NOTES: Array<{ name: string; headline: string; color: string; body: string }> = [
  {
    name: 'Kroobay',
    headline: 'Kroobay carries the heaviest load.',
    color: 'bg-accent',
    body: 'Highest insecurity, poor health, GBV and mental health strain; near the top on drug abuse (65%). Asks for the most help: skills training at 73%. The problems are stacked, not isolated.',
  },
  {
    name: 'Fourah Bay',
    headline: 'Fourah Bay is out of work.',
    color: 'bg-foreground/80',
    body: 'Highest demand for jobs of any community (77%, just above skills training at 75%): people, but little work to absorb them. Also the highest drug abuse of the four (68%).',
  },
  {
    name: 'Grafton',
    headline: "Grafton's pain is specific.",
    color: 'bg-foreground/45',
    body: 'Highest water figure, but lower rates of drug abuse, GBV and mental health strain. Its distress sits in infrastructure rather than social breakdown.',
  },
  {
    name: 'Aberdeen',
    headline: 'Aberdeen sits lower on poor health.',
    color: 'bg-foreground/25',
    body: 'But not across the board: it has the highest poverty mention of the four (26%) and mid-range unemployment. Water still affects most of it.',
  },
];

/** Small caption under a figure. */
function Caption({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`mt-6 text-[11px] leading-relaxed text-foreground/45 max-w-[60ch] ${className}`}
    >
      {children}
    </p>
  );
}

/**
 * Inline keyword highlight — bold foreground text over the same low coral
 * marker stripe used by the scroll-word strong treatment, so static copy
 * matches the method paragraphs.
 */
function Mark({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="box-decoration-clone font-semibold text-foreground"
      style={{
        backgroundImage:
          'linear-gradient(color-mix(in srgb, var(--accent) 22%, transparent), color-mix(in srgb, var(--accent) 22%, transparent))',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 0.78em',
        backgroundSize: '100% 0.62em',
        padding: '0 0.06em',
      }}
    >
      {children}
    </span>
  );
}

/** Renders a body of plain strings + {mark} segments, marking key phrases. */
function MarkedText({ segments }: { segments: Array<string | { mark: string }> }) {
  return (
    <>
      {segments.map((seg, i) =>
        typeof seg === 'string' ? (
          <span key={i}>{seg}</span>
        ) : (
          <Mark key={i}>{seg.mark}</Mark>
        ),
      )}
    </>
  );
}

/**
 * Layered coral ocean — several filled wave bands drifting horizontally at
 * different speeds and directions, stacked back-to-front for depth, with a
 * crest line skimming the top. Two tiles per layer on a 200%-wide track loop
 * seamlessly (each shifts -50%); opposing drift directions read as swell.
 * Pure CSS animation, no JS. Each path uses T (smooth-quadratic) commands so
 * crests mirror automatically and the start/end y match for an invisible seam.
 */
function WaveLine({ className = '' }: { className?: string }) {
  // A filled wave band: midline `mid`, crest height `amp`, closed to the floor.
  const fill = (mid: number, amp: number) =>
    `M0 ${mid} Q120 ${mid - amp} 240 ${mid} T480 ${mid} T720 ${mid} T960 ${mid} T1200 ${mid} T1440 ${mid} L1440 120 L0 120 Z`;
  // The exposed crest as a stroked line (no fill).
  const line = (mid: number, amp: number) =>
    `M0 ${mid} Q120 ${mid - amp} 240 ${mid} T480 ${mid} T720 ${mid} T960 ${mid} T1200 ${mid} T1440 ${mid}`;

  const band = (d: string, opacity: number, stroke = 0) =>
    [0, 1].map((i) => (
      <svg
        key={i}
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="w-1/2 h-full text-accent"
      >
        <path
          d={d}
          fill={stroke ? 'none' : 'currentColor'}
          stroke={stroke ? 'currentColor' : 'none'}
          strokeWidth={stroke}
          strokeLinecap="round"
          opacity={opacity}
        />
      </svg>
    ));

  // back → front: deeper bands drift slower, crest line rides on top.
  const layers: Array<{ d: string; opacity: number; stroke?: number; drift: string }> = [
    { d: fill(34, 16), opacity: 0.14, drift: 'wave-drift-rev-slow' },
    { d: fill(50, 20), opacity: 0.22, drift: 'wave-drift-slow' },
    { d: fill(66, 14), opacity: 0.34, drift: 'wave-drift-rev' },
    { d: fill(80, 18), opacity: 0.5, drift: 'wave-drift' },
    { d: line(80, 18), opacity: 0.7, stroke: 3, drift: 'wave-drift' },
  ];

  // Fade both edges so the ocean dissolves into the page rather than
  // hard-cutting at the column edges.
  const edgeFade =
    'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)';

  return (
    <div
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{ maskImage: edgeFade, WebkitMaskImage: edgeFade }}
    >
      {layers.map((l, i) => (
        <div key={i} className={`absolute inset-0 flex w-[200%] ${l.drift}`}>
          {band(l.d, l.opacity, l.stroke)}
        </div>
      ))}
      {/* Soften the floor — the lower half dissolves into the page so the
          filled bands don't cut off on a hard straight edge. */}
      <div
        className="absolute inset-x-0 bottom-0 h-3/5"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--background))' }}
      />
    </div>
  );
}

export default function CommunityNeedsAssessmentPage() {
  return (
    <main className="relative bg-background text-foreground min-h-screen flex flex-col">
      <GrainOverlay />
      <SiteNav active="library" />

      <article className="flex-1">
        {/* ─── Hero ──────────────────────────────────────────────── */}
        <Section pad="sm" className="!pt-[2vh] md:!pt-[4vh] !pb-[5vh] md:!pb-[7vh]">
          <Container size="wide">
            <Reveal className="mb-8 text-[11px] uppercase tracking-[0.22em] text-foreground/55">
              <Link href="/library" className="link-underline hover:text-foreground transition-soft">
                ← Back to the Library
              </Link>
            </Reveal>

            <div className="text-center flex flex-col items-center">
              <Reveal delay={60}>
                <Eyebrow tone="accent" size="sm" align="center">
                  {report.eyebrow}
                </Eyebrow>
              </Reveal>
              {/* Lockup: the container shrinks to the title's width, and the
                  lede (w-0 min-w-full) fills that exact width, so it always
                  matches the headline regardless of viewport. */}
              <div className="w-fit flex flex-col items-center">
                <Reveal delay={120}>
                  <h1 className="mt-6 font-black tracking-[-0.035em] leading-[0.92] text-[clamp(3rem,9vw,7rem)]">
                    <span className="relative inline-block px-[0.1em]">
                      <span
                        aria-hidden
                        className="absolute inset-x-0 inset-y-[0.06em] bg-accent/45 -rotate-[3deg]"
                      />
                      <span className="relative">Community</span>
                    </span>
                    <br />
                    Survey 2026
                  </h1>
                </Reveal>
                <Reveal delay={210} className="w-0 min-w-full">
                  <Lede tone="muted" align="center" className="mt-8">
                    {report.lede}
                  </Lede>
                </Reveal>
              </div>

              {/* Cover stats — directly under the copy; cards pop in on scroll */}
              <div className="mt-12 w-full grid grid-cols-2 md:grid-cols-4 gap-px bg-background/20 border border-accent max-w-[920px] mx-auto">
                {report.headline.map((h, i) => (
                  <PopIn key={h.key} delay={i * 90} className="bg-accent p-5 text-center">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-background/65">
                      {h.key}
                    </div>
                    <div className="mt-3 text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-background">
                      {h.stat}
                    </div>
                    <div className="mt-2 text-[11px] text-background/75 leading-snug">
                      {h.note}
                    </div>
                  </PopIn>
                ))}
              </div>

              <Reveal delay={360}>
                <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-foreground/40">
                  <CountUp value={report.base} /> responses · {report.date} · {report.status}
                </p>
              </Reveal>
            </div>
          </Container>
        </Section>

        {/* ─── About this survey ──────────────────────────────────── */}
        <Section pad="md" className="!pt-[6vh] md:!pt-[9vh]">
          <Container size="wide">
            <Reveal>
              <Eyebrow tone="accent" size="sm">
                Method &amp; sample
              </Eyebrow>
            </Reveal>

            {/* Hub diagram — "About this survey" with the metadata radiating out */}
            <div className="mt-12 md:mt-16">
              <SurveyDiagram
                description={report.method.paragraphs[0]}
                communities={report.communityProblems.series.map((s) => ({
                  name: s.name,
                  n: s.n,
                  highlight: 'highlight' in s ? Boolean(s.highlight) : false,
                }))}
                college={{ name: 'FBC', n: report.sample.students }}
                asked={report.method.asked}
              />
            </div>

            {/* Body — the copy stacked, para 1 left then para 2 right. Extra top
                space gives the diagram room to fade out before the copy comes in. */}
            <div className="mt-32 md:mt-56 space-y-16 md:space-y-24">
              <ScrollWordReveal
                segments={METHOD_PARA_1}
                className="max-w-[37.5rem] font-serif text-2xl md:text-3xl text-foreground/75 leading-[1.5]"
              />
              <ScrollWordReveal
                segments={METHOD_PARA_2}
                className="ml-auto max-w-[42rem] text-right font-serif text-2xl md:text-3xl text-foreground/75 leading-[1.5]"
              />
              <ScrollWordReveal
                segments={METHOD_PARA_3}
                className="max-w-[37.5rem] font-serif text-2xl md:text-3xl text-foreground/75 leading-[1.5]"
              />
            </div>

            {/* The sample — coral stat cards, mirroring the hero cover stats */}
            <div className="mt-16 md:mt-20">
              <Reveal>
                <Eyebrow tone="muted" size="sm">
                  The sample
                </Eyebrow>
              </Reveal>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-px border border-accent bg-background/20">
                {[
                  { key: 'Total valid', stat: '609', note: 'responses' },
                  { key: 'Under 36', stat: '≈ ⅔', note: 'students & traders lead' },
                  { key: 'F / M split', stat: '53 / 47', note: 'female / male' },
                  { key: 'Gendered gaps', stat: '2', note: 'drugs (63/49), jobs (51/39)' },
                ].map((s, i) => (
                  <PopIn key={s.key} delay={i * 90} className="bg-accent p-5 text-center">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-background/65">
                      {s.key}
                    </div>
                    <div className="mt-3 text-2xl md:text-3xl font-semibold tracking-[-0.01em] text-background">
                      {s.stat}
                    </div>
                    <div className="mt-2 text-[11px] leading-snug text-background/75">{s.note}</div>
                  </PopIn>
                ))}
              </div>

              {/* One note on method — full width, centred, under the stats */}
              <PopIn
                delay={120}
                className="mt-8 border border-foreground/15 bg-foreground/[0.03] p-5 md:p-6 text-center"
              >
                <div className="text-[10px] uppercase tracking-[0.22em] font-semibold text-accent">
                  One note on method
                </div>
                <p className="mt-3 text-sm text-foreground/70 leading-relaxed xl:whitespace-nowrap xl:text-[13px]">
                  {report.method.note}
                </p>
              </PopIn>
            </div>
          </Container>
        </Section>

        {/* ─── 01 Problems vs support ────────────────────────────── */}
        {/* pulled up to tighten the gap after the About-this-survey section */}
        <Section pad="md" className="-mt-[14vh] md:-mt-[26vh]">
          <Container size="wide">
            {/* Hero-scale headline with the wave rippling through the words —
                bespoke to this section, so the shared Beat is left untouched. */}
            <Reveal delay={60} className="flex flex-col items-center text-center">
              <h2 className="water-text font-black tracking-[-0.035em] leading-[1.04] pb-[0.12em] text-[clamp(3rem,9vw,7rem)] max-w-[15ch]">
                Water runs through everything.
              </h2>
              <p className="mt-8 font-serif text-xl md:text-2xl text-foreground/70 leading-[1.5]">
                Around <Mark>seven in ten</Mark> respondents named <Mark>water or sanitation</Mark> in every group,
                <br className="hidden md:inline" /> communities and students alike. In the four communities, a quarter chose it
                <br className="hidden md:inline" /> as the single thing to fix first, ahead of everything else.
              </p>
              <div className="mt-10 flex items-end gap-3">
                <CountUp
                  value={68}
                  suffix="%"
                  className="font-black tabular-nums tracking-[-0.03em] text-accent text-5xl md:text-7xl leading-[0.72]"
                />
                <span className="text-sm md:text-base uppercase tracking-[0.22em] text-foreground/55 text-left leading-none">
                  Water or
                  <br />
                  Sanitation
                </span>
              </div>
              <WaveLine className="pointer-events-none mt-8 h-28 md:h-40 w-full" />
            </Reveal>
            {/* Lede on the left, the problem rose blooming to its right.
                Water is excluded from the rose — it's the section's hero stat
                already (the 68% above). */}
            {/* Pinned scene: the lede + rose hold on screen while scroll
                reveals the petals one at a time, then release. */}
            <ProblemRoseScene
              topClassName="mt-[5vh] md:mt-[6vh] lg:mt-[7vh] xl:-mt-[8vh]"
              stickyTopClassName="top-30 md:top-[10rem] lg:top-30"
              roseGapClassName="mt-6 lg:-mt-44"
              items={report.problemsNamed.filter((p) => !/water/i.test(p.label))}
              lede={
                <ScrollWordReveal
                  segments={PROBLEMS_LEDE}
                  className="font-serif text-2xl md:text-3xl text-foreground/75 leading-[1.5]"
                />
              }
            />

            {/* Support requested — same pinned scene, mirrored: rose left,
                copy right, continuing the alternating rhythm. */}
            <ProblemRoseScene
              mirror
              flip
              topClassName="-mt-[35vh] md:-mt-[8vh] lg:-mt-[52vh] xl:-mt-[8vh]"
              stickyTopClassName="top-30 md:top-[10rem] lg:top-30"
              roseGapClassName="mt-6 lg:-mt-44"
              captionGapClassName="-mt-20 md:-mt-20 lg:-mt-48"
              items={report.supportRequested}
              lede={
                <ScrollWordReveal
                  segments={SUPPORT_LEDE}
                  className="font-serif text-2xl md:text-3xl text-foreground/75 leading-[1.5]"
                />
              }
              caption={
                <Caption className="mx-auto max-w-none md:whitespace-nowrap">
                  Figure 1 — problems named and support requested as polar-area blooms, four
                  communities (n=476).
                </Caption>
              }
            />
          </Container>
        </Section>

        {/* ─── The water chain ───────────────────────────────────── */}
        {/* pulled up to tighten the gap after the previous section */}
        <Section pad="md" className="-mt-[52vh] md:-mt-[48vh] lg:-mt-[64vh] xl:-mt-[20vh]">
          <Container size="wide">
            <Reveal>
              <h2 className="font-black leading-[0.95] tracking-[-0.03em] text-3xl md:text-[3.25rem]">
                The <span className="text-accent">finding</span>
                <br />
                <span className="text-accent">deepens</span> in the
                <br />
                written answers.
              </h2>
              <p className="mt-6 font-serif text-base md:text-lg leading-[1.55] text-foreground/55 max-w-[44ch]">
                No question asked how problems affect daily life, yet close to two hundred responses
                volunteered the same chain unprompted: water is far, the trip eats the day, and the
                cost falls on children and women.
              </p>
            </Reveal>

            <div className="mt-16 md:mt-20">
              <WaterChainThread
                causes={report.waterChain.steps}
                effects={report.waterChain.outcomes}
              />
            </div>

            <div className="mt-16 md:mt-24 grid md:grid-cols-3 gap-6">
              {report.waterChain.quotes.map((q) => (
                <Reveal key={q.text} className="border-l-2 border-accent/40 pl-4">
                  <p className="font-serif italic text-foreground/80 leading-[1.5]">“{q.text}”</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                    {q.who}
                  </p>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <p className="mt-12 ml-auto border-t border-foreground/15 pt-5 text-right text-[11px] leading-relaxed text-foreground/45 max-w-[60ch]">
                <span className="text-accent">†</span> Because people raised this unprompted and
                independently across different places, it carries more weight than any tick-box.
              </p>
            </Reveal>
          </Container>
        </Section>

        {/* ─── 02 By community ───────────────────────────────────── */}
        <Section pad="md">
          <Container size="wide">
            <Reveal>
              <h2 className="font-black leading-[0.95] tracking-[-0.03em] text-3xl md:text-[3.25rem]">
                The <span className="text-accent">burden</span> is not
                <br />
                spread <span className="text-accent">evenly</span>.
              </h2>
              <p className="mt-6 font-serif text-lg md:text-xl text-foreground/70 leading-[1.55] max-w-[60ch]">
                Water aside, the four communities look different
                <br />
                from one another, and the differences matter
                <br />
                for anyone deciding where to act.
              </p>
            </Reveal>

            <div className="mt-12">
              <CommunityProblemMatrix
                categories={report.communityProblems.categories}
                series={report.communityProblems.series}
              />
            </div>
            <Caption className="max-w-none! text-center">
              Figure 3 — problem prevalence within each community. Each bubble is a problem, sized by
              the respondents who named it; click one to break it down by community. The coral arc
              tracks prevalence share.
            </Caption>

            {/* Per-community read of the matrix above. */}
            <div className="mt-14 grid sm:grid-cols-2 border-t border-l border-foreground/12">
              {COMMUNITY_NOTES.map((c, i) => (
                <Reveal
                  key={c.name}
                  delay={(i % 2) * 90}
                  className="border-b border-r border-foreground/12 p-6 md:p-8 transition-colors duration-300 hover:bg-foreground/[0.03]"
                >
                  <h3 className="flex items-center gap-3 text-lg md:text-xl font-semibold tracking-[-0.01em]">
                    <span className={`shrink-0 inline-block w-3 h-3 ${c.color}`} aria-hidden />
                    {c.headline}
                  </h3>
                  <p className="mt-3 font-serif text-foreground/65 leading-[1.55] max-w-[46ch]">
                    {c.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ─── 02b Leader conversations ──────────────────────────── */}
        <Section pad="md">
          <Container size="wide">
            <Reveal once={false} {...CENTER_TRIGGER}>
              <Eyebrow tone="accent" size="sm">
                {report.leaderConversations.eyebrow}
              </Eyebrow>
              <h2 className="mt-4 font-black leading-[0.97] tracking-[-0.03em] text-3xl md:text-[3.25rem] max-w-[20ch]">
                Conversations with community <span className="text-accent">leaders</span> put
                detail behind these numbers.
              </h2>
            </Reveal>
            <Reveal delay={80} once={false} {...CENTER_TRIGGER}>
              <p className="mt-7 max-w-[64ch] border-l-2 border-accent/40 pl-5 font-serif text-base md:text-lg italic text-foreground/60 leading-[1.6]">
                {report.leaderConversations.note}
              </p>
            </Reveal>

            {/* A thread of voices: each community is a node on a coral rule, an
                oversized ghost index marking its place, the account hung off it. */}
            <div className="relative mt-16 md:mt-24">
              <span
                aria-hidden
                className="hidden md:block absolute top-4 bottom-4 left-[15rem] w-px bg-gradient-to-b from-accent/0 via-accent/30 to-accent/0"
              />
              <div className="border-t border-foreground/12">
                {report.leaderConversations.entries.map((e, i) => (
                  <Reveal
                    key={e.community}
                    delay={i * 110}
                    once={false}
                    {...CENTER_TRIGGER}
                    as="article"
                    className="group relative grid md:grid-cols-[15rem_1fr] md:items-center gap-y-3 md:gap-x-16 border-b border-foreground/12 py-9 md:py-12"
                  >
                    <div className="relative md:pr-10">
                      <span
                        aria-hidden
                        className="block font-black tabular-nums leading-none text-5xl md:text-6xl text-accent/15 transition-colors duration-300 group-hover:text-accent/30"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-3 font-mono text-[11px] md:text-xs uppercase tracking-[0.22em] text-accent leading-[1.5]">
                        {e.community}
                      </h3>
                    </div>
                    <span
                      aria-hidden
                      className="hidden md:block absolute left-[15rem] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-background transition-transform duration-300 group-hover:scale-125"
                    />
                    <p className="font-serif text-lg md:text-[1.35rem] text-foreground/80 leading-[1.55] max-w-[56ch] transition-transform duration-300 md:group-hover:translate-x-1">
                      <MarkedText segments={e.body} />
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        {/* ─── 03 Free-text asks ─────────────────────────────────── */}
        <Section pad="md">
          <Container size="wide">
            <Reveal once={false} {...CENTER_TRIGGER}>
              <div className="grid md:grid-cols-[1fr_auto] md:items-center gap-8 md:gap-16">
                <h2 className="font-black leading-[0.95] tracking-[-0.03em] text-3xl md:text-[3.25rem]">
                  What people <span className="text-accent">ask</span>
                  <br />
                  for when you
                  <br />
                  let them <span className="text-accent">speak</span>.
                </h2>
                <figure className="md:max-w-[34ch] border-l-2 border-accent pl-5">
                  <blockquote className="font-serif italic text-lg md:text-xl text-foreground/85 leading-[1.5]">
                    “I have a welding shop but I lack the tools to use.”
                  </blockquote>
                  <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                    Community respondent
                  </figcaption>
                </figure>
              </div>
              <p className="mt-6 font-serif text-lg md:text-xl text-foreground/70 leading-[1.55] max-w-[90ch]">
                The support question offered nine fixed options, none of them infrastructure.
                <br />
                People could write in anything the list missed, and 118 community respondents did.
                <br />
                Their write-ins were led, by a wide margin, by water and sanitation, then electricity.
              </p>
            </Reveal>

            {/* No bars: these were write-ins on a blank line, so we render them
                as write-ins. Each ask is inked onto a form rule, drawing in
                left-to-right as it enters view (reversible on scroll-out). Type
                size encodes share; a coral caret + count surface on hover. */}
            <div className="mt-14 md:mt-20">
              {report.freeText.map((item, i) => {
                const ratio = item.value / report.freeText[0].value;
                const fontSize = `clamp(${(1.05 + ratio * 0.45).toFixed(2)}rem, ${(
                  1.2 +
                  ratio * 2.6
                ).toFixed(1)}vw, ${(1.25 + ratio * 1.15).toFixed(2)}rem)`;
                const lead = i === 0;
                return (
                  <div
                    key={item.label}
                    className="group relative grid grid-cols-[1fr_auto] items-baseline gap-x-5 md:gap-x-10 border-t border-foreground/12 last:border-b py-7 md:py-9 transition-colors duration-300 hover:bg-foreground/[0.03]"
                  >
                    <div className="flex items-baseline gap-3 md:gap-5 min-w-0">
                      <span className="shrink-0 font-mono text-[10px] tabular-nums text-foreground/30 leading-none">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 transition-transform duration-300 md:group-hover:translate-x-1">
                        <ScrollWipeReveal
                          as="span"
                          className={`inline-block font-black tracking-[-0.025em] leading-[1.15] ${
                            lead ? 'text-accent' : 'text-foreground/85 group-hover:text-foreground'
                          }`}
                          style={{ fontSize }}
                        >
                          {item.label}
                        </ScrollWipeReveal>
                      </span>
                    </div>
                    <div className="shrink-0 flex items-baseline gap-2 text-right">
                      <CountUp
                        value={item.value}
                        suffix="%"
                        className={`font-black tabular-nums leading-none text-2xl md:text-4xl ${
                          lead ? 'text-accent' : 'text-foreground'
                        }`}
                      />
                      <span className="font-mono text-[11px] tabular-nums text-foreground/35 transition-colors duration-300 group-hover:text-foreground/65">
                        ({item.count})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Caption>
              Figure 4. Infrastructure asked for in free-text support answers: % of the 118 community
              respondents who wrote one in, count in brackets. None of these were options on the form.
            </Caption>

            {/* Two reads of the same write-ins: the gap they close, and a
                quieter signal hiding inside them. */}
            {/* Two reads, set in the method section's editorial rhythm: the
                first block left, the second pushed right, with the same large
                serif word-reveal + coral marker treatment. */}
            <div className="mt-12 md:mt-16 space-y-16 md:space-y-28">
              <div className="max-w-[42rem]">
                <ScrollWipeReveal
                  as="h3"
                  className="font-black leading-[0.95] tracking-[-0.03em] text-3xl md:text-[3.25rem] pb-[0.12em]"
                >
                  This also resolves the <span className="text-accent">gap</span>{' '}
                  <br className="hidden md:inline" />
                  between problems and{' '}
                  <br className="hidden md:inline" />
                  support seen earlier.
                </ScrollWipeReveal>
                <ScrollWordReveal
                  segments={FREETEXT_NOTE_1}
                  className="mt-6 font-serif text-2xl md:text-3xl text-foreground/75 leading-[1.5]"
                />
              </div>

              <div className="ml-auto max-w-[42rem] text-right">
                <ScrollWipeReveal
                  as="h3"
                  direction="left"
                  className="font-black leading-[0.95] tracking-[-0.03em] text-3xl md:text-[3.25rem] pb-[0.12em]"
                >
                  A second, quieter signal:{' '}
                  <br className="hidden md:inline" />
                  <span className="text-accent">tools, not training</span>.
                </ScrollWipeReveal>
                <ScrollWordReveal
                  segments={FREETEXT_NOTE_2}
                  className="mt-6 font-serif text-2xl md:text-3xl text-foreground/75 leading-[1.5]"
                />
              </div>
            </div>
          </Container>
        </Section>

        {/* ─── 04 Leader proposals ───────────────────────────────── */}
        <Section pad="md">
          <Container size="wide">
            <Reveal once={false} {...CENTER_TRIGGER}>
              <h2 className="font-black leading-[0.97] tracking-[-0.03em] text-3xl md:text-[3.25rem] max-w-[20ch]">
                What communities <span className="text-accent">propose</span>.
              </h2>
            </Reveal>
            <Reveal delay={80} once={false} {...CENTER_TRIGGER}>
              <p className="mt-6 max-w-[64ch] font-serif text-base md:text-lg text-foreground/60 leading-[1.6]">
                {report.leaderProposals.note}
              </p>
            </Reveal>

            {/* A lettered thread of proposals: same coral rule + ghost index +
                node treatment as the leader conversations above, keyed A/B/C. */}
            <div className="relative mt-16 md:mt-24">
              <span
                aria-hidden
                className="hidden md:block absolute top-4 bottom-4 left-[15rem] w-px bg-gradient-to-b from-accent/0 via-accent/30 to-accent/0"
              />
              <div className="border-t border-foreground/12">
                {report.leaderProposals.entries.map((e, i) => (
                  <Reveal
                    key={e.heading}
                    delay={i * 110}
                    once={false}
                    {...CENTER_TRIGGER}
                    as="article"
                    className="group relative grid md:grid-cols-[15rem_1fr] md:items-center gap-y-3 md:gap-x-16 border-b border-foreground/12 py-9 md:py-12"
                  >
                    <div className="relative md:pr-10">
                      <h3 className="font-black leading-[1.05] tracking-[-0.02em] text-2xl md:text-[1.75rem] text-foreground/85 transition-colors duration-300 group-hover:text-accent">
                        {e.heading}
                      </h3>
                    </div>
                    <span
                      aria-hidden
                      className="hidden md:block absolute left-[15rem] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-background transition-transform duration-300 group-hover:scale-125"
                    />
                    <p className="font-serif text-base md:text-lg text-foreground/70 leading-[1.6] max-w-[60ch] transition-transform duration-300 md:group-hover:translate-x-1">
                      <MarkedText segments={e.body} />
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* On-reach callout: the dark inset note that closes the section. */}
            <Reveal delay={120} once={false} {...CENTER_TRIGGER}>
              <div className="mt-12 md:mt-16 bg-accent text-background rounded-lg p-7 md:p-10 grid md:grid-cols-[1fr_auto] md:items-start gap-4 md:gap-10">
                <p className="font-serif text-lg md:text-xl leading-[1.55] max-w-[60ch]">
                  {report.leaderProposals.reachNote.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </p>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/55 md:text-right md:self-end">
                  {report.leaderProposals.reachLabel}
                </span>
              </div>
            </Reveal>
          </Container>
        </Section>

        {/* ─── 05 Students ───────────────────────────────────────── */}
        <Section pad="md">
          <Container size="wide">
            <Reveal>
              <h2 className="font-black leading-[0.95] tracking-[-0.03em] text-3xl md:text-[3.25rem]">
                The college is a
                <br />
                <span className="text-accent">separate</span> story.
              </h2>
              <p className="mt-6 font-serif text-lg md:text-xl text-foreground/70 leading-[1.55] max-w-[60ch]">
                {report.students.dek}
              </p>
            </Reveal>

            {/* Same bubble matrix as the by-community section, drilling into the
                two groups (communities vs students) rather than communities.
                On large screens the respondent voices sit in the empty space
                around the bubbles: two on the left, one on the right. */}
            <div className="relative mt-12">
              <CommunityProblemMatrix
                categories={report.studentsVsCommunities.categories}
                series={report.studentsVsCommunities.series}
                entity={{ singular: 'group', plural: 'groups' }}
                primaryMetric="pct"
                showSubLabel={false}
              />
              <div aria-hidden className="hidden lg:block pointer-events-none">
                {report.students.quotes.map((q, i) => {
                  const pos = [
                    'left-6 top-24 xl:left-10',
                    'left-6 bottom-24 xl:left-10',
                    'right-6 bottom-24 xl:right-10',
                  ][i];
                  return (
                    <figure
                      key={q.text}
                      className={`absolute ${pos} max-w-[15rem] border-l-2 border-accent pl-3`}
                    >
                      <blockquote className="text-[12px] leading-[1.45] text-foreground/85">
                        &ldquo;{q.text}&rdquo;
                      </blockquote>
                      <figcaption className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/45">
                        — {q.who}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </div>
            <Caption className="max-w-none! text-center">
              Figure 5 — problems named by FBC students against the marginalised communities. Each
              bubble totals the two groups (communities + students); click one to split it back into
              each group.
            </Caption>

            {/* Two reads of the matrix above, same shape as the by-community notes. */}
            <div className="mt-14 grid sm:grid-cols-2 border-t border-l border-foreground/12">
              {report.students.notes.map((c, i) => (
                <Reveal
                  key={c.headline}
                  delay={(i % 2) * 90}
                  className="border-b border-r border-foreground/12 p-6 md:p-8 transition-colors duration-300 hover:bg-foreground/[0.03]"
                >
                  <h3 className="flex items-center gap-3 text-lg md:text-xl font-semibold tracking-[-0.01em]">
                    <span className={`shrink-0 inline-block w-3 h-3 ${c.color}`} aria-hidden />
                    {c.headline}
                  </h3>
                  <p className="mt-3 font-serif text-foreground/65 leading-[1.55] max-w-[46ch]">
                    {c.body}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* Respondent voices: shown stacked below on smaller screens, where
                the in-viz overlay above is hidden. */}
            <div className="mt-12 grid sm:grid-cols-3 gap-8 lg:hidden">
              {report.students.quotes.map((q, i) => (
                <Reveal key={q.text} delay={i * 90} className="border-l-2 border-accent pl-4">
                  <p className="text-sm text-foreground/85 leading-[1.5]">
                    &ldquo;{q.text}&rdquo;
                  </p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/45">
                    — {q.who}
                  </p>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ─── 06 Trust & barriers ───────────────────────────────── */}
        {/* pulled up to tighten the gap after the student-notes section */}
        <Section pad="md" className="-mt-[8vh] md:-mt-[16vh]">
          <Container size="wide">
            {/* Barriers as a full-size bloom (Figure 6). Headline rides inside
                the pinned lede so it sits tight above the rose, matching the
                Reach scene. Counts, not percentages. */}
            <ProblemRoseScene
              items={report.barriers}
              unit=""
              mirror
              flip
              topClassName="mt-0"
              roseGapClassName="mt-6 md:mt-10 xl:-mt-44"
              captionGapClassName="-mt-20 md:-mt-20 xl:-mt-48"
              stickyTopClassName="top-12"
              lede={
                <div>
                  <Eyebrow tone="accent" size="sm" align="right">Barriers & trust</Eyebrow>
                  <h2 className="mt-4 ml-auto font-black leading-[0.97] tracking-[-0.03em] text-3xl md:text-[3.25rem] max-w-[18ch]">
                    People have <span className="text-accent">stopped</span> expecting outside help.
                  </h2>
                  <p className="mt-5 ml-auto font-serif text-sm md:text-base text-foreground/70 leading-[1.45] max-w-[38rem]">
                    {report.trust.intro}
                  </p>
                </div>
              }
              caption={
                <Caption className="mx-auto max-w-none md:whitespace-nowrap">
                  Figure 6 — barriers to using a new service, mentions across responses (n=476).
                </Caption>
              }
            />

            {/* The voices that carry the finding, sitting under the rose;
                pulled up to tighten the gap left by the pinned scene. */}
            <div className="-mt-[30vh] md:-mt-[8vh] lg:-mt-[24vh] xl:mt-[12vh] grid sm:grid-cols-3 gap-8">
              {report.trust.quotes.map((q, i) => (
                <Reveal
                  key={q.text}
                  delay={i * 90}
                  className="border-l-2 border-accent pl-4 font-serif"
                >
                  <p className="italic text-base md:text-lg text-foreground/85 leading-[1.5]">
                    &ldquo;{q.text}&rdquo;
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                    {q.who}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* Closing warning — the coral callout that ends the section. */}
            <Reveal delay={120} once={false} {...CENTER_TRIGGER} className="block mt-12 md:mt-16">
              <div className="rounded-lg bg-accent text-background p-7 md:p-10">
                <p className="font-mono uppercase text-[10px] tracking-[0.22em] text-background/65">
                  {report.trust.warning.eyebrow}
                </p>
                <p className="mt-4 font-serif text-xl md:text-2xl leading-[1.5] max-w-[70ch]">
                  {report.trust.warning.body}
                </p>
              </div>
            </Reveal>
          </Container>
        </Section>

        {/* ─── 07 Reach ──────────────────────────────────────────── */}
        <Section pad="md" className="md:-mt-[12vh] lg:mt-0">
          <Container size="wide">
            {/* Same pinned rose scene as Figure 1: the lede holds on screen
                while scroll blooms the petals one at a time, then releases. */}
            <ProblemRoseScene
              items={report.reach}
              roseGapClassName="mt-6 md:mt-0 lg:mt-10 xl:-mt-44"
              captionGapClassName="-mt-20 md:-mt-20 xl:-mt-48"
              stickyTopClassName="top-12"
              lede={
                <div>
                  <Eyebrow tone="accent" size="sm">Reach</Eyebrow>
                  <h2 className="mt-4 font-black leading-[0.97] tracking-[-0.03em] text-3xl md:text-5xl max-w-[16ch]">
                    Who needs help, and how to <span className="text-accent">reach</span> them.
                  </h2>
                  <p className="mt-6 font-serif text-lg md:text-xl text-foreground/70 leading-[1.55] max-w-[42ch]">
                    Asked who needs support most, most said everyone, youth next:
                    a sign of how widely the strain is felt. To reach people,
                    face-to-face contact is what they trust.
                  </p>
                </div>
              }
              caption={
                <Caption className="mx-auto max-w-none md:whitespace-nowrap">
                  Figure 7 — preferred way to be reached, four communities (n=476).
                </Caption>
              }
            />
          </Container>
        </Section>

        {/* ─── 08 What comes next ────────────────────────────────── */}
        {/* pulled up to tighten the gap left by the pinned scene above */}
        <Section pad="md" className="-mt-[38vh] md:-mt-[45vh] lg:-mt-[64vh] xl:-mt-[20vh]">
          <Container size="wide">
            <Reveal once={false} {...CENTER_TRIGGER}>
              <Eyebrow tone="accent" size="sm">What comes next</Eyebrow>
              <p className="mt-6 font-serif text-lg md:text-xl text-foreground/55 leading-[1.6]">
                The findings here stand on their own and are ready to act on. The
                fuller report still to come will add recorded interviews with a
                broader range of residents, deepening the picture and testing the
                leader proposals against what residents themselves say.
              </p>
            </Reveal>

            {/* 71% reach callout — the headline read on how people want contact. */}
            <Reveal delay={120} once={false} {...CENTER_TRIGGER}>
              <div className="mt-12 md:mt-16 rounded-lg p-7 md:p-10 grid sm:grid-cols-[auto_1fr] sm:items-center gap-5 sm:gap-10 bg-[color-mix(in_srgb,var(--accent)_30%,var(--background))]">
                <CountUp
                  value={71}
                  suffix="%"
                  className="font-black tabular-nums tracking-[-0.04em] text-accent text-6xl md:text-8xl leading-[0.8]"
                />
                <p className="font-serif text-lg md:text-xl text-foreground/85 leading-[1.5] max-w-[52ch]">
                  prefer community meetings, ahead of social media (37%), radio
                  (28%) and in-person centres (24%). Phone and WhatsApp came last
                  (16%). The college population is the exception, leaning to social
                  media.
                </p>
              </div>
            </Reveal>
          </Container>
        </Section>

        {/* ─── Recommendations ───────────────────────────────────── */}
        <Section pad="md" className="md:-mt-[12vh] lg:mt-0">
          <Container size="wide">
            <Reveal once={false} {...CENTER_TRIGGER}>
              <Eyebrow tone="accent" size="sm">
                Recommendations
              </Eyebrow>
              <h2 className="mt-4 font-black leading-[0.97] tracking-[-0.03em] text-3xl md:text-[3.25rem]">
                What the <span className="text-accent">data</span> says to do.
              </h2>
            </Reveal>
            <Reveal delay={80} once={false} {...CENTER_TRIGGER}>
              <p className="mt-6 max-w-[64ch] font-serif text-base md:text-lg text-foreground/60 leading-[1.6]">
                The evidence points two ways at once, and an honest reading holds both.
              </p>
            </Reveal>

            {/* Numbered coral thread: ghost index in the rail, node on the rule,
                headline + reasoning on the right (same pattern as proposals). */}
            <div className="relative mt-16 md:mt-24">
              <span
                aria-hidden
                className="hidden md:block absolute top-4 bottom-4 left-[15rem] w-px bg-gradient-to-b from-accent/0 via-accent/30 to-accent/0"
              />
              <ol className="border-t border-foreground/12">
                {report.recommendations.map((r, i) => (
                  <Reveal
                    key={i}
                    delay={(i % 2) * 90}
                    once={false}
                    {...CENTER_TRIGGER}
                    as="li"
                    className={`group relative grid md:grid-cols-[15rem_1fr] md:items-center gap-y-3 md:gap-x-16 py-9 md:py-12 ${
                      r.accent
                        ? 'bg-accent text-background rounded-lg px-6 md:px-10 my-3'
                        : 'border-b border-foreground/12'
                    }`}
                  >
                    <div className="relative md:pr-10">
                      <span
                        aria-hidden
                        className={`block font-black tabular-nums leading-none text-5xl md:text-6xl transition-colors duration-300 ${
                          r.accent
                            ? 'text-background/30 group-hover:text-background/50'
                            : 'text-accent/15 group-hover:text-accent/30'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    {!r.accent && (
                      <span
                        aria-hidden
                        className="hidden md:block absolute left-[15rem] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-background transition-transform duration-300 group-hover:scale-125"
                      />
                    )}
                    <div className="transition-transform duration-300 md:group-hover:translate-x-1">
                      <h3 className="font-black leading-[1.1] tracking-[-0.02em] text-xl md:text-2xl">
                        {r.headline}
                      </h3>
                      <p
                        className={`mt-3 font-serif text-base md:text-lg leading-[1.6] max-w-[60ch] ${
                          r.accent ? 'text-background/85' : 'text-foreground/65'
                        }`}
                      >
                        {r.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>

            {/* Water-chain note: the one connection that should frame the rest. */}
            <Reveal delay={120} once={false} {...CENTER_TRIGGER}>
              <div className="mt-12 md:mt-16 bg-accent text-background rounded-lg p-7 md:p-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/55">
                  {report.waterChainNote.label}
                </p>
                <p className="mt-5 font-serif text-lg md:text-xl leading-[1.55] max-w-[68ch]">
                  {report.waterChainNote.body}
                </p>
              </div>
            </Reveal>

            {/* ─── Colophon ──────────────────────────────────────── */}
            <Reveal>
              <div className="mt-14 md:mt-20 grid gap-8 border-t border-foreground/12 pt-8 md:grid-cols-2 md:gap-16 md:pt-10">
                {/* Left: methodology & base, then the mark. */}
                <div className="flex flex-col">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                    {report.colophon.leftLabel}
                  </p>
                  <ScrollWordReveal
                    segments={COLOPHON_BASE}
                    className="mt-5 max-w-[52ch] font-serif text-base md:text-lg text-foreground/70 leading-[1.55]"
                  />
                  {/* Logo slot — drop /public/logo.svg to render the mark. */}
                  <span
                    className="mt-auto inline-flex h-9 items-center pt-8 text-foreground/40"
                    aria-label="Christex Foundation"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.svg" alt="" className="h-9 w-auto" />
                  </span>
                </div>

                {/* Right: report meta, set right per the screenshot — a muted
                    italic lead-in over a bold accent line. */}
                <div className="md:text-right">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                    {report.colophon.rightLabel}
                  </p>
                  <div className="mt-4 font-serif leading-[1.2]">
                    <p className="text-lg md:text-xl italic text-foreground/55">
                      {report.colophon.rightTitle[0]}
                    </p>
                    <p className="text-lg md:text-xl font-bold text-accent">
                      {report.colophon.rightTitle[1]}
                    </p>
                  </div>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                    {report.colophon.brandLine}
                  </p>
                </div>
              </div>
            </Reveal>
          </Container>
        </Section>
      </article>

      <Footer />
    </main>
  );
}
