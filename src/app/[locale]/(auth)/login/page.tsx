import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getDictionary } from "@/lib/localization";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/database/prisma";
import { RoleType } from "@prisma/client";
import { Sparkles, GraduationCap, AlertCircle } from "lucide-react";

const SHOW_DEMO_HELPERS = process.env.NEXT_PUBLIC_HIDE_DEMO_SWITCHER !== "true";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  const dict = getDictionary(locale);

  async function handleLogin(formData: FormData) {
    "use server";
    const email = formData.get("email")?.toString().trim().toLowerCase() || "";
    const password = formData.get("password")?.toString() || "";

    if (!email || !password) {
      redirect(`/${locale}/login?error=invalid`);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: { include: { role: true } },
        studentProfile: true,
        parentProfile: true,
        teacherProfile: true,
        adminProfile: true,
      },
    });

    // Same generic error for "no such user" and "wrong password" so the
    // response can't be used to enumerate which emails are registered.
    if (!user || user.status !== "ACTIVE") {
      redirect(`/${locale}/login?error=invalid`);
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      redirect(`/${locale}/login?error=invalid`);
    }

    const role: RoleType = user.userRoles[0]?.role.name ?? RoleType.PARENT;
    const name =
      (user.teacherProfile && `${user.teacherProfile.firstName} ${user.teacherProfile.lastName}`) ||
      (user.studentProfile && `${user.studentProfile.firstName} ${user.studentProfile.lastName}`) ||
      (user.parentProfile && `${user.parentProfile.firstName} ${user.parentProfile.lastName}`) ||
      (user.adminProfile && `${user.adminProfile.firstName} ${user.adminProfile.lastName}`) ||
      user.email;

    await createSession({
      id: user.id,
      email: user.email,
      name,
      role,
      locale,
    });

    if (role === RoleType.STUDENT) {
      redirect(`/${locale}/student`);
    } else if (role === RoleType.TEACHER) {
      redirect(`/${locale}/teacher`);
    } else if (role === RoleType.SUPER_ADMIN || role === RoleType.SCHOOL_ADMIN || role === RoleType.ACADEMIC_ADMIN) {
      redirect(`/${locale}/admin`);
    } else if (role === RoleType.FINANCE_ADMIN) {
      redirect(`/${locale}/admin`);
    } else {
      redirect(`/${locale}/parent`);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {dict.auth.signInTitle}
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {dict.auth.signInSubtitle}
          </p>
        </div>

        {error === "invalid" && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{dict.auth.invalidCredentials ?? "Incorrect email or password."}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form action={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {dict.auth.emailLabel}
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="parent.tariq@example.com"
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
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white gradient-brand shadow-md shadow-brand-500/25 hover:opacity-95 transition-all mt-2"
          >
            {dict.auth.submitSignIn}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          <span>{dict.auth.noAccount} </span>
          <Link href={`/${locale}/register`} className="font-bold text-brand-600 hover:underline">
            {dict.auth.registerNow}
          </Link>
        </div>

        {/* Fast Development Personas — never rendered when
            NEXT_PUBLIC_HIDE_DEMO_SWITCHER=true (set in Production). Buttons
            submit the real seeded demo password so they still pass the
            credential check above instead of bypassing it. */}
        {SHOW_DEMO_HELPERS && (
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{dict.auth.demoAccountsTitle} (dev/staging only)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <form action={handleLogin}>
                <input type="hidden" name="email" value="parent.tariq@example.com" />
                <input type="hidden" name="password" value="Password123!" />
                <button
                  type="submit"
                  className="w-full p-2.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold border border-blue-200 text-center transition-colors"
                >
                  {locale === "ar" ? "👨‍👧 ولي أمر (Parent)" : `👨‍👧 ${dict.roles.parent}`}
                </button>
              </form>

              <form action={handleLogin}>
                <input type="hidden" name="email" value="zayd@kidsarabicacademy.internal" />
                <input type="hidden" name="password" value="Password123!" />
                <button
                  type="submit"
                  className="w-full p-2.5 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 font-semibold border border-purple-200 text-center transition-colors"
                >
                  {locale === "ar" ? "🎒 طالب (Student)" : `🎒 ${dict.roles.student}`}
                </button>
              </form>

              <form action={handleLogin}>
                <input type="hidden" name="email" value="ustadh.ahmed@kidsarabicacademy.internal" />
                <input type="hidden" name="password" value="Password123!" />
                <button
                  type="submit"
                  className="w-full p-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold border border-emerald-200 text-center transition-colors"
                >
                  {locale === "ar" ? "👨‍🏫 معلّم (Teacher)" : `👨‍🏫 ${dict.roles.teacher}`}
                </button>
              </form>

              <form action={handleLogin}>
                <input type="hidden" name="email" value="superadmin@kidsarabicacademy.internal" />
                <input type="hidden" name="password" value="Password123!" />
                <button
                  type="submit"
                  className="w-full p-2.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold border border-amber-200 text-center transition-colors"
                >
                  {locale === "ar" ? "⚡ مدير (Admin)" : `⚡ ${dict.roles.admin}`}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
