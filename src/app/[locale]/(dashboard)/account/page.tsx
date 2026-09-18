import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getDictionary } from "@/lib/localization";
import { requireSession } from "@/lib/auth/currentUser";
import { createSession, destroySession } from "@/lib/auth/session";
import { userRepository } from "@/server/repositories/UserRepository";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rateLimit";
import { RoleType } from "@prisma/client";
import { KeyRound, Mail, LogOut, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

/**
 * Shared, role-agnostic account settings page -- every logged-in user
 * (parent, student, teacher, any admin role, school admin) lands here from
 * their own dashboard to change their password or update their login
 * email, and to actually sign out. Before this page existed, neither of
 * those was possible without a database write: there was no in-app way to
 * change a password without first logging out and using the forgot-password
 * email flow, no way to change the email on an existing account at all, and
 * destroySession() (in src/lib/auth/session.ts) was never called from
 * anywhere in the UI -- there was no working "Sign Out" button anywhere in
 * the app.
 */
export default async function AccountSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ emailUpdated?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { emailUpdated, error } = await searchParams;
  const session = await requireSession(locale);
  const dict = getDictionary(locale);

  // Always the real current email from the database, never the (possibly
  // now-stale) one baked into the signed session cookie at login time.
  const user = await userRepository.findUserById(session.id);
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const dashboardHref = (() => {
    switch (session.role) {
      case RoleType.STUDENT:
        return `/${locale}/student`;
      case RoleType.TEACHER:
        return `/${locale}/teacher`;
      case RoleType.SCHOOL_ADMIN:
        return `/${locale}/school-admin`;
      case RoleType.SUPER_ADMIN:
      case RoleType.ACADEMIC_ADMIN:
      case RoleType.FINANCE_ADMIN:
        return `/${locale}/admin`;
      default:
        return `/${locale}/parent`;
    }
  })();

  async function handleChangeEmail(formData: FormData) {
    "use server";
    const currentSession = await requireSession(locale);
    const newEmail = formData.get("newEmail")?.toString().trim().toLowerCase() || "";

    const redirectWithError = (reason: string) => {
      redirect(`/${locale}/account?error=${reason}`);
    };

    if (!newEmail || !newEmail.includes("@")) {
      redirectWithError("invalidEmail");
    }

    const rateCheck = await checkRateLimit(
      `account-change-email:user:${currentSession.id}`,
      RATE_LIMITS.ACCOUNT_CHANGE_EMAIL_PER_USER
    );
    if (!rateCheck.allowed) {
      redirectWithError("ratelimited");
    }

    const existing = await userRepository.findUserByEmail(newEmail);
    if (existing && existing.id !== currentSession.id) {
      redirectWithError("emailInUse");
    }

    await userRepository.updateEmail(currentSession.id, newEmail);

    // Refresh the signed session cookie so the rest of the app (and this
    // page, on reload) immediately reflects the new email instead of
    // showing the old one until the next login.
    await createSession({ ...currentSession, email: newEmail });

    redirect(`/${locale}/account?emailUpdated=success`);
  }

  async function handleChangePassword(formData: FormData) {
    "use server";
    const currentSession = await requireSession(locale);
    const currentPassword = formData.get("currentPassword")?.toString() || "";
    const newPassword = formData.get("newPassword")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";

    const redirectWithError = (reason: string) => {
      redirect(`/${locale}/account?error=${reason}`);
    };

    const ip = await getClientIp();
    const [userRateCheck, ipRateCheck] = await Promise.all([
      checkRateLimit(
        `account-change-password:user:${currentSession.id}`,
        RATE_LIMITS.ACCOUNT_CHANGE_PASSWORD_PER_USER
      ),
      checkRateLimit(`account-change-password:ip:${ip}`, RATE_LIMITS.RESET_PASSWORD_SUBMIT_PER_IP),
    ]);
    if (!userRateCheck.allowed || !ipRateCheck.allowed) {
      redirectWithError("ratelimited");
    }

    if (newPassword !== confirmPassword) {
      redirectWithError("mismatch");
    }
    if (newPassword.length < 8) {
      redirectWithError("weak");
    }

    const freshUser = await userRepository.findUserById(currentSession.id);
    if (!freshUser) {
      redirect(`/${locale}/login`);
    }

    const currentPasswordOk = await bcrypt.compare(currentPassword, freshUser.passwordHash);
    if (!currentPasswordOk) {
      redirectWithError("wrongCurrentPassword");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(currentSession.id, newPasswordHash);

    // There's no server-side session table to revoke other devices from
    // (the session is a signed, stateless cookie -- see session.ts), so the
    // strongest thing we can do here is end THIS session and require a
    // fresh login with the new password, the same way changing a password
    // ends the current session on most consumer apps.
    await destroySession();
    redirect(`/${locale}/login?passwordChanged=success`);
  }

  async function handleSignOut() {
    "use server";
    await destroySession();
    redirect(`/${locale}/login`);
  }

  const errorMessages: Record<string, string> = {
    mismatch: dict.auth.passwordMismatch,
    weak: dict.auth.weakPassword,
    ratelimited: dict.auth.tooManyAttempts,
    wrongCurrentPassword: dict.account.wrongCurrentPassword,
    emailInUse: dict.auth.emailInUse,
    invalidEmail: dict.account.invalidEmail,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-2 text-xs font-bold text-brand-600">
        <Link href={dashboardHref} className="hover:underline flex items-center gap-1">
          <DirectionalIcon icon={ArrowLeft} locale={locale} className="w-3.5 h-3.5" />
          <span>{dict.account.backToDashboard}</span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">{dict.account.title}</h1>
        <p className="text-xs text-slate-500 mt-1">{dict.account.subtitle}</p>
      </div>

      {error && errorMessages[error] && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessages[error]}</span>
        </div>
      )}

      {emailUpdated === "success" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{dict.account.emailUpdatedMessage}</span>
        </div>
      )}

      {/* Change Email */}
      <form
        action={handleChangeEmail}
        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
      >
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Mail className="w-4 h-4 text-brand-600" />
          <span>{dict.account.emailSectionTitle}</span>
        </h2>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {dict.account.currentEmailLabel}
          </label>
          <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 text-start">
            {user.email}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {dict.account.newEmailLabel}
          </label>
          <input
            name="newEmail"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
          />
        </div>

        <button
          type="submit"
          className="py-2.5 px-5 rounded-xl text-sm font-bold text-white gradient-brand shadow-md shadow-brand-500/25 hover:opacity-95 transition-all"
        >
          {dict.account.updateEmailButton}
        </button>
      </form>

      {/* Change Password */}
      <form
        action={handleChangePassword}
        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
      >
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-brand-600" />
          <span>{dict.account.passwordSectionTitle}</span>
        </h2>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {dict.account.currentPasswordLabel}
          </label>
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {dict.auth.newPasswordLabel}
          </label>
          <input
            name="newPassword"
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
          className="py-2.5 px-5 rounded-xl text-sm font-bold text-white gradient-brand shadow-md shadow-brand-500/25 hover:opacity-95 transition-all"
        >
          {dict.account.updatePasswordButton}
        </button>
        <p className="text-[11px] text-slate-400">{dict.account.passwordChangeSignsOutNotice}</p>
      </form>

      {/* Two-factor authentication */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><KeyRound className="w-4 h-4 text-brand-600" /><span>Two-factor authentication</span></h2>
        <p className="text-xs text-slate-500">Add an authenticator app and recovery codes for stronger account protection. MFA is mandatory for platform-wide admin roles.</p>
        <Link href={`/${locale}/account/mfa`} className="inline-flex py-2.5 px-5 rounded-xl text-sm font-bold text-white gradient-brand">Manage MFA</Link>
      </div>

      {/* Sign Out */}
      <form action={handleSignOut} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <button
          type="submit"
          className="w-full py-2.5 px-5 rounded-xl text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{dict.account.signOutButton}</span>
        </button>
      </form>
    </div>
  );
}
