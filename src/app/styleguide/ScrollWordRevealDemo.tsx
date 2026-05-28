"use client";

import { ScrollWordReveal, type ScrollWordSegment } from "@/design";

const DEMO_SEGMENTS: ScrollWordSegment[] = [
  "Scroll the demo block past the bottom of the viewport and each word ",
  { text: "lifts into place", strong: true },
  ". The block self-tracks its position: progress is 0 when its top edge sits at the viewport bottom, 1 when its bottom edge has reached the viewport bottom (block fully in view). Each word inherits a per-token ",
  { text: "threshold", strong: true },
  " and CSS reads the container's --p variable.",
];

export function ScrollWordRevealDemo() {
  return (
    <div className="border border-foreground/15 p-6">
      <ScrollWordReveal
        segments={DEMO_SEGMENTS}
        className="font-serif text-xl md:text-2xl text-foreground/90 leading-[1.5]"
      />
    </div>
  );
}
