import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const { id: articleId } = await params;
  const userId = session.user.id;

  await prisma.bookmark.upsert({
    where: { userId_articleId: { userId, articleId } },
    update: {},
    create: { userId, articleId },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const { id: articleId } = await params;
  const userId = session.user.id;

  await prisma.bookmark.deleteMany({ where: { userId, articleId } });

  return NextResponse.json({ ok: true });
}
