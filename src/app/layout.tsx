import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: {
    default: "yoin｜メンズエステ体験談プラットフォーム",
    template: "%s | yoin",
  },
  description: "メンズエステの体験談・コラム・情報をライターが発信するプラットフォーム。セラピストとの余韻を言葉に。",
  keywords: ["メンエス", "メンズエステ", "体験談", "口コミ", "余韻"],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "yoin",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-white mt-16">
            <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p className="font-bold text-gray-700">yoin</p>
              <nav className="flex flex-wrap gap-4 justify-center">
                <Link href="/terms" className="hover:text-gray-600">利用規約</Link>
                <Link href="/privacy" className="hover:text-gray-600">プライバシーポリシー</Link>
                <Link href="/tokushoho" className="hover:text-gray-600">特定商取引法</Link>
                <Link href="/contact" className="hover:text-gray-600">お問い合わせ</Link>
              </nav>
              <p>© 2026 yoin</p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
