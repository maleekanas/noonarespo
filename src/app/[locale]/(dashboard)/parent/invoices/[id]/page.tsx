import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { billingService } from "@/server/services/BillingService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import { prisma } from "@/lib/database/prisma";
import { GraduationCap } from "lucide-react";
import { PrintButton } from "@/components/shared/PrintButton";
import { getDictionary } from "@/lib/localization";

const COMPANY_TAX_ID = "310245892100003";
const VAT_RATE_PERCENT = 0;

export default async function ParentInvoiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const dict = getDictionary(locale);
  const pid = dict.parentInvoiceDetail;
  const { profile } = await requireParentProfile(locale);

  const PROVIDER_LABELS: Record<string, string> = {
    STRIPE: pid.providerStripeLabel,
    MOCK: pid.providerMockLabel,
  };

  // Invoices are always scoped to the logged-in parent — never trust the
  // URL id alone, so one parent can't view another parent's invoice by
  // guessing its id.
  const invoice = await prisma.invoice.findFirst({
    where: { id, parentId: profile.id },
    include: { items: true, payments: true },
  });

  if (!invoice) {
    notFound();
  }

  const discountMinorUnits = Math.max(
    0,
    invoice.subtotalMinorUnits - invoice.taxMinorUnits - invoice.totalMinorUnits
  );
  const paymentProvider = invoice.payments[0]?.provider;
  const paymentMethodLabel = paymentProvider
    ? PROVIDER_LABELS[paymentProvider] || paymentProvider
    : "—";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Print Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/parent`} className="hover:underline">
              {pid.breadcrumbParentDashboard}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/parent/billing`} className="hover:underline">
              {pid.breadcrumbInvoices}
            </Link>
            <span>/</span>
            <span>{pid.breadcrumbInvoiceDetail}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {pid.pageHeading}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {pid.pageSubtitleTemplate.replace("{invoiceNumber}", invoice.invoiceNumber)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/parent/billing`}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            {pid.backToInvoicesButton}
          </Link>
          <PrintButton label={pid.printInvoiceButton} />
        </div>
      </div>

      {/* Official Tax Invoice Document Canvas */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md space-y-8 print:border-none print:shadow-none">
        {/* Invoice Top Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b-2 border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {pid.academyNameLabel}
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {pid.companyLegalTemplate.replace("{taxId}", COMPANY_TAX_ID)}
              </span>
            </div>
          </div>

          <div className="text-center sm:text-end space-y-1">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              {invoice.status === "PAID" ? pid.invoiceStatusPaidFull : invoice.status}
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 block font-mono mt-1">
              {invoice.invoiceNumber}
            </h3>
            <span className="text-xs text-slate-400 block">
              {pid.invoiceDateTemplate.replace("{date}", invoice.createdAt.toISOString().split("T")[0])}
            </span>
          </div>
        </div>

        {/* Bill To & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block text-sm">{pid.billToLabel}</span>
            <span className="font-bold text-slate-800 block">
              {profile.firstName} {profile.lastName}
            </span>
            <span>{pid.addressLabel} {profile.billingAddress || pid.notSpecifiedLabel}</span>
            <span className="block">{pid.phoneLabel} {profile.phoneNumber}</span>
          </div>

          <div className="space-y-1 sm:text-end">
            <span className="font-bold text-slate-900 block text-sm">{pid.paymentDetailsLabel}</span>
            <span>{pid.paymentMethodLabel} {paymentMethodLabel}</span>
            <span className="block">{pid.transactionStatusLabel}</span>
            <span className="block">{pid.currencyLabel} {invoice.currency} {pid.usdCurrencyNote}</span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-4">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 text-start">{pid.tableItemDescriptionHeader}</th>
                <th className="py-3 text-center">{pid.tableQuantityHeader}</th>
                <th className="py-3 text-end">{pid.tableUnitPriceHeader}</th>
                <th className="py-3 text-end">{pid.tableTotalHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item) => (
                <tr key={item.id} className="text-slate-800">
                  <td className="py-4 font-bold">{item.description}</td>
                  <td className="py-4 text-center font-medium">{item.quantity}</td>
                  <td className="py-4 text-end font-medium">
                    {billingService.formatPrice(item.amountMinorUnits, invoice.currency)}
                  </td>
                  <td className="py-4 text-end font-bold">
                    {billingService.formatPrice(item.amountMinorUnits * item.quantity, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & VAT Breakdown */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>{pid.subtotalLabel}</span>
              <span className="font-bold text-slate-900">
                {billingService.formatPrice(invoice.subtotalMinorUnits, invoice.currency)}
              </span>
            </div>

            {discountMinorUnits > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <span>{pid.couponDiscountLabel}</span>
                <span>-{billingService.formatPrice(discountMinorUnits, invoice.currency)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-600">
              <span>{pid.vatLabelTemplate.replace("{rate}", String(VAT_RATE_PERCENT))}</span>
              <span>{billingService.formatPrice(invoice.taxMinorUnits, invoice.currency)}</span>
            </div>

            <div className="pt-2 border-t-2 border-slate-900 flex items-center justify-between text-base font-extrabold text-slate-900">
              <span>{pid.totalPaidLabel}</span>
              <span className="text-brand-700 text-xl">
                {billingService.formatPrice(invoice.totalMinorUnits, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="pt-6 border-t border-slate-100 text-center text-slate-400 text-[11px] space-y-1">
          <p>{pid.thankYouNote}</p>
          <p>{pid.financeContactNote}</p>
        </div>
      </div>
    </div>
  );
}
