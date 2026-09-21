"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Globe,
  DollarSign,
  Calendar,
  CheckCircle2,
  Users,
  ShieldCheck,
  HelpCircle,
  Building2,
  CreditCard,
} from "lucide-react";

interface PricingCalculatorProps {
  locale: string;
  isRtl?: boolean;
}

type CurrencyCode = "USD" | "EUR" | "GBP" | "SAR" | "AED" | "CAD";

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  symbolAr: string;
  rateFromUsd: number;
  label: string;
  labelAr: string;
}

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    symbolAr: "$",
    rateFromUsd: 1,
    label: "USD ($) • United States & International",
    labelAr: "دولار أمريكي ($) • دولي",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    symbolAr: "€",
    rateFromUsd: 0.92,
    label: "EUR (€) • Netherlands, Germany, France, EU",
    labelAr: "يورو (€) • هولندا، ألمانيا، أوروبا",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    symbolAr: "£",
    rateFromUsd: 0.79,
    label: "GBP (£) • United Kingdom",
    labelAr: "جنيه إسترليني (£) • بريطانيا",
  },
  SAR: {
    code: "SAR",
    symbol: "SAR ",
    symbolAr: " ر.س",
    rateFromUsd: 3.75,
    label: "SAR (ر.س) • Saudi Arabia & Gulf",
    labelAr: "ريال سعودي (ر.س) • السعودية والخليج",
  },
  AED: {
    code: "AED",
    symbol: "AED ",
    symbolAr: " د.إ",
    rateFromUsd: 3.67,
    label: "AED (د.إ) • United Arab Emirates",
    labelAr: "درهم إماراتي (د.إ) • الإمارات",
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    symbolAr: "C$",
    rateFromUsd: 1.36,
    label: "CAD (C$) • Canada",
    labelAr: "دولار كندي (C$) • كندا",
  },
};

interface TimezoneOption {
  id: string;
  nameEn: string;
  nameAr: string;
  offsetHours: number; // relative to UTC
  cohortWeekday: string;
  cohortWeekdayAr: string;
  cohortWeekend: string;
  cohortWeekendAr: string;
}

