import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const AREA_TAGS = [
  { name: "新宿",     slug: "shinjuku" },
  { name: "渋谷",     slug: "shibuya" },
  { name: "池袋",     slug: "ikebukuro" },
  { name: "銀座",     slug: "ginza" },
  { name: "品川",     slug: "shinagawa" },
  { name: "上野",     slug: "ueno" },
  { name: "秋葉原",   slug: "akihabara" },
  { name: "六本木",   slug: "roppongi" },
  { name: "恵比寿",   slug: "ebisu" },
  { name: "吉祥寺",   slug: "kichijoji" },
  { name: "横浜",     slug: "yokohama" },
  { name: "川崎",     slug: "kawasaki" },
  { name: "大阪",     slug: "osaka" },
  { name: "梅田",     slug: "umeda" },
  { name: "難波",     slug: "namba" },
  { name: "心斎橋",   slug: "shinsaibashi" },
  { name: "名古屋",   slug: "nagoya" },
  { name: "栄",       slug: "sakae" },
  { name: "京都",     slug: "kyoto" },
  { name: "神戸",     slug: "kobe" },
  { name: "札幌",     slug: "sapporo" },
  { name: "仙台",     slug: "sendai" },
  { name: "福岡",     slug: "fukuoka" },
  { name: "博多",     slug: "hakata" },
  { name: "天神",     slug: "tenjin" },
  { name: "広島",     slug: "hiroshima" },
];

const SERVICE_TAGS = [
  { name: "メンズエステ",   slug: "mens-esthe" },
  { name: "アロマ",         slug: "aroma" },
  { name: "タイ古式",       slug: "thai-massage" },
  { name: "リンパ",         slug: "lymph" },
  { name: "ヌード系",       slug: "nude" },
  { name: "オイルマッサージ", slug: "oil-massage" },
  { name: "四つ手",         slug: "yottsu-de" },
  { name: "密着",           slug: "missyaku" },
  { name: "VIP個室",        slug: "vip" },
  { name: "出張・派遣",      slug: "dispatch" },
];

const PRICE_TAGS = [
  { name: "〜5,000円",          slug: "under-5000" },
  { name: "5,000〜10,000円",    slug: "5000-10000" },
  { name: "10,000〜20,000円",   slug: "10000-20000" },
  { name: "20,000円〜",         slug: "over-20000" },
];

async function main() {
  console.log("🌱 Seeding database...");

  // エリアタグ
  for (const tag of AREA_TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, category: "AREA" },
      create: { ...tag, category: "AREA" },
    });
  }
  console.log(`✅ Area tags: ${AREA_TAGS.length} upserted`);

  // サービスタグ
  for (const tag of SERVICE_TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, category: "SERVICE" },
      create: { ...tag, category: "SERVICE" },
    });
  }
  console.log(`✅ Service tags: ${SERVICE_TAGS.length} upserted`);

  // 価格タグ
  for (const tag of PRICE_TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, category: "PRICE" },
      create: { ...tag, category: "PRICE" },
    });
  }
  console.log(`✅ Price tags: ${PRICE_TAGS.length} upserted`);

  // 管理者アカウント（環境変数がある場合のみ）
  const adminEmail    = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN" },
      create: {
        email: adminEmail,
        passwordHash,
        displayName: "管理者",
        role: "ADMIN",
      },
    });
    console.log(`✅ Admin user: ${adminEmail}`);
  } else {
    console.log("⚠️  ADMIN_EMAIL / ADMIN_PASSWORD が未設定のためスキップ");
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
