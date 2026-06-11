"use client";

import { type ReactNode } from "react";

import { ScrollWordReveal, type ScrollWordSegment } from "@/design";

const BODY_SEGMENTS: ScrollWordSegment[] = [
  "Every entry in the Library is a problem that has been ",
  { text: "used", strong: true },
  ", ",
  { text: "repeated", strong: true },
  ", and ",
  { text: "validated", strong: true },
  " against ",
  { text: "evidence", strong: true },
  ". Each one is ",
  { text: "documented", strong: true },
  " to the standard an investor, funder, or developer can build from. By the time a problem reaches the Library, it has already survived the field. The work of naming it, testing it, and writing it up ",
  { text: "is already done", strong: true },
  ". What you see is the residue of the work before the work.",
];

const TAGLINE_SEGMENTS: ScrollWordSegment[] = [
  "Not a hypothesis. Not a hunch. ",
  { text: "Researched.", accent: true },
];

/**
 * Section body + tagline that reveal word-by-word as each block scrolls
 * past the bottom of the viewport (anchored per-block, not per-section).
 * Headline is passed in as JSX so the page keeps ownership of the SVG.
 */
export function WorkBeforeWorkVisual({
  headline,
}: {
  headline: ReactNode;
}) {
  return (
    <section className="relative px-6 md:px-10 pt-[2vh] md:pt-[3vh] pb-[14vh] md:pb-[18vh]">
      <div className="max-w-[1200px] mx-auto">
        {headline}

        <ScrollWordReveal
          segments={BODY_SEGMENTS}
          className="mt-20 md:mt-32 max-w-[760px] font-serif text-2xl md:text-3xl text-foreground/90 leading-[1.5]"
        />

        <ScrollWordReveal
          segments={TAGLINE_SEGMENTS}
          className="mt-16 md:mt-24 font-serif italic text-foreground/55 text-2xl md:text-3xl tracking-[0.02em] text-right"
        />
      </div>
    </section>
  );
}
