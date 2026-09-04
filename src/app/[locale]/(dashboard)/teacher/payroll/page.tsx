import React from "react";
import Link from "next/link";
import { payrollService } from "@/server/services/PayrollService";
import { billingService } from "@/server/services/BillingService";
import { Clock, FileCheck, ShieldCheck } from "lucide-react";

export default async function TeacherPayrollPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const teacherId = "teacher-1";

  const payroll = await payrollService.computeTeacherPayroll(teacherId, "2026-09");

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
            احتساب مستحقات التدريس بالساعة وسجل الحصص المكتملة لشهر سبتمبر 2026
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
          <span className="text-xs font-bold text-slate-500">إجمالي المستحقات لشهر سبتمبر</span>
          <div className="text-3xl font-extrabold text-emerald-600">
            {billingService.formatPrice(payroll.grossPayMinorUnits)}
          </div>
          <span className="text-[11px] text-slate-400 block">
            بانتظار التحويل البنكي الدوري
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
          <div className="text-2xl font-extrabold text-amber-500">
            قيد التسوية
          </div>
          <span className="text-[11px] text-slate-400 block">حساب IBAN مؤكد</span>
        </div>
      </div>

      {/* Itemized Payroll Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-600" />
          <span>تفاصيل ساعات التدريس المعتمدة لهذا الشهر</span>
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3.5 flex items-center justify-between font-bold text-slate-600">
            <span>الفصل والمجموعة الدراسية</span>
            <span>عدد الحصص</span>
            <span>الساعات الإجمالية</span>
            <span>المستحق المالي</span>
          </div>

          <div className="py-4 flex items-center justify-between text-slate-800">
            <div>
              <span className="font-bold text-slate-900 block">
                فصل النجوم (A1 - القراءة والطلاقة)
              </span>
              <span className="text-slate-400 text-[11px]">فصل جماعي مصغر (6 طلاب)</span>
            </div>
            <span className="font-medium">16 حصة</span>
            <span className="font-medium">{payroll.totalHours} ساعة</span>
            <span className="font-bold text-emerald-600 text-sm">
              {billingService.formatPrice(payroll.grossPayMinorUnits)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>بيانات الحساب البنكي المعتمد:</span>
          </div>
          <p>مصرف الراجحي • الآيبان: SA0380000000608010167544 • المستفيد: أحمد المنصوري</p>
        </div>
      </div>
    </div>
  );
}
