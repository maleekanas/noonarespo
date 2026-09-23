import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getDictionary } from "@/lib/localization";
import { prisma } from "@/lib/database/prisma";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rateLimit";
import { createEmailVerificationToken } from "@/lib/auth/emailVerification";
import { notificationDispatcherService } from "@/server/services/NotificationDispatcherService";
import { RoleType, UserStatus } from "@prisma/client";
import { GraduationCap, AlertCircle, MailCheck } from "lucide-react";

// There was previously NO way for a real visitor to create an account on
// this site at all -- every "Enroll now" / pricing button on the homepage,
// and the login page itself, only ever led to a credentials form with no
// path to create a new one. The only account-creation path that existed
// was a temporary, secret-gated admin route built for internal testing.
// This page is the real, public self-service registration flow: it
// creates a genuine Prisma-backed User + ParentProfile (+ PARENT role
// grant), same as the admin test route did -- except the account now
// starts PENDING_VERIFICATION and must confirm its email (see
// verify-email/page.tsx) before it can sign in at all, rather than being
// signed in immediately. This matters most for the public 1-day free
// trial: a trial is only worth offering with no friction if it can't also
// be farmed with disposable/fake addresses.

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; plan?: string; trial?: string; sent?: string }>;
}) {
  const { locale } = await params;
  const { error, plan, trial, sent } = await searchParams;
  const dict = getDictionary(locale);
  const isTrialSignup = trial === "1";

  async function handleRegister(formData: FormData) {
    "use server";

    const firstName = formData.get("firstName")?.toString().trim() || "";
    const lastName = formData.get("lastName")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim().toLowerCase() || "";
    const phoneNumber = formData.get("phoneNumber")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";
    const planParam = formData.get("plan")?.toString() || "";
    const trialParam = formData.get("trial")?.toString() || "";

    const redirectWithError = (reason: string) => {
      const suffix =
        (planParam ? `&plan=${encodeURIComponent(planParam)}` : "") +
        (trialParam === "1" ? "&trial=1" : "");
      redirect(`/${locale}/register?error=${reason}${suffix}`);
    };

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      redirectWithError("missing");
    }

    if (password !== confirmPassword) {
      redirectWithError("mismatch");
    }

    if (password.length < 8) {
      redirectWithError("weak");
    }

    // Per-IP only (there's no existing account to key a per-email limit
    // against yet) -- caps mass fake-account creation from a single source.
    const ip = await getClientIp();
    const ipCheck = await checkRateLimit(`register:ip:${ip}`, RATE_LIMITS.REGISTER_PER_IP);
    if (!ipCheck.allowed) {
      redirectWithError("ratelimited");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      redirectWithError("inuse");
    }

    const parentRole = await prisma.role.findUnique({
      where: { name: RoleType.PARENT },
    });

    if (!parentRole) {
      // Should never happen against the real, seeded database -- but fail
      // safely with a plain error rather than a crash if it ever does.
      redirectWithError("server");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        localePreference: locale,
        status: UserStatus.PENDING_VERIFICATION,
        parentProfile: {
          create: {
            firstName,
            lastName,
            phoneNumber,
          },
        },
      },
      include: { parentProfile: true },
    });

    await prisma.userRole.create({
      data: { userId: createdUser.id, roleId: parentRole.id },
    });

    const rawToken = await createEmailVerificationToken(createdUser.id);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.arabickidsacademy.com";
    const planSuffix = planParam ? `&plan=${encodeURIComponent(planParam)}` : "";
    const trialSuffix = trialParam === "1" ? "&trial=1" : "";
    const verifyUrl = `${siteUrl}/${locale}/verify-email?token=${rawToken}${planSuffix}${trialSuffix}`;

    const dispatchResult = await notificationDispatcherService.dispatch("EMAIL", {
      recipientContact: email,
      recipientName: `${firstName} ${lastName}`,
      eventName: "EMAIL_VERIFICATION",
      titleAr: trialParam === "1" ? "أكّد بريدك الإلكتروني لبدء تجربتك المجانية ليوم واحد" : "أكّد بريدك الإلكتروني",
      bodyAr: `مرحباً ${firstName}، شكراً لتسجيلك في أكاديمية الأطفال العرب. اضغط على الزر أدناه لتأكيد بريدك الإلكتروني وتفعيل حسابك. هذا الرابط صالح لمدة 24 ساعة.`,
      actionUrl: verifyUrl,
    });

    if (!dispatchResult.isDelivered) {
      console.error("[Register] Verification email failed to send", {
        email,
        statusMessage: dispatchResult.statusMessage,
      });
      // Without this check, the visitor is shown a false "Check Your
      // Email" success screen even though no email actually went out --
      // and since the account already exists as PENDING_VERIFICATION,
      // they'd be permanently stuck (retrying registration would just
      // fail with "email already in use"). Roll the account back so a
      // retry a few minutes later works cleanly instead.
      await prisma.user.delete({ where: { id: createdUser.id } }).catch(() => {});
      redirectWithError("emailFailed");
    }

    // No session is created here -- the account is PENDING_VERIFICATION
    // and can't sign in (see login/page.tsx's status check) until the
    // email link above is confirmed.
    const sentSuffix =
      (planParam ? `&plan=${encodeURIComponent(planParam)}` : "") +
      (trialParam === "1" ? "&trial=1" : "");
    redirect(`/${locale}/register?sent=1${sentSuffix}`);
  }

  const errorMessages: Record<string, string> = {
    missing: dict.auth.invalidCredentials,
    mismatch: dict.auth.passwordMismatch,
    weak: dict.auth.weakPassword,
    inuse: dict.auth.emailInUse,
    server: dict.auth.registrationError,
    ratelimited: dict.auth.tooManyAttempts,
    emailFailed: dict.auth.registrationEmailFailed,
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isTrialSignup ? dict.auth.trialRegisterTitle : dict.auth.registerTitle}
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {isTrialSignup ? dict.auth.trialRegisterSubtitle : dict.auth.registerSubtitle}
          </p>
        </div>

        {isTrialSignup && sent !== "1" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 font-semibold">
            {dict.auth.trialRegisterBanner}
          </div>
        )}

        {sent === "1" ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
            <MailCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{dict.auth.verifyEmailSentTitle}</p>
              <p className="text-xs mt-1 text-emerald-700">{dict.auth.verifyEmailSentMessage}</p>
            </div>
          </div>
        ) : (
        <>
        {error && errorMessages[error] && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessages[error]}</span>
          </div>
        )}

        <form action={handleRegister} className="space-y-4">
          {plan && <input type="hidden" name="plan" value={plan} />}
          {isTrialSignup && <input type="hidden" name="trial" value="1" />}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {dict.auth.firstNameLabel}
              </label>
              <input
                name="firstName"
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {dict.auth.lastNameLabel}
              </label>
              <input
                name="lastName"
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {dict.auth.emailLabel}
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {dict.auth.phoneLabel}
            </label>
            <input
              name="phoneNumber"
              type="tel"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {dict.auth.passwordLabel}
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {dict.auth.confirmPasswordLabel}
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
            />
          </div>

          <p className="text-[11px] leading-relaxed text-slate-500 text-center">
            {dict.auth.termsAgreementPrefix}{" "}
            <Link href={`/${locale}/terms`} className="font-bold text-brand-600 hover:underline">
              {dict.auth.termsOfServiceLink}
            </Link>{" "}
            {dict.auth.termsAgreementConnector}{" "}
            <Link href={`/${locale}/privacy`} className="font-bold text-brand-600 hover:underline">
              {dict.auth.privacyPolicyLink}
            </Link>
            {dict.auth.termsAgreementSuffix}
          </p>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white gradient-brand shadow-md shadow-brand-500/25 hover:opacity-95 transition-all mt-2"
          >
            {dict.auth.submitRegister}
          </button>
        </form>
        </>
        )}

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>{dict.auth.alreadyHaveAccount} </span>
          <Link href={`/${locale}/login`} className="font-bold text-brand-600 hover:underline">
            {dict.auth.signInLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
