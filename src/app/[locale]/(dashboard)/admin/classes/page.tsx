import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { academicService } from "@/server/services/AcademicService";
import { schoolService } from "@/server/services/SchoolService";
import { userRepository } from "@/server/repositories/UserRepository";
import { administrationService } from "@/server/services/AdministrationService";
import { ClassType } from "@prisma/client";
import { requireAdminSession } from "@/lib/auth/currentUser";
import {
  Users,
  PlusCircle,
  Calendar,
  Building2,
  Edit,
  Trash2,
  GraduationCap,
  UserPlus,
  UserMinus,
  CheckCircle2,
} from "lucide-react";

export default async function AdminClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const isAr = locale === "ar";

  const classGroups = await academicRepository.getAllClassGroups();
  const allLevels = await academicRepository.getAllLevels();
  const allSchools = await schoolService.getAllSchools();
  const schoolsById = Object.fromEntries(allSchools.map((s) => [s.id, s]));

  const allTeachers = await userRepository.getAllTeachers();
  const allStudents = await administrationService.getAllStudents();
  const studentsById = Object.fromEntries(allStudents.map((s) => [s.id, s]));

  const classEnrollmentCounts: Record<string, number> = {};
  const teacherByClassGroupId: Record<string, { id: string; name: string } | null> = {};
  const enrollmentsByClassGroupId: Record<
    string,
    { id: string; studentId: string; studentName: string }[]
  > = {};

  for (const cg of classGroups) {
    const assignments = await academicRepository.getTeacherAssignmentsByClassGroupId(cg.id);
    if (assignments.length > 0) {
      const t = allTeachers.find((tch) => tch.id === assignments[0].teacherId);
      teacherByClassGroupId[cg.id] = t
        ? { id: t.id, name: `${t.firstName} ${t.lastName}` }
        : { id: assignments[0].teacherId, name: "معلم معتمد" };
    } else {
      teacherByClassGroupId[cg.id] = null;
    }

    const enrs = await academicRepository.getEnrollmentsByClassGroupId(cg.id);
    classEnrollmentCounts[cg.id] = enrs.length;
    enrollmentsByClassGroupId[cg.id] = enrs.map((enr) => {
      const st = studentsById[enr.studentId];
      return {
        id: enr.id,
        studentId: enr.studentId,
        studentName: st ? `${st.firstName} ${st.lastName}` : enr.studentId,
      };
    });
  }

  // Action: Create Class Group
  async function handleCreateClass(formData: FormData) {
    "use server";
    await requireAdminSession(locale);
    const name = formData.get("name")?.toString() || "";
    const courseLevelId = formData.get("courseLevelId")?.toString() || "level-a1-reading";
    const classType = (formData.get("classType")?.toString() || "GROUP") as ClassType;
    const capacityStr = formData.get("capacityMax")?.toString() || "6";
    const schoolId = formData.get("schoolId")?.toString() || "";
    const teacherId = formData.get("teacherId")?.toString() || "";

    if (!name) return;

    const newClass = await academicService.createClassGroup({
      name,
      courseLevelId,
      classType,
      capacityMax: parseInt(capacityStr, 10),
      schoolId: schoolId || null,
    });

    if (teacherId) {
      await academicRepository.assignTeacherToClass(teacherId, newClass.id);
    }

    revalidatePath(`/${locale}/admin/classes`);
    revalidatePath(`/${locale}/admin/schools`);
    revalidatePath(`/${locale}/school-admin`);
    revalidatePath(`/${locale}/parent/enroll`);
  }

  // Action: Assign / Change Teacher
  async function handleAssignTeacher(formData: FormData) {
    "use server";
    await requireAdminSession(locale);
    const classGroupId = formData.get("classGroupId")?.toString();
    const teacherId = formData.get("teacherId")?.toString();
    if (!classGroupId || !teacherId) return;

    await academicRepository.assignTeacherToClass(teacherId, classGroupId);

    revalidatePath(`/${locale}/admin/classes`);
    revalidatePath(`/${locale}/admin/schedule`);
    revalidatePath(`/${locale}/teacher`);
  }

  // Action: Enroll Student in Class
  async function handleEnrollStudent(formData: FormData) {
    "use server";
    await requireAdminSession(locale);
    const classGroupId = formData.get("classGroupId")?.toString();
    const studentId = formData.get("studentId")?.toString();
    if (!classGroupId || !studentId) return;

    await academicRepository.enrollStudentInClass(studentId, classGroupId);

    revalidatePath(`/${locale}/admin/classes`);
    revalidatePath(`/${locale}/admin/students`);
    revalidatePath(`/${locale}/student`);
  }

  // Action: Unenroll Student from Class
  async function handleUnenrollStudent(formData: FormData) {
    "use server";
    await requireAdminSession(locale);
    const classGroupId = formData.get("classGroupId")?.toString();
    const studentId = formData.get("studentId")?.toString();
    if (!classGroupId || !studentId) return;

    await academicRepository.unenrollStudent(studentId, classGroupId);

    revalidatePath(`/${locale}/admin/classes`);
    revalidatePath(`/${locale}/admin/students`);
    revalidatePath(`/${locale}/student`);
  }

  // Action: Update Class
  async function handleUpdateClass(formData: FormData) {
    "use server";
    await requireAdminSession(locale);
    const classId = formData.get("classId")?.toString();
    const name = formData.get("name")?.toString().trim();
    const capacityStr = formData.get("capacityMax")?.toString();

    if (!classId) return;

    await academicService.updateClassGroup(classId, {
      name: name || undefined,
      capacityMax: capacityStr ? parseInt(capacityStr, 10) : undefined,
    });

    revalidatePath(`/${locale}/admin/classes`);
    revalidatePath(`/${locale}/school-admin`);
    revalidatePath(`/${locale}/parent/enroll`);
  }

  // Action: Delete Class
  async function handleDeleteClass(formData: FormData) {
    "use server";
    await requireAdminSession(locale);
    const classId = formData.get("classId")?.toString();
    if (!classId) return;

    await academicService.deleteClassGroup(classId);

    revalidatePath(`/${locale}/admin/classes`);
    revalidatePath(`/${locale}/school-admin`);
    revalidatePath(`/${locale}/parent/enroll`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              {isAr ? "لوحة الإدارة" : "Admin Operations Center"}
            </Link>
            <span>/</span>
            <span>{isAr ? "الفصول الدراسية" : "Class Groups"}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isAr ? "إدارة الفصول والمجموعات الدراسية 🏫" : "Classroom Management & Micro-Cohorts"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? "إدارة سعة الفصول الصغيرة (حد أقصى 6 طلاب)، تعيين المعلمين المعتمدين، وإدارة تسجيل الطلاب"
              : "Monitor small-group capacity (max 6 kids), assign certified teachers, and manage student rosters"}
          </p>
        </div>

        <Link
          href={`/${locale}/admin/schedule`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
        >
          <Calendar className="w-4 h-4" />
          <span>{isAr ? "جدول الحصص الأسبوعي الموحد" : "Master Schedule"}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Class Groups List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            <span>
              {isAr ? `الفصول القائمة (${classGroups.length})` : `Active Classes (${classGroups.length})`}
            </span>
          </h2>

          <div className="space-y-6">
            {classGroups.map((cg) => {
              const currentCount = classEnrollmentCounts[cg.id] || 0;
              const percentage = Math.round((currentCount / cg.capacityMax) * 100);
              const assignedTeacher = teacherByClassGroupId[cg.id];
              const enrolledStudents = enrollmentsByClassGroupId[cg.id] || [];

              return (
                <div
                  key={cg.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold text-[11px]">
                          {cg.classType === "GROUP"
                            ? isAr ? "فصل جماعي مصغر" : "Small Group"
                            : isAr ? "درس خاص 1 على 1" : "Private 1-on-1"}
                        </span>
                        {cg.schoolId && schoolsById[cg.schoolId] && (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] inline-flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {schoolsById[cg.schoolId].nameAr}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">ID: {cg.id}</span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{cg.name}</h3>

                      {/* Teacher Assignment Badge & Dropdown */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-600 flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 text-purple-600" />
                          <span>{isAr ? "المعلم المسؤول:" : "Teacher:"}</span>
                        </span>
                        {assignedTeacher ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                            أ/ {assignedTeacher.name}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                            {isAr ? "لم يُعين معلم بعد" : "No teacher assigned"}
                          </span>
                        )}

                        {/* Assign Teacher Dropdown */}
                        <details className="text-xs group inline-block">
                          <summary className="cursor-pointer text-brand-600 hover:underline font-bold select-none">
                            [{isAr ? "تعيين/تغيير" : "Assign/Change"}]
                          </summary>
                          <form
                            action={handleAssignTeacher}
                            className="p-3 bg-slate-50 rounded-xl space-y-2 mt-2 border border-slate-200 shadow-sm min-w-48 z-10"
                          >
                            <input type="hidden" name="classGroupId" value={cg.id} />
                            <label className="block text-[10px] font-bold text-slate-600">
                              {isAr ? "اختر المعلم المعتمد:" : "Select Teacher:"}
                            </label>
                            <select
                              name="teacherId"
                              defaultValue={assignedTeacher?.id || ""}
                              className="w-full p-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                            >
                              <option value="">-- {isAr ? "اختر معلماً" : "Choose teacher"} --</option>
                              {allTeachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.firstName} {t.lastName} ({t.user.email})
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="w-full py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px]"
                            >
                              {isAr ? "تأكيد تعيين المعلم" : "Confirm"}
                            </button>
                          </form>
                        </details>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <Link
                        href={`/${locale}/classroom/${cg.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors shadow-2xs"
                      >
                        {isAr ? "دخول الفصل المباشر 🔴" : "Enter Live Classroom"}
                      </Link>

                      {/* Edit Class Capacity */}
                      <details className="text-xs group">
                        <summary className="cursor-pointer text-slate-500 hover:text-brand-600 font-bold flex items-center gap-1 select-none">
                          <Edit className="w-3.5 h-3.5" />
                          <span>{isAr ? "تعديل الفصل" : "Edit Class"}</span>
                        </summary>

                        <form
                          action={handleUpdateClass}
                          className="p-3 bg-slate-50 rounded-xl space-y-2 mt-2 border border-slate-100 min-w-48"
                        >
                          <input type="hidden" name="classId" value={cg.id} />
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                              {isAr ? "اسم الفصل" : "Name"}
                            </label>
                            <input
                              name="name"
                              defaultValue={cg.name}
                              className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                              {isAr ? "السعة القصوى" : "Capacity"}
                            </label>
                            <input
                              name="capacityMax"
                              type="number"
                              min={1}
                              max={10}
                              defaultValue={cg.capacityMax}
                              className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                          >
                            {isAr ? "حفظ التعديل" : "Save"}
                          </button>
                        </form>
                      </details>

                      <form action={handleDeleteClass}>
                        <input type="hidden" name="classId" value={cg.id} />
                        <button
                          type="submit"
                          className="text-slate-400 hover:text-rose-600 rounded-xl transition-colors flex items-center gap-1 text-[11px] font-bold"
                          title={isAr ? "حذف الفصل الدراسي" : "Delete"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isAr ? "حذف الفصل" : "Delete"}</span>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span>{isAr ? "إشغال المقاعد:" : "Seat Capacity:"}</span>
                      <span>
                        {currentCount} {isAr ? `من ${cg.capacityMax} طلاب` : `of ${cg.capacityMax} students`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percentage >= 100 ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Enrolled Students Roster with Unenroll & Enroll */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-brand-600" />
                        <span>{isAr ? "قائمة الطلاب المقيدين في هذا الفصل:" : "Enrolled Students:"}</span>
                      </span>

                      {/* Quick Enroll Student Form */}
                      <details className="text-xs group">
                        <summary className="cursor-pointer text-brand-600 font-bold flex items-center gap-1 select-none">
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{isAr ? "+ تسجيل طالب في الفصل" : "+ Enroll Student"}</span>
                        </summary>
                        <form
                          action={handleEnrollStudent}
                          className="p-3 bg-slate-50 rounded-xl space-y-2 mt-2 border border-slate-200 shadow-sm min-w-56"
                        >
                          <input type="hidden" name="classGroupId" value={cg.id} />
                          <label className="block text-[10px] font-bold text-slate-600">
                            {isAr ? "اختر طالباً لإضافته للفصل:" : "Select student:"}
                          </label>
                          <select
                            name="studentId"
                            className="w-full p-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                            required
                          >
                            <option value="">-- {isAr ? "اختر طالباً" : "Choose student"} --</option>
                            {allStudents.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.firstName} {st.lastName} ({st.ageGroup})
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="w-full py-1.5 rounded-lg gradient-brand text-white font-bold text-xs"
                          >
                            {isAr ? "تأكيد تسجيل الطالب" : "Enroll"}
                          </button>
                        </form>
                      </details>
                    </div>

                    {enrolledStudents.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-1">
                        {isAr ? "لا يوجد طلاب مقيدون في هذا الفصل حالياً." : "No students enrolled yet."}
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {enrolledStudents.map((enr) => (
                          <div
                            key={enr.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                          >
                            <span className="font-bold">{enr.studentName}</span>
                            <form action={handleUnenrollStudent} className="inline">
                              <input type="hidden" name="classGroupId" value={cg.id} />
                              <input type="hidden" name="studentId" value={enr.studentId} />
                              <button
                                type="submit"
                                className="text-slate-400 hover:text-rose-600 transition-colors"
                                title={isAr ? "إلغاء قيد الطالب من هذا الفصل" : "Unenroll"}
                              >
                                <UserMinus className="w-3 h-3" />
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Create New Class Group */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-purple-600" />
              <span>{isAr ? "إنشاء فصل دراسي جديد" : "Create New Class Group"}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? "تحديد المنهج ونوع الفصل والسعة القصوى وتعيين المعلم المعتمد"
                : "Configure track, class type, maximum capacity, and assign teacher"}
            </p>
          </div>

          <form action={handleCreateClass} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "اسم الفصل الدراسي" : "Class Group Name"}
              </label>
              <input
                name="name"
                required
                placeholder="مثال: فوج القراءة - المستوى التمهيدي (أ)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "المستوى والمنهج الدراسي" : "Course Level"}
              </label>
              <select
                name="courseLevelId"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {allLevels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.titleAr} ({lvl.levelCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "نوع الفصل" : "Class Type"}
              </label>
              <select
                name="classType"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="GROUP">{isAr ? "فصل جماعي مصغر (Micro-Cohort - بحد أقصى 6 طلاب)" : "Small Group Cohort (Max 6)"}</option>
                <option value="PRIVATE_1_ON_1">{isAr ? "درس فردي خاص (1 على 1)" : "Private 1-on-1"}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "المعلم المعتمد المسؤول" : "Assigned Teacher"}
              </label>
              <select
                name="teacherId"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">-- {isAr ? "اختر معلماً معتمداً لاحقاً" : "Assign later"} --</option>
                {allTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    أ/ {t.firstName} {t.lastName} ({t.user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "السعة القصوى للطلاب" : "Maximum Capacity"}
              </label>
              <input
                name="capacityMax"
                type="number"
                min={1}
                max={10}
                defaultValue={6}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "المؤسسة أو المدرسة الشريكة (اختياري)" : "Partner School (Optional)"}
              </label>
              <select
                name="schoolId"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">{isAr ? "فصل عام للأكاديمية (غير مخصص لمؤسسة)" : "General Academy Class"}</option>
                {allSchools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameAr} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              {isAr ? "إنشاء الفصل وتفعيله" : "Create & Activate Class"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
