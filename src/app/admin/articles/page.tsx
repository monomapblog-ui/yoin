export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { AdminArticleActions } from "./AdminArticleActions";
import { Star } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "記事管理" };

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      user: { select: { displayName: true } },
      _count: { select: { likes: true, purchases: true, comments: true } },
    },
    take: 100,
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">記事管理</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">タイトル</th>
              <th className="px-5 py-3 text-left">ライター</th>
              <th className="px-5 py-3 text-right">価格</th>
              <th className="px-5 py-3 text-right">いいね</th>
              <th className="px-5 py-3 text-right">購入</th>
              <th className="px-5 py-3 text-right">コメント</th>
              <th className="px-5 py-3 text-center">特集</th>
              <th className="px-5 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.map((a) => (
              <tr key={a.id} className={`hover:bg-gray-50 transition-colors ${a.isFeatured ? "bg-amber-50/20" : ""}`}>
                <td className="px-5 py-3 max-w-xs">
                  <a href={`/articles/${a.id}`} target="_blank" rel="noopener noreferrer"
                    className="font-medium text-gray-800 hover:underline line-clamp-2">
                    {a.title}
                  </a>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{a.user.displayName}</td>
                <td className="px-5 py-3 text-right text-gray-600">
                  {a.pricePt > 0 ? `${a.pricePt}pt` : "無料"}
                </td>
                <td className="px-5 py-3 text-right text-gray-600">{a._count.likes}</td>
                <td className="px-5 py-3 text-right text-gray-600">{a._count.purchases}</td>
                <td className="px-5 py-3 text-right text-gray-600">{a._count.comments}</td>
                <td className="px-5 py-3 text-center">
                  {a.isFeatured && <Star className="w-4 h-4 text-amber-400 mx-auto fill-amber-400" />}
                </td>
                <td className="px-5 py-3 text-right">
                  <AdminArticleActions articleId={a.id} isFeatured={a.isFeatured} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
