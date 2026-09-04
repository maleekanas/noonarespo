import React from "react";
import Link from "next/link";
import { billingService } from "@/server/services/BillingService";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

export default async function ParentBillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const parentId = "parent-1";

  const subscription = await billingService.getParentSubscription(parentId);
  const plan = subscription ? await billingService.getPlanById(subscription.planId) : null;
  const invoices = await billingService.getParentInvoices(parentId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/parent`} className="hover:underline">
              لوحة ولي الأمر
            </Link>
            <span>/</span>
            <span>الاشتراكات والفواتير</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            إدارة الاشتراك المالي والفواتير 💳
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            متابعة باقة أطفالك النشطة، طرق الدفع المعتمدة، وسجل الإيصالات الضريبية
          </p>
        </div>

        <Link
          href={`/${locale}/parent/checkout`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ترقية أو تغيير الباقة</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Subscription Card & Invoices */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Subscription Box */}
          {plan && subscription && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    الاشتراك نشط ومفعل ✓
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
                    {plan.nameAr}
                  </h2>
                  <p className="text-xs text-slate-300">{plan.descriptionAr}</p>
                </div>

                <div className="text-start sm:text-end">
                  <span className="text-3xl font-extrabold text-white block">
                    {billingService.formatPrice(plan.priceMinorUnits)}
                  </span>
                  <span className="text-xs text-slate-400">شهرياً • شامل الرسوم</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>
                    تاريخ التجديد القادم:{" "}
                    <span className="font-bold text-white">
                      {subscription.currentPeriodEnd.toISOString().split("T")[0]}
                    </span>
                  </span>
                </div>

                <span className="text-[11px] text-slate-400">
                  وسيلة الدفع: بطاقة ائتمانية (Visa •••• 4242)
                </span>
              </div>
            </div>
          )}

          {/* Invoices History Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <span>سجل الفواتير والإيصالات الضريبية ({invoices.length})</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {inv.invoiceNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        مدفوعة بنجاح
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {inv.lineItems[0]?.description || "اشتراك شهري"}
                    </p>
                    <span className="text-[11px] text-slate-400 block">
                      التاريخ: {inv.createdAt.toISOString().split("T")[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-extrabold text-slate-900">
                      {billingService.formatPrice(inv.totalMinorUnits)}
                    </span>

                    <Link
                      href={`/${locale}/parent/invoices/${inv.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>عرض الفاتورة</span>
                      <DirectionalIcon icon={ArrowRight} locale={locale} className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Security & Guarantee Guarantee */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ضمان الأمان والخصوصية المالية</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              جميع المعاملات المالية مشفرة بالكامل وفق معايير PCI-DSS العالمية. لا نقوم بتخزين أرقام بطاقاتك الائتمانية على خوادمنا.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>إلغاء الاشتراك متاح في أي وقت بضغطة زر</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>ضمان استرداد كامل المبلغ خلال أول 14 يوماً</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>إيصالات ضريبية فورية معتمدة</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
