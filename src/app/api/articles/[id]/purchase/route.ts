import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id;

  const article = await prisma.article.findUnique({ where: { id, status: "PUBLISHED" } });
  if (!article) return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 });
  if (article.pricePt === 0) return NextResponse.json({ error: "無料記事です" }, { status: 400 });
  if (article.userId === userId) return NextResponse.json({ error: "自分の記事は購入できません" }, { status: 400 });

  const existing = await prisma.purchase.findUnique({
    where: { userId_articleId: { userId, articleId: id } },
  });
  if (existing) return NextResponse.json({ error: "購入済みです" }, { status: 409 });

  // 購入者と執筆者の残高を同時取得
  const [buyer, writer] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { pointBalance: true } }),
    prisma.user.findUnique({ where: { id: article.userId }, select: { pointBalance: true } }),
  ]);

  if (!buyer || buyer.pointBalance < article.pricePt) {
    return NextResponse.json({ error: "ポイントが不足しています", code: "INSUFFICIENT_POINTS" }, { status: 402 });
  }

  const writerEarnings = Math.floor(article.pricePt * 0.85);
  const buyerBalanceAfter  = buyer.pointBalance - article.pricePt;
  const writerBalanceAfter = (writer?.pointBalance ?? 0) + writerEarnings;

  await prisma.$transaction([
    prisma.purchase.create({ data: { userId, articleId: id, ptSpent: article.pricePt } }),
    prisma.user.update({ where: { id: userId }, data: { pointBalance: { decrement: article.pricePt } } }),
    prisma.pointsTransaction.create({
      data: { userId, type: "SPEND", amount: -article.pricePt, balanceAfter: buyerBalanceAfter, refId: id },
    }),
    prisma.user.update({ where: { id: article.userId }, data: { pointBalance: { increment: writerEarnings } } }),
    prisma.pointsTransaction.create({
      data: { userId: article.userId, type: "EARN", amount: writerEarnings, balanceAfter: writerBalanceAfter, refId: id },
    }),
  ]);

  // 執筆者に購入通知
  if (article.userId !== userId) {
    await prisma.notification.create({
      data: {
        userId: article.userId,
        actorId: userId,
        type: "PURCHASE",
        refId: id,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
