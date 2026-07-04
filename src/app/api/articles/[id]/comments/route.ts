import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const comments = await prisma.comment.findMany({
    where: { articleId: id, parentId: null, hidden: false },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
      replies: {
        where: { hidden: false },
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      },
    },
  });

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const { id: articleId } = await params;
  const { body, parentId } = await req.json();

  if (!body?.trim() || body.length > 1000) {
    return NextResponse.json({ error: "コメントは1〜1000文字で入力してください" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId, status: "PUBLISHED" },
    select: { userId: true },
  });
  if (!article) return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 });

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      articleId,
      parentId: parentId ?? null,
      body: body.trim(),
    },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });

  // 通知：記事オーナーに通知（自分のコメントは除く）
  if (article.userId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: article.userId,
        actorId: session.user.id,
        type: "COMMENT",
        refId: articleId,
        message: body.trim().slice(0, 80),
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}
