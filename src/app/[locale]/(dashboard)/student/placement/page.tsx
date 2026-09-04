import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { placementService } from "@/server/services/PlacementService";
import {
  Sparkles,
  Award,
  Volume2,
  Mic,
} from "lucide-react";

export default async function StudentPlacementPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const studentId = "student-1";

  const questions = await placementService.getQuestions();
  const latestResult = await placementService.getLatestResult(studentId);

  async function handleCompleteAssessment(formData: FormData) {
    "use server";
    const answers: Record<string, string> = {};
    for (const [key, val] of formData.entries()) {
      if (key.startsWith("q_")) {
        const qId = key.replace("q_", "");
        answers[qId] = val.toString();
      }
    }

    await placementService.evaluateAndPlace(studentId, answers);
    revalidatePath(`/${locale}/student/placement`);
    revalidatePath(`/${locale}/student`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/student`} className="hover:underline">
              بوابة الطالب
            </Link>
            <span>/</span>
            <span>تحديد المستوى</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            اختبار تحديد المستوى التفاعلي الذكي 🎯
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            7 أسئلة تفاعلية ذكية لتحديد المستوى المناسب وتخصيص مسارك التعليمي (+50 XP فورية)
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>مكافأة الإنجاز: +50 XP</span>
        </div>
      </div>

      {/* Latest Result Banner if exists */}
      {latestResult && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-300" />
              <span>نتيجة التقييم الأخيرة</span>
            </span>
            <span className="text-2xl font-extrabold">{latestResult.scorePercentage}%</span>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold">{latestResult.recommendedLevelTitleAr}</h2>
            <p className="text-xs text-teal-100 mt-1">
              تم تحديد المستوى التعليمي المناسب لقدراتك بنجاح. يمكنك إعادة التقييم في أي وقت لقياس تقدمك.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Assessment Form */}
      <form action={handleCompleteAssessment} className="space-y-6">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-700">
                السؤال {idx + 1} من {questions.length}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{q.points} نقطة</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">{q.promptAr}</h3>
              <p className="text-xs text-slate-400">{q.promptEn}</p>
            </div>

            {/* Audio Listening Player if applicable */}
            {q.audioPromptUrl && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>المقطع الصوتي للاستماع</span>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-900 font-bold text-xs shadow-sm hover:bg-amber-500 transition-colors"
                >
                  ▶ استماع (00:03)
                </button>
              </div>
            )}

            {/* Speech Recording Simulation if applicable */}
            {q.type === "SPEECH_RECORDING" && (
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-purple-900 block">
                  اضغط للتحدث وقراءة العبارة
                </span>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    name={`q_${q.id}`}
                    type="checkbox"
                    value="تم التسجيل الصوتي بنجاح"
                    defaultChecked
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold text-purple-800">
                    تم نطق العبارة وتسجيل الصوت بنجاح
                  </span>
                </label>
              </div>
            )}

            {/* Multiple Choice Options */}
            {q.type !== "SPEECH_RECORDING" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {q.options.map((opt, optIdx) => (
                  <label
                    key={optIdx}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/30 cursor-pointer transition-all"
                  >
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={opt}
                      defaultChecked={optIdx === 0}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-bold text-slate-800">{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full py-4 rounded-2xl gradient-brand text-white font-extrabold text-base shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <span>تسليم إجابات التقييم واحتساب المستوى (+50 XP)</span>
          <Sparkles className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
