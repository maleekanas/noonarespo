import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { assignmentRepository } from "@/server/repositories/AssignmentRepository";
import { assignmentService } from "@/server/services/AssignmentService";
import { userRepository } from "@/server/repositories/UserRepository";
import {
  FileCheck,
  PlusCircle,
  Mic,
  Lock,
} from "lucide-react";

export default async function TeacherAssignmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ classGroupId?: string }>;
}) {
  const { locale } = await params;
  const { classGroupId: queryClassId } = await searchParams;
  const defaultClassId = queryClassId || "class-reading-a1-cohort1";

  const assignments = await assignmentRepository.getAssignmentsByClassGroupId(defaultClassId);

  // Load submissions for all assignments in this class
  const allSubmissions = [];
  for (const a of assignments) {
    const subs = await assignmentRepository.getSubmissionsByAssignmentId(a.id);
    for (const s of subs) {
      const student = await userRepository.findStudentProfileById(s.studentId);
      const feedback = await assignmentRepository.getFeedbackBySubmissionId(s.id);
      allSubmissions.push({
        submission: s,
        assignment: a,
        student,
        feedback,
      });
    }
  }

  // Server Action: Create Assignment
  async function handleCreateAssignment(formData: FormData) {
    "use server";
    const titleAr = formData.get("titleAr")?.toString() || "";
    const instructions = formData.get("instructions")?.toString() || "";
    const voicePromptUrl = formData.get("voicePromptUrl")?.toString() || "";
    const dueDateStr = formData.get("dueDate")?.toString() || "";

    if (!titleAr || !instructions) return;

    await assignmentService.createAssignment({
      classGroupId: defaultClassId,
      titleAr,
      titleEn: titleAr,
      instructions,
      voicePromptUrl: voicePromptUrl || undefined,
      dueDateUtc: dueDateStr ? new Date(dueDateStr) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    revalidatePath(`/${locale}/teacher/assignments`);
    revalidatePath(`/${locale}/student`);
  }

  // Server Action: Grade Submission
  async function handleGradeSubmission(formData: FormData) {
    "use server";
    const submissionId = formData.get("submissionId")?.toString();
    const scoreStr = formData.get("score")?.toString() || "100";
    const parentFeedback = formData.get("parentVisibleFeedback")?.toString() || "";
    const internalNotes = formData.get("internalTeacherNotes")?.toString() || "";

    if (!submissionId || !parentFeedback) return;

    await assignmentService.gradeSubmission({
      submissionId,
      teacherId: "teacher-1",
      score: parseInt(scoreStr, 10),
      parentVisibleFeedback: parentFeedback,
      internalTeacherNotes: internalNotes || undefined,
    });

    revalidatePath(`/${locale}/teacher/assignments`);
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
            <span>الواجبات والتصحيح</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            إدارة الواجبات والتقييمات التربوية 📝
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إنشاء مهام جديدة، سماع تسجيلات الطلاب الصوتية، وإرسال التقييمات المحفزة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Submissions Queue & Current Assignments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Submissions & Grading Queue */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                <span>قائمة تسليمات الطلاب ({allSubmissions.length})</span>
              </h2>
            </div>

            <div className="space-y-6">
              {allSubmissions.map(({ submission, assignment, student, feedback }) => (
                <div
                  key={submission.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {student ? `${student.firstName} ${student.lastName}` : "طالب"}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        الواجب: {assignment.titleAr}
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                        submission.status === "GRADED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {submission.status === "GRADED" ? "تم التقييم" : "بانتظار التصحيح"}
                    </span>
                  </div>

                  {/* Submission Content */}
                  <div className="space-y-2 text-xs">
                    {submission.audioUrl && (
                      <div className="p-3 bg-purple-50 text-purple-900 rounded-xl flex items-center justify-between border border-purple-100">
                        <div className="flex items-center gap-2 font-bold">
                          <Mic className="w-4 h-4 text-purple-600" />
                          <span>تسجيل صوتي مرفوع من الطالب</span>
                        </div>
                        <span className="text-[10px] bg-white px-2 py-1 rounded-md text-purple-700 font-semibold">
                          00:45 ثانية
                        </span>
                      </div>
                    )}

                    {submission.textContent && (
                      <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                        {submission.textContent}
                      </p>
                    )}
                  </div>

                  {/* Evaluation / Feedback Form */}
                  <form action={handleGradeSubmission} className="space-y-3 pt-2">
                    <input type="hidden" name="submissionId" value={submission.id} />

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          الدرجة (من 100)
                        </label>
                        <input
                          name="score"
                          type="number"
                          min={0}
                          max={100}
                          defaultValue={feedback ? feedback.score : 100}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white font-bold text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          التغذية الراجعة لولي الأمر والطالب (مرئية للأسرة)
                        </label>
                        <input
                          name="parentVisibleFeedback"
                          required
                          defaultValue={feedback ? feedback.parentVisibleFeedback : "أحسنت يا بطل، قراءة ممتازة وتطبيق متقن للأحكام!"}
                          placeholder="كلمات تشجيعية وتوجيهية تربوية..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mb-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>ملاحظات تشخيصية داخلية (خاصة بالمعلم والإدارة فقط)</span>
                      </label>
                      <input
                        name="internalTeacherNotes"
                        defaultValue={feedback?.internalTeacherNotes || ""}
                        placeholder="ملاحظات سرية لتتبع تطور مخارج الحروف..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 bg-slate-50 text-slate-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all"
                    >
                      {feedback ? "تحديث التقييم والملاحظات" : "حفظ التقييم وإرسال النتيجة"}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Create Assignment Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-brand-600" />
              <span>إنشاء مهمة أو واجب جديد</span>
            </h3>
            <p className="text-xs text-slate-500">
              إضافة واجب لهذا الفصل مع خيار إضافة نموذج صوتي للمعلم
            </p>
          </div>

          <form action={handleCreateAssignment} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">عنوان الواجب</label>
              <input
                name="titleAr"
                required
                placeholder="مثال: تسجيل قراءة سورة الفلق"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">التعليمات والإرشادات</label>
              <textarea
                name="instructions"
                required
                rows={3}
                placeholder="اشرح للطالب المطلوب منه بدقة وبأسلوب مشجع..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                رابط النموذج الصوتي للمعلم (اختياري)
              </label>
              <input
                name="voicePromptUrl"
                placeholder="https://audio.kidsarabicacademy.internal/prompts/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ وموعد التسليم</label>
              <input
                name="dueDate"
                type="datetime-local"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-md hover:opacity-95 transition-all"
            >
              نشر الواجب لجميع طلاب الفصل
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
