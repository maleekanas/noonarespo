import React from "react";
import Link from "next/link";
import { getDictionary, isRtlLocale } from "@/lib/localization";
import {
  GraduationCap,
  Sparkles,
  Users,
  Video,
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Gamepad2,
  Compass,
  Layers,
  HeartHandshake,
  ShieldCheck,
  Clock,
  BookOpen,
} from "lucide-react";

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const dict = getDictionary(locale);

  const steps = [
    {
      number: "01",
      titleEn: "Free Diagnostic Assessment",
      titleAr: "التقييم التشخيصي المجاني",
      descEn: "Start with an interactive 15-minute placement assessment to evaluate phonemic awareness, vocabulary, and reading level.",
      descAr: "ابدأ باختبار تحديد مستوى تفاعلي لمدة 15 دقيقة لتقييم الوعي الصوتي والمفردات ومستوى القراءة بدقة.",
      icon: <Compass className="w-8 h-8 text-brand-600" />,
      color: "bg-brand-50 border-brand-200",
    },
    {
      number: "02",
      titleEn: "Personalized Micro-Cohort Placement",
      titleAr: "التسكين في مجموعة صغيرة متجانسة",
      descEn: "We match your child with a certified native specialist and a micro-cohort strictly capped at 6 students of the same age and skill.",
      descAr: "نلحق طفلك بمعلم متخصص ومجموعة مصغرة لا تتجاوز 6 طلاب من نفس الفئة العمرية والمستوى الأكاديمي.",
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-200",
    },
    {
      number: "03",
      titleEn: "Interactive Live Classes & Studios",
      titleAr: "حصص تفاعلية مباشرة واستوديوهات رقمية",
      descEn: "Engage in live virtual sessions featuring our interactive whiteboard, real-time pronunciation waveforms, and Quran Tajweed audio tools.",
      descAr: "حضور حصص مباشرة عبر السبورة التفاعلية وتحليل مخارج الحروف بالرسم الصوتي واستوديو التجويد الملون.",
      icon: <Video className="w-8 h-8 text-purple-600" />,
      color: "bg-purple-50 border-purple-200",
    },
    {
      number: "04",
      titleEn: "Gamified Practice & Parent Transparency",
      titleAr: "تدريب تفاعلي وشفافية كاملة لولي الأمر",
      descEn: "Students reinforce skills with Phonics Arcade and SRS flashcards while parents receive weekly progress reports and lesson recordings.",
      descAr: "يعزز الطالب مهاراته بألعاب الحروف وبطاقات التكرار المتباعد، مع تقارير أسبوعية مفصلة وتسجيلات متاحة للوالدين.",
      icon: <Award className="w-8 h-8 text-amber-600" />,
      color: "bg-amber-50 border-amber-200",
    },
  ];

  const ageGroups = [
    {
      range: "4 - 6",
      titleEn: "Early Sprouts (Pre-A1)",
      titleAr: "براعم العربية (ما قبل A1)",
      focusEn: "Phonemic awareness, alphabet recognition, nursery rhymes, everyday conversational words.",
      focusAr: "الوعي الصوتي، تمييز أشكال الحروف، الأناشيد التعليمية، والمفردات اليومية الأساسية.",
      tools: ["Phonics Arcade", "Illustrated Audio Stories", "Interactive Tracing"],
      color: "border-pink-200 bg-pink-50/50",
    },
    {
      range: "7 - 10",
      titleEn: "Junior Explorers (A1 - A2)",
      titleAr: "المستكشف الصغير (A1 - A2)",
      focusEn: "Independent sentence formation, reading fluency, Quranic recitation with basic Tajweed.",
      focusAr: "تكوين الجمل المستقلة، طلاقة القراءة، وتلاوة القرآن الكريم بأحكام التجويد الأساسية.",
      tools: ["Visual Quest Map", "Makharij Pronunciation Studio", "Color Tajweed Player"],
      color: "border-blue-200 bg-blue-50/50",
    },
    {
      range: "11 - 13",
      titleEn: "Fluent Pioneers (A2 - B1)",
      titleAr: "رواد الفصاحة (A2 - B1)",
      focusEn: "Dialogues, paragraph composition, applied grammar (Nahw & Sarf), and Islamic culture.",
      focusAr: "المحادثة الحوارية، الإنشاء التعبيري، القواعد التطبيقية (النحو والصرف)، والسيرة النبوية.",
      tools: ["Ruled Calligraphy Canvas", "Vocabulary SRS Leitner", "AI Tutor Conversations"],
      color: "border-emerald-200 bg-emerald-50/50",
    },
    {
      range: "14 - 16",
      titleEn: "Advanced Scholars (B1 - B2)",
      titleAr: "علماء المستقبل (B1 - B2)",
      focusEn: "Classical text comprehension, public speaking, advanced Tajweed rules, and rhetoric.",
      focusAr: "فهم النصوص الكلاسيكية، الخطابة والإلقاء، أحكام التجويد المتقدمة، وبلاغة البيان.",
      tools: ["Academic Assessment Bank", "Speech Debate Room", "Accredited CEFR Certifications"],
      color: "border-purple-200 bg-purple-50/50",
    },
  ];

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-slate-900 to-slate-900 text-white py-20 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>{isRtl ? "منهجية معتمدة قائمة على المعايير الأوروبية CEFR" : "CEFR-Aligned Pedagogical Methodology"}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            {isRtl ? "كيف يتعلم طفلك العربية بفصاحة وحب؟" : "How Your Child Masters Arabic with Confidence & Joy"}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? "نجمع بين التعليم التفاعلي المباشر مع نخبة المعلمين المعتمدين، وأحدث استوديوهات التعلم الرقمية الذكية في بيئة آمنة تراعي خصوصية طفلك."
              : "We combine live small-group instruction with certified native educators and cutting-edge digital learning studios in a safe, child-centered environment."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/inquiry`}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white gradient-brand rounded-2xl shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all"
            >
              <span>{isRtl ? "احجز تقييماً تشخيصياً مجانياً" : "Book Free Diagnostic Assessment"}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
            <Link
              href={`/${locale}/programs`}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all"
            >
              <span>{isRtl ? "استكشف البرامج الأكاديمية" : "Explore Academic Programs"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4-Step Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
            {isRtl ? "رحلة التعلم المتكاملة" : "The 4-Step Educational Journey"}
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isRtl ? "من الحروف الأولى إلى الطلاقة التامة" : "From First Letters to Complete Fluency"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl border ${step.color} shadow-sm relative flex flex-col justify-between transition-all hover:shadow-md`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-300">{step.number}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {isRtl ? step.titleAr : step.titleEn}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {isRtl ? step.descAr : step.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Age-Group Tailored Pathways */}
      <section className="bg-white border-y border-slate-200/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
              {isRtl ? "مسارات تعليمية مخصصة حسب العمر" : "Tailored Developmental Tracks"}
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isRtl ? "منهج مصمم خصيصاً لكل مرحلة نمو" : "A Curriculum Engineered for Every Age Bracket"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ageGroups.map((group, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-3xl border ${group.color} shadow-sm space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 text-xs font-black text-brand-700 bg-brand-100 rounded-full">
                    {isRtl ? `الأعمار ${group.range} سنوات` : `Ages ${group.range} Years`}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">CEFR Track</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isRtl ? group.titleAr : group.titleEn}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {isRtl ? group.focusAr : group.focusEn}
                </p>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isRtl ? "الاستوديوهات المدمجة:" : "Integrated Studios:"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {group.tools.map((tool, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safe & Trustworthy Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {isRtl ? "أعلى معايير حماية الطفل (COPPA & GDPR)" : "Child Safety & Data Privacy"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isRtl
                ? "بيئة مغلقة وآمنة بدون رسائل مباشرة بين الطلاب. جميع التسجيلات مشفرة ولا يتم مشاركة أي بيانات مع أطراف ثالثة."
                : "Strictly moderated environment with no direct student-to-student messaging. Encrypted media and zero third-party tracking."}
            </p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <Users className="w-10 h-10 text-brand-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {isRtl ? "مجموعات مصغرة (بحد أقصى 6 طلاب)" : "Micro-Cohorts (Max 6 Students)"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isRtl
                ? "نضمن حصول كل طفل على ما لا يقل عن 15 دقيقة من المشاركة الفردية المباشرة في كل حصة لضمان سرعة التطور."
                : "Capped strictly at 6 students so every child receives active speaking time and individualized phoneme feedback every session."}
            </p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <HeartHandshake className="w-10 h-10 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {isRtl ? "مشاركة الوالدين والتقارير الأسبوعية" : "Parent Transparency & Reports"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isRtl
                ? "لوحة تحكم خاصة لولي الأمر تتيح متابعة الحضور، مشاهدة التسجيلات، مراجعة الواجبات، والتواصل المباشر مع المعلم."
                : "Dedicated parent dashboard with weekly progress milestones, recorded lesson playback, and direct educator messaging."}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-brand-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl shadow-brand-500/20">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
            {isRtl ? "جاهز لبدء رحلة طفلك التعليمية؟" : "Ready to Start Your Child's Journey?"}
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            {isRtl
              ? "سجل الآن للحصول على تقييم تشخيصي مجاني وحصة تجريبية مع معلم معتمد."
              : "Sign up today to receive a free diagnostic placement assessment and 1-day trial session with a certified educator."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/register`}
              className="px-8 py-3.5 bg-white text-brand-700 font-bold rounded-2xl shadow-lg hover:bg-slate-50 transition-all text-sm"
            >
              {isRtl ? "ابدأ التسجيل المجاني" : "Start Free Registration"}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="px-8 py-3.5 bg-brand-500/30 text-white border border-white/20 font-bold rounded-2xl hover:bg-brand-500/40 transition-all text-sm"
            >
              {isRtl ? "عرض خطط الأسعار" : "View Pricing Plans"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
