import Link from "next/link";
import { loadResponses, loadMapUniverse } from "@/lib/load";
import { MAP_LABELS } from "@/lib/communities";
import { ProblemScrolly, type ProblemScene } from "@/components/ProblemScrolly";
import type { Problem } from "@/lib/types";
import { SAMPLE_ENTRIES } from "@/data/sampleEntries";
import { Footer } from "@/components/Footer";
import LegoBuild from "@/components/LegoBuild";
import SynapserHero from "@/components/SynapserHero";
import { WorkBeforeWorkVisual } from "@/components/WorkBeforeWorkVisual";
import { SiteNav } from "@/components/SiteNav";
import {
  ButtonLink,
  GrainOverlay,
  MountSlideReveal,
  Reveal,
  ScrollSlideReveal,
  ScrollWordReveal,
  type ScrollWordSegment,
} from "@/design";

// One representative respondent per problem. Order = scroll order.
const PROBLEM_DISPLAY: { key: Problem; label: string }[] = [
  { key: "Water or sanitation problems", label: "Water & sanitation" },
  { key: "Unemployment", label: "Unemployment" },
  { key: "Poor education", label: "Education" },
  { key: "Poor healthcare", label: "Healthcare" },
  { key: "Poverty", label: "Poverty" },
  { key: "Drug or substance abuse", label: "Drug & substance abuse" },
  { key: "Insecurity", label: "Insecurity" },
  { key: "Mental health challenges", label: "Mental health" },
  { key: "Gender-based violence", label: "Gender-based violence" },
];

const PROBLEM_LABELS = PROBLEM_DISPLAY.map((p) => p.label);

function buildProblemScenes(): ProblemScene[] {
  const responses = loadResponses();
  const scenes: ProblemScene[] = [];
  for (const { key, label } of PROBLEM_DISPLAY) {
    const pick = responses.find(
      (r) =>
        r.biggestProblems.includes(key) &&
        r.whyUrgent &&
        r.whyUrgent.trim().length >= 25 &&
        r.whyUrgent.trim().length <= 220,
    );
    if (!pick) continue;

    // All respondents who flagged this problem — used to light the map dots.
    const focusIds = responses
      .filter((r) => r.biggestProblems.includes(key))
      .map((r) => r.id);

    scenes.push({
      problem: label,
      problemKey: key,
      quote: pick.whyUrgent.trim(),
      respondentId: pick.id,
      community: pick.community,
      ageBand: pick.ageBand,
      gender: pick.gender || "",
      focusIds,
    });
  }
  return scenes;
}

export default async function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <GrainOverlay />

      <SiteNav variant="overlay" />

      {/* Synapser-style physics hero, keeping the BUILD / WHAT MATTERS layout
          as the centered overlay over the animated word field. The floating
          words are the actual Problem Bank problem labels. */}
      <SynapserHero words={PROBLEM_LABELS}>
        <div className="text-[11px] uppercase tracking-[0.22em] text-accent mb-2 font-semibold">
          Christex Foundation &middot; Problem Bank
        </div>

        <BuildWhatMattersHeadline />

        <p className="mt-6 w-full max-w-[560px] font-serif text-lg md:text-xl text-foreground/90 leading-[1.5] text-center">
          A research-backed library of Sierra Leone&rsquo;s most important
          unsolved problems, sourced from communities and Christex Foundation.
          Open to build on.
        </p>

        {/* CTA pair. pointer-events-auto re-enables clicks inside the
            SynapserHero overlay (which is pointer-events-none so the word
            physics underneath stays interactive). */}
        {/* "Raise a problem" CTA hidden for this milestone (feed flow). */}
        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 pointer-events-auto">
          <ButtonLink href="/library" variant="accent">
            Browse the library
          </ButtonLink>
        </div>
      </SynapserHero>

      <TheWorkBeforeTheWork />

      <EachEntryArrives />

      <TwoPathsOneLibrary />

      <GetInformedBuildShip />

      <Footer />
    </main>
  );
}

