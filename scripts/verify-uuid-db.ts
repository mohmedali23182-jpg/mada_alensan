import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const requiredTables = [
  "Organization", "User", "Contributor", "Category", "Region", "Post", "PostSeo",
  "PostBlock", "PostRevision", "PostWorkflowEvent", "Tag", "PostTag", "PostStats",
  "PostView", "Comment", "PostReaction", "Bookmark", "Case", "CaseUpdate", "Submission",
  "ContactMessage", "Media", "PostMedia", "Page", "Menu", "MenuItem", "Redirect",
  "NewsletterSubscriber", "SocialLink", "SiteSetting", "ActivityLog", "TelegramDraft", "TelegramPublishLog",
];

async function main() {
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
  `;
  const found = new Set(tables.map((t) => t.table_name));
  const missing = requiredTables.filter((name) => !found.has(name));

  const nonUuidIds = await prisma.$queryRaw<Array<{ table_name: string; column_name: string; data_type: string }>>`
    select table_name, column_name, data_type
    from information_schema.columns
    where table_schema = 'public'
      and column_name = 'id'
      and data_type <> 'uuid'
  `;

  const counts = await Promise.all([
    prisma.organization.count().then((count) => ["Organization", count] as const),
    prisma.user.count().then((count) => ["User", count] as const),
    prisma.category.count().then((count) => ["Category", count] as const),
    prisma.region.count().then((count) => ["Region", count] as const),
    prisma.page.count().then((count) => ["Page", count] as const),
    prisma.menu.count().then((count) => ["Menu", count] as const),
    prisma.menuItem.count().then((count) => ["MenuItem", count] as const),
    prisma.siteSetting.count().then((count) => ["SiteSetting", count] as const),
  ]);

  console.log("Required tables:", missing.length ? `MISSING: ${missing.join(", ")}` : "OK");
  console.log("UUID id columns:", nonUuidIds.length ? nonUuidIds : "OK");
  for (const [name, count] of counts) console.log(`${name}: ${count}`);

  if (missing.length || nonUuidIds.length) process.exit(1);
}

main()
  .catch((error) => {
    console.error("UUID DB verification failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
