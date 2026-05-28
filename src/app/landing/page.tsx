import Link from "next/link";

const REFERENCES = [
  {
    slug: "editorial",
    letter: "A",
    name: "Editorial",
    blurb:
      "Hero → six-doc anatomy → featured dossier → library grid → the loop → builder activity → CTA. Reads like a foundation publication.",
    feel: "Credibility · depth",
  },
  {
    slug: "universe",
    letter: "B",
    name: "Universe",
    blurb:
      "Sticky constellation of library entries (color by sector, size by builders) behind scrolling frames.",
    feel: "Portfolio · scale",
  },
  {
    slug: "scrolly",
    letter: "C",
    name: "Scrolly",
    blurb:
      "Six cinematic scenes walking from “you want to build” to the dossier reveal to CTA.",
    feel: "Story · rhythm",
  },
];

export default function LandingIndexPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-[1100px]">
        <div className="text-[11px] uppercase tracking-[0.32em] text-accent mb-6 font-semibold">
          Landing &middot; index
        </div>
        <h1 className="text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.0] font-semibold tracking-[-0.02em]">
          The main design,
          <br />
          plus three references.
        </h1>

        {/* MAIN — featured */}
        <Link
          href="/landing/main"
          className="mt-16 group block border border-foreground bg-foreground text-background hover:bg-accent transition-colors"
        >
          <div className="px-8 md:px-12 py-10 md:py-14 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-[0.32em] text-accent mb-4 font-semibold">
                Main design
              </div>
              <h2 className="text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.0] font-black tracking-[-0.02em] uppercase max-w-[14ch]">
                You get to
                <br />
                build something
                <br />
                that matters.
              </h2>
              <p className="mt-8 text-base md:text-lg text-background/70 leading-relaxed max-w-[52ch] font-light">
                Centered hero over a vertical marquee of real survey
                statements drawn from the 250-respondent pilot. Hero only
                &mdash; below-the-fold sections are TBD.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <span className="text-[10px] uppercase tracking-[0.28em] text-background/55">
                /landing/main
              </span>
              <span className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.28em] font-semibold">
                Open
                <span className="transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </span>
            </div>
          </div>
        </Link>

        {/* REFERENCES — secondary row */}
        <div className="mt-16">
          <div className="text-[10px] uppercase tracking-[0.32em] text-foreground/45 mb-6 font-semibold">
            Reference variants
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10">
            {REFERENCES.map((v) => (
              <Link
                key={v.slug}
                href={`/landing/${v.slug}`}
                className="bg-background p-7 flex flex-col gap-4 hover:bg-paper/60 transition-colors group"
              >
                <div className="flex items-baseline justify-between">
                  <span className="num text-[10px] uppercase tracking-[0.32em] text-accent font-semibold">
                    Variant {v.letter}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/40">
                    /landing/{v.slug}
                  </span>
                </div>
                <h3 className="text-2xl font-semibold tracking-[-0.01em]">
                  {v.name}
                </h3>
                <p className="text-foreground/65 leading-relaxed text-[14px]">
                  {v.blurb}
                </p>
                <div className="mt-auto pt-4 text-[10px] uppercase tracking-[0.24em] text-foreground/50 border-t border-foreground/10">
                  {v.feel}
                </div>
                <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] font-semibold text-foreground">
                  Preview
                  <span className="transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-16 text-[11px] uppercase tracking-[0.24em] text-foreground/45">
          Christex Foundation &middot; Problem Bank &middot; local testing
        </p>
      </div>
    </main>
  );
}
