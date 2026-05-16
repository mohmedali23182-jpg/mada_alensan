import PageWrapper from "@/components/layout/PageWrapper";
import PageHero from "@/components/ui/PageHero";
import { Heart, Eye, Target, Shield, Users, BookOpen, UserRound } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرّف على منصة مدى الإنسان - منصة إنسانية - اجتماعية - ثقافية - علمية - متنوعة.",
};

const VALUES = [
  {
    icon: Heart,
    title: "الإنسانية أولاً",
    desc: "نضع الإنسان ومعاناته في مركز كل ما ننشره. لا قضية أصغر من أن تُروى.",
    color: "#B84C4C",
  },
  {
    icon: Eye,
    title: "الشفافية والمصداقية",
    desc: "نلتزم بالتحقق من كل قصة وقضية قبل نشرها، ونُبيّن مصادرنا بوضوح.",
    color: "#2F8F6B",
  },
  {
    icon: Shield,
    title: "الكرامة والاحترام",
    desc: "ننقل القصص بكرامة. لا صور صادمة، ولا انتهاك لخصوصية أصحاب القضايا.",
    color: "#0F766E",
  },
  {
    icon: Users,
    title: "المشاركة المجتمعية",
    desc: "المنصة من الناس وللناس. كل مشاركة، قصة، أو مقال هو لبنة في صرح مشترك.",
    color: "#C99A3E",
  },
  {
    icon: Target,
    title: "الأثر الحقيقي",
    desc: "لا نكتفي بالنشر. نتابع القضايا حتى تجد طريقها إلى الحل أو تصل للجهات المعنية.",
    color: "#0E1B2A",
  },
  {
    icon: BookOpen,
    title: "الاستقلالية التحريرية",
    desc: "منصة مستقلة لا تنتمي لأي حزب أو جهة، ولا تخضع لأي ضغط سياسي أو تجاري.",
    color: "#C99A3E",
  },
];

const TEAM = [
  {
    name: "فريق التحرير",
    role: "المحررون والمراجعون",
    desc: "فريق من الصحفيين والكتّاب يراجع كل محتوى قبل النشر لضمان الدقة والكرامة.",
  },
  {
    name: "فريق التوثيق",
    role: "التحقق الميداني",
    desc: "يتحقق من القضايا الواردة ميدانياً ويتواصل مع أصحابها لجمع أكبر قدر من التفاصيل.",
  },
  {
    name: "فريق التقنية",
    role: "التطوير والتصميم",
    desc: "يعمل على تطوير المنصة وضمان تجربة مستخدم راقية تليق بجمهور مدى الإنسان.",
  },
];

export default function AboutPage() {
  return (
    <PageWrapper>
      <PageHero
        badge="من نحن"
        title="من نحن"
        subtitle="تعرّف على منصة مدى الإنسان، رسالتها، وفريق العمل خلفها"
      />

      <div className="bg-ivory">
        {/* القصة */}
        <section className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-20 text-center">
          <div className="w-16 h-16 bg-gold/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-bold font-kufi text-gold">م</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-cairo text-navy mb-4">
            لماذا مدى الإنسان؟
          </h2>
          <div className="w-14 h-1 bg-gold rounded-full mx-auto mb-6" />
          <div className="space-y-4 text-text font-tajawal leading-[2.2] text-base text-right">
            <p>
              في عالم تتدافع فيه الأخبار وتتراكم، تضيع قصص الناس البسيطين وراء عناوين السياسة والاقتصاد. الأم التي تكافح لتعليم أطفالها، العائلة النازحة التي تبني من الصفر، الطفل الذي يحتاج علاجاً لا يملك أسرته ثمنه — هؤلاء هم أصحاب القضايا الحقيقية.
            </p>
            <p>
              جاءت مدى الإنسان لتكون منصة إنسانية، اجتماعية، ثقافية، علمية، ومتنوعة. لا تكتفي بنقل القضايا أو الأحداث، بل تقدم محتوى يحمل تنوعًا معرفيًا ورسالة سامية تخدم الإنسان والمجتمع.
            </p>
            <p>
              «مدى» تعني البُعد والامتداد — نمدّ الأصوات وننقلها بعيداً، لأن لا قصة يجب أن تبقى وحيدة.
            </p>
          </div>
        </section>

        {/* الشعار والرسالة */}
        <section className="bg-navy py-14 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 50%, #C99A3E 0%, transparent 60%), radial-gradient(circle at 70% 50%, #2F8F6B 0%, transparent 60%)"
            }}
          />
          <div className="relative max-w-3xl mx-auto px-4 md:px-6 text-center">
            <p className="text-gold text-2xl md:text-3xl font-bold font-kufi leading-relaxed">
              «نمدّ صوت الإنسان…
            </p>
            <p className="text-white text-2xl md:text-3xl font-bold font-kufi leading-relaxed">
              حتى لا تبقى القصة وحيدة»
            </p>
            <div className="w-20 h-1 bg-gold rounded-full mx-auto mt-6" />
          </div>
        </section>

        {/* القيم */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-cairo text-navy mb-3">قيمنا</h2>
            <div className="w-14 h-1 bg-gold rounded-full mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl shadow-card p-6 flex gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${v.color}15` }}
                >
                  <v.icon size={22} style={{ color: v.color }} />
                </div>
                <div>
                  <h3 className="font-bold font-cairo text-navy text-base mb-1.5">{v.title}</h3>
                  <p className="text-text-light text-sm font-tajawal leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* الفريق */}
        <section className="bg-white py-16 md:py-20" id="team">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold font-cairo text-navy mb-3">
                فريق العمل
              </h2>
              <div className="w-14 h-1 bg-gold rounded-full mx-auto mb-4" />
              <p className="text-text-light text-sm font-tajawal max-w-xl mx-auto">
                فريق صغير يعمل بشغف كبير لإيصال أصوات الناس
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {TEAM.map((member) => (
                <div key={member.name} className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-navy/10 text-navy ring-4 ring-gold/20" aria-hidden="true">
                    <UserRound size={34} />
                  </div>
                  <h3 className="font-bold font-cairo text-navy text-base">{member.name}</h3>
                  <p className="text-gold text-xs font-tajawal mb-3">{member.role}</p>
                  <p className="text-text-light text-sm font-tajawal leading-relaxed">{member.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* سياسة النشر */}
        <section className="max-w-3xl mx-auto px-4 md:px-6 py-16" id="policy">
          <h2 className="text-2xl font-bold font-cairo text-navy mb-4">سياسة النشر</h2>
          <div className="w-14 h-1 bg-gold rounded-full mb-8" />
          <div className="space-y-4 text-text font-tajawal leading-[2] text-sm">
            {[
              "نلتزم بالتحقق من صحة المعلومات قبل نشرها.",
              "لا ننشر صوراً صادمة أو مسيئة لكرامة الإنسان.",
              "نحترم حق الأشخاص في طلب عدم ذكر أسمائهم.",
              "نُصحح الأخطاء فور اكتشافها ونُبيّن ذلك للقراء.",
              "لا نقبل محتوى يحرّض على الكراهية أو العنف.",
              "كل المقالات تمر بمراجعة تحريرية قبل النشر.",
              "نحتفظ بالحق في رفض أي محتوى لا يتوافق مع قيم المنصة.",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gold/15 rounded-full flex items-center justify-center text-gold text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
