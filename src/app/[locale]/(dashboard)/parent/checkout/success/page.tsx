import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Clock } from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";
import { requireParentProfile } from "@/lib/auth/currentUser";
import { getStripeClient, isStripeConfigured } from "@/lib/integrations/stripe";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  const { session_id: sessionId } = await searchParams;
  await requireParentProfile(locale);

  let paid = false;
  if (sessionId && isStripeConfigured()) {
    try {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    } catch {
      // If we can't verify the session (e.g. it belongs to a different
      // account/mode), fall back to the neutral "processing" message below
      // rather than showing an error — the webhook is the real source of
      // truth for fulfillment either way.
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {paid ? (
          <>
            <h1 className="text-2xl font-extrabold text-slate-900">
              تم تأكيد الاشتراك بنجاح! 🎉
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              شكراً لاشتراكك. تم تأكيد العملية بنجاح مع Stripe، وتم تفعيل خطتك التعليمية فوراً.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-slate-900">
              جارٍ تأكيد عملية الدفع...
            </h1>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Clock className="w-4 h-4" />
              <span>قد تستغرق مزامنة الاشتراك بضع لحظات</span>
            </div>
          </>
        )}

        <Link
          href={`/${locale}/parent/billing`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl gradient-brand text-white font-bold text-sm shadow-md hover:opacity-95 transition-all"
        >
          <span>الذهاب إلى الاشتراك والفواتير</span>
          <DirectionalIcon icon={ArrowRight} locale={locale} className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
