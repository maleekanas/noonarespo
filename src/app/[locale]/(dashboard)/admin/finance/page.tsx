import React from "react";
import Link from "next/link";
import { payrollService } from "@/server/services/PayrollService";
import { billingService } from "@/server/services/BillingService";
import { financialRepository } from "@/server/repositories/FinancialRepository";
import {
  TrendingUp,
  Download,
  FileText,
} from "lucide-react";

export default async function AdminFinancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const overview = await payrollService.getFinanceOverview();
  const allInvoices = await financialRepository.getAllInvoices();

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
            <span>المالية والاشتراكات</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            لوحة الإدارة المالية والتسوية المحاسبية 📊
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة الإيراد الشهري المتكرر (MRR)، تسويات الفواتير، ورواتب الكادر التعليمي بدقة الوحدات الصغرى
          </p>
        </div>

        <button
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>تصدير تقرير المالية (CSV)</span>
        </button>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>الإيراد الشهري المتكرر (MRR)</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18%</span>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {billingService.formatPrice(overview.mrrMinorUnits)}
          </div>
          <p className="text-xs text-slate-400">من الاشتراكات النشطة شهرياً</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>إجمالي الإيرادات المحصلة</span>
            <span className="text-emerald-600 font-bold">مؤكد</span>
          </div>
          <div className="text-3xl font-extrabold text-brand-600">
            {billingService.formatPrice(overview.totalRevenueMinorUnits)}
          </div>
          <p className="text-xs text-slate-400">
            {overview.paidInvoicesCount} فواتير مسددة بنجاح
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>مستحقات رواتب المعلمين</span>
            <span className="text-amber-500 font-bold">قيد الصرف</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">
            {billingService.formatPrice(overview.totalTeacherLiabilityMinorUnits)}
          </div>
          <p className="text-xs text-slate-400">التزام رواتب شهر سبتمبر</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>صافي الهامش التشغيلي</span>
            <span className="text-emerald-600 font-bold">صحي</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {billingService.formatPrice(
              Math.max(0, overview.totalRevenueMinorUnits - overview.totalTeacherLiabilityMinorUnits)
            )}
          </div>
          <p className="text-xs text-slate-400">بعد خصم أجور التدريس</p>
        </div>
      </div>

      {/* Invoices Master Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600" />
          <span>سجل الفواتير والمعاملات المالية العامة ({allInvoices.length})</span>
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 flex items-center justify-between font-bold text-slate-500 uppercase tracking-wider">
            <span>رقم الفاتورة والعميل</span>
            <span>التاريخ</span>
            <span>طريقة الدفع</span>
            <span>المبلغ</span>
            <span>الحالة</span>
          </div>

          {allInvoices.map((inv) => (
            <div
              key={inv.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-800"
            >
              <div>
                <span className="font-bold text-slate-900 block">{inv.invoiceNumber}</span>
                <span className="text-slate-400 text-[11px]">ولي الأمر: طارق المنصور</span>
              </div>

              <span className="text-slate-500">
                {inv.createdAt.toISOString().split("T")[0]}
              </span>

              <span className="text-slate-600">{inv.paymentMethod}</span>

              <span className="font-bold text-slate-900 text-sm">
                {billingService.formatPrice(inv.totalMinorUnits, inv.currency)}
              </span>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200 w-fit">
                مسددة بالكامل
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
