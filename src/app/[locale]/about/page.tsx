import React from "react";
import Link from "next/link";
import { getDictionary, isRtlLocale } from "@/lib/localization";
import {
  GraduationCap,
  Sparkles,
  Award,
  Globe2,
  ShieldCheck,
  BookOpen,
  Heart,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const dict = getDictionary(locale);

  const values = [
    {
      titleEn: "Child-Safety & Privacy Centric",
      titleAr: "أولوية مطلقة لسلامة الطفل وخصوصيته",
      descEn: "Engineered from the ground up to comply with COPPA and GDPR-K. No unmoderated peer messaging, encrypted voice recordings, and strictly vetted educators.",
      descAr: "صُممت المنصة وفق أعلى معايير الخصوصية العالمية COPPA وGDPR-K. لا رسائل غير خاضعة للإشراف، تسجيلات مشفرة، ومعلمون معتمدون بعد تدقيق أمني وأكاديمي شامل.",
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
    },
    {
      titleEn: "Accredited CEFR Pedagogy",
      titleAr: "منهجية أكاديمية معتمدة وفق معايير CEFR",
      descEn: "Our 7 academic programs map directly to Common European Framework of Reference levels (Pre-A1 to B2), ensuring measurable milestones and international recognition.",
      descAr: "تتوافق برامجنا الأكاديمية السبعة مع الإطار الأوروبي المرجعي المشترك للغات (من Pre-A1 إلى B2)، مما يضمن مخرجات تعليمية قابلة للقياس والاعتماد الدولي.",
      icon: <Award className="w-8 h-8 text-brand-600" />,
    },
    {
      titleEn: "Authentic Cultural & Islamic Values",
      titleAr: "غرس القيم الإسلامية والهوية الثقافية",
      descEn: "We nurture a genuine love for Arabic and Quranic recitation through inspiring stories of prophets, noble virtues, and rich Arab cultural heritage.",
      descAr: "نغرس في نفوس أطفالنا حب لغة القرآن وقيم الأدب الإسلامي من خلال قصص الأنبياء والتراث العربي الأصيل بطريقة محببة وعصرية.",
      icon: <Heart className="w-8 h-8 text-pink-600" />,
    },
    {
      titleEn: "Total Parent Transparency",
      titleAr: "شراكة كاملة وشفافية تامة مع الأسرة",
      descEn: "Parents are our partners. We provide weekly milestone summaries, recorded lesson access, and direct advisory channels with lead instructors.",
      descAr: "الأسرة شريك أساسي في النجاح. نوفر تقارير أسبوعية تفصيلية، وتسجيلات كاملة للحصص، وخطوط تواصل مباشرة مع المعلمين.",
      icon: <Users className="w-8 h-8 text-purple-600" />,
    },
  ];

  const faculty = [
    {
      nameAr: "الأستاذ أحمد المنصوري",
      nameEn: "Ustadh Ahmed Al-Mansouri",
      roleEn: "Senior Reading & Tajweed Specialist",
      roleAr: "كبير معلمي القراءة والتجويد",
      expEn: "12+ years experience in children's phonics & Ten Qira'at",
      expAr: "أكثر من 12 عاماً في تعليم الأصوات القرائية والقراءات العشر",
    },
    {
      nameAr: "الأستاذة فاطمة الزهراء الشامي",
      nameEn: "Ustadha Fatima Al-Zahra",
      roleEn: "Calligraphy & Early Childhood Specialist",
      roleAr: "أخصائية الخط العربي وأدب الطفل",
      expEn: "9+ years in Naskh penmanship & Arabic children's literature",
      expAr: "9 سنوات في تعليم خط النسخ وتأليف القصص المصورة للأطفال",
    },
    {
      nameAr: "الشيخ محمود الأزهري",
      nameEn: "Sheikh Mahmoud Al-Azhari",
      roleEn: "Head of Quranic & Islamic Studies",
      roleAr: "رئيس قسم الدراسات القرآنية والقيم",
      expEn: "15+ years teaching applied Tajweed & prophetic biography",
      expAr: "15 عاماً في تدريس التجويد التطبيقي والسيرة النبوية للأجيال",
    },
    {
      nameAr: "الأستاذة ليلى نور الدين",
      nameEn: "Ustadha Layla Nour El-Din",
      roleEn: "Foundations & Speech Fluency Lead",
      roleAr: "مشرفة التأسيس والطلاقة الشفهية",
      expEn: "8+ years in early phonemic awareness & conversational fluency",
      expAr: "8 سنوات في تطوير الوعي الصوتي المبكر والطلاقة الحوارية",
    },
  ];

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-brand-950 via-slate-900 to-slate-900 text-white py-20 lg:py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <Globe2 className="w-4 h-4 text-brand-400" />
            <span>{isRtl ? "أكاديمية عالمية متخصصة في تعليم الأطفال" : "Serving Muslim & Arabic-Learning Families Worldwide"}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            {isRtl
              ? "نبني جيلاً يعتز بلغته، ويفهم قرآنه، ويتحدث بفصاحة"
              : "Building a Generation that Speaks Arabic with Pride & Love"}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? "تأسست أكاديمية براعم العربية لتكون الجسر التربوي والتعليمي الذي يربط أبناءنا في المهجر والشتات بلغتهم الأم وقيمهم الإسلامية من خلال أحدث تقنيات التعليم الرقمي التفاعلي."
              : "Founded to be the premier educational bridge connecting children in diaspora to their heritage language, the Holy Quran, and authentic values through interactive technology."}
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
            {isRtl ? "مبادئنا التربوية" : "Our Core Educational Principles"}
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isRtl ? "ما يميز أكاديمية براعم العربية" : "Why Families Across 30+ Countries Trust Us"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((v, idx) => (
            <div
              key={idx}
              className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                {v.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {isRtl ? v.titleAr : v.titleEn}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isRtl ? v.descAr : v.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Certified Faculty Showcase */}
      <section className="bg-white border-y border-slate-200/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
              {isRtl ? "الهيئة التعليمية المعتمدة" : "Certified Specialist Educators"}
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isRtl ? "نخبة من معلمي الطفولة وتجويد القرآن الكريم" : "Passionate Mentors Dedicated to Your Child's Success"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {faculty.map((f, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-slate-200 bg-slate-50/60 shadow-sm space-y-3 text-center"
              >
                <div className="w-16 h-16 rounded-full gradient-brand text-white mx-auto flex items-center justify-center font-bold text-lg shadow-md shadow-brand-500/20">
                  {isRtl ? f.nameAr[0] : f.nameEn[0]}
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isRtl ? f.nameAr : f.nameEn}
                </h3>
                <p className="text-xs font-bold text-brand-600">
                  {isRtl ? f.roleAr : f.roleEn}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isRtl ? f.expAr : f.expEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Impact Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-slate-900 to-brand-950 rounded-3xl p-8 sm:p-14 text-white shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-5xl font-black text-brand-400 mb-2">5,000+</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                {isRtl ? "طالب نشط حول العالم" : "Active Students Globally"}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-emerald-400 mb-2">30+</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                {isRtl ? "دولة في أوروبا وأمريكا" : "Countries in Diaspora"}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-amber-400 mb-2">150+</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                {isRtl ? "معلم معتمد بدوام كامل" : "Certified Native Teachers"}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-black text-purple-400 mb-2">98%</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                {isRtl ? "نسبة رضا أولياء الأمور" : "Parent Satisfaction Rate"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href={`/${locale}/programs`}
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-white gradient-brand rounded-2xl shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all"
          >
            <span>{isRtl ? "استكشف البرامج الأكاديمية السبعة" : "Explore The 7 Academic Programs"}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
