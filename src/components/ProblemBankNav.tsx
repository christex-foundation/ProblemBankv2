import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import NotificationsBell from '@/components/NotificationsBell';

export default async function ProblemBankNav() {
  const session = await auth();

  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold">
          Problem Bank
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/library" className="hover:underline">
            Library
          </Link>
          <Link href="/feed" className="hover:underline">
            Feed
          </Link>
          <NotificationsBell />
          {session?.user ? (
            <>
              <Link
                href={`/builders/${session.user.id}`}
                className="hover:underline"
              >
                Profile
              </Link>
              {session.user.role === 'admin' && (
                <Link
                  href="/admin/dashboard"
                  className="hover:underline text-gray-600"
                >
                  Admin
                </Link>
              )}
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button type="submit" className="text-gray-600 hover:underline">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/signin" className="bg-black text-white rounded px-3 py-1.5">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
