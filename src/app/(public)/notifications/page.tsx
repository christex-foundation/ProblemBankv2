import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect('/signin?callbackUrl=/notifications');
  const userId = session.user.id;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`border rounded p-3 ${n.read ? '' : 'bg-blue-50 border-blue-200'}`}
            >
              {n.link ? (
                <Link href={n.link} className="block">
                  <p className="font-medium">{n.title}</p>
                  {n.body && <p className="text-sm text-gray-700 mt-1">{n.body}</p>}
                </Link>
              ) : (
                <>
                  <p className="font-medium">{n.title}</p>
                  {n.body && <p className="text-sm text-gray-700 mt-1">{n.body}</p>}
                </>
              )}
              <p className="text-xs text-gray-400 mt-1">{n.createdAt.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
