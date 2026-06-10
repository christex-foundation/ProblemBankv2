"use client";

/**
 * Pinned scrollytelling scene for the Problem Rose. A tall track holds a
 * sticky, viewport-tall stage; the lede and rose stay fixed on screen while
 * the scroll through the track is spent revealing the petals one at a time.
 * Once all petals are shown (a short hold follows), the stage unpins and
 * scrolls away. The lede is passed in so the page keeps owning its copy.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ProblemRose, type RoseItem } from "./ProblemRose";

export function ProblemRoseScene({
  items,
  lede,
  mirror = false,
  flip = false,
  caption,
  unit = '%',
  topClassName = 'mt-16 md:mt-24',
  roseGapClassName = 'mt-6 md:-mt-44',
  captionGapClassName = '-mt-48',
  stickyTopClassName = 'top-30',
}: {
  items: RoseItem[];
  lede: ReactNode;
  /** Flip the arrangement: rose on the left, copy on the right. Used to keep
   * the section's alternating left/right rhythm. */
  mirror?: boolean;
  /** Lay the petals out counter-clockwise (biggest on the left). */
  flip?: boolean;
  /** Optional figure caption, bottom-aligned with the rose beside it. */
  caption?: ReactNode;
  /** Suffix on each petal's value (default '%'; pass '' for raw counts). */
  unit?: string;
  /** Top-margin utility for the track; override to tighten/loosen the gap
   * above the scene (default 'mt-16 md:mt-24'). */
  topClassName?: string;
  /** Margin utility on the rose wrapper; controls the gap between the lede
   * and the rose. More-negative pulls the rose up closer to the headline
   * (default 'mt-6 md:-mt-44'). */
  roseGapClassName?: string;
  /** Margin utility on the caption wrapper; controls how far the caption
   * tucks up under the rose. Less-negative drops it down, away from the
   * petals/labels (default '-mt-48'). */
  captionGapClassName?: string;
  /** Sticky offset for the pinned stage (default 'top-30'); lower values let
   * the scene sit higher in the viewport. */
  stickyTopClassName?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const total = node.offsetHeight - window.innerHeight; // pinned scroll span
      const p = total > 0 ? -rect.top / total : 0;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // reveal all petals over the first 80% of the pin, hold the rest
  const bloom = Math.min(1, progress / 0.8);

  return (
    <div ref={trackRef} className={`relative ${topClassName} h-[120vh]`}>
      {/* z-20 keeps the pinned rose + its caption above the next section,
          which is pulled up with a negative margin to tighten the gap; without
          it that section paints over the figure caption while the scene is
          still pinned. */}
      <div className={`z-20 sticky ${stickyTopClassName} h-screen flex items-start overflow-hidden`}>
        <div className="w-full">
          <div
            className={`relative z-10 max-w-[37.5rem] ${mirror ? "ml-auto text-right" : ""}`}
          >
            {lede}
          </div>
          {/* rose rises up beside the narrow lede so it can be large without
              the petals touching the copy. The vh cap keeps the whole
              composition (lede + rose + caption) inside the pinned viewport so
              shorter laptop screens don't clip the rose or hide the caption;
              it scales the rose up automatically on taller monitors. */}
          <div
            className={`${roseGapClassName} w-full max-w-[min(1300px,62vh)] ${
              mirror ? "mr-auto" : "ml-auto"
            }`}
          >
            <ProblemRose items={items} progress={bloom} flip={flip} unit={unit} className="w-full" />
          </div>
          {/* caption sits centered in the viewport, independent of the rose's
              side, when one is provided */}
          {caption && <div className={`${captionGapClassName} text-center`}>{caption}</div>}
        </div>
      </div>
    </div>
  );
}
