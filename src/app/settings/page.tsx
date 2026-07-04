export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "設定" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/settings");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      area: true,
      email: true,
    },
  });

  if (!user) redirect("/auth/login");

  return <SettingsClient user={user} />;
}
