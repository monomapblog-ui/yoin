import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import WriteClient from "./WriteClient";

export const metadata = { title: "記事を書く" };

export default async function WritePage() {
  const session = await auth();
  if (!session) redirect("/auth/login?callbackUrl=/write");
  return <WriteClient />;
}
