import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, emailVerified: true } });
  if (!user) return NextResponse.json({ ok: true }); // 存在確認を漏らさない
  if (user.emailVerified) return NextResponse.json({ ok: true }); // 既に認証済み

  // 古いトークンを削除して新しく作成
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  if (process.env.RESEND_API_KEY) {
    try {
      await sendVerificationEmail(email, token);
    } catch (err) {
      console.error("Verification email send failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
