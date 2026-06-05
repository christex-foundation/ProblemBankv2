'use client';

import { type ReactNode } from 'react';
import { Eyebrow, Body } from '@/design/typography';
import { Modal } from '@/design/Modal';

/**
 * Modal shell for the "raise a problem" flow. Pure UI: client state in
 * RaiseModalProvider decides when this is mounted; closing calls back via
 * the onClose prop. No URL routing involved. Focus trap / Escape / scroll
 * lock / focus restore are handled by the shared Modal primitive.
 */
export function SubmitModal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal
      onClose={onClose}
      labelledBy="submit-modal-title"
      containerClassName="fixed inset-0 z-[70] flex items-stretch md:items-center justify-center px-0 md:px-6 py-0 md:py-10"
      overlayClassName="absolute inset-0 bg-foreground/45 backdrop-blur-sm cursor-default"
      className="relative z-10 w-full max-w-[760px] bg-background md:border md:border-foreground/15 md:shadow-xl flex flex-col max-h-screen md:max-h-[92vh] overflow-hidden"
    >
      {/* Top strip: eyebrow + X */}
      <div className="flex items-start justify-between gap-4 px-6 md:px-10 pt-6 md:pt-8">
        <Eyebrow tone="accent" size="sm">
          Raise a problem
        </Eyebrow>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 -mt-1 -mr-1 inline-flex w-9 h-9 items-center justify-center rounded-full text-foreground/55 hover:text-foreground hover:bg-foreground/[0.06] transition-soft"
        >
          <span aria-hidden className="text-xl leading-none">
            ×
          </span>
        </button>
      </div>

      {/* Hero + form, scrollable */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pt-6 md:pt-8 pb-10 md:pb-12">
        <h1
          id="submit-modal-title"
          className="font-black tracking-[-0.03em] leading-[0.95] text-[clamp(2rem,6vw,3.5rem)]"
        >
          Drop your idea.
        </h1>
        <Body size="md" tone="muted" className="mt-5 md:mt-6 max-w-[60ch]">
          No code needed. Add a short title for the card, then describe the problem and what
          a digital solution could look like.
        </Body>

        <div className="mt-10 md:mt-12">{children}</div>
      </div>
    </Modal>
  );
}
