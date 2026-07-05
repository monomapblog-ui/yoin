export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ChevronRight, TrendingUp, Clock, ShoppingBag, Star } from "lucide-react";
import type { ArticleWithAuthor } from "@/types";

const SORT_LABELS: Record<string, string> = {
  new: "新着",
  popular: "人気",
  selling: "今売れている",
};

async function getArticles(sort: string, take: number, area?: string): Promise<ArticleWithAuthor[]> {
  const orderBy =
    sort === "popular"
      ? { viewCount: "desc" as const }
      : sort === "selling"
      ? { purchases: { _count: "desc" as const } }
      : { publishedAt: "desc" as const };

  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(area ? { tags: { some: { tag: { slug: area } } } } : {}),
    },
    orderBy,
    take,
    select: {
      id: true,
      title: true,
      summary: true,
      thumbnailUrl: true,
      pricePt: true,
      viewCount: true,
      likeCount: true,
      publishedAt: true,
      user: { select: { id: true, displayName: true, avatarUrl: true } },
      tags: {
        select: {
          tag: { select: { id: true, name: true, slug: true, category: true } },
        },
      },
      _count: { select: { purchases: true } },
    },
  }) as unknown as ArticleWithAuthor[];
}

async function getAreaTags() {
  return prisma.tag.findMany({
    where: { category: "AREA" },
    orderBy: { articles: { _count: "desc" } },
    take: 20,
  });
}

async function getFeaturedArticles(): Promise<ArticleWithAuthor[]> {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      summary: true,
      thumbnailUrl: true,
      pricePt: true,
      viewCount: true,
      likeCount: true,
      publishedAt: true,
      user: { select: { id: true, displayName: true, avatarUrl: true } },
      tags: { select: { tag: { select: { id: true, name: true, slug: true, category: true } } } },
      _count: { select: { purchases: true } },
    },
  }) as unknown as ArticleWithAuthor[];
}

interface Props {
  searchParams: Promise<{ sort?: string; area?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { sort, area } = await searchParams;
  const areaTags = await getAreaTags();
  const activeArea = areaTags.find((t) => t.slug === area);

  if (sort || area) {
    const sortKey = sort ?? "new";
    const articles = await getArticles(sortKey, 24, area);

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <FilterNav areaTags={areaTags} currentSort={sortKey} currentArea={area} />

        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg text-gray-900">
            {activeArea ? `${activeArea.name}の記事` : SORT_LABELS[sortKey] ?? "記事一覧"}
          </h2>
          <span className="text-sm text-gray-400">{articles.length}件</span>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📝</p>
            <p>まだ記事がありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const [newArticles, popularArticles, sellingArticles, featuredArticles]: [
    ArticleWithAuthor[],
    ArticleWithAuthor[],
    ArticleWithAuthor[],
    ArticleWithAuthor[],
  ] = await Promise.all([
    getArticles("new", 6),
    getArticles("popular", 4),
    getArticles("selling", 4),
    getFeaturedArticles(),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-sm text-amber-800">
        本サイトは18歳以上を対象としたコンテンツを含みます。18歳未満の方のアクセスはご遠慮ください。
      </div>

      <FilterNav areaTags={areaTags} />

      {featuredArticles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              編集部ピックアップ
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredArticles.map((article) => (
              <div key={article.id} className="relative">
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-white" />
                  特集
                </div>
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-500" />
            新着記事
          </h2>
          <Link href="/?sort=new" className="text-sm text-teal-600 hover:underline flex items-center gap-1">
            もっと見る <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {newArticles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📝</p>
            <p>まだ記事がありません</p>
            <Link href="/write" className="mt-4 inline-block text-teal-600 hover:underline text-sm">最初の記事を書く →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {popularArticles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              人気記事
            </h2>
            <Link href="/?sort=popular" className="text-sm text-teal-600 hover:underline flex items-center gap-1">
              もっと見る <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {sellingArticles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              今売れている
            </h2>
            <Link href="/?sort=selling" className="text-sm text-teal-600 hover:underline flex items-center gap-1">
              もっと見る <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sellingArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {areaTags.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-bold text-base mb-4">エリアから探す</h2>
          <div className="flex flex-wrap gap-2">
            {areaTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/?area=${tag.slug}`}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-50 hover:bg-teal-50 hover:text-teal-700 border border-gray-200 hover:border-teal-300 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-gradient-to-r from-teal-600 to-cyan-500 rounded-2xl p-8 text-white text-center">
        <p className="text-teal-100 text-xs tracking-widest mb-2 uppercase">for writers</p>
        <h2 className="text-xl font-bold mb-2">あの余韻を、言葉にしてみませんか</h2>
        <p className="text-teal-100 text-sm mb-6">
          体験談を書いて収益を得られます。売上の85%があなたに還元されます。
        </p>
        <Link
          href="/auth/register"
          className="inline-block bg-white text-teal-600 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors"
        >
          無料で始める
        </Link>
      </section>
    </div>
  );
}

function FilterNav({
  areaTags,
  currentSort,
  currentArea,
}: {
  areaTags: { id: string; name: string; slug: string }[];
  currentSort?: string;
  currentArea?: string;
}) {
  const sortLinks = [
    { label: "すべて", href: "/" },
    { label: "新着", href: "/?sort=new" },
    { label: "人気", href: "/?sort=popular" },
    { label: "売れている", href: "/?sort=selling" },
  ];

  return (
    <section>
      <div className="flex flex-wrap gap-2">
        {sortLinks.map(({ label, href }) => {
          const isActive =
            label === "すべて"
              ? !currentSort && !currentArea
              : href === `/?sort=${currentSort}` && !currentArea;
          return (
            <Link
              key={label}
              href={href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white border-gray-200 hover:border-teal-400 hover:text-teal-600"
              }`}
            >
              {label}
            </Link>
          );
        })}
        <div className="w-px bg-gray-200 mx-1" />
        {areaTags.slice(0, 8).map((tag) => (
          <Link
            key={tag.id}
            href={`/?area=${tag.slug}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              currentArea === tag.slug
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white border-gray-200 hover:border-teal-400 hover:text-teal-600"
            }`}
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
