import Link from "next/link";

export default function EditorialLandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top nav */}
      <header className="border-b border-foreground/15">
        <div className="px-6 md:px-10 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.28em] font-semibold"
          >
            Problem Bank
          </Link>
          <nav className="flex items-center gap-6 text-[10px] uppercase tracking-[0.22em] text-foreground/55">
            <Link href="#library" className="hover:text-foreground transition-colors">
              Library
            </Link>
            <Link href="#feed" className="hover:text-foreground transition-colors">
              Feed
            </Link>
            <Link href="#how" className="hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link
              href="/signin"
              className="px-3 py-1.5 border border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>
        <div className="px-6 md:px-10 py-3 flex flex-wrap items-baseline justify-between gap-3 text-[10px] uppercase tracking-[0.24em] text-foreground/45 border-t border-foreground/10">
          <div>Christex Foundation</div>
          <div>A library of problems worth building &middot; Sierra Leone</div>
          <div>build.christex.foundation</div>
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 md:px-10 pt-20 pb-20 border-b border-foreground/15">
        <div className="max-w-[1100px]">
          <div className="text-[11px] uppercase tracking-[0.32em] text-accent mb-8 font-semibold">
            The Problem Bank &middot; from Christex Foundation
          </div>
          <h1 className="text-[clamp(2.75rem,6.5vw,6rem)] leading-[0.96] font-semibold tracking-[-0.025em] max-w-[18ch]">
            We do the months
            <br />
            of strategy.
            <br />
            <span className="text-foreground/45">You start at code.</span>
          </h1>
          <p className="mt-10 text-xl md:text-2xl text-foreground/65 leading-relaxed font-light max-w-[60ch]">
            Christex Foundation researches Sierra Leone&rsquo;s most important
            unsolved problems and publishes the dossier &mdash; field
            interviews, PRDs, tech designs, user flows, roadmaps, pitch decks.
            You pick up where the strategy ends.
          </p>

          <div className="mt-14 flex flex-wrap items-center gap-8">
            <Link
              href="#library"
              className="px-7 py-3.5 bg-foreground text-background text-[12px] uppercase tracking-[0.28em] font-semibold hover:bg-accent transition-colors"
            >
              Browse the library
            </Link>
            <Link
              href="#feed"
              className="group inline-flex items-center gap-2 text-foreground/70 hover:text-foreground text-[12px] uppercase tracking-[0.28em] font-semibold transition-colors"
            >
              Raise a problem
              <span className="transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* THE ANATOMY — the six docs */}
      <section className="px-6 md:px-10 py-20 border-b border-foreground/15 bg-paper/40">
        <div className="max-w-[1300px]">
          <div className="flex items-baseline justify-between flex-wrap gap-6 mb-14">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-accent mb-3 font-semibold">
                Anatomy of an entry
              </div>
              <h2 className="text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.015em] max-w-[18ch]">
                Six PDFs.
                <br />
                <span className="text-foreground/45">
                  One ready-to-build dossier.
                </span>
              </h2>
            </div>
            <p className="text-foreground/65 leading-relaxed max-w-[40ch]">
              Most research libraries hand you a PDF. Problem Bank hands you
              six &mdash; Concept Note, PRD, Tech Design, User Flows,
              Roadmap, Pitch Deck.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10">
            {DOC_ANATOMY.map((d, i) => (
              <article
                key={d.key}
                className="bg-background p-8 flex flex-col gap-3 min-h-[200px]"
              >
                <div className="flex items-baseline justify-between">
                  <span className="num text-[10px] uppercase tracking-[0.32em] text-accent font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/40">
                    {d.weight}
                  </span>
                </div>
                <h3 className="text-2xl font-semibold tracking-[-0.01em] leading-tight">
                  {d.label}
                </h3>
                <p className="text-foreground/65 leading-relaxed text-[15px]">
                  {d.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* THE WORK BEFORE THE WORK */}
      <section className="px-6 md:px-10 py-24 border-b border-foreground/15 bg-foreground text-background">
        <div className="max-w-[1300px]">
          <div className="text-[11px] uppercase tracking-[0.32em] text-accent mb-8 font-semibold">
            The work before the work
          </div>
          <h2 className="text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.0] font-semibold tracking-[-0.02em] max-w-[18ch]">
            Scoping a problem
            <br />
            takes a research team
            <br />
            <span className="text-background/45">you don&rsquo;t have.</span>
          </h2>
          <p className="mt-10 text-xl md:text-2xl text-background/70 leading-relaxed font-light max-w-[60ch]">
            Field interviews. PRDs. Tech designs. User flows. Roadmaps. Pitch
            decks. Months of strategy before a single commit. Christex
            Foundation does that part &mdash; so you can start where it ends.
          </p>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-background/15">
            <ResearchStat
              num="8–12"
              unit="weeks"
              label="per dossier"
            />
            <ResearchStat
              num="30+"
              unit="interviews"
              label="per problem"
            />
            <ResearchStat
              num="14"
              unit="communities"
              label="Sierra Leone"
            />
            <ResearchStat
              num="6"
              unit="reviewers"
              label="per entry"
            />
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
            <ResearchStep
              kicker="In the field"
              title="Interviews. Maps. Counts."
              body="Christex researchers spend weeks on the ground &mdash; clinicians, market vendors, teachers, ward officers, parents. The lived data that doesn&rsquo;t exist in any report."
            />
            <ResearchStep
              kicker="At the desk"
              title="Scope. Spec. Specify."
              body="A product writer drafts the PRD. An engineer reviews the tech design. A designer maps the user flows. Each artifact reviewed by two outside experts."
            />
            <ResearchStep
              kicker="On the shelf"
              title="Published. Open. Free."
              body="Six PDFs, one infographic, an optional proof of concept &mdash; uploaded to the Library, indexed by sector, ready for the next person who clicks &ldquo;I&rsquo;m building this.&rdquo;"
            />
          </div>
        </div>
      </section>

      {/* FEATURED ENTRY */}
      <section className="px-6 md:px-10 py-20 border-b border-foreground/15">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20 max-w-[1300px]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-accent mb-4 font-semibold">
              Featured dossier
            </div>
            <div className="flex items-center gap-3 mb-4 text-[10px] uppercase tracking-[0.24em] text-foreground/50">
              <span>Health</span>
              <span className="text-foreground/25">&middot;</span>
              <span className="text-accent font-semibold">Critical urgency</span>
              <span className="text-foreground/25">&middot;</span>
              <span>POC live</span>
            </div>
            <h2 className="text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.015em]">
              Rural clinic supply
              <br />
              chain visibility.
            </h2>
            <p className="mt-8 text-lg text-foreground/70 leading-relaxed">
              Forty percent of rural clinics run out of medicine before
              month-end. The dossier maps the supply-chain, prices the gap,
              specifies a low-bandwidth inventory pipeline, and lays out a
              twelve-month roadmap to nationwide rollout.
            </p>

            <div className="mt-10 flex items-center gap-6 text-[11px] uppercase tracking-[0.24em] text-foreground/60">
              <span className="num">
                <span className="text-foreground font-semibold">12</span>{" "}
                builders
              </span>
              <span className="text-foreground/25">&middot;</span>
              <span className="num">
                <span className="text-foreground font-semibold">3</span> repos
              </span>
              <span className="text-foreground/25">&middot;</span>
              <span>Demo live</span>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-8">
              <Link
                href="#"
                className="inline-flex items-center gap-2 text-accent text-[12px] uppercase tracking-[0.28em] font-semibold group"
              >
                Read the dossier
                <span className="transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground text-[12px] uppercase tracking-[0.28em] font-semibold transition-colors group"
              >
                I&rsquo;m building this
                <span className="transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          {/* Document bar — visualizes the six docs available */}
          <div className="border border-foreground/15 bg-paper/40 p-8 md:p-10">
            <div className="text-[10px] uppercase tracking-[0.32em] text-foreground/45 mb-6 font-semibold">
              What&rsquo;s inside
            </div>
            <ul className="flex flex-col">
              {DOC_ANATOMY.map((d, i) => (
                <li
                  key={d.key}
                  className="flex items-baseline gap-5 py-4 border-b border-foreground/10 last:border-0"
                >
                  <span className="num text-[10px] uppercase tracking-[0.28em] text-accent font-semibold min-w-[2.5ch]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-medium tracking-[-0.005em] flex-1">
                    {d.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/45">
                    PDF &middot; {d.pages}p
                  </span>
                </li>
              ))}
              <li className="flex items-baseline gap-5 py-4 border-b border-foreground/10">
                <span className="num text-[10px] uppercase tracking-[0.28em] text-foreground/40 font-semibold min-w-[2.5ch]">
                  &#43;
                </span>
                <span className="text-lg font-medium tracking-[-0.005em] flex-1 text-foreground/70">
                  Infographic
                </span>
                <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/45">
                  HTML
                </span>
              </li>
              <li className="flex items-baseline gap-5 py-4">
                <span className="num text-[10px] uppercase tracking-[0.28em] text-foreground/40 font-semibold min-w-[2.5ch]">
                  &#43;
                </span>
                <span className="text-lg font-medium tracking-[-0.005em] flex-1 text-foreground/70">
                  Proof of concept
                </span>
                <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/45">
                  Repo &middot; demo
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* THE LIBRARY — by sector */}
      <section id="library" className="px-6 md:px-10 py-20 border-b border-foreground/15">
        <div className="max-w-[1300px]">
          <div className="flex items-baseline justify-between mb-12 flex-wrap gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-accent mb-3 font-semibold">
                The library
              </div>
              <h2 className="text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.01em]">
                Browse by sector.
              </h2>
            </div>
            <Link
              href="#"
              className="hidden md:inline-flex group items-center gap-2 text-foreground/60 hover:text-foreground text-[11px] uppercase tracking-[0.28em] font-semibold transition-colors"
            >
              All entries
              <span className="transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-px bg-foreground/10">
            {SECTORS.map((s) => (
              <Link
                key={s.name}
                href="#"
                className="bg-background p-6 md:p-8 flex flex-col gap-3 hover:bg-paper/60 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.28em] text-accent font-semibold">
                    {s.name}
                  </span>
                  <span className="num text-2xl font-semibold tracking-[-0.025em]">
                    {s.count}
                  </span>
                </div>
                <p className="text-[13px] text-foreground/60 leading-relaxed min-h-[2.5rem]">
                  {s.sample}
                </p>
                <span className="mt-auto pt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-foreground/45 group-hover:text-foreground transition-colors border-t border-foreground/10">
                  Browse
                  <span className="transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* THE LOOP */}
      <section id="how" className="px-6 md:px-10 py-20 border-b border-foreground/15 bg-paper/40">
        <div className="max-w-[1300px]">
          <div className="text-[10px] uppercase tracking-[0.32em] text-accent mb-3 font-semibold">
            The loop
          </div>
          <h2 className="text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.01em] max-w-[18ch]">
            From raised problem to shipping repo.
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-px bg-foreground/10">
            {LOOP_STEPS.map((step, i) => (
              <div
                key={step.title}
                className="bg-background p-7 flex flex-col gap-3 relative"
              >
                <div className="flex items-baseline justify-between">
                  <span className="num text-[10px] uppercase tracking-[0.32em] text-accent font-semibold">
                    Step {i + 1}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/40">
                    {step.who}
                  </span>
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.005em] leading-tight">
                  {step.title}
                </h3>
                <p className="text-foreground/65 leading-relaxed text-[14px]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE BADGE */}
      <section className="px-6 md:px-10 py-20 border-b border-foreground/15">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20 max-w-[1300px]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-accent mb-3 font-semibold">
              The badge
            </div>
            <h2 className="text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.01em]">
              One line in your README.
              <br />
              <span className="text-foreground/45">
                You&rsquo;re on the map.
              </span>
            </h2>
            <p className="mt-8 text-lg text-foreground/65 leading-relaxed max-w-[42ch]">
              Every Library entry has a dynamic SVG badge. Drop the snippet in
              your repo&rsquo;s README and your fetches ping back &mdash;
              your commits appear on the entry page, other builders see
              you&rsquo;re working, and the entry shows up in your README
              with the latest status.
            </p>
            <div className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-foreground/55">
              <span className="num">
                <span className="text-foreground font-semibold">37</span>{" "}
                repos
              </span>
              <span className="text-foreground/25">&middot;</span>
              <span>2,140 badge fetches this week</span>
            </div>
          </div>

          <div className="border border-foreground/15 bg-paper/40 p-8 md:p-10">
            <div className="text-[10px] uppercase tracking-[0.32em] text-foreground/45 mb-6 font-semibold">
              Drop this in your README
            </div>
            <pre className="text-[12px] leading-relaxed bg-foreground text-background p-5 overflow-x-auto font-mono">
{`![Building from Christex Problem Bank](
  https://build.christex.foundation/api/badge/
  rural-clinic-supply-chain
)`}
            </pre>
            <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 border border-foreground/25 bg-background">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[10px] uppercase tracking-[0.24em] font-semibold">
                Building from Christex Problem Bank
              </span>
              <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/45">
                &middot; Research in progress
              </span>
            </div>
            <p className="mt-6 text-[12px] text-foreground/55 leading-relaxed">
              The status updates as the entry advances &mdash; research in
              progress &rarr; live.
            </p>
          </div>
        </div>
      </section>

      {/* BUILDERS BUILDING */}
      <section id="feed" className="px-6 md:px-10 py-20 border-b border-foreground/15">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 max-w-[1300px]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-accent mb-3 font-semibold">
              Builders building
            </div>
            <h2 className="text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.01em]">
              Real repos.
              <br />
              <span className="text-foreground/45">Real commits.</span>
            </h2>
            <p className="mt-8 text-lg text-foreground/65 leading-relaxed max-w-[42ch]">
              Builder activity is pulled from GitHub via the badge. Every push,
              every PR, on every registered repo &mdash; live on the entry
              page.
            </p>
            <Link
              href="#"
              className="mt-10 group inline-flex items-center gap-2 text-accent text-[12px] uppercase tracking-[0.28em] font-semibold"
            >
              See all activity
              <span className="transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>

          <ul className="flex flex-col">
            {BUILDER_ACTIVITY.map((item, i) => (
              <li
                key={i}
                className="flex items-baseline gap-6 py-5 border-b border-foreground/10"
              >
                <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/50 min-w-[6ch] num">
                  {item.ago}
                </span>
                <div className="flex-1">
                  <div className="text-base leading-snug">
                    <span className="font-semibold">{item.who}</span>{" "}
                    <span className="text-foreground/60">{item.verb}</span>{" "}
                    <span className="font-medium">{item.repo}</span>
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-foreground/45">
                    {item.entry}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 md:px-10 py-24 bg-foreground text-background">
        <div className="max-w-[1000px]">
          <h2 className="text-[clamp(2.25rem,6vw,5.5rem)] leading-[0.98] font-semibold tracking-[-0.02em]">
            Read.{" "}
            <span className="text-background/45">Download.</span>
            <br />
            <span className="text-accent">Build.</span>{" "}
            <span className="text-background/45">Ship.</span>
          </h2>
          <p className="mt-10 text-lg md:text-xl text-background/70 leading-relaxed max-w-[52ch]">
            Christex Foundation&rsquo;s library is open. Pick a problem from
            the eight sectors. Pull down the six PDFs. Embed the badge. Start
            shipping.
          </p>
          <div className="mt-12 flex flex-wrap gap-6">
            <Link
              href="#library"
              className="px-8 py-4 bg-background text-foreground text-[12px] uppercase tracking-[0.28em] font-semibold hover:bg-accent hover:text-background transition-colors"
            >
              Browse the library
            </Link>
            <Link
              href="#feed"
              className="px-8 py-4 border border-background text-background text-[12px] uppercase tracking-[0.28em] font-semibold hover:bg-background hover:text-foreground transition-colors"
            >
              Raise a problem
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/15 px-6 md:px-10 py-10 flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-[0.24em] text-foreground/45">
        <div>Christex Foundation &middot; 2026</div>
        <div>build.christex.foundation</div>
      </footer>
    </main>
  );
}

function ResearchStat({
  num,
  unit,
  label,
}: {
  num: string;
  unit: string;
  label: string;
}) {
  return (
    <div className="bg-foreground p-7 flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="num text-4xl md:text-5xl font-semibold tracking-[-0.025em]">
          {num}
        </span>
        <span className="text-[11px] uppercase tracking-[0.24em] text-background/55">
          {unit}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-[0.24em] text-background/55">
        {label}
      </span>
    </div>
  );
}

function ResearchStep({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-[10px] uppercase tracking-[0.32em] text-accent font-semibold">
        {kicker}
      </div>
      <h3 className="text-2xl font-semibold leading-tight tracking-[-0.01em]">
        {title}
      </h3>
      <p className="text-background/70 leading-relaxed">{body}</p>
    </div>
  );
}

const DOC_ANATOMY = [
  {
    key: "concept_note",
    label: "Concept Note",
    body: "The problem in plain language. Who it hurts, why it matters, why now.",
    weight: "The why",
    pages: 8,
  },
  {
    key: "prd",
    label: "PRD",
    body: "Product requirements. What to build, scoped tight enough to start.",
    weight: "The what",
    pages: 14,
  },
  {
    key: "technical_design",
    label: "Technical Design",
    body: "Architecture, data model, integrations, and the trade-offs already made.",
    weight: "The how",
    pages: 18,
  },
  {
    key: "user_flows",
    label: "User Flows & Wireframes",
    body: "The shape of the product, screen by screen. No starting from blank.",
    weight: "The shape",
    pages: 22,
  },
  {
    key: "roadmap",
    label: "Roadmap",
    body: "Phased delivery plan. What ships in week 1, month 1, quarter 1.",
    weight: "The path",
    pages: 6,
  },
  {
    key: "pitch_deck",
    label: "Pitch Deck",
    body: "The story for funders, partners, and the team you&rsquo;ll need.",
    weight: "The sell",
    pages: 12,
  },
] as const;

const SECTORS = [
  {
    name: "Health",
    count: 7,
    sample: "Supply-chain visibility for rural clinics.",
  },
  {
    name: "Education",
    count: 5,
    sample: "Off-grid study tools for exam-season power cuts.",
  },
  {
    name: "Agriculture",
    count: 4,
    sample: "Post-harvest loss tracking and aggregation.",
  },
  {
    name: "Finance",
    count: 3,
    sample: "Mobile-money liquidity at month-end.",
  },
  {
    name: "Logistics",
    count: 4,
    sample: "Rainy-season feeder-road routing.",
  },
  { name: "Energy", count: 2, sample: "Community-scale solar accounting." },
  {
    name: "Infrastructure",
    count: 3,
    sample: "Maintenance registry for public assets.",
  },
  { name: "Other", count: 2, sample: "Civic services &mdash; the long tail." },
];

const LOOP_STEPS = [
  {
    title: "Citizens raise.",
    body: "Anyone names what&rsquo;s broken. Three votes per week per voter. Problems that gain traction across multiple days become candidates for research.",
    who: "Feed",
  },
  {
    title: "Christex researches.",
    body: "Gaining-traction submissions become field investigations. Interviews, data, partners, scope &mdash; the work most builders don&rsquo;t have time for.",
    who: "Christex",
  },
  {
    title: "Six docs publish.",
    body: "Concept Note, PRD, Tech Design, User Flows, Roadmap, Pitch Deck &mdash; uploaded as a Library entry. Plus infographic, plus POC where possible.",
    who: "Library",
  },
  {
    title: "Builders register & ship.",
    body: "Click &ldquo;I&rsquo;m building this,&rdquo; link your repo, embed the badge SVG in your README. Your commits show up live on the entry page.",
    who: "Builders",
  },
];

const BUILDER_ACTIVITY = [
  {
    ago: "2h",
    who: "Aminata",
    verb: "pushed to",
    repo: "rural-clinic-supply-chain",
    entry: "Health · Rural clinic supply visibility",
  },
  {
    ago: "6h",
    who: "Foday",
    verb: "opened PR on",
    repo: "off-grid-study-companion",
    entry: "Education · Off-grid study tools",
  },
  {
    ago: "1d",
    who: "Hawa",
    verb: "shipped v0.2 of",
    repo: "post-harvest-loss",
    entry: "Agriculture · Post-harvest loss tracking",
  },
  {
    ago: "1d",
    who: "Mohamed",
    verb: "claimed",
    repo: "feeder-route-rainy",
    entry: "Logistics · Rainy-season routing",
  },
  {
    ago: "2d",
    who: "Isatu",
    verb: "registered",
    repo: "month-end-liquidity",
    entry: "Finance · Mobile-money liquidity",
  },
];
