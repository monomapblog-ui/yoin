import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { email, password, displayName } = await req.json();

  if (!email || !password || !displayName) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "メールアドレスの形式が正しくありません" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "パスワードは8文字以上で設定してください" }, { status: 400 });
  }
  if (typeof displayName !== "string" || displayName.trim().length < 1 || displayName.length > 50) {
    return NextResponse.json({ error: "表示名は1〜50文字で設定してください" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "このメールアドレスは既に登録済みです" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, passwordHash, displayName: displayName.trim() },
    select: { id: true, email: true, displayName: true },
  });

  // メール認証トークン生成・送信
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  // Resend API キーがあればメール送信、なければスキップ（開発環境）
  if (process.env.RESEND_API_KEY) {
    try {
      await sendVerificationEmail(email, token);
    } catch (err) {
      console.error("Email send failed:", err);
      // メール送信失敗でも登録は完了とする
    }
  }

  return NextResponse.json(
    {
      user,
      message: process.env.RESEND_API_KEY
        ? "確認メールを送信しました。メールボックスをご確認ください。"
        : "登録が完了しました。",
    },
    { status: 201 }
  );
}
