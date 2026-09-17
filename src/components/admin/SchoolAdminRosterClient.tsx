"use client";

import React, { useState } from "react";
import { Upload, CheckCircle2, KeyRound, Download } from "lucide-react";
import type { OnboardedStudentAccount } from "@/server/repositories/SchoolRepository";

type AgeGroup = "AGE_4_6" | "AGE_7_10" | "AGE_11_13" | "AGE_14_16";

interface SchoolAdminRosterClientProps {
  schoolNameEn: string;
  availableSeats: number;
  onOnboardRoster: (params: {
    students: { fullName: string; email?: string }[];
    ageGroup: AgeGroup;
  }) => Promise<{ createdAccounts: OnboardedStudentAccount[]; feedback: string }>;
}

// Same "Name" or "Name, email" per-line parser used by the super-admin's
// batch roster modal (SchoolManagementClient) -- kept local here since
// this scoped school-admin flow is a deliberately smaller component.
function parseRosterText(raw: string): { fullName: string; email?: string }[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [namePart, emailPart] = line.split(",").map((p) => p.trim());
      return emailPart ? { fullName: namePart, email: emailPart } : { fullName: namePart };
    })
    .filter((entry) => entry.fullName.length > 0);
}

function downloadCredentialsCsv(schoolNameEn: string, accounts: OnboardedStudentAccount[]) {
  const header = "Full Name,Email,Temporary Password\n";
  const rows = accounts
    .map((a) => `"${a.fullName.replace(/"/g, '""')}",${a.email},${a.tempPassword}`)
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${schoolNameEn.toLowerCase().replace(/\s+/g, "-")}-student-logins.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function SchoolAdminRosterClient({
  schoolNameEn,
  availableSeats,
  onOnboardRoster,
}: SchoolAdminRosterClientProps) {
  const [rosterText, setRosterText] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("AGE_7_10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [createdAccounts, setCreatedAccounts] = useState<OnboardedStudentAccount[]>([]);

  const parsedRoster = parseRosterText(rosterText);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (parsedRoster.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await onOnboardRoster({ students: parsedRoster, ageGroup });
      setCreatedAccounts(res.createdAccounts);
      setFeedbackMessage(res.feedback);
      setRosterText("");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "تعذر تسجيل قائمة الطلاب");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdAccounts.length > 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span>بيانات الدخول التالية لن تظهر مرة أخرى -- انسخها الآن</span>
        </div>
        <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 text-[11px] font-mono">
          {createdAccounts.map((a, i) => (
            <div key={i} className="p-2.5 flex flex-col bg-white">
              <span className="font-bold text-slate-800 font-sans">{a.fullName}</span>
              <span className="text-slate-600">{a.email}</span>
              <span className="text-brand-700">{a.tempPassword}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => downloadCredentialsCsv(schoolNameEn, createdAccounts)}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>تحميل كملف CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setCreatedAccounts([])}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            إضافة دفعة أخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
    >
      <div>
        <h3 className="text-base font-bold text-slate-900">استيراد قائمة طلاب جماعي</h3>
        <p className="text-xs text-slate-500 mt-1">
          المقاعد المتاحة حالياً: <span className="font-bold text-emerald-700">{availableSeats}</span>
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">الفئة العمرية لهذه الدفعة</label>
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
          className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="AGE_4_6">4-6</option>
          <option value="AGE_7_10">7-10</option>
          <option value="AGE_11_13">11-13</option>
          <option value="AGE_14_16">14-16</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          قائمة الطلاب (اسم واحد في كل سطر، أو: الاسم، البريد الإلكتروني)
        </label>
        <textarea
          value={rosterText}
          onChange={(e) => setRosterText(e.target.value)}
          rows={6}
          placeholder={"Ahmad Al-Amin\nSara Youssef, sara@example.com"}
          className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-brand-500"
        />
        <div className="text-[11px] text-slate-500 mt-1">
          سيتم تسجيل {parsedRoster.length} طالب/طالبة
          {parsedRoster.length > availableSeats && (
            <span className="text-rose-600 font-bold"> -- يتجاوز المقاعد المتاحة</span>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || parsedRoster.length === 0 || parsedRoster.length > availableSeats}
        className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
      >
        <Upload className="w-4 h-4" />
        <span>{isSubmitting ? "جارٍ إنشاء الحسابات..." : "تأكيد استيراد القائمة 🚀"}</span>
      </button>
    </form>
  );
}
