"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

interface Actor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

interface NotifData {
  id: string;
  type: string;
  refId: string | null;
  message: string | null;
  readAt: string | null;
  createdAt: string;
  actor: Actor | null;
}

const TYPE_LABEL: Record<string, string> = {
  LIKE: "があなたの記事にいいねしました",
  COMMENT: "がコメントしました",
  FOLLOW: "があなたをフォローしました",
  PURCHASE: "が記事を購入しました",
  WITHDRAWAL: "出金申請のステータスが更新されました",
};

function notifUrl(n: NotifData): string {
  if (n.type === "FOLLOW" && n.refId) return `/${n.refId}`;
  if (n.refId) return `/articles/${n.refId}`;
  return "/notifications";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "今";
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

export function NotificationBell() {
  const [notifs, setNotifs] = useState<NotifData[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.readAt).length;

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.ok ? r.json() : [])
      .then(setNotifs)
      .catch(() => {});
  }, []);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="通知"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-900">通知</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-teal-600 hover:underline">
                すべて既読
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">通知はありません</div>
            ) : (
              notifs.slice(0, 15).map((n) => (
                <Link
                  key={n.id}
                  href={notifUrl(n)}
                  onClick={() => { markRead(n.id); setOpen(false); }}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                    !n.readAt ? "bg-teal-50/40" : ""
                  }`}
                >
                  {n.actor ? (
                    <Avatar src={n.actor.avatarUrl} name={n.actor.displayName} size="sm" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">
                      {n.actor && <strong>{n.actor.displayName}</strong>}
                      {TYPE_LABEL[n.type] ?? ""}
                    </p>
                    {n.message && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">「{n.message}」</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.readAt && (
                    <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1" />
                  )}
                </Link>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-100">
            <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs text-teal-600 hover:underline">
              すべての通知を見る →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
