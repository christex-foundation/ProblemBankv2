'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { DOC_TYPES, type DocTypeKey } from '@/lib/enums';
import { Eyebrow } from '@/design/typography';

interface DocumentItem {
  id: string;
  docType: string;
  cloudinaryUrl: string;
  fileName: string;
}

/**
 * Six-tab document switcher for a Library entry's PDF kit. Follows the
 * design/COMPONENTS.md §5 spec: uppercase eyebrow tabs, 2px accent underline
 * on active, hairline hover on inactive, disabled state for missing docs,
 * arrow-key navigation, ARIA tablist semantics.
 */
export default function DocumentTabs({
  documents,
}: {
  documents: DocumentItem[];
}) {
  const byType = new Map(documents.map((d) => [d.docType, d]));
  const firstAvailable =
    (DOC_TYPES.find((t) => byType.has(t.key))?.key as DocTypeKey | undefined) ??
    'concept_note';
  const [active, setActive] = useState<DocTypeKey>(firstAvailable);
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const current = byType.get(active);
  const activeMeta = DOC_TYPES.find((t) => t.key === active);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const enabled = DOC_TYPES.filter((t) => byType.has(t.key));
      const idx = enabled.findIndex((t) => t.key === active);
      if (idx === -1) return;
      const nextIdx =
        e.key === 'ArrowRight'
          ? (idx + 1) % enabled.length
          : (idx - 1 + enabled.length) % enabled.length;
      const nextKey = enabled[nextIdx].key as DocTypeKey;
      setActive(nextKey);
      tabRefs.current[nextKey]?.focus();
    },
    [active, byType],
  );

  return (
    <section className="my-12">
      <Eyebrow tone="muted" size="sm" className="mb-4">
        Documents
      </Eyebrow>

      <div
        role="tablist"
        aria-label="Documents in this Library entry"
        className="flex overflow-x-auto border-b border-foreground/15 -mx-1 snap-x"
      >
        {DOC_TYPES.map((t) => {
          const present = byType.has(t.key);
          const isActive = active === t.key;
          const tabId = `${baseId}-tab-${t.key}`;
          const panelId = `${baseId}-panel-${t.key}`;
          return (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[t.key] = el;
              }}
              id={tabId}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              disabled={!present}
              onClick={() => present && setActive(t.key as DocTypeKey)}
              onKeyDown={onKeyDown}
              className={[
                'mx-1 px-4 py-3 text-[11px] uppercase tracking-[0.22em] font-semibold whitespace-nowrap snap-start border-b-2 transition-soft',
                isActive
                  ? 'text-foreground border-accent'
                  : 'border-transparent',
                present && !isActive
                  ? 'text-foreground/55 hover:text-foreground hover:border-foreground/30'
                  : '',
                !present ? 'text-foreground/30 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${active}`}
        aria-labelledby={`${baseId}-tab-${active}`}
        tabIndex={0}
        className="border border-t-0 border-foreground/15 bg-paper p-6 md:p-8"
      >
        {current && activeMeta ? (
          <div className="flex flex-col gap-5">
            <div>
              <Eyebrow tone="accent" size="sm">
                {activeMeta.label}
              </Eyebrow>
              <p className="mt-2 text-sm text-foreground/55 break-all">
                {current.fileName}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={current.cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 text-[11px] uppercase tracking-[0.28em] font-semibold border border-foreground text-foreground transition-soft hover:bg-foreground hover:text-background"
              >
                Open
              </a>
              <a
                href={current.cloudinaryUrl}
                download={current.fileName}
                className="inline-flex items-center justify-center px-6 py-3 text-[11px] uppercase tracking-[0.28em] font-semibold bg-foreground text-background transition-soft hover:bg-accent"
              >
                Download
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/55">Document not available.</p>
        )}
      </div>
    </section>
  );
}
