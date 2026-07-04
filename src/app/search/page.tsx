export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { SearchForm } from "./SearchForm";
import type { ArticleWithAuthor } from "@/types";
import type { Metadata } from "next";

interface Props {
  searchParams: Promise<{ q?: string; area?: string; service?: string; sort?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `「${q}」の検索結果` : "記事を検索" };
}

async function getAreaTags() {
  return prisma.tag.findMany({
    where: { category: "AREA" },
    orderBy: { articles: { _count: "desc" } },
    take: 30,
  });
}

async function getServiceTags() {
  return prisma.tag.findMany({
    where: { category: "SERVICE" },
    orderBy: { articles: { _count: "desc" } },
    take: 20,
  });
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, area, service, sort = "new" } = await searchParams;

  const [areaTags, serviceTags] = await Promise.all([getAreaTags(), getServiceTags()]);

  const hasFilter = !!(q || area || service);

  const articles = hasFilter
    ? (await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          ...(q && {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { summary: { contains: q, mode: "insensitive" } },
            ],
          }),
          ...(area && { tags: { some: { tag: { slug: area } } } }),
          ...(service && { tags: { some: { tag: { slug: service } } } }),
        },
        orderBy:
          sort === "popular" ? { viewCount: "desc" }
          : sort === "selling" ? { purchases: { _count: "desc" } }
          : { publishedAt: "desc" },
        take: 24,
        select: {
          id: true, title: true, summary: true, thumbnailUrl: true,
          pricePt: true, viewCount: true, likeCount: true, publishedAt: true,
          user: { select: { id: true, displayName: true, avatarUrl: true } },
          tags: { select: { tag: { select: { id: true, name: true, slug: true, category: true } } } },
          _count: { select: { purchases: true } },
        },
      }) as unknown as ArticleWithAuthor[])
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 検索フォーム */}
      <SearchForm initialQ={q} initialArea={area} initialService={service} initialSort={sort} />

      {/* エリアタグ */}
      <div className="mt-6 mb-2">
        <p className="text-xs text-gray-400 mb-2 font-medium tracking-wide uppercase">エリア</p>
        <div className="flex flex-wrap gap-1.5">
          {areaTags.map((tag) => (
            <a
              key={tag.id}
              href={`/search?area=${tag.slug}`}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                area === tag.slug
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-600"
              }`}
            >
              {tag.name}
            </a>
          ))}
        </div>
      </div>

      {/* サービスタグ */}
      <div className="mt-4 mb-8">
        <p className="text-xs text-gray-400 mb-2 font-medium tracking-wide uppercase">サービス</p>
        <div className="flex flex-wrap gap-1.5">
          {serviceTags.map((tag) => (
            <a
              key={tag.id}
              href={`/search?service=${tag.slug}`}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                service === tag.slug
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {tag.name}
            </a>
          ))}
        </div>
      </div>

      {/* 結果 */}
      {hasFilter ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {q && <><strong className="text-gray-800">「{q}」</strong>の検索結果</>}
              {area && <><strong className="text-gray-800">{areaTags.find(t => t.slug === area)?.name}</strong>の記事</>}
              {service && <><strong className="text-gray-800">{serviceTags.find(t => t.slug === service)?.name}</strong>の記事</>}
              　{articles.length}件
            </p>

            {/* ソート */}
            <div className="flex gap-1">
              {[{ value: "new", label: "新着" }, { value: "popular", label: "人気" }, { value: "selling", label: "売れている" }].map((s) => (
                <a
                  key={s.value}
                  href={`/search?${new URLSearchParams({ ...(q ? { q } : {}), ...(area ? { area } : {}), ...(service ? { service } : {}), sort: s.value })}`}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                    sort === s.value ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-4">🔍</p>
              <p>該当する記事が見つかりませんでした</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">キーワードまたはエリア・サービスを選んで検索</p>
        </div>
      )}
    </div>
  );
}
