"use client";

import React, { useState } from "react";
import { Download, Search, CheckCircle2, User, BookOpen, CalendarCheck } from "lucide-react";

export interface StudentAttendanceRow {
  studentId: string;
  fullName: string;
  email: string;
  ageGroup: string;
  className: string;
  attendanceRatePercentage: number;
  totalSessionsAttended: number;
  totalSessionsHeld: number;
  status: string;
}

interface SchoolAdminAttendanceClientProps {
  schoolNameEn: string;
  students: StudentAttendanceRow[];
}

const AGE_GROUP_LABELS: Record<string, string> = {
  AGE_4_6: "4-6 سنوات (البراعم)",
  AGE_7_10: "7-10 سنوات (المستكشفون)",
  AGE_11_13: "11-13 سنة (الرواد)",
  AGE_14_16: "14-16 سنة (الفرسان)",
};

export function SchoolAdminAttendanceClient({
  schoolNameEn,
  students,
}: SchoolAdminAttendanceClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAge, setSelectedAge] = useState("ALL");

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAge = selectedAge === "ALL" || s.ageGroup === selectedAge;
    return matchesSearch && matchesAge;
  });

  function exportCsv() {
    const headers = [
      "Student Name",
      "Email",
      "Age Group",
      "Class Group",
      "Attendance Rate (%)",
      "Sessions Attended",
      "Total Sessions",
      "Status",
    ];

    const rows = filteredStudents.map((s) => [
      `"${s.fullName.replace(/"/g, '""')}"`,
      s.email,
      s.ageGroup,
      `"${s.className.replace(/"/g, '""')}"`,
      `${s.attendanceRatePercentage}%`,
      s.totalSessionsAttended,
      s.totalSessionsHeld,
      s.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${schoolNameEn.toLowerCase().replace(/\s+/g, "-")}-attendance-progress-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <span>تقارير الحضور والإنجاز الأكاديمي للطلاب ({students.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            متابعة دقيقة لكل طالب داخل فصول المؤسسة مع نسب الحضور الفعلي
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          disabled={filteredStudents.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>تصدير تقرير الحضور (CSV)</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، البريد أو الفصل الدراسي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-9 pe-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <select
          value={selectedAge}
          onChange={(e) => setSelectedAge(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
        >
          <option value="ALL">جميع الفئات العمرية</option>
          <option value="AGE_4_6">4-6 سنوات (البراعم)</option>
          <option value="AGE_7_10">7-10 سنوات (المستكشفون)</option>
          <option value="AGE_11_13">11-13 سنة (الرواد)</option>
          <option value="AGE_14_16">14-16 سنة (الفرسان)</option>
        </select>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-500">
          لا يوجد طلاب يطابقون خيارات البحث الحالية.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 text-start">اسم الطالب</th>
                <th className="p-3 text-start">الفئة العمرية</th>
                <th className="p-3 text-start">الفصل الدراسي</th>
                <th className="p-3 text-center">نسبة الحضور</th>
                <th className="p-3 text-center">الجلسات المكتملة</th>
                <th className="p-3 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.studentId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-black">
                        {s.fullName.slice(0, 1)}
                      </div>
                      <div>
                        <div>{s.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">
                    {AGE_GROUP_LABELS[s.ageGroup] || s.ageGroup}
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                      {s.className}
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${
                        s.attendanceRatePercentage >= 85
                          ? "bg-emerald-100 text-emerald-800"
                          : s.attendanceRatePercentage >= 70
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {s.attendanceRatePercentage}%
                    </span>
                  </td>
                  <td className="p-3 text-center text-slate-600 font-mono">
                    {s.totalSessionsAttended} / {s.totalSessionsHeld}
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{s.status === "ACTIVE" ? "نشط" : s.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
