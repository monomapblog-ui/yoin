"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Mail, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "送信に失敗しました");
      }
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-teal-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">お問い合わせ</h1>
        <p className="text-sm text-gray-500 mt-2">
          ご不明な点やご要望はお気軽にご連絡ください。
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {sent ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-teal-500" />
            </div>
            <p className="font-bold text-gray-900 mb-2">送信が完了しました</p>
            <p className="text-sm text-gray-500">
              お問い合わせを受け付けました。<br />
              3営業日以内にご返信いたします。
            </p>
            <Link href="/" className="block mt-6 text-sm text-teal-600 hover:underline">
              トップページへ →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={100}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">件名</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                maxLength={200}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">お問い合わせ内容</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
                rows={6}
                maxLength={2000}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">{form.body.length}/2000</p>
            </div>
            <Button type="submit" loading={loading} className="w-full">
              送信する
            </Button>
          </form>
        )}
      </div>

      <p className="text-center mt-4 text-sm text-gray-500">
        <Link href="/" className="text-teal-600 hover:underline">← トップへ戻る</Link>
      </p>
    </div>
  );
}
