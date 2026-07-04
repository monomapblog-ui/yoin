"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ArticleError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <h1 className="text-lg font-bold text-gray-900 mb-2">記事の読み込みに失敗しました</h1>
      <p className="text-sm text-gray-500 mb-6">
        しばらく時間をおいて再度お試しください。
      </p>
      <div className="flex items-center gap-3 justify-center">
        <button
          onClick={reset}
          className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          再読み込み
        </button>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
