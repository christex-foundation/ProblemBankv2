// THROWAWAY preview route — compare water-chain directions.
// Not linked anywhere. Delete this file + WaterChainViz*.tsx when done.
import { ClockEaten, WordsIgnite } from '@/components/_viz-proto/WaterChainViz2';
import { ChainDominoes, ThreadPull } from '@/components/_viz-proto/WaterChainViz3';
import { Fracture, GearTrain, Stain } from '@/components/_viz-proto/WaterChainViz4';
import { ThreadedDominoes, BranchingDominoes } from '@/components/_viz-proto/WaterChainViz5';

function Block({
  tag,
  title,
  blurb,
  keep,
  children,
}: {
  tag: string;
  title: string;
  blurb: string;
  keep?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-foreground/10 pt-10">
      <div className="flex items-baseline gap-3">
        <span className="text-accent font-black text-2xl">{tag}</span>
        <h2 className="font-semibold text-2xl md:text-3xl tracking-[-0.02em]">{title}</h2>
        {keep && (
          <span className="text-[10px] uppercase tracking-[0.22em] text-accent border border-accent/40 px-2 py-0.5">
            keeper
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-foreground/55 max-w-[64ch]">{blurb}</p>
      {/* extra vertical room so the scroll-driven motion has space to play */}
      <div className="mt-20 mb-28">{children}</div>
    </section>
  );
}

export default function WaterChainPreviewPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-12 max-w-[1100px] mx-auto">
      <h1 className="text-[11px] uppercase tracking-[0.22em] text-foreground/45 mb-2">
        The water chain · survivors + new mechanics
      </h1>
      <p className="text-sm text-foreground/55 max-w-[64ch]">
        Scroll slowly through each — the motion is scroll-linked. Four survivors up top, three new
        mechanics below (organic fracture, mechanical gears, spreading stain).
      </p>
      <div className="mt-10 space-y-12">
        <Block tag="1" title="The day, eaten" keep blurb="Kept. The chain as a stolen 24-hour clock; the centre tallies the hours eaten from every day.">
          <ClockEaten />
        </Block>
        <Block tag="3" title="In their own words" keep blurb="Kept. The chain as one sentence the residents co-wrote; each clause ignites, a quote surfacing beside it.">
          <WordsIgnite />
        </Block>
        <Block tag="4" title="Chain dominoes" keep blurb="Kept. Physical causality: pull the first tile and the fall propagates into the three costs.">
          <ChainDominoes />
        </Block>
        <Block tag="6" title="The thread" keep blurb="Kept. Entanglement: one thread winds through every consequence, drawing on scroll.">
          <ThreadPull />
        </Block>

        <Block
          tag="7"
          title="Fracture"
          blurb="New mechanic: organic. Water is the stress; a crack branches outward across the panel, each fork reaching a human cost. Grows like a fracture spreading."
        >
          <Fracture />
        </Block>
        <Block
          tag="8"
          title="Gear train"
          blurb="New mechanic: mechanical. The water gear drives a meshed train; each gear turns the next and reveals its consequence. Once it turns, the outcomes are inevitable."
        >
          <GearTrain />
        </Block>
        <Block
          tag="9"
          title="The stain"
          blurb="New mechanic: spread. A coral stain seeps from the source and engulfs each consequence as it reaches it; the label activates when the stain arrives."
        >
          <Stain />
        </Block>

        <Block
          tag="10"
          title="Threaded dominoes (domino × thread)"
          blurb="The blend you asked for. A coral thread winds through a line of standing tiles; as the thread draws along its route the front reaches each tile and topples it, so the line and the chain reaction are the same gesture. Fallen tiles lie along the thread."
        >
          <ThreadedDominoes />
        </Block>
        <Block
          tag="11"
          title="Branching dominoes (one push, three collapses)"
          blurb="Expanding the domino mechanic: the two causes topple in a row, then the fall forks down three parallel tracks at once, each run ending in a human cost. One push fanning into three collapses."
        >
          <BranchingDominoes />
        </Block>
      </div>
      <p className="mt-12 pt-10 border-t border-foreground/10 text-[11px] uppercase tracking-[0.22em] text-foreground/35">
        Tell me which to keep / kill / combine and I'll refine from there
      </p>
    </main>
  );
}
