import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PointsClient } from "./PointsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ポイント購入" };

export default async function PointsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/points");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { pointBalance: true },
  });

  const transactions = await prisma.pointsTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <PointsClient
      currentBalance={user?.pointBalance ?? 0}
      transactions={transactions}
    />
  );
}
