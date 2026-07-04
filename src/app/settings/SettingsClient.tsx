"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Camera, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

const AREAS = [
  "新宿", "渋谷", "池袋", "銀座", "品川", "上野", "秋葉原", "六本木",
  "大阪", "梅田", "難波", "心斎橋", "名古屋", "札幌", "福岡", "仙台",
];

interface UserData {
  id: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  area: string | null;
  email: string | null;
}

interface Props {
  user: UserData;
}

export function SettingsClient({ user }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    displayName: user.displayName ?? "",
    bio: user.bio ?? "",
    area: user.area ?? "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      let avatarUrl = user.avatarUrl;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (uploadRes.ok) {
          const d = await uploadRes.json();
          avatarUrl = d.url;
        }
      }

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存に失敗しました");
      setSaved(true);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-8">
        <User className="w-6 h-6 text-teal-500" />
        <h1 className="text-2xl font-bold text-gray-900">プロフィール設定</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* アバター */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar
              src={avatarPreview ?? user.avatarUrl}
              name={user.displayName ?? "U"}
              size="lg"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{user.email}</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-teal-600 hover:underline mt-1"
            >
              アバターを変更
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        {/* 表示名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            maxLength={50}
            placeholder="あなたの名前"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        {/* 自己紹介 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            maxLength={200}
            rows={4}
            placeholder="あなたについて教えてください（200文字以内）"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-0.5">{form.bio.length}/200</p>
        </div>

        {/* 活動エリア */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">主な活動エリア</label>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setForm({ ...form, area: form.area === area ? "" : area })}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  form.area === area
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {saved && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-4 py-3 text-sm">
            <CheckCircle className="w-4 h-4" />
            保存しました
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full gap-2" size="lg">
          <Save className="w-4 h-4" />
          変更を保存
        </Button>
      </form>
    </div>
  );
}
