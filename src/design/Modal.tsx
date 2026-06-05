'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Accessible modal shell. Provides the behavior every dialog needs and that
 * the hand-built modals were missing: focus moves into the dialog on open,
 * Tab is trapped inside it, focus is restored to the trigger on close, Escape
 * closes, and body scroll is locked. Roles (dialog / aria-modal /
 * aria-labelledby) are wired here.
 *
 * Presentation is left to the caller via className props so each modal keeps
 * its own surface/size/position; this primitive only owns behavior + roles.
 */

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({
  onClose,
  labelledBy,
  children,
  /** Panel surface/size classes. */
  className,
  /** Backdrop classes (opacity/blur). */
  overlayClassName,
  /** Outer positioning container classes (flex/z-index/padding). */
  containerClassName,
  closeAriaLabel = 'Close',
}: {
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  containerClassName?: string;
  closeAriaLabel?: string;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const prevFocused = document.activeElement as HTMLElement | null;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) {
        // Nothing focusable: keep focus on the panel.
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog on open.
    const focusables = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
    (focusables && focusables.length ? focusables[0] : panel)?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      // Restore focus to whatever opened the modal.
      prevFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className={containerClassName}
    >
      <button
        type="button"
        aria-label={closeAriaLabel}
        onClick={onClose}
        className={overlayClassName}
      />
      <div ref={panelRef} tabIndex={-1} className={className}>
        {children}
      </div>
    </div>
  );
}
