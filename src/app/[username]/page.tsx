export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { ArticleCard } from "@/components/article/ArticleCard";
import { FollowButton } from "./FollowButton";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import type { ArticleWithAuthor } from "@/types";

interface Props {
  params: Promise<{ username: string }>;
}

async function getUser(displayName: string) {
  return prisma.user.findFirst({
    where: { displayName: { equals: displayName, mode: "insensitive" } },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      area: true,
      createdAt: true,
      _count: {
        select: {
          articles: { where: { status: "PUBLISHED" } },
          followers: true,
          following: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(decodeURIComponent(username));
  if (!user) return {};
  return {
    title: `${user.displayName}の記事一覧`,
    description: user.bio ?? `${user.displayName}が書いたメンズエステ体験談・コラム`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const [user, session] = await Promise.all([
    getUser(decodeURIComponent(username)),
    auth(),
  ]);

  if (!user) notFound();

  const isOwn = session?.user?.id === user.id;

  const isFollowing = session?.user?.id
    ? !!(await prisma.follow.findUnique({
        where: { followerId_followeeId: { followerId: session.user.id, followeeId: user.id } },
      }))
    : false;

  const articles = await prisma.article.findMany({
    where: { userId: user.id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: {
      id: true, title: true, summary: true, thumbnailUrl: true,
      pricePt: true, viewCount: true, likeCount: true, publishedAt: true,
      user: { select: { id: true, displayName: true, avatarUrl: true } },
      tags: { select: { tag: { select: { id: true, name: true, slug: true, category: true } } } },
      _count: { select: { purchases: true } },
    },
  }) as unknown as ArticleWithAuthor[];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* プロフィールヘッダー */}
      <div className="flex items-start gap-5 mb-8 pb-8 border-b border-gray-100">
        <Avatar src={user.avatarUrl} name={user.displayName} size="xl" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
              {user.area && (
                <p className="text-sm text-gray-400 mt-0.5">{user.area}</p>
              )}
            </div>

            {!isOwn && (
              <FollowButton
                userId={user.id}
                initialFollowing={isFollowing}
                isLoggedIn={!!session}
              />
            )}
            {isOwn && (
              <Link
                href="/settings"
                className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                プロフィール編集
              </Link>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{user.bio}</p>
          )}

          {/* スタッツ */}
          <div className="flex items-center gap-5 mt-4 text-sm">
            <span className="text-gray-700">
              <strong className="text-gray-900">{user._count.articles}</strong>
              <span className="text-gray-400 ml-1">記事</span>
            </span>
            <span className="text-gray-700">
              <strong className="text-gray-900">{user._count.followers}</strong>
              <span className="text-gray-400 ml-1">フォロワー</span>
            </span>
            <span className="text-gray-700">
              <strong className="text-gray-900">{user._count.following}</strong>
              <span className="text-gray-400 ml-1">フォロー中</span>
            </span>
            <span className="text-gray-400 text-xs ml-auto">
              {formatDate(user.createdAt)}から
            </span>
          </div>
        </div>
      </div>

      {/* 記事一覧 */}
      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">📝</p>
          <p>まだ記事がありません</p>
          {isOwn && (
            <Link href="/write" className="mt-4 inline-block text-teal-600 hover:underline text-sm">
              最初の記事を書く →
            </Link>
          )}
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
