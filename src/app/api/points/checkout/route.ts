import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { POINT_PACKS } from "@/lib/points";

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { packId } = await req.json();
  const pack = POINT_PACKS[packId as string];
  if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });

  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: { name: `yoin ポイント ${pack.label}` },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        packId,
      },
      success_url: `${BASE_URL}/points?success=1`,
      cancel_url: `${BASE_URL}/points?canceled=1`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "決済セッションの作成に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    return NextResponse.json({ error: "決済セッションの作成に失敗しました" }, { status: 500 });
  }
}
