import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MIN_WITHDRAWAL = 1000;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, bankInfo } = await req.json();

  if (!amount || amount < MIN_WITHDRAWAL) {
    return NextResponse.json({ error: `最低出金額は${MIN_WITHDRAWAL}ptです` }, { status: 400 });
  }
  if (!bankInfo?.bankName || !bankInfo?.accountNumber || !bankInfo?.accountHolder) {
    return NextResponse.json({ error: "口座情報を入力してください" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { pointBalance: true },
  });

  if (!user || user.pointBalance < amount) {
    return NextResponse.json({ error: "残高が不足しています" }, { status: 400 });
  }

  const pending = await prisma.withdrawalRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
    select: { id: true },
  });
  if (pending) {
    return NextResponse.json({ error: "審査中の申請があります。完了後に再度申請してください" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { pointBalance: { decrement: amount } },
    }),
    prisma.withdrawalRequest.create({
      data: {
        userId: session.user.id,
        amountPt: amount,
        bankInfo: JSON.stringify(bankInfo),
        status: "PENDING",
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
