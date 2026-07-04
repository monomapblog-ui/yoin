import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const { id: followeeId } = await params;
  const followerId = session.user.id;

  if (followerId === followeeId) return NextResponse.json({ error: "自分はフォローできません" }, { status: 400 });

  await prisma.follow.upsert({
    where: { followerId_followeeId: { followerId, followeeId } },
    update: {},
    create: { followerId, followeeId },
  });

  await prisma.notification.create({
    data: {
      userId: followeeId,
      actorId: followerId,
      type: "FOLLOW",
      refId: followerId,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const { id: followeeId } = await params;
  const followerId = session.user.id;

  await prisma.follow.deleteMany({ where: { followerId, followeeId } });

  return NextResponse.json({ ok: true });
}
