import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assignmentRepository } from "@/server/repositories/AssignmentRepository";
import { assignmentService } from "@/server/services/AssignmentService";
import {
  Mic,
  Volume2,
  Clock,
  Award,
} from "lucide-react";

export default async function StudentHomeworkPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const assignment = await assignmentRepository.getAssignmentById(id);

  if (!assignment) {
    notFound();
  }

  const studentId = "student-1";
  const submission = await assignmentRepository.getSubmission(id, studentId);
  const feedback = submission
    ? await assignmentRepository.getFeedbackBySubmissionId(submission.id)
    : null;

  async function handleSubmitHomework(formData: FormData) {
    "use server";
    const textContent = formData.get("textContent")?.toString() || "";
    const hasAudio = formData.get("attachAudio") === "on";

    await assignmentService.submitHomework({
      assignmentId: id,
      studentId,
      textContent: textContent || "تم إرفاق التسجيل الصوتي للواجب",
      audioUrl: hasAudio
        ? "https://audio.kidsarabicacademy.internal/submissions/zayd-recording.mp3"
        : undefined,
    });

    revalidatePath(`/${locale}/student/homework/${id}`);
    revalidatePath(`/${locale}/student`);
    revalidatePath(`/${locale}/teacher/assignments`);
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
            <span>تسليم الواجب</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{assignment.titleAr}</h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>تاريخ التسليم: {assignment.dueDateUtc.toISOString().split("T")[0]}</span>
        </div>
      </div>

      {/* Instructions & Model Audio Prompt */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-700">إرشادات المعلم:</h2>
          <p className="text-sm text-slate-800 leading-relaxed bg-brand-50/50 p-4 rounded-2xl border border-brand-100">
            {assignment.instructions}
          </p>
        </div>

        {assignment.voicePromptUrl && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  النموذج الصوتي الاسترشادي بصوت المعلم
                </span>
                <span className="text-[11px] text-amber-800">
                  استمع جيداً قبل البدء بتسجيل صوتك
                </span>
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs shadow-sm transition-colors"
            >
              ▶ تشغيل المقطع (01:15)
            </button>
          </div>
        )}

        {/* Existing Submission & Teacher Feedback View */}
        {feedback && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>تقييم المعلم لعملك</span>
              </span>
              <span className="text-base font-extrabold text-emerald-900 bg-white px-3 py-1 rounded-xl shadow-sm">
                {feedback.score} / 100
              </span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed bg-white p-3.5 rounded-xl border border-emerald-100">
              {feedback.parentVisibleFeedback}
            </p>
          </div>
        )}

        {/* Submission Form */}
        <form action={handleSubmitHomework} className="space-y-6 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              إرفاق التسجيل الصوتي للواجب
            </label>
            <div className="p-6 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                <Mic className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 block">
                  تسجيل صوتي من الميكروفون أو رفع ملف MP3
                </span>
                <span className="text-[11px] text-slate-500 block">
                  أقصى مدة للتسجيل: 3 دقائق
                </span>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer pt-2">
                <input
                  name="attachAudio"
                  type="checkbox"
                  defaultChecked
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-purple-800">
                  تضمين تسجيل الصوت المكتمل في التسليم
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              ملاحظات أو تعليق الطالب للمعلم (اختياري)
            </label>
            <textarea
              name="textContent"
              rows={3}
              defaultValue={submission?.textContent || ""}
              placeholder="اكتب هنا أي استفسار أو توضيح تود مشاركته مع أستاذك..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl gradient-brand text-white font-bold text-sm shadow-md hover:opacity-95 transition-all"
          >
            {submission ? "تحديث تسليم الواجب" : "تأكيد تسليم الواجب للمعلم"}
          </button>
        </form>
      </div>
    </div>
  );
}
