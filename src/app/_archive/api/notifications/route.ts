import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import type { NotificationRow } from '@/types/database';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ notifications: [], unread: 0 });
  }
  const userId = session.user.id;
  const supabase = getSupabase();

  const [{ data: rows }, { count }] = await Promise.all([
    supabase
      .from('Notification')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(50),
    supabase
      .from('Notification')
      .select('id', { count: 'exact', head: true })
      .eq('userId', userId)
      .eq('read', false),
  ]);

  const notifications = ((rows ?? []) as NotificationRow[]).map((n) => ({
    ...n,
    createdAt: n.createdAt,
  }));
  return NextResponse.json({ notifications, unread: count ?? 0 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const supabase = getSupabase();

  if (id) {
    await supabase
      .from('Notification')
      .update({ read: true } as never)
      .eq('id', id)
      .eq('userId', userId);
  } else {
    await supabase
      .from('Notification')
      .update({ read: true } as never)
      .eq('userId', userId)
      .eq('read', false);
  }

  return NextResponse.json({ ok: true });
}
