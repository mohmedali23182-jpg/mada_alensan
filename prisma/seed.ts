import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultCategories = [
  { name: "الأخبار الإنسانية", slug: "news", description: "أخبار وتقارير إنسانية مستقلة", icon: "Newspaper", color: "#0F766E", order: 1 },
  { name: "حياة الناس", slug: "life", description: "يوميات ومشاهد من حياة الناس", icon: "HeartHandshake", color: "#2F8F6B", order: 2 },
  { name: "قصة وكفاح", slug: "stories", description: "قصص صمود وكفاح", icon: "BookOpen", color: "#C99A3E", order: 3 },
  { name: "رسالة إنسان", slug: "letters", description: "مناشدات ورسائل إنسانية", icon: "Mail", color: "#B84C4C", order: 4 },
  { name: "قضايا وملفات", slug: "issues", description: "ملفات وقضايا قيد المتابعة", icon: "FolderOpen", color: "#0E1B2A", order: 5 },
  { name: "أقلام الناس", slug: "opinions", description: "مقالات المشاركين والكتّاب", icon: "PenTool", color: "#3E4652", order: 6 },
];

const defaultPages = [
  { title: "من نحن", slug: "about", content: "منصة مدى الناس مساحة تحريرية إنسانية مستقلة تركز على القصة، الإنسان، والصوت الذي لا يصل." },
  { title: "اتصل بنا", slug: "contact", content: "يمكنك التواصل مع فريق التحرير عبر نموذج الاتصال أو القنوات الرسمية للمنصة." },
  { title: "سياسة النشر", slug: "editorial-policy", content: "نراجع المواد قبل النشر، ونحترم الخصوصية، ونرفض المحتوى المضلل أو المسيء." },
  { title: "سياسة الخصوصية", slug: "privacy", content: "نحمي بيانات المرسلين والمساهمين ولا ننشر أي معلومات حساسة دون موافقة واضحة." },
];

async function upsertAdmin(email: string, password: string, name: string, role: UserRole = UserRole.OWNER, organizationId?: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role, isActive: true, organizationId },
    create: { name, email, passwordHash, role, isActive: true, organizationId },
  });
}

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: "mada-alinsan" },
    update: { name: "مدى الناس", locale: "ar-YE", timezone: "Asia/Aden" },
    create: { name: "مدى الناس", slug: "mada-alinsan", description: "منصة إنسانية، فكرية، ثقافية عربية", locale: "ar-YE", timezone: "Asia/Aden" },
  });

  const adminEmail = process.env.ADMIN_EMAIL || "admin@madannas.org";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-this-strong-password";
  const adminName = process.env.ADMIN_NAME || "مدير مدى الناس";

  await upsertAdmin(adminEmail, adminPassword, adminName, UserRole.OWNER, organization.id);
  const moatazPassword = process.env.MOATAZ_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (moatazPassword) {
    await upsertAdmin("mtzallqmy@gmail.com", moatazPassword, "معتز العلقمي", UserRole.OWNER, organization.id);
  }

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { ...category, isActive: true },
      create: { ...category, isActive: true },
    });
  }

  const regions = ["تعز", "عدن", "صنعاء", "إب", "ذمار", "الحديدة", "مأرب", "حضرموت"];
  for (const name of regions) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    await prisma.region.upsert({ where: { slug }, update: { name }, create: { name, slug, country: "اليمن", countryCode: "YE", keywords: [name] } });
  }

  for (const page of defaultPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: { ...page, status: "PUBLISHED", publishedAt: new Date() },
      create: { ...page, status: "PUBLISHED", publishedAt: new Date() },
    });
  }

  const mainMenu = await prisma.menu.upsert({
    where: { location_organizationId: { location: "header", organizationId: organization.id } },
    update: { name: "القائمة الرئيسية", isActive: true },
    create: { name: "القائمة الرئيسية", location: "header", isActive: true, organizationId: organization.id },
  });

  const menuItems = [
    { label: "الرئيسية", url: "/", order: 1 },
    { label: "الأخبار", url: "/news", order: 2, categorySlug: "news" },
    { label: "حياة الناس", url: "/life", order: 3, categorySlug: "life" },
    { label: "قصص", url: "/stories", order: 4, categorySlug: "stories" },
    { label: "قضايا", url: "/issues", order: 5, categorySlug: "issues" },
    { label: "أقلام", url: "/opinions", order: 6, categorySlug: "opinions" },
    { label: "اكتب معنا", url: "/write", order: 7 },
  ];

  for (const item of menuItems) {
    const category = item.categorySlug ? await prisma.category.findUnique({ where: { slug: item.categorySlug } }) : null;
    const existing = await prisma.menuItem.findFirst({ where: { menuId: mainMenu.id, label: item.label } });
    const data = { menuId: mainMenu.id, label: item.label, url: item.url, order: item.order, isActive: true, categoryId: category?.id || null };
    if (existing) await prisma.menuItem.update({ where: { id: existing.id }, data });
    else await prisma.menuItem.create({ data });
  }

  await prisma.siteSetting.upsert({
    where: { key: "site_identity" },
    update: { value: { name: "مدى الناس", slogan: "نمدّ صوت الإنسان… حتى لا تبقى القصة وحيدة", locale: "ar-YE", timezone: "Asia/Aden" }, group: "identity", type: "json", isPublic: true, organizationId: organization.id },
    create: { key: "site_identity", value: { name: "مدى الناس", slogan: "نمدّ صوت الإنسان… حتى لا تبقى القصة وحيدة", locale: "ar-YE", timezone: "Asia/Aden" }, group: "identity", type: "json", isPublic: true, organizationId: organization.id },
  });

  await prisma.siteSetting.upsert({
    where: { key: "editorial_policy" },
    update: { value: { noDemoContent: true, reviewBeforePublish: true, respectPrivacy: true, revisions: true, workflow: true }, group: "editorial", type: "json", isPublic: false, organizationId: organization.id },
    create: { key: "editorial_policy", value: { noDemoContent: true, reviewBeforePublish: true, respectPrivacy: true, revisions: true, workflow: true }, group: "editorial", type: "json", isPublic: false, organizationId: organization.id },
  });

  await prisma.siteSetting.upsert({
    where: { key: "seo_defaults" },
    update: { value: { defaultTitle: "مدى الناس", defaultDescription: "منصة إنسانية، فكرية، ثقافية عربية", defaultOgImage: null, enableStructuredData: true }, group: "seo", type: "json", isPublic: true, organizationId: organization.id },
    create: { key: "seo_defaults", value: { defaultTitle: "مدى الناس", defaultDescription: "منصة إنسانية، فكرية، ثقافية عربية", defaultOgImage: null, enableStructuredData: true }, group: "seo", type: "json", isPublic: true, organizationId: organization.id },
  });

  console.log("Seed completed. Admins:", adminEmail, "mtzallqmy@gmail.com");
}

main().finally(async () => prisma.$disconnect());
