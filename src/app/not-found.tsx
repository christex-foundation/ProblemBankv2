import { ButtonLink, MountSlideReveal } from "@/design";
import { Eyebrow } from "@/design/typography";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col bg-background text-foreground">
      <SiteNav variant="sticky" />

      <section className="relative flex-1 flex flex-col items-center justify-center px-6 md:px-10 py-[10vh] md:py-[12vh] text-center">
        <MountSlideReveal from="left" distance="14%" delay={300} duration={700}>
          <Eyebrow tone="accent" align="center" className="mb-8 md:mb-12">
            Page not found
          </Eyebrow>
        </MountSlideReveal>

        {/* The hanging sign. z-10 so the board sweeps in front of the copy
            during its full swing rather than being clipped behind it. */}
        <div className="relative z-10 mb-28 md:mb-36">
          <Billboard />
        </div>

        <MountSlideReveal from="left" distance="10%" delay={750} duration={800}>
          <p className="max-w-[520px] font-serif text-xl md:text-2xl text-foreground/90 leading-[1.5]">
            This page isn&rsquo;t an entry we&rsquo;ve shelved. It may have
            moved, or it was never named. Everything we&rsquo;ve researched
            lives in the library.
          </p>
        </MountSlideReveal>

        <MountSlideReveal from="left" distance="8%" delay={850} duration={800}>
          <div className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <ButtonLink href="/library" variant="accent">
              Browse the library
            </ButtonLink>
            <ButtonLink href="/" variant="outline">
              Back to home
            </ButtonLink>
          </div>
        </MountSlideReveal>
      </section>

      <Footer />
    </main>
  );
}

// A sign reading "404 / OFF THE SHELF", bolted to the wall at both top
// corners. After a beat the left bolt shears off (see .board-bolt-shear in
// globals.css) and the whole board swings from the top-right bolt, settling
// crooked (.board-swing). The pivot is set to the right bolt's centre so that
// bolt appears to stay fixed while everything else swings beneath it.
function Billboard() {
  // Bolt geometry: 16px (w-4) bolts inset 14px from the top corners, so each
  // bolt centre sits 22px in from its edge. The swing pivot matches the right
  // bolt centre. Keep these in sync if the inset/size changes.
  const boltCentreInset = "22px";

  return (
    // Stationary wrapper, sized to the board. The shearing bolt lives here (not
    // on the rotating board) so when it lets go it falls straight down in
    // screen space instead of being dragged sideways by the board's swing.
    <div className="relative inline-block">
      <div
        className="board-swing relative bg-paper border border-foreground/15 shadow-card px-8 py-7 md:px-16 md:py-12"
        style={{ transformOrigin: `calc(100% - ${boltCentreInset}) ${boltCentreInset}` }}
        role="img"
        aria-label="404. Off the shelf."
      >
        {/* Top-right bolt: the pivot. Stays put because it sits on the
            transform-origin and rotates with the board. */}
        <Bolt className="right-[14px] top-[14px]" />

        <div className="font-black text-accent leading-[0.85] tracking-[-0.04em] text-[clamp(4.5rem,15vw,10rem)]">
          404
        </div>
        <div className="mt-1 md:mt-2 font-black uppercase text-foreground leading-none tracking-[-0.01em] text-[clamp(1.35rem,4.8vw,3rem)]">
          Off the shelf
        </div>
      </div>

      {/* Top-left bolt: unscrews, lifts loose, then tumbles off-screen. Sits at
          the same corner the board's top-left occupies while pinned. */}
      <Bolt className="board-bolt-shear left-[14px] top-[14px] z-20" />
    </div>
  );
}

// A drilled-in screw head: a dark disc with an inset rim, a faint highlight,
// and a slot across the face so its rotation (unscrewing, then tumbling) is
// actually visible. A plain round disc would show no spin.
function Bolt({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute w-4 h-4 rounded-full bg-foreground ${className ?? ""}`}
      style={{
        boxShadow:
          "inset 0 1px 1.5px rgba(255,255,255,0.35), inset 0 -1px 1.5px rgba(0,0,0,0.4)",
      }}
    >
      <span className="absolute inset-[3px] rounded-full ring-1 ring-background/25" />
      {/* Screw slot. */}
      <span className="absolute top-1/2 left-1/2 w-[9px] h-[1.5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/35" />
    </span>
  );
}
