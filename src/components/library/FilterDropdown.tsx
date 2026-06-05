'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export interface FilterOption {
  /** Empty string represents the "any/all" default. */
  value: string;
  label: string;
  href: string;
}

interface Props {
  label: string;
  /** Empty string when no filter is applied. */
  active: string;
  options: FilterOption[];
}

/**
 * Editorial filter dropdown. Renders a small caps button that reveals a
 * paper-surface panel of options. Hrefs are precomputed by the server-side
 * parent so this component stays presentational (only owns open/close state).
 */
export function FilterDropdown({ label, active, options }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const activeOption =
    options.find((o) => o.value === active) ?? options[0];
  const isFiltered = Boolean(active);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-baseline gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold py-2 transition-soft hover:text-accent focus-visible:outline-none focus-visible:text-accent focus-visible:underline underline-offset-4"
      >
        <span className="text-foreground/45">{label}</span>
        <span className={isFiltered ? 'text-accent' : 'text-foreground'}>
          {activeOption.label}
        </span>
        <span
          aria-hidden
          className={`inline-block text-[8px] text-foreground/40 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full mt-2 min-w-[220px] max-h-[60vh] overflow-y-auto bg-paper border border-foreground/20 shadow-sm z-20"
        >
          {options.map((opt) => {
            const isActive = opt.value === active;
            return (
              <li
                key={opt.value || '__default__'}
                role="option"
                aria-selected={isActive}
              >
                <Link
                  href={opt.href}
                  scroll={false}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 text-[11px] uppercase tracking-[0.22em] font-semibold transition-soft border-b border-foreground/10 last:border-b-0 ${
                    isActive
                      ? 'text-accent'
                      : 'text-foreground/75 hover:text-foreground hover:bg-foreground/[0.04]'
                  }`}
                >
                  {opt.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
