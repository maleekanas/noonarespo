import { AgeGroup } from "@prisma/client";
import {
  schoolRepository,
  PartnerSchool,
  RosterStudentInput,
  OnboardedStudentAccount,
  OnboardedSchoolAdminAccount,
  BundleTier,
  TrialRequestRecord,
  InstitutionType,
} from "../repositories/SchoolRepository";
import { getDictionary } from "@/lib/localization";
import { EmailAdapter } from "@/lib/integrations/notifications/EmailAdapter";

export interface InstitutionalInquiryInput {
  organizationName: string;
  contactName: string;
  email: string;
  phone?: string;
  institutionType: string;
  bundlePreference?: string;
  country: string;
  city?: string;
  studentsEstimate: string | number;
  message?: string;
}

export interface InstitutionalInquiryResult {
  isDelivered: boolean;
  recipientContact: string;
  forwardedTo?: string;
  isTrial: boolean;
  statusMessage?: string;
}

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

export interface InstitutionalOverviewKPIs {
  totalPartners: number;
  totalSeatsLicensed: number;
  totalSeatsUsed: number;
  overallUtilizationPercentage: number;
  totalInstitutionalClasses: number;
  totalEnrolledStudents: number;
}

export class SchoolService {
  async getAllSchools(): Promise<PartnerSchool[]> {
    return schoolRepository.getAllSchools();
  }

  async getSchoolDetails(id: string): Promise<PartnerSchool | null> {
    return schoolRepository.getSchoolById(id);
  }

  async getInstitutionalKPIs(): Promise<InstitutionalOverviewKPIs> {
    const schools = await schoolRepository.getAllSchools();
    const totalPartners = schools.length;
    const totalSeatsLicensed = schools.reduce((acc, s) => acc + s.licenseSeatsTotal, 0);
    const totalSeatsUsed = schools.reduce((acc, s) => acc + s.licenseSeatsUsed, 0);
    const totalInstitutionalClasses = schools.reduce((acc, s) => acc + s.classesCount, 0);
    const totalEnrolledStudents = schools.reduce((acc, s) => acc + s.studentsCount, 0);

    const overallUtilizationPercentage =
      totalSeatsLicensed > 0
        ? Math.round((totalSeatsUsed / totalSeatsLicensed) * 100)
        : 0;

    return {
      totalPartners,
      totalSeatsLicensed,
      totalSeatsUsed,
      overallUtilizationPercentage,
      totalInstitutionalClasses,
      totalEnrolledStudents,
    };
  }

  /**
   * Creates a real student account for every name in the roster and links
   * it to the school. If classGroupId is provided, also creates real
   * ClassEnrollment records linking the students to that school-scoped class.
   */
  async onboardBatchRoster(params: {
    schoolId: string;
    students: RosterStudentInput[];
    ageGroup: AgeGroup;
    classGroupId?: string;
    locale?: string;
  }): Promise<{
    school: PartnerSchool;
    createdAccounts: OnboardedStudentAccount[];
    feedback: string;
  }> {
    const { school, createdAccounts } = await schoolRepository.onboardRoster(
      params.schoolId,
      params.students,
      params.ageGroup,
      params.classGroupId
    );

    const locale = params.locale || "ar";
    const isAr = locale === "ar";
    const dict = getDictionary(locale);
    const schoolName = isAr ? school.nameAr : school.nameEn;
    const feedback = dict.schoolManagementClient.onboardFeedbackTemplate
      .replace("{count}", String(createdAccounts.length))
      .replace("{schoolName}", schoolName)
      .replace("{seats}", String(school.licenseSeatsTotal - school.licenseSeatsUsed));

    return {
      school,
      createdAccounts,
      feedback,
    };
  }

  async allocateAdditionalSeats(params: {
    schoolId: string;
    additionalSeats: number;
  }): Promise<PartnerSchool> {
    return schoolRepository.allocateSeats(params.schoolId, params.additionalSeats);
  }

