import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { assessmentBankService } from "@/server/services/AssessmentBankService";
import { AssessmentFormatType } from "@/server/repositories/AssessmentBankRepository";
import { requireAdminSession } from "@/lib/auth/currentUser";
import {
  FileCheck,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  HelpCircle,
  Volume2,
  Mic,
  PlusCircle,
} from "lucide-react";

export default async function AdminAssessmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  const { type: filterType } = await searchParams;
  const adminSession = await requireAdminSession(locale);

  const assessments = await assessmentBankService.getAllAssessments();
  const questions = await assessmentBankService.getQuestionBank(
    filterType && filterType !== "ALL" ? { type: filterType as AssessmentFormatType } : undefined
  );

  async function handleTogglePublish(formData: FormData) {
    "use server";
    const assessmentId = formData.get("assessmentId")?.toString();
    if (!assessmentId) return;

    await assessmentBankService.togglePublishAssessment(
      assessmentId,
      adminSession
    );

    revalidatePath(`/${locale}/admin/assessments`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

  async function handleCreateAssessment(formData: FormData) {
    "use server";
    const titleAr = formData.get("titleAr")?.toString() || "";
    const descriptionAr = formData.get("descriptionAr")?.toString() || "";
    const courseLevelCode = formData.get("courseLevelCode")?.toString() || "A1";
    const passingScorePercentage = parseInt(formData.get("passingScore")?.toString() || "70", 10);
    const durationMinutes = parseInt(formData.get("durationMinutes")?.toString() || "30", 10);

    if (!titleAr) return;

    await assessmentBankService.createAssessment(
      {
        titleAr,
        titleEn: titleAr,
        descriptionAr,
        courseLevelCode,
        passingScorePercentage,
        durationMinutes,
        questionIds: ["bq-1", "bq-2", "bq-4", "bq-6"], // Select core question types
        isPublished: true,
      },
      adminSession
    );

    revalidatePath(`/${locale}/admin/assessments`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

  const formatIcons: Record<AssessmentFormatType, React.ElementType> = {
    MULTIPLE_CHOICE: HelpCircle,
    TRUE_FALSE: CheckCircle2,
    WORD_MATCHING: Sparkles,
    FILL_IN_THE_BLANK: FileCheck,
    ESSAY: Award,
    AUDIO_LISTENING: Volume2,
    SPEECH_RECORDING: Mic,
  };

  const formatLabels: Record<AssessmentFormatType, string> = {
    MULTIPLE_CHOICE: "اختيار من متعدد",
    TRUE_FALSE: "صح أو خطأ",
    WORD_MATCHING: "ربط الكلمات",
    FILL_IN_THE_BLANK: "إكمال الفراغ",
    ESSAY: "التعبير والإنشاء",
    AUDIO_LISTENING: "الاستماع الصوتي",
    SPEECH_RECORDING: "تسجيل النطق",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              لوحة الإدارة العامة
            </Link>
            <span>/</span>
            <span>الاختبارات وبنك الأسئلة</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            إدارة التقييمات وبنك الأسئلة الأكاديمي 📝
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إعداد الاختبارات الفصلية والكويزات عبر الأنماط السبعة وتحديد درجات النجاح
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-600" />
            <span>7 أنماط تقييمية ذكية متكاملة</span>
          </div>
        </div>
      </div>

      {/* Assessments Catalog */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-brand-600" />
          <span>الاختبارات والتقييمات المعتمدة ({assessments.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assessments.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-brand-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                    المستوى {item.courseLevelCode}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      item.isPublished
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {item.isPublished ? "منشور للطلاب ✓" : "مسودة معلقة ⏸"}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {item.titleAr}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {item.descriptionAr}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.durationMinutes} دقيقة</span>
                  </span>
                  <span className="font-bold text-brand-600">
                    نسبة النجاح: {item.passingScorePercentage}%
                  </span>
                  <span className="font-bold text-slate-800">
                    {item.totalPoints} نقطة
                  </span>
                </div>
              </div>

              <form action={handleTogglePublish} className="pt-2">
                <input type="hidden" name="assessmentId" value={item.id} />
                <button
                  type="submit"
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                    item.isPublished
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      : "bg-brand-600 hover:bg-brand-700 text-white"
                  }`}
                >
                  {item.isPublished ? "تحويل إلى مسودة ⏸" : "نشر الاختبار للطلاب ▶"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>

      {/* Question Bank Explorer & Add Exam Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Question Bank List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>نماذج بنك الأسئلة بالأنماط السبعة ({questions.length})</span>
            </h2>

            {/* Filter by format */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <Link
                href={`/${locale}/admin/assessments?type=ALL`}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  !filterType || filterType === "ALL"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                الكل
              </Link>
              {Object.keys(formatLabels).map((ft) => (
                <Link
                  key={ft}
                  href={`/${locale}/admin/assessments?type=${ft}`}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors ${
                    filterType === ft
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {formatLabels[ft as AssessmentFormatType]}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {questions.map((q) => {
              const Icon = formatIcons[q.type];
              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 hover:border-brand-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
                      <Icon className="w-3.5 h-3.5 text-brand-600" />
                      <span>{formatLabels[q.type]}</span>
                    </span>

                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                      {q.points} نقاط
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{q.titleAr}</h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium">{q.promptAr}</p>
                  </div>

                  {q.options && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {q.options.map((opt, i) => (
                        <span
                          key={i}
                          className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border ${
                            opt === q.correctAnswer
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {opt} {opt === q.correctAnswer && "✓"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Exam / Quiz Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 h-fit">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-brand-600" />
              <span>إنشاء اختبار تقييمي جديد 📋</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              تحديد العنوان، نسبة النجاح، والمدة الزمنية المتاحة للطلاب
            </p>
          </div>

          <form action={handleCreateAssessment} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                عنوان الاختبار أو الكويز
              </label>
              <input
                name="titleAr"
                type="text"
                required
                placeholder="مثال: الاختبار الفصلي لمخارج الحروف والطلاقة"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                وصف موجز للمحتوى التقييمي
              </label>
              <textarea
                name="descriptionAr"
                rows={3}
                required
                placeholder="يوضح هذا الاختبار مدى إتقان الطالب لقواعد النطق والقراءة السليمة..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المستوى المستهدف
                </label>
                <select
                  name="courseLevelCode"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="PRE_A1">Pre-A1</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  نسبة النجاح (%)
                </label>
                <input
                  name="passingScore"
                  type="number"
                  defaultValue={70}
                  min={50}
                  max={100}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                المدة الزمنية (بالدقائق)
              </label>
              <input
                name="durationMinutes"
                type="number"
                defaultValue={30}
                min={10}
                max={120}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl gradient-brand text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all mt-2"
            >
              اعتماد ونشر الاختبار في بنك التقييمات 🚀
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
