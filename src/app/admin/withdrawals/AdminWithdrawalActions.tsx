"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  requestId: string;
  userId: string;
}

export function AdminWithdrawalActions({ requestId, userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: "APPROVED" | "REJECTED" | "PAID") {
    const label = status === "APPROVED" ? "承認" : status === "REJECTED" ? "却下" : "振込完了";
    if (!confirm(`この申請を「${label}」にしますか？`)) return;
    setLoading(true);
    await fetch(`/api/admin/withdrawals/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, userId }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={() => updateStatus("APPROVED")}
        disabled={loading}
        className="flex items-center gap-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
      >
        <CheckCircle className="w-3 h-3" />
        承認
      </button>
      <button
        onClick={() => updateStatus("REJECTED")}
        disabled={loading}
        className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
      >
        <XCircle className="w-3 h-3" />
        却下
      </button>
      <button
        onClick={() => updateStatus("PAID")}
        disabled={loading}
        className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
      >
        振込完了
      </button>
    </div>
  );
}
