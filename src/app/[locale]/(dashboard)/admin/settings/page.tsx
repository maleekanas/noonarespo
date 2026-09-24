import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/currentUser";
import { systemSettingsService, AnnouncementType } from "@/server/services/SystemSettingsService";
import { administrationRepository } from "@/server/repositories/AdministrationRepository";
import { getClientIp } from "@/lib/security/rateLimit";
import {
  Sliders,
  ShieldCheck,
  Megaphone,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  Mail,
  Phone,
  Globe,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";

export default async function AdminSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; flushed?: string; reset?: string }>;
}) {
  const { locale } = await params;
  const { saved, flushed, reset } = await searchParams;
  const admin = await requireAdminSession(locale);
  const isAr = locale === "ar";
  const settings = await systemSettingsService.getSettings();
  const usingFallback = systemSettingsService.isUsingFallback();

  // Server Action: Update Feature Flags
  async function handleUpdateFlags(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminSession(locale);
    const allowRegistration = formData.get("allowRegistration") === "on";
    const allowB2cTrial = formData.get("allowB2cTrial") === "on";
    const allowB2bTrial = formData.get("allowB2bTrial") === "on";
    const aiTutorEnabled = formData.get("aiTutorEnabled") === "on";

    await systemSettingsService.updateSettings(
      {
        allowRegistration,
        allowB2cTrial,
        allowB2bTrial,
        aiTutorEnabled,
      },
      currentAdmin.email
    );

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "SECURITY",
      action: "UPDATE_FEATURE_FLAGS",
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorRole: currentAdmin.role,
      targetEntityId: "FEATURE_FLAGS",
      targetEntityType: "SystemSettings",
      ipAddress: ip,
      diffSummary: `Flags updated: Reg=${allowRegistration}, B2CTrial=${allowB2cTrial}, B2BTrial=${allowB2bTrial}, AI=${aiTutorEnabled}`,
    });

    revalidatePath(`/${locale}/admin/settings`);
    redirect(`/${locale}/admin/settings?saved=flags`);
  }

  // Server Action: Update Announcement
  async function handleUpdateAnnouncement(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminSession(locale);
    const announcementActive = formData.get("announcementActive") === "on";
    const announcementType = (formData.get("announcementType")?.toString() || "INFO") as AnnouncementType;
    const announcementTextAr = formData.get("announcementTextAr")?.toString() || "";
    const announcementTextEn = formData.get("announcementTextEn")?.toString() || "";
    const announcementLinkUrl = formData.get("announcementLinkUrl")?.toString() || "";

    await systemSettingsService.updateSettings(
      {
        announcementActive,
        announcementType,
        announcementTextAr,
        announcementTextEn,
        announcementLinkUrl,
      },
      currentAdmin.email
    );

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "SECURITY",
      action: "UPDATE_ANNOUNCEMENT_BANNER",
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorRole: currentAdmin.role,
      targetEntityId: "ANNOUNCEMENT_BANNER",
      targetEntityType: "SystemSettings",
      ipAddress: ip,
      diffSummary: `Announcement: active=${announcementActive}, type=${announcementType}, textAr="${announcementTextAr.slice(0, 30)}..."`,
    });

    revalidatePath(`/${locale}/admin/settings`);
    redirect(`/${locale}/admin/settings?saved=announcement`);
  }

  // Server Action: Update Maintenance Mode
  async function handleUpdateMaintenance(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminSession(locale);
    const maintenanceMode = formData.get("maintenanceMode") === "on";
    const maintenanceMessageAr = formData.get("maintenanceMessageAr")?.toString() || "";
    const maintenanceMessageEn = formData.get("maintenanceMessageEn")?.toString() || "";

    await systemSettingsService.updateSettings(
      {
        maintenanceMode,
        maintenanceMessageAr,
        maintenanceMessageEn,
      },
      currentAdmin.email
    );

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "SECURITY",
      action: "UPDATE_MAINTENANCE_MODE",
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorRole: currentAdmin.role,
      targetEntityId: "MAINTENANCE_MODE",
      targetEntityType: "SystemSettings",
      ipAddress: ip,
      diffSummary: `Maintenance: enabled=${maintenanceMode}`,
    });

    revalidatePath(`/${locale}/admin/settings`);
    redirect(`/${locale}/admin/settings?saved=maintenance`);
  }

  // Server Action: Update Profile & Security
  async function handleUpdateProfileAndSecurity(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminSession(locale);
    const supportEmail = formData.get("supportEmail")?.toString() || "support@arabickidsacademy.com";
    const supportWhatsApp = formData.get("supportWhatsApp")?.toString() || "+971501234567";
    const defaultCurrency = formData.get("defaultCurrency")?.toString() || "USD";
    const defaultTimezone = formData.get("defaultTimezone")?.toString() || "Asia/Riyadh";
    const sessionDurationDays = Number(formData.get("sessionDurationDays")) || 30;
    const maxLoginAttemptsPerIp = Number(formData.get("maxLoginAttemptsPerIp")) || 5;
    const maxLoginAttemptsPerEmail = Number(formData.get("maxLoginAttemptsPerEmail")) || 5;
    const lockoutWindowMinutes = Number(formData.get("lockoutWindowMinutes")) || 15;

    await systemSettingsService.updateSettings(
      {
        supportEmail,
        supportWhatsApp,
        defaultCurrency,
        defaultTimezone,
        sessionDurationDays,
        maxLoginAttemptsPerIp,
        maxLoginAttemptsPerEmail,
        lockoutWindowMinutes,
      },
      currentAdmin.email
    );

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "SECURITY",
      action: "UPDATE_PROFILE_AND_SECURITY",
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorRole: currentAdmin.role,
      targetEntityId: "PROFILE_SECURITY",
      targetEntityType: "SystemSettings",
      ipAddress: ip,
      diffSummary: `Profile & Security updated by ${currentAdmin.email}`,
    });

    revalidatePath(`/${locale}/admin/settings`);
    redirect(`/${locale}/admin/settings?saved=security`);
  }

  // Server Action: Flush Cache
  async function handleFlushCache() {
    "use server";
    const currentAdmin = await requireAdminSession(locale);
    systemSettingsService.flushCache();

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "SECURITY",
      action: "FLUSH_CACHE",
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorRole: currentAdmin.role,
      targetEntityId: "CACHE",
      targetEntityType: "SystemSettings",
      ipAddress: ip,
      diffSummary: `Cache and rate limits flushed by ${currentAdmin.email}`,
    });

    revalidatePath(`/${locale}/admin/settings`);
    redirect(`/${locale}/admin/settings?flushed=1`);
  }

  // Server Action: Reset Defaults
  async function handleResetDefaults() {
    "use server";
    const currentAdmin = await requireAdminSession(locale);
    await systemSettingsService.resetDefaults(currentAdmin.email);

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "SECURITY",
      action: "RESET_DEFAULTS",
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorRole: currentAdmin.role,
      targetEntityId: "ALL_SETTINGS",
      targetEntityType: "SystemSettings",
      ipAddress: ip,
      diffSummary: `Settings reset to platform defaults by ${currentAdmin.email}`,
    });


    revalidatePath(`/${locale}/admin/settings`);
    redirect(`/${locale}/admin/settings?reset=1`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              {isAr ? "لوحة الإدارة العامة" : "Admin Operations Center"}
            </Link>
            <span>/</span>
            <span>{isAr ? "إعدادات المنظومة والخصائص" : "System Settings & Governance"}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-brand-600" />
            <span>{isAr ? "مركز إعدادات المنظومة والسياسات العامة ⚙️" : "Platform Settings & Governance Center"}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? "التحكم الشامل في ميزات المنصة، وضع الصيانة، شريط الإعلانات العام، والسياسات الأمنية الحاكمة"
              : "Comprehensive superadmin controls for platform feature flags, maintenance lockdown, global announcements, and security policies."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={handleFlushCache}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm"
              title={isAr ? "تفريغ الذاكرة المؤقتة ومحددات المعدل" : "Flush Rate Limits & Caches"}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? "تفريغ الكاش" : "Flush Cache"}</span>
            </button>
          </form>

          <form action={handleResetDefaults}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors shadow-sm"
              title={isAr ? "استعادة الضبط الافتراضي" : "Reset Platform Defaults"}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? "الضبط الافتراضي" : "Reset Defaults"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Status Notifications */}
      {usingFallback && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm text-rose-900 flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>
            {isAr
              ? "تعذر الوصول لقاعدة البيانات — الإعدادات محفوظة مؤقتاً في الذاكرة فقط وقد تُفقد عند إعادة التشغيل."
              : "Database unreachable — settings are saved in memory only right now and may be lost on the next restart."}
          </span>
        </div>
      )}

      {saved && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>
            {isAr
              ? "تم حفظ وتطبيق التعديلات بنجاح في المنظومة."
              : "Settings successfully saved and applied platform-wide."}
          </span>
        </div>
      )}

      {flushed && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-900 flex items-center gap-2 shadow-sm">
          <Zap className="w-5 h-5 shrink-0 text-amber-600" />
          <span>
            {isAr
              ? "تم تفريغ الذاكرة المؤقتة، ومحددات المعدل، ومخازن الجلسات بنجاح."
              : "In-memory rate limiters, session caches, and transient stores have been flushed."}
          </span>
        </div>
      )}

      {reset && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3.5 text-sm text-blue-900 flex items-center gap-2 shadow-sm">
          <ShieldCheck className="w-5 h-5 shrink-0 text-blue-600" />
          <span>
            {isAr
              ? "تمت استعادة الإعدادات الافتراضية الرسمية للمنظومة بنجاح."
              : "Platform settings have been restored to system defaults."}
          </span>
        </div>
      )}

      {/* Grid: 4 Core Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Feature Flags */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>{isAr ? "1. مفاتيح الميزات التشغيلية (Feature Flags)" : "1. Operational Feature Flags"}</span>
            </h2>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {isAr ? "تحكم فوري" : "Live Toggle"}
            </span>
          </div>

          <form action={handleUpdateFlags} className="space-y-4 text-xs">
            {/* Flag: Registration */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  {isAr ? "فتح التسجيل الذاتي للحسابات الجديدة" : "Allow Self-Service User Registration"}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  {isAr
                    ? "السماح لأولياء الأمور والطلاب بإنشاء حسابات جديدة عبر صفحة التسجيل"
                    : "Permit new parents and students to register via the sign-up page"}
                </span>
              </div>
              <input
                type="checkbox"
                name="allowRegistration"
                defaultChecked={settings.allowRegistration}
                className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
            </label>

            {/* Flag: B2C Trial (1 Day) */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  {isAr ? "تفعيل التجربة المجانية للأفراد (1 يوم - طفل واحد)" : "Enable B2C Free Trial (1 Day, 1 Child)"}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  {isAr
                    ? "تمكين اشتراك التجربة ليوم واحد لاستعراض إمكانيات المنصة بدون دفع فوري"
                    : "Allow 1-day exploration trial with limited features to experience capabilities"}
                </span>
              </div>
              <input
                type="checkbox"
                name="allowB2cTrial"
                defaultChecked={settings.allowB2cTrial}
                className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
            </label>

            {/* Flag: B2B Trial (3 Days, 10 Kids) */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  {isAr ? "تفعيل التجربة المجانية للمؤسسات (3 أيام - حتى 10 أطفال)" : "Enable B2B Organization Trial (3 Days, 10 Kids)"}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  {isAr
                    ? "تمكين المدارس والمراكز من تجربة حزمة المؤسسات لمدة 3 أيام مع المميزات الأساسية"
                    : "Allow schools and centers to test B2B pilot for 3 days with essential cohort tools"}
                </span>
              </div>
              <input
                type="checkbox"
                name="allowB2bTrial"
                defaultChecked={settings.allowB2bTrial}
                className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
            </label>

            {/* Flag: AI Tutor Faseeh */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  {isAr ? "المعلم الذكي «فصيح» (AI Voice & Chat Tutor)" : "AI Conversational Tutor «Faseeh»"}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  {isAr
                    ? "تشغيل محرك الذكاء الاصطناعي للمحادثة والتشكيل الصوتي وتصحيح التلاوة"
                    : "Enable live conversational tutor, vocal feedback, and pronunciation evaluation"}
                </span>
              </div>
              <input
                type="checkbox"
                name="aiTutorEnabled"
                defaultChecked={settings.aiTutorEnabled}
                className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
            </label>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold bg-brand-600 text-white text-xs hover:bg-brand-700 transition-colors shadow-sm"
              >
                {isAr ? "حفظ مفاتيح الميزات التشغيلية" : "Save Feature Flags"}
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Global Announcement Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-600" />
              <span>{isAr ? "2. شريط الإعلانات العام (Announcement Banner)" : "2. Global Platform Announcement"}</span>
            </h2>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                settings.announcementActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {settings.announcementActive ? (isAr ? "معروض حالياً" : "Active") : (isAr ? "مخفي" : "Inactive")}
            </span>
          </div>

          <form action={handleUpdateAnnouncement} className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/50 border border-amber-200 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  {isAr ? "تفعيل عرض الشريط الإعلاني أعلى الموقع" : "Display Announcement Banner Across Platform"}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  {isAr ? "يظهر الشريط لجميع الزوار والمستخدمين المسجلين" : "Visible at the top of all public and dashboard pages"}
                </span>
              </div>
              <input
                type="checkbox"
                name="announcementActive"
                defaultChecked={settings.announcementActive}
                className="w-5 h-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
            </label>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isAr ? "نوع الإعلان والأهمية" : "Announcement Severity"}
              </label>
              <select
                name="announcementType"
                defaultValue={settings.announcementType}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value="INFO">{isAr ? "معلوماتي عادي (أزرق - INFO)" : "Informational (Blue)"}</option>
                <option value="SUCCESS">{isAr ? "إنجاز / ترحيب (أخضر - SUCCESS)" : "Success / Welcome (Green)"}</option>
                <option value="WARNING">{isAr ? "تنبيه هام (أصفر - WARNING)" : "Warning / Alert (Yellow)"}</option>
                <option value="URGENT">{isAr ? "عاجل / طوارئ (أحمر - URGENT)" : "Urgent / Emergency (Red)"}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isAr ? "نص الإعلان (بالعربية)" : "Announcement Text (Arabic)"}
              </label>
              <input
                type="text"
                name="announcementTextAr"
                defaultValue={settings.announcementTextAr}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isAr ? "نص الإعلان (بالإنجليزية)" : "Announcement Text (English)"}
              </label>
              <input
                type="text"
                name="announcementTextEn"
                defaultValue={settings.announcementTextEn}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isAr ? "رابط التوجيه (اختياري)" : "Action Link URL (Optional)"}
              </label>
              <input
                type="text"
                name="announcementLinkUrl"
                defaultValue={settings.announcementLinkUrl}
                placeholder="/pricing"
                className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold bg-amber-600 text-white text-xs hover:bg-amber-700 transition-colors shadow-sm"
              >
                {isAr ? "تحديث شريط الإعلانات" : "Update Announcement"}
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Maintenance Mode */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>{isAr ? "3. وضع الصيانة الشاملة (Maintenance Mode)" : "3. Platform Maintenance Lockdown"}</span>
            </h2>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                settings.maintenanceMode
                  ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {settings.maintenanceMode ? (isAr ? "المنظومة مغلقة" : "Locked Down") : (isAr ? "تعمل بالكامل" : "Online")}
            </span>
          </div>

          <form action={handleUpdateMaintenance} className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/60 border border-rose-200 cursor-pointer">
              <div>
                <span className="font-bold text-rose-900 block text-sm">
                  {isAr ? "تفعيل وضع الصيانة وإيقاف تسجيل الدخول للعامة" : "Activate Maintenance Mode"}
                </span>
                <span className="text-rose-700 block mt-0.5">
                  {isAr
                    ? "عند التفعيل، يُسمح للمدير العام فقط بالدخول، ويظهر تنبيه الصيانة للعملاء"
                    : "Locks down non-admin logins and routes users to the maintenance alert screen"}
                </span>
              </div>
              <input
                type="checkbox"
                name="maintenanceMode"
                defaultChecked={settings.maintenanceMode}
                className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
              />
            </label>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isAr ? "رسالة الصيانة (بالعربية)" : "Maintenance Notice (Arabic)"}
              </label>
              <textarea
                name="maintenanceMessageAr"
                defaultValue={settings.maintenanceMessageAr}
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isAr ? "رسالة الصيانة (بالإنجليزية)" : "Maintenance Notice (English)"}
              </label>
              <textarea
                name="maintenanceMessageEn"
                defaultValue={settings.maintenanceMessageEn}
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold bg-rose-600 text-white text-xs hover:bg-rose-700 transition-colors shadow-sm"
              >
                {isAr ? "حفظ وتطبيق حالة الصيانة" : "Apply Maintenance State"}
              </button>
            </div>
          </form>
        </div>

        {/* Section 4: Academy Profile & Security Thresholds */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? "4. الهوية والسياسات الأمنية (Identity & Security)" : "4. Academy Identity & Security Policies"}</span>
            </h2>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {isAr ? "محصن" : "Secured"}
            </span>
          </div>

          <form action={handleUpdateProfileAndSecurity} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAr ? "بريد الدعم الرسمي" : "Support Email"}</span>
                </label>
                <input
                  type="email"
                  name="supportEmail"
                  defaultValue={settings.supportEmail}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAr ? "واتساب الدعم الفني" : "Support WhatsApp"}</span>
                </label>
                <input
                  type="text"
                  name="supportWhatsApp"
                  defaultValue={settings.supportWhatsApp}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAr ? "العملة الافتراضية" : "Default Currency"}</span>
                </label>
                <select
                  name="defaultCurrency"
                  defaultValue={settings.defaultCurrency}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                >
                  <option value="USD">USD ($) - الدولار الأمريكي</option>
                  <option value="EUR">EUR (€) - اليورو</option>
                  <option value="GBP">GBP (£) - الجنيه الإسترليني</option>
                  <option value="SAR">SAR (ر.س) - الريال السعودي</option>
                  <option value="AED">AED (د.إ) - الدرهم الإماراتي</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isAr ? "المنطقة الزمنية الرسمية" : "Platform Timezone"}
                </label>
                <select
                  name="defaultTimezone"
                  defaultValue={settings.defaultTimezone}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 font-mono"
                >
                  <option value="Asia/Riyadh">Asia/Riyadh (UTC+3)</option>
                  <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                  <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isAr ? "مدة صلاحية الجلسة (أيام)" : "Session TTL (Days)"}
                </label>
                <input
                  type="number"
                  name="sessionDurationDays"
                  defaultValue={settings.sessionDurationDays}
                  min={1}
                  max={90}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isAr ? "أقصى محاولات لكل IP" : "Max Attempts / IP"}
                </label>
                <input
                  type="number"
                  name="maxLoginAttemptsPerIp"
                  defaultValue={settings.maxLoginAttemptsPerIp}
                  min={3}
                  max={50}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isAr ? "نافذة الحظر (دقائق)" : "Lockout (Mins)"}
                </label>
                <input
                  type="number"
                  name="lockoutWindowMinutes"
                  defaultValue={settings.lockoutWindowMinutes}
                  min={5}
                  max={120}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold bg-slate-900 text-white text-xs hover:bg-slate-800 transition-colors shadow-sm"
              >
                {isAr ? "حفظ إعدادات الهوية والسياسات الأمنية" : "Save Identity & Security Policies"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Metadata & Audit footer */}
      <div className="text-center text-slate-400 text-xs py-2">
        {isAr
          ? `آخر تحديث للإعدادات: ${new Date(settings.lastUpdatedAt).toLocaleString("ar-EG")} بواسطة ${settings.lastUpdatedBy}`
          : `Settings last updated: ${new Date(settings.lastUpdatedAt).toLocaleString("en-US")} by ${settings.lastUpdatedBy}`}
      </div>
    </div>
  );
}
