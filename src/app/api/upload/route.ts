import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const MAX_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "JPEG / PNG / WebP / GIF のみ対応しています" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "ファイルサイズは3MB以下にしてください" }, { status: 400 });
  }

  // Cloudinaryが設定されていれば優先使用
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    return uploadToCloudinary(file);
  }

  // ローカル保存（開発環境 / VPS）
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(join(uploadDir, filename), Buffer.from(bytes));

  return NextResponse.json({ url: `/uploads/${filename}` });
}

async function uploadToCloudinary(file: File): Promise<NextResponse> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = `folder=yoin&timestamp=${timestamp}${apiSecret}`;
  const { createHash } = await import("crypto");
  const signature = createHash("sha1").update(params).digest("hex");

  const body = new URLSearchParams({
    file: dataUri,
    api_key: apiKey,
    timestamp,
    signature,
    folder: "yoin",
  });

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });

  if (!res.ok) return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });

  const data = await res.json();
  return NextResponse.json({ url: data.secure_url });
}
