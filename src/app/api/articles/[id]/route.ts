import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
      tags: { include: { tag: true } },
    },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id }, select: { userId: true } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (article.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.article.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id }, select: { userId: true } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 管理者 or 記事オーナーのみ削除可
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (article.userId !== session.user.id && user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
