import React from "react";
import Link from "next/link";
import { payrollService } from "@/server/services/PayrollService";
import { billingService } from "@/server/services/BillingService";
import { requireTeacherProfile } from "@/lib/auth/currentUser";
import { schedulingRepository } from "@/server/repositories/SchedulingRepository";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { SessionStatus } from "@prisma/client";
import { Clock, FileCheck } from "lucide-react";

const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export default async function TeacherPayrollPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { profile } = await requireTeacherProfile(locale);
  const teacherId = profile.id;

  const now = new Date();
  const periodYear = now.getUTCFullYear();
  const periodMonth = now.getUTCMonth() + 1; // 1-12
  const monthLabel = `${ARABIC_MONTHS[periodMonth - 1]} ${periodYear}`;

  const payroll = await payrollService.computeTeacherPayroll(teacherId, periodYear, periodMonth);

  // Real per-class breakdown: completed sessions this month, grouped by
  // class group, with the real class name looked up for each.
  const monthStart = new Date(Date.UTC(periodYear, periodMonth - 1, 1));
  const monthEnd = new Date(Date.UTC(periodYear, periodMonth, 1));
  const allSessions = await schedulingRepository.getSessionsByTeacherId(teacherId);
  const completedThisMonth = allSessions.filter(
    (s) =>
      s.status === SessionStatus.COMPLETED &&
      s.startTimeUtc >= monthStart &&
      s.startTimeUtc < monthEnd
  );

  const byClassGroup = new Map<string, { count: number; hours: number }>();
  for (const s of completedThisMonth) {
    const hours = (s.endTimeUtc.getTime() - s.startTimeUtc.getTime()) / (1000 * 60 * 60);
    const entry = byClassGroup.get(s.classGroupId) || { count: 0, hours: 0 };
    entry.count += 1;
    entry.hours += hours;
    byClassGroup.set(s.classGroupId, entry);
  }

  const classGroupRows = await Promise.all(
    Array.from(byClassGroup.entries()).map(async ([classGroupId, stats]) => {
      const group = await academicRepository.getClassGroupById(classGroupId);
      return {
        classGroupId,
        name: group?.name || "فصل محذوف",
        count: stats.count,
        hours: Math.round(stats.hours * 100) / 100,
        payMinorUnits: Math.round(stats.hours * payroll.hourlyRateMinorUnits),
      };
    })
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <Link href={`/${locale}/teacher`} className="hover:underline">
              بوابة المعلم
            </Link>
            <span>/</span>
            <span>المالية والرواتب</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            كشف المستحقات والرواتب الشهرية 💰
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            احتساب مستحقات التدريس بالساعة وسجل الحصص المكتملة فعلياً لشهر {monthLabel}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>تاريخ الصرف الدوري: 28 من كل شهر</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">إجمالي المستحقات لشهر {monthLabel}</span>
          <div className="text-3xl font-extrabold text-emerald-600">
            {billingService.formatPrice(payroll.grossPayMinorUnits)}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {payroll.status === "PAID" ? "تم الصرف" : "بانتظار التحويل البنكي الدوري"}
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">أجر ساعة التدريس المعتمد</span>
          <div className="text-3xl font-extrabold text-slate-900">
            {billingService.formatPrice(payroll.hourlyRateMinorUnits)}
          </div>
          <span className="text-[11px] text-slate-400 block">لكل 60 دقيقة تدريس مباشر</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">ساعات التدريس المنجزة</span>
          <div className="text-3xl font-extrabold text-brand-600">
            {payroll.totalHours} ساعة
          </div>
          <span className="text-[11px] text-slate-400 block">
            من خلال {payroll.completedSessionsCount} حصة مكتملة
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">حالة الدفعة الشهرية</span>
          <div
            className={`text-2xl font-extrabold ${
              payroll.status === "PAID" ? "text-emerald-600" : "text-amber-500"
            }`}
          >
            {payroll.status === "PAID" ? "مصروفة" : "قيد التسوية"}
          </div>
        </div>
      </div>

      {/* Itemized Payroll Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-600" />
          <span>تفاصيل ساعات التدريس المعتمدة لهذا الشهر</span>
        </h3>

        {classGroupRows.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            لا توجد حصص مكتملة مسجلة لهذا الشهر بعد.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3.5 flex items-center justify-between font-bold text-slate-600">
              <span>الفصل والمجموعة الدراسية</span>
              <span>عدد الحصص</span>
              <span>الساعات الإجمالية</span>
              <span>المستحق المالي</span>
            </div>

            {classGroupRows.map((row) => (
              <div
                key={row.classGroupId}
                className="py-4 flex items-center justify-between text-slate-800"
              >
                <span className="font-bold text-slate-900">{row.name}</span>
                <span className="font-medium">{row.count} حصة</span>
                <span className="font-medium">{row.hours} ساعة</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {billingService.formatPrice(row.payMinorUnits)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
