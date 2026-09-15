import React from "react";
import Link from "next/link";
import { payrollService } from "@/server/services/PayrollService";
import { billingService } from "@/server/services/BillingService";
import { prisma } from "@/lib/database/prisma";
import { InvoiceStatus } from "@prisma/client";
import { Download, FileText } from "lucide-react";

const INVOICE_STATUS_LABELS_AR: Record<InvoiceStatus, string> = {
  DRAFT: "مسودة",
  ISSUED: "بانتظار السداد",
  PAID: "مسددة بالكامل",
  VOID: "ملغاة",
  UNCOLLECTIBLE: "متعذر تحصيلها",
};

const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-50 text-slate-600 border-slate-200",
  ISSUED: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  VOID: "bg-slate-50 text-slate-400 border-slate-200",
  UNCOLLECTIBLE: "bg-red-50 text-red-700 border-red-200",
};

export default async function AdminFinancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const overview = await payrollService.getFinanceOverview();
  const allInvoices = await prisma.invoice.findMany({
    include: { parent: true, payments: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

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

        {/* This links to an API route that streams a CSV file download, not
            a page -- next/link's client-side navigation isn't appropriate
            here, so a plain anchor is intentional. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/admin/export?category=FINANCIAL&format=csv"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>تصدير تقرير المالية (CSV)</span>
        </a>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>الإيراد الشهري المتكرر (MRR)</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {billingService.formatPrice(overview.mrrMinorUnits)}
          </div>
          <p className="text-xs text-slate-400">من الاشتراكات النشطة حالياً</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>إجمالي الإيرادات المحصلة</span>
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
            {overview.totalTeacherLiabilityMinorUnits > 0 && (
              <span className="text-amber-500 font-bold">قيد الصرف</span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-amber-600">
            {billingService.formatPrice(overview.totalTeacherLiabilityMinorUnits)}
          </div>
          <p className="text-xs text-slate-400">التزامات رواتب غير مصروفة بعد</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>صافي الهامش التشغيلي</span>
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

        {allInvoices.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            لا توجد فواتير حتى الآن. ستظهر هنا فور أول اشتراك حقيقي عبر صفحة الدفع.
          </p>
        ) : (
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
                  <span className="text-slate-400 text-[11px]">
                    ولي الأمر: {inv.parent.firstName} {inv.parent.lastName}
                  </span>
                </div>

                <span className="text-slate-500">
                  {inv.createdAt.toISOString().split("T")[0]}
                </span>

                <span className="text-slate-600">
                  {inv.payments[0]?.provider === "STRIPE" ? "Stripe" : inv.payments[0]?.provider || "—"}
                </span>

                <span className="font-bold text-slate-900 text-sm">
                  {billingService.formatPrice(inv.totalMinorUnits, inv.currency)}
                </span>

                <span
                  className={`px-3 py-1 rounded-full font-bold text-[11px] border w-fit ${INVOICE_STATUS_STYLES[inv.status]}`}
                >
                  {INVOICE_STATUS_LABELS_AR[inv.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
