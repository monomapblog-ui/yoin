import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  const { id } = await params;
  const userId = session.user.id;

  const article = await prisma.article.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.like.upsert({
      where: { userId_articleId: { userId, articleId: id } },
      update: {},
      create: { userId, articleId: id },
    }),
    prisma.article.update({ where: { id }, data: { likeCount: { increment: 1 } } }),
  ]);

  // 通知（自分のいいねは除く）
  if (article.userId !== userId) {
    await prisma.notification.create({
      data: {
        userId: article.userId,
        actorId: userId,
        type: "LIKE",
        refId: id,
      },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  const { id } = await params;
  const userId = session.user.id;

  await prisma.$transaction([
    prisma.like.deleteMany({ where: { userId, articleId: id } }),
    prisma.article.update({ where: { id }, data: { likeCount: { decrement: 1 } } }),
  ]);

  return NextResponse.json({ ok: true });
}
