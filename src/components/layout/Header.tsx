"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "./NotificationBell";
import { PenLine, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="flex-shrink-0 font-bold text-xl tracking-tight text-emerald-600">
          yoin
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-1.5 gap-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="記事を検索..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </form>

        <div className="flex-1" />

        {session ? (
          <div className="flex items-center gap-2">
            <Link href="/write">
              <Button size="sm" className="gap-1.5">
                <PenLine className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">書く</span>
              </Button>
            </Link>

            <NotificationBell />

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                aria-expanded={menuOpen}
                aria-label="メニューを開く"
              >
                <Avatar
                  src={session.user?.image}
                  name={session.user?.name ?? "U"}
                  size="sm"
                />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <Link
                    href={`/${encodeURIComponent(session.user?.name ?? "")}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    プロフィール
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    ダッシュボード
                  </Link>
                  <Link
                    href="/bookmarks"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    ブックマーク
                  </Link>
                  <Link
                    href="/points"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    ポイント購入
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    設定
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">ログイン</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">新規登録</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
