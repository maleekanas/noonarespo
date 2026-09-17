import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { gradebookService } from "@/server/services/GradebookService";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { userRepository } from "@/server/repositories/UserRepository";
import { requireTeacherProfile } from "@/lib/auth/currentUser";
import {
  GraduationCap,
  Star,
  Zap,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default async function TeacherGradebookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ classId?: string }>;
}) {
  const { locale } = await params;
  await requireTeacherProfile(locale);
  const { classId: queryClassId } = await searchParams;

  const defaultClassId = "class-reading-a1-cohort1";
  const activeClassId = queryClassId || defaultClassId;

  const classGroups = await academicRepository.getAllClassGroups();
  const activeClass = classGroups.find((c) => c.id === activeClassId) || classGroups[0];

  // Resolve the real roster of the selected class instead of a hardcoded
  // two-student list -- every teacher used to see the same two demo names
  // to pick from regardless of which class or students they actually teach.
  const enrollments = await academicRepository.getEnrollmentsByClassGroupId(activeClassId);
  const roster = (
    await Promise.all(
      enrollments.map((e) => userRepository.findStudentProfileById(e.studentId))
    )
  ).filter((s): s is NonNullable<typeof s> => Boolean(s));

  const grades = await gradebookService.getClassSessionGrades(activeClassId);

  // Compute live averages
  const totalEvaluations = grades.length;
  const avgWpm = totalEvaluations
    ? Math.round(grades.reduce((sum, g) => sum + g.wordsPerMinute, 0) / totalEvaluations)
    : 35;
  const avgMakharij = totalEvaluations
    ? Math.round(grades.reduce((sum, g) => sum + g.makharijScore, 0) / totalEvaluations)
    : 90;

  async function handleRecordLiveEvaluation(formData: FormData) {
    "use server";
    await requireTeacherProfile(locale);
    const studentId = formData.get("studentId") as string;
    const wordsPerMinute = Number(formData.get("wordsPerMinute") || 35);
    const makharijScore = Number(formData.get("makharijScore") || 90);
    const participationStars = Number(formData.get("participationStars") || 5);
    const teacherNotesAr = (formData.get("teacherNotesAr") as string) || "مشاركة تفاعلية ممتازة.";

    if (!studentId) return;

    await gradebookService.recordLiveEvaluation({
      studentId,
      classGroupId: activeClassId,
      wordsPerMinute,
      makharijScore,
      participationStars,
      teacherNotesAr,
    });

    revalidatePath(`/${locale}/teacher/gradebook`);
    revalidatePath(`/${locale}/parent`);
    revalidatePath(`/${locale}/student`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/teacher`} className="hover:underline">
              بوابة المعلم
            </Link>
            <span>/</span>
            <span>دفتر التقييم المباشر</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            دفتر التقييم والطلاقة الشفوية للحصص المباشرة ⭐
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            رصد فوري لسرعة القراءة (WPM)، سلامة مخارج الحروف، ومنح نجوم التفاعل مع إشعار فوري لأولياء الأمور
          </p>
        </div>

        {/* Class Group Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          {classGroups.slice(0, 3).map((cg) => (
            <Link
              key={cg.id}
              href={`/${locale}/teacher/gradebook?classId=${cg.id}`}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                cg.id === activeClassId
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cg.name}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>التقييمات المسجلة</span>
            <span className="text-brand-600 font-bold">هذا الفصل</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalEvaluations}</div>
          <p className="text-xs text-slate-500">تقييم فردي موثق للطلاب</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>متوسط سرعة القراءة</span>
            <span className="text-emerald-600 font-bold">هدف CEFR: 35+</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{avgWpm} WPM</div>
          <p className="text-xs text-slate-500">كلمة في الدقيقة لنصوص مشكولة</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>متوسط مخارج الحروف</span>
            <span className="text-purple-600 font-bold">متميز</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{avgMakharij}%</div>
          <p className="text-xs text-slate-500">إتقان الحركات وأحكام التجويد</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>إشعارات أولياء الأمور</span>
            <span className="text-emerald-600 font-bold">فوري 100%</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">نشط ✓</div>
          <p className="text-xs text-slate-500">وصول تقارير النجوم مباشرة للأهل</p>
        </div>
      </div>

      {/* Main Grid: Live Evaluation Form & Recent Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Instant Evaluation Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1 pb-4 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>تسجيل تقييم طالب أثناء الحصة الحية</span>
            </h3>
            <p className="text-xs text-slate-500">
              يمنح الطالب نقاط XP فورية ويرسل إشعار تشجيعياً لولي الأمر
            </p>
          </div>

          <form action={handleRecordLiveEvaluation} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                اختر الطالب:
              </label>
              <select
                name="studentId"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {roster.length > 0 ? (
                  roster.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    لا يوجد طلاب مسجلون في هذا الفصل بعد
                  </option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  سرعة القراءة (WPM):
                </label>
                <input
                  type="number"
                  name="wordsPerMinute"
                  defaultValue={38}
                  min={10}
                  max={120}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  المخارج والتجويد (%):
                </label>
                <input
                  type="number"
                  name="makharijScore"
                  defaultValue={95}
                  min={50}
                  max={100}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                نجوم التفاعل الصفي:
              </label>
              <select
                name="participationStars"
                defaultValue={5}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5 نجوم (+20 XP)</option>
                <option value={4}>⭐⭐⭐⭐ 4 نجوم (+18 XP)</option>
                <option value={3}>⭐⭐⭐ 3 نجوم (+16 XP)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ملاحظة المعلم التشجيعية:
              </label>
              <textarea
                name="teacherNotesAr"
                rows={3}
                defaultValue="ما شاء الله، أداء رائع وقراءة منطلقة ومخارج متقنة لحروف القلقلة!"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl gradient-brand text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>تسجيل التقييم وإشعار ولي الأمر (+XP)</span>
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Recent Gradebook History Roster */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              <span>سجل التقييمات الشفوية للحصة الحالية</span>
            </h3>
            <span className="text-xs text-slate-500">
              الفصل: {activeClass?.name}
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {grades.map((g) => (
              <div
                key={g.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {g.studentName}
                    </span>
                    <div className="flex items-center text-amber-500 text-xs">
                      {Array.from({ length: g.participationStars }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      +{g.xpAwarded} XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                    «{g.teacherNotesAr}»
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{g.sessionDate.toISOString().substring(0, 10)}</span>
                    </span>
                    <span>الفصل: {g.classGroupName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 text-xs font-mono font-bold">
                      {g.wordsPerMinute} WPM
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-800 text-xs font-mono font-bold">
                      مخارج: {g.makharijScore}%
                    </span>
                  </div>

                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>أُرسل إشعار لولي الأمر</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
