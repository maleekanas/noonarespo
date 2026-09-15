import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getDictionary } from "@/lib/localization";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/database/prisma";
import { RoleType } from "@prisma/client";
import { GraduationCap, AlertCircle } from "lucide-react";

// There was previously NO way for a real visitor to create an account on
// this site at all -- every "Enroll now" / pricing button on the homepage,
// and the login page itself, only ever led to a credentials form with no
// path to create a new one. The only account-creation path that existed
// was a temporary, secret-gated admin route built for internal testing.
// This page is the real, public self-service registration flow: it
// creates a genuine Prisma-backed User + ParentProfile (+ PARENT role
// grant), the same way the admin test route does, then signs the new
// parent in immediately.

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; plan?: string }>;
}) {
  const { locale } = await params;
  const { error, plan } = await searchParams;
  const dict = getDictionary(locale);

  async function handleRegister(formData: FormData) {
    "use server";

    const firstName = formData.get("firstName")?.toString().trim() || "";
    const lastName = formData.get("lastName")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim().toLowerCase() || "";
    const phoneNumber = formData.get("phoneNumber")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";
    const planParam = formData.get("plan")?.toString() || "";

    const redirectWithError = (reason: string) => {
      const suffix = planParam ? `&plan=${encodeURIComponent(planParam)}` : "";
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

    await createSession({
      id: createdUser.id,
      email: createdUser.email,
      name: `${firstName} ${lastName}`,
      role: RoleType.PARENT,
      locale,
    });

    if (planParam) {
      redirect(`/${locale}/parent/checkout?planId=${encodeURIComponent(planParam)}`);
    }
    redirect(`/${locale}/parent`);
  }

  const errorMessages: Record<string, string> = {
    missing: dict.auth.invalidCredentials,
    mismatch: dict.auth.passwordMismatch,
    weak: dict.auth.weakPassword,
    inuse: dict.auth.emailInUse,
    server: dict.auth.registrationError,
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {dict.auth.registerTitle}
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {dict.auth.registerSubtitle}
          </p>
        </div>

        {error && errorMessages[error] && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessages[error]}</span>
          </div>
        )}

        <form action={handleRegister} className="space-y-4">
          {plan && <input type="hidden" name="plan" value={plan} />}

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

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white gradient-brand shadow-md shadow-brand-500/25 hover:opacity-95 transition-all mt-2"
          >
            {dict.auth.submitRegister}
          </button>
        </form>

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
