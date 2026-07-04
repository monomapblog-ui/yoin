export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WithdrawalClient } from "./WithdrawalClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "出金申請" };

export default async function WithdrawalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/withdrawal");

  const [user, requests] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { pointBalance: true, displayName: true },
    }),
    prisma.withdrawalRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { requestedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <WithdrawalClient
      currentBalance={user?.pointBalance ?? 0}
      requests={requests}
    />
  );
}
