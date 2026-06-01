import Link from 'next/link';
import { auth } from '@/lib/auth';
import { UserMenu } from '@/components/UserMenu';

type ActiveKey = 'library' | 'feed' | null;

export async function LibraryNav({
  active = 'library',
}: { active?: ActiveKey } = {}) {
  const session = await auth();
  const user = session?.user;

  const linkBase = 'transition-soft';
  const inactive = 'text-foreground/55 hover:text-foreground';
  const activeCls = 'text-foreground font-semibold';
  const pillCls =
    'px-3 py-1.5 border border-foreground font-semibold hover:bg-foreground hover:text-background transition-soft';

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
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/signin" className={pillCls}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
