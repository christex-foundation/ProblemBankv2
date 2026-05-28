import Link from 'next/link';

type ActiveKey = 'library' | 'feed' | null;

/**
 * Slim top nav used by /library, /library/[slug], and /feed. Matches the
 * placeholder nav on the landing page so the design system reads as one
 * product across routes. No auth, no bell — those are wired up in the
 * production app's ProblemBankNav. Pass `active` to mark the current route.
 */
export function LibraryNav({ active = 'library' }: { active?: ActiveKey } = {}) {
  const linkBase = 'transition-soft';
  const inactive = 'text-foreground/55 hover:text-foreground';
  const activeCls = 'text-foreground font-semibold';

  return (
    <nav className="sticky top-0 z-30 border-b border-foreground/10 bg-background/80 backdrop-blur-sm">
      <div className="px-6 md:px-10 py-4 flex items-center justify-between max-w-[1300px] mx-auto w-full">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.28em] font-semibold"
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
          <Link
            href="/feed"
            className={`${linkBase} ${active === 'feed' ? activeCls : inactive}`}
            aria-current={active === 'feed' ? 'page' : undefined}
          >
            Feed
          </Link>
          <Link
            href="/signin"
            className="px-3 py-1.5 border border-foreground font-semibold hover:bg-foreground hover:text-background transition-soft"
          >
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}
