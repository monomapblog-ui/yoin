export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Users, FileText, ShoppingBag, Banknote, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "管理画面" };

export default async function AdminPage() {
  const [userCount, articleCount, purchaseCount, pendingWithdrawals, recentEarnings] = await Promise.all([
    prisma.user.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.purchase.count(),
    prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
    prisma.pointsTransaction.aggregate({
      where: { type: "EARN" },
      _sum: { amount: true },
    }),
  ]);

  const stats = [
    { label: "総ユーザー数",      value: userCount.toLocaleString(),          icon: Users,       color: "text-blue-500",   bg: "bg-blue-50" },
    { label: "公開記事数",        value: articleCount.toLocaleString(),        icon: FileText,    color: "text-teal-500",   bg: "bg-teal-50" },
    { label: "総購入数",          value: purchaseCount.toLocaleString(),       icon: ShoppingBag, color: "text-amber-500",  bg: "bg-amber-50" },
    { label: "出金申請（審査中）", value: pendingWithdrawals.toLocaleString(), icon: Banknote,    color: "text-red-500",    bg: "bg-red-50" },
    { label: "ライター総売上",    value: `${(recentEarnings._sum.amount ?? 0).toLocaleString()}pt`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">管理概要</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {pendingWithdrawals > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-4">
          <Banknote className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-700">{pendingWithdrawals}件の出金申請が審査待ちです</p>
            <a href="/admin/withdrawals" className="text-sm text-red-600 hover:underline">審査する →</a>
          </div>
        </div>
      )}
    </div>
  );
}
