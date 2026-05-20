import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/api-token-auth";
import { jsonOk } from "@/lib/http-json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { user, errorResponse } = await requireAdminPermission("dashboard:read");
  if (errorResponse) return errorResponse;

  try {
    const [postsCount, casesCount, contributorsCount, submissionsCount] = await Promise.all([
      prisma.post.count(),
      prisma.case.count(),
      prisma.contributor.count({ where: { isActive: true } }),
      prisma.submission.count(),
    ]);

    const latestPosts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        contributor: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    const urgentCases = await prisma.case.findMany({
      orderBy: [{ urgencyLevel: "desc" }, { updatedAt: "desc" }],
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        urgencyLevel: true,
        region: { select: { name: true } },
      },
    });

    return jsonOk({
      stats: {
        posts: postsCount,
        cases: casesCount,
        contributors: contributorsCount,
        submissions: submissionsCount,
      },
      latestPosts,
      urgentCases,
    });
  } catch (error) {
    console.error("GET /api/v1/admin/dashboard error:", error);
    return jsonOk({
      stats: { posts: 0, cases: 0, contributors: 0, submissions: 0 },
      latestPosts: [],
      urgentCases: [],
      warning: "حدث خطأ أثناء جلب بعض البيانات",
    });
  }
}
