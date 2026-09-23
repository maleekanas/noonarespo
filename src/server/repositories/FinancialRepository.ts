export interface SubscriptionPlan {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  priceMinorUnits: number; // e.g. 14900 for $149.00
  currency: string; // "USD"
  billingInterval: "MONTHLY" | "QUARTERLY" | "ANNUAL";
  maxChildren: number;
  weeklySessionsPerChild: number;
  featuresAr: string[];
  isPopular?: boolean;
}

export interface DiscountCoupon {
  code: string;
  discountPercentage: number; // e.g. 10 for 10%
  descriptionAr: string;
  isActive: boolean;
}

/**
 * This used to also hold in-memory, never-persisted ParentSubscription /
 * DomainInvoice / TeacherPayrollRecord data (a handful of seeded fake
 * records that reset on every serverless cold start). Real subscriptions,
 * invoices, payments, and teacher payroll are now genuinely persisted via
 * Prisma -- see StripeSubscriptionService (subscriptions/invoices/payments)
 * and PayrollService (teacher compensation) -- so this repository is left
 * with only what's still intentionally static, code-defined business
 * configuration: the plan catalog and discount coupons. That's a legitimate
 * design choice for a small business's fixed pricing tiers, not a bug --
 * changing a price or adding a coupon just means editing this file and
 * redeploying.
 */
class InMemoryFinancialRepository {
  private plans: Map<string, SubscriptionPlan> = new Map();
  private coupons: Map<string, DiscountCoupon> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Subscription Plans in integer minor units (reduced by 35%, 50%, 55%)
    const plansCatalog: SubscriptionPlan[] = [
      {
        id: "plan-individual",
        code: "INDIVIDUAL",
        nameAr: "الخطة الفردية للطلاب",
        nameEn: "Individual Student Plan",
        descriptionAr: "حصتان أسبوعياً في مجموعة مصغرة (بحد أقصى 6 طلاب) مع وصول كامل لجميع الاستوديوهات",
        priceMinorUnits: 5135, // $51.35 (was $79.00 - 35% off)
        currency: "USD",
        billingInterval: "MONTHLY",
        maxChildren: 1,
        weeklySessionsPerChild: 2,
        isPopular: true,
        featuresAr: [
          "طفل واحد",
          "حصتان أسبوعياً في مجموعة مصغرة (بحد أقصى 6 طلاب)",
          "معلم معتمد متخصص في تعليم الأطفال والتجويد",
          "وصول غير محدود لجميع الاستوديوهات التعليمية التفاعلية",
          "تقارير أسبوعية تفصيلية وتسجيلات الدروس لولي الأمر",
          "بيئة تعليمية آمنة ومتوافقة مع معايير COPPA وGDPR",
        ],
      },
      {
        id: "plan-starter",
        code: "STARTER",
        nameAr: "مسار البراعم الفردي",
        nameEn: "Starter Explorer Track",
        descriptionAr: "حصة أسبوعية واحدة في فصل جماعي مصغر مع متابعة الواجبات",
        priceMinorUnits: 3185, // $31.85 (was $49.00 - 35% off)
        currency: "USD",
        billingInterval: "MONTHLY",
        maxChildren: 1,
        weeklySessionsPerChild: 1,
        featuresAr: [
          "طفل واحد",
          "حصة أسبوعية مباشرة (45 دقيقة)",
          "واجبات صوتية أسبوعية وتصحيح المعلم",
          "وصول كامل للألعاب التفاعلية وXP",
        ],
      },
      {
        id: "plan-group",
        code: "STANDARD_GROUP",
        nameAr: "فصل النجوم الجماعي الموصى به",
        nameEn: "Standard Small-Group Cohort",
        descriptionAr: "حصتان أسبوعياً مباشرة في فصل مصغر لا يتجاوز 6 طلاب",
        priceMinorUnits: 5785, // $57.85 (was $89.00 - 35% off)
        currency: "USD",
        billingInterval: "MONTHLY",
        maxChildren: 1,
        weeklySessionsPerChild: 2,
        isPopular: true,
        featuresAr: [
          "طفل واحد",
          "حصتان أسبوعياً مباشرتان (45 دقيقة)",
          "فصول صغيرة بحد أقصى 6 أطفال",
          "متابعة دورية وتقارير أسبوعية مفصلة",
          "أوسمة وشهادة تخرج معتمدة",
        ],
      },
      {
        id: "plan-family",
        code: "FAMILY_VIP",
        nameAr: "باقة العائلة المتميزة",
        nameEn: "Family Premium Plan",
        descriptionAr: "تغطية شاملة لما يصل إلى 3 أطفال مع فصول جماعية واستشارات",
        priceMinorUnits: 7450, // $74.50 (was $149.00 - 50% total discount: 35% + 15% extra)
        currency: "USD",
        billingInterval: "MONTHLY",
        maxChildren: 3,
        weeklySessionsPerChild: 2,
        featuresAr: [
          "حتى 3 أطفال في نفس الحساب",
          "حصتان أسبوعياً لكل طفل",
          "لقاء فردي شهري مع المعلم (15 دقيقة)",
          "تخفيض عائلي مدمج 40%",
          "شهادات إتمام واختبارات تحديد مستوى دورية",
        ],
      },
      {
        id: "plan-private",
        code: "PRIVATE_1ON1",
        nameAr: "الدروس الخاصة المباشرة (1 على 1)",
        nameEn: "Private 1-on-1 Tutoring",
        descriptionAr: "تعليم فردي مكثف مخصص بالكامل لاحتياجات طفلك وسرعة تعلمه",
        priceMinorUnits: 8955, // $89.55 (was $199.00 - 55% total discount: 35% + 20% extra)
        currency: "USD",
        billingInterval: "MONTHLY",
        maxChildren: 1,
        weeklySessionsPerChild: 2,
        featuresAr: [
          "معلم خاص مخصص لطفلك فقط",
          "خطة دراسية وتجويدية مخصصة 100%",
          "مرونة كاملة في اختيار المواعيد وتعديلها",
          "تسجيلات الفيديو الكاملة لجميع الحصص",
        ],
      },
    ];

