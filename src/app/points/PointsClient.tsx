"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Coins, CreditCard, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { POINT_PACKS as PACKS } from "@/lib/points";
import type { PointsTransaction } from "@prisma/client";

const POINT_PACKS = Object.entries(PACKS).map(([id, pack]) => ({ id, ...pack }));

interface Props {
  currentBalance: number;
  transactions: PointsTransaction[];
}

export function PointsClient({ currentBalance, transactions }: Props) {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedPack = POINT_PACKS.find((p) => p.id === selected);
  const paymentCanceled = searchParams.get("canceled") === "1";

  async function handlePurchase() {
    if (!selectedPack) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/points/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "決済の開始に失敗しました");
      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Coins className="w-6 h-6 text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-900">ポイント購入</h1>
      </div>

      {searchParams.get("success") === "1" && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
          決済が完了しました。反映まで数秒かかる場合があります。
        </div>
      )}
      {paymentCanceled && (
        <div className="mb-6 bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-xl px-4 py-3">
          決済がキャンセルされました。
        </div>
      )}

      {/* 残高カード */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-6 text-white mb-8">
        <p className="text-amber-100 text-sm mb-1">現在の残高</p>
        <p className="text-4xl font-bold">
          {currentBalance.toLocaleString()}
          <span className="text-xl ml-1">pt</span>
        </p>
        <p className="text-amber-100 text-xs mt-2">1pt ≈ 1円相当</p>
      </div>

      {/* パック選択 */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">パックを選択</h2>
        <div className="grid grid-cols-1 gap-3">
          {POINT_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => setSelected(pack.id)}
              className={`relative flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all text-left ${
                selected === pack.id
                  ? "border-amber-400 bg-amber-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-2.5 left-4 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  人気
                </span>
              )}
              <div>
                <p className="font-bold text-gray-900 text-lg">{pack.label}</p>
                {pack.bonus > 0 && (
                  <p className="text-xs text-amber-600 font-medium mt-0.5">
                    +{pack.bonus.toLocaleString()}pt ボーナス付き
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">¥{pack.price.toLocaleString()}</p>
                <p className="text-xs text-gray-400">税込</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 購入ボタン */}
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <Button
        onClick={handlePurchase}
        disabled={!selected || loading}
        loading={loading}
        className="w-full gap-2"
        size="lg"
      >
        <CreditCard className="w-4 h-4" />
        {selectedPack
          ? `¥${selectedPack.price.toLocaleString()} で ${selectedPack.label} を購入`
          : "パックを選んでください"}
      </Button>

      <p className="text-xs text-gray-400 text-center mt-3">
        ポイントに有効期限はありません。購入後のキャンセル・返金はできません。
      </p>

      {/* 取引履歴 */}
      {transactions.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            取引履歴
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.type === "EARN" ? "bg-green-50" :
                  tx.type === "PURCHASE_POINTS" ? "bg-blue-50" : "bg-red-50"
                }`}>
                  {tx.type === "EARN" ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : tx.type === "PURCHASE_POINTS" ? (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {tx.type === "EARN" ? "売上" :
                     tx.type === "PURCHASE_POINTS" ? "ポイント購入" : "記事購入"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <p className={`font-bold text-sm ${
                  tx.type === "EARN" || tx.type === "PURCHASE_POINTS" ? "text-green-600" : "text-red-500"
                }`}>
                  {tx.type === "SPEND" ? "-" : "+"}{tx.amount.toLocaleString()}pt
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
