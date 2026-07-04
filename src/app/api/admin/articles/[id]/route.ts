import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ArticleStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "ADMIN";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const data: { isFeatured?: boolean; status?: ArticleStatus } = {};
  if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
  if (body.status !== undefined) data.status = body.status as ArticleStatus;

  const article = await prisma.article.update({
    where: { id },
    data,
    select: { id: true, isFeatured: true, status: true },
  });

  return NextResponse.json(article);
}
