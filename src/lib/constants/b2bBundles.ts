import { BundleTier } from "@/server/repositories/SchoolRepository";

export interface B2BBundleDefinition {
  id: BundleTier;
  nameAr: string;
  nameEn: string;
  studentRangeAr: string;
  studentRangeEn: string;
  maxStudents: number;
  priceMonthlyEur: number;
  originalPriceEur: number;
  discountPercentage: number;
  badgeAr?: string;
  badgeEn?: string;
  featuresAr: string[];
  featuresEn: string[];
}

export const B2B_BUNDLES: Record<BundleTier, B2BBundleDefinition> = {
  STARTER: {
    id: "STARTER",
    nameAr: "الباقة الأساسية (المعلم المستقل والمجموعات)",
    nameEn: "Starter Bundle (Freelancers & Micro-Schools)",
    studentRangeAr: "حتى 25 طالباً",
    studentRangeEn: "Up to 25 students",
    maxStudents: 25,
    priceMonthlyEur: 129,
    originalPriceEur: 199,
    discountPercentage: 35,
    featuresAr: [
      "حتى 25 مقعداً دراسياً نشطاً",
      "حتى 4 فصول تفاعلية مصغرة (بحد أقصى 6 طلاب لكل فصل)",
      "حساب معلم معتمد واحد مجاني",
      "وصول كامل للمناهج الـ 7 المعتمدة و 320 درساً تفاعلياً",
      "الفصل الافتراضي التفاعلي (سبورة ذكية، مكالمات مرئية/صوتية)",
      "تقارير حضور ومتابعة إنجاز أساسية",
    ],
    featuresEn: [
      "Up to 25 active student seats",
      "Up to 4 collaborative micro-cohorts (max 6 students each)",
      "1 certified educator / teacher seat included",
      "Full access to 7 accredited tracks & 320 interactive lessons",
      "Real-time collaborative classroom (whiteboard & live video/audio)",
      "Basic attendance and progress tracking",
    ],
  },
  GROWTH: {
    id: "GROWTH",
    nameAr: "باقة النمو (المعاهد والمراكز المجتمعية)",
    nameEn: "Growth Bundle (Institutes & Community Centers)",
    studentRangeAr: "26 – 100 طالب",
    studentRangeEn: "26 – 100 students",
    maxStudents: 100,
    priceMonthlyEur: 324,
    originalPriceEur: 499,
    discountPercentage: 35,
    badgeAr: "الأكثر طلباً",
    badgeEn: "Most Popular",
    featuresAr: [
      "من 26 إلى 100 مقعد دراسي نشط",
      "حتى 16 فصلاً تفاعلياً مخصصاً للمؤسسة",
      "حتى 5 حسابات للمعلمين + حساب مدير مؤسسي مستقل",
      "تسجيل جماعي سريع لقوائم الطلاب مع توزيع آمن لبيانات الدخول",
      "لوحة تحكم إدارية خاصة بالمؤسسة دون تداخل مع مستخدمين آخرين",
      "تقارير الحضور والتقدم الشاملة مع إمكانية التصدير (CSV)",
      "إمكانية طلب تعيين معلمين معتمدين بدوام كامل",
    ],
    featuresEn: [
      "26 to 100 active student seats",
      "Up to 16 institutional micro-cohort classes",
      "Up to 5 educator seats + dedicated institutional admin account",
      "Fast bulk roster onboarding with secure credential distribution",
      "Private institutional admin dashboard with strict multi-tenant scoping",
      "Comprehensive attendance & progress reporting with CSV export",
      "Option to assign certified full-time educators",
    ],
  },
  INSTITUTION: {
    id: "INSTITUTION",
    nameAr: "باقة المؤسسات الكبرى والمدارس الأهلية",
    nameEn: "Institution Bundle (Full-Time Islamic Schools & Multi-Branch)",
    studentRangeAr: "100+ طالب (غير محدود)",
    studentRangeEn: "100+ students (Unlimited)",
    maxStudents: 9999,
    priceMonthlyEur: 584,
    originalPriceEur: 899,
    discountPercentage: 35,
    featuresAr: [
      "100+ مقعد دراسي نشط (سعة غير محدودة)",
      "عدد غير محدود من الفصول والمجموعات المصغرة",
      "عدد غير محدود من حسابات المعلمين والإداريين",
      "تخصيص كامل للمسارات والمناهج بما يوافق خطة المدرسة السنوية",
      "ربط مباشر مع الفصول التفاعلية الحية وأرشفة الجلسات",
      "تقارير تقدم أكاديمية وتقارير أولياء أمور تلقائية",
      "مدير حساب مخصص ودعم فني ذو أولوية على مدار الساعة",
    ],
    featuresEn: [
      "100+ active student seats (unlimited scale)",
      "Unlimited classes and micro-cohorts",
      "Unlimited teacher and administrative accounts",
      "Custom curriculum pacing aligned with school annual calendar",
      "Direct real-time collaborative classroom integration & session archives",
      "Academic progress reports & automated parent report cards",
      "Dedicated account manager & 24/7 priority SLA support",
    ],
  },
};

export const B2B_TRIAL_BUNDLE: B2BBundleDefinition = {
  id: "STARTER",
  nameAr: "الباقة التجريبية للمؤسسات (3 أيام مجاناً)",
  nameEn: "Institutional 3-Day Free Trial",
  studentRangeAr: "حتى 10 طلاب",
  studentRangeEn: "Up to 10 students",
  maxStudents: 10,
  priceMonthlyEur: 0,
  originalPriceEur: 49,
  discountPercentage: 100,
  badgeAr: "تجربة مؤسسية مجانية",
  badgeEn: "Free 3-Day Trial",
  featuresAr: [
    "10 مقاعد دراسية نشطة كاملة الصلاحيات لمدة 3 أيام",
    "فصل تفاعلي مؤسسي مصغر مخصص (بث صوتي وفيديو وسبورة ذكية)",
    "لوحة تحكم المشرف المؤسسي الخاصة وتقارير حضور وتفاعل مع تصدير CSV",
    "تسجيل جماعي لدفعة الطلاب واستخراج بطاقات الدخول بضغطة زر",
    "وصول كامل لمعاينة المناهج الـ 7 المعتمدة و 320 درساً تفاعلياً",
    "بدون أي بطاقة بنكية أو التزام مالي مسبق",
  ],
  featuresEn: [
    "10 full-featured active student seats for 3 days",
    "1 dedicated institutional collaborative classroom (video, audio, whiteboard)",
    "Scoped institutional admin dashboard & attendance reporting with CSV export",
    "Bulk roster onboarding with instant credential cards export",
    "Full preview of 7 accredited tracks & 320 interactive lessons",
    "Zero credit card or commitment required",
  ],
};
