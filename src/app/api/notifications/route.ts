import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "1";

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      ...(unreadOnly ? { readAt: null } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // actorIdからユーザー情報をまとめて取得
  const actorIds = [...new Set(notifications.map((n) => n.actorId).filter(Boolean))] as string[];
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, displayName: true, avatarUrl: true },
      })
    : [];
  const actorMap = Object.fromEntries(actors.map((a) => [a.id, a]));

  const result = notifications.map((n) => ({
    ...n,
    actor: n.actorId ? actorMap[n.actorId] ?? null : null,
  }));

  return NextResponse.json(result);
}

// 全既読
export async function PATCH(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
