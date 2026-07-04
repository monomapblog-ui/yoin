import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { displayName, bio, area, avatarUrl } = await req.json();

  if (displayName !== undefined && (typeof displayName !== "string" || displayName.length > 50)) {
    return NextResponse.json({ error: "表示名は50文字以内です" }, { status: 400 });
  }
  if (bio !== undefined && (typeof bio !== "string" || bio.length > 200)) {
    return NextResponse.json({ error: "自己紹介は200文字以内です" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(area !== undefined && { area }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
    select: { id: true, displayName: true, bio: true, area: true, avatarUrl: true },
  });

  return NextResponse.json(user);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, displayName: true, bio: true,
      avatarUrl: true, area: true, email: true, pointBalance: true, role: true,
    },
  });

  return NextResponse.json(user);
}
