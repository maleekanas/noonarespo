import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getDictionary } from "@/lib/localization";
import { prisma } from "@/lib/database/prisma";
import { isResetTokenValid, verifyAndConsumeResetToken } from "@/lib/auth/passwordReset";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rateLimit";
import { GraduationCap, AlertCircle, XCircle } from "lucide-react";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { token, error } = await searchParams;
  const dict = getDictionary(locale);

  async function handleResetPassword(formData: FormData) {
    "use server";
    const rawToken = formData.get("token")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";

    const redirectWithError = (reason: string) => {
      redirect(`/${locale}/reset-password?token=${encodeURIComponent(rawToken)}&error=${reason}`);
    };

    if (!rawToken) {
      redirect(`/${locale}/forgot-password`);
    }

    // Tokens are 32 random bytes, so brute-forcing one is already
    // impractical -- this is defense in depth plus a cap on how hard this
    // endpoint can be hammered generally.
    const ip = await getClientIp();
    const ipCheck = await checkRateLimit(
      `reset-password-submit:ip:${ip}`,
      RATE_LIMITS.RESET_PASSWORD_SUBMIT_PER_IP
    );
    if (!ipCheck.allowed) {
      redirectWithError("ratelimited");
    }

    if (password !== confirmPassword) {
      redirectWithError("mismatch");
    }

    if (password.length < 8) {
      redirectWithError("weak");
    }

    const result = await verifyAndConsumeResetToken(rawToken);
    if (!result) {
      // Token was invalid/expired/already used -- send to the plain
      // (tokenless) URL so the page renders the "request a new link" state.
      redirect(`/${locale}/reset-password`);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: result.userId },
      data: { passwordHash },
    });

    redirect(`/${locale}/login?reset=success`);
  }

  const tokenValid = token ? await isResetTokenValid(token) : false;

  const errorMessages: Record<string, string> = {
    mismatch: dict.auth.passwordMismatch,
    weak: dict.auth.weakPassword,
    ratelimited: dict.auth.tooManyAttempts,
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {tokenValid ? dict.auth.resetPasswordTitle : dict.auth.resetTokenInvalidTitle}
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {tokenValid ? dict.auth.resetPasswordSubtitle : dict.auth.resetTokenInvalidMessage}
          </p>
        </div>

        {tokenValid ? (
          <>
            {error && errorMessages[error] && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessages[error]}</span>
              </div>
            )}

            <form action={handleResetPassword} className="space-y-4">
              <input type="hidden" name="token" value={token} />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {dict.auth.newPasswordLabel}
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
                  {dict.auth.confirmNewPasswordLabel}
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

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white gradient-brand shadow-md shadow-brand-500/25 hover:opacity-95 transition-all mt-2"
              >
                {dict.auth.submitResetPassword}
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs">{dict.auth.resetTokenInvalidMessage}</p>
          </div>
        )}

        <div className="text-center text-xs text-slate-500 space-y-1">
          {!tokenValid && (
            <div>
              <Link href={`/${locale}/forgot-password`} className="font-bold text-brand-600 hover:underline">
                {dict.auth.forgotPasswordTitle}
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
