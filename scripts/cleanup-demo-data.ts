import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting demo cleanup...");

  const moatazPassword = process.env.MOATAZ_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (moatazPassword) {
    const passwordHash = await bcrypt.hash(moatazPassword, 12);
    await prisma.user.upsert({
      where: { email: "mtzallqmy@gmail.com" },
      update: { passwordHash, role: UserRole.OWNER, name: "معتز العلقمي", isActive: true },
      create: { email: "mtzallqmy@gmail.com", passwordHash, role: UserRole.OWNER, name: "معتز العلقمي", isActive: true },
    });
  }

  await prisma.postTag.deleteMany({});
  await prisma.media.deleteMany({});
  await prisma.caseUpdate.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.case.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.contributor.deleteMany({});
  await prisma.contactMessage.deleteMany({});

  const categories = [
    { name: "الأخبار الإنسانية", slug: "news", order: 1, icon: "Newspaper", color: "#0F766E" },
    { name: "حياة الناس", slug: "life", order: 2, icon: "HeartHandshake", color: "#2F8F6B" },
    { name: "قصة وكفاح", slug: "stories", order: 3, icon: "BookOpen", color: "#C99A3E" },
    { name: "رسالة إنسان", slug: "letters", order: 4, icon: "Mail", color: "#B84C4C" },
    { name: "قضايا وملفات", slug: "issues", order: 5, icon: "FolderOpen", color: "#0E1B2A" },
    { name: "أقلام الناس", slug: "opinions", order: 6, icon: "PenTool", color: "#3E4652" },
  ];
  await prisma.category.updateMany({ data: { isActive: false } });
  for (const category of categories) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: { ...category, isActive: true }, create: { ...category, isActive: true } });
  }

  console.log("Cleanup completed. The site now has no demo articles/cases/submissions.");
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => prisma.$disconnect());
