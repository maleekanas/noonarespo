import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { assessmentBankService } from "@/server/services/AssessmentBankService";
import { AssessmentFormatType } from "@/server/repositories/AssessmentBankRepository";
import { requireAdminHubAccess } from "@/lib/auth/currentUser";
import { Award, ArrowRight } from "lucide-react";
import AssessmentManagementClient, {
  SerializedManagedAssessment,
} from "@/components/admin/AssessmentManagementClient";

export default async function AdminAssessmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdminHubAccess(locale, "assessments");
  const isAr = locale === "ar";

  const assessments = await assessmentBankService.getAllAssessments();
  const questions = await assessmentBankService.getQuestionBank();

  const serializedAssessments: SerializedManagedAssessment[] = assessments.map((item) => ({
    id: item.id,
    titleAr: item.titleAr,
    titleEn: item.titleEn,
    descriptionAr: item.descriptionAr,
    courseLevelCode: item.courseLevelCode,
    classGroupId: item.classGroupId,
    passingScorePercentage: item.passingScorePercentage,
    durationMinutes: item.durationMinutes,
    questionIds: item.questionIds,
    isPublished: item.isPublished,
    totalPoints: item.totalPoints,
    createdAt: item.createdAt.toISOString(),
  }));

  // Server Action: Toggle Publish
  async function handleTogglePublishAction(assessmentId: string) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "assessments");
    const updated = await assessmentBankService.togglePublishAssessment(assessmentId, currentAdmin);
    revalidatePath(`/${locale}/admin/assessments`);
    revalidatePath(`/${locale}/admin/audit-logs`);
    return { success: true, isPublished: updated?.isPublished };
  }

  // Server Action: Delete Assessment
  async function handleDeleteAssessmentAction(assessmentId: string) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "assessments");
    const success = await assessmentBankService.deleteAssessment(assessmentId, currentAdmin);
    revalidatePath(`/${locale}/admin/assessments`);
    revalidatePath(`/${locale}/admin/audit-logs`);
    return { success };
  }

  // Server Action: Delete Question
  async function handleDeleteQuestionAction(questionId: string) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "assessments");
    const success = await assessmentBankService.deleteQuestion(questionId, currentAdmin);
    revalidatePath(`/${locale}/admin/assessments`);
    revalidatePath(`/${locale}/admin/audit-logs`);
    return { success };
  }

  // Server Action: Create Question
  async function handleCreateQuestionAction(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "assessments");
    const titleAr = formData.get("titleAr")?.toString() || "";
    const promptAr = formData.get("promptAr")?.toString() || "";
    const type = (formData.get("type")?.toString() || "MULTIPLE_CHOICE") as AssessmentFormatType;
    const courseLevelCode = formData.get("courseLevelCode")?.toString() || "A1";
    const points = parseInt(formData.get("points")?.toString() || "10", 10);
    const correctAnswer = formData.get("correctAnswer")?.toString() || "";
    const optionsRaw = formData.get("options")?.toString() || "";
    const options = optionsRaw ? optionsRaw.split(",").map((s) => s.trim()).filter(Boolean) : undefined;

    if (!titleAr || !promptAr) return { success: false, message: "Missing required fields" };

    await assessmentBankService.addQuestionToBank(
      {
        programId: "prog-integrated-arabic",
        titleAr,
        titleEn: titleAr,
        promptAr,
        promptEn: promptAr,
        type,
        courseLevelCode,
        points,
        correctAnswer: correctAnswer || "",
        options,
      },
      currentAdmin
    );

    revalidatePath(`/${locale}/admin/assessments`);
    revalidatePath(`/${locale}/admin/audit-logs`);
    return { success: true };
  }

  // Server Action: Create Assessment
  async function handleCreateAssessmentAction(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "assessments");
    const titleAr = formData.get("titleAr")?.toString() || "";
    const descriptionAr = formData.get("descriptionAr")?.toString() || "";
    const courseLevelCode = formData.get("courseLevelCode")?.toString() || "A1";
    const passingScorePercentage = parseInt(formData.get("passingScore")?.toString() || "70", 10);
    const durationMinutes = parseInt(formData.get("durationMinutes")?.toString() || "30", 10);

    if (!titleAr) return { success: false, message: "Title is required" };

    await assessmentBankService.createAssessment(
      {
        titleAr,
        titleEn: titleAr,
        descriptionAr,
        courseLevelCode,
        passingScorePercentage,
        durationMinutes,
        questionIds: ["bq-1", "bq-2", "bq-4", "bq-6"],
        isPublished: true,
      },
      currentAdmin
    );

    revalidatePath(`/${locale}/admin/assessments`);
    revalidatePath(`/${locale}/admin/audit-logs`);
    return { success: true };
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Link href={`/${locale}/admin`} className="hover:text-brand-600 flex items-center gap-1">
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
              <span>{isAr ? "لوحة الإدارة العامة" : "Admin Hub"}</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800">{isAr ? "الاختبارات وبنك الأسئلة" : "Assessments & Question Bank"}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {isAr ? "إدارة التقييمات وبنك الأسئلة الأكاديمي 📝" : "Assessments & Academic Question Bank"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? "إعداد الاختبارات الفصلية والكويزات عبر الأنماط السبعة وتحديد درجات النجاح والتصدير الفوري"
              : "Manage midterm exams, quizzes across 7 interactive formats, passing thresholds and CSV exports"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Award className="w-4 h-4 text-purple-600" />
            <span>{isAr ? "7 أنماط تقييمية ذكية متكاملة" : "7 Interactive Assessment Formats"}</span>
          </div>
        </div>
      </div>

      {/* Interactive Assessment Management Hub */}
      <AssessmentManagementClient
        initialAssessments={serializedAssessments}
        initialQuestions={questions}
        locale={locale}
        onTogglePublish={handleTogglePublishAction}
        onDeleteAssessment={handleDeleteAssessmentAction}
        onDeleteQuestion={handleDeleteQuestionAction}
        onCreateQuestion={handleCreateQuestionAction}
        onCreateAssessment={handleCreateAssessmentAction}
      />
    </div>
  );
}
