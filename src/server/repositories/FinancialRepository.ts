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

export interface ParentSubscription {
  id: string;
  parentId: string;
  planId: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELED";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
}

export interface DiscountCoupon {
  code: string;
  discountPercentage: number; // e.g. 10 for 10%
  descriptionAr: string;
  isActive: boolean;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPriceMinorUnits: number;
  totalMinorUnits: number;
}

export interface DomainInvoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0901"
  parentId: string;
  subscriptionId?: string;
  subtotalMinorUnits: number;
  discountMinorUnits: number;
  taxMinorUnits: number;
  totalMinorUnits: number;
  currency: string;
  status: "PAID" | "PENDING" | "REFUNDED" | "VOID";
  lineItems: InvoiceLineItem[];
  paymentMethod: string;
  paidAt?: Date;
  createdAt: Date;
}

export interface TeacherPayrollRecord {
  id: string;
  teacherId: string;
  monthString: string; // "2026-09"
  completedSessionsCount: number;
  totalHours: number;
  hourlyRateMinorUnits: number;
  grossPayMinorUnits: number;
  status: "PAID" | "PENDING";
  paidAt?: Date;
}

class InMemoryFinancialRepository {
  private plans: Map<string, SubscriptionPlan> = new Map();
  private subscriptions: Map<string, ParentSubscription> = new Map();
  private coupons: Map<string, DiscountCoupon> = new Map();
  private invoices: Map<string, DomainInvoice> = new Map();
  private payrollRecords: Map<string, TeacherPayrollRecord> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // 1. Subscription Plans in integer minor units
    const plansCatalog: SubscriptionPlan[] = [
      {
        id: "plan-starter",
        code: "STARTER",
        nameAr: "مسار البراعم الفردي",
        nameEn: "Starter Explorer Track",
        descriptionAr: "حصة أسبوعية واحدة في فصل جماعي مصغر مع متابعة الواجبات",
        priceMinorUnits: 4900, // $49.00
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
        priceMinorUnits: 8900, // $89.00
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
        priceMinorUnits: 14900, // $149.00
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
        priceMinorUnits: 22000, // $220.00
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

    // 2. Active Parent Subscription for Tariq (parent-1)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    this.subscriptions.set("sub-parent-1", {
      id: "sub-parent-1",
      parentId: "parent-1",
      planId: "plan-family",
      status: "ACTIVE",
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      createdAt: periodStart,
    });

    // 3. Discount Coupons
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

    // 4. Invoices
    this.invoices.set("inv-1", {
      id: "inv-1",
      invoiceNumber: "INV-2026-0901",
      parentId: "parent-1",
      subscriptionId: "sub-parent-1",
      subtotalMinorUnits: 14900,
      discountMinorUnits: 0,
      taxMinorUnits: 0,
      totalMinorUnits: 14900,
      currency: "USD",
      status: "PAID",
      lineItems: [
        {
          description: "باقة العائلة المتميزة - اشتراك شهر سبتمبر 2026 (تغطية 3 أطفال)",
          quantity: 1,
          unitPriceMinorUnits: 14900,
          totalMinorUnits: 14900,
        },
      ],
      paymentMethod: "بطاقة ائتمانية (Visa •••• 4242)",
      paidAt: new Date(now.getFullYear(), now.getMonth(), 1, 10, 0, 0),
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1, 10, 0, 0),
    });

    this.invoices.set("inv-2", {
      id: "inv-2",
      invoiceNumber: "INV-2026-0801",
      parentId: "parent-1",
      subtotalMinorUnits: 14900,
      discountMinorUnits: 0,
      taxMinorUnits: 0,
      totalMinorUnits: 14900,
      currency: "USD",
      status: "PAID",
      lineItems: [
        {
          description: "باقة العائلة المتميزة - اشتراك شهر أغسطس 2026",
          quantity: 1,
          unitPriceMinorUnits: 14900,
          totalMinorUnits: 14900,
        },
      ],
      paymentMethod: "بطاقة ائتمانية (Visa •••• 4242)",
      paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 1, 10, 0, 0),
      createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 1, 10, 0, 0),
    });

    // 5. Teacher Payroll Record for Ustadh Ahmed (teacher-1)
    // 16 completed sessions * 0.75 hr (45 min) = 12 hours @ $30/hr (3000 minor units) = $360.00 (36000 minor units)
    this.payrollRecords.set("pay-teacher-1-2026-09", {
      id: "pay-teacher-1-2026-09",
      teacherId: "teacher-1",
      monthString: "2026-09",
      completedSessionsCount: 16,
      totalHours: 12,
      hourlyRateMinorUnits: 3000,
      grossPayMinorUnits: 36000,
      status: "PENDING",
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

  // --- Subscriptions ---
  async getAllSubscriptions(): Promise<ParentSubscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async getSubscriptionByParentId(parentId: string): Promise<ParentSubscription | null> {
    for (const sub of this.subscriptions.values()) {
      if (sub.parentId === parentId && sub.status === "ACTIVE") {
        return sub;
      }
    }
    return null;
  }

  async saveSubscription(sub: ParentSubscription): Promise<ParentSubscription> {
    this.subscriptions.set(sub.id, sub);
    return sub;
  }

  // --- Invoices ---
  async getAllInvoices(): Promise<DomainInvoice[]> {
    return Array.from(this.invoices.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getInvoicesByParentId(parentId: string): Promise<DomainInvoice[]> {
    return Array.from(this.invoices.values())
      .filter((inv) => inv.parentId === parentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getInvoiceById(id: string): Promise<DomainInvoice | null> {
    return this.invoices.get(id) || null;
  }

  async saveInvoice(invoice: DomainInvoice): Promise<DomainInvoice> {
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  // --- Payroll ---
  async getPayrollByTeacherId(teacherId: string): Promise<TeacherPayrollRecord[]> {
    return Array.from(this.payrollRecords.values()).filter((p) => p.teacherId === teacherId);
  }

  async getAllPayrollRecords(): Promise<TeacherPayrollRecord[]> {
    return Array.from(this.payrollRecords.values());
  }

  async savePayrollRecord(record: TeacherPayrollRecord): Promise<TeacherPayrollRecord> {
    this.payrollRecords.set(record.id, record);
    return record;
  }
}

export const financialRepository = new InMemoryFinancialRepository();
