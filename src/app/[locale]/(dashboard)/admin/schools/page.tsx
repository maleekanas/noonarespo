import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ArrowRight, Building2, ShieldCheck, PlusCircle, CheckCircle2, Sliders, Trash2, Power, Zap, Bell, X, Receipt, Users, UserPlus2 } from "lucide-react";
import { schoolService, B2B_BUNDLES } from "@/server/services/SchoolService";
import { administrationService } from "@/server/services/AdministrationService";
import { SchoolManagementClient } from "@/components/admin/SchoolManagementClient";
import { getDictionary } from "@/lib/localization";
import { requireAdminHubAccess } from "@/lib/auth/currentUser";
import { InstitutionType, BundleTier } from "@/server/repositories/SchoolRepository";

// This page is session-gated (requireAdminSession reads the auth cookie) and
// shows live DB state (KPIs, school directory) plus two admin action panels
// (Register New Partner School / Activate 3-Day Free Trial) that were added
// after this route had already been cached by Vercel's Full Route Cache --
// the parent [locale] layout defines generateStaticParams, which makes this
// route eligible for that cache even though it should be request-dynamic.
// Force dynamic, uncached rendering so every request re-executes this page
// (and its Server Actions) fresh and new admin UI added here always ships
// immediately on deploy instead of waiting on a cache invalidation.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSchoolsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; updated?: string; toggled?: string; teacherAssigned?: string }>;
}) {
  const { locale } = await params;
  const { saved, updated, toggled, teacherAssigned } = await searchParams;
  const adminSession = await requireAdminHubAccess(locale, "schools");
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const sc = dict.adminSchools;

  const schools = await schoolService.getAllSchools();
  const kpis = await schoolService.getInstitutionalKPIs();
  const pendingTrialRequests = await schoolService.getPendingTrialRequests();

  // Per-school teacher roster + the pool of not-yet-assigned teachers, for
  // the new Billing & Roster panel below -- getSchoolTeachers/assignTeacher
  // were already fully implemented on SchoolService with nothing in the UI
  // ever calling them.
  const teachersBySchoolId = new Map<string, any[]>();
  await Promise.all(
    schools.map(async (s) => {
      teachersBySchoolId.set(s.id, await schoolService.getSchoolTeachers(s.id));
    })
  );
  const unassignedTeachers = await schoolService.getUnassignedTeachers();

  const INSTITUTION_TYPE_LABELS: Record<string, string> = {
    ISLAMIC_SCHOOL: isAr ? "مدرسة إسلامية نظامية" : "Islamic School",
    PRIVATE_INSTITUTE: isAr ? "معهد لغات خاص" : "Private Language Institute",
    COMMUNITY_CENTER: isAr ? "مركز إسلامي / مجتمعي" : "Community Center",
    HOMESCHOOL_COOP: isAr ? "مجموعة تعليم منزلي (Co-Op)" : "Homeschool Co-Op",
    FREELANCER_TEACHER: isAr ? "معلم مستقل / حلقة فردية" : "Freelance Teacher / Studio",
    OTHER: isAr ? "أخرى" : "Other",
  };

  async function handleOnboardBatchAction(params: {
    schoolId: string;
    students: { fullName: string; email?: string }[];
    ageGroup: "AGE_4_6" | "AGE_7_10" | "AGE_11_13" | "AGE_14_16";
  }) {
    "use server";
    await requireAdminHubAccess(locale, "schools");
    return schoolService.onboardBatchRoster({ ...params, locale });
  }

  async function handleCreateSchoolAdminAction(params: {
    schoolId: string;
    fullName: string;
    email?: string;
  }): Promise<{
    account: Awaited<ReturnType<typeof schoolService.createSchoolAdmin>> | null;
    error: string | null;
  }> {
    "use server";
    const admin = await requireAdminHubAccess(locale, "schools");

    // Caught here (rather than left to throw) because any error thrown out
    // of a Server Action is redacted by Next.js in production to a generic
    // "Server Components render" digest with no detail -- that's what admins
    // were seeing instead of the real, usually very fixable, reason (most
    // often: that email is already someone else's login).
    let account: Awaited<ReturnType<typeof schoolService.createSchoolAdmin>>;
    try {
      account = await schoolService.createSchoolAdmin(params);
    } catch (err) {
      return {
        account: null,
        error: err instanceof Error ? err.message : "Failed to create the admin account.",
      };
    }

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "SCHOOL_ADMIN_CREATED",
      actor: admin,
      targetEntityId: params.schoolId,
      targetEntityType: "PartnerSchool",
      diffSummary: `إنشاء حساب مدير مؤسسة جديد [${account.email}] لمؤسسة [${params.schoolId}]`,
    });

    return { account, error: null };
  }

  // Server Action: Register New Partner School
  async function handleCreateSchool(formData: FormData) {
    "use server";
    const admin = await requireAdminHubAccess(locale, "schools");
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
    const admin = await requireAdminHubAccess(locale, "schools");
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
    const admin = await requireAdminHubAccess(locale, "schools");
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
    const admin = await requireAdminHubAccess(locale, "schools");
    const nameAr = formData.get("nameAr")?.toString().trim() || "";
    const nameEn = formData.get("nameEn")?.toString().trim() || nameAr;
    const type = (formData.get("type")?.toString() || "PRIVATE_INSTITUTE") as InstitutionType;
    const country = formData.get("country")?.toString().trim() || "Netherlands";
    const city = formData.get("city")?.toString().trim() || "";
    const contactPerson = formData.get("contactPerson")?.toString().trim() || "";
    const contactEmail = formData.get("contactEmail")?.toString().trim().toLowerCase() || "";

    if (!nameAr || !contactPerson || !contactEmail) return;

    const { school, adminAccount } = await schoolService.activateTrialAndNotify({
      nameAr,
      nameEn,
      contactPerson,
      contactEmail,
      type,
      country,
      city,
      locale,
    });

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

  // Server Action: Approve a pending 3-Day Free Trial request (submitted by
  // a school/institution through the public /schools apply form). Reuses
  // the exact same account-creation + credentials-email path as the manual
  // "Activate 3-Day Free Trial" form above -- this is the "just approve it"
  // button that turns a queued request into a live account with one click.
  async function handleApproveTrialRequestAction(formData: FormData) {
    "use server";
    const admin = await requireAdminHubAccess(locale, "schools");
    const requestId = formData.get("requestId")?.toString();
    if (!requestId) return;

    const { school, adminAccount } = await schoolService.approveTrialRequest(
      requestId,
      admin.id,
      locale
    );

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "TRIAL_REQUEST_APPROVED",
      actor: admin,
      targetEntityId: school.id,
      targetEntityType: "PartnerSchool",
      diffSummary: `الموافقة على طلب تجربة مجانية [${requestId}] وتفعيل حساب دخول لـ [${adminAccount?.email || school.contactEmail}]`,
    });

    revalidatePath(`/${locale}/admin/schools`);
    revalidatePath(`/${locale}/schools`);
  }

  // Server Action: Reject a pending 3-Day Free Trial request without
  // creating any account.
  async function handleRejectTrialRequestAction(formData: FormData) {
    "use server";
    const admin = await requireAdminHubAccess(locale, "schools");
    const requestId = formData.get("requestId")?.toString();
    if (!requestId) return;

    await schoolService.rejectTrialRequest(requestId, admin.id);

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "TRIAL_REQUEST_REJECTED",
      actor: admin,
      targetEntityId: requestId,
      targetEntityType: "TrialRequest",
      diffSummary: `رفض طلب تجربة مجانية [${requestId}]`,
    });

    revalidatePath(`/${locale}/admin/schools`);
  }

  // Server Action: Assign an unassigned teacher to this school's roster --
  // wires up SchoolService.assignTeacher / getSchoolTeachers, which were
  // already fully implemented but had no page calling them.
  async function handleAssignTeacherToSchool(formData: FormData) {
    "use server";
    const admin = await requireAdminHubAccess(locale, "schools");
    const schoolId = formData.get("schoolId")?.toString();
    const teacherId = formData.get("teacherId")?.toString();
    if (!schoolId || !teacherId) return;

    await schoolService.assignTeacher(teacherId, schoolId);

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "ASSIGN_TEACHER_TO_SCHOOL",
      actor: admin,
      targetEntityId: teacherId,
      targetEntityType: "TeacherProfile",
      diffSummary: `تعيين المعلم [${teacherId}] لمؤسسة [${schoolId}]`,
    });

    revalidatePath(`/${locale}/admin/schools`);
    redirect(`/${locale}/admin/schools?teacherAssigned=${schoolId}`);
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

      {/* Pending 3-Day Free Trial Requests -- submitted publicly via /schools,
          shown here so the superadmin can just approve (creates the account
          + emails credentials automatically) or reject, with no retyping. */}
      {pendingTrialRequests.length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-md overflow-hidden">
          <div className="p-6 pb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">
                  {isAr ? "طلبات تجربة مجانية بانتظار الموافقة" : "Pending 3-Day Trial Requests"}
                </h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {isAr
                    ? "تصل تلقائياً من نموذج التقديم العام. الموافقة تنشئ الحساب فوراً وترسل بيانات الدخول للمتقدم."
                    : "Arrives automatically from the public apply form. Approving instantly creates the account and emails the applicant their login credentials."}
                </p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold shrink-0">
              {pendingTrialRequests.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {pendingTrialRequests.map((req) => (
              <div
                key={req.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="text-xs space-y-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {isAr ? req.nameAr : req.nameEn || req.nameAr}
                  </p>
                  <p className="text-slate-600">
                    {req.contactPerson} · {req.contactEmail}
                    {req.phone ? ` · ${req.phone}` : ""}
                  </p>
                  <p className="text-slate-500">
                    {req.city ? `${req.city}, ` : ""}
                    {req.country} · {INSTITUTION_TYPE_LABELS[req.type] || req.type}
                    {req.studentsEstimate
                      ? ` · ~${req.studentsEstimate} ${isAr ? "طالب" : "students"}`
                      : ""}
                  </p>
                  <p className="text-slate-400">
                    {new Date(req.createdAt).toLocaleString(isAr ? "ar" : "en", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <form action={handleApproveTrialRequestAction}>
                    <input type="hidden" name="requestId" value={req.id} />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isAr ? "موافقة وتفعيل" : "Approve & Activate"}
                    </button>
                  </form>
                  <form action={handleRejectTrialRequestAction}>
                    <input type="hidden" name="requestId" value={req.id} />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      {isAr ? "رفض" : "Reject"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {teacherAssigned && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            {isAr ? "تم تعيين المعلم لطاقم المؤسسة بنجاح." : "Teacher assigned to the school's staff successfully."}
          </span>
        </div>
      )}

      {/* Partner Schools Directory -- lets the superadmin actually change an
          existing school's plan/seats or deactivate/reactivate its contract.
          handleUpdateSchoolTier and handleToggleSchool below were previously
          fully implemented Server Actions with no button wired to either --
          this was the only way to reach them. */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 pb-5 flex items-center justify-between gap-3 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              {isAr ? "دليل المؤسسات الشريكة" : "Partner Schools Directory"}
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {isAr
                ? "تعديل باقة ومقاعد أي مؤسسة، أو تعليق/إعادة تفعيل تعاقدها"
                : "Change a school's plan/seats, or deactivate/reactivate its contract"}
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold shrink-0">
            {schools.length}
          </span>
        </div>

        {schools.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {isAr ? "لا توجد مؤسسات مسجلة بعد" : "No partner schools registered yet"}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {schools.map((school) => {
              const billing = schoolService.getSchoolBillingSummary(school);
              const schoolTeachers = teachersBySchoolId.get(school.id) || [];
              return (
              <div key={school.id} className="p-6 space-y-4">
              <div
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="text-xs space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {isAr ? school.nameAr : school.nameEn || school.nameAr}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                        school.contractStatus === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : school.contractStatus === "TRIAL"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {school.contractStatus === "ACTIVE"
                        ? isAr ? "نشط" : "Active"
                        : school.contractStatus === "TRIAL"
                        ? isAr ? "تجربة" : "Trial"
                        : isAr ? "معلّق" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-slate-500">
                    {INSTITUTION_TYPE_LABELS[school.type] || school.type} · {school.city}, {school.country}
                  </p>
                  <p className="text-slate-500">
                    {isAr ? "المقاعد" : "Seats"}: {school.licenseSeatsUsed} / {school.licenseSeatsTotal} ·{" "}
                    {isAr ? "الباقة الحالية" : "Current plan"}:{" "}
                    {isAr ? B2B_BUNDLES[school.bundleTier]?.nameAr : B2B_BUNDLES[school.bundleTier]?.nameEn ?? school.bundleTier}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <form action={handleUpdateSchoolTier} className="flex items-center gap-1.5">
                    <input type="hidden" name="schoolId" value={school.id} />
                    <select
                      name="bundleTier"
                      defaultValue={school.bundleTier}
                      className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                    >
                      <option value="STARTER">{isAr ? "أساسية" : "Starter"}</option>
                      <option value="GROWTH">{isAr ? "نمو" : "Growth"}</option>
                      <option value="INSTITUTION">{isAr ? "مؤسسية" : "Institution"}</option>
                    </select>
                    <input
                      type="number"
                      name="licenseSeatsTotal"
                      defaultValue={school.licenseSeatsTotal}
                      min={1}
                      className="w-20 text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-700"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      {isAr ? "تحديث" : "Update"}
                    </button>
                  </form>
                  <form action={handleToggleSchool}>
                    <input type="hidden" name="schoolId" value={school.id} />
                    <button
                      type="submit"
                      className={`flex items-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-colors cursor-pointer border ${
                        school.contractStatus === "ACTIVE"
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {school.contractStatus === "ACTIVE"
                        ? isAr ? "تعليق" : "Deactivate"
                        : isAr ? "تفعيل" : "Reactivate"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Billing & Roster Panel -- computed billing summary (B2B
                  Invoice rows don't exist; the real numbers live in
                  bundleTier/licenseSeatsTotal, already persisted) plus the
                  real teacher roster + assignment action, both previously
                  fully implemented on SchoolService with no UI reaching
                  them. */}
              <details className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden group">
                <summary className="px-4 py-2.5 cursor-pointer flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-700 select-none">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{isAr ? "الفوترة وطاقم التدريس" : "Billing & Teaching Staff"}</span>
                  <span className="text-slate-400 font-normal">({schoolTeachers.length} {isAr ? "معلم" : "teachers"})</span>
                </summary>

                <div className="px-4 pb-4 pt-1 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                  {/* Billing summary */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isAr ? "ملخص الفوترة" : "Billing Summary"}</span>
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isAr ? "الباقة" : "Bundle"}</span>
                      <span className="font-bold text-slate-900">{isAr ? billing.bundle.nameAr : billing.bundle.nameEn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isAr ? "السعر الشهري" : "Monthly price"}</span>
                      <span className="font-bold text-slate-900 font-mono">€{billing.monthlyPriceEur}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isAr ? "استخدام المقاعد" : "Seat utilization"}</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {billing.seatsUsed}/{billing.seatsTotal} ({billing.seatUtilizationPct}%)
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      {isAr
                        ? "الفوترة المؤسسية تُدار تعاقدياً عبر الباقة والمقاعد المرخصة، وليست فواتير Stripe فردية."
                        : "B2B billing is contract-managed via bundle tier and licensed seats, not individual Stripe invoices."}
                    </p>
                  </div>

                  {/* Teacher roster + assignment */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isAr ? "طاقم التدريس المعيّن" : "Assigned Teaching Staff"}</span>
                    </h4>

                    {schoolTeachers.length === 0 ? (
                      <p className="text-slate-400 text-[11px]">{isAr ? "لا يوجد معلمون معيّنون بعد" : "No teachers assigned yet"}</p>
                    ) : (
                      <ul className="space-y-1">
                        {schoolTeachers.map((t) => (
                          <li key={t.id} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-50 last:border-0">
                            <span className="font-medium text-slate-700">{t.firstName} {t.lastName}</span>
                            <span className="text-slate-400 font-mono">{t.user?.email}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {unassignedTeachers.length > 0 && (
                      <form action={handleAssignTeacherToSchool} className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <input type="hidden" name="schoolId" value={school.id} />
                        <select
                          name="teacherId"
                          className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                        >
                          {unassignedTeachers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.firstName} {t.lastName} ({t.user?.email})
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="shrink-0 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <UserPlus2 className="w-3 h-3" />
                          <span>{isAr ? "تعيين" : "Assign"}</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </details>
              </div>
              );
            })}
          </div>
        )}
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
