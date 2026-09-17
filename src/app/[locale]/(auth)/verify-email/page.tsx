import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/localization";
import { prisma } from "@/lib/database/prisma";
import { isVerificationTokenValid, verifyAndConsumeEmailToken } from "@/lib/auth/emailVerification";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rateLimit";
import { RoleType } from "@prisma/client";
import { GraduationCap, MailCheck, XCircle } from "lucide-react";

// Confirming an email is a deliberate POST (a button submit), never an
// automatic effect of loading this page with a GET request -- the same
// reason reset-password requires a form submit rather than acting the
// instant the link is opened. Corporate email security scanners (Microsoft
// Safe Links, Google's link scanning, etc.) routinely pre-fetch every link
// in an inbound email in the background; an auto-verifying GET route would
// let the scanner silently burn the token before the real person ever
// clicks it, leaving them stuck on an "expired link" error for no reason
// they could see.

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; plan?: string; trial?: string }>;
}) {
  const { locale } = await params;
  const { token, plan, trial } = await searchParams;
  const dict = getDictionary(locale);

  async function handleConfirm(formData: FormData) {
    "use server";
    const rawToken = formData.get("token")?.toString() || "";
    const planParam = formData.get("plan")?.toString() || "";
    const trialParam = formData.get("trial")?.toString() || "";

    if (!rawToken) {
      redirect(`/${locale}/register`);
    }

    const ip = await getClientIp();
    const ipCheck = await checkRateLimit(
      `verify-email-submit:ip:${ip}`,
      RATE_LIMITS.VERIFY_EMAIL_SUBMIT_PER_IP
    );
    if (!ipCheck.allowed) {
      redirect(`/${locale}/verify-email?token=${encodeURIComponent(rawToken)}&error=ratelimited`);
    }

    const result = await verifyAndConsumeEmailToken(rawToken);
    if (!result) {
      // Token invalid/expired/already used -- send to the tokenless URL so
      // the page renders the "link expired" state with a way back to
      // register (there's no resend flow yet; registering again with the
      // same email is refused as "already in use," which is intentional --
      // a genuinely stuck visitor can be unblocked from the admin side).
      redirect(`/${locale}/verify-email`);
    }

    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      include: { parentProfile: true, userRoles: { include: { role: true } } },
    });
    if (!user) {
      redirect(`/${locale}/login`);
    }

    const role: RoleType = user.userRoles[0]?.role.name ?? RoleType.PARENT;
    const name = user.parentProfile
      ? `${user.parentProfile.firstName} ${user.parentProfile.lastName}`
      : user.email;

    await createSession({ id: user.id, email: user.email, name, role, locale });

    // A trial/plan intent carried on the verification link (set when the
    // visitor registered from a pricing CTA) sends them straight into
    // checkout instead of a bare dashboard -- otherwise a verified trial
    // signup would land on an empty parent dashboard with no subscription
    // and have to go find the pricing page again themselves.
    if (planParam) {
      const trialSuffix = trialParam === "1" ? "&trial=1" : "";
      redirect(`/${locale}/parent/checkout?planId=${encodeURIComponent(planParam)}${trialSuffix}`);
    }
    redirect(`/${locale}/parent`);
  }

  const tokenValid = token ? await isVerificationTokenValid(token) : false;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {tokenValid ? dict.auth.verifyEmailTitle : dict.auth.verifyTokenInvalidTitle}
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {tokenValid ? dict.auth.verifyEmailSubtitle : dict.auth.verifyTokenInvalidMessage}
          </p>
        </div>

        {tokenValid ? (
          <form action={handleConfirm} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            {plan && <input type="hidden" name="plan" value={plan} />}
            {trial && <input type="hidden" name="trial" value={trial} />}

            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
              <MailCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs">{dict.auth.verifyEmailHint}</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white gradient-brand shadow-md shadow-brand-500/25 hover:opacity-95 transition-all"
            >
              {dict.auth.confirmEmailCta}
            </button>
          </form>
        ) : (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs">{dict.auth.verifyTokenInvalidMessage}</p>
          </div>
        )}

        <div className="text-center text-xs text-slate-500 space-y-1">
          {!tokenValid && (
            <div>
              <Link href={`/${locale}/register`} className="font-bold text-brand-600 hover:underline">
                {dict.auth.registerTitle}
              </Link>
            </div>
          )}
          <div>
            <Link href={`/${locale}/login`} className="font-bold text-brand-600 hover:underline">
              {dict.auth.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
