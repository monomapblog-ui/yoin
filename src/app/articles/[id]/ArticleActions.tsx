"use client";

import { useState } from "react";
import { Heart, Bookmark, Share2, Pencil, Check } from "lucide-react";
import Link from "next/link";

interface ArticleActionsProps {
  articleId: string;
  likeCount: number;
  isOwner: boolean;
  initialLiked?: boolean;
  initialBookmarked?: boolean;
}

export function ArticleActions({ articleId, likeCount: initialLikeCount, isOwner, initialLiked = false, initialBookmarked = false }: ArticleActionsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [copied, setCopied] = useState(false);

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

  async function share() {
    if (navigator.share) {
      navigator.share({ url: window.location.href }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          title={bookmarked ? "ブックマーク済み" : "ブックマーク"}
          className={`p-2 rounded-full transition-colors ${
            bookmarked ? "bg-amber-50 text-amber-500" : "bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-500"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
        </button>

        <button
          onClick={share}
          title={copied ? "コピーしました" : "URLをコピー"}
          className={`p-2 rounded-full transition-colors ${copied ? "bg-green-50 text-green-500" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
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
