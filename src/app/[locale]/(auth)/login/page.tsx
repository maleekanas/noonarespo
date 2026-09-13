import React from "react";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/localization";
import { createSession } from "@/lib/auth/session";
import { authenticateCredentials } from "@/lib/auth/credentials";
import { RoleType } from "@prisma/client";
import { GraduationCap } from "lucide-react";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  async function handleLogin(formData: FormData) {
    "use server";
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const identity = await authenticateCredentials(email, password);
    if (!identity) redirect(`/${locale}/login?error=invalid_credentials`);

    await createSession({
      id: identity.id,
      email: identity.email,
      name: identity.email,
      role: identity.role,
      locale: identity.locale || locale,
    });

    if (identity.role === RoleType.STUDENT) redirect(`/${locale}/student`);
    if (identity.role === RoleType.TEACHER) redirect(`/${locale}/teacher`);
    if (
      identity.role === RoleType.SUPER_ADMIN ||
      identity.role === RoleType.SCHOOL_ADMIN ||
      identity.role === RoleType.ACADEMIC_ADMIN ||
      identity.role === RoleType.FINANCE_ADMIN
    ) redirect(`/${locale}/admin`);
    redirect(`/${locale}/parent`);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{dict.auth.signInTitle}</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">{dict.auth.signInSubtitle}</p>
        </div>

        <form action={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{dict.auth.emailLabel}</label>
            <input name="email" type="email" required autoComplete="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{dict.auth.passwordLabel}</label>
            <input name="password" type="password" required autoComplete="current-password" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start" />
          </div>
          <button type="submit" className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white gradient-brand shadow-md shadow-brand-500/25 hover:opacity-95 transition-all mt-2">
            {dict.auth.submitSignIn}
          </button>
        </form>
      </div>
    </div>
  );
}
