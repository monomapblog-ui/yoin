"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Bell, Heart, MessageCircle, UserPlus, ShoppingBag, Banknote } from "lucide-react";
import Link from "next/link";

interface Actor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

interface NotifItem {
  id: string;
  type: string;
  refId: string | null;
  message: string | null;
  readAt: Date | null;
  createdAt: Date;
  actor: Actor | null;
}

interface Props {
  notifications: NotifItem[];
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  LIKE:       { label: "があなたの記事にいいねしました",     icon: Heart,        color: "text-red-500",    bg: "bg-red-50" },
  COMMENT:    { label: "がコメントしました",                icon: MessageCircle, color: "text-blue-500",   bg: "bg-blue-50" },
  FOLLOW:     { label: "があなたをフォローしました",         icon: UserPlus,     color: "text-teal-500",   bg: "bg-teal-50" },
  PURCHASE:   { label: "が記事を購入しました",              icon: ShoppingBag,   color: "text-amber-500",  bg: "bg-amber-50" },
  WITHDRAWAL: { label: "出金申請のステータスが更新されました", icon: Banknote,     color: "text-purple-500", bg: "bg-purple-50" },
};

function notifUrl(n: NotifItem): string {
  if (n.type === "FOLLOW" && n.refId) return `/${n.actor?.displayName ?? n.refId}`;
  if (n.refId) return `/articles/${n.refId}`;
  return "/notifications";
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "今";
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}日前`;
  return new Date(date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export function NotificationsClient({ notifications }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Bell className="w-6 h-6 text-teal-500" />
        <h1 className="text-2xl font-bold text-gray-900">通知</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>通知はまだありません</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <Link
                key={n.id}
                href={notifUrl(n)}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${
                  !n.readAt ? "bg-teal-50/30" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  {n.actor ? (
                    <Avatar src={n.actor.avatarUrl} name={n.actor.displayName} size="md" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-200" />
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${cfg.bg} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-3 h-3 ${cfg.color}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">
                    {n.actor && <strong className="font-semibold">{n.actor.displayName}</strong>}
                    {cfg.label}
                  </p>
                  {n.message && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">「{n.message}」</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.readAt && (
                  <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
