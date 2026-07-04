export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDate, readingTime, stripHtml } from "@/lib/utils";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { Avatar } from "@/components/ui/Avatar";
import { ArticleActions } from "./ArticleActions";
import { PaywallGate } from "./PaywallGate";
import { Comments } from "./Comments";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

async function getArticle(id: string) {
  return prisma.article.findUnique({
    where: { id, status: "PUBLISHED" },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true, bio: true } },
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true, purchases: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary ?? stripHtml(article.body).slice(0, 140),
    openGraph: {
      title: article.title,
      description: article.summary ?? undefined,
      images: article.thumbnailUrl ? [article.thumbnailUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const [article, session] = await Promise.all([getArticle(id), auth()]);

  if (!article) notFound();

  const isOwner = session?.user?.id === article.userId;
  const isPaid = article.pricePt > 0;

  const hasPurchased = isPaid && session?.user?.id
    ? !!(await prisma.purchase.findUnique({
        where: { userId_articleId: { userId: session.user.id, articleId: id } },
      }))
    : false;

  const canReadFull = !isPaid || isOwner || hasPurchased;

  await prisma.article.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  const rawHtml = !canReadFull && article.previewPosition
    ? article.body.slice(0, article.previewPosition)
    : article.body;
  const previewHtml = sanitizeArticleHtml(rawHtml);

  const areaTag = article.tags.find((t) => t.tag.category === "AREA");
  const serviceTags = article.tags.filter((t) => t.tag.category === "SERVICE");
  const otherTags = article.tags.filter((t) => !["AREA", "SERVICE"].includes(t.tag.category));

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* パンくず */}
      <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-teal-600 transition-colors">トップ</Link>
        <span>/</span>
        {areaTag && (
          <>
            <Link href={`/?area=${areaTag.tag.slug}`} className="hover:text-teal-600 transition-colors">
              {areaTag.tag.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-600 truncate max-w-[200px]">{article.title}</span>
      </nav>

      {/* タグ */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {areaTag && (
          <Link href={`/?area=${areaTag.tag.slug}`}
            className="text-xs bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full hover:bg-teal-100 transition-colors">
            {areaTag.tag.name}
          </Link>
        )}
        {serviceTags.map(({ tag }) => (
          <span key={tag.id} className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
            {tag.name}
          </span>
        ))}
        {otherTags.map(({ tag }) => (
          <span key={tag.id} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
            {tag.name}
          </span>
        ))}
      </div>

      {/* タイトル */}
      <h1 className="text-3xl font-bold text-gray-900 leading-snug mb-4">{article.title}</h1>

      {/* 著者・メタ */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
        <Avatar src={article.user.avatarUrl} name={article.user.displayName} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{article.user.displayName}</p>
          <p className="text-xs text-gray-400">
            {article.publishedAt ? formatDate(article.publishedAt) : ""}
            {" · "}
            約{readingTime(article.body)}分で読めます
          </p>
        </div>
        {isPaid && (
          <div className="flex-shrink-0 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {article.pricePt}pt
          </div>
        )}
      </div>

      {/* サムネイル */}
      {article.thumbnailUrl && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-gray-100">
          <Image src={article.thumbnailUrl} alt={article.title} fill className="object-cover" />
        </div>
      )}

      {/* 本文 */}
      <div className="relative">
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />

        {/* 有料ゲート */}
        {!canReadFull && (
          <PaywallGate
            articleId={id}
            pricePt={article.pricePt}
            isLoggedIn={!!session}
            userPoints={0}
          />
        )}
      </div>

      {/* アクションバー */}
      {canReadFull && (
        <ArticleActions
          articleId={id}
          likeCount={article._count.likes}
          isOwner={isOwner}
        />
      )}

      {/* ライタープロフィールカード */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <div className="flex items-start gap-4">
          <Avatar src={article.user.avatarUrl} name={article.user.displayName} size="lg" />
          <div className="flex-1">
            <Link href={`/${encodeURIComponent(article.user.displayName)}`} className="font-bold text-gray-900 hover:underline">
              {article.user.displayName}
            </Link>
            {article.user.bio && (
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{article.user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* コメント */}
      <Comments articleId={id} />
    </div>
  );
}
