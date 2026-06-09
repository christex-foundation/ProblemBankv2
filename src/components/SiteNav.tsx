import Link from 'next/link';

type ActiveKey = 'library' | 'feed' | null;
type Variant = 'sticky' | 'overlay';

// `sticky` is the default top-of-page bar; `overlay` floats over a hero
// (e.g. the landing page) with a lighter scrim.
const wrapperByVariant: Record<Variant, string> = {
  sticky: 'sticky top-0 bg-background/80',
  overlay: 'absolute top-0 left-0 right-0 bg-background/60',
};

/**
 * Shared top nav: brand and the Library link. Used by every page so the nav
 * can't drift. Pass `active` to mark the current tab and `variant` to pick
 * sticky vs overlay.
 *
 * NOTE: the Feed link and the signed-in account menu / Sign in pill are
 * intentionally hidden from the UI for this milestone. The /feed and /signin
 * routes still work via direct URL; only the nav entry points are removed.
 */
export async function SiteNav({
  active = null,
  variant = 'sticky',
}: { active?: ActiveKey; variant?: Variant } = {}) {
  const linkBase = 'transition-soft';
  const inactive = 'text-foreground/55 hover:text-foreground';
  const activeCls = 'text-foreground font-semibold';

  return (
    <nav
      className={`${wrapperByVariant[variant]} z-30 border-b border-foreground/10 backdrop-blur-sm`}
    >
      <div className="px-6 md:px-10 py-4 flex items-center justify-between max-w-[1300px] mx-auto w-full">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.22em] font-semibold"
        >
          Problem Bank
        </Link>
        <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.22em]">
          <Link
            href="/library"
            className={`${linkBase} ${active === 'library' ? activeCls : inactive}`}
            aria-current={active === 'library' ? 'page' : undefined}
          >
            Library
          </Link>
        </div>
      </div>
    </nav>
  );
}