const TIMEZONE_OPTIONS: TimezoneOption[] = [
  {
    id: "london",
    nameEn: "London (GMT/BST • UTC+0)",
    nameAr: "لندن (توقيت غرينتش • UTC+0)",
    offsetHours: 0,
    cohortWeekday: "Mon & Wed • 16:30 - 17:15",
    cohortWeekdayAr: "الإثنين والأربعاء • 16:30 - 17:15",
    cohortWeekend: "Sat & Sun • 10:00 - 10:45",
    cohortWeekendAr: "السبت والأحد • 10:00 - 10:45",
  },
  {
    id: "amsterdam",
    nameEn: "Amsterdam / Berlin / Paris (CET • UTC+1)",
    nameAr: "أمستردام / برلين / باريس (توقيت وسط أوروبا • UTC+1)",
    offsetHours: 1,
    cohortWeekday: "Mon & Wed • 17:30 - 18:15",
    cohortWeekdayAr: "الإثنين والأربعاء • 17:30 - 18:15",
    cohortWeekend: "Sat & Sun • 11:00 - 11:45",
    cohortWeekendAr: "السبت والأحد • 11:00 - 11:45",
  },
  {
    id: "newyork",
    nameEn: "New York / Toronto (EST • UTC-5)",
    nameAr: "نيويورك / تورونتو (توقيت شرق أمريكا • UTC-5)",
    offsetHours: -5,
    cohortWeekday: "Tue & Thu • 17:00 - 17:45",
    cohortWeekdayAr: "الثلاثاء والخميس • 17:00 - 17:45",
    cohortWeekend: "Sat & Sun • 10:30 - 11:15",
    cohortWeekendAr: "السبت والأحد • 10:30 - 11:15",
  },
  {
    id: "chicago",
    nameEn: "Chicago / Dallas (CST • UTC-6)",
    nameAr: "شيكاغو / دالاس (توقيت وسط أمريكا • UTC-6)",
    offsetHours: -6,
    cohortWeekday: "Tue & Thu • 16:30 - 17:15",
    cohortWeekdayAr: "الثلاثاء والخميس • 16:30 - 17:15",
    cohortWeekend: "Sat & Sun • 09:30 - 10:15",
    cohortWeekendAr: "السبت والأحد • 09:30 - 10:15",
  },
  {
    id: "riyadh",
    nameEn: "Riyadh / Mecca (AST • UTC+3)",
    nameAr: "الرياض / مكة المكرمة (توقيت السعودية • UTC+3)",
    offsetHours: 3,
    cohortWeekday: "Sun & Tue • 17:00 - 17:45",
    cohortWeekdayAr: "الأحد والثلاثاء • 17:00 - 17:45",
    cohortWeekend: "Fri & Sat • 16:00 - 16:45",
    cohortWeekendAr: "الجمعة والسبت • 16:00 - 16:45",
  },
  {
    id: "dubai",
    nameEn: "Dubai / Abu Dhabi (GST • UTC+4)",
    nameAr: "دبي / أبوظبي (توقيت الإمارات • UTC+4)",
    offsetHours: 4,
    cohortWeekday: "Sun & Tue • 18:00 - 18:45",
    cohortWeekdayAr: "الأحد والثلاثاء • 18:00 - 18:45",
    cohortWeekend: "Fri & Sat • 17:00 - 17:45",
    cohortWeekendAr: "الجمعة والسبت • 17:00 - 17:45",
  },
  {
    id: "istanbul",
    nameEn: "Istanbul (TRT • UTC+3)",
    nameAr: "إسطنبول (توقيت تركيا • UTC+3)",
    offsetHours: 3,
    cohortWeekday: "Mon & Wed • 18:30 - 19:15",
    cohortWeekdayAr: "الإثنين والأربعاء • 18:30 - 19:15",
    cohortWeekend: "Sat & Sun • 12:00 - 12:45",
    cohortWeekendAr: "السبت والأحد • 12:00 - 12:45",
  },
];

