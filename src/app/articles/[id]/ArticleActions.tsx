"use client";

import { useState } from "react";
import { Heart, Bookmark, Share2, Pencil } from "lucide-react";
import Link from "next/link";

interface ArticleActionsProps {
  articleId: string;
  likeCount: number;
  isOwner: boolean;
}

export function ArticleActions({ articleId, likeCount: initialLikeCount, isOwner }: ArticleActionsProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  async function toggleLike() {
    const res = await fetch(`/api/articles/${articleId}/like`, { method: liked ? "DELETE" : "POST" });
    if (res.ok) {
      setLiked(!liked);
      setLikeCount((c) => c + (liked ? -1 : 1));
    }
  }

  async function toggleBookmark() {
    const res = await fetch(`/api/articles/${articleId}/bookmark`, { method: bookmarked ? "DELETE" : "POST" });
    if (res.ok) setBookmarked(!bookmarked);
  }

  function share() {
    if (navigator.share) {
      navigator.share({ url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("URLをコピーしました");
    }
  }

  return (
    <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
            liked ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          {likeCount}
        </button>

        <button
          onClick={toggleBookmark}
          className={`p-2 rounded-full transition-colors ${
            bookmarked ? "bg-amber-50 text-amber-500" : "bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-500"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
        </button>

        <button
          onClick={share}
          className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {isOwner && (
        <Link
          href={`/write/${articleId}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Pencil className="w-4 h-4" />
          編集
        </Link>
      )}
    </div>
  );
}
