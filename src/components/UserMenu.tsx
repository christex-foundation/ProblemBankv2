'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { initialsFrom } from '@/lib/initials';

type MenuUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

const itemCls =
  'block w-full text-left px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-foreground/70 hover:bg-foreground hover:text-background transition-soft';

/**
 * Signed-in account control: an initials avatar that reveals a menu
 * (Profile, Sign out). Opens on tap/click (works on touch) and on hover
 * (desktop); a short close delay keeps the menu reachable across the gap, and
 * outside-click or Escape closes it. Shared by every nav.
 */
export function UserMenu({ user }: { user: MenuUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }
  function openNow() {
    cancelClose();
    setOpen(true);
  }
  // Delay close so moving the cursor from avatar into the menu doesn't dismiss it.
  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Clear any pending timer on unmount.
  useEffect(() => cancelClose, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu${user.name ? ` for ${user.name}` : ''}`}
        onClick={openNow}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-background text-[11px] font-semibold normal-case tracking-normal hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground transition-soft"
      >
        {initialsFrom(user.name, user.email)}
      </button>

      {open && (
        /* pt-2 (not mt-2) keeps the avatar-to-menu gap inside the hover area. */
        <div role="menu" className="absolute right-0 top-full pt-2 w-48 z-40">
          <div className="border border-foreground/15 bg-background shadow-card">
            <div className="px-3 py-2.5 border-b border-foreground/10">
              <div className="text-[11px] font-semibold text-foreground truncate normal-case tracking-normal">
                {user.name ?? 'Your account'}
              </div>
              {user.email && (
                <div className="text-[10px] text-foreground/50 truncate normal-case tracking-normal">
                  {user.email}
                </div>
              )}
            </div>

            <Link
              href={`/builders/${user.id}`}
              role="menuitem"
              className={itemCls}
              onClick={() => setOpen(false)}
            >
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ redirectTo: '/' })}
              className={itemCls}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
