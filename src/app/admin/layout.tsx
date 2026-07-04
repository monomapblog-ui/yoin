import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Banknote, FileText, Star } from "lucide-react";

const NAV = [
  { href: "/admin",             label: "概要",         icon: LayoutDashboard },
  { href: "/admin/users",       label: "ユーザー管理", icon: Users },
  { href: "/admin/withdrawals", label: "出金審査",     icon: Banknote },
  { href: "/admin/articles",    label: "記事管理",     icon: FileText },
  { href: "/admin/featured",    label: "ピックアップ", icon: Star },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* サイドバー */}
      <aside className="w-52 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Panel</p>
          <p className="text-sm font-bold text-teal-600 mt-0.5">yoin</p>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-100">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← サイトへ戻る</Link>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
