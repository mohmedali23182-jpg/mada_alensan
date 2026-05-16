import PageWrapper from "@/components/layout/PageWrapper";
import PageHero from "@/components/ui/PageHero";
import ContactClient from "@/components/forms/ContactClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "تواصل مع فريق مدى الإنسان عبر أي وسيلة تناسبك.",
};

export default function ContactPage() {
  return (
    <PageWrapper>
      <PageHero
        badge="تواصل معنا"
        title="تواصل معنا"
        subtitle="نحن هنا للاستماع. تواصل معنا بأي طريقة تناسبك"
      />
      <ContactClient />
    </PageWrapper>
  );
}
