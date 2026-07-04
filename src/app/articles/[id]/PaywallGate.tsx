"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Lock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface PaywallGateProps {
  articleId: string;
  pricePt: number;
  isLoggedIn: boolean;
  userPoints: number;
}

export function PaywallGate({ articleId, pricePt, isLoggedIn, userPoints }: PaywallGateProps) {
  const router = useRouter();
  const [purchasing, setPurchasing] = useState(false);

  async function handlePurchase() {
    if (!isLoggedIn) {
      router.push(`/auth/login?callbackUrl=/articles/${articleId}`);
      return;
    }

    setPurchasing(true);
    const res = await fetch(`/api/articles/${articleId}/purchase`, { method: "POST" });
    setPurchasing(false);

    if (res.ok) {
      router.refresh();
    } else {
      const err = await res.json();
      if (err.code === "INSUFFICIENT_POINTS") {
        router.push("/points");
      } else {
        alert(err.error ?? "購入に失敗しました");
      }
    }
  }

  const canAfford = userPoints >= pricePt;

  return (
    <div className="relative">
      {/* フェードアウト */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />

      {/* ゲートUI */}
      <div className="relative mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-amber-500" />
        </div>

        <h3 className="font-bold text-gray-900 text-lg mb-1">この先は有料コンテンツです</h3>
        <p className="text-sm text-gray-500 mb-6">
          {pricePt}ptで続きを読めます
          {isLoggedIn && (
            <span className="block text-xs mt-1">
              現在の保有ポイント：<span className={canAfford ? "text-teal-600 font-bold" : "text-red-500 font-bold"}>{userPoints}pt</span>
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isLoggedIn ? (
            <>
              <Button
                onClick={handlePurchase}
                loading={purchasing}
                className="bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-500"
              >
                {pricePt}ptで購入して読む
              </Button>
              {!canAfford && (
                <Link href="/points">
                  <Button variant="secondary">ポイントを購入する</Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href={`/auth/login?callbackUrl=/articles/${articleId}`}>
                <Button className="bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-500">
                  ログインして購入する
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="secondary">新規登録（無料）</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
