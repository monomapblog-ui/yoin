"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { RichEditor } from "@/components/editor/RichEditor";
import { Button } from "@/components/ui/Button";
import { Save, Eye, Settings2, X, ChevronDown } from "lucide-react";
import Image from "next/image";

const PRICE_OPTIONS = [
  { value: 0, label: "無料" },
  { value: 100, label: "100pt" },
  { value: 200, label: "200pt" },
  { value: 300, label: "300pt" },
  { value: 500, label: "500pt" },
  { value: 1000, label: "1,000pt" },
];

const AREA_TAGS = [
  "新宿", "渋谷", "池袋", "銀座", "品川", "上野", "錦糸町", "秋葉原",
  "梅田", "難波", "心斎橋", "名古屋", "福岡", "札幌", "仙台",
];

const SERVICE_TAGS = [
  "オイルマッサージ", "四つ手", "ヌキあり", "スウェディッシュ", "リンパ",
  "回春", "NN", "NS", "ソフトSM", "メンズエステ", "アジアンリラクゼーション",
];

export default function WriteClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [summary, setSummary] = useState("");
  const [pricePt, setPricePt] = useState(0);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);

  const handleThumbnail = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnail(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length >= 5 ? prev : [...prev, tag]
    );
  }

  async function save(status: "DRAFT" | "PUBLISHED") {
    if (!title.trim()) return alert("タイトルを入力してください");
    if (status === "PUBLISHED" && !body.trim()) return alert("本文を入力してください");

    const setter = status === "DRAFT" ? setSaving : setPublishing;
    setter(true);

    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        body,
        summary: summary.trim() || body.replace(/<[^>]*>/g, "").slice(0, 140),
        pricePt,
        thumbnailUrl: thumbnail,
        tags: selectedTags,
        status,
      }),
    });

    setter(false);

    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "保存に失敗しました");
      return;
    }

    const { id } = await res.json();

    if (status === "DRAFT") {
      setLastSaved(new Date());
    } else {
      router.push(`/articles/${id}`);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-14 z-40 bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1 text-xs text-gray-400">
          {lastSaved ? `${lastSaved.getHours()}:${String(lastSaved.getMinutes()).padStart(2, "0")} に保存済み` : "未保存"}
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          設定
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSettings ? "rotate-180" : ""}`} />
        </button>
        <Button variant="secondary" size="sm" loading={saving} onClick={() => save("DRAFT")}>
          <Save className="w-3.5 h-3.5" />
          下書き保存
        </Button>
        <Button size="sm" loading={publishing} onClick={() => save("PUBLISHED")}
          className="bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-500">
          <Eye className="w-3.5 h-3.5" />
          公開する
        </Button>
      </div>

      {showSettings && (
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-5">
          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">サムネイル</label>
              <div
                className="relative aspect-video bg-white border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-teal-400 transition-colors"
                onClick={() => thumbnailRef.current?.click()}
              >
                {thumbnail ? (
                  <Image src={thumbnail} alt="thumbnail" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1">
                    <span className="text-2xl">🖼</span>
                    <span className="text-xs">クリックして画像を選択</span>
                  </div>
                )}
              </div>
              <input ref={thumbnailRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnail} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  概要文 <span className="text-gray-400 font-normal">（OGP・カード表示用）</span>
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value.slice(0, 150))}
                  placeholder="省略すると本文冒頭が使われます"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition resize-none"
                />
                <p className="text-xs text-gray-400 text-right">{summary.length}/150</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">価格</label>
                <div className="flex flex-wrap gap-2">
                  {PRICE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPricePt(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        pricePt === opt.value
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-teal-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タグ <span className="text-gray-400 font-normal">（最大5つ）</span>
              </label>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">エリア</p>
                <div className="flex flex-wrap gap-1.5">
                  {AREA_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">サービス</p>
                <div className="flex flex-wrap gap-1.5">
                  {SERVICE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-10">
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 80))}
          placeholder="タイトルを入力..."
          rows={2}
          className="w-full text-3xl font-bold text-gray-900 placeholder:text-gray-300 outline-none resize-none border-none bg-transparent leading-snug mb-8"
        />
        <RichEditor content={body} onChange={setBody} />
      </div>
    </div>
  );
}
