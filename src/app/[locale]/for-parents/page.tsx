import React from "react";
import Link from "next/link";
import { getDictionary, isRtlLocale } from "@/lib/localization";
import {
  Heart,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Video,
  FileText,
  Calendar,
  MessageCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  Printer,
  Users,
} from "lucide-react";

export default async function ForParentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const dict = getDictionary(locale);

  const pillars = [
    {
      titleEn: "Real-Time Milestone Tracking",
      titleAr: "متابعة فورية لتطور مستوى طفلك",
      descEn: "Watch your child's vocabulary count grow, track phoneme accuracy scores, and view completed curriculum units in real time.",
      descAr: "شاهد نمو حصيلة طفلك اللغوية، واطلع على دقة نطق الحروف، وتابع إنجاز الوحدات الدراسية أولاً بأول.",
      icon: <TrendingUp className="w-8 h-8 text-brand-600" />,
    },
    {
      titleEn: "Recorded Sessions & Playback",
      titleAr: "تسجيلات كاملة للحصص المباشرة",
      descEn: "Every live micro-cohort class is recorded and accessible to you within 60 minutes for effortless review or catching up on missed lessons.",
      descAr: "تُسجل كل حصة مباشرة وتتاح في لوحة تحكمك خلال 60 دقيقة، لمراجعة الدروس أو تعويض الحصص التي تغيب عنها الطفل.",
      icon: <Video className="w-8 h-8 text-emerald-600" />,
    },
    {
      titleEn: "Direct Teacher Communication",
      titleAr: "تواصل مباشر وخاص مع المعلمين",
      descEn: "Send direct in-app messages to your child's certified instructor, request 1-on-1 parent-teacher conferences, and review written feedback.",
      descAr: "تواصل بأمان مع معلم طفلك المعتمد، واطلب اجتماعات فردية مرئية لمناقشة تقدمه، واطلع على ملاحظات المعلم بعد كل واجب.",
      icon: <MessageCircle className="w-8 h-8 text-purple-600" />,
    },
    {
      titleEn: "Curated Printable Worksheets",
      titleAr: "مكتبة أوراق عمل وأنشطة قابلة للطباعة",
      descEn: "Access a rich digital library of handwriting practice sheets, phonics tracing cards, and Quranic coloring pages for offline learning.",
      descAr: "حمل مئات أوراق العمل والأنشطة لتدريب طفلك على كتابة الحروف والخط العربي وأنشطة التلوين الهادفة بعيداً عن الشاشات.",
      icon: <Printer className="w-8 h-8 text-amber-600" />,
    },
  ];

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 lg:py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <Heart className="w-4 h-4 text-pink-400" />
            <span>{isRtl ? "شراكة تربوية قائمة على الشفافية والثقة" : "Built for Peace of Mind & Parent Empowerment"}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            {isRtl
              ? "أنت شريكنا في كل خطوة من رحلة طفلك نحو الفصاحة"
              : "Complete Visibility Into Your Child's Educational Journey"}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? "صممنا بوابة أولياء الأمور لتمنحك راحة البال، وتتيح لك متابعة تقدم أطفالك، والتواصل مع معلميهم، والاطلاع على تسجيلات الحصص بكل سهولة وأمان."
              : "Our dedicated Parent Portal gives you complete oversight: monitor attendance, watch live lesson replays, track vocabulary milestones, and consult with certified teachers."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/register`}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white gradient-brand rounded-2xl shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all"
            >
              <span>{isRtl ? "إنشاء حساب ولي أمر مجاناً" : "Create Free Parent Account"}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
            <Link
              href={`/${locale}/how-it-works`}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all"
            >
              <span>{isRtl ? "كيف تعمل المنصة؟" : "How It Works"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Pillars for Parents */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
            {isRtl ? "مميزات بوابة أولياء الأمور" : "Parent Portal Features"}
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isRtl ? "تحكم كامل وتواصل مستمر لضمان نجاح طفلك" : "Everything You Need to Nurture Your Child's Arabic"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                {p.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {isRtl ? p.titleAr : p.titleEn}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isRtl ? p.descAr : p.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Trust Banner */}
      <section className="bg-white border-y border-slate-200/80 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isRtl ? "حماية خصوصية طفلك هي أولويتنا القصوى" : "Built Around COPPA & GDPR-K Child Protection"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? "لا يمكن لأي طالب إنشاء حساب دون موافقة بالغة ومحققة من ولي الأمر. لا يتم تتبع طفلك للإعلانات، ولا توجد غرف محادثة مفتوحة غير مراقبة بين الأطفال."
              : "Children cannot register without verified adult consent. We never sell personal data, display advertisements, or allow unmonitored peer chat."}
          </p>
          <div>
            <Link
              href={`/${locale}/child-safety`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              <span>{isRtl ? "اقرأ ميثاق حماية وسلامة الطفل بالكامل" : "Read Our Full Child Safety Charter"}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gradient-to-r from-brand-600 to-purple-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-brand-500/20">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
            {isRtl ? "انضم إلى آلاف العائلات في 30+ دولة" : "Join Thousands of Families Across 30+ Countries"}
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            {isRtl
              ? "امنح طفلك هدية التحدث بلغة القرآن والفصاحة العربية مع أفضل المعلمين المعتمدين."
              : "Give your child the lifelong gift of understanding the Quran and speaking Arabic with pride."}
          </p>
          <Link
            href={`/${locale}/register`}
            className="px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl shadow-lg hover:bg-slate-50 transition-all text-sm inline-flex items-center gap-2"
          >
            <span>{isRtl ? "ابدأ التسجيل الآن" : "Start Registration Today"}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
