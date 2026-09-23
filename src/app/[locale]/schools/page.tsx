import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/localization";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rateLimit";
import { schoolService } from "@/server/services/SchoolService";
import { B2BBundleCalculator } from "@/components/marketing/B2BBundleCalculator";
import { BundleAndStudentsFields } from "@/components/marketing/BundleAndStudentsFields";
import { CountryCitySelector } from "@/components/shared/CountryCitySelector";
import {
  Sparkles,
  ArrowRight,
  Users,
  LayoutDashboard,
  MonitorPlay,
  BookOpen,
  UserCheck,
  ClipboardCheck,
  School,
  Building2,
  Home,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

const SCHOOL_TYPES = [
  "ISLAMIC_SCHOOL",
  "PRIVATE_INSTITUTE",
  "COMMUNITY_CENTER",
  "HOMESCHOOL_COOP",
  "FREELANCER_TEACHER",
  "OTHER",
] as const;

export default async function SchoolsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    submitted?: string;
    error?: string;
    bundle?: string;
    trial?: string;
  }>;
}) {
  const { locale } = await params;
  const { submitted, error, bundle, trial } = await searchParams;
  const isAr = locale === "ar";
  const dict = getDictionary(locale);

  const isTrialIntent =
    bundle === "TRIAL_3_DAYS" || trial === "1" || trial === "3days";
  const defaultBundle = isTrialIntent ? "TRIAL_3_DAYS" : "GROWTH";

  async function handleInquiry(formData: FormData) {
    "use server";

    const organizationName = formData.get("organizationName")?.toString().trim() || "";
    const contactName = formData.get("contactName")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim().toLowerCase() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const institutionType = formData.get("institutionType")?.toString().trim() || "";
    const bundlePreference = formData.get("bundlePreference")?.toString().trim() || "";
    const country = formData.get("country")?.toString().trim() || "";
    const city = formData.get("city")?.toString().trim() || "";
    const studentsEstimate = formData.get("studentsEstimate")?.toString().trim() || "";
    const message = formData.get("message")?.toString().trim() || "";

    // Preserve the bundle/trial intent across an error redirect -- without
    // this, any validation failure below silently resets the form back to
    // the default "Growth" bundle and clears whatever the visitor typed.
    const fail = (reason: string) => {
      const qp = new URLSearchParams({ error: reason });
      if (bundle) qp.set("bundle", bundle);
      if (trial) qp.set("trial", trial);
      redirect(`/${locale}/schools?${qp.toString()}#apply`);
    };

    if (
      !organizationName ||
      !contactName ||
      !email ||
      !institutionType ||
      !country ||
      !studentsEstimate
    ) {
      fail("missing");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      fail("invalidEmail");
    }

    // The 3-Day Free Trial is advertised everywhere as capped at 10
    // students. The client-side field enforces this too, but that can
    // always be bypassed, so it's re-checked here.
    if (bundlePreference === "TRIAL_3_DAYS") {
      const studentsNum = Number(studentsEstimate);
      if (Number.isFinite(studentsNum) && studentsNum > 10) {
        fail("trialLimit");
      }
    }

    const ip = await getClientIp();
    const ipCheck = await checkRateLimit(`b2b-inquiry:ip:${ip}`, RATE_LIMITS.B2B_INQUIRY_PER_IP);
    if (!ipCheck.allowed) {
      fail("rateLimited");
    }

    const result = await schoolService.handleInstitutionalInquiry({
      organizationName,
      contactName,
      email,
      phone: phone || undefined,
      institutionType,
      bundlePreference,
      country,
      city: city || undefined,
      studentsEstimate,
      message: message || undefined,
    });

    if (!result.isDelivered) {
      fail("server");
    }

    redirect(`/${locale}/schools?submitted=true#apply`);
  }

  const stats = [
    { icon: Users, label: dict.schools.heroStat1, sub: dict.schools.heroStat1Sub },
    { icon: LayoutDashboard, label: dict.schools.heroStat2, sub: dict.schools.heroStat2Sub },
    { icon: UserCheck, label: dict.schools.heroStat3, sub: dict.schools.heroStat3Sub },
  ];

  const features = [
    { icon: Users, title: dict.schools.featureRosterTitle, desc: dict.schools.featureRosterDesc },
    {
      icon: LayoutDashboard,
      title: dict.schools.featureDashboardTitle,
      desc: dict.schools.featureDashboardDesc,
    },
    {
      icon: MonitorPlay,
      title: dict.schools.featureClassroomTitle,
      desc: dict.schools.featureClassroomDesc,
    },
    {
      icon: BookOpen,
      title: dict.schools.featureCurriculumTitle,
      desc: dict.schools.featureCurriculumDesc,
    },
    {
      icon: UserCheck,
      title: dict.schools.featureTeachersTitle,
      desc: dict.schools.featureTeachersDesc,
    },
    {
      icon: ClipboardCheck,
      title: dict.schools.featureReportingTitle,
      desc: dict.schools.featureReportingDesc,
    },
  ];

  const audiences = [
    {
      icon: School,
      title: isAr ? "المدارس الإسلامية الأهلية" : "Islamic Schools",
      desc: isAr
        ? "مدارس متكاملة أو برامج عطلة نهاية الأسبوع تبحث عن مناهج معتمدة وفصول تفاعلية بإشراف إداري كامل."
        : "Full-time and weekend Islamic schools adding structured Arabic & Quran classes with complete institutional oversight.",
    },
    {
      icon: Building2,
      title: isAr ? "المعاهد والمراكز المجتمعية" : "Institutes & Community Centers",
      desc: isAr
        ? "معاهد اللغات والمساجد التي تدير حلقات تعليمية جماعية بحاجة إلى لوحة متابعة وتقارير حضور دقيقة."
        : "Language institutes and community mosques managing group programs that need real-time tracking and reporting.",
    },
    {
      icon: Home,
      title: isAr ? "المعلمون المستقلون والمجموعات" : "Freelance Teachers & Co-ops",
      desc: isAr
        ? "معلمون مستقلون ومجموعات التعليم المنزلي الراغبون في أدوات فصل متطورة وتراخيص مرنة تبدأ من باقة 25 طالباً."
        : "Independent educators and homeschool circles seeking advanced classroom tools and flexible licensing starting from 25 students.",
    },
  ];

  const typeLabels: Record<(typeof SCHOOL_TYPES)[number], string> = {
    ISLAMIC_SCHOOL: isAr ? "مدرسة إسلامية أهلية" : "Islamic School",
    PRIVATE_INSTITUTE: isAr ? "معهد خاص لتعليم العربية والقرآن" : "Private Arabic & Quran Institute",
    COMMUNITY_CENTER: isAr ? "مركز مجتمعي / مسجد" : "Community Center / Mosque",
    HOMESCHOOL_COOP: isAr ? "مجموعة تعليم منزلي (Co-op)" : "Homeschool Co-op",
    FREELANCER_TEACHER: isAr ? "معلم / مقرئ مستقل" : "Freelance Teacher / Independent Tutor",
    OTHER: isAr ? "أخرى" : "Other",
  };

  const errorMessages: Record<string, string> = {
    missing: dict.schools.applyErrorMissing,
    invalidEmail: dict.schools.applyErrorInvalidEmail,
    rateLimited: dict.schools.applyErrorRateLimited,
    server: dict.schools.applyErrorServer,
    trialLimit: dict.schools.applyErrorTrialLimit,
  };

  return (
    <div className="space-y-24 py-16">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-brand-600" />
            <span>{isAr ? "البوابة الموحدة للمدارس، المعاهد، والمعلمين المستقلين" : "Unified Hub for Schools, Institutes & Freelance Teachers"}</span>
            <span className="text-slate-300">|</span>
            <Link href={`/${locale}/school-admin`} className="text-brand-600 hover:underline flex items-center gap-1 font-extrabold">
              <KeyRound className="w-3 h-3" />
              <span>{isAr ? "دخول مدراء المؤسسات" : "School Admin Login"}</span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider block mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{dict.schools.heroBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {isAr
              ? "حلول مؤسسية متكاملة لمدارس ومعاهد ومعلمي اللغة العربية والقرآن"
              : "Enterprise B2B Solutions for Schools, Institutes & Freelance Teachers"}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {isAr
              ? "سواء كنت مدرسة إسلامية كاملة، أو معهداً لغوياً، أو معلماً مستقلاً يدير حلقاته الخاصة: نوفر لك بنية متعددة المستأجرين مع تسجيل جماعي، فصول تفاعلية حية، ومناهج معتمدة."
              : "Whether you are a full-time Islamic school, a language institute, or a freelance educator: manage real student rosters, collaborative classrooms, and accredited curriculum from one dedicated portal."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="#pricing"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white gradient-brand hover:opacity-95 rounded-2xl shadow-md shadow-brand-500/25 transition-all"
            >
              <span>{isAr ? "استكشف الباقات والأسعار (خصم 35%)" : "Explore Bundles & Pricing (35% Off)"}</span>
              <DirectionalIcon icon={ArrowRight} locale={locale} className="w-4 h-4" />
            </Link>
            <Link
              href={`/${locale}/schools?bundle=TRIAL_3_DAYS#apply`}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-2xl transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? "طلب تجربة مجانية (3 أيام • 10 طلاب)" : "Get 3-Day Trial (10 Students)"}</span>
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all"
            >
              <span>{dict.schools.heroCtaSecondary}</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{stat.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            {dict.schools.featuresTag}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {dict.schools.featuresTitle}
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">{dict.schools.featuresSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider">
            {dict.schools.audienceTag}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {dict.schools.audienceTitle}
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">{dict.schools.audienceSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {audiences.map((aud, i) => (
            <div
              key={i}
              className="bg-slate-50 rounded-3xl p-8 border border-slate-200 text-center flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-brand-600">
                <aud.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900">{aud.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{aud.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing & Interactive Bundle Calculator */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider">
            {dict.schools.pricingTag}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {isAr ? "باقات مخصصة للمؤسسات والمعلمين المستقلين" : "Bundles Tailored for Institutions & Freelance Educators"}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {isAr
              ? "3 باقات مرنة بحسب عدد المقاعد (Starter، Growth، Institution) مع تطبيق خصم 35% لجميع المؤسسات."
              : "3 flexible tiers (Starter, Growth, Institution) based on enrolled seats with a 35% discount applied across all plans."}
          </p>
        </div>

        <B2BBundleCalculator locale={locale} />
      </section>

      {/* Apply form */}
      <section id="apply" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl shadow-slate-200/50">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
              {dict.schools.applyTag}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {dict.schools.applyTitle}
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{dict.schools.applySubtitle}</p>
          </div>

          {submitted === "true" && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800 mb-6">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{dict.schools.applySuccessTitle}</p>
                <p className="text-xs text-emerald-700 mt-0.5">{dict.schools.applySuccessMessage}</p>
              </div>
            </div>
          )}

          {error && errorMessages[error] && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessages[error]}</span>
            </div>
          )}

          <form action={handleInquiry} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isAr ? "اسم المؤسسة / اسم المعلم المستقل" : "Institution / Freelancer Name"}
                </label>
                <input
                  name="organizationName"
                  type="text"
                  required
                  placeholder={isAr ? "مثال: مدرسة النور أو حلقة أ. حسن" : "e.g. Al-Noor Academy"}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {dict.schools.applyContactNameLabel}
                </label>
                <input
                  name="contactName"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {dict.schools.applyEmailLabel}
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {dict.schools.applyPhoneLabel}
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+31 6856 630 10"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {dict.schools.applyTypeLabel}
                </label>
                <select
                  name="institutionType"
                  required
                  defaultValue=""
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start bg-white"
                >
                  <option value="" disabled>
                    {dict.schools.applyTypeLabel}
                  </option>
                  {SCHOOL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {typeLabels[type]}
                    </option>
                  ))}
                </select>
              </div>

              </div>

            <BundleAndStudentsFields
              isAr={isAr}
              defaultBundle={defaultBundle}
              bundleLabel={isAr ? "الباقة المفضلة" : "Preferred Bundle"}
              studentsLabel={dict.schools.applyStudentsLabel}
              trialCapHint={dict.schools.applyTrialCapHint}
            />

            <CountryCitySelector
              nameCountry="country"
              nameCity="city"
              required
              locale={locale}
              countryLabel={dict.schools.applyCountryLabel}
              cityLabel={dict.schools.applyCityLabel}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {dict.schools.applyMessageLabel}
              </label>
              <textarea
                name="message"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white gradient-brand shadow-md shadow-brand-500/25 hover:opacity-95 transition-all mt-2"
            >
              {dict.schools.applySubmit}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{dict.schools.trustBadge}</span>
        </div>
      </section>
    </div>
  );
}
