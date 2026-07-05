export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Bookmark } from "lucide-react";
import type { ArticleWithAuthor } from "@/types";

export const metadata = { title: "ブックマーク" };

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/bookmarks");

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      article: {
        select: {
          id: true, title: true, summary: true, thumbnailUrl: true,
          pricePt: true, viewCount: true, likeCount: true, publishedAt: true,
          status: true,
          user: { select: { id: true, displayName: true, avatarUrl: true } },
          tags: { select: { tag: { select: { id: true, name: true, slug: true, category: true } } } },
          _count: { select: { purchases: true } },
        },
      },
    },
  });

  const articles = bookmarks
    .filter((b) => b.article.status === "PUBLISHED")
    .map((b) => b.article) as unknown as ArticleWithAuthor[];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Bookmark className="w-5 h-5 text-amber-500" />
        <h1 className="text-xl font-bold text-gray-900">ブックマーク</h1>
        <span className="text-sm text-gray-400 ml-1">{articles.length}件</span>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">🔖</p>
          <p>ブックマークした記事がありません</p>
          <Link href="/" className="mt-4 inline-block text-teal-600 hover:underline text-sm">
            記事を探す →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
