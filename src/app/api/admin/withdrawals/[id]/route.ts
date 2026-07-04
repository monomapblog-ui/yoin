import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "ADMIN";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status, userId } = await req.json();

  if (!["APPROVED", "REJECTED", "PAID"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const request = await prisma.withdrawalRequest.findUnique({
    where: { id },
    select: { status: true, amountPt: true },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (request.status !== "PENDING") return NextResponse.json({ error: "Already processed" }, { status: 409 });

  await prisma.withdrawalRequest.update({
    where: { id },
    data: { status, processedAt: new Date() },
  });

  // 却下時はポイント返還
  if (status === "REJECTED" && userId) {
    const refundUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { pointBalance: true },
    });
    const balanceAfter = (refundUser?.pointBalance ?? 0) + request.amountPt;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { pointBalance: { increment: request.amountPt } },
      }),
      prisma.pointsTransaction.create({
        data: {
          userId,
          type: "EARN",
          amount: request.amountPt,
          balanceAfter,
          refId: `refund_${id}`,
        },
      }),
    ]);
  }

  // 出金ステータス通知
  if (userId) {
    await prisma.notification.create({
      data: {
        userId,
        type: "WITHDRAWAL",
        refId: id,
        message: status === "APPROVED" ? "出金申請が承認されました" :
                 status === "REJECTED" ? "出金申請が却下されました（ポイント返還済み）" :
                 "振込が完了しました",
      },
    });
  }

  return NextResponse.json({ ok: true });
}
