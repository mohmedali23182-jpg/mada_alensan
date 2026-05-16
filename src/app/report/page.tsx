import PageWrapper from "@/components/layout/PageWrapper";
import PageHero from "@/components/ui/PageHero";
import ReportForm from "@/components/forms/ReportForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "بلّغ عن حالة",
  description: "أرسل بلاغاً عن حالة إنسانية عاجلة وسيتابعها فريق مدى الإنسان.",
};

export default function ReportPage() {
  return (
    <PageWrapper>
      <PageHero
        badge="بلّغ عن حالة"
        badgeColor="#B84C4C"
        title="بلّغ عن حالة"
        subtitle="هل تعلم عن حالة إنسانية عاجلة؟ أخبرنا وسيتولى فريقنا التحقق والمتابعة."
      />
      <section className="py-16 md:py-20 bg-ivory">
        <div className="max-w-2xl mx-auto px-4 md:px-6">
          <ReportForm />
        </div>
      </section>
    </PageWrapper>
  );
}