  /**
   * Creates the first (or an additional) real SCHOOL_ADMIN login for a
   * partner school, scoped to that school only.
   */
  async createSchoolAdmin(params: {
    schoolId: string;
    fullName: string;
    email?: string;
  }): Promise<OnboardedSchoolAdminAccount> {
    return schoolRepository.createSchoolAdmin(params.schoolId, {
      fullName: params.fullName,
      email: params.email,
    });
  }

  async getSchoolTeachers(schoolId: string): Promise<any[]> {
    return schoolRepository.getTeachersBySchoolId(schoolId);
  }

  async assignTeacher(teacherId: string, schoolId: string): Promise<void> {
    return schoolRepository.assignTeacherToSchool(teacherId, schoolId);
  }

  /**
   * Registers an institution or independent teacher on the 3-day free trial
   * (capped at 10 students, with full institutional features).
   */
  async registerTrialSchool(input: {
    nameAr: string;
    nameEn: string;
    contactPerson: string;
    contactEmail: string;
    type?: import("../repositories/SchoolRepository").InstitutionType;
    country?: string;
    city?: string;
    curriculumTrackAr?: string;
  }): Promise<{ school: PartnerSchool; adminAccount?: OnboardedSchoolAdminAccount }> {
    const school = await schoolRepository.createTrialSchool(input);
    let adminAccount: OnboardedSchoolAdminAccount | undefined;
    try {
      adminAccount = await schoolRepository.createSchoolAdmin(school.id, {
        fullName: input.contactPerson,
        email: input.contactEmail,
      });
    } catch {
      // Fallback if SCHOOL_ADMIN role is not seeded yet
    }
    return { school, adminAccount };
  }

  /**
   * Creates the trial school + real login (registerTrialSchool above), then
   * emails the applicant their activation link and login credentials
   * (their own email as the username). Shared by both places an admin can
   * trigger a trial activation: the manual "Activate 3-Day Free Trial" form
   * and approving a queued TrialRequest -- previously each place duplicated
   * its own copy of this email.
   */
  async activateTrialAndNotify(input: {
    nameAr: string;
    nameEn: string;
    contactPerson: string;
    contactEmail: string;
    type?: InstitutionType;
    country?: string;
    city?: string;
    curriculumTrackAr?: string;
    locale?: string;
  }): Promise<{ school: PartnerSchool; adminAccount?: OnboardedSchoolAdminAccount }> {
    const { school, adminAccount } = await this.registerTrialSchool(input);
    const locale = input.locale || "ar";

    if (adminAccount) {
      const loginUrl = `https://arabickidsacademy.com/${locale}/login`;
      await new EmailAdapter()
        .send({
          recipientContact: input.contactEmail,
          recipientName: input.contactPerson,
          eventName: "ACCOUNT_NOTICE",
          titleAr: `تم تفعيل حسابكم التجريبي المجاني (3 أيام) - ${input.nameAr}`,
          bodyAr: [
            `تم تفعيل التجربة المجانية المؤسسية لـ "${input.nameAr}" بنجاح، وجميع الميزات المؤسسية متاحة الآن لمدة 3 أيام (حتى 10 طلاب).`,
            `رابط تفعيل الدخول: ${loginUrl}`,
            `البريد الإلكتروني (اسم المستخدم): ${adminAccount.email}`,
            `كلمة المرور المؤقتة: ${adminAccount.tempPassword}`,
            `يرجى تسجيل الدخول وتغيير كلمة المرور في أقرب وقت ممكن.`,
          ].join("<br/>"),
          actionUrl: loginUrl,
          metadata: { schoolId: school.id, contactEmail: input.contactEmail },
        })
        .catch((err) =>
          console.error("[SchoolService] Failed to send trial activation credentials email", err)
        );
    }

    return { school, adminAccount };
  }

  /**
   * Persists a 3-Day Free Trial application submitted through the public
   * /schools apply form as a real, queryable row -- this is what makes the
   * request show up as a pending item in the superadmin dashboard instead
   * of only ever existing as an email.
   */
  async submitTrialRequest(input: {
    nameAr: string;
    nameEn?: string;
    type: InstitutionType;
    country: string;
    city?: string;
    contactPerson: string;
    contactEmail: string;
    phone?: string;
    studentsEstimate?: number;
    message?: string;
  }): Promise<TrialRequestRecord> {
    return schoolRepository.createTrialRequest({
      ...input,
      nameEn: input.nameEn || input.nameAr,
    });
  }