    for (const p of plansCatalog) {
      this.plans.set(p.id, p);
    }

    // Discount Coupons
    this.coupons.set("WELCOME10", {
      code: "WELCOME10",
      discountPercentage: 10,
      descriptionAr: "خصم ترحيبي 10% للطلاب الجدد",
      isActive: true,
    });

    this.coupons.set("SIBLING20", {
      code: "SIBLING20",
      discountPercentage: 20,
      descriptionAr: "خصم الإخوة الإضافي 20%",
      isActive: true,
    });
  }

  // --- Plans & Coupons ---
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.plans.values());
  }

  async getPlanById(id: string): Promise<SubscriptionPlan | null> {
    return this.plans.get(id) || null;
  }

  async getCoupon(code: string): Promise<DiscountCoupon | null> {
    const coupon = this.coupons.get(code.toUpperCase());
    return coupon && coupon.isActive ? coupon : null;
  }

  async getAllCoupons(): Promise<DiscountCoupon[]> {
    return Array.from(this.coupons.values());
  }

  async createOrUpdateCoupon(coupon: DiscountCoupon): Promise<DiscountCoupon> {
    const normalized: DiscountCoupon = {
      ...coupon,
      code: coupon.code.toUpperCase().trim(),
      discountPercentage: Math.max(1, Math.min(100, Math.round(coupon.discountPercentage))),
    };
    this.coupons.set(normalized.code, normalized);
    return normalized;
  }

  async toggleCouponActive(code: string): Promise<DiscountCoupon | null> {
    const key = code.toUpperCase().trim();
    const existing = this.coupons.get(key);
    if (!existing) return null;
    const updated: DiscountCoupon = { ...existing, isActive: !existing.isActive };
    this.coupons.set(key, updated);
    return updated;
  }

  async deleteCoupon(code: string): Promise<boolean> {
    const key = code.toUpperCase().trim();
    return this.coupons.delete(key);
  }
}

export const financialRepository = new InMemoryFinancialRepository();

