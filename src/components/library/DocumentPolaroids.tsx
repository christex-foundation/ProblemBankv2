import { DOC_TYPES, type DocTypeKey } from '@/lib/enums';
import { Reveal } from '@/design/motion';

interface DocumentItem {
  id: string;
  docType: string;
  cloudinaryUrl: string;
  fileName: string;
}

/**
 * Polaroid-style display for an entry's PDF kit. Each available doc renders
 * as a small tilted paper card; missing doc types simply do not appear (so
 * an entry with 3 docs reads as 3 polaroids, not 3 active + 3 ghosted slots).
 * Inspired by the scattered-photo treatment on the YC retros homepage; adapted
 * to our editorial palette + square corners.
 */

// Static rotation classes so Tailwind picks them up at build time.
// Pick one deterministically per doc id below.
const TILTS = [
  '-rotate-3',
  '-rotate-2',
  '-rotate-1',
  'rotate-1',
  'rotate-2',
  'rotate-3',
] as const;

function tiltFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return TILTS[Math.abs(h) % TILTS.length];
}

export default function DocumentPolaroids({
  documents,
}: {
  documents: DocumentItem[];
}) {
  // Sort in the canonical kit order (Concept Note → Pitch Deck) regardless of
  // how the data arrives.
  const order = DOC_TYPES.map((t) => t.key);
  const items = [...documents]
    .filter((d) => order.includes(d.docType as DocTypeKey))
    .sort(
      (a, b) =>
        order.indexOf(a.docType as DocTypeKey) -
        order.indexOf(b.docType as DocTypeKey),
    )
    .map((d) => ({
      ...d,
      label:
        DOC_TYPES.find((t) => t.key === d.docType)?.label ?? d.docType,
    }));

  if (items.length === 0) {
    return (
      <p className="text-sm text-foreground/55 italic">
        No documents have been added to this entry yet.
      </p>
    );
  }

  // Split items into rows so 4–6 docs read as two stacked rows (with the
  // second row visually centered under the first), not a single long line.
  // 4 → 2+2, 5 → 3+2, 6 → 3+3, 1–3 → single row.
  const rowSizes = ((n: number) => {
    if (n <= 3) return [n];
    if (n === 4) return [2, 2];
    if (n === 5) return [3, 2];
    return [3, 3];
  })(items.length);

  let cursor = 0;
  const rows = rowSizes.map((size) => {
    const slice = items.slice(cursor, cursor + size).map((doc, i) => ({
      ...doc,
      globalIdx: cursor + i,
    }));
    cursor += size;
    return slice;
  });

  return (
    <div className="flex flex-col items-center gap-y-12 py-6 md:py-10">
      {rows.map((row, rowIdx) => (
        <ul
          key={rowIdx}
          className="flex flex-wrap justify-center items-start gap-x-8 gap-y-12"
        >
          {row.map((doc) => {
            const tilt = tiltFor(doc.id);
            return (
              <Reveal as="li" key={doc.id} delay={Math.min(doc.globalIdx * 80, 480)}>
                <a
                  href={doc.cloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Open ${doc.label} (${doc.fileName})`}
                  className={[
                    'group block transition-all duration-300',
                    tilt,
                    'hover:rotate-0 hover:scale-[1.04]',
                  ].join(' ')}
                >
                  {/* Polaroid card */}
                  <div className="bg-paper border border-foreground/15 shadow-md group-hover:shadow-lg p-4 pb-5 w-[240px] md:w-[280px]">
                    {/* Page area — count strip on top, big label centered. */}
                    <div className="aspect-[3/4] bg-background border border-foreground/10 p-4 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="num text-[9px] uppercase tracking-[0.22em] font-semibold text-foreground/35">
                          {String(doc.globalIdx + 1).padStart(2, '0')} /{' '}
                          {items.length}
                        </span>
                        <span className="text-[8px] uppercase tracking-[0.22em] font-semibold text-accent">
                          PDF
                        </span>
                      </div>

                      {/* Label centered in the card, broken to 2 lines. */}
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-center font-black tracking-[-0.02em] leading-[1.05] text-foreground text-2xl md:text-3xl">
                          {labelTwoLines(doc.label).map((line, i) => (
                            <span key={i} className="block">
                              {line}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </ul>
      ))}
    </div>
  );
}

function labelTwoLines(label: string): string[] {
  // Split the doc label across (up to) two lines. Multi-word labels split
  // roughly in half by word count; single-word labels stay on one line.
  const words = label.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [label];
  if (words.length === 2) return words;
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}
