import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { billingService } from "@/server/services/BillingService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import { prisma } from "@/lib/database/prisma";
import { SubscriptionStatus } from "@prisma/client";
import {
  createBillingPortalSession,
  getSubscriptionCancellationState,
} from "@/server/services/StripeSubscriptionService";
import { isStripeConfigured } from "@/lib/integrations/stripe";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  PlusCircle,
  ShieldCheck,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";
import { getDictionary } from "@/lib/localization";

export default async function ParentBillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ portalError?: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const pb = dict.parentBilling;
  const { portalError } = await searchParams;
  const { session, profile } = await requireParentProfile(locale);
  const parentId = profile.id;

  const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
    TRIALING: pb.statusTrialing,
    ACTIVE: pb.statusActive,
    PAST_DUE: pb.statusPastDue,
    CANCELLED: pb.statusCancelled,
    UNPAID: pb.statusUnpaid,
  };

  const INTERVAL_LABELS: Record<string, string> = {
    MONTHLY: pb.intervalMonthlyLabel,
    QUARTERLY: pb.intervalQuarterlyLabel,
    ANNUALLY: pb.intervalAnnuallyLabel,
  };

  async function handleManageSubscription() {
    "use server";
    const result = await createBillingPortalSession({
      parentId,
      parentEmail: session.email,
      locale,
    });

    if ("url" in result) {
      redirect(result.url);
    }

    // No Stripe customer could be found or created for this parent (no
    // completed checkout yet, or the webhook that would have captured it
    // never reached this environment) -- send them back with a flag the
    // page uses to show a plain-language explanation instead of a silent
    // failure.
    redirect(`/${locale}/parent/billing?portalError=1`);
  }

  // Real, Stripe-backed billing data (Prisma) — separate from the demo
  // catalog in BillingService, which is only used here for price formatting.
  const subscription = await prisma.subscription.findFirst({
    where: { parentId, status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE] } },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  const invoices = await prisma.invoice.findMany({
    where: { parentId },
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  // A parent who already cancelled through the Stripe Billing Portal keeps
  // full ACTIVE status locally until their period actually ends -- read the
  // live cancellation flag from Stripe so they see confirmation here instead
  // of wondering whether their cancellation "took."
  let cancelAtPeriodEnd = false;
  if (subscription?.stripeSubscriptionId && isStripeConfigured()) {
    const cancellationState = await getSubscriptionCancellationState(subscription.stripeSubscriptionId);
    cancelAtPeriodEnd = cancellationState?.cancelAtPeriodEnd ?? false;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/parent`} className="hover:underline">
              {pb.breadcrumbParentDashboard}
            </Link>
            <span>/</span>
            <span>{pb.breadcrumbCurrent}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {pb.pageHeading}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {pb.pageSubtitle}
          </p>
        </div>

        <Link
          href={`/${locale}/parent/checkout`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{pb.upgradeOrChangePlanButton}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Subscription Card & Invoices */}
        <div className="lg:col-span-2 space-y-8">
          {portalError && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              {pb.portalErrorMessage}
            </div>
          )}

          {cancelAtPeriodEnd && subscription && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {pb.pendingCancellationBannerTemplate.replace(
                  "{date}",
                  subscription.currentPeriodEnd.toISOString().split("T")[0]
                )}
              </span>
            </div>
          )}

          {/* Active Subscription Box */}
          {subscription && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    {SUBSCRIPTION_STATUS_LABELS[subscription.status]}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
                    {isAr ? subscription.plan.nameAr : subscription.plan.nameEn}
                  </h2>
                </div>

                <div className="text-start sm:text-end">
                  <span className="text-3xl font-extrabold text-white block">
                    {billingService.formatPrice(subscription.plan.priceMinorUnits, subscription.plan.currency)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {INTERVAL_LABELS[subscription.plan.interval] || pb.intervalMonthlyLabel} • {pb.inclusiveFeesLabel}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>
                    {pb.renewalDateLabel}{" "}
                    <span className="font-bold text-white">
                      {subscription.currentPeriodEnd.toISOString().split("T")[0]}
                    </span>
                  </span>
                </div>

                <span className="text-[11px] text-slate-400">
                  {pb.processedSecurelyLabel}
                </span>
              </div>

              {isStripeConfigured() && (
                <form action={handleManageSubscription} className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{pb.manageOrCancelButton}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {!subscription && (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center space-y-3">
              <p className="text-sm font-bold text-slate-700">{pb.noActiveSubscriptionHeading}</p>
              <p className="text-xs text-slate-500">
                {pb.noActiveSubscriptionText}
              </p>
              <Link
                href={`/${locale}/parent/checkout`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{pb.chooseAndSubscribeButton}</span>
              </Link>
            </div>
          )}

          {/* Invoices History Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <span>{pb.invoicesHeadingTemplate.replace("{count}", String(invoices.length))}</span>
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
                        {inv.status === "PAID" ? pb.invoiceStatusPaid : inv.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {inv.items[0]?.description || pb.defaultInvoiceDescription}
                    </p>
                    <span className="text-[11px] text-slate-400 block">
                      {pb.invoiceDateLabel} {inv.createdAt.toISOString().split("T")[0]}
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
                      <span>{pb.viewInvoiceButton}</span>
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
              <span>{pb.securityGuaranteeHeading}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {pb.securityGuaranteeText}
            </p>
            <ul className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{pb.guaranteeCancelAnytimeLabel}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{pb.guaranteeRefund14DaysLabel}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{pb.guaranteeInstantReceiptsLabel}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
