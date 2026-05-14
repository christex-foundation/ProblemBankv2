import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ notifications: [], unread: 0 });
  }
  const userId = session.user.id;

  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
    unread,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (id) {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  } else {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  return NextResponse.json({ ok: true });
}
