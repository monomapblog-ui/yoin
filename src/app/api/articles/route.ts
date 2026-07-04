import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = parseInt(searchParams.get("perPage") ?? "12");
  const sort = searchParams.get("sort") ?? "new";
  const area = searchParams.get("area");
  const service = searchParams.get("service");
  const q = searchParams.get("q");

  const where = {
    status: "PUBLISHED" as const,
    ...(area && { tags: { some: { tag: { slug: area, category: "AREA" as const } } } }),
    ...(service && { tags: { some: { tag: { slug: service, category: "SERVICE" as const } } } }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { summary: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const orderBy =
    sort === "popular" ? { viewCount: "desc" as const }
    : sort === "selling" ? { purchases: { _count: "desc" as const } }
    : { publishedAt: "desc" as const };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where, orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true, title: true, summary: true, thumbnailUrl: true,
        pricePt: true, viewCount: true, likeCount: true, publishedAt: true,
        user: { select: { id: true, displayName: true, avatarUrl: true } },
        tags: { select: { tag: { select: { id: true, name: true, slug: true, category: true } } } },
        _count: { select: { purchases: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, perPage, totalPages: Math.ceil(total / perPage) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const { title, body, summary, pricePt, thumbnailUrl, tags, status } = await req.json();

  if (!title?.trim()) return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });

  const article = await prisma.article.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      body: body ?? "",
      summary: summary?.trim() || null,
      pricePt: pricePt ?? 0,
      thumbnailUrl: thumbnailUrl || null,
      status: status ?? "DRAFT",
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      tags: tags?.length
        ? {
            create: await Promise.all(
              (tags as string[]).map(async (name: string) => {
                const slug = name.toLowerCase().replace(/\s+/g, "-");
                const tag = await prisma.tag.upsert({
                  where: { slug },
                  update: {},
                  create: { name, slug, category: "FREE" },
                });
                return { tagId: tag.id };
              })
            ),
          }
        : undefined,
    },
  });

  return NextResponse.json({ id: article.id }, { status: 201 });
}
