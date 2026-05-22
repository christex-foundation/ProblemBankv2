'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationsBell() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      // silent — bell just stays empty
    }
  }

  useEffect(() => {
    if (status === 'authenticated') void load();
  }, [status]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', onClick);
      return () => document.removeEventListener('mousedown', onClick);
    }
  }, [open]);

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' });
    setUnread(0);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  }

  async function clickNotif(n: Notification) {
    setOpen(false);
    if (!n.read) {
      await fetch(`/api/notifications?id=${n.id}`, { method: 'PATCH' });
      setUnread((u) => Math.max(0, u - 1));
    }
    if (n.link) router.push(n.link);
  }

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded hover:bg-gray-100"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow z-50">
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-semibold text-sm">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs underline">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {notifications.slice(0, 3).map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => clickNotif(n)}
                    className={`block w-full text-left p-3 border-b hover:bg-gray-50 ${
                      n.read ? '' : 'bg-blue-50'
                    }`}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center p-2 text-sm underline border-t"
          >
            See all
          </Link>
        </div>
      )}
    </div>
  );
}
