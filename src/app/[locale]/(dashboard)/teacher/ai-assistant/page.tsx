import React from "react";
import Link from "next/link";
import { aiService } from "@/server/services/AiService";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { requireTeacherProfile } from "@/lib/auth/currentUser";
import {
  Bot,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  Layers,
} from "lucide-react";

export default async function TeacherAiAssistantPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    program?: string;
    level?: string;
    topic?: string;
    age?: string;
  }>;
}) {
  const { locale } = await params;
  await requireTeacherProfile(locale);
  const query = await searchParams;

  const programs = await academicRepository.getAllPrograms();
  const selectedProgramTitle = query.program || "برنامج القراءة والطلاقة";
  const selectedLevel = query.level || "A1";
  const selectedTopic = query.topic || "المدود بالحروف الثلاثة (الألف والواو والياء)";
  const selectedAge = query.age || "7-10 سنوات";

  const generatedPlan = await aiService.generateTeacherLessonPlan({
    programTitle: selectedProgramTitle,
    courseLevel: selectedLevel,
    topicTitle: selectedTopic,
    targetAgeGroup: selectedAge,
    durationMinutes: 45,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <Link href={`/${locale}/teacher`} className="hover:underline">
              بوابة المعلم
            </Link>
            <span>/</span>
            <span>المساعد الذكي للمعلم</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            المساعد التربوي الذكي للمعلمين 🤖
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            توليد خطط الدروس التفاعلية، اقتراح ألعاب الفصل، وتنسيق تقييمات الفهم اللحظية
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>مساعد ذكي مدعوم بالتربية الحديثة</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 h-fit">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600" />
              <span>إعداد معطيات خطة الدرس</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              اختر البرنامج والمستوى وعنوان الموضوع لتوليد الخطة فوراً
            </p>
          </div>

          <form method="GET" className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                البرنامج الأكاديمي
              </label>
              <select
                name="program"
                defaultValue={selectedProgramTitle}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.titleAr}>
                    {p.titleAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                المستوى الدراسي (CEFR)
              </label>
              <select
                name="level"
                defaultValue={selectedLevel}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="PRE_A1">Pre-A1 (براعم الحروف)</option>
                <option value="A1">A1 (مستكشفو الكلمات)</option>
                <option value="A2">A2 (رواد القراءة والكتابة)</option>
                <option value="B1">B1 (المستوى المتوسط)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                عنوان الموضوع المستهدف
              </label>
              <input
                name="topic"
                type="text"
                required
                defaultValue={selectedTopic}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الفئة العمرية
              </label>
              <select
                name="age"
                defaultValue={selectedAge}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="4-6 سنوات">4 - 6 سنوات</option>
                <option value="7-10 سنوات">7 - 10 سنوات</option>
                <option value="11-13 سنة">11 - 13 سنة</option>
                <option value="14-16 سنة">14 - 16 سنة</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>توليد خطة الدرس المقترحة ✨</span>
            </button>
          </form>
        </div>

        {/* Generated Lesson Plan Output */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  خطة درس معتمدة عبر مساعد المعلم الذكي ✓
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                  {generatedPlan.titleAr}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>البرنامج: {selectedProgramTitle}</span>
                  <span>•</span>
                  <span>المدة: 45 دقيقة</span>
                  <span>•</span>
                  <span>الفئة: {selectedAge}</span>
                </div>
              </div>
            </div>

            {/* Section 1: Warmup Activity */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>1. التهيئة والكسر الجليدي (5 دقائق)</span>
              </h3>
              <p className="text-xs text-slate-700 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 leading-relaxed">
                {generatedPlan.warmupActivity}
              </p>
            </div>

            {/* Section 2: Core Concepts */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600" />
                <span>2. المفاهيم والمحاور التدريسية الأساسية (20 دقيقة)</span>
              </h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                {generatedPlan.coreConcepts.map((concept, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{concept}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Interactive Game */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>3. اللعبة التفاعلية الصفية لجمع نقاط XP (10 دقائق)</span>
              </h3>
              <p className="text-xs text-slate-700 bg-purple-50/50 p-4 rounded-2xl border border-purple-100 leading-relaxed">
                {generatedPlan.interactiveGame}
              </p>
            </div>

            {/* Section 4: Assessment & Homework */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-brand-600" />
                  <span>سؤال التحقق السريع:</span>
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {generatedPlan.assessmentQuestion}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>الواجب المنزلي المقترح:</span>
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {generatedPlan.homeworkRecommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
