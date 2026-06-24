"use client";

import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type CareNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  profileName?: string;
  read: boolean;
  at: string;
};

export function NotificationBell({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<CareNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const markRead = async (id?: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : { all: true }),
    });
    await load();
  };

  const btnClass = dark
    ? "relative flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
    : "relative flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:bg-slate-50";

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className={btnClass}
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread > 0) markRead();
        }}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className={`absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border shadow-xl ${
            dark ? "border-white/10 bg-[#1e293b] text-white" : "border-[var(--border)] bg-white text-[var(--text-primary)]"
          }`}
        >
          <div className={`flex items-center justify-between border-b px-4 py-3 ${dark ? "border-white/10" : "border-[var(--border)]"}`}>
            <p className="text-sm font-bold">Notifications</p>
            {notifications.some((n) => !n.read) ? (
              <button type="button" className="text-xs font-semibold text-teal-500" onClick={() => markRead()}>
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className={`p-4 text-sm ${dark ? "text-slate-400" : "text-[var(--text-tertiary)]"}`}>
                No notifications yet. You&apos;ll be alerted when someone on your care team signs in or out of My Space.
              </p>
            ) : (
              notifications.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  className={`block w-full border-b px-4 py-3 text-left text-sm last:border-0 ${
                    dark ? "border-white/5 hover:bg-white/5" : "border-[var(--border)] hover:bg-slate-50"
                  } ${note.read ? "opacity-70" : ""}`}
                  onClick={() => markRead(note.id)}
                >
                  <p className="font-semibold">{note.title}</p>
                  <p className={`mt-0.5 text-xs ${dark ? "text-slate-400" : "text-[var(--text-secondary)]"}`}>
                    {note.message}
                  </p>
                  <p className={`mt-1 text-[10px] ${dark ? "text-slate-500" : "text-[var(--text-tertiary)]"}`}>
                    {new Date(note.at).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