export function PricingCalculator({ locale, isRtl = false }: PricingCalculatorProps) {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedTz, setSelectedTz] = useState<string>("london");

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const currentCurr = CURRENCIES[currency];
  const activeTz = TIMEZONE_OPTIONS.find((t) => t.id === selectedTz) || TIMEZONE_OPTIONS[0];

  // Format price helper
  const formatPrice = (usdBase: number) => {
    let converted = usdBase * currentCurr.rateFromUsd;
    if (billingCycle === "annual") {
      converted = converted * 0.8; // 20% off
    }
    const rounded = Math.round(converted);
    if (isRtl && (currency === "SAR" || currency === "AED")) {
      return `${rounded}${currentCurr.symbolAr}`;
    }
    return `${currentCurr.symbol}${rounded}`;
  };

  const plans = [
    {
      id: "plan-individual",
      nameEn: "Individual Student",
      nameAr: "الخطة الفردية",
      subtitleEn: "Ideal for one child dedicated to mastering Arabic and Tajweed.",
      subtitleAr: "مثالية لطفل واحد يسعى لإتقان العربية والتجويد بخطى واثقة.",
      baseUsdMonthly: 79,
      badgeEn: "Most Popular",
      badgeAr: "الأكثر طلباً",
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
      baseUsdMonthly: 149,
      badgeEn: "Best Value",
      badgeAr: "أفضل قيمة",
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
      baseUsdMonthly: 199,
      badgeEn: "VIP Acceleration",
      badgeAr: "تعليم خاص مكثف",
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

  return (
    <div className="space-y-12">
      {/* Interactive Controls Bar: Currency + Billing Cycle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Currency Switcher */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Globe className="w-4 h-4 text-brand-600" />
            <span>{isRtl ? "العملة المحلية:" : "Select Currency:"}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((cCode) => (
              <button
                key={cCode}
                onClick={() => setCurrency(cCode)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currency === cCode
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cCode}
              </button>
            ))}
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="w-full md:w-auto flex items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setBillingCycle("monthly")}
            type="button"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              billingCycle === "monthly"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isRtl ? "الدفع الشهري" : "Monthly Billing"}
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            type="button"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>{isRtl ? "الدفع السنوي" : "Annual Billing"}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold">
              {isRtl ? "خصم 20%" : "Save 20%"}
            </span>
          </button>
        </div>
      </div>

      {/* Global Timezone Schedule Converter */}
      <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{isRtl ? "محوّل مواعيد الحصص المباشرة حسب مدينتك" : "Global Timezone Live Class Converter"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              {isRtl ? "تعرّف على مواعيد الحصص بتوقيت مدينتك المحلي" : "See Live Cohort Times in Your Local Time"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {isRtl
                ? "نوفر مجموعات صباحية ومسائية تناسب توقيت المدارس في أوروبا، أمريكا الشمالية، ودول الخليج العربي."
                : "We organize weekday after-school and weekend morning cohorts synchronized to school calendars across the UK, EU, US, Canada, and the GCC."}
            </p>
          </div>

          <div className="space-y-3 shrink-0 lg:w-80">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isRtl ? "اختر مدينتك أو منطقتك الزمنية:" : "Select your city / timezone:"}
            </label>
            <select
              value={selectedTz}
              onChange={(e) => setSelectedTz(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.id} value={tz.id}>
                  {isRtl ? tz.nameAr : tz.nameEn}
                </option>
              ))}
            </select>

            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isRtl ? "المجموعة المسائية:" : "Weekday Cohort:"}</span>
                <span className="font-bold text-emerald-400">
                  {isRtl ? activeTz.cohortWeekdayAr : activeTz.cohortWeekday}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isRtl ? "مجموعة عطلة الأسبوع:" : "Weekend Cohort:"}</span>
                <span className="font-bold text-amber-300">
                  {isRtl ? activeTz.cohortWeekendAr : activeTz.cohortWeekend}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
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
                  <span className="text-xs text-slate-400 font-medium">
                    {billingCycle === "annual" ? (isRtl ? "فاتورة سنوية (خصم 20%)" : "Billed Annually (-20%)") : (isRtl ? "فاتورة شهرية" : "Billed Monthly")}
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {isRtl ? plan.nameAr : plan.nameEn}
              </h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {isRtl ? plan.subtitleAr : plan.subtitleEn}
              </p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                  {formatPrice(plan.baseUsdMonthly)}
                </span>
                <span className="text-slate-500 text-sm font-medium">
                  {isRtl ? "/ شهرياً" : "/ month"}
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

            <div className="pt-6 border-t border-slate-100">
              <Link
                href={`/${locale}/register?plan=${plan.id}&cycle=${billingCycle}&currency=${currency}&tz=${selectedTz}&trial=1`}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-md ${
                  plan.popular
                    ? "gradient-brand text-white shadow-brand-500/25 hover:opacity-95"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                <span>{isRtl ? "ابدأ التجربة المجانية اليوم" : "Start 1-Day Free Trial"}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Institutional / School Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>{isRtl ? "المدارس والمراكز الإسلامية" : "Schools & Islamic Centers"}</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {isRtl ? "هل تمثل مدرسة أو مركزاً تعليمياً؟" : "Looking for Institutional Licensing?"}
          </h3>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            {isRtl
              ? "نوفر تراخيص مجمعة للمدارس والمراكز المجتمعية، تشمل لوحة تحكم مخصصة للمدير المؤسسي، تسجيل جماعي لقوائم الطلاب، ومناهج معتمدة بالكامل."
              : "We offer discounted institutional seat tiers for Islamic schools, weekend academies, and community centers with custom admin dashboards and bulk roster onboarding."}
          </p>
        </div>
        <Link
          href={`/${locale}/schools`}
          className="shrink-0 px-6 py-3.5 rounded-2xl bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold text-sm transition-colors flex items-center gap-2"
        >
          <span>{isRtl ? "استكشف بوابة المدارس" : "Explore School Hub"}</span>
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
    </div>
  );
}
