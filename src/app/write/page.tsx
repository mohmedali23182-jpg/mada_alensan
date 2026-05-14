import PageWrapper from "@/components/layout/PageWrapper";
import PageHero from "@/components/ui/PageHero";
import WriteForm from "@/components/forms/WriteForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "اكتب معنا",
  description: "أرسل مقالك إلى مدى الناس وسننشره باسمك بعد المراجعة التحريرية.",
};

export default function WritePage() {
  return (
    <PageWrapper>
      <PageHero
        badge="اكتب معنا"
        badgeColor="#2F8F6B"
        title="اكتب معنا"
        subtitle="هل لديك مقال يلامس حياة الناس؟ أرسله وسننشره باسمك بعد المراجعة التحريرية."
      />
      <section className="py-16 md:py-20 bg-ivory">
        <div className="max-w-2xl mx-auto px-4 md:px-6">
          <WriteForm />
        </div>
      </section>
    </PageWrapper>
  );
}
