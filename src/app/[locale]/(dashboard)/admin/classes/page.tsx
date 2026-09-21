import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { academicService } from "@/server/services/AcademicService";
import { schoolService } from "@/server/services/SchoolService";
import { ClassType } from "@prisma/client";
import { requireAdminSession } from "@/lib/auth/currentUser";
import {
  Users,
  PlusCircle,
  Calendar,
  Building2,
  Edit,
  Trash2,
} from "lucide-react";

export default async function AdminClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const classGroups = await academicRepository.getAllClassGroups();
  const allLevels = await academicRepository.getAllLevels();
  const allCourses = await academicRepository.getAllCourses();
  const allSchools = await schoolService.getAllSchools();
  const schoolsById = Object.fromEntries(allSchools.map((s) => [s.id, s]));

  const classEnrollmentCounts: Record<string, number> = {};
  for (const cg of classGroups) {
    const enrs = await academicRepository.getEnrollmentsByClassGroupId(cg.id);
    classEnrollmentCounts[cg.id] = enrs.length;
  }

  async function handleCreateClass(formData: FormData) {
    "use server";
    await requireAdminSession(locale);
    const name = formData.get("name")?.toString() || "";
    const courseLevelId = formData.get("courseLevelId")?.toString() || "level-a1-reading";
    const classType = (formData.get("classType")?.toString() || "GROUP") as ClassType;
    const capacityStr = formData.get("capacityMax")?.toString() || "6";
    const schoolId = formData.get("schoolId")?.toString() || "";

    if (!name) return;

    await academicService.createClassGroup({
      name,
      courseLevelId,
      classType,
      capacityMax: parseInt(capacityStr, 10),
      schoolId: schoolId || null,
    });

    revalidatePath(`/${locale}/admin/classes`);
    revalidatePath(`/${locale}/admin/schools`);
    revalidatePath(`/${locale}/school-admin`);
    revalidatePath(`/${locale}/parent/enroll`);
  }

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
              لوحة الإدارة
            </Link>
            <span>/</span>
            <span>الفصول الدراسية</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            إدارة الفصول والمجموعات الدراسية 🏫
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            مراقبة سعة الفصول الصغيرة (حد أقصى 6 طلاب) وإضافة أفواج تعليمية جديدة
          </p>
        </div>

        <Link
          href={`/${locale}/admin/schedule`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
        >
          <Calendar className="w-4 h-4" />
          <span>جدول الحصص الأسبوعي الموحد</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Class Groups List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            <span>الفصول القائمة ({classGroups.length})</span>
          </h2>

          <div className="space-y-4">
            {classGroups.map((cg) => {
              const currentCount = classEnrollmentCounts[cg.id] || 0;
              const percentage = Math.round((currentCount / cg.capacityMax) * 100);

              return (
                <div
                  key={cg.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold text-[11px]">
                        {cg.classType === "GROUP" ? "فصل جماعي مصغر" : "درس خاص 1 على 1"}
                      </span>
                      {cg.schoolId && schoolsById[cg.schoolId] && (
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] inline-flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {schoolsById[cg.schoolId].nameAr}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">ID: {cg.id}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{cg.name}</h3>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1.5 w-64 max-w-full">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>إشغال المقاعد:</span>
                        <span>{currentCount} من {cg.capacityMax} طلاب</span>
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

                    {/* Edit Class Dropdown */}
                    <details className="text-xs group pt-2">
                      <summary className="cursor-pointer text-slate-500 hover:text-brand-600 font-bold flex items-center gap-1 select-none">
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل الفصل والسعة</span>
                      </summary>

                      <form action={handleUpdateClass} className="p-3 bg-slate-50 rounded-xl space-y-2 mt-2 border border-slate-100">
                        <input type="hidden" name="classId" value={cg.id} />
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">اسم الفصل</label>
                          <input
                            name="name"
                            defaultValue={cg.name}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">السعة القصوى</label>
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
                          تحديث الفصل 💾
                        </button>
                      </form>
                    </details>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <Link
                      href={`/${locale}/teacher/classes/${cg.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors"
                    >
                      عرض القائمة والحضور
                    </Link>

                    <form action={handleDeleteClass}>
                      <input type="hidden" name="classId" value={cg.id} />
                      <button
                        type="submit"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 text-[11px] font-bold"
                        title="حذف الفصل الدراسي"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف الفصل</span>
                      </button>
                    </form>
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
              <span>إنشاء فصل دراسي جديد</span>
            </h3>
            <p className="text-xs text-slate-500">
              تحديد المنهج ونوع الفصل والسعة القصوى
            </p>
          </div>

          <form action={handleCreateClass} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم الفصل</label>
              <input
                name="name"
                required
                placeholder="مثال: فصل الصقور (A2 - المحادثة)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">المستوى والمسار التعليمي</label>
              <select
                name="courseLevelId"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {allLevels.map((lvl) => {
                  const crs = allCourses.find((c) => c.id === lvl.courseId);
                  return (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.titleAr} ({crs?.titleAr || lvl.courseId})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">نوع الفصل</label>
              <select
                name="classType"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="GROUP">فصل جماعي (بحد أقصى 6 أطفال)</option>
                <option value="PRIVATE_1_ON_1">درس خاص (1 على 1)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">السعة القصوى للطلاب</label>
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
                المؤسسة الشريكة (اختياري)
              </label>
              <select
                name="schoolId"
                defaultValue=""
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">فصل فردي عام (بدون مؤسسة)</option>
                {allSchools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameAr}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                عند اختيار مؤسسة، يقتصر هذا الفصل على طلاب تلك المؤسسة فقط.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-md hover:opacity-95 transition-all"
            >
              حفظ وإنشاء الفصل
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
