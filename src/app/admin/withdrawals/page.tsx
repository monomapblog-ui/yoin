export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { AdminWithdrawalActions } from "./AdminWithdrawalActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "出金審査" };

export default async function AdminWithdrawalsPage() {
  const requests = await prisma.withdrawalRequest.findMany({
    orderBy: { requestedAt: "desc" },
    include: {
      user: { select: { id: true, displayName: true, email: true } },
    },
    take: 100,
  });

  const STATUS_LABEL: Record<string, string> = {
    PENDING:  "審査中",
    APPROVED: "承認済み",
    REJECTED: "却下",
    PAID:     "振込完了",
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">出金審査</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">申請者</th>
              <th className="px-5 py-3 text-right">金額</th>
              <th className="px-5 py-3 text-left">口座情報</th>
              <th className="px-5 py-3 text-left">ステータス</th>
              <th className="px-5 py-3 text-right">申請日</th>
              <th className="px-5 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map((r) => {
              let bank: Record<string, string> = {};
              try { bank = JSON.parse(r.bankInfo); } catch { /* */ }
              return (
                <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${r.status === "PENDING" ? "bg-amber-50/30" : ""}`}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{r.user.displayName}</p>
                    <p className="text-xs text-gray-400">{r.user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-gray-900">
                    ¥{(r.amountPt * 0.9).toLocaleString()}
                    <p className="text-xs font-normal text-gray-400">{r.amountPt.toLocaleString()}pt</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600">
                    <p>{bank.bankName} {bank.branchName}</p>
                    <p>{bank.accountType} {bank.accountNumber}</p>
                    <p className="font-medium">{bank.accountHolder}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.status === "PENDING"  ? "bg-amber-100 text-amber-700" :
                      r.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      r.status === "REJECTED" ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-gray-400">
                    {new Date(r.requestedAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {r.status === "PENDING" && (
                      <AdminWithdrawalActions requestId={r.id} userId={r.user.id} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
