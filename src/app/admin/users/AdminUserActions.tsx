"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  currentRole: string;
}

const ROLES = ["READER", "WRITER", "ADMIN"];

export function AdminUserActions({ userId, currentRole }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function changeRole(role: string) {
    if (role === currentRole) return;
    if (!confirm(`ロールを ${role} に変更しますか？`)) return;
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <select
      value={currentRole}
      onChange={(e) => changeRole(e.target.value)}
      disabled={loading}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}