function GetInformedBuildShip() {
  return (
    <section className="relative bg-foreground text-background px-6 md:px-10 pt-[12vh] md:pt-[18vh] pb-[14vh] md:pb-[20vh]">
      <div className="max-w-[1200px] mx-auto">
        <Reveal as="h2" className="font-black tracking-[-0.03em] leading-[0.95] text-[clamp(3.5rem,11vw,9rem)]">
          <span className="text-background">Get informed!</span>
          <br />
          <span className="text-accent">Build.</span>{" "}
          <span className="text-background/35">Ship.</span>
        </Reveal>

        <Reveal delay={90} as="p" className="mt-12 md:mt-16 max-w-[560px] text-base md:text-lg text-background/55 leading-[1.6]">
          Christex Foundation&rsquo;s library is open. Pick a problem from the
          eight sectors. Pull down its kit. Embed the badge. Start
          shipping.
        </Reveal>

        {/* "Raise a problem" CTA hidden for this milestone (feed flow). */}
        <Reveal delay={180} className="mt-10 md:mt-14 flex flex-col sm:flex-row gap-4">
          <ButtonLink href="/library" variant="inverse">
            Browse the library
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}

const ENTRIES_ARRIVE_SEGMENTS: ScrollWordSegment[] = [
  "Entries arrive through ",
  { text: "two parallel inputs", strong: true },
  ": problems raised on the community feed, and problems originated by Christex Foundation directly. Both run through the same research and publication pipeline, and emerge as the same kind of kit.",
];

function TwoPathsOneLibrary() {
  return (
    <section className="relative px-6 md:px-10 pt-[6vh] md:pt-[10vh] pb-[14vh] md:pb-[18vh]">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
          <div className="col-span-12 md:col-span-9">
            <TwoPathsOneLibraryHeadline />
          </div>
          <div className="hidden md:block md:col-span-3" />
        </div>

        <ScrollWordReveal
          segments={ENTRIES_ARRIVE_SEGMENTS}
          className="mt-20 md:mt-28 max-w-[760px] font-serif text-2xl md:text-3xl text-foreground/90 leading-[1.5]"
        />

        <Reveal delay={180} className="mt-16 md:mt-24">
          <LegoBuild />
        </Reveal>

        <Reveal as="p" className="mt-16 md:mt-24 font-serif italic text-foreground/55 text-2xl md:text-3xl tracking-[0.02em] text-right">
          Different doors. Same{" "}
          <span className="text-accent font-bold not-italic">standard.</span>
        </Reveal>
      </div>
    </section>
  );
}

function TheWorkBeforeTheWork() {
  return (
    <WorkBeforeWorkVisual
      headline={
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
          <div className="hidden md:block md:col-span-3" />
          <div className="col-span-12 md:col-span-9">
            <TheWorkBeforeTheWorkHeadline />
          </div>
        </div>
      }
    />
  );
}

function TheWorkBeforeTheWorkHeadline() {
  // Two-line layered headline, right-aligned to mirror the original
  // EqualWidthHeadline placement. THE WORK slides in from the left
  // (its accent emphasis); BEFORE THE WORK slides in from the right.
  return (
    <div
      className="w-full max-w-[880px] block ml-auto"
      role="img"
      aria-label="The work before the work."
    >
      <ScrollSlideReveal
        from="left"
        distance="30%"
        className="block w-[91%] ml-auto"
      >
        <svg
          viewBox="0 0 800 240"
          className="block w-full"
          preserveAspectRatio="xMaxYMin meet"
          aria-hidden
        >
          <text
            x={800}
            y={218}
            textAnchor="end"
            textLength={800}
            lengthAdjust="spacingAndGlyphs"
            style={{
              fontFamily: "inherit",
              fontSize: 280,
              fontWeight: 900,
              fill: "var(--accent)",
            }}
          >
            THE WORK
          </text>
        </svg>
      </ScrollSlideReveal>

      <ScrollSlideReveal
        from="right"
        distance="30%"
        className="block w-[87.5%] ml-auto -mt-[1.5%]"
      >
        <svg
          viewBox="0 0 770 150"
          className="block w-full"
          preserveAspectRatio="xMaxYMin meet"
          aria-hidden
        >
          <text
            x={770}
            y={133}
            textAnchor="end"
            textLength={770}
            lengthAdjust="spacingAndGlyphs"
            style={{
              fontFamily: "inherit",
              fontSize: 170,
              fontWeight: 900,
              fill: "var(--foreground)",
            }}
          >
            BEFORE THE WORK
          </text>
        </svg>
      </ScrollSlideReveal>
    </div>
  );
}

// Six PDFs displayed in a uniform 2x3 grid per the sketch.
const KIT_DOCS = [
  {
    label: "Concept Note",
    body: "The problem in plain language. Who, where, why now.",
  },
  {
    label: "PRD",
    body: "Product requirements, scoped. What v1 ships, what comes after.",
  },
  {
    label: "Technical Design",
    body: "Architecture, data model, integrations. Reviewed by engineers.",
  },
  {
    label: "Wireframes",
    body: "User flows, screen by screen. Ready to hand to a designer.",
  },
  {
    label: "Roadmap",
    body: "Week one, month one, quarter one. Concrete milestones.",
  },
  {
    label: "Pitch Deck",
    body: "The story, on slides. For funders and founding team.",
  },
] as const;

function EachEntryArrives() {
  return (
    <section className="relative px-6 md:px-10 pt-[6vh] md:pt-[10vh] pb-[14vh] md:pb-[18vh]">
      <div className="max-w-[1200px] mx-auto">
        {/* Layered headline — same Inter-black system as BUILD / WHAT MATTERS,
            arranged per the sketch: EACH top-left, ENTRY ARRIVES on one big
            line, "decision-ready." italic bottom-right. Each line owns its
            own scroll-driven entrance. */}
        <EachEntryArrivesHeadline />

        <Reveal delay={90} className="mt-16 md:mt-20 max-w-[760px]">
          <p className="font-serif text-2xl md:text-3xl text-foreground/90 leading-[1.5]">
            Every entry carries the data to decide and build. Each kit is
            sized to the problem. The floor is the same: enough evidence to
            act.
          </p>
        </Reveal>

        <Reveal delay={180} className="mt-12 md:mt-16 text-[11px] uppercase tracking-[0.22em] text-foreground/45 font-semibold">
          What a kit can include.
        </Reveal>

        {/* Six papers — 2-row × 3-column grid per the new sketch.
            Vertical and horizontal divider rules form the cross-hatch frame. */}
        <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 [&>*]:py-5 [&>*]:px-4 md:[&>*]:py-6 md:[&>*]:px-5 [&>*]:border-r [&>*]:border-b [&>*]:border-foreground/15 sm:[&>*:nth-child(2n)]:border-r-0 md:[&>*:nth-child(2n)]:border-r md:[&>*:nth-child(3n)]:border-r-0 [&>*:nth-last-child(-n+1)]:border-b-0 sm:[&>*:nth-last-child(-n+2)]:border-b-0 md:[&>*:nth-last-child(-n+3)]:border-b-0">
          {KIT_DOCS.map((d, i) => (
            <Reveal key={d.label} delay={i * 60}>
              <PaperIcon label={d.label} body={d.body} index={i} />
            </Reveal>
          ))}
        </div>

        {/* Tagline — bottom-right, matches the sketch caption */}
        <Reveal as="p" className="mt-20 md:mt-28 font-serif italic text-foreground/55 text-2xl md:text-3xl tracking-[0.02em] text-right max-w-[640px] ml-auto leading-[1.4]">
          <span className="block">And, where possible,</span>
          <span className="block text-accent font-black not-italic">
            an optional proof of concept.
          </span>
        </Reveal>
      </div>
    </section>
  );
}

function BuildWhatMattersHeadline() {
  // Hero headline. Both lines stretch to the SVG viewBox width (1200) and
  // right-align inside the centered overlay. Uses MountSlideReveal because
  // the hero is in view on initial load — scroll-driven would complete
  // before the user can see anything. Delay matches SynapserHero's 450ms
  // overlay reveal; duration matches its 900ms fade. WHAT MATTERS starts
  // 100ms after BUILD so the two lines arrive in sequence.
  return (
    <div
      className="w-full max-w-[min(760px,68vh)] block"
      role="img"
      aria-label="Build what matters."
    >
      <MountSlideReveal
        from="left"
        distance="30%"
        delay={450}
        duration={900}
        className="block w-full"
      >
        <svg
          viewBox="0 0 1200 320"
          className="block w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <text
            x={1200}
            y={312}
            textAnchor="end"
            textLength={1200}
            lengthAdjust="spacingAndGlyphs"
            style={{
              fontFamily: "inherit",
              fontSize: 400,
              fontWeight: 900,
              fill: "var(--accent)",
            }}
          >
            BUILD
          </text>
        </svg>
      </MountSlideReveal>

      <MountSlideReveal
        from="right"
        distance="30%"
        delay={550}
        duration={900}
        className="block w-full -mt-[1%]"
      >
        <svg
          viewBox="0 0 1200 170"
          className="block w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <text
            x={1200}
            y={156}
            textAnchor="end"
            textLength={1200}
            lengthAdjust="spacingAndGlyphs"
            style={{
              fontFamily: "inherit",
              fontSize: 190,
              fontWeight: 900,
              fill: "var(--foreground)",
            }}
          >
            WHAT MATTERS
          </text>
        </svg>
      </MountSlideReveal>
    </div>
  );
}

function TwoPathsOneLibraryHeadline() {
  // Two-line layered headline. Both lines share the same textLength (760 of
  // a 1200 viewBox) and are left-aligned. TWO PATHS slides in from the left
  // (matching its accent emphasis); ONE LIBRARY slides in from the right so
  // the two lines visually converge as the section enters the viewport.
  return (
    <div
      className="w-full max-w-[860px] block mr-auto"
      role="img"
      aria-label="Two paths, one library."
    >
      <ScrollSlideReveal
        from="left"
        distance="30%"
        className="block w-[88%]"
      >
        <svg
          viewBox="0 0 760 240"
          className="block w-full"
          preserveAspectRatio="xMinYMin meet"
          aria-hidden
        >
          <text
            x={0}
            y={218}
            textLength={760}
            lengthAdjust="spacingAndGlyphs"
            style={{
              fontFamily: "inherit",
              fontSize: 280,
              fontWeight: 900,
              fill: "var(--accent)",
            }}
          >
            TWO PATHS
          </text>
        </svg>
      </ScrollSlideReveal>

      <ScrollSlideReveal
        from="right"
        distance="30%"
        className="block w-[88%] -mt-[1.5%]"
      >
        <svg
          viewBox="0 0 760 170"
          className="block w-full"
          preserveAspectRatio="xMinYMin meet"
          aria-hidden
        >
          <text
            x={0}
            y={156}
            textLength={760}
            lengthAdjust="spacingAndGlyphs"
            style={{
              fontFamily: "inherit",
              fontSize: 200,
              fontWeight: 900,
              fill: "var(--foreground)",
            }}
          >
            ONE LIBRARY
          </text>
        </svg>
      </ScrollSlideReveal>
    </div>
  );
}

function EachEntryArrivesHeadline() {
  // Three independently-animated lines that recompose the original layered
  // headline. EACH slides in from the left, ENTRY ARRIVES wipes left-to-right,
  // decision-ready. slides in from the right. Negative margins recreate the
  // vertical overlap the single-SVG version had so the visual hierarchy is
  // preserved.
  return (
    <div
      className="w-full"
      role="img"
      aria-label="Each entry arrives decision-ready."
    >
      <ScrollSlideReveal
        from="left"
        distance="40%"
        scrollSpan={2.5}
        className="block w-[18%]"
      >
        <svg
          viewBox="0 0 200 100"
          className="block w-full"
          preserveAspectRatio="xMinYMin meet"
          aria-hidden
        >
          <text
            x={0}
            y={82}
            textLength={200}
            lengthAdjust="spacingAndGlyphs"
            style={{
              fontFamily: "inherit",
              fontSize: 100,
              fontWeight: 900,
              fill: "var(--foreground)",
            }}
          >
            EACH
          </text>
        </svg>
      </ScrollSlideReveal>

      <div className="block w-full -mt-[1.5%]">
        <svg
          viewBox="0 0 1200 260"
          className="block w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <text
            x={0}
            y={228}
            textLength={1200}
            lengthAdjust="spacingAndGlyphs"
            style={{
              fontFamily: "inherit",
              fontSize: 260,
              fontWeight: 900,
              fill: "var(--accent)",
            }}
          >
            ENTRY ARRIVES
          </text>
        </svg>
      </div>

      <ScrollSlideReveal
        from="right"
        distance="35%"
        scrollSpan={2.5}
        className="block w-[42%] ml-auto -mt-[2%]"
      >
        <svg
          viewBox="0 0 500 100"
          className="block w-full"
          preserveAspectRatio="xMaxYMin meet"
          aria-hidden
        >
          <text
            x={500}
            y={82}
            textAnchor="end"
            textLength={500}
            lengthAdjust="spacingAndGlyphs"
            style={{
              fontFamily: "inherit",
              fontSize: 90,
              fontWeight: 700,
              fontStyle: "italic",
              fill: "var(--foreground)",
            }}
          >
            decision-ready.
          </text>
        </svg>
      </ScrollSlideReveal>
    </div>
  );
}

function PaperIcon({
  label,
  body,
  index,
}: {
  label: string;
  body: string;
  index: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full min-h-[120px] md:min-h-[140px] text-center">
      <span className="text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-accent font-semibold num">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-base md:text-lg uppercase tracking-[0.22em] font-semibold text-foreground leading-tight">
        {label}
      </span>
      <p className="mt-1 font-serif text-sm md:text-[15px] text-foreground/65 leading-[1.45] max-w-[28ch]">
        {body}
      </p>
    </div>
  );
}

function PortfolioAtAGlance() {
  const total = SAMPLE_ENTRIES.length;
  const totalBuilders = SAMPLE_ENTRIES.reduce((s, e) => s + e.builders, 0);
  const withPoc = SAMPLE_ENTRIES.filter((e) => e.hasPoc).length;
  const critical = SAMPLE_ENTRIES.filter((e) => e.urgency === "critical").length;

  return (
    <section className="relative px-6 md:px-10 pt-[6vh] md:pt-[10vh] pb-[14vh] md:pb-[18vh]">
      <div className="max-w-[1200px] mx-auto border-l-2 border-accent pl-8 md:pl-12">
        <div className="text-[11px] uppercase tracking-[0.22em] text-foreground/45 mb-6 font-semibold">
          The portfolio, at a glance
        </div>
        <h2 className="text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.015em]">
          {total} problems researched.
          <br />
          <span className="text-foreground/45">
            {totalBuilders} builders already shipping.
          </span>
        </h2>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat label="Library entries" value={total} />
          <Stat label="Builders registered" value={totalBuilders} />
          <Stat label="With live POC" value={withPoc} />
          <Stat label="Critical urgency" value={critical} accent />
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={`num text-3xl md:text-4xl font-semibold tracking-[-0.025em] ${accent ? "text-accent" : ""}`}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/55">
        {label}
      </span>
    </div>
  );
}


interface HeadlineLine {
  text: string;
  size: number;
  /** Optional override for the stretched width of this line. Defaults to the
   * component's full width. Use a smaller value to make a line narrower than
   * the others (it will right-align under the longest line). */
  width?: number;
  /** Optional fill color for this line. Defaults to var(--foreground). */
  fill?: string;
}

function EqualWidthHeadline({
  lines,
  className,
  align = "right",
}: {
  lines: HeadlineLine[];
  className?: string;
  align?: "left" | "right";
}) {
  // Each line stretches via SVG textLength so all lines share the same
  // visual width regardless of character count or font size.
  const width = 1200;
  const lineHeightFactor = 0.78;
  const isLeft = align === "left";

  let cursorY = 0;
  const baselines: number[] = [];
  for (const line of lines) {
    cursorY += line.size * lineHeightFactor;
    baselines.push(cursorY);
  }
  const totalHeight = cursorY + lines[lines.length - 1].size * 0.1;

  return (
    <svg
      viewBox={`0 0 ${width} ${totalHeight}`}
      className={className ?? "w-full max-w-[min(760px,68vh)] block"}
      role="img"
      aria-label={lines.map((l) => l.text).join(" ")}
      preserveAspectRatio="xMidYMid meet"
    >
      {lines.map((line, i) => {
        const lineWidth = line.width ?? width;
        return (
          <text
            key={`${i}-${line.text}`}
            x={isLeft ? 0 : width}
            y={baselines[i]}
            textAnchor={isLeft ? "start" : "end"}
            textLength={lineWidth}
            lengthAdjust="spacingAndGlyphs"
            style={{
              fontFamily: "inherit",
              fontSize: line.size,
              fontWeight: 900,
              fill: line.fill ?? "var(--foreground)",
            }}
          >
            {line.text}
          </text>
        );
      })}
    </svg>
  );
}

