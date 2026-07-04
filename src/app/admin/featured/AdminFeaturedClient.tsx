"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Plus, X } from "lucide-react";

interface Article {
  id: string;
  title: string;
  isFeatured: boolean;
  likeCount: number;
  user: { displayName: string };
  _count: { likes: number };
}

interface Props {
  featured: Article[];
  candidates: Article[];
}

export function AdminFeaturedClient({ featured, candidates }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function toggle(articleId: string, isFeatured: boolean) {
    setLoading(articleId);
    await fetch(`/api/admin/articles/${articleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured }),
    });
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">編集部ピックアップ管理</h1>
      <p className="text-sm text-gray-400 mb-8">トップページの特集枠に表示される記事を管理します</p>

      {/* 現在の特集 */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 mb-4">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          現在の特集記事（{featured.length}件）
        </h2>
        {featured.length === 0 ? (
          <p className="text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center">
            特集記事がまだありません。下から追加してください。
          </p>
        ) : (
          <div className="space-y-2">
            {featured.map((a) => (
              <div key={a.id} className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400">{a.user.displayName} · ❤ {a.likeCount}</p>
                </div>
                <button
                  onClick={() => toggle(a.id, false)}
                  disabled={loading === a.id}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 text-amber-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 候補記事 */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-4">特集候補（人気順）</h2>
        <div className="space-y-2">
          {candidates.map((a) => (
            <div key={a.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{a.title}</p>
                <p className="text-xs text-gray-400">{a.user.displayName} · ❤ {a.likeCount}</p>
              </div>
              <button
                onClick={() => toggle(a.id, true)}
                disabled={loading === a.id}
                className="flex-shrink-0 flex items-center gap-1 text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                特集に追加
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
