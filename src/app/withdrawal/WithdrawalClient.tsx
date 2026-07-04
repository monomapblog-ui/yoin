"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { WithdrawalRequest } from "@prisma/client";

const MIN_WITHDRAWAL = 1000;
const FEE_RATE = 0.1;

interface Props {
  currentBalance: number;
  requests: WithdrawalRequest[];
}

const STATUS_MAP = {
  PENDING:  { label: "審査中",   icon: Clock,       color: "text-amber-500", bg: "bg-amber-50" },
  APPROVED: { label: "承認済み", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
  REJECTED: { label: "却下",     icon: XCircle,     color: "text-red-500",   bg: "bg-red-50" },
  PAID:     { label: "振込完了", icon: CheckCircle, color: "text-blue-500",  bg: "bg-blue-50" },
};

export function WithdrawalClient({ currentBalance, requests }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [bankInfo, setBankInfo] = useState({ bankName: "", branchName: "", accountType: "普通", accountNumber: "", accountHolder: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const amountNum = parseInt(amount) || 0;
  const fee = Math.floor(amountNum * FEE_RATE);
  const payout = amountNum - fee;
  const canSubmit = amountNum >= MIN_WITHDRAWAL && amountNum <= currentBalance && bankInfo.bankName && bankInfo.accountNumber && bankInfo.accountHolder;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum, bankInfo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "申請に失敗しました");
      setSuccess(true);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Banknote className="w-6 h-6 text-teal-500" />
        <h1 className="text-2xl font-bold text-gray-900">出金申請</h1>
      </div>

      {/* 残高カード */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-500 rounded-2xl p-6 text-white mb-8">
        <p className="text-teal-100 text-sm mb-1">出金可能残高</p>
        <p className="text-4xl font-bold">
          {currentBalance.toLocaleString()}
          <span className="text-xl ml-1">pt</span>
        </p>
        <p className="text-teal-100 text-xs mt-2">最低出金額: {MIN_WITHDRAWAL.toLocaleString()}pt / 手数料: 10%</p>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">申請を受け付けました</h2>
          <p className="text-sm text-gray-500">審査後、5営業日以内にご登録の口座へ振込いたします。</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 金額 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">出金額（pt）</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={MIN_WITHDRAWAL}
              max={currentBalance}
              step={100}
              placeholder={`${MIN_WITHDRAWAL}〜${currentBalance}`}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            {amountNum >= MIN_WITHDRAWAL && (
              <div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between text-gray-500">
                  <span>出金額</span><span>{amountNum.toLocaleString()}pt</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>手数料 (10%)</span><span>-{fee.toLocaleString()}pt</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1 mt-1">
                  <span>振込金額</span><span>¥{payout.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* 銀行情報 */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">振込先口座</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">銀行名</label>
                <input
                  type="text"
                  value={bankInfo.bankName}
                  onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                  placeholder="〇〇銀行"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">支店名</label>
                <input
                  type="text"
                  value={bankInfo.branchName}
                  onChange={(e) => setBankInfo({ ...bankInfo, branchName: e.target.value })}
                  placeholder="〇〇支店"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">口座種別</label>
                <select
                  value={bankInfo.accountType}
                  onChange={(e) => setBankInfo({ ...bankInfo, accountType: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                >
                  <option>普通</option>
                  <option>当座</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">口座番号</label>
                <input
                  type="text"
                  value={bankInfo.accountNumber}
                  onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                  placeholder="1234567"
                  maxLength={8}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">口座名義（カタカナ）</label>
              <input
                type="text"
                value={bankInfo.accountHolder}
                onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
                placeholder="ヤマダ タロウ"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              出金申請は審査後、5営業日以内に振込いたします。申請後のキャンセルはできません。
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={!canSubmit || loading}
            loading={loading}
            className="w-full"
            size="lg"
          >
            出金申請する
          </Button>
        </form>
      )}

      {/* 申請履歴 */}
      {requests.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">申請履歴</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {requests.map((req) => {
              const s = STATUS_MAP[req.status as keyof typeof STATUS_MAP];
              const Icon = s.icon;
              return (
                <div key={req.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{req.amountPt.toLocaleString()}pt 出金申請</p>
                    <p className="text-xs text-gray-400">{new Date(req.requestedAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
