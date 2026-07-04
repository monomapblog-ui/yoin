import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateShort, readingTime, stripHtml } from "@/lib/utils";
import { Heart, Lock } from "lucide-react";
import type { ArticleWithAuthor } from "@/types";

interface ArticleCardProps {
  article: ArticleWithAuthor;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const isPaid = article.pricePt > 0;
  const areaTag = article.tags.find((t) => t.tag.category === "AREA");
  const serviceTag = article.tags.find((t) => t.tag.category === "SERVICE");

  return (
    <article className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/articles/${article.id}`}>
        {/* Thumbnail */}
        <div className="relative aspect-[1.91/1] bg-gray-100 overflow-hidden">
          {article.thumbnailUrl ? (
            <Image
              src={article.thumbnailUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
              <span className="text-4xl">📝</span>
            </div>
          )}
          {isPaid && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3" />
              {article.pricePt}pt
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Tags */}
          {(areaTag || serviceTag) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {areaTag && (
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {areaTag.tag.name}
                </span>
              )}
              {serviceTag && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {serviceTag.tag.name}
                </span>
              )}
            </div>
          )}

          <h2 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors">
            {article.title}
          </h2>

          {article.summary && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {article.summary}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 mt-auto">
            <Avatar src={article.user.avatarUrl} name={article.user.displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{article.user.displayName}</p>
              <p className="text-xs text-gray-400">
                {article.publishedAt ? formatDateShort(article.publishedAt) : ""}
                {" · "}
                約{readingTime(article.summary ?? "")}分
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Heart className="w-3.5 h-3.5" />
              {article.likeCount}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
