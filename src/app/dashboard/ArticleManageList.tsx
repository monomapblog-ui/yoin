"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Heart, ShoppingBag, Pencil, Trash2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  status: string;
  pricePt: number;
  viewCount: number;
  likeCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  _count: { purchases: number };
}

interface Props {
  articles: Article[];
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
}

export function ArticleManageList({ articles: initialArticles }: Props) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(articleId: string, title: string) {
    if (!confirm(`「${title}」を削除しますか？\nこの操作は取り消せません。`)) return;
    setDeleting(articleId);
    const res = await fetch(`/api/articles/${articleId}`, { method: "DELETE" });
    if (res.ok) {
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    } else {
      alert("削除に失敗しました");
    }
    setDeleting(null);
    router.refresh();
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="mb-3">まだ記事がありません</p>
        <Link href="/write" className="text-teal-600 hover:underline text-sm">最初の記事を書く →</Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {articles.map((article) => (
        <div key={article.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                article.status === "PUBLISHED" ? "bg-teal-50 text-teal-600" :
                article.status === "DRAFT"     ? "bg-gray-100 text-gray-500" :
                                                  "bg-red-50 text-red-500"
              }`}>
                {article.status === "PUBLISHED" ? "公開中" : article.status === "DRAFT" ? "下書き" : "非公開"}
              </span>
              {article.pricePt > 0 && (
                <span className="text-xs text-amber-600 font-medium">{article.pricePt}pt</span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-800 truncate">{article.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(article.publishedAt ?? article.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{article.viewCount}</span>
            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{article.likeCount}</span>
            <span className="flex items-center gap-1"><ShoppingBag className="w-3.5 h-3.5" />{article._count.purchases}</span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Link
              href={`/write/${article.id}`}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => handleDelete(article.id, article.title)}
              disabled={deleting === article.id}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
