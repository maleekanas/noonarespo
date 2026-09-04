import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { academicService } from "@/server/services/AcademicService";
import { ClassType } from "@prisma/client";
import {
  Users,
  PlusCircle,
  Calendar,
} from "lucide-react";

export default async function AdminClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const classGroups = await academicRepository.getAllClassGroups();
  const allLevels = await academicRepository.getAllLevels();
  const allCourses = await academicRepository.getAllCourses();

  const classEnrollmentCounts: Record<string, number> = {};
  for (const cg of classGroups) {
    const enrs = await academicRepository.getEnrollmentsByClassGroupId(cg.id);
    classEnrollmentCounts[cg.id] = enrs.length;
  }

  async function handleCreateClass(formData: FormData) {
    "use server";
    const name = formData.get("name")?.toString() || "";
    const courseLevelId = formData.get("courseLevelId")?.toString() || "level-a1-reading";
    const classType = (formData.get("classType")?.toString() || "GROUP") as ClassType;
    const capacityStr = formData.get("capacityMax")?.toString() || "6";

    if (!name) return;

    await academicService.createClassGroup({
      name,
      courseLevelId,
      classType,
      capacityMax: parseInt(capacityStr, 10),
    });

    revalidatePath(`/${locale}/admin/classes`);
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
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold text-[11px]">
                        {cg.classType === "GROUP" ? "فصل جماعي مصغر" : "درس خاص 1 على 1"}
                      </span>
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
                  </div>

                  <Link
                    href={`/${locale}/teacher/classes/${cg.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors"
                  >
                    عرض القائمة والحضور
                  </Link>
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
