import SectionCard from "@/components/ui/SectionCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { getActiveSections } from "@/lib/sections";
import { prisma } from "@/lib/prisma";
import type { ArticleCategory } from "@/lib/types";

function uiCategoryFromSlug(slug: string): ArticleCategory | string {
  if (["news", "life", "stories", "letters", "issues", "opinions"].includes(slug)) return slug;
  return slug;
}

export default async function SectionsGrid() {
  const sections = getActiveSections();
  const dbCategories = await prisma.category.findMany({ where: { isActive: true }, include: { _count: { select: { posts: true } } }, orderBy: [{ order: "asc" }, { name: "asc" }] }).catch(() => []);
  const sectionItems = dbCategories.length ? dbCategories.map((cat: any) => ({ id: cat.id, slug: uiCategoryFromSlug(cat.slug), label: cat.name, description: cat.description || undefined, icon: cat.icon || undefined, color: cat.color || undefined, isActive: cat.isActive, order: cat.order, count: cat._count.posts })) : sections.map((section) => ({ ...section, count: 0 }));

  return (
    <section className="py-16 md:py-20 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader title="أقسام المنصة" subtitle="تصفح محتوى المنصة حسب الموضوع الذي يعنيك" centered />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sectionItems.map((section: any) => <SectionCard key={section.id} section={section} articleCount={section.count} />)}
        </div>
      </div>
    </section>
  );
}
