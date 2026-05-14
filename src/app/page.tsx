import PageWrapper from "@/components/layout/PageWrapper";
import HeroSection from "@/components/home/HeroSection";
import SectionsGrid from "@/components/home/SectionsGrid";
import FeaturedStory from "@/components/home/FeaturedStory";
import LatestArticles from "@/components/home/LatestArticles";
import ActiveCases from "@/components/home/ActiveCases";
import OpinionsSection from "@/components/home/OpinionsSection";
import StatsSection from "@/components/home/StatsSection";
import CallToAction from "@/components/home/CallToAction";
import WriteWithUsBanner from "@/components/ui/WriteWithUsBanner";
import { getFeaturedArticlesFromDb, getStatsFromDb } from "@/lib/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
  const [featuredArticles, stats] = await Promise.all([getFeaturedArticlesFromDb(1), getStatsFromDb()]);
  const featuredStory = featuredArticles[0];

  return (
    <PageWrapper>
      <HeroSection stats={stats} />
      <SectionsGrid />
      {featuredStory && <section className="py-16 md:py-20 bg-white"><div className="max-w-7xl mx-auto px-4 md:px-6"><div className="flex items-end justify-between gap-4 mb-8 md:mb-10"><div><h2 className="text-2xl md:text-3xl font-bold font-cairo text-navy mb-3">قصة اليوم</h2><div className="w-14 h-1 rounded-full bg-gold" /></div></div><FeaturedStory article={featuredStory} /></div></section>}
      <LatestArticles />
      <ActiveCases />
      <OpinionsSection />
      <StatsSection />
      <CallToAction />
      <section className="py-12 bg-white"><div className="max-w-3xl mx-auto px-4 md:px-6"><WriteWithUsBanner /></div></section>
    </PageWrapper>
  );
}
