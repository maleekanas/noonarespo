import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ArrowRight, Building2, ShieldCheck, PlusCircle, CheckCircle2, Sliders, Trash2, Power, Zap } from "lucide-react";
import { schoolService } from "@/server/services/SchoolService";
import { administrationService } from "@/server/services/AdministrationService";
import { SchoolManagementClient } from "@/components/admin/SchoolManagementClient";
import { getDictionary } from "@/lib/localization";
import { requireAdminSession } from "@/lib/auth/currentUser";
import { InstitutionType, BundleTier } from "@/server/repositories/SchoolRepository";
import { EmailAdapter } from "@/lib/integrations/notifications/EmailAdapter";

export default async function AdminSchoolsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; updated?: string; toggled?: string }>;
}) {
  const { locale } = await params;
  const { saved, updated, toggled } = await searchParams;
  const adminSession = await requireAdminSession(locale);
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const sc = dict.adminSchools;

  const schools = await schoolService.getAllSchools();
  const kpis = await schoolService.getInstitutionalKPIs();

  async function handleOnboardBatchAction(params: {
    schoolId: string;
    students: { fullName: string; email?: string }[];
    ageGroup: "AGE_4_6" | "AGE_7_10" | "AGE_11_13" | "AGE_14_16";
  }) {
    "use server";
    await requireAdminSession(locale);
    return schoolService.onboardBatchRoster({ ...params, locale });
  }

  async function handleCreateSchoolAdminAction(params: {
    schoolId: string;
    fullName: string;
    email?: string;
  }) {
    "use server";
    const admin = await requireAdminSession(locale);
    const account = await schoolService.createSchoolAdmin(params);

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "SCHOOL_ADMIN_CREATED",
      actor: admin,
      targetEntityId: params.schoolId,
      targetEntityType: "PartnerSchool",
      diffSummary: `إنشاء حساب مدير مؤسسة جديد [${account.email}] لمؤسسة [${params.schoolId}]`,
    });

    return account;
  }

  // Server Action: Register New Partner School
  async function handleCreateSchool(formData: FormData) {
    "use server";
    const admin = await requireAdminSession(locale);
    const nameAr = formData.get("nameAr")?.toString().trim() || "";
    const nameEn = formData.get("nameEn")?.toString().trim() || nameAr;
    const type = (formData.get("type")?.toString() || "PRIVATE_INSTITUTE") as InstitutionType;
    const country = formData.get("country")?.toString().trim() || "Saudi Arabia";
    const city = formData.get("city")?.toString().trim() || "Riyadh";
    const bundleTier = (formData.get("bundleTier")?.toString() || "STARTER") as BundleTier;
    const licenseSeatsTotal = parseInt(formData.get("licenseSeatsTotal")?.toString() || "25", 10);
    const contactPerson = formData.get("contactPerson")?.toString().trim() || "مدير المؤسسة";
    const contactEmail = formData.get("contactEmail")?.toString().trim() || "school@example.com";

    if (!nameAr) return;

    const newSchool = await schoolService.createSchool({
      nameAr,
      nameEn,
      type,
      country,
      city,
      bundleTier,
      licenseSeatsTotal,
      contactPerson,
      contactEmail,
    });

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "REGISTER_PARTNER_SCHOOL",
      actor: admin,
      targetEntityId: newSchool.id,
      targetEntityType: "PartnerSchool",
      diffSummary: `تسجيل مؤسسة جديدة: ${nameAr} (${type}, ${bundleTier}, ${licenseSeatsTotal} مقعد)`,
    });

    revalidatePath(`/${locale}/admin/schools`);
    revalidatePath(`/${locale}/schools`);
  }

  // Server Action: Update School Tier & Seats
  async function handleUpdateSchoolTier(formData: FormData) {
    "use server";
    const admin = await requireAdminSession(locale);
    const schoolId = formData.get("schoolId")?.toString();
    const bundleTier = formData.get("bundleTier")?.toString() as BundleTier | undefined;
    const licenseSeatsTotal = formData.get("licenseSeatsTotal")
      ? parseInt(formData.get("licenseSeatsTotal")!.toString(), 10)
      : undefined;

    if (!schoolId) return;

    await schoolService.updateSchool(schoolId, {
      bundleTier,
      licenseSeatsTotal,
    });

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "UPDATE_SCHOOL_TIER_SEATS",
      actor: admin,
      targetEntityId: schoolId,
      targetEntityType: "PartnerSchool",
      diffSummary: `تحديث باقة ومقاعد المؤسسة [${schoolId}] إلى [${bundleTier}, ${licenseSeatsTotal} مقعد]`,
    });

    revalidatePath(`/${locale}/admin/schools`);
    revalidatePath(`/${locale}/school-admin`);
  }

  // Server Action: Toggle School Active
  async function handleToggleSchool(formData: FormData) {
    "use server";
    const admin = await requireAdminSession(locale);
    const schoolId = formData.get("schoolId")?.toString();
    if (!schoolId) return;

    const updated = await schoolService.toggleSchoolActive(schoolId);

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "TOGGLE_SCHOOL_STATUS",
      actor: admin,
      targetEntityId: schoolId,
      targetEntityType: "PartnerSchool",
      diffSummary: `تغيير حالة تعاقد المؤسسة [${schoolId}] إلى [${updated?.contractStatus}]`,
    });

    revalidatePath(`/${locale}/admin/schools`);
  }

  // Server Action: Activate 3-Day Free Trial (auto-creates trial school +
  // real SCHOOL_ADMIN login, and emails the credentials to the applicant)
  async function handleActivateTrial(formData: FormData) {
    "use server";
    const admin = await requireAdminSession(locale);
    const nameAr = formData.get("nameAr")?.toString().trim() || "";
    const nameEn = formData.get("nameEn")?.toString().trim() || nameAr;
    const type = (formData.get("type")?.toString() || "PRIVATE_INSTITUTE") as InstitutionType;
    const country = formData.get("country")?.toString().trim() || "Netherlands";
    const city = formData.get("city")?.toString().trim() || "";
    const contactPerson = formData.get("contactPerson")?.toString().trim() || "";
    const contactEmail = formData.get("contactEmail")?.toString().trim().toLowerCase() || "";

    if (!nameAr || !contactPerson || !contactEmail) return;

    const { school, adminAccount } = await schoolService.registerTrialSchool({
      nameAr,
      nameEn,
      contactPerson,
      contactEmail,
      type,
      country,
      city,
    });

    if (adminAccount) {
      const emailAdapter = new EmailAdapter();
      const loginUrl = `https://arabickidsacademy.com/${locale}/login`;
      await emailAdapter
        .send({
          recipientContact: contactEmail,
          recipientName: contactPerson,
          eventName: "TRIAL_ACCOUNT_ACTIVATED",
          titleAr: `تم تفعيل حسابكم التجريبي المجاني (3 أيام) - ${nameAr}`,
          bodyAr: [
            `تم تفعيل التجربة المجانية المؤسسية لـ "${nameAr}" بنجاح، وجميع الميزات المؤسسية متاحة الآن لمدة 3 أيام (حتى 10 طلاب).`,
            `رابط الدخول: ${loginUrl}`,
            `البريد الإلكتروني: ${adminAccount.email}`,
            `كلمة المرور المؤقتة: ${adminAccount.tempPassword}`,
            `يرجى تسجيل الدخول وتغيير كلمة المرور في أقرب وقت ممكن.`,
          ].join("<br/>"),
          actionUrl: loginUrl,
          metadata: { schoolId: school.id, contactEmail },
        })
        .catch((err) =>
          console.error("[AdminSchools] Failed to send trial activation credentials email", err)
        );
    }

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "TRIAL_ACCOUNT_ACTIVATED",
      actor: admin,
      targetEntityId: school.id,
      targetEntityType: "PartnerSchool",
      diffSummary: `تفعيل حساب تجريبي (3 أيام) لمؤسسة [${nameAr}] وإنشاء حساب دخول لـ [${adminAccount?.email || contactEmail}]`,
    });

    revalidatePath(`/${locale}/admin/schools`);
    revalidatePath(`/${locale}/schools`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href={`/${locale}/admin`} className="hover:text-brand-600 flex items-center gap-1">
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
              {sc.backToAdminDashboard}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {sc.breadcrumbCurrent}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-600" />
            {sc.pageHeading}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {sc.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-2.5 rounded-2xl shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{sc.b2bLicensesLabel}</span>{" "}
            <span>{kpis.totalSeatsUsed} / {kpis.totalSeatsLicensed} {sc.activeSeatsSuffix}</span>
          </div>
        </div>
      </div>

      {/* New Partner School Registration Form */}
      <details className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group">
        <summary className="p-6 cursor-pointer flex items-center justify-between font-extrabold text-slate-900 text-base select-none hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <span>{isAr ? "تسجيل مدرسة أو معهد أو معلم مستقل جديد (B2B Partner)" : "Register New B2B Partner School / Co-Op"}</span>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {isAr
                  ? "إنشاء كيان مؤسسي جديد وتحديد نوعه والمدينة وباقة الاشتراك وعدد المقاعد المرخصة"
                  : "Create new institutional entity, configure bundle tier, and allocate licensed seats"}
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">
            {isAr ? "+ تسجيل مؤسسة جديدة" : "+ Register School"}
          </span>
        </summary>

        <form action={handleCreateSchool} className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "اسم المؤسسة (بالعربية)" : "Institution Name (Arabic)"}
              </label>
              <input
                name="nameAr"
                required
                placeholder="مثال: أكاديمية النور الإسلامية"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "اسم المؤسسة (بالإنجليزية)" : "Institution Name (English)"}
              </label>
              <input
                name="nameEn"
                placeholder="Al-Noor Islamic Academy"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "نوع الكيان المؤسسي" : "Institution Type"}
              </label>
              <select
                name="type"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="ISLAMIC_SCHOOL">{isAr ? "مدرسة إسلامية نظامية" : "Islamic School"}</option>
                <option value="PRIVATE_INSTITUTE">{isAr ? "معهد لغات خاص" : "Private Language Institute"}</option>
                <option value="COMMUNITY_CENTER">{isAr ? "مركز إسلامي / مجتمعي" : "Community Center"}</option>
                <option value="HOMESCHOOL_COOP">{isAr ? "مجموعة تعليم منزلي (Co-Op)" : "Homeschool Co-Op"}</option>
                <option value="FREELANCER_TEACHER">{isAr ? "معلم مستقل / حلقة فردية" : "Freelance Teacher / Studio"}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "الدولة" : "Country"}
              </label>
              <input
                name="country"
                defaultValue="Saudi Arabia"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "المدينة" : "City"}
              </label>
              <input
                name="city"
                defaultValue="Riyadh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "باقة الاشتراك المؤسسي" : "Bundle Tier"}
              </label>
              <select
                name="bundleTier"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="STARTER">{isAr ? "الباقة الأساسية (STARTER - حتى 25 مقعداً)" : "Starter (Up to 25 seats)"}</option>
                <option value="GROWTH">{isAr ? "باقة النمو (GROWTH - حتى 100 مقعد)" : "Growth (Up to 100 seats)"}</option>
                <option value="INSTITUTION">{isAr ? "باقة المؤسسات (INSTITUTION - 100+ مقعد)" : "Institution (100+ seats)"}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "إجمالي المقاعد المرخصة" : "Total Licensed Seats"}
              </label>
              <input
                name="licenseSeatsTotal"
                type="number"
                min={5}
                max={5000}
                defaultValue={25}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "اسم مسؤول التواصل" : "Contact Person"}
              </label>
              <input
                name="contactPerson"
                required
                placeholder="أ/ عبد الله المنصور"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "البريد الإلكتروني للتواصل" : "Contact Email"}
              </label>
              <input
                name="contactEmail"
                type="email"
                required
                placeholder="admin@alnoor.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {isAr ? "تسجيل واعتماد المؤسسة في المنظومة 🏫" : "Register & Confirm Partner School"}
          </button>
        </form>
      </details>

      {/* Activate 3-Day Free Trial -- Auto-Create Account */}
      <details className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden group">
        <summary className="p-6 cursor-pointer flex items-center justify-between font-extrabold text-slate-900 text-base select-none hover:bg-amber-50/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span>{isAr ? "تفعيل تجربة مجانية 3 أيام (إنشاء حساب تلقائي)" : "Activate 3-Day Free Trial (Auto-Create Account)"}</span>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {isAr
                  ? "إنشاء مؤسسة تجريبية فورية (10 مقاعد، جميع الميزات المؤسسية) وحساب دخول حقيقي، مع إرسال بيانات الدخول تلقائياً إلى بريد المتقدم"
                  : "Instantly creates a trial institution (10 seats, all institutional features) with a real login account, and automatically emails the credentials to the applicant"}
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-sm">
            {isAr ? "⚡ تفعيل فوري" : "⚡ Activate Instantly"}
          </span>
        </summary>

        <form action={handleActivateTrial} className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "اسم المؤسسة (بالعربية)" : "Institution Name (Arabic)"}
              </label>
              <input
                name="nameAr"
                required
                placeholder="مثال: حلقة تحفيظ النور"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "اسم المؤسسة (بالإنجليزية)" : "Institution Name (English)"}
              </label>
              <input
                name="nameEn"
                placeholder="Al-Noor Quran Circle"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "نوع الكيان المؤسسي" : "Institution Type"}
              </label>
              <select
                name="type"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="ISLAMIC_SCHOOL">{isAr ? "مدرسة إسلامية نظامية" : "Islamic School"}</option>
                <option value="PRIVATE_INSTITUTE">{isAr ? "معهد لغات خاص" : "Private Language Institute"}</option>
                <option value="COMMUNITY_CENTER">{isAr ? "مركز إسلامي / مجتمعي" : "Community Center"}</option>
                <option value="HOMESCHOOL_COOP">{isAr ? "مجموعة تعليم منزلي (Co-Op)" : "Homeschool Co-Op"}</option>
                <option value="FREELANCER_TEACHER">{isAr ? "معلم مستقل / حلقة فردية" : "Freelance Teacher / Studio"}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "الدولة" : "Country"}
              </label>
              <input
                name="country"
                defaultValue="Netherlands"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "المدينة" : "City"}
              </label>
              <input
                name="city"
                placeholder="Amsterdam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "اسم مسؤول التواصل" : "Contact Person"}
              </label>
              <input
                name="contactPerson"
                required
                placeholder="أ/ عبد الله المنصور"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "البريد الإلكتروني للتواصل (سيتم إرسال بيانات الدخول إليه)" : "Contact Email (login credentials sent here)"}
              </label>
              <input
                name="contactEmail"
                type="email"
                required
                placeholder="applicant@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {isAr ? "⚡ تفعيل الحساب التجريبي وإرسال بيانات الدخول" : "⚡ Activate Trial & Email Login Credentials"}
          </button>
        </form>
      </details>

      {/* Main School Management Hub */}
      <SchoolManagementClient
        initialSchools={schools}
        kpis={kpis}
        locale={locale}
        onOnboardBatch={handleOnboardBatchAction}
        onCreateSchoolAdmin={handleCreateSchoolAdminAction}
      />
    </div>
  );
}