  async getPendingTrialRequests(): Promise<TrialRequestRecord[]> {
    return schoolRepository.getPendingTrialRequests();
  }

  /**
   * The superadmin's one-click approval: turns a pending TrialRequest into
   * a real trial school + login, emails the applicant their credentials,
   * and marks the request APPROVED (linked to the school it created).
   */
  async approveTrialRequest(
    id: string,
    reviewerId: string,
    locale?: string
  ): Promise<{ school: PartnerSchool; adminAccount?: OnboardedSchoolAdminAccount }> {
    const request = await schoolRepository.getTrialRequestById(id);
    if (!request) throw new Error(`Trial request not found: ${id}`);
    if (request.status !== "PENDING") {
      throw new Error(`Trial request [${id}] has already been ${request.status.toLowerCase()}.`);
    }

    const { school, adminAccount } = await this.activateTrialAndNotify({
      nameAr: request.nameAr,
      nameEn: request.nameEn,
      contactPerson: request.contactPerson,
      contactEmail: request.contactEmail,
      type: request.type,
      country: request.country,
      city: request.city || undefined,
      locale,
    });

    await schoolRepository.markTrialRequestReviewed(id, {
      status: "APPROVED",
      reviewedBy: reviewerId,
      partnerSchoolId: school.id,
    });

    return { school, adminAccount };
  }

  async rejectTrialRequest(id: string, reviewerId: string): Promise<void> {
    const request = await schoolRepository.getTrialRequestById(id);
    if (!request) throw new Error(`Trial request not found: ${id}`);
    if (request.status !== "PENDING") {
      throw new Error(`Trial request [${id}] has already been ${request.status.toLowerCase()}.`);
    }
    await schoolRepository.markTrialRequestReviewed(id, {
      status: "REJECTED",
      reviewedBy: reviewerId,
    });
  }

  async createSchool(input: {
    nameAr: string;
    nameEn: string;
    type: import("../repositories/SchoolRepository").InstitutionType;
    country: string;
    city: string;
    bundleTier: BundleTier;
    licenseSeatsTotal?: number;
    contactPerson: string;
    contactEmail: string;
    curriculumTrackAr?: string;
  }): Promise<PartnerSchool> {
    return schoolRepository.createSchool(input);
  }

  async updateSchool(
    id: string,
    partial: {
      nameAr?: string;
      nameEn?: string;
      bundleTier?: BundleTier;
      licenseSeatsTotal?: number;
      contractStatus?: import("../repositories/SchoolRepository").ContractStatus;
      contactPerson?: string;
      contactEmail?: string;
    }
  ): Promise<PartnerSchool | null> {
    return schoolRepository.updateSchool(id, partial);
  }

  async toggleSchoolActive(id: string): Promise<PartnerSchool | null> {
    return schoolRepository.toggleSchoolActive(id);
  }

  async deleteSchool(id: string): Promise<boolean> {
    return schoolRepository.deleteSchool(id);
  }

