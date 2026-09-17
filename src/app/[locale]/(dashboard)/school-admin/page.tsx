import React from "react";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { requireSchoolAdminSession } from "@/lib/auth/currentUser";
import { schoolService } from "@/server/services/SchoolService";
import { academicService } from "@/server/services/AcademicService";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { administrationService } from "@/server/services/AdministrationService";
import { SchoolAdminRosterClient } from "@/components/admin/SchoolAdminRosterClient";
import { ClassType, AgeGroup } from "@prisma/client";
import { Building2, Users, Layers, Calendar, PlusCircle } from "lucide-react";

/**
 * The real Institutional Admin Dashboard: everything on this page is
 * pre-filtered, server-side, to exactly one PartnerSchool -- the one the
 * logged-in SCHOOL_ADMIN is scoped to via requireSchoolAdminSession. This
 * is what makes the B2B "Institutional Admin Dashboard" and "Real-Time
 * Collaborative Classroom" claims real multi-tenancy: a school admin
 * cannot see another institution's roster, classes or reports from here,
 * unlike the old flat admin-role check that (once real accounts existed)
 * would have given a school admin the same platform-wide /admin view as
 * a SUPER_ADMIN.
 */
export default async function SchoolAdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { schoolId } = await requireSchoolAdminSession(locale);

  const school = await schoolService.getSchoolDetails(schoolId);
  if (!school) {
    notFound();
  }

  const [classes, overview, allLevels, allCourses] = await Promise.all([
    academicService.getClassGroupsForSchool(schoolId),
    administrationService.getSchoolAnalyticsOverviewForSchool(schoolId),
    academicRepository.getAllLevels(),
    academicRepository.getAllCourses(),
  ]);

  const classEnrollmentCounts: Record<string, number> = {};
  for (const cg of classes) {
    const enrs = await academicRepository.getEnrollmentsByClassGroupId(cg.id);
    classEnrollmentCounts[cg.id] = enrs.length;
  }

  const availableSeats = school.licenseSeatsTotal - school.licenseSeatsUsed;

  async function handleOnboardRoster(params: {
    students: { fullName: string; email?: string }[];
    ageGroup: AgeGroup;
  }) {
    "use server";
    // Re-resolves the school scope from the session server-side rather
    // than trusting anything the client could have sent -- schoolId here
    // always comes from requireSchoolAdminSession, never from the form.
    const { schoolId: scopedSchoolId } = await requireSchoolAdminSession(locale);
    const result = await schoolService.onboardBatchRoster({
      schoolId: scopedSchoolId,
      students: params.students,
      ageGroup: params.ageGroup,
      locale,
    });
    revalidatePath(`/${locale}/school-admin`);
    revalidatePath(`/${locale}/admin/schools`);
    return result;
  }

  async function handleCreateClass(formData: FormData) {
    "use server";
    const { schoolId: scopedSchoolId } = await requireSchoolAdminSession(locale);
    const name = formData.get("name")?.toString() || "";
    const courseLevelId = formData.get("courseLevelId")?.toString() || "";
    const classType = (formData.get("classType")?.toString() || "GROUP") as ClassType;
    const capacityStr = formData.get("capacityMax")?.toString() || "6";

    if (!name || !courseLevelId) return;

    await academicService.createClassGroup({
      name,
      courseLevelId,
      classType,
      capacityMax: parseInt(capacityStr, 10),
      schoolId: scopedSchoolId,
    });

    revalidatePath(`/${locale}/school-admin`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-1">
          <Building2 className="w-4 h-4" />
          <span>لوحة تحكم المؤسسة الشريكة</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">{school.nameAr}</h1>
        <p className="text-xs text-slate-500 mt-1">{school.nameEn}</p>
      </div>

      {/* Scoped KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>المقاعد المرخصة</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {school.licenseSeatsUsed} / {school.licenseSeatsTotal}
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>الطلاب المسجلون (حسابات حقيقية)</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {overview.activeStudents} / {overview.totalStudents}
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>الفصول الدراسية الخاصة بالمؤسسة</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{overview.totalClasses}</div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>نسبة الحضور المسجّلة</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {overview.attendanceRecordsCount > 0
              ? `${overview.attendanceRatePercentage}%`
              : "لا توجد بيانات بعد"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">
            الفصول الدراسية الخاصة بالمؤسسة ({classes.length})
          </h2>

          {classes.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center text-sm text-slate-500">
              لا توجد فصول مخصصة لهذه المؤسسة بعد -- أنشئ أول فصل من النموذج المجاور.
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((cg) => {
                const currentCount = classEnrollmentCounts[cg.id] || 0;
                const percentage = Math.round((currentCount / cg.capacityMax) * 100);
                return (
                  <div
                    key={cg.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2"
                  >
                    <h3 className="text-base font-bold text-slate-900">{cg.name}</h3>
                    <div className="space-y-1.5 w-64 max-w-full">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>إشغال المقاعد:</span>
                        <span>{currentCount} من {cg.capacityMax} طلاب</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${percentage >= 100 ? "bg-rose-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <SchoolAdminRosterClient
            schoolNameEn={school.nameEn}
            availableSeats={availableSeats}
            onOnboardRoster={handleOnboardRoster}
          />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 h-fit">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-purple-600" />
              <span>إنشاء فصل جديد لهذه المؤسسة</span>
            </h3>
            <p className="text-xs text-slate-500">
              يُحصر هذا الفصل تلقائياً بطلاب {school.nameAr} فقط.
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
