"use client";

import React, { useState } from "react";
import { Upload, CheckCircle2, KeyRound, Download, School, Printer, ShieldCheck } from "lucide-react";
import type { OnboardedStudentAccount } from "@/server/repositories/SchoolRepository";

type AgeGroup = "AGE_4_6" | "AGE_7_10" | "AGE_11_13" | "AGE_14_16";

interface SchoolAdminRosterClientProps {
  schoolNameEn: string;
  availableSeats: number;
  classes?: { id: string; name: string }[];
  onOnboardRoster: (params: {
    students: { fullName: string; email?: string }[];
    ageGroup: AgeGroup;
    classGroupId?: string;
  }) => Promise<{ createdAccounts: OnboardedStudentAccount[]; feedback: string }>;
}

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
  const header = "Full Name,Email,Temporary Password,Class Group\n";
  const rows = accounts
    .map(
      (a) =>
        `"${a.fullName.replace(/"/g, '""')}",${a.email},${a.tempPassword},"${(a.className || "Unassigned").replace(/"/g, '""')}"`
    )
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
  classes = [],
  onOnboardRoster,
}: SchoolAdminRosterClientProps) {
  const [rosterText, setRosterText] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("AGE_7_10");
  const [selectedClassGroupId, setSelectedClassGroupId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [createdAccounts, setCreatedAccounts] = useState<OnboardedStudentAccount[]>([]);
  const [showPrintCards, setShowPrintCards] = useState(false);

  const parsedRoster = parseRosterText(rosterText);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (parsedRoster.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await onOnboardRoster({
        students: parsedRoster,
        ageGroup,
        classGroupId: selectedClassGroupId || undefined,
      });
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
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>بيانات الدخول تم إنشاؤها بنجاح (حسابات حقيقية + فصول مخصصة)</span>
          </div>
          <button
            type="button"
            onClick={() => setShowPrintCards(!showPrintCards)}
            className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-bold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{showPrintCards ? "إخفاء بطاقات التوزيع" : "عرض بطاقات التوزيع للطباعة"}</span>
          </button>
        </div>

        {showPrintCards ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
            {createdAccounts.map((a, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{a.fullName}</span>
                  <span className="text-[10px] bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
                    {a.className || "طالب المؤسسة"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <div>البريد: <span className="font-mono text-slate-900">{a.email}</span></div>
                  <div>كلمة المرور المؤقتة: <span className="font-mono font-bold text-brand-700">{a.tempPassword}</span></div>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Arabic Kids Academy - Institutional Portal</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 text-[11px] font-mono">
            {createdAccounts.map((a, i) => (
              <div key={i} className="p-2.5 flex items-center justify-between bg-white">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 font-sans">{a.fullName}</span>
                  <span className="text-slate-600">{a.email}</span>
                </div>
                <div className="text-end">
                  <div className="text-brand-700 font-bold">{a.tempPassword}</div>
                  {a.className && (
                    <span className="text-[10px] text-slate-400 font-sans">{a.className}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => downloadCredentialsCsv(schoolNameEn, createdAccounts)}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تحميل بيانات الدخول (CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCreatedAccounts([]);
              setShowPrintCards(false);
            }}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
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
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-brand-600" />
          <span>استيراد قائمة طلاب جماعية (Bulk Roster)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          المقاعد المرخصة المتاحة حالياً: <span className="font-bold text-emerald-700">{availableSeats}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">الفئة العمرية لهذه الدفعة</label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="AGE_4_6">4-6 سنوات (البراعم)</option>
            <option value="AGE_7_10">7-10 سنوات (المستكشفون)</option>
            <option value="AGE_11_13">11-13 سنة (الرواد)</option>
            <option value="AGE_14_16">14-16 سنة (الفرسان)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            إلحاق الطلاب بفصل محدد (اختياري)
          </label>
          <select
            value={selectedClassGroupId}
            onChange={(e) => setSelectedClassGroupId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">بدون تعيين فصل (توزيع لاحق)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          قائمة الطلاب (اسم واحد في كل سطر، أو: الاسم، البريد الإلكتروني)
        </label>
        <textarea
          value={rosterText}
          onChange={(e) => setRosterText(e.target.value)}
          rows={6}
          placeholder={"Ahmad Al-Amin\nSara Youssef, sara@example.com\nOmar Al-Farooq"}
          className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-brand-500"
        />
        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
          <span>
            سيتم تسجيل <strong className="text-slate-800">{parsedRoster.length}</strong> طالب/طالبة وتوليد حسابات حقيقية فورية
          </span>
          {parsedRoster.length > availableSeats && (
            <span className="text-rose-600 font-bold">يتجاوز المقاعد المتاحة ({availableSeats})</span>
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
        <span>{isSubmitting ? "جارٍ إنشاء الحسابات وتسجيل الفصول..." : "تأكيد استيراد القائمة وتوليد الحسابات 🚀"}</span>
      </button>
    </form>
  );
}
