export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Eye, Heart, ShoppingBag, FileText, Pencil } from "lucide-react";
import Link from "next/link";
import { ArticleManageList } from "./ArticleManageList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ダッシュボード" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/dashboard");

  const userId = session.user.id;

  const [user, articles, earnTransactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, pointBalance: true, role: true },
    }),
    prisma.article.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, status: true, pricePt: true,
        viewCount: true, likeCount: true, publishedAt: true, createdAt: true,
        _count: { select: { purchases: true } },
      },
    }),
    prisma.pointsTransaction.aggregate({
      where: { userId, type: "EARN" },
      _sum: { amount: true },
    }),
  ]);

  if (!user) redirect("/auth/login");

  const publishedArticles = articles.filter((a) => a.status === "PUBLISHED");
  const totalViews    = publishedArticles.reduce((s, a) => s + a.viewCount, 0);
  const totalLikes    = publishedArticles.reduce((s, a) => s + a.likeCount, 0);
  const totalSales    = publishedArticles.reduce((s, a) => s + a._count.purchases, 0);
  const totalEarnings = earnTransactions._sum.amount ?? 0;

  const stats = [
    { label: "公開記事", value: publishedArticles.length,        icon: FileText,    color: "text-teal-500",  bg: "bg-teal-50" },
    { label: "総閲覧数", value: totalViews.toLocaleString(),     icon: Eye,         color: "text-blue-500",  bg: "bg-blue-50" },
    { label: "総いいね", value: totalLikes.toLocaleString(),     icon: Heart,       color: "text-red-500",   bg: "bg-red-50" },
    { label: "総販売数", value: totalSales.toLocaleString(),     icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-400 mt-0.5">{user.displayName}</p>
        </div>
        <Link
          href="/write"
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Pencil className="w-4 h-4" />
          新しい記事を書く
        </Link>
      </div>

      {/* ポイント残高 */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-500 rounded-2xl p-6 text-white mb-6">
        <p className="text-teal-100 text-sm mb-1">保有ポイント（売上含む）</p>
        <p className="text-4xl font-bold">
          {user.pointBalance.toLocaleString()}
          <span className="text-xl ml-1">pt</span>
        </p>
        <div className="flex items-center justify-between mt-4">
          <p className="text-teal-100 text-xs">累計売上: {totalEarnings.toLocaleString()}pt</p>
          <Link href="/withdrawal" className="text-xs bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg">
            出金申請 →
          </Link>
        </div>
      </div>

      {/* スタッツ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 記事管理 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            記事管理
          </h2>
        </div>
        <ArticleManageList articles={articles} />
      </div>
    </div>
  );
}
