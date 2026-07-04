export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { AdminFeaturedClient } from "./AdminFeaturedClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "編集部ピックアップ管理" };

export default async function AdminFeaturedPage() {
  const [featured, candidates] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: { publishedAt: "desc" },
      include: {
        user: { select: { displayName: true } },
        _count: { select: { likes: true } },
      },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", isFeatured: false },
      orderBy: [{ likeCount: "desc" }, { viewCount: "desc" }],
      include: {
        user: { select: { displayName: true } },
        _count: { select: { likes: true } },
      },
      take: 50,
    }),
  ]);

  return <AdminFeaturedClient featured={featured} candidates={candidates} />;
}
