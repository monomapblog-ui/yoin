import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "入力内容が正しくありません" }, { status: 400 });
  }

  const record = await prisma.verificationToken.findFirst({
    where: { token, identifier: { startsWith: "reset:" } },
  });

  if (!record) {
    return NextResponse.json({ error: "リンクが無効です" }, { status: 400 });
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier: record.identifier, token } } });
    return NextResponse.json({ error: "リンクの有効期限が切れています" }, { status: 400 });
  }

  const email = record.identifier.replace(/^reset:/, "");
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { passwordHash } }),
    prisma.verificationToken.delete({ where: { identifier_token: { identifier: record.identifier, token } } }),
  ]);

  return NextResponse.json({ ok: true });
}
