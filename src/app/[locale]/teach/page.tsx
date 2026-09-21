import React from "react";
import Link from "next/link";
import { getDictionary, isRtlLocale } from "@/lib/localization";
import {
  GraduationCap,
  Sparkles,
  Award,
  DollarSign,
  Clock,
  Globe2,
  CheckCircle2,
  Send,
  ShieldCheck,
  Laptop,
} from "lucide-react";

export default async function TeachWithUsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const dict = getDictionary(locale);

  async function handleTeacherApplication(formData: FormData) {
    "use server";
    const fullName = formData.get("fullName")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const experienceYears = parseInt(formData.get("experienceYears")?.toString() || "0", 10);
    const qualifications = formData.get("qualifications")?.toString() || "";
    const certifications = formData.get("certifications")?.toString() || "";
    const languages = formData.get("languages")?.toString() || "";
    const bio = formData.get("bio")?.toString() || "";

    const { crmService } = await import("@/server/services/CrmService");
    await crmService.captureTeacherApplication({
      fullName,
      email,
      phone,
      experienceYears,
      qualifications,
      certifications,
      languages,
      bio,
      locale,
    });
  }

  const benefits = [
    {
      titleEn: "Competitive Compensation",
      titleAr: "عائد مالي مجزٍ وتنافسي",
      descEn: "$25 - $40 / hour based on qualifications, plus performance bonuses and full-time educator contracts.",
      descAr: "من 25 إلى 40 دولاراً في الساعة حسب المؤهلات والخبرة، مع مكافآت تميز وعقود عمل كاملة أو جزئية.",
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
    },
    {
      titleEn: "Flexible Global Scheduling",
      titleAr: "مرونة كاملة في تحديد ساعات العمل",
      descEn: "Teach from anywhere in the world. Set your weekly availability to match your lifestyle and timezone.",
      descAr: "درّس من أي مكان في العالم. حدد أوقات فراغك وساعات تدريسك الأسبوعية بما يناسب جدولك الزمني.",
      icon: <Clock className="w-6 h-6 text-brand-600" />,
    },
    {
      titleEn: "Cutting-Edge Interactive Tools",
      titleAr: "أحدث استوديوهات التدريس التفاعلية",
      descEn: "Use our interactive calligraphy whiteboard, live pronunciation waveforms, and color-coded Tajweed tools.",
      descAr: "استخدم سبورتنا التفاعلية الذكية، ومحلل النطق الصوتي، واستوديو التجويد الملون لإيصال المعلومة بسلاسة.",
      icon: <Laptop className="w-6 h-6 text-purple-600" />,
    },
    {
      titleEn: "Inspiring Mission & Community",
      titleAr: "رسالة سامية ومجتمع تعليمي داعم",
      descEn: "Join 150+ passionate educators empowering children across 30+ countries to cherish Arabic and the Quran.",
      descAr: "انضم إلى أكثر من 150 معلماً متخصصاً يساهمون في بناء جيل يعتز بهويته ولغته في أكثر من 30 دولة.",
      icon: <Award className="w-6 h-6 text-amber-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-brand-950 via-slate-900 to-slate-900 text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <GraduationCap className="w-4 h-4 text-brand-400" />
            <span>{isRtl ? "انضم إلى نخبة معلمي اللغة العربية والقرآن" : "Join Our Elite Teaching Faculty"}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            {isRtl ? "درّس مع أكاديمية براعم العربية" : "Teach Arabic with Passion & Global Reach"}
          </h1>
          <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto">
            {isRtl
              ? "نبحث عن معلمين ومعلمات معتمدين ومتحمسين لتعليم الأطفال اللغة العربية وتجويد القرآن الكريم عبر بيئة تفاعلية حديثة."
              : "We are recruiting certified, passionate Arabic and Quran educators to inspire young learners worldwide with flexible schedules and competitive pay."}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((b, idx) => (
            <div key={idx} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                {b.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                {isRtl ? b.titleAr : b.titleEn}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRtl ? b.descAr : b.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Application Form & Requirements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Requirements Box */}
          <div className="space-y-6">
            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                {isRtl ? "شروط ومعايير الانضمام" : "Faculty Requirements"}
              </h3>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {isRtl
                      ? "المتحدث الأصلي للغة العربية بإتقان تام لمخارج الحروف وقواعد النحو."
                      : "Native Arabic speaker with excellent articulation and grammar."}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {isRtl
                      ? "مؤهل جامعي في اللغة العربية، الدراسات الإسلامية، أو التربية."
                      : "University degree in Arabic Language, Islamic Studies, or Education."}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {isRtl
                      ? "إجازة معتمدة في تجويد القرآن الكريم (لمعلمي مسار القرآن)."
                      : "Accredited Tajweed / Qira'at certification (for Quran tracks)."}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {isRtl
                      ? "خبرة لا تقل عن سنتين في التدريس التفاعلي للأطفال عبر الإنترنت."
                      : "Minimum 2 years teaching children in an online interactive format."}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {isRtl
                      ? "اتصال إنترنت عالي السرعة، وميكروفون وكاميرا احترافية، ومكان هادئ."
                      : "High-speed internet, dedicated studio headset, and quiet workspace."}
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-brand-50 border border-brand-200 rounded-3xl text-xs text-brand-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-brand-900">
                <ShieldCheck className="w-4 h-4 text-brand-700" />
                <span>{isRtl ? "التدقيق الأمني وحماية الأطفال" : "Vetting & Safety Clearance"}</span>
              </div>
              <p className="leading-relaxed text-brand-800">
                {isRtl
                  ? "يخضع جميع المتقدمين للتحقق من الهوية، وتدقيق الشهادات الأكاديمية، واختبار عملي مباشر مع المشرف الأكاديمي لضمان أعلى معايير الأمان."
                  : "All candidates undergo background clearance, identity verification, and live teaching auditions before interacting with students."}
              </p>
            </div>
          </div>

          {/* Teacher Application Form */}
          <div className="lg:col-span-2 p-8 sm:p-10 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {isRtl ? "نموذج التقديم للانضمام للهيئة التعليمية" : "Teacher Application Form"}
            </h3>
            <p className="text-sm text-slate-500 mb-8">
              {isRtl
                ? "يرجى تعبئة بياناتك بدقة وسيتواصل معك فريق التوظيف الأكاديمي لتحديد موعد المقابلة التجريبية."
                : "Complete the form below and our recruitment committee will review your application within 3 business days."}
            </p>

            <form action={handleTeacherApplication} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isRtl ? "الاسم الكامل *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder={isRtl ? "مثال: د. عبد الله بن يوسف" : "e.g. Dr. Abdullah Yusuf"}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isRtl ? "البريد الإلكتروني *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="teacher@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isRtl ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+20 100 1234567"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isRtl ? "سنوات الخبرة في تعليم الأطفال *" : "Years of Experience (Kids) *"}
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    min="1"
                    max="40"
                    required
                    defaultValue="3"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isRtl ? "المؤهل الأكاديمي والجامعة *" : "Degree & University *"}
                  </label>
                  <input
                    type="text"
                    name="qualifications"
                    required
                    placeholder={isRtl ? "ليسانس لغة عربية - جامعة الأزهر" : "BA Arabic Language & Literature"}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isRtl ? "الإجازات والشهادات المعتمدة" : "Certifications & Ijazah"}
                  </label>
                  <input
                    type="text"
                    name="certifications"
                    placeholder={isRtl ? "إجازة برواية حفص عن عاصم، شهادة تدريس لغير الناطقين" : "Hafs Ijazah, TAFL Certification"}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isRtl ? "اللغات التي تتحدثها وتدرس بها" : "Languages Spoken"}
                </label>
                <input
                  type="text"
                  name="languages"
                  placeholder={isRtl ? "العربية (اللغة الأم)، الإنجليزية، الفرنسية..." : "Arabic (Native), English, French, Dutch..."}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isRtl ? "نبذة عن أسلوبك في التدريس وشغفك بالتعليم *" : "Teaching Philosophy & Bio *"}
                </label>
                <textarea
                  name="bio"
                  required
                  rows={4}
                  placeholder={
                    isRtl
                      ? "تحدث باختصار عن منهجيتك في تشجيع الأطفال على حب العربية والتفاعل معهم..."
                      : "Describe your approach to keeping children engaged, positive reinforcement, and interactive learning..."
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 gradient-brand text-white font-bold text-sm rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isRtl ? "إرسال طلب التوظيف" : "Submit Teacher Application"}</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