  /**
   * Processes an institutional inquiry or 3-Day Free Trial application.
   * When an applicant requests the 3-Days Free Trial (TRIAL_3_DAYS),
   * the email is specifically routed and forwarded to admin@arabickidsacademy.com.
   */
  async handleInstitutionalInquiry(
    input: InstitutionalInquiryInput
  ): Promise<InstitutionalInquiryResult> {
    const isTrialApplication =
      input.bundlePreference === "TRIAL_3_DAYS" ||
      (Boolean(input.bundlePreference) &&
        input.bundlePreference!.toLowerCase().includes("trial"));

    // Persist the 3-Day Free Trial application as a real, actionable row so
    // it shows up in the superadmin dashboard's pending-requests queue --
    // this must not block the notification email below (or vice versa),
    // since either one succeeding should still get the applicant through.
    if (isTrialApplication) {
      const studentsNum = Number(input.studentsEstimate);
      await schoolRepository
        .createTrialRequest({
          nameAr: input.organizationName,
          nameEn: input.organizationName,
          type: (input.institutionType as InstitutionType) || "PRIVATE_INSTITUTE",
          country: input.country,
          city: input.city,
          contactPerson: input.contactName,
          contactEmail: input.email,
          phone: input.phone,
          studentsEstimate: Number.isFinite(studentsNum) ? studentsNum : undefined,
          message: input.message,
        })
        .catch((err) =>
          console.error("[SchoolService] Failed to persist trial request", err)
        );
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@arabickidsacademy.com";
    const salesEmail = process.env.B2B_SALES_EMAIL || "partnerships@arabickidsacademy.com";

    // When applying for 3-Days Free Trial, send directly to admin@arabickidsacademy.com
    const primaryRecipient = isTrialApplication ? adminEmail : salesEmail;

    const bodyLines = [
      `Institution: ${input.organizationName}`,
      `Contact: ${input.contactName}`,
      `Email: ${input.email}`,
      input.phone ? `Phone: ${input.phone}` : null,
      `Type: ${input.institutionType}`,
      input.bundlePreference ? `Preferred Bundle: ${input.bundlePreference}` : null,
      `Location: ${input.city ? `${input.city}, ` : ""}${input.country}`,
      `Estimated students: ${input.studentsEstimate}`,
      isTrialApplication ? "Application Type: 3-Day Free Trial (10 Students Max - €0)" : null,
      input.message ? `Message: ${input.message}` : null,
    ].filter(Boolean);

    const emailAdapter = new EmailAdapter();
    const result = await emailAdapter.send({
      recipientContact: primaryRecipient,
      recipientName: isTrialApplication
        ? "Arabic Kids Academy Administration"
        : "Arabic Kids Academy Partnerships",
      eventName: "B2B_INQUIRY",
      titleAr: isTrialApplication
        ? `طلب تجربة مجانية 3 أيام: ${input.organizationName} (${input.studentsEstimate} طلاب)`
        : `New institutional inquiry: ${input.organizationName} (${input.bundlePreference || input.institutionType})`,
      bodyAr: bodyLines.join("<br/>"),
      actionUrl: undefined,
      metadata: {
        organizationName: input.organizationName,
        contactEmail: input.email,
        institutionType: input.institutionType,
        bundlePreference: input.bundlePreference || "",
        studentsEstimate: String(input.studentsEstimate),
        isTrial: isTrialApplication ? "true" : "false",
      },
    });

    if (!result.isDelivered) {
      console.error("[SchoolService] Institutional inquiry email failed to deliver", {
        recipient: primaryRecipient,
        isTrial: isTrialApplication,
        organizationName: input.organizationName,
        statusMessage: result.statusMessage,
      });
    }

    let forwardedTo: string | undefined;
    // When applying for 3-Day Free Trial, also notify/forward to partnerships sales if distinct
    if (
      isTrialApplication &&
      salesEmail &&
      salesEmail.toLowerCase() !== adminEmail.toLowerCase()
    ) {
      await emailAdapter
        .send({
          recipientContact: salesEmail,
          recipientName: "Arabic Kids Academy Partnerships",
          eventName: "B2B_INQUIRY",
          titleAr: `[Forwarded Trial Request] ${input.organizationName} (3-Day Free Trial - ${input.studentsEstimate} Students)`,
          bodyAr: bodyLines.join("<br/>"),
          actionUrl: undefined,
          metadata: {
            organizationName: input.organizationName,
            contactEmail: input.email,
            institutionType: input.institutionType,
            bundlePreference: input.bundlePreference || "",
            studentsEstimate: String(input.studentsEstimate),
            forwardedTo: adminEmail,
          },
        })
        .catch((err) =>
          console.error("Error forwarding trial email to sales:", err)
        );
      forwardedTo = salesEmail;
    }

    return {
      isDelivered: result.isDelivered,
      recipientContact: primaryRecipient,
      forwardedTo,
      isTrial: isTrialApplication,
      statusMessage: result.statusMessage,
    };
  }
}

export const schoolService = new SchoolService();

