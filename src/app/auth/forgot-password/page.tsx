"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-teal-600 tracking-tight">yoin</Link>
          <p className="mt-2 text-sm text-gray-500">パスワードをお忘れの方</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                パスワードリセット用のメールを送信しました。<br />
                メール内のリンクから再設定してください。<br />
                <span className="text-xs text-gray-400">(有効期限：1時間)</span>
              </p>
              <Link href="/auth/login" className="block mt-6 text-sm text-teal-600 hover:underline">
                ログインページへ →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600">
                登録したメールアドレスを入力してください。パスワード再設定のリンクを送信します。
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                />
              </div>
              <Button type="submit" loading={loading} className="w-full">
                リセットメールを送信
              </Button>
            </form>
          )}
        </div>

        <p className="text-center mt-4 text-sm text-gray-500">
          <Link href="/auth/login" className="text-teal-600 hover:underline font-medium">← ログインへ戻る</Link>
        </p>
      </div>
    </div>
  );
}
