"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">リンクが無効です。</p>
        <Link href="/auth/forgot-password" className="text-teal-600 hover:underline text-sm">
          再送信はこちら →
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("パスワードが一致しません"); return; }
    if (password.length < 8) { setError("8文字以上で入力してください"); return; }
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "エラーが発生しました");
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/auth/login"), 3000);
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm text-gray-600">パスワードを変更しました。</p>
        <p className="text-xs text-gray-400 mt-1">ログインページへ移動します...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード（8文字以上）</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（確認）</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
        />
      </div>
      <Button type="submit" loading={loading} className="w-full">
        パスワードを変更する
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-teal-600 tracking-tight">yoin</Link>
          <p className="mt-2 text-sm text-gray-500">パスワードの再設定</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <Suspense fallback={<div className="text-center text-gray-400 text-sm">読み込み中...</div>}>
            <ResetPasswordContent />
          </Suspense>
        </div>

        <p className="text-center mt-4 text-sm text-gray-500">
          <Link href="/auth/login" className="text-teal-600 hover:underline font-medium">← ログインへ戻る</Link>
        </p>
      </div>
    </div>
  );
}
