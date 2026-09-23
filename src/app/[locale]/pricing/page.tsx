import React from "react";
import Link from "next/link";
import { isRtlLocale } from "@/lib/localization";
import {
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Building2,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import { GlobalTimezoneConverter } from "@/components/marketing/GlobalTimezoneConverter";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);

  const plans = [
    {
      id: "plan-individual",
      nameEn: "Individual Student",
      nameAr: "الخطة الفردية",
      subtitleEn: "Ideal for one child dedicated to mastering Arabic and Tajweed.",
      subtitleAr: "مثالية لطفل واحد يسعى لإتقان العربية والتجويد بخطى واثقة.",
      priceMonthly: 51.35,
      originalPriceMonthly: 79,
      discountPercent: 35,
      badgeEn: "Most Popular • 35% OFF",
      badgeAr: "الأكثر طلباً • خصم 35%",
      popular: true,
      featuresEn: [
        "2 Live Small-Group Classes per week (Max 6 students)",
        "Certified Native Arabic & Tajweed Specialist",
        "Full access to all 6 Interactive Studios",
        "Phonics Arcade & Leitner SRS Flashcards",
        "Weekly Parent Milestone Reports & Recordings",
        "COPPA/GDPR Compliant Private Dashboard",
      ],
      featuresAr: [
        "حصتان تفاعليتان أسبوعياً في مجموعة مصغرة (بحد أقصى 6 طلاب)",
        "معلم معتمد متخصص في تعليم الأطفال والتجويد",
        "وصول غير محدود لجميع الاستوديوهات التعليمية التفاعلية",
        "ألعاب قطار الحروف ونظام التكرار المتباعد للمفردات",
        "تقارير أسبوعية تفصيلية وتسجيلات الدروس لولي الأمر",
        "بيئة تعليمية آمنة ومتوافقة مع معايير COPPA وGDPR",
      ],
    },
    {
      id: "plan-family",
      nameEn: "Family Bundle",
      nameAr: "باقة العائلة",
      subtitleEn: "Designed for families with 2 to 3 children learning together.",
      subtitleAr: "مصممة للعائلات التي لديها طفلان إلى 3 أطفال يتعلمون معاً.",
      priceMonthly: 74.50,
      originalPriceMonthly: 149,
      discountPercent: 50,
      badgeEn: "Best Value • 50% OFF",
      badgeAr: "أفضل قيمة • خصم 50%",
      popular: false,
      featuresEn: [
        "Up to 3 Children Student Profiles included",
        "4 to 6 Live Classes per week shared across children",
        "Independent Quest Maps & Biome progression",
        "Separate Homework & Live Session Evaluations",
        "Multi-child switcher on Parent Dashboard",
        "Priority Educator & Support Concierge",
      ],
      featuresAr: [
        "يشمل حتى 3 ملفات تعريف مستقلة للأطفال",
        "من 4 إلى 6 حصص مباشرة أسبوعياً مقسمة بين الأبناء",
        "خريطة تعلم ومسار تقدم مستقل لكل طفل",
        "تقييمات واجبات وفحوصات صوتية مخصصة لكل طالب",
        "مفتاح تبديل فوري بين الأبناء في لوحة تحكم الوالدين",
        "أولوية في الدعم الفني واختيار المواعيد",
      ],
    },
    {
      id: "plan-private",
      nameEn: "Private 1-on-1 VIP",
      nameAr: "التعليم الفردي الخاص (1 على 1)",
      subtitleEn: "Maximum acceleration with dedicated 1-on-1 private mentorship.",
      subtitleAr: "أقصى درجات التركيز والتطور عبر حصص فردية خاصة تماماً.",
      priceMonthly: 89.55,
      originalPriceMonthly: 199,
      discountPercent: 55,
      badgeEn: "VIP Acceleration • 55% OFF",
      badgeAr: "تعليم خاص مكثف • خصم 55%",
      popular: false,
      featuresEn: [
        "100% Dedicated One-on-One Live Lessons",
        "Customized lesson pacing and flexible rescheduling",
        "Advanced Phoneme & Makharij Speech Analysis",
        "Accelerated Quran Hifz & Ijazah Preparation",
        "Direct Teacher-Parent WhatsApp advisory line",
        "Custom Printable Worksheets tailored to child",
      ],
      featuresAr: [
        "حصص خاصة ومباشرة بالكامل (معلم لطفل واحد)",
        "مرونة كاملة في تحديد المواعيد وإعادة الجدولة",
        "تحليل صوتي دقيق لمخارج الحروف ونبرات الصوت",
        "مسار مكثف لحفظ القرآن الكريم وتأهيل الإجازة",
        "خط استشاري مباشر بين المعلم وولي الأمر",
        "أوراق عمل مخصصة لاحتياجات الطفل الفردية",
      ],
    },
  ];

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative bg-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-20 lg:py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>{isRtl ? "خصومات خاصة تصل إلى 55% على كافة الباقات • تجربة مجانية ليوم واحد" : "Special Discounts up to 55% Off All Plans • 1-Day Free Trial"}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            {isRtl ? "استثمر في هوية طفلك وفصاحته" : "Invest in Your Child's Faith, Language & Future"}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? "اختر الخطة المناسبة لعائلتك مع ضمان استرداد الأموال بنسبة 100% خلال أول 14 يوماً ومواعيد متوافقة مع منطقتك الزمنية."
              : "Choose the plan that fits your family. All plans include a 1-day free trial, a 14-day 100% money-back guarantee, and schedules adapted to your timezone."}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-20 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 flex flex-col justify-between border bg-white shadow-sm transition-all hover:shadow-xl ${
                plan.popular
                  ? "border-brand-500 ring-2 ring-brand-500/20 relative"
                  : "border-slate-200"
              }`}
            >
              <div>
                {plan.badgeEn && (
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                        plan.popular
                          ? "bg-brand-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {isRtl ? plan.badgeAr : plan.badgeEn}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Billed Monthly</span>
                  </div>
                )}
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  {isRtl ? plan.nameAr : plan.nameEn}
                </h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  {isRtl ? plan.subtitleAr : plan.subtitleEn}
                </p>

                <div className="flex items-baseline flex-wrap gap-2 mb-6">
                  {plan.originalPriceMonthly && (
                    <span className="text-xl sm:text-2xl font-bold text-slate-400 line-through">
                      ${plan.originalPriceMonthly}
                    </span>
                  )}
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-slate-500 text-sm font-medium">
                    {isRtl ? "/ شهرياً" : "/ month"}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                    -{plan.discountPercent}%
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-6 mb-6">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                    {isRtl ? "المميزات المتضمنة:" : "What's Included:"}
                  </h4>
                  <ul className="space-y-3">
                    {(isRtl ? plan.featuresAr : plan.featuresEn).map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-600">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-2">
                <Link
                  href={`/${locale}/register?plan=${plan.id}&trial=1`}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-md ${
                    plan.popular
                      ? "gradient-brand text-white shadow-brand-500/25 hover:opacity-95"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <span>{isRtl ? "ابدأ التجربة المجانية (طفل واحد • 24 ساعة)" : "Start 1-Day Trial (1 Child Max)"}</span>
                  <ArrowIcon className="w-4 h-4" />
                </Link>
                <Link
                  href={`/${locale}/register?plan=${plan.id}`}
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 text-slate-500 hover:text-brand-600 transition-colors"
                >
                  <span>{isRtl ? "أو اشترك وادفع فوراً (بدون فترة تجربة)" : "Or Subscribe & Pay Now (Skip Trial)"}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Dedicated Free Trial Explainer & B2B vs B2C Comparison */}
        <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-black text-brand-600 uppercase tracking-wider px-3 py-1 rounded-full bg-brand-50">
              {isRtl ? "مقارنة فترات التجربة المجانية" : "Free Trial Comparison"}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isRtl ? "خطط التجربة المجانية المصممة بعناية" : "Carefully Scoped Free Trials"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {isRtl
                ? "سواء كنت ولي أمر يستكشف المنصة لطفله، أو مدرسة ترغب في اختبار البنية التحتية مع فريقها، نوفر تجربة مخصصة بدون أي التزام مالي."
                : "Whether you are a parent previewing capabilities for your child, or an institution evaluating infrastructure with your team, we offer tailored zero-commitment evaluations."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* B2C 1-Day Trial */}
            <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
                  {isRtl ? "تجربة العائلات وأولياء الأمور" : "Family & Parent Trial"}
                </span>
                <span className="text-xs font-bold text-amber-700">
                  {isRtl ? "24 ساعة • طفل واحد" : "1 Day • 1 Child Max"}
                </span>
              </div>
              <h4 className="text-lg font-black text-slate-900">
                {isRtl ? "معاينة إمكانيات المنصة للطفل" : "Core Feature Preview"}
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{isRtl ? "اختبار تشخيص المستوى لتحديد نقطة البداية المناسبة (محاولة واحدة)" : "Diagnostic placement assessment to identify child's baseline (1 attempt)"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{isRtl ? "درس تمهيدي تفاعلي كامل في مسار التأسيس والتجويد" : "1 full preview interactive lesson in Foundations & Tajweed"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{isRtl ? "تجربة لعبة قطار الحروف وقصة مصورة من مكتبة القراءة" : "1 phonics arcade game and 1 illustrated storybook"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{isRtl ? "فحص صوتي تجريبي لمخارج الحروف مع تقييم نطق فوري" : "Speech recognition pronunciation feedback preview"}</span>
                </li>
              </ul>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                {isRtl ? "🔒 ملاحظة: الفصول الحية المباشرة وإضافة طفل ثانٍ تتطلب الترقية للباقة الكاملة." : "🔒 Note: Live micro-cohort classes and adding a 2nd child require upgrading to a full plan."}
              </div>
            </div>

            {/* B2B 3-Day Trial */}
            <div className="bg-white rounded-2xl p-6 border border-brand-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-900 font-extrabold text-xs">
                  {isRtl ? "تجربة المدارس والمعاهد (B2B)" : "Schools & Institutes Trial"}
                </span>
                <span className="text-xs font-bold text-brand-700">
                  {isRtl ? "3 أيام • حتى 10 طلاب" : "3 Days • Up to 10 Students"}
                </span>
              </div>
              <h4 className="text-lg font-black text-slate-900">
                {isRtl ? "حزمة تقييم مؤسسية متكاملة" : "Complete Institutional Evaluation"}
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{isRtl ? "10 مقاعد دراسية نشطة مع إنشاء حسابات الطلاب بضغطة زر" : "10 active student seats with instant bulk roster account generation"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{isRtl ? "فصل تفاعلي حي للمؤسسة (سبورة ذكية، اتصال مرئي وصوتي)" : "1 dedicated live classroom (whiteboard, video & audio)"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{isRtl ? "لوحة تحكم إدارية خاصة بالمؤسسة وتقارير حضور وتفاعل مع تصدير CSV" : "Scoped institutional admin dashboard & attendance reporting with CSV export"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{isRtl ? "معاينة المسارات الـ 7 المعتمدة ودليل المعلمين المعتمدين" : "Preview of all 7 accredited tracks & certified educator directory"}</span>
                </li>
              </ul>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-between">
                <span>{isRtl ? "بدون أي بطاقة بنكية مطلوبة" : "Zero credit card required"}</span>
                <Link href={`/${locale}/schools#apply`} className="text-brand-600 font-bold hover:underline">
                  {isRtl ? "طلب التجربة المؤسسية ←" : "Request B2B Trial →"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Global Timezone Live Class Converter */}
        <GlobalTimezoneConverter locale={locale} isRtl={isRtl} />

        {/* Institutional / School Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>{isRtl ? "المدارس، المعاهد، والمعلمون المستقلون (B2B)" : "Schools, Institutes & Freelance Teachers (B2B)"}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {isRtl ? "هل تمثل مدرسة، معهداً، أو معلماً مستقلاً؟" : "Looking for Institutional or Freelance Licensing?"}
            </h3>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {isRtl
                ? "نوفر 3 باقات مؤسسية مرنة (Starter حتى 25 طالباً، Growth من 26-100 طالب، وInstitution للمؤسسات الكبرى) مع خصم 35%، بالإضافة إلى تجربة مجانية لمدة 3 أيام لـ 10 طلاب، تشمل لوحة تحكم مخصصة، تسجيلاً جماعياً، فصولاً تفاعلية حية، وتقارير حضور وإنجاز معتمدة."
                : "We offer 3 flexible B2B bundles (Starter up to 25 students, Growth 26–100 students, and Institution for 100+) with a 35% discount, plus a 3-day free trial for up to 10 students, dedicated multi-tenant admin dashboards, bulk roster onboarding, live collaborative classrooms, and accredited reporting."}
            </p>
          </div>
          <Link
            href={`/${locale}/schools`}
            className="shrink-0 px-6 py-3.5 rounded-2xl bg-brand-600 text-white hover:bg-brand-700 font-bold text-sm shadow-md transition-colors flex items-center gap-2"
          >
            <span>{isRtl ? "استكشف باقات المؤسسات وتجربة 3 أيام" : "Explore B2B Hub & 3-Day Trial"}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Guarantees & Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/70">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              {isRtl ? "ضمان استرداد 100% لمدة 14 يوماً" : "14-Day Money-Back Guarantee"}
            </h4>
            <p className="text-xs text-slate-500">
              {isRtl ? "إذا لم تكن راضياً تماماً، نسترد اشتراكك فوراً دون شروط." : "Cancel within 14 days for a full refund, no questions asked."}
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200/70">
            <CreditCard className="w-8 h-8 text-brand-600 mx-auto mb-3" />
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              {isRtl ? "طرق دفع عالمية ومحلية آمنة" : "Global & Local Payment Gateways"}
            </h4>
            <p className="text-xs text-slate-500">
              Stripe, PayPal, Mollie (iDEAL/Bancontact), Apple Pay, Google Pay.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200/70">
            <HelpCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              {isRtl ? "دعم أولياء الأمور على مدار الساعة" : "24/7 Dedicated Parent Support"}
            </h4>
            <p className="text-xs text-slate-500">
              {isRtl ? "فريق دعم متخصص للإجابة على جميع الاستفسارات الفنية والأكاديمية." : "Direct concierge support via WhatsApp, email, and live messaging."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
