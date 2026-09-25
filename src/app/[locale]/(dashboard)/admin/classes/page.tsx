import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { academicService } from "@/server/services/AcademicService";
import { schoolService } from "@/server/services/SchoolService";
import { userRepository } from "@/server/repositories/UserRepository";
import { administrationService } from "@/server/services/AdministrationService";
import { ClassType } from "@prisma/client";
import { requireAdminHubAccess } from "@/lib/auth/currentUser";
import { Users, GraduationCap, Building2 } from "lucide-react";
import {
  ClassManagementClient,
  ClassGroupDisplayItem,
} from "@/components/admin/ClassManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdminHubAccess(locale, "classes");
  const isAr = locale === "ar";

  const classGroups = await academicRepository.getAllClassGroups();
  const allLevels = await academicRepository.getAllLevels();
  const allSchools = await schoolService.getAllSchools();
  const schoolsById = Object.fromEntries(allSchools.map((s) => [s.id, s]));

  const allTeachers = await userRepository.getAllTeachers();
  const allStudents = await administrationService.getAllStudents();
  const studentsById = Object.fromEntries(allStudents.map((s) => [s.id, s]));

  const displayClasses: ClassGroupDisplayItem[] = [];

  for (const cg of classGroups) {
    const assignments = await academicRepository.getTeacherAssignmentsByClassGroupId(cg.id);
    let teacherId: string | null = null;
    let teacherName: string | null = null;

    if (assignments.length > 0) {
      teacherId = assignments[0].teacherId;
      const t = allTeachers.find((tch) => tch.id === teacherId);
      teacherName = t ? `${t.firstName} ${t.lastName}` : "معلم معتمد";
    }

    const enrs = await academicRepository.getEnrollmentsByClassGroupId(cg.id);
    const enrolledStudents = enrs.map((enr) => {
      const st = studentsById[enr.studentId];
      return {
        id: enr.id,
        studentId: enr.studentId,
        studentName: st ? `${st.firstName} ${st.lastName}` : enr.studentId,
      };
    });

    const school = cg.schoolId ? schoolsById[cg.schoolId] : null;

    displayClasses.push({
      id: cg.id,
      name: cg.name,
      courseLevelId: cg.courseLevelId,
      classType: cg.classType,
      capacityMax: cg.capacityMax,
      schoolId: cg.schoolId ?? null,
      schoolName: school ? school.nameAr : null,
      teacherId,
      teacherName,
      enrollmentsCount: enrs.length,
      enrolledStudents,
    });
  }

  // Server Action: Create Class
  async function handleCreateClassAction(params: {
    name: string;
    courseLevelId: string;
    classType: ClassType;
    capacityMax: number;
    schoolId?: string | null;
  }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "classes");
    const created = await academicService.createClassGroup(params);

    await administrationService.recordAuditLog({
      category: "ACADEMIC",
      action: "CLASS_CREATED",
      actor: currentAdmin,
      targetEntityId: created.id,
      targetEntityType: "ClassGroup",
      diffSummary: `إنشاء فوج دراسي جديد [${params.name}] بسعة ${params.capacityMax}`,
    });

    revalidatePath(`/${locale}/admin/classes`);
    revalidatePath(`/${locale}/admin/schools`);
    return created;
  }

  // Server Action: Update Class
  async function handleUpdateClassAction(params: {
    classGroupId: string;
    data: {
      name: string;
      courseLevelId: string;
      classType: ClassType;
      capacityMax: number;
      schoolId?: string | null;
    };
  }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "classes");
    const updated = await academicService.updateClassGroup(params.classGroupId, params.data);

    await administrationService.recordAuditLog({
      category: "ACADEMIC",
      action: "CLASS_UPDATED",
      actor: currentAdmin,
      targetEntityId: params.classGroupId,
      targetEntityType: "ClassGroup",
      diffSummary: `تعديل بيانات الفوج [${params.data.name}]: سعة ${params.data.capacityMax}، مستوى ${params.data.courseLevelId}`,
    });

    revalidatePath(`/${locale}/admin/classes`);
    return updated;
  }

  // Server Action: Delete Class
  async function handleDeleteClassAction(params: { classGroupId: string }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "classes");
    const success = await academicService.deleteClassGroup(params.classGroupId);

    await administrationService.recordAuditLog({
      category: "ACADEMIC",
      action: "CLASS_DELETED",
      actor: currentAdmin,
      targetEntityId: params.classGroupId,
      targetEntityType: "ClassGroup",
      diffSummary: `حذف الفوج الدراسي [${params.classGroupId}]`,
    });

    revalidatePath(`/${locale}/admin/classes`);
    return success;
  }

  // Server Action: Assign Teacher
  async function handleAssignTeacherAction(params: {
    classGroupId: string;
    teacherId: string;
  }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "classes");
    const assignment = await academicService.assignTeacherToClass(
      params.teacherId,
      params.classGroupId
    );

    await administrationService.recordAuditLog({
      category: "ACADEMIC",
      action: "TEACHER_ASSIGNED_TO_CLASS",
      actor: currentAdmin,
      targetEntityId: params.classGroupId,
      targetEntityType: "ClassGroup",
      diffSummary: `تعيين المعلم [${params.teacherId}] للفصل [${params.classGroupId}]`,
    });

    revalidatePath(`/${locale}/admin/classes`);
    return assignment;
  }

  // Server Action: Enroll Student
  async function handleEnrollStudentAction(params: {
    classGroupId: string;
    studentId: string;
  }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "classes");
    const enrollment = await academicService.enrollStudent(
      params.studentId,
      params.classGroupId
    );

    await administrationService.recordAuditLog({
      category: "ACADEMIC",
      action: "STUDENT_ENROLLED_CLASS",
      actor: currentAdmin,
      targetEntityId: params.classGroupId,
      targetEntityType: "ClassGroup",
      diffSummary: `تسجيل الطالب [${params.studentId}] في الفصل [${params.classGroupId}]`,
    });

    revalidatePath(`/${locale}/admin/classes`);
    return enrollment;
  }

  // Server Action: Unenroll Student
  async function handleUnenrollStudentAction(params: {
    classGroupId: string;
    studentId: string;
  }) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "classes");
    const success = await academicService.unenrollStudent(
      params.studentId,
      params.classGroupId
    );

    await administrationService.recordAuditLog({
      category: "ACADEMIC",
      action: "STUDENT_UNENROLLED_CLASS",
      actor: currentAdmin,
      targetEntityId: params.classGroupId,
      targetEntityType: "ClassGroup",
      diffSummary: `إلغاء تسجيل الطالب [${params.studentId}] من الفصل [${params.classGroupId}]`,
    });

    revalidatePath(`/${locale}/admin/classes`);
    return success;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              {isAr ? "لوحة الإدارة العامة" : "Superadmin Console"}
            </Link>
            <span>/</span>
            <span>{isAr ? "الحوكمة الأكاديمية والفصول" : "Academic Cohorts & Classes"}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isAr ? "إدارة الفصول والمجموعات التعليمية 📚" : "Class Groups & Cohort Governance 📚"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? "متابعة السعات، تعيين الكوادر التعليمية، إدارة قوائم الطلاب، والدخول المباشر كغرفة مراقبة"
              : "Manage class cohorts, faculty assignments, student rosters, and live observer access"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-brand-50 text-brand-800 border border-brand-200 text-xs font-bold flex items-center gap-2 shadow-xs">
            <Users className="w-4 h-4 text-brand-600" />
            <span>{displayClasses.length} {isAr ? "فوجاً دراسياً نشطاً" : "Active Cohorts"}</span>
          </div>
        </div>
      </div>

      {/* Interactive Class Management Hub */}
      <ClassManagementClient
        initialClasses={displayClasses}
        allTeachers={allTeachers.map((t) => ({ id: t.id, name: `${t.firstName} ${t.lastName}` }))}
        allSchools={allSchools.map((s) => ({ id: s.id, name: s.nameAr }))}
        allLevels={allLevels.map((l) => ({ id: l.id, title: l.titleAr }))}
        allStudents={allStudents.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}` }))}
        locale={locale}
        onCreateClass={handleCreateClassAction}
        onUpdateClass={handleUpdateClassAction}
        onDeleteClass={handleDeleteClassAction}
        onAssignTeacher={handleAssignTeacherAction}
        onEnrollStudent={handleEnrollStudentAction}
        onUnenrollStudent={handleUnenrollStudentAction}
      />
    </div>
  );
}
