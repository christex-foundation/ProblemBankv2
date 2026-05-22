import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/signin?callbackUrl=/admin/dashboard');
  }
  if (session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r p-4 bg-gray-50 shrink-0">
        <h2 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-600">
          Admin
        </h2>
        <nav className="space-y-1 text-sm">
          <Link
            href="/admin/dashboard"
            className="block px-2 py-1.5 rounded hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/submissions"
            className="block px-2 py-1.5 rounded hover:bg-gray-100"
          >
            Submissions
          </Link>
          <Link
            href="/admin/library"
            className="block px-2 py-1.5 rounded hover:bg-gray-100"
          >
            Library
          </Link>
        </nav>
        <div className="mt-8 pt-4 border-t text-xs text-gray-500">
          <p>Signed in as</p>
          <p className="font-medium text-gray-700 truncate">
            {session.user.email}
          </p>
        </div>
      </aside>
      <main className="flex-1 p-8 max-w-6xl">{children}</main>
    </div>
  );
}
