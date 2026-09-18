import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { billingService } from "@/server/services/BillingService";
import { createStripeCheckoutSession } from "@/server/services/StripeSubscriptionService";
import { isStripeConfigured } from "@/lib/integrations/stripe";
import {
  ArrowRight,
  Lock,
  ShieldAlert,
  Info,
  Sparkles,
} from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";
import { requireVerifiedParentProfile } from "@/lib/auth/currentUser";

// A 1-day free trial: TRIAL_DAYS days of full-price-plan card authorization
// with no charge, auto-converting to that plan's normal price unless
// cancelled first. Fixed at the trial plan's own tier (plan-starter, the
// cheapest) rather than whatever plan a coupon-hunting link might name, so
// the trial can't be used to sneak a discount onto a bigger plan.
const TRIAL_DAYS = 1;
const TRIAL_PLAN_ID = "plan-starter";

export default async function ParentCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ planId?: string; coupon?: string; cancelled?: string; trial?: string }>;
}) {
  const { locale } = await params;
  const { planId: planIdParam, coupon: couponParam, cancelled, trial } = await searchParams;
  await requireVerifiedParentProfile(locale);
  const isTrialCheckout = trial === "1";

  const allPlans = await billingService.getAllPlans();
  const selectedPlanId = isTrialCheckout ? TRIAL_PLAN_ID : planIdParam || "plan-group";
  const selectedPlan = allPlans.find((p) => p.id === selectedPlanId) || allPlans[1];

  const calculation = await billingService.calculateCheckoutPrice(
    selectedPlan.id,
    isTrialCheckout ? undefined : couponParam
  );

  const stripeReady = isStripeConfigured();

  async function handleCheckout(formData: FormData) {
    "use server";
    const verifiedParent = await requireVerifiedParentProfile(locale);
    const planId = formData.get("planId")?.toString() || selectedPlan.id;
    const couponCode = formData.get("couponCode")?.toString() || "";
    const trialParam = formData.get("trial")?.toString() || "";

    const { url } = await createStripeCheckoutSession({
      parentId: verifiedParent.profile.id,
      parentEmail: verifiedParent.session.email,
      planId,
      couponCode: couponCode || undefined,
      locale,
      trialDays: trialParam === "1" ? TRIAL_DAYS : undefined,
    });

    redirect(url);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/parent/billing`} className="hover:underline">
              الاشتراكات والفواتير
            </Link>
            <span>/</span>
            <span>إتمام الاشتراك والدفع</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            بوابة الدفع الآمن واختيار الباقة 💳
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            اختر الباقة المناسبة لطفلك وطبّق كوبون الخصم لإتمام الاشتراك فوراً
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>تشفير مالي آمن 256-bit SSL</span>
        </div>
      </div>

      {isTrialCheckout && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-900">
          <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-extrabold text-sm mb-1">تجربتك المجانية ليوم واحد 🎉</p>
            <p>
              لن يتم خصم أي مبلغ اليوم. بطاقتك تُستخدم فقط لتفعيل الحساب، وبعد 24 ساعة يتحوّل اشتراكك تلقائياً إلى{" "}
              <span className="font-bold">{selectedPlan.nameAr}</span> بسعر{" "}
              <span className="font-bold">{billingService.formatPrice(selectedPlan.priceMinorUnits)}/شهرياً</span>{" "}
              ما لم تُلغِ الاشتراك قبل ذلك من صفحة الفوترة بضغطة واحدة.
            </p>
          </div>
        </div>
      )}

      {cancelled && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>تم إلغاء عملية الدفع ولم يتم خصم أي مبلغ. يمكنك المحاولة مجدداً في أي وقت.</span>
        </div>
      )}

      {!stripeReady && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>بوابة الدفع غير مُفعّلة حالياً على هذا الموقع. الرجاء المحاولة لاحقاً أو التواصل مع الدعم.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Plan Selection & Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Picker Cards -- fixed to the trial plan during a trial
              checkout, since the trial is a specific $0-for-1-day offer on
              the Starter plan, not a free pick of any tier. */}
          {isTrialCheckout ? (
            <div className="p-5 rounded-3xl border-2 border-emerald-500 bg-emerald-50/40">
              <span className="text-sm font-bold text-slate-900">{selectedPlan.nameAr}</span>
              <span className="text-xl font-extrabold text-emerald-700 block mt-2">
                مجاناً ليوم واحد
                <span className="text-xs text-slate-500 font-normal">
                  {" "}
                  ثم {billingService.formatPrice(selectedPlan.priceMinorUnits)} / شهرياً
                </span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1">{selectedPlan.descriptionAr}</p>
            </div>
          ) : (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              1. اختر الباقة التعليمية المناسبة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allPlans.map((p) => (
                <Link
                  key={p.id}
                  href={`/${locale}/parent/checkout?planId=${p.id}${couponParam ? `&coupon=${couponParam}` : ""}`}
                  className={`p-5 rounded-3xl border text-start transition-all ${
                    p.id === selectedPlan.id
                      ? "border-brand-600 bg-brand-50/40 ring-2 ring-brand-100 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{p.nameAr}</span>
                    {p.isPopular && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        الأكثر طلباً
                      </span>
                    )}
                  </div>
                  <span className="text-xl font-extrabold text-brand-700 block mt-2">
                    {billingService.formatPrice(p.priceMinorUnits)}
                    <span className="text-xs text-slate-400 font-normal"> / شهرياً</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {p.descriptionAr}
                  </p>
                </Link>
              ))}
            </div>
          </div>
          )}

          {/* Checkout Submission Form */}
          <form action={handleCheckout} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <input type="hidden" name="planId" value={selectedPlan.id} />
            <input type="hidden" name="couponCode" value={isTrialCheckout ? "" : couponParam || ""} />
            {isTrialCheckout && <input type="hidden" name="trial" value="1" />}

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                2. الدفع الآمن عبر Stripe:
              </label>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
                <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>
                  {isTrialCheckout
                    ? "سيتم تحويلك إلى صفحة الدفع الآمنة والمعتمدة من Stripe لتوثيق بطاقتك. لن يتم خصم أي مبلغ الآن -- أول خصم فعلي يحدث فقط بعد انتهاء يوم التجربة المجاني."
                    : "سيتم تحويلك إلى صفحة الدفع الآمنة والمعتمدة من Stripe لإدخال بيانات بطاقتك مباشرة. نحن لا نطّلع على بيانات بطاقتك ولا نخزّنها على خوادمنا إطلاقاً."}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!stripeReady}
              className="w-full py-4 rounded-2xl gradient-brand text-white font-extrabold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {isTrialCheckout
                  ? "بدء التجربة المجانية ليوم واحد — $0.00 الآن"
                  : `المتابعة إلى الدفع الآمن — ${billingService.formatPrice(calculation.totalMinorUnits)}`}
              </span>
              <DirectionalIcon icon={ArrowRight} locale={locale} className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Col: Order Summary & Coupon */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              ملخص الطلب والفاتورة
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>الباقة المختارة:</span>
                <span className="font-bold text-slate-900">{selectedPlan.nameAr}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>السعر الأساسي:</span>
                <span className="font-medium text-slate-800">
                  {isTrialCheckout ? "$0.00 (اليوم الأول مجاناً)" : billingService.formatPrice(calculation.subtotalMinorUnits)}
                </span>
              </div>

              {!isTrialCheckout && calculation.couponApplied && (
                <div className="flex items-center justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl">
                  <span>خصم كوبون ({calculation.couponApplied.code}):</span>
                  <span>-{billingService.formatPrice(calculation.discountMinorUnits)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>ضريبة القيمة المضافة:</span>
                <span className="text-slate-500">مشمولة (0%)</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-base font-extrabold text-slate-900">
                <span>الإجمالي المستحق اليوم:</span>
                <span className="text-brand-700 text-xl">
                  {isTrialCheckout ? "$0.00" : billingService.formatPrice(calculation.totalMinorUnits)}
                </span>
              </div>
              {isTrialCheckout && (
                <p className="text-[11px] text-slate-400">
                  ثم {billingService.formatPrice(selectedPlan.priceMinorUnits)}/شهرياً تلقائياً بعد 24 ساعة، ما لم تُلغِ.
                </p>
              )}
            </div>

            {/* Coupon Application Box -- not offered on the trial, which is
                already free for its 1 day and converts to plan-starter's
                undiscounted price (see TRIAL_PLAN_ID above). */}
            {!isTrialCheckout && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                هل لديك كوبون خصم؟
              </label>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="text-[11px] text-slate-500 block">
                  جرّب الكوبون التجريبي: <span className="font-mono font-bold text-brand-600">WELCOME10</span> (خصم 10%) أو <span className="font-mono font-bold text-brand-600">SIBLING20</span> (خصم 20%)
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${locale}/parent/checkout?planId=${selectedPlan.id}&coupon=WELCOME10`}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-brand-500 text-slate-700 font-bold text-[11px]"
                  >
                    تطبيق WELCOME10
                  </Link>
                  <Link
                    href={`/${locale}/parent/checkout?planId=${selectedPlan.id}&coupon=SIBLING20`}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-brand-500 text-slate-700 font-bold text-[11px]"
                  >
                    تطبيق SIBLING20
                  </Link>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
