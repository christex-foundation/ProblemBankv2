import Link from "next/link";
import { LibraryConstellation } from "@/components/LibraryConstellation";
import { SAMPLE_ENTRIES } from "@/data/sampleEntries";

export default function UniverseLandingPage() {
  const total = SAMPLE_ENTRIES.length;
  const totalBuilders = SAMPLE_ENTRIES.reduce((s, e) => s + e.builders, 0);
  const withPoc = SAMPLE_ENTRIES.filter((e) => e.hasPoc).length;
  const critical = SAMPLE_ENTRIES.filter((e) => e.urgency === "critical").length;

  return (
    <main className="relative bg-background text-foreground">
      {/* Sticky constellation layer */}
      <div className="sticky top-0 h-screen w-full z-0">
        <LibraryConstellation entries={SAMPLE_ENTRIES} className="opacity-95" />
      </div>

      {/* Floating top nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.28em] font-semibold mix-blend-difference text-white"
        >
          Problem Bank
        </Link>
        <nav className="flex items-center gap-6 text-[10px] uppercase tracking-[0.22em]">
          <Link
            href="#anatomy"
            className="mix-blend-difference text-white/80 hover:text-white transition-colors"
          >
            Anatomy
          </Link>
          <Link
            href="#loop"
            className="mix-blend-difference text-white/80 hover:text-white transition-colors"
          >
            The loop
          </Link>
          <Link
            href="#cta"
            className="mix-blend-difference text-white hover:opacity-70 transition-opacity font-semibold"
          >
            Browse library &rarr;
          </Link>
        </nav>
      </header>

      {/* Scrolling content overlays */}
      <div className="relative z-10 -mt-[100vh]">
        {/* FRAME 1 — the opening */}
        <section className="h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20">
          <div className="max-w-[1000px]">
            <div className="text-[11px] uppercase tracking-[0.32em] text-accent mb-8 font-semibold">
              The Problem Bank &middot; Christex Foundation
            </div>
            <h1 className="text-[clamp(3rem,7.5vw,7.5rem)] leading-[0.96] font-semibold tracking-[-0.025em]">
              We do
              <br />
              the strategy.
              <br />
              <span className="text-foreground/45">
                You do the build.
              </span>
            </h1>
            <p className="mt-10 text-xl md:text-2xl text-foreground/65 leading-relaxed max-w-[640px] font-light">
              Every dot is a Christex Foundation dossier &mdash; a Sierra
              Leone problem researched in the field and published as the six
              PDFs a builder needs to start at code.
            </p>

            <div className="mt-14 flex items-center gap-10">
              <Link
                href="#cta"
                className="group inline-flex items-center gap-3 text-accent text-[12px] uppercase tracking-[0.28em] font-semibold"
              >
                Browse the library
                <span className="transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
              <span className="text-[10px] uppercase tracking-[0.28em] text-foreground/40">
                Hover any dot
              </span>
            </div>
          </div>
        </section>

        {/* FRAME 2 — the portfolio at a glance */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 py-24">
          <div className="max-w-[1100px] bg-background/85 backdrop-blur-sm p-10 md:p-14 border-l-2 border-accent">
            <div className="text-[11px] uppercase tracking-[0.32em] text-foreground/45 mb-6 font-semibold">
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
            <p className="mt-10 text-lg text-foreground/65 leading-relaxed">
              Color by sector. Size by builders shipping. Hover any dot to read.
            </p>
          </div>
        </section>

        {/* FRAME 3 — anatomy of an entry */}
        <section
          id="anatomy"
          className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 py-24"
        >
          <div className="max-w-[1200px] bg-background/85 backdrop-blur-sm p-10 md:p-14">
            <div className="text-[11px] uppercase tracking-[0.32em] text-foreground/45 mb-6 font-semibold">
              Anatomy of an entry
            </div>
            <h2 className="text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.01em] max-w-[20ch]">
              Six PDFs.
              <span className="text-foreground/45">
                {" "}
                Plus infographic, plus POC where possible.
              </span>
            </h2>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-foreground/10">
              {DOC_ANATOMY.map((d, i) => (
                <div
                  key={d.key}
                  className="bg-background p-5 flex flex-col gap-2 min-h-[150px]"
                >
                  <span className="num text-[10px] uppercase tracking-[0.32em] text-accent font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold leading-tight tracking-[-0.005em]">
                    {d.label}
                  </h3>
                  <p className="text-foreground/60 leading-relaxed text-[12px] mt-auto">
                    {d.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FRAME 3.5 — the work before the work */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 py-24">
          <div className="max-w-[1100px] bg-foreground/95 text-background backdrop-blur-sm p-10 md:p-14 border-l-2 border-accent">
            <div className="text-[11px] uppercase tracking-[0.32em] text-accent mb-6 font-semibold">
              The work before the work
            </div>
            <h2 className="text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.015em]">
              Scoping a problem
              <br />
              takes a research team
              <br />
              <span className="text-background/45">
                you don&rsquo;t have.
              </span>
            </h2>
            <p className="mt-8 text-lg md:text-xl text-background/70 leading-relaxed max-w-[58ch]">
              Field interviews. PRDs. Tech designs. User flows. Roadmaps.
              Pitch decks. Months of strategy before a single commit. Christex
              Foundation does that part.
            </p>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-background/15">
              <FrameStat num="8–12" unit="weeks" label="per dossier" />
              <FrameStat num="30+" unit="interviews" label="per problem" />
              <FrameStat num="14" unit="communities" label="Sierra Leone" />
              <FrameStat num="6" unit="reviewers" label="per entry" />
            </div>
          </div>
        </section>

        {/* FRAME 4 — the loop */}
        <section
          id="loop"
          className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 py-24"
        >
          <div className="max-w-[1200px] bg-background/85 backdrop-blur-sm p-10 md:p-14">
            <div className="text-[11px] uppercase tracking-[0.32em] text-foreground/45 mb-6 font-semibold">
              How a problem becomes a build
            </div>
            <h2 className="text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.01em] max-w-[20ch]">
              Citizens raise. Christex researches. Builders ship.
            </h2>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
              {LOOP_STEPS.map((step, i) => (
                <div key={step.title} className="flex flex-col gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="num text-[10px] uppercase tracking-[0.32em] text-accent font-semibold">
                      Step {i + 1}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/40">
                      {step.who}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold leading-tight tracking-[-0.005em]">
                    {step.title}
                  </h3>
                  <p className="text-foreground/65 leading-relaxed text-[13px]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FRAME 5 — CTA */}
        <section
          id="cta"
          className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 py-24"
        >
          <div className="max-w-[1000px] bg-background/85 backdrop-blur-sm p-10 md:p-14">
            <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.98] font-semibold tracking-[-0.02em]">
              Read.{" "}
              <span className="text-foreground/45">Download.</span>
              <br />
              <span className="text-accent">Build.</span>{" "}
              <span className="text-foreground/45">Ship.</span>
            </h2>
            <p className="mt-8 text-lg text-foreground/65 leading-relaxed max-w-[52ch]">
              The library is open. Pick a problem from the eight sectors.
              Pull the PDFs. Embed the badge.
            </p>
            <div className="mt-12 flex flex-wrap gap-6">
              <Link
                href="#"
                className="px-8 py-4 bg-foreground text-background text-[12px] uppercase tracking-[0.28em] font-semibold hover:bg-accent transition-colors"
              >
                Browse the library
              </Link>
              <Link
                href="#"
                className="px-8 py-4 border border-foreground text-foreground text-[12px] uppercase tracking-[0.28em] font-semibold hover:bg-foreground hover:text-background transition-colors"
              >
                Raise a problem
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t border-foreground/10 px-6 md:px-10 py-10 flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-[0.22em] text-foreground/45">
          <div>Christex Foundation &middot; 2026</div>
          <div>build.christex.foundation</div>
        </footer>
      </div>
    </main>
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
      <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/55">
        {label}
      </span>
    </div>
  );
}

function FrameStat({
  num,
  unit,
  label,
}: {
  num: string;
  unit: string;
  label: string;
}) {
  return (
    <div className="bg-foreground p-5 flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <span className="num text-2xl md:text-3xl font-semibold tracking-[-0.025em]">
          {num}
        </span>
        <span className="text-[10px] uppercase tracking-[0.24em] text-background/55">
          {unit}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-[0.24em] text-background/55">
        {label}
      </span>
    </div>
  );
}

const DOC_ANATOMY = [
  { key: "concept_note", label: "Concept Note", body: "The why." },
  { key: "prd", label: "PRD", body: "The what." },
  { key: "technical_design", label: "Tech Design", body: "The how." },
  { key: "user_flows", label: "Wireframes", body: "The shape." },
  { key: "roadmap", label: "Roadmap", body: "The path." },
  { key: "pitch_deck", label: "Pitch Deck", body: "The sell." },
] as const;

const LOOP_STEPS = [
  {
    title: "Citizens raise.",
    body: "Anyone names what&rsquo;s broken. Three votes per voter per week. Problems gain traction across days.",
    who: "Feed",
  },
  {
    title: "Christex researches.",
    body: "Gaining-traction submissions become field investigations &mdash; interviews, data, scope.",
    who: "Christex",
  },
  {
    title: "Six docs publish.",
    body: "Concept Note, PRD, Tech Design, User Flows, Roadmap, Pitch Deck &mdash; uploaded as a Library entry.",
    who: "Library",
  },
  {
    title: "Builders register & ship.",
    body: "Click &ldquo;I&rsquo;m building this,&rdquo; link your repo, drop the badge SVG. Commits appear live.",
    who: "Builders",
  },
];

