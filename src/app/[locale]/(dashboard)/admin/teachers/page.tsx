import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { administrationService } from "@/server/services/AdministrationService";
import { requireAdminHubAccess } from "@/lib/auth/currentUser";
import { EmploymentType } from "@prisma/client";
import { Award, BadgeCheck, DollarSign, Users } from "lucide-react";
import { TeacherManagementClient } from "@/components/admin/TeacherManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminTeachersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  await requireAdminHubAccess(locale, "teachers");

  const teachers = await administrationService.getAllTeachers();
  const certifiedCount = teachers.filter((t) => t.isCertified).length;
  const certifiedPercentage =
    teachers.length > 0 ? Math.round((certifiedCount / teachers.length) * 100) : 0;

  // Server Action: Reset Teacher Password
  async function handleResetTeacherPasswordAction(params: {
    teacherId: string;
    customPassword?: string;
  }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "teachers");
    const result = await administrationService.resetTeacherPassword(
      params.teacherId,
      params.customPassword,
      currentAdmin
    );

    revalidatePath(`/${locale}/admin/teachers`);
    revalidatePath(`/${locale}/admin/audit-logs`);
    return result;
  }

  // Server Action: Update Teacher Full Profile
  async function handleUpdateTeacherAction(params: {
    teacherId: string;
    data: {
      firstName: string;
      lastName: string;
      qualifications: string;
      experienceYears: number;
      hourlyRateMinorUnits: number;
      employmentType: EmploymentType;
      isCertified: boolean;
      isActive: boolean;
    };
  }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "teachers");
    const updated = await administrationService.updateTeacherFull(
      params.teacherId,
      params.data,
      currentAdmin
    );

    revalidatePath(`/${locale}/admin/teachers`);
    revalidatePath(`/${locale}/admin/audit-logs`);
    return updated;
  }

  // Server Action: Toggle Active Status
  async function handleToggleActiveAction(params: {
    teacherId: string;
    currentActive: boolean;
  }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "teachers");
    await administrationService.toggleTeacherStatus(
      params.teacherId,
      !params.currentActive,
      currentAdmin
    );

    revalidatePath(`/${locale}/admin/teachers`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

  // Server Action: Archive Teacher
  async function handleArchiveTeacherAction(params: { teacherId: string }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "teachers");
    await administrationService.archiveTeacher(params.teacherId, currentAdmin);

    revalidatePath(`/${locale}/admin/teachers`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

  // Server Action: Add Teacher
  async function handleAddTeacherAction(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "teachers");
    const firstName = formData.get("firstName")?.toString().trim();
    const lastName = formData.get("lastName")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const qualifications =
      formData.get("qualifications")?.toString().trim() ||
      "إجازة في القرآن الكريم واللغة العربية";
    const experienceYears = parseInt(formData.get("experienceYears")?.toString() || "5", 10);
    const rateDollars = parseFloat(formData.get("rateDollars")?.toString() || "30");
    const employmentType = (formData.get("employmentType")?.toString() ||
      "CONTRACT") as EmploymentType;
    const isCertified = formData.get("isCertified")?.toString() === "true";

    if (!firstName || !lastName || !email) return;

    await administrationService.addTeacher(
      {
        email,
        firstName,
        lastName,
        qualifications,
        experienceYears,
        hourlyRateMinorUnits: Math.round(rateDollars * 100),
        employmentType,
        isCertified,
      },
      currentAdmin
    );

    revalidatePath(`/${locale}/admin/teachers`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              {isAr ? "لوحة الإدارة العامة" : "Superadmin Console"}
            </Link>
            <span>/</span>
            <span>{isAr ? "الكادر التعليمي وهيئة التدريس" : "Teaching Staff & Faculty"}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isAr ? "إدارة المعلمين والاعتماد الأكاديمي 👨‍🏫" : "Faculty & Teacher Accreditation 👨‍🏫"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? "متابعة ساعات التدريس، شارات الاعتماد الأكاديمي، تسعير أجر الساعة، وإعادة تعيين بيانات الدخول"
              : "Manage faculty profiles, accreditation badges, hourly payroll rates, and credentials"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-2 shadow-xs">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>{teachers.length} {isAr ? "معلماً في الكادر" : "Teachers on Staff"}</span>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 shadow-xs">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
            <span>{certifiedPercentage}% {isAr ? "معتمدون دولياً" : "Certified Faculty"}</span>
          </div>
        </div>
      </div>

      {/* Interactive Teacher Management Client */}
      <TeacherManagementClient
        initialTeachers={teachers}
        locale={locale}
        onResetPassword={handleResetTeacherPasswordAction}
        onUpdateTeacher={handleUpdateTeacherAction}
        onToggleActive={handleToggleActiveAction}
        onArchiveTeacher={handleArchiveTeacherAction}
        onAddTeacher={handleAddTeacherAction}
      />
    </div>
  );
}
