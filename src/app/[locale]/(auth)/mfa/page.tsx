import { redirect } from "next/navigation";
import { RoleType } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";
import { createSession } from "@/lib/auth/session";
import { clearMfaChallenge, consumeMfaChallenge, decryptMfaSecret, hashRecoveryCode, verifyTotpStep } from "@/lib/auth/mfa";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rateLimit";

export default async function MfaChallengePage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  const challengeUserId = await consumeMfaChallenge();
  if (!challengeUserId) redirect(`/${locale}/login`);

  async function verify(formData: FormData) {
    "use server";
    const userId = await consumeMfaChallenge();
    if (!userId) redirect(`/${locale}/login`);
    const ip = await getClientIp();
    const limit = await checkRateLimit(`mfa:ip:${ip}`, RATE_LIMITS.MFA_CHALLENGE_PER_IP);
    if (!limit.allowed) redirect(`/${locale}/mfa?error=ratelimited`);

    const code = (formData.get("code")?.toString() || "").trim().toUpperCase();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } }, studentProfile: true, parentProfile: true, teacherProfile: true, adminProfile: true },
    });
    if (!user || !user.mfaEnabled || !user.mfaSecretEncrypted || user.status !== "ACTIVE") {
      await clearMfaChallenge();
      redirect(`/${locale}/login`);
    }

    let accepted = false;
    const totpStep = verifyTotpStep(decryptMfaSecret(user.mfaSecretEncrypted), code);
    if (totpStep !== null) {
      const claimed = await prisma.user.updateMany({
        where: {
          id: user.id,
          OR: [{ mfaLastUsedStep: null }, { mfaLastUsedStep: { lt: totpStep } }],
        },
        data: { mfaLastUsedStep: totpStep },
      });
      accepted = claimed.count === 1;
    }
    if (!accepted && user.mfaRecoveryHashes) {
      const hashes = JSON.parse(user.mfaRecoveryHashes) as string[];
      const candidate = hashRecoveryCode(code);
      const index = hashes.indexOf(candidate);
      if (index >= 0) {
        hashes.splice(index, 1);
        await prisma.user.update({ where: { id: user.id }, data: { mfaRecoveryHashes: JSON.stringify(hashes) } });
        accepted = true;
      }
    }
    if (!accepted) redirect(`/${locale}/mfa?error=invalid`);

    const role: RoleType = user.userRoles[0]?.role.name ?? RoleType.PARENT;
    const name =
      (user.teacherProfile && `${user.teacherProfile.firstName} ${user.teacherProfile.lastName}`) ||
      (user.studentProfile && `${user.studentProfile.firstName} ${user.studentProfile.lastName}`) ||
      (user.parentProfile && `${user.parentProfile.firstName} ${user.parentProfile.lastName}`) ||
      (user.adminProfile && `${user.adminProfile.firstName} ${user.adminProfile.lastName}`) || user.email;

    await createSession({ id: user.id, email: user.email, name, role, locale });
    await clearMfaChallenge();
    if (role === RoleType.STUDENT) redirect(`/${locale}/student`);
    if (role === RoleType.TEACHER) redirect(`/${locale}/teacher`);
    if (role === RoleType.SCHOOL_ADMIN) redirect(`/${locale}/school-admin`);
    if ([RoleType.SUPER_ADMIN, RoleType.ACADEMIC_ADMIN, RoleType.FINANCE_ADMIN].includes(role)) redirect(`/${locale}/admin`);
    redirect(`/${locale}/parent`);
  }

  return <div className="min-h-[75vh] flex items-center justify-center px-4">
    <form action={verify} className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-5">
      <div><h1 className="text-2xl font-extrabold text-slate-900">Two-factor authentication</h1>
      <p className="text-sm text-slate-500 mt-2">Enter the 6-digit code from your authenticator app, or one unused recovery code.</p></div>
      {error && <p className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error === "ratelimited" ? "Too many attempts. Please try again later." : "That verification code is not valid."}</p>}
      <input name="code" required autoComplete="one-time-code" inputMode="numeric" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center tracking-[0.3em] font-mono" aria-label="Authentication code" />
      <button className="w-full py-3 rounded-xl text-white font-bold gradient-brand">Verify and sign in</button>
    </form>
  </div>;
}
