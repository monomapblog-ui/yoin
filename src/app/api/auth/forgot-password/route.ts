import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  // Always return ok to avoid email enumeration
  if (!user) return NextResponse.json({ ok: true });

  const identifier = `reset:${email}`;
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  if (process.env.RESEND_API_KEY) {
    try {
      await sendPasswordResetEmail(email, token);
    } catch (err) {
      console.error("Password reset email send failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
