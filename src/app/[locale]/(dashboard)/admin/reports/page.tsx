import React from "react";
import Link from "next/link";
import { administrationService } from "@/server/services/AdministrationService";
import { payrollService } from "@/server/services/PayrollService";
import { billingService } from "@/server/services/BillingService";
import { PrintButton } from "@/components/shared/PrintButton";
import { requireAdminSession } from "@/lib/auth/currentUser";
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
  await requireAdminSession(locale);

  const stats = await administrationService.getSchoolAnalyticsOverview();
  const finance = await payrollService.getFinanceReconciliationOverview();

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
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">أساسيات اللغة العربية (Foundations)</span>
                <span className="text-slate-400 text-[11px]">الفئة: 4-6 سنوات (Pre-A1)</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                إشغال 100% (مكتمل)
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">برنامج القراءة والطلاقة (Reading)</span>
                <span className="text-slate-400 text-[11px]">الفئة: 7-10 سنوات (A1)</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                إشغال 100% (6/6 طلاب)
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">القرآن الكريم والتجويد (Quran & Tajweed)</span>
                <span className="text-slate-400 text-[11px]">الفئة: 7-10 سنوات (A1)</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold">
                نسبة إتقان 94.2%
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">برنامج الكتابة والخط العربي (Writing)</span>
                <span className="text-slate-400 text-[11px]">الفئة: 7-10 سنوات (A2)</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
                معدل تسليم 100%
              </span>
            </div>
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
