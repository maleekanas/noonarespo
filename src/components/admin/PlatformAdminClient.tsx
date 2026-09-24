"use client";

import React, { useState } from "react";
import { UserPlus, KeyRound, CheckCircle2, X, Power, ShieldCheck, Crown } from "lucide-react";

export interface PlatformAdminRow {
  userId: string;
  fullName: string;
  email: string;
  scope: "SUPER_ADMIN" | "ACADEMIC_ADMIN" | "FINANCE_ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "DELETED" | string;
  createdAt: string;
}

interface PlatformAdminClientProps {
  initialAdmins: PlatformAdminRow[];
  currentAdminUserId: string;
  locale: string;
  onCreate: (params: {
    fullName: string;
    email?: string;
    role: "ACADEMIC_ADMIN" | "FINANCE_ADMIN";
  }) => Promise<{
    account: { fullName: string; email: string; tempPassword: string } | null;
    error: string | null;
  }>;
  onToggleStatus: (
    userId: string,
    newStatus: "ACTIVE" | "SUSPENDED"
  ) => Promise<{ success: boolean; error: string | null }>;
}

const SCOPE_LABELS: Record<string, { ar: string; en: string }> = {
  SUPER_ADMIN: { ar: "مدير عام (صلاحيات كاملة)", en: "Super Admin (Full Access)" },
  ACADEMIC_ADMIN: { ar: "مدير أكاديمي (محدود)", en: "Academic Admin (Limited)" },
  FINANCE_ADMIN: { ar: "مدير مالي (محدود)", en: "Finance Admin (Limited)" },
};

/**
 * Role Management UI: creates a second, limited admin account
 * (ACADEMIC_ADMIN or FINANCE_ADMIN) and lets a super admin activate or
 * suspend any platform admin account other than their own. This is a
 * client component -- like SchoolManagementClient before it -- because the
 * one-time temporary password has to be shown back to the admin in the
 * page itself, never appended to a redirect URL where it would sit in
 * browser history/logs.
 */
export function PlatformAdminClient({
  initialAdmins,
  currentAdminUserId,
  locale,
  onCreate,
  onToggleStatus,
}: PlatformAdminClientProps) {
  const isAr = locale === "ar";
  const [admins, setAdmins] = useState<PlatformAdminRow[]>(initialAdmins);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ACADEMIC_ADMIN" | "FINANCE_ADMIN">("ACADEMIC_ADMIN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<{
    fullName: string;
    email: string;
    tempPassword: string;
  } | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await onCreate({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        role,
      });
      if (result.error || !result.account) {
        setErrorMessage(result.error || (isAr ? "تعذر إنشاء الحساب." : "Failed to create the account."));
        return;
      }
      setCreatedAccount(result.account);
      setAdmins((prev) => [
        ...prev,
        {
          userId: `pending-${Date.now()}`,
          fullName: result.account!.fullName,
          email: result.account!.email,
          scope: role,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        },
      ]);
      setFullName("");
      setEmail("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(userId: string, currentStatus: string) {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setTogglingUserId(userId);
    setErrorMessage(null);
    try {
      const result = await onToggleStatus(userId, newStatus);
      if (!result.success) {
        setErrorMessage(result.error || (isAr ? "تعذر تحديث حالة الحساب." : "Failed to update account status."));
        return;
      }
      setAdmins((prev) => prev.map((a) => (a.userId === userId ? { ...a, status: newStatus } : a)));
    } finally {
      setTogglingUserId(null);
    }
  }

  return (
    <div className="space-y-5 text-xs">
      {createdAccount && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? "تم إنشاء الحساب بنجاح" : "Account created successfully"}</span>
            </span>
            <button
              type="button"
              onClick={() => setCreatedAccount(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="font-mono bg-white rounded-xl border border-emerald-200 p-3 space-y-1">
            <div>
              <span className="text-slate-500">{isAr ? "البريد الإلكتروني: " : "Email: "}</span>
              <span className="font-bold text-slate-900">{createdAccount.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-500">{isAr ? "كلمة المرور المؤقتة: " : "Temporary password: "}</span>
              <span className="font-bold text-slate-900">{createdAccount.tempPassword}</span>
            </div>
          </div>
          <p className="text-emerald-800">
            {isAr
              ? "شارك هذه البيانات بأمان مع صاحب الحساب الجديد. لن تظهر كلمة المرور مرة أخرى."
              : "Share these credentials securely with the new admin. This password will not be shown again."}
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <div>
          <label className="font-bold text-slate-700 block mb-1">{isAr ? "الاسم الكامل" : "Full Name"}</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
            placeholder={isAr ? "مثال: سارة أحمد" : "e.g. Sarah Ahmed"}
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            {isAr ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 font-mono"
            placeholder="sarah@example.com"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="font-bold text-slate-700 block mb-1">{isAr ? "نطاق الصلاحية" : "Access Scope"}</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "ACADEMIC_ADMIN" | "FINANCE_ADMIN")}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
          >
            <option value="ACADEMIC_ADMIN">
              {isAr ? "مدير أكاديمي — المنهج، الفصول، الجدول، التقييمات، التقارير" : "Academic Admin — curriculum, classes, schedule, reviews, reports"}
            </option>
            <option value="FINANCE_ADMIN">
              {isAr ? "مدير مالي — المالية، تصدير البيانات، التقارير" : "Finance Admin — finance, data export, reports"}
            </option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? (isAr ? "جارٍ الإنشاء..." : "Creating...") : (isAr ? "إنشاء حساب إداري محدود" : "Create Limited Admin Account")}</span>
          </button>
        </div>
      </form>

      <div className="divide-y divide-slate-100">
        {admins.length === 0 ? (
          <div className="py-6 text-center text-slate-400">
            {isAr ? "لا يوجد حسابات إدارية أخرى بعد" : "No other admin accounts yet"}
          </div>
        ) : (
          admins.map((a) => {
            const isSelf = a.userId === currentAdminUserId;
            const isActive = a.status === "ACTIVE";
            const label = SCOPE_LABELS[a.scope] || { ar: a.scope, en: a.scope };
            return (
              <div key={a.userId} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    {a.scope === "SUPER_ADMIN" ? (
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                    )}
                    <span className="font-bold text-slate-900">{a.fullName}</span>
                    {isSelf && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">
                        {isAr ? "أنت" : "You"}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono block">{a.email}</span>
                  <span className="text-slate-500 block">{isAr ? label.ar : label.en}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${
                      isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {isActive ? (isAr ? "نشط" : "Active") : (isAr ? "موقوف" : "Suspended")}
                  </span>
                  {!isSelf && (
                    <button
                      type="button"
                      onClick={() => handleToggle(a.userId, a.status)}
                      disabled={togglingUserId === a.userId}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold border transition-colors disabled:opacity-60 ${
                        isActive
                          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{isActive ? (isAr ? "إيقاف" : "Suspend") : (isAr ? "تفعيل" : "Activate")}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
