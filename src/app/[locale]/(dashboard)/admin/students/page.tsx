import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { administrationService } from "@/server/services/AdministrationService";
import { UserStatus, AgeGroup } from "@prisma/client";
import { requireAdminHubAccess } from "@/lib/auth/currentUser";
import { ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { StudentManagementClient } from "@/components/admin/StudentManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  await requireAdminHubAccess(locale, "students");

  const students = await administrationService.getAllStudents();

  // Server Action: Reset Student Password
  async function handleResetStudentPasswordAction(params: {
    studentId: string;
    customPassword?: string;
  }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "students");
    const result = await administrationService.resetStudentPassword(
      params.studentId,
      params.customPassword,
      currentAdmin
    );

    revalidatePath(`/${locale}/admin/students`);
    revalidatePath(`/${locale}/admin/audit-logs`);
    return result;
  }

  // Server Action: Update Student Profile
  async function handleUpdateStudentAction(params: {
    studentId: string;
    data: {
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
      ageGroup?: AgeGroup;
      notesInternal?: string;
    };
  }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "students");
    const updated = await administrationService.updateStudent(
      params.studentId,
      {
        firstName: params.data.firstName,
        lastName: params.data.lastName,
        dateOfBirth: params.data.dateOfBirth ? new Date(params.data.dateOfBirth) : undefined,
        ageGroup: params.data.ageGroup,
        notesInternal: params.data.notesInternal,
      },
      currentAdmin
    );

    revalidatePath(`/${locale}/admin/students`);
    revalidatePath(`/${locale}/admin/audit-logs`);
    return updated;
  }

  // Server Action: Toggle Active / Suspended
  async function handleToggleStatusAction(params: {
    studentId: string;
    currentStatus: UserStatus;
    reason?: string;
  }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "students");
    const newStatus =
      params.currentStatus === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;

    await administrationService.setStudentStatus(
      params.studentId,
      newStatus,
      params.reason || "إجراء إداري دوري من لوحة الحوكمة",
      currentAdmin
    );

    revalidatePath(`/${locale}/admin/students`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

  // Server Action: Archive Student
  async function handleArchiveStudentAction(params: { studentId: string; reason?: string }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "students");
    await administrationService.archiveStudent(
      params.studentId,
      params.reason || "أرشفة الحساب بقرار إداري",
      currentAdmin
    );

    revalidatePath(`/${locale}/admin/students`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

  // Server Action: Add Student
  async function handleAddStudentAction(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "students");
    const firstName = formData.get("firstName")?.toString().trim();
    const lastName = formData.get("lastName")?.toString().trim();
    const birthDateStr = formData.get("dateOfBirth")?.toString() || "2017-01-01";
    const ageGroupStr = (formData.get("ageGroup")?.toString() || "AGE_7_10") as AgeGroup;
    const guardianName = formData.get("guardianName")?.toString().trim() || "ولي الأمر";
    const guardianPhone = formData.get("guardianPhone")?.toString().trim() || "+31 6856 630 10";
    const notesInternal = formData.get("notesInternal")?.toString().trim();

    if (!firstName || !lastName) return;

    await administrationService.addStudent(
      {
        firstName,
        lastName,
        dateOfBirth: new Date(birthDateStr),
        ageGroup: ageGroupStr,
        guardianName,
        guardianPhone,
        notesInternal,
      },
      currentAdmin
    );

    revalidatePath(`/${locale}/admin/students`);
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
            <span>{isAr ? "شؤون الطلاب وحماية الطفل" : "Students & Child Protection"}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isAr ? "سجل الطلاب والحوكمة الأكاديمية 🎒" : "Students Directory & Governance 🎒"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? "إدارة حسابات الطلاب، إعادة تعيين كلمات المرور، تفعيل وتعليق الحسابات، وضوابط الامتثال (COPPA & GDPR-K)"
              : "Manage student accounts, reset credentials, toggle active status, and maintain COPPA/GDPR compliance"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? "معايير أمان وخصوصية الطفل مفعلة 100%" : "Child Privacy & COPPA Enforced"}</span>
          </div>
        </div>
      </div>

      {/* Interactive Client Hub with Search, Multi-Filter, CSV Export & Modals */}
      <StudentManagementClient
        initialStudents={students}
        locale={locale}
        onResetPassword={handleResetStudentPasswordAction}
        onUpdateStudent={handleUpdateStudentAction}
        onToggleStatus={handleToggleStatusAction}
        onArchiveStudent={handleArchiveStudentAction}
        onAddStudent={handleAddStudentAction}
      />
    </div>
  );
}
