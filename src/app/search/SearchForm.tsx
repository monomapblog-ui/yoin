"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

interface Props {
  initialQ?: string;
  initialArea?: string;
  initialService?: string;
  initialSort?: string;
}

export function SearchForm({ initialQ = "" }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/search?${params}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-teal-400 transition-colors shadow-sm">
        <Search className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="エリア名・サービス名・キーワードで検索..."
          className="flex-1 px-3 py-3.5 text-base outline-none bg-transparent"
        />
        {q && (
          <button
            type="button"
            onClick={() => { setQ(""); router.push("/search"); }}
            className="p-2 mr-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-3.5 transition-colors text-sm"
        >
          検索
        </button>
      </div>
    </form>
  );
}
