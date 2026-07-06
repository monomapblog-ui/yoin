import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { POINT_PACKS } from "@/lib/points";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    if (checkoutSession.payment_status === "paid") {
      await grantPointsForSession(checkoutSession);
    }
  }

  return NextResponse.json({ received: true });
}

async function grantPointsForSession(checkoutSession: Stripe.Checkout.Session) {
  const userId = checkoutSession.metadata?.userId;
  const packId = checkoutSession.metadata?.packId;
  if (!userId || !packId) return;

  const pack = POINT_PACKS[packId];
  if (!pack) return;

  // 同一セッションの重複処理防止（Stripeはwebhookを再送する場合がある）
  const existing = await prisma.pointsTransaction.findFirst({
    where: { refId: checkoutSession.id },
  });
  if (existing) return;

  const totalPoints = pack.points + pack.bonus;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pointBalance: true },
  });
  if (!user) return;

  const balanceAfter = user.pointBalance + totalPoints;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { pointBalance: { increment: totalPoints } },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId,
        type: "PURCHASE_POINTS",
        amount: totalPoints,
        balanceAfter,
        refId: checkoutSession.id,
      },
    }),
  ]);
}
