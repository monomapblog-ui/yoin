"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, EyeOff } from "lucide-react";

interface Props {
  articleId: string;
  isFeatured: boolean;
}

export function AdminArticleActions({ articleId, isFeatured }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleFeatured() {
    setLoading(true);
    await fetch(`/api/admin/articles/${articleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    });
    router.refresh();
    setLoading(false);
  }

  async function unpublish() {
    if (!confirm("この記事を非公開にしますか？")) return;
    setLoading(true);
    await fetch(`/api/admin/articles/${articleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PRIVATE" }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={toggleFeatured}
        disabled={loading}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors disabled:opacity-50 ${
          isFeatured
            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        <Star className={`w-3 h-3 ${isFeatured ? "fill-amber-400" : ""}`} />
        {isFeatured ? "特集解除" : "特集"}
      </button>
      <button
        onClick={unpublish}
        disabled={loading}
        className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
      >
        <EyeOff className="w-3 h-3" />
        非公開
      </button>
    </div>
  );
}
