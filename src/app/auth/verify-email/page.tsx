"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function VerifyEmailContent() {
  const params = useSearchParams();
  const error = params.get("error");
  const email = params.get("email");

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function resendEmail() {
    if (!email) return;
    setResending(true);
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResent(true);
    setResending(false);
  }

  if (error === "invalid_token") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">リンクが無効です</h1>
        <p className="text-sm text-gray-500 mb-6">
          このリンクは無効か、すでに使用済みです。
        </p>
        <Link href="/auth/login" className="text-teal-600 hover:underline text-sm">
          ログインページへ →
        </Link>
      </div>
    );
  }

  if (error === "token_expired") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">リンクの有効期限切れ</h1>
        <p className="text-sm text-gray-500 mb-6">
          確認リンクの有効期限（24時間）が切れています。
          {email && "再送信してください。"}
        </p>
        {email && !resent ? (
          <Button onClick={resendEmail} loading={resending}>
            確認メールを再送信
          </Button>
        ) : resent ? (
          <p className="text-sm text-teal-600">再送信しました。メールボックスをご確認ください。</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Mail className="w-8 h-8 text-teal-500" />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">確認メールを送信しました</h1>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        {email ? (
          <><strong>{email}</strong> に確認メールを送信しました。</>
        ) : (
          "ご登録のメールアドレスに確認メールを送信しました。"
        )}
        <br />
        メール内のリンクをクリックして登録を完了してください。
      </p>
      <p className="text-xs text-gray-400 mb-4">
        メールが届かない場合は迷惑メールフォルダをご確認ください。
      </p>
      {email && !resent ? (
        <button onClick={resendEmail} disabled={resending} className="text-xs text-teal-600 hover:underline disabled:opacity-50">
          {resending ? "送信中..." : "メールが届かない場合は再送信"}
        </button>
      ) : resent ? (
        <div className="flex items-center gap-2 text-sm text-green-600 justify-center">
          <CheckCircle className="w-4 h-4" />
          再送信しました
        </div>
      ) : null}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md">
        <Suspense fallback={<div className="text-center text-gray-400">読み込み中...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
