import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { billingService } from "@/server/services/BillingService";
import {
  CreditCard,
  ArrowRight,
  Lock,
} from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

export default async function ParentCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ planId?: string; coupon?: string }>;
}) {
  const { locale } = await params;
  const { planId: planIdParam, coupon: couponParam } = await searchParams;
  const parentId = "parent-1";

  const allPlans = await billingService.getAllPlans();
  const selectedPlanId = planIdParam || "plan-group";
  const selectedPlan = allPlans.find((p) => p.id === selectedPlanId) || allPlans[1];

  const calculation = await billingService.calculateCheckoutPrice(
    selectedPlan.id,
    couponParam
  );

  async function handleCheckout(formData: FormData) {
    "use server";
    const planId = formData.get("planId")?.toString() || selectedPlan.id;
    const couponCode = formData.get("couponCode")?.toString() || "";
    const paymentMethod = (formData.get("paymentMethod")?.toString() || "CREDIT_CARD") as
      | "CREDIT_CARD"
      | "APPLE_PAY"
      | "GOOGLE_PAY"
      | "PAYPAL"
      | "MOCK";

    const { invoice } = await billingService.processCheckout({
      parentId,
      planId,
      couponCode: couponCode || undefined,
      paymentMethod,
    });

    redirect(`/${locale}/parent/invoices/${invoice.id}`);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Plan Selection & Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Picker Cards */}
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

          {/* Checkout Submission Form */}
          <form action={handleCheckout} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <input type="hidden" name="planId" value={selectedPlan.id} />
            <input type="hidden" name="couponCode" value={couponParam || ""} />

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                2. اختر وسيلة الدفع المعتمدة:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="p-3.5 rounded-2xl border-2 border-brand-500 bg-brand-50/30 flex flex-col items-center gap-1.5 cursor-pointer text-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CREDIT_CARD"
                    defaultChecked
                    className="sr-only"
                  />
                  <CreditCard className="w-5 h-5 text-brand-600" />
                  <span className="text-xs font-bold text-slate-800">بطاقة بنكية</span>
                  <span className="text-[10px] text-slate-400">Visa / Mada</span>
                </label>

                <label className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 flex flex-col items-center gap-1.5 cursor-pointer text-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="APPLE_PAY"
                    className="sr-only"
                  />
                  <span className="text-sm font-bold text-slate-800">Pay</span>
                  <span className="text-xs font-bold text-slate-800">Apple Pay</span>
                  <span className="text-[10px] text-slate-400">دفع فوري</span>
                </label>

                <label className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 flex flex-col items-center gap-1.5 cursor-pointer text-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="GOOGLE_PAY"
                    className="sr-only"
                  />
                  <span className="text-sm font-bold text-slate-800">G Pay</span>
                  <span className="text-xs font-bold text-slate-800">Google Pay</span>
                  <span className="text-[10px] text-slate-400">دفع آمن</span>
                </label>

                <label className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 flex flex-col items-center gap-1.5 cursor-pointer text-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYPAL"
                    className="sr-only"
                  />
                  <span className="text-sm font-bold text-blue-600">PayPal</span>
                  <span className="text-xs font-bold text-slate-800">باي بال</span>
                  <span className="text-[10px] text-slate-400">عالمي</span>
                </label>
              </div>
            </div>

            {/* Credit Card Input Simulation */}
            <div className="space-y-4 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم حامل البطاقة</label>
                <input
                  defaultValue="طارق المنصور"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم البطاقة</label>
                <input
                  defaultValue="4242 •••• •••• 4242"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الانتهاء</label>
                  <input
                    defaultValue="12/28"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رمز الأمان CVC</label>
                  <input
                    defaultValue="888"
                    type="password"
                    maxLength={4}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl gradient-brand text-white font-extrabold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <span>تأكيد الدفع وسداد {billingService.formatPrice(calculation.totalMinorUnits)}</span>
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
                  {billingService.formatPrice(calculation.subtotalMinorUnits)}
                </span>
              </div>

              {calculation.couponApplied && (
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
                <span>الإجمالي النهائي:</span>
                <span className="text-brand-700 text-xl">
                  {billingService.formatPrice(calculation.totalMinorUnits)}
                </span>
              </div>
            </div>

            {/* Coupon Application Box */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
