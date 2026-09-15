import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/localization";
import { prisma } from "@/lib/database/prisma";
import { createPasswordResetToken } from "@/lib/auth/passwordReset";
import { notificationDispatcherService } from "@/server/services/NotificationDispatcherService";
import { GraduationCap, Mail, CheckCircle2 } from "lucide-react";

// The account-recovery flow that didn't exist before: a parent (or teacher/
// admin) who forgets their password previously had no way back into an
// account holding a paid subscription and a child's data. This page always
// shows the same "check your email" response whether or not the address is
// registered, so it can't be used to discover which emails have accounts.

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sent?: string }>;
}) {
  const { locale } = await params;
  const { sent } = await searchParams;
  const dict = getDictionary(locale);

  async function handleForgotPassword(formData: FormData) {
    "use server";
    const email = formData.get("email")?.toString().trim().toLowerCase() || "";

    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { studentProfile: true, parentProfile: true, teacherProfile: true, adminProfile: true },
      });

      if (user && user.status === "ACTIVE") {
        const name =
          (user.parentProfile && `${user.parentProfile.firstName} ${user.parentProfile.lastName}`) ||
          (user.teacherProfile && `${user.teacherProfile.firstName} ${user.teacherProfile.lastName}`) ||
          (user.studentProfile && `${user.studentProfile.firstName} ${user.studentProfile.lastName}`) ||
          (user.adminProfile && `${user.adminProfile.firstName} ${user.adminProfile.lastName}`) ||
          user.email;

        const rawToken = await createPasswordResetToken(user.id);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.arabickidsacademy.com";
        const resetUrl = `${siteUrl}/${locale}/reset-password?token=${rawToken}`;

        await notificationDispatcherService.dispatch("EMAIL", {
          recipientContact: user.email,
          recipientName: name,
          eventName: "PASSWORD_RESET",
          titleAr: "إعادة تعيين كلمة المرور",
          bodyAr: `مرحباً ${name}، لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. اضغط على الزر أدناه لاختيار كلمة مرور جديدة. هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة بأمان.`,
          actionUrl: resetUrl,
        });
      }
      // Same redirect whether or not `user` was found/active -- no enumeration signal.
    }

    redirect(`/${locale}/forgot-password?sent=1`);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {dict.auth.forgotPasswordTitle}
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {dict.auth.forgotPasswordSubtitle}
          </p>
        </div>

        {sent === "1" ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{dict.auth.resetEmailSentTitle}</p>
              <p className="text-xs mt-1 text-emerald-700">{dict.auth.resetEmailSentMessage}</p>
            </div>
          </div>
        ) : (
          <form action={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {dict.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="parent.tariq@example.com"
                  className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white gradient-brand shadow-md shadow-brand-500/25 hover:opacity-95 transition-all mt-2"
            >
              {dict.auth.submitForgotPassword}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500">
          <Link href={`/${locale}/login`} className="font-bold text-brand-600 hover:underline">
            {dict.auth.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}
