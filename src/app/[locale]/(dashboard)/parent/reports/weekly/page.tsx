import React from "react";
import Link from "next/link";
import { userRepository } from "@/server/repositories/UserRepository";
import { progressService } from "@/server/services/ProgressService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import {
  Award,
  CheckCircle2,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { PrintButton } from "@/components/shared/PrintButton";

export default async function WeeklyReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { locale } = await params;
  const { studentId: selectedParam } = await searchParams;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;

  const children = await userRepository.getLinkedChildren(parentId);
  const selectedStudentId = selectedParam || (children.length > 0 ? children[0].id : "student-1");

  const summary = await progressService.generateWeeklySummary(selectedStudentId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Print Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/parent`} className="hover:underline">
              لوحة ولي الأمر
            </Link>
            <span>/</span>
            <Link href={`/${locale}/parent/progress`} className="hover:underline">
              مؤشرات التقدم
            </Link>
            <span>/</span>
            <span>التقرير الأسبوعي</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            بطاقة التقرير التربوي الأسبوعي 📄
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ملخص شامل لحضور وإنجازات وكفاءات الطالب للأسبوع المنصرم
          </p>
        </div>

        {/* Child Switcher & Print Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/${locale}/parent/reports/weekly?studentId=${child.id}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  child.id === selectedStudentId
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {child.firstName}
              </Link>
            ))}
          </div>

          <PrintButton label="طباعة / حفظ PDF" />
        </div>
      </div>

      {/* Official Report Card Body */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md space-y-8 print:border-none print:shadow-none">
        {/* Report Card Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b-2 border-slate-100 text-center sm:text-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Arabic Kids Academy
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                تقرير الأداء الأكاديمي واللغوي الأسبوعي
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500 space-y-1 sm:text-end">
            <div>
              الفترة: <span className="font-bold text-slate-800">{summary.weekRange}</span>
            </div>
            <div>
              اسم الطالب: <span className="font-bold text-brand-600">{summary.studentName}</span>
            </div>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">نسبة الحضور</span>
            <span className="text-2xl font-extrabold text-emerald-600 block">
              {summary.attendanceRatePercentage}%
            </span>
            <span className="text-[10px] text-slate-400">التزام تام دون غياب</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">الواجبات المنجزة</span>
            <span className="text-2xl font-extrabold text-brand-600 block">
              {summary.completedAssignmentsCount} / 2
            </span>
            <span className="text-[10px] text-slate-400">100% تسليم في الموعد</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">متوسط الدرجات</span>
            <span className="text-2xl font-extrabold text-purple-600 block">
              {summary.averageScorePercentage}%
            </span>
            <span className="text-[10px] text-slate-400">تقدير: ممتاز مرتفع</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">النقاط المكتسبة (XP)</span>
            <span className="text-2xl font-extrabold text-amber-500 block">+150 XP</span>
            <span className="text-[10px] text-slate-400">وسام بطل القراءة</span>
          </div>
        </div>

        {/* 5-Competency Progress Bars */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-600" />
            <span>تقييم الكفاءات اللغوية الخمس</span>
          </h3>

          <div className="space-y-3">
            {summary.competencies.map((comp) => (
              <div key={comp.skillKey} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{comp.nameAr}</span>
                  <span className="text-brand-600">{comp.scorePercentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-brand"
                    style={{ width: `${comp.scorePercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Feedback Note */}
        <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
          <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>ملاحظات المعلم المشرف الأسبوعية:</span>
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">
            {summary.teacherSummaryComment}
          </p>
        </div>

        {/* Next Week's Learning Focus Areas */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            المستهدفات التعليمية للأسبوع القادم:
          </h3>
          <ul className="space-y-2 text-xs text-slate-600">
            {summary.nextWeekFocusAreas.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
