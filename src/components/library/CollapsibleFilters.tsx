'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Eyebrow } from '@/design/typography';

/**
 * Filter row for the library shelf. At 1024px and below the dropdowns
 * collapse behind a "Filters" toggle on the right of the row label; above
 * 1024px they render inline and the toggle disappears. The dropdowns are
 * server-rendered and passed in as children so this component only owns
 * the open/closed state, mirroring FilterDropdown.
 */
export function CollapsibleFilters({
  activeCount = 0,
  children,
}: {
  /** Number of applied filters, shown beside the toggle while collapsed. */
  activeCount?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid grid-cols-12 gap-6 md:gap-10 pt-5 md:pt-6">
      <div className="col-span-12 min-[1025px]:col-span-2 flex items-baseline justify-between gap-4">
        <Eyebrow tone="muted" size="sm">
          Filter the shelf
        </Eyebrow>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="shelf-filters"
          className="min-[1025px]:hidden flex items-baseline gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold transition-soft hover:text-accent focus-visible:outline-none focus-visible:text-accent focus-visible:underline underline-offset-4"
        >
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="num text-accent">{activeCount}</span>
          )}
          <span
            aria-hidden
            className={`inline-block text-[8px] text-foreground/40 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </button>
      </div>

      <div
        id="shelf-filters"
        className={`col-span-12 min-[1025px]:col-span-10 ${
          open ? '' : 'max-[1024px]:hidden'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 wide:grid-cols-4 items-baseline justify-items-center gap-x-6 wide:gap-x-10 gap-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}
