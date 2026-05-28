import Link from "next/link";

export default function ScrollyLandingPage() {
  return (
    <main className="bg-background text-foreground">
      {/* Persistent floating nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 mix-blend-difference">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.28em] font-semibold text-white"
        >
          Problem Bank
        </Link>
        <Link
          href="#cta"
          className="text-[11px] uppercase tracking-[0.28em] font-semibold text-white"
        >
          Browse library &rarr;
        </Link>
      </header>

      {/* SCENE 1 — the hook */}
      <section className="min-h-screen flex items-center px-6 md:px-12 bg-foreground text-background">
        <div className="max-w-[1100px]">
          <div className="text-[11px] uppercase tracking-[0.32em] text-accent mb-10 font-semibold">
            The Problem Bank &middot; Christex Foundation
          </div>
          <h1 className="text-[clamp(2.75rem,7.5vw,7rem)] leading-[0.96] font-semibold tracking-[-0.025em]">
            You want to build
            <br />
            something
            <br />
            <span className="text-background/45">that matters.</span>
          </h1>
          <p className="mt-12 text-xl md:text-2xl text-background/70 leading-relaxed max-w-[640px] font-light">
            Then you spend three months figuring out what to build.
          </p>
          <p className="mt-16 text-[11px] uppercase tracking-[0.32em] text-background/45 font-semibold">
            Scroll &darr;
          </p>
        </div>
      </section>

      {/* SCENE 2 — the work before the work */}
      <section className="min-h-screen flex items-center px-6 md:px-12 border-b border-foreground/10">
        <div className="max-w-[1100px]">
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] leading-[1.0] font-semibold tracking-[-0.022em]">
            The work before
            <br />
            <span className="text-foreground/45">the work.</span>
          </h2>

          <p className="mt-12 text-xl md:text-2xl text-foreground/75 leading-[1.45] max-w-[780px] font-light">
            Every entry in the Library is a problem that has been lived,
            reported, validated against evidence, and documented to the
            standard an investor can fund and a developer can build from.
          </p>

          <p className="mt-10 text-2xl md:text-3xl font-semibold tracking-[-0.015em] leading-[1.2]">
            Not a hypothesis. Not a hunch.{" "}
            <span className="text-accent">Researched.</span>
          </p>

          <p className="mt-14 text-[11px] md:text-[12px] uppercase tracking-[0.28em] text-foreground/55 font-medium">
            8&ndash;12 weeks per entry
            <span className="text-foreground/25 mx-3">&middot;</span>
            30&#43; interviews per problem
            <span className="text-foreground/25 mx-3">&middot;</span>
            14 communities
            <span className="text-foreground/25 mx-3">&middot;</span>
            6 reviewers
          </p>
        </div>
      </section>

      {/* SCENE 3 — the reveal (accent saturated) */}
      <section className="min-h-screen flex items-center px-6 md:px-12 bg-accent text-background py-24">
        <div className="max-w-[1300px] w-full">
          <div className="text-[11px] uppercase tracking-[0.32em] text-background/70 mb-8 font-semibold">
            So Christex spends the months
          </div>
          <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.98] font-semibold tracking-[-0.022em]">
            Every problem ships
            <br />
            <span className="text-background/65">as six PDFs.</span>
          </h2>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-background/20">
            {DOC_ANATOMY.map((d, i) => (
              <div
                key={d.key}
                className="bg-accent p-6 flex flex-col gap-3 min-h-[180px]"
              >
                <span className="num text-[10px] uppercase tracking-[0.32em] text-background/65 font-semibold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold leading-tight tracking-[-0.005em]">
                  {d.label}
                </h3>
                <p className="text-background/75 leading-relaxed text-[13px] mt-auto">
                  {d.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-base md:text-lg text-background/85 leading-relaxed max-w-[640px]">
            Plus an infographic. Plus an optional proof of concept. Plus a
            Build Registry of everyone already shipping against it.
            Read. Download. Build. Ship.
          </p>
        </div>
      </section>

      {/* SCENE 4 — the loop */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 py-24 border-b border-foreground/10">
        <div className="max-w-[1300px] w-full">
          <div className="text-[11px] uppercase tracking-[0.32em] text-accent mb-8 font-semibold">
            How a problem becomes a build
          </div>
          <h2 className="text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.02] font-semibold tracking-[-0.02em] max-w-[18ch]">
            From the feed
            <br />
            to a shipping repo.
          </h2>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10">
            {LOOP_STEPS.map((step, i) => (
              <div key={step.title} className="flex flex-col gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="num text-[11px] uppercase tracking-[0.32em] text-accent font-semibold">
                    Step {i + 1}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/40">
                    {step.who}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-semibold leading-tight tracking-[-0.01em]">
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

      {/* SCENE 5 — builders building */}
      <section className="min-h-screen flex items-center px-6 md:px-12 bg-paper/50 border-b border-foreground/10 py-24">
        <div className="max-w-[1100px] w-full">
          <div className="text-[11px] uppercase tracking-[0.32em] text-accent mb-8 font-semibold">
            Live from the registry
          </div>
          <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.02em] max-w-[18ch]">
            You won&rsquo;t be
            <br />
            building alone.
          </h2>
          <p className="mt-8 text-lg text-foreground/65 leading-relaxed max-w-[58ch]">
            One badge in your README pings the bank every time someone reads
            it. Every push, every PR, on every registered repo &mdash; live on
            the entry page.
          </p>

          <ul className="mt-14 flex flex-col">
            {BUILDER_ACTIVITY.map((item, i) => (
              <li
                key={i}
                className="flex items-baseline gap-6 py-5 border-b border-foreground/10"
              >
                <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/50 min-w-[6ch] num">
                  {item.ago}
                </span>
                <div className="flex-1">
                  <div className="text-lg leading-snug">
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

      {/* SCENE 6 — CTA */}
      <section
        id="cta"
        className="min-h-screen flex items-center px-6 md:px-12 bg-foreground text-background"
      >
        <div className="max-w-[1000px]">
          <div className="text-[11px] uppercase tracking-[0.32em] text-accent mb-10 font-semibold">
            The Problem Bank
          </div>
          <h2 className="text-[clamp(2.5rem,6.5vw,6rem)] leading-[0.96] font-semibold tracking-[-0.025em]">
            Read.{" "}
            <span className="text-background/45">Download.</span>
            <br />
            <span className="text-accent">Build.</span>{" "}
            <span className="text-background/45">Ship.</span>
          </h2>
          <p className="mt-10 text-lg md:text-xl text-background/70 leading-relaxed max-w-[52ch]">
            Christex Foundation&rsquo;s library is open. Pick a problem. Pull
            the six PDFs. Embed the badge.
          </p>

          <div className="mt-14 flex flex-wrap gap-6">
            <Link
              href="#"
              className="px-8 py-4 bg-background text-foreground text-[12px] uppercase tracking-[0.28em] font-semibold hover:bg-accent hover:text-background transition-colors"
            >
              Browse the library
            </Link>
            <Link
              href="#"
              className="px-8 py-4 border border-background text-background text-[12px] uppercase tracking-[0.28em] font-semibold hover:bg-background hover:text-foreground transition-colors"
            >
              Raise a problem
            </Link>
          </div>

          <p className="mt-16 text-[11px] uppercase tracking-[0.28em] text-background/45">
            Christex Foundation &middot; build.christex.foundation &middot; 2026
          </p>
        </div>
      </section>
    </main>
  );
}

const DOC_ANATOMY = [
  {
    key: "concept_note",
    label: "Concept Note",
    body: "The problem, in plain language.",
  },
  { key: "prd", label: "PRD", body: "Product requirements, scoped." },
  {
    key: "technical_design",
    label: "Technical Design",
    body: "Architecture, data, integrations.",
  },
  {
    key: "user_flows",
    label: "Wireframes",
    body: "User flows, screen by screen.",
  },
  { key: "roadmap", label: "Roadmap", body: "Week 1, month 1, quarter 1." },
  { key: "pitch_deck", label: "Pitch Deck", body: "For funders and team." },
] as const;

const LOOP_STEPS = [
  {
    title: "Citizens raise.",
    body: "Anyone names what&rsquo;s broken. Three votes per voter per week. Problems gain traction across days.",
    who: "Feed",
  },
  {
    title: "Christex researches.",
    body: "Gaining-traction problems become field investigations &mdash; interviews, data, scope.",
    who: "Christex",
  },
  {
    title: "Six docs publish.",
    body: "Concept Note, PRD, Tech Design, User Flows, Roadmap, Pitch Deck &mdash; uploaded as a Library entry.",
    who: "Library",
  },
  {
    title: "Builders register & ship.",
    body: "Click &ldquo;I&rsquo;m building this,&rdquo; link your repo, embed the badge. Pushes appear live on the entry.",
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
];
