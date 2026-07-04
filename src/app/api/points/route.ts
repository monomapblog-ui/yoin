import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PACKS: Record<string, { points: number; bonus: number; price: number }> = {
  p500:   { points: 500,   bonus: 0,    price: 550   },
  p1000:  { points: 1000,  bonus: 50,   price: 1100  },
  p3000:  { points: 3000,  bonus: 300,  price: 3300  },
  p5000:  { points: 5000,  bonus: 750,  price: 5500  },
  p10000: { points: 10000, bonus: 2000, price: 11000 },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { packId } = await req.json();
  const pack = PACKS[packId as string];
  if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });

  const totalPoints = pack.points + pack.bonus;

  // 現在の残高を取得してbalanceAfterを正確に計算
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { pointBalance: true },
  });
  const balanceAfter = (user?.pointBalance ?? 0) + totalPoints;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { pointBalance: { increment: totalPoints } },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId: session.user.id,
        type: "PURCHASE_POINTS",
        amount: totalPoints,
        balanceAfter,
        refId: `pack_${packId}`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, points: totalPoints, balanceAfter });
}
