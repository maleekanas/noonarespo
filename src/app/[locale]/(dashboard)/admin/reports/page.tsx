import React from "react";
import Link from "next/link";
import { administrationService } from "@/server/services/AdministrationService";
import { payrollService } from "@/server/services/PayrollService";
import { billingService } from "@/server/services/BillingService";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { PrintButton } from "@/components/shared/PrintButton";
import { requireAdminHubAccess } from "@/lib/auth/currentUser";
import {
  TrendingUp,
  BookOpen,
} from "lucide-react";

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdminHubAccess(locale, "reports");

  const stats = await administrationService.getSchoolAnalyticsOverview();
  const finance = await payrollService.getFinanceReconciliationOverview();

  // The "Academic Program Health" table below used to be 4 rows of
  // hardcoded HTML (fixed titles, fixed "100%"/"94.2%" figures) sitting
  // right next to real per-class enrollment data the Classes hub already
  // computes the same way. This pulls the real chain instead --
  // classGroup -> courseLevel -> course -> program -- and aggregates
  // actual capacity/enrollment per program so the occupancy shown here
  // moves when real enrollments change instead of always reading "100%".
  const [allPrograms, allCourses, allLevels, allClassGroups] = await Promise.all([
    academicRepository.getAllPrograms(),
    academicRepository.getAllCourses(),
    academicRepository.getAllLevels(),
    academicRepository.getAllClassGroups(),
  ]);

  const courseById = new Map(allCourses.map((c) => [c.id, c]));
  const levelById = new Map(allLevels.map((l) => [l.id, l]));

  const programHealth = await Promise.all(
    allPrograms.map(async (program) => {
      const programClassGroups = allClassGroups.filter((cg) => {
        const level = levelById.get(cg.courseLevelId);
        const course = level ? courseById.get(level.courseId) : undefined;
        return course?.programId === program.id;
      });

      let capacityTotal = 0;
      let enrolledTotal = 0;
      for (const cg of programClassGroups) {
        capacityTotal += cg.capacityMax;
        const enrollments = await academicRepository.getEnrollmentsByClassGroupId(cg.id);
        enrolledTotal += enrollments.length;
      }

      const occupancyPct = capacityTotal > 0 ? Math.round((enrolledTotal / capacityTotal) * 100) : 0;
      const ageGroups = Array.from(
        new Set(
          programClassGroups
            .map((cg) => levelById.get(cg.courseLevelId)?.targetAge)
            .filter((a): a is NonNullable<typeof a> => !!a)
        )
      );

      return {
        programId: program.id,
        titleAr: program.titleAr,
        classCount: programClassGroups.length,
        capacityTotal,
        enrolledTotal,
        occupancyPct,
        ageGroups,
      };
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Print Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              لوحة الإدارة العامة
            </Link>
            <span>/</span>
            <span>التقارير المجمعة والتحليلات</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            التقرير الأكاديمي والتشغيلي الشامل 📊
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            مؤشرات الأداء المؤسسي، كفاءة الحصص، ونسب استبقاء الطلاب للفصل الدراسي الأول
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PrintButton label="طباعة التقرير (PDF)" />
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">إجمالي الطلاب المسجلين</span>
          <div className="text-3xl font-extrabold text-brand-600 font-mono">
            {stats.totalStudents}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold block">
            {stats.activeStudents} حساب نشط • {stats.suspendedStudents} مجمد
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">معدل الحضور العام</span>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">
            {stats.overallAttendanceRate}%
          </div>
          <span className="text-[11px] text-slate-400 block">
            التزام مرتفع بالحضور التفاعلي
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">نسبة استبقاء الطلاب (Retention)</span>
          <div className="text-3xl font-extrabold text-purple-600 font-mono">
            {stats.retentionRatePercentage}%
          </div>
          <span className="text-[11px] text-slate-400 block">
            مؤشر استقرار ممتاز للفصول
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">ساعات التدريس المعتمدة</span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {stats.totalHoursDelivered} ساعة
          </div>
          <span className="text-[11px] text-slate-400 block">
            عبر {stats.totalTeachers} معلمين معتمدين
          </span>
        </div>
      </div>

      {/* Deep Dive Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Academic Program Health */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            <span>مؤشرات البرامج الأكاديمية السبعة</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {programHealth.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                لا توجد برامج أكاديمية مسجلة بعد
              </div>
            ) : (
              programHealth.map((p) => (
                <div key={p.programId} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block">{p.titleAr}</span>
                    <span className="text-slate-400 text-[11px]">
                      {p.classCount} {p.classCount === 1 ? "فصل" : "فصول"}
                      {p.ageGroups.length > 0 ? ` • ${p.ageGroups.join(", ")}` : ""}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${
                      p.capacityTotal === 0
                        ? "bg-slate-100 text-slate-500"
                        : p.occupancyPct >= 90
                        ? "bg-emerald-50 text-emerald-700"
                        : p.occupancyPct >= 50
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {p.capacityTotal === 0
                      ? "لا يوجد فصول نشطة"
                      : `إشغال ${p.occupancyPct}% (${p.enrolledTotal}/${p.capacityTotal})`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Financial & Operational Cross-Check */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>المطابقة التشغيلية والمالية المجمعة</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-600">الإيراد الشهري المتكرر (MRR):</span>
              <span className="font-extrabold text-base text-slate-900 font-mono">
                {billingService.formatPrice(finance.monthlyRecurringRevenueMinorUnits)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-600">إجمالي المقبوضات المسددة:</span>
              <span className="font-extrabold text-base text-emerald-600 font-mono">
                {billingService.formatPrice(finance.grossRevenueMinorUnits)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-600">التزامات رواتب المعلمين (Liability):</span>
              <span className="font-extrabold text-base text-amber-600 font-mono">
                {billingService.formatPrice(finance.totalTeacherPayrollMinorUnits)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <span className="font-bold text-emerald-900">صافي الهامش التشغيلي للأكاديمية:</span>
              <span className="font-extrabold text-lg text-emerald-700 font-mono">
                {billingService.formatPrice(finance.netAcademyMarginMinorUnits)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
