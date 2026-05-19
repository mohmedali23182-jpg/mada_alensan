import PageWrapper from "@/components/layout/PageWrapper";
import PageHero from "@/components/ui/PageHero";
import SendStoryForm from "@/components/forms/SendStoryForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "أرسل قصتك",
  description: "شارك قصتك الإنسانية مع مدى الناس وسننقلها للعالم بكرامة.",
};

export default function SendStoryPage() {
  return (
    <PageWrapper>
      <PageHero
        badge="أرسل قصتك"
        badgeColor="#C99A3E"
        title="أرسل قصتك"
        subtitle="قصتك تستحق أن تُروى. شاركنا تجربتك وسننقلها للعالم بكرامة ووضوح."
      />
      <section className="py-16 md:py-20 bg-ivory">
        <div className="max-w-2xl mx-auto px-4 md:px-6">
          <SendStoryForm />
        </div>
      </section>
    </PageWrapper>
  );
}
