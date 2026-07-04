export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NotificationsClient } from "./NotificationsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "通知" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/notifications");

  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const actorIds = [...new Set(notifications.map((n) => n.actorId).filter(Boolean))] as string[];
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, displayName: true, avatarUrl: true },
      })
    : [];
  const actorMap = Object.fromEntries(actors.map((a) => [a.id, a]));

  const items = notifications.map((n) => ({
    ...n,
    actor: n.actorId ? actorMap[n.actorId] ?? null : null,
  }));

  return <NotificationsClient notifications={items} />;
}
