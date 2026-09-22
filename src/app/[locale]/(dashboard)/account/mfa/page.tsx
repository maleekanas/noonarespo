import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/database/prisma";
import { requireSession } from "@/lib/auth/currentUser";
import { decryptMfaSecret, encryptMfaSecret, generateRecoveryCodes, generateTotpSecret, otpauthUri, verifyTotp } from "@/lib/auth/mfa";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";

const FLASH = "kaa_mfa_recovery_flash";

export default async function MfaSetupPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; setup?: string; disabled?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const session = await requireSession(locale);
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) redirect(`/${locale}/login`);

  const store = await cookies();
  const recoveryFlash = store.get(FLASH)?.value;
  const recoveryCodes = recoveryFlash ? Buffer.from(recoveryFlash, "base64url").toString("utf8").split(",") : [];

const pendingSecret = user.mfaEnabled ? null : generateTotpSecret();
  const provisioning = pendingSecret ? otpauthUri(user.email, pendingSecret) : null;

  async function enable(formData: FormData) {
    "use server";
    const current = await requireSession(locale);
    const limit = await checkRateLimit(`mfa-setup:user:${current.id}`, RATE_LIMITS.MFA_SETUP_PER_USER);
    if (!limit.allowed) redirect(`/${locale}/account/mfa?error=ratelimited`);
    const secret = formData.get("secret")?.toString() || "";
    const code = formData.get("code")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";
    const freshUser = await prisma.user.findUnique({ where: { id: current.id } });
    if (!freshUser || !(await bcrypt.compare(password, freshUser.passwordHash))) redirect(`/${locale}/account/mfa?error=reauth`);
    if (!secret || !verifyTotp(secret, code)) redirect(`/${locale}/account/mfa?error=invalid`);
    const recovery = generateRecoveryCodes();
    await prisma.user.update({ where: { id: current.id }, data: {
      mfaEnabled: true, mfaSecretEncrypted: encryptMfaSecret(secret), mfaRecoveryHashes: JSON.stringify(recovery.hashes), mfaLastUsedStep: null,
    }});
    (await cookies()).set(FLASH, Buffer.from(recovery.plain.join(",")).toString("base64url"), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: `/${locale}/account/mfa`, maxAge: 300,
    });
    redirect(`/${locale}/account/mfa?setup=success`);
  }

  async function disable(formData: FormData) {
    "use server";
    const current = await requireSession(locale);
    const currentUser = await prisma.user.findUnique({ where: { id: current.id } });
    const code = formData.get("code")?.toString().trim().toUpperCase() || "";
    const password = formData.get("password")?.toString() || "";
    if (!currentUser || !(await bcrypt.compare(password, currentUser.passwordHash))) redirect(`/${locale}/account/mfa?error=reauth`);
    if (!currentUser.mfaSecretEncrypted || !verifyTotp(decryptMfaSecret(currentUser.mfaSecretEncrypted), code)) {
      redirect(`/${locale}/account/mfa?error=invalid`);
    }
    await prisma.user.update({ where: { id: current.id }, data: { mfaEnabled: false, mfaSecretEncrypted: null, mfaRecoveryHashes: null, mfaLastUsedStep: null } });
    redirect(`/${locale}/account/mfa?disabled=success`);
  }

  return <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
    <a href={`/${locale}/account`} className="text-sm font-bold text-brand-600 hover:underline">← Account settings</a>
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h1 className="text-2xl font-extrabold">Two-factor authentication</h1>
      <p className="text-sm text-slate-500 mt-2">Protect your account with a time-based authenticator app. Admin accounts are required to enable MFA.</p>
    </div>
    {query.error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">The code was invalid or too many attempts were made.</div>}
    {query.disabled === "success" && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700">Two-factor authentication has been disabled.</div>}
    {recoveryCodes.length > 0 && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
      <h2 className="font-bold">Save these recovery codes now</h2>
      <p className="text-sm">Each code works once. Store them somewhere private; they will not be shown again after this short setup window.</p>
      <div className="grid grid-cols-2 gap-2 font-mono text-sm">{recoveryCodes.map((c) => <code key={c} className="bg-white p-2 rounded border">{c}</code>)}</div>
    </div>}
    {!user.mfaEnabled && pendingSecret && <form action={enable} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
      <h2 className="font-bold">Enable MFA</h2>
      <p className="text-sm text-slate-600">Add an account manually in Google Authenticator, Microsoft Authenticator, 1Password or another TOTP app using this key:</p>
      <code className="block break-all bg-slate-50 border rounded-xl p-3">{pendingSecret}</code>
      <details className="text-xs text-slate-500"><summary>Authenticator provisioning URI</summary><code className="block break-all mt-2">{provisioning}</code></details>
      <input type="hidden" name="secret" value={pendingSecret} />
      <input name="password" type="password" required autoComplete="current-password" placeholder="Current password" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
      <input name="code" required inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
      <button className="px-5 py-3 rounded-xl text-white font-bold gradient-brand">Verify and enable</button>
    </form>}
    {user.mfaEnabled && recoveryCodes.length === 0 && <form action={disable} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
      <h2 className="font-bold text-emerald-700">MFA is enabled</h2>
      <p className="text-sm text-slate-600">To disable it, confirm your current password and authenticator code.</p>
      <input name="password" type="password" required autoComplete="current-password" placeholder="Current password" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
      <input name="code" required inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
      <button className="px-5 py-3 rounded-xl font-bold bg-slate-900 text-white">Disable MFA</button>
    </form>}
  </div>;
}
