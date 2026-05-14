import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const checks = [
    ["User", () => prisma.user.count()],
    ["Organization", () => prisma.organization.count()],
    ["Category", () => prisma.category.count()],
    ["Post", () => prisma.post.count()],
    ["Page", () => prisma.page.count()],
    ["Menu", () => prisma.menu.count()],
    ["SiteSetting", () => prisma.siteSetting.count()],
  ] as const;

  for (const [name, count] of checks) {
    const rows = await count();
    console.log(`${name}: ${rows}`);
  }
}

main()
  .catch((error) => {
    console.error("Database verification failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
