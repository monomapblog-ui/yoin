"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h1>
        <p className="text-sm text-gray-500 mb-6">
          予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。
        </p>
        <div className="flex items-center gap-3 justify-center">
          <Button onClick={reset}>もう一度試す</Button>
          <Button variant="ghost" onClick={() => (window.location.href = "/")}>
            トップへ戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
