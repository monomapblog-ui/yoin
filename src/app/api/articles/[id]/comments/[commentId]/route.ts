import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await params;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isOwner = comment.userId === session.user.id;
  const isAdmin = user?.role === "ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.comment.update({ where: { id: commentId }, data: { hidden: true } });

  return NextResponse.json({ ok: true });
}
