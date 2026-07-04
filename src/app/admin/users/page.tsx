export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/Avatar";
import { AdminUserActions } from "./AdminUserActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ユーザー管理" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      pointBalance: true,
      createdAt: true,
      _count: { select: { articles: true, followers: true } },
    },
    take: 100,
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ユーザー管理</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">ユーザー</th>
              <th className="px-5 py-3 text-left">ロール</th>
              <th className="px-5 py-3 text-right">残高</th>
              <th className="px-5 py-3 text-right">記事</th>
              <th className="px-5 py-3 text-right">フォロワー</th>
              <th className="px-5 py-3 text-right">登録日</th>
              <th className="px-5 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatarUrl} name={u.displayName} size="sm" />
                    <div>
                      <p className="font-medium text-gray-800">{u.displayName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === "ADMIN" ? "bg-red-100 text-red-600" :
                    u.role === "WRITER" ? "bg-teal-100 text-teal-600" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-gray-600">{u.pointBalance.toLocaleString()}pt</td>
                <td className="px-5 py-3 text-right text-gray-600">{u._count.articles}</td>
                <td className="px-5 py-3 text-right text-gray-600">{u._count.followers}</td>
                <td className="px-5 py-3 text-right text-gray-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("ja-JP")}
                </td>
                <td className="px-5 py-3 text-right">
                  <AdminUserActions userId={u.id} currentRole={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
