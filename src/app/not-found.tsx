import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-5xl font-bold text-gray-200 mb-2">404</h1>
        <p className="text-xl font-bold text-gray-900 mb-2">ページが見つかりません</p>
        <p className="text-sm text-gray-500 mb-8">
          お探しのページは削除されたか、URLが変更された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
