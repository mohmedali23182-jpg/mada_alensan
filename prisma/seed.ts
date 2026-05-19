import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultCategories = [
  ["الأخبار الإنسانية", "news", "أخبار وتقارير إنسانية مستقلة", "Newspaper", "#0F766E"],
  ["حياة الناس", "life", "يوميات ومشاهد من حياة الناس", "HeartHandshake", "#2F8F6B"],
  ["قصة وكفاح", "stories", "قصص صمود وكفاح", "BookOpen", "#C99A3E"],
  ["رسالة إنسان", "letters", "مناشدات ورسائل إنسانية", "Mail", "#B84C4C"],
  ["قضايا وملفات", "issues", "ملفات وقضايا قيد المتابعة", "FolderOpen", "#0E1B2A"],
  ["أقلام الناس", "opinions", "مقالات المشاركين والكتّاب", "PenTool", "#3E4652"],
];

async function upsertAdmin(email: string, password: string, name: string, role: UserRole = UserRole.OWNER) {
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role, isActive: true },
    create: { name, email, passwordHash, role, isActive: true },
  });
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@madannas.org";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-this-strong-password";
  const adminName = process.env.ADMIN_NAME || "مدير مدى الإنسان";

  await upsertAdmin(adminEmail, adminPassword, adminName, UserRole.OWNER);
  const moatazPassword = process.env.MOATAZ_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (moatazPassword) {
    await upsertAdmin("mtzallqmy@gmail.com", moatazPassword, "معتز العلقمي", UserRole.OWNER);
  }

  for (let i = 0; i < defaultCategories.length; i++) {
    const [name, slug, description, icon, color] = defaultCategories[i];
    await prisma.category.upsert({
      where: { slug },
      update: { name, description, icon, color, order: i + 1, isActive: true },
      create: { name, slug, description, icon, color, order: i + 1, isActive: true },
    });
  }

  const regions = ["تعز", "عدن", "صنعاء", "إب", "ذمار", "الحديدة", "مأرب", "حضرموت"];
  for (const name of regions) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    await prisma.region.upsert({ where: { slug }, update: { name }, create: { name, slug, country: "اليمن", countryCode: "YE", keywords: [name] } });
  }

  await prisma.siteSetting.upsert({
    where: { key: "site_identity" },
    update: { value: { name: "مدى الإنسان", slogan: "نمدّ صوت الإنسان… حتى لا تبقى القصة وحيدة" } },
    create: { key: "site_identity", value: { name: "مدى الإنسان", slogan: "نمدّ صوت الإنسان… حتى لا تبقى القصة وحيدة" } },
  });

  await prisma.siteSetting.upsert({
    where: { key: "editorial_policy" },
    update: { value: { noDemoContent: true, reviewBeforePublish: true, respectPrivacy: true } },
    create: { key: "editorial_policy", value: { noDemoContent: true, reviewBeforePublish: true, respectPrivacy: true } },
  });

  console.log("Seed completed. Admins:", adminEmail, "mtzallqmy@gmail.com");
}

main().finally(async () => prisma.$disconnect());
