"use client";

import React, { useState, useMemo, useTransition } from "react";
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
  Trash2,
  Search,
  Filter,
  Download,
  X,
  AlertTriangle,
  RotateCcw,
  Layers,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { AssessmentFormatType, BankQuestion } from "@/server/repositories/AssessmentBankRepository";

export interface SerializedManagedAssessment {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  courseLevelCode: string;
  classGroupId?: string;
  passingScorePercentage: number;
  durationMinutes: number;
  questionIds: string[];
  isPublished: boolean;
  totalPoints: number;
  createdAt: string;
}

interface AssessmentManagementClientProps {
  initialAssessments: SerializedManagedAssessment[];
  initialQuestions: BankQuestion[];
  locale: string;
  onTogglePublish: (assessmentId: string) => Promise<{ success: boolean; isPublished?: boolean; message?: string }>;
  onDeleteAssessment: (assessmentId: string) => Promise<{ success: boolean; message?: string }>;
  onDeleteQuestion: (questionId: string) => Promise<{ success: boolean; message?: string }>;
  onCreateQuestion: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
  onCreateAssessment: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
}

const FORMAT_ICONS: Record<AssessmentFormatType, React.ElementType> = {
  MULTIPLE_CHOICE: HelpCircle,
  TRUE_FALSE: CheckCircle2,
  WORD_MATCHING: Sparkles,
  FILL_IN_THE_BLANK: FileCheck,
  ESSAY: Award,
  AUDIO_LISTENING: Volume2,
  SPEECH_RECORDING: Mic,
};

const FORMAT_LABELS_AR: Record<AssessmentFormatType, string> = {
  MULTIPLE_CHOICE: "اختيار من متعدد",
  TRUE_FALSE: "صح أو خطأ",
  WORD_MATCHING: "ربط الكلمات",
  FILL_IN_THE_BLANK: "إكمال الفراغ",
  ESSAY: "التعبير والإنشاء",
  AUDIO_LISTENING: "الاستماع الصوتي",
  SPEECH_RECORDING: "تسجيل النطق",
};

const FORMAT_LABELS_EN: Record<AssessmentFormatType, string> = {
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
  WORD_MATCHING: "Word Matching",
  FILL_IN_THE_BLANK: "Fill in the Blank",
  ESSAY: "Essay & Writing",
  AUDIO_LISTENING: "Listening Audio",
  SPEECH_RECORDING: "Speech Recording",
};

export default function AssessmentManagementClient({
  initialAssessments,
  initialQuestions,
  locale,
  onTogglePublish,
  onDeleteAssessment,
  onDeleteQuestion,
  onCreateQuestion,
  onCreateAssessment,
}: AssessmentManagementClientProps) {
  const isAr = locale === "ar";

  // Data state
  const [assessments, setAssessments] = useState<SerializedManagedAssessment[]>(initialAssessments);
  const [questions, setQuestions] = useState<BankQuestion[]>(initialQuestions);

  // Active view tab: "assessments" or "questions"
  const [activeTab, setActiveTab] = useState<"assessments" | "questions">("assessments");

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | AssessmentFormatType>("ALL");

  // Transitions & Notices
  const [isPending, startTransition] = useTransition();
  const [statusNotice, setStatusNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals state
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "assessment" | "question"; id: string; title: string } | null>(null);

  // Filtered Assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      if (statusFilter === "PUBLISHED" && !item.isPublished) return false;
      if (statusFilter === "DRAFT" && item.isPublished) return false;
      if (levelFilter !== "ALL" && item.courseLevelCode !== levelFilter) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = item.titleAr.toLowerCase().includes(query) || item.titleEn.toLowerCase().includes(query);
        const matchDesc = item.descriptionAr.toLowerCase().includes(query);
        const matchLevel = item.courseLevelCode.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchLevel) return false;
      }

      return true;
    });
  }, [assessments, statusFilter, levelFilter, searchTerm]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (typeFilter !== "ALL" && q.type !== typeFilter) return false;
      if (levelFilter !== "ALL" && q.courseLevelCode !== levelFilter) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = q.titleAr.toLowerCase().includes(query) || q.titleEn.toLowerCase().includes(query);
        const matchPrompt = q.promptAr.toLowerCase().includes(query) || q.promptEn.toLowerCase().includes(query);
        const matchOptions = q.options ? q.options.some((opt) => opt.toLowerCase().includes(query)) : false;
        if (!matchTitle && !matchPrompt && !matchOptions) return false;
      }

      return true;
    });
  }, [questions, typeFilter, levelFilter, searchTerm]);

  // CSV Export for Assessments
  const handleExportAssessmentsCSV = () => {
    const headers = isAr
      ? ["معرف الاختبار", "عنوان الاختبار (عربي)", "العنوان (إنجليزي)", "المستوى", "المدة (دقائق)", "نسبة النجاح", "مجموع النقاط", "الحالة", "تاريخ الإنشاء"]
      : ["Assessment ID", "Title (Ar)", "Title (En)", "Level", "Duration (mins)", "Passing Score %", "Total Points", "Status", "Created At"];

    const rows = filteredAssessments.map((a) => [
      `"${a.id}"`,
      `"${a.titleAr.replace(/"/g, '""')}"`,
      `"${a.titleEn.replace(/"/g, '""')}"`,
      `"${a.courseLevelCode}"`,
      a.durationMinutes,
      `${a.passingScorePercentage}%`,
      a.totalPoints,
      a.isPublished ? (isAr ? "منشور" : "Published") : (isAr ? "مسودة" : "Draft"),
      `"${a.createdAt.split("T")[0]}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `assessments_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CSV Export for Question Bank
  const handleExportQuestionsCSV = () => {
    const headers = isAr
      ? ["معرف السؤال", "نمط السؤال", "المستوى", "عنوان السؤال", "نص السؤال أو التوجيه", "الخيارات", "الإجابة الصحيحة", "النقاط"]
      : ["Question ID", "Format Type", "Level", "Title", "Prompt", "Options", "Correct Answer", "Points"];

    const rows = filteredQuestions.map((q) => [
      `"${q.id}"`,
      q.type,
      `"${q.courseLevelCode}"`,
      `"${q.titleAr.replace(/"/g, '""')}"`,
      `"${q.promptAr.replace(/"/g, '""')}"`,
      `"${(q.options || []).join(" | ").replace(/"/g, '""')}"`,
      `"${q.correctAnswer.replace(/"/g, '""')}"`,
      q.points,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `questions_bank_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Action: Toggle Publish
  const handleToggle = (assessmentId: string) => {
    startTransition(async () => {
      const res = await onTogglePublish(assessmentId);
      if (res.success) {
        setAssessments((prev) =>
          prev.map((item) => (item.id === assessmentId ? { ...item, isPublished: !!res.isPublished } : item))
        );
        setStatusNotice({
          type: "success",
          text: isAr
            ? res.isPublished
              ? "تم نشر الاختبار للطلاب بنجاح ✓"
              : "تم تحويل الاختبار إلى مسودة معلقة ⏸"
            : `Assessment is now ${res.isPublished ? "Published" : "Draft"}`,
        });
      } else {
        setStatusNotice({ type: "error", text: res.message || "Failed to update assessment status" });
      }
    });
  };

  // Action: Confirm Delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      if (deleteTarget.type === "assessment") {
        const res = await onDeleteAssessment(deleteTarget.id);
        if (res.success) {
          setAssessments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
          setStatusNotice({
            type: "success",
            text: isAr ? "تم حذف الاختبار نهائياً من النظام" : "Assessment deleted successfully",
          });
        } else {
          setStatusNotice({ type: "error", text: res.message || "Failed to delete assessment" });
        }
      } else {
        const res = await onDeleteQuestion(deleteTarget.id);
        if (res.success) {
          setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
          setStatusNotice({
            type: "success",
            text: isAr ? "تم حذف السؤال من بنك الأسئلة" : "Question deleted from bank",
          });
        } else {
          setStatusNotice({ type: "error", text: res.message || "Failed to delete question" });
        }
      }
      setDeleteTarget(null);
    });
  };

  // Action: Create Question Submit
  const handleCreateQuestionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await onCreateQuestion(formData);
      if (res.success) {
        setShowAddQuestionModal(false);
        setStatusNotice({
          type: "success",
          text: isAr ? "تمت إضافة السؤال الجديد إلى بنك الأسئلة بنجاح 💡" : "Question added to bank successfully",
        });
      } else {
        setStatusNotice({ type: "error", text: res.message || "Failed to create question" });
      }
    });
  };

  // Action: Create Assessment Submit
  const handleCreateAssessmentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await onCreateAssessment(formData);
      if (res.success) {
        setShowAddExamModal(false);
        setStatusNotice({
          type: "success",
          text: isAr ? "تم إنشاء ونشر الاختبار التقييمي بنجاح 📝" : "Assessment created successfully",
        });
      } else {
        setStatusNotice({ type: "error", text: res.message || "Failed to create assessment" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {statusNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-sm transition-all ${
            statusNotice.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusNotice.text}</span>
          </div>
          <button
            onClick={() => setStatusNotice(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("assessments");
              setSearchTerm("");
            }}
            className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 ${
              activeTab === "assessments"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>{isAr ? "الاختبارات والتقييمات المعتمدة" : "Assessments Catalog"}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === "assessments" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {assessments.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("questions");
              setSearchTerm("");
            }}
            className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 ${
              activeTab === "questions"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? "بنك الأسئلة الأكاديمي (7 أنماط)" : "Question Bank"}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === "questions" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {questions.length}
            </span>
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === "assessments" ? (
            <>
              <button
                onClick={handleExportAssessmentsCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>{isAr ? "تصدير الاختبارات CSV" : "Export Assessments"}</span>
              </button>
              <button
                onClick={() => setShowAddExamModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl gradient-brand text-white font-extrabold text-xs shadow-sm hover:opacity-95 transition-opacity"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isAr ? "+ إنشاء اختبار جديد" : "+ Create Assessment"}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleExportQuestionsCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>{isAr ? "تصدير بنك الأسئلة CSV" : "Export Questions"}</span>
              </button>
              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isAr ? "+ إضافة سؤال للبنك" : "+ Add Question"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute top-3.5 start-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === "assessments"
                  ? isAr
                    ? "البحث في عناوين الاختبارات، الوصف، المستوى..."
                    : "Search assessment title, description, level..."
                  : isAr
                  ? "البحث في بنك الأسئلة، نص السؤال، التوجيه أو الخيارات..."
                  : "Search questions bank, prompt or options..."
              }
              className="w-full ps-10 pe-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-800"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute top-3.5 end-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">{isAr ? "كافة المستويات الأكاديمية" : "All Levels"}</option>
              <option value="PRE_A1">Pre-A1</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>

            {/* Status Filter for Assessments */}
            {activeTab === "assessments" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="ALL">{isAr ? "كافة الحالات" : "All Status"}</option>
                <option value="PUBLISHED">{isAr ? "المنشورة للطلاب ✓" : "Published"}</option>
                <option value="DRAFT">{isAr ? "المسودات المعلقة ⏸" : "Drafts"}</option>
              </select>
            )}

            {/* Question Format Filter */}
            {activeTab === "questions" && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 max-w-[180px] truncate"
              >
                <option value="ALL">{isAr ? "كافة الأنماط (7)" : "All Formats (7)"}</option>
                {Object.keys(FORMAT_LABELS_AR).map((ft) => (
                  <option key={ft} value={ft}>
                    {isAr ? FORMAT_LABELS_AR[ft as AssessmentFormatType] : FORMAT_LABELS_EN[ft as AssessmentFormatType]}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Content Section: Assessments Catalog View */}
      {activeTab === "assessments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>
              {isAr
                ? `عرض ${filteredAssessments.length} من أصل ${assessments.length} اختبار معتمد`
                : `Showing ${filteredAssessments.length} of ${assessments.length} assessments`}
            </span>
          </div>

          {filteredAssessments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-extrabold text-slate-800 text-base">
                {isAr ? "لا توجد اختبارات مطابقة للبحث" : "No matching assessments"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isAr
                  ? "جرب تعديل مستوى الاختبار أو حالة النشر للعثور على الاختبارات المطلوبة."
                  : "Try adjusting filters or create a new assessment."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssessments.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-brand-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {isAr ? `المستوى ${item.courseLevelCode}` : `Level ${item.courseLevelCode}`}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          item.isPublished
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {item.isPublished ? (isAr ? "منشور للطلاب ✓" : "Published") : (isAr ? "مسودة معلقة ⏸" : "Draft")}
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
                        <span>{item.durationMinutes} {isAr ? "دقيقة" : "mins"}</span>
                      </span>
                      <span className="font-bold text-brand-600">
                        {isAr ? "النجاح:" : "Pass:"} {item.passingScorePercentage}%
                      </span>
                      <span className="font-bold text-slate-800">
                        {item.totalPoints} {isAr ? "نقطة" : "pts"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      disabled={isPending}
                      onClick={() => handleToggle(item.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                        item.isPublished
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-brand-600 hover:bg-brand-700 text-white"
                      }`}
                    >
                      {item.isPublished
                        ? isAr ? "تحويل إلى مسودة ⏸" : "Set to Draft ⏸"
                        : isAr ? "نشر الاختبار للطلاب ▶" : "Publish to Students ▶"}
                    </button>

                    <button
                      onClick={() =>
                        setDeleteTarget({ type: "assessment", id: item.id, title: item.titleAr })
                      }
                      title={isAr ? "حذف الاختبار نهائياً" : "Delete assessment"}
                      className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Section: Question Bank View */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>
              {isAr
                ? `عرض ${filteredQuestions.length} من أصل ${questions.length} سؤال بالأنماط السبعة`
                : `Showing ${filteredQuestions.length} of ${questions.length} questions`}
            </span>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-extrabold text-slate-800 text-base">
                {isAr ? "لا توجد أسئلة مطابقة للبحث" : "No matching questions in bank"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isAr
                  ? "جرب تعديل نمط السؤال أو المستوى الأكاديمي."
                  : "Try adjusting format or level filter."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuestions.map((q) => {
                const Icon = FORMAT_ICONS[q.type] || HelpCircle;
                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 hover:border-purple-300 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-100">
                            <Icon className="w-3.5 h-3.5 text-purple-600" />
                            <span>{isAr ? FORMAT_LABELS_AR[q.type] : FORMAT_LABELS_EN[q.type]}</span>
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {q.courseLevelCode}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                            {q.points} {isAr ? "نقاط" : "pts"}
                          </span>
                          <button
                            onClick={() =>
                              setDeleteTarget({ type: "question", id: q.id, title: q.titleAr })
                            }
                            title={isAr ? "حذف السؤال من البنك" : "Delete question"}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{q.titleAr}</h4>
                        <p className="text-xs text-slate-600 mt-1 font-medium">{q.promptAr}</p>
                      </div>

                      {q.options && q.options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {q.options.map((opt, i) => (
                            <span
                              key={i}
                              className={`text-[11px] px-2.5 py-1 rounded-xl font-medium border ${
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Question Dialog */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {isAr ? "إضافة سؤال جديد إلى بنك الأسئلة الأكاديمي" : "Add Question to Bank"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "نمط السؤال التفاعلي" : "Question Format"}
                </label>
                <select
                  name="type"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  {Object.keys(FORMAT_LABELS_AR).map((ft) => (
                    <option key={ft} value={ft}>
                      {isAr ? FORMAT_LABELS_AR[ft as AssessmentFormatType] : FORMAT_LABELS_EN[ft as AssessmentFormatType]} ({ft})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "عنوان السؤال / المهارة المستهدفة" : "Title / Skill"}
                </label>
                <input
                  name="titleAr"
                  type="text"
                  required
                  placeholder={isAr ? "مثال: نطق حرف القاف بالشكل الصحيح" : "e.g. Arabic letter pronunciation"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "نص السؤال أو التوجيه الصوتي" : "Question Prompt"}
                </label>
                <textarea
                  name="promptAr"
                  rows={2}
                  required
                  placeholder={isAr ? "اختر الإجابة الصحيحة أو انطق الكلمة التالية..." : "Type question prompt..."}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "المستوى الأكاديمي" : "Academic Level"}
                  </label>
                  <select
                    name="courseLevelCode"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="PRE_A1">Pre-A1</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "النقاط المستحقة" : "Points"}
                  </label>
                  <input
                    name="points"
                    type="number"
                    defaultValue="10"
                    min="1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "خيارات الإجابة (مفصولة بفاصلة ,)" : "Options (comma-separated)"}
                </label>
                <input
                  name="options"
                  type="text"
                  placeholder={isAr ? "مثال: ج، ح، خ، ع" : "e.g. Option A, Option B, Option C"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "الإجابة النموذجية الصحيحة" : "Correct Answer"}
                </label>
                <input
                  name="correctAnswer"
                  type="text"
                  required
                  placeholder={isAr ? "مثال: ج" : "e.g. Correct Choice"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  {isAr ? "حفظ وإضافة السؤال" : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Assessment Exam Dialog */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {isAr ? "إنشاء اختبار تقييمي أكاديمي جديد" : "Create New Assessment Exam"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddExamModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessmentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "عنوان الاختبار" : "Assessment Title"}
                </label>
                <input
                  name="titleAr"
                  type="text"
                  required
                  placeholder={isAr ? "مثال: الاختبار النصفي الشامل - المستوى A1" : "e.g. Midterm Comprehensive Exam - A1"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "وصف الاختبار وأهدافه" : "Description"}
                </label>
                <textarea
                  name="descriptionAr"
                  rows={2}
                  placeholder={isAr ? "وصف مخرجات التعلم والمهارات المستهدفة في هذا الاختبار..." : "Describe learning objectives..."}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "المستوى" : "Level"}
                  </label>
                  <select
                    name="courseLevelCode"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="PRE_A1">Pre-A1</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "نسبة النجاح %" : "Passing %"}
                  </label>
                  <input
                    name="passingScore"
                    type="number"
                    defaultValue="70"
                    min="50"
                    max="100"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "المدة (دقائق)" : "Duration (min)"}
                  </label>
                  <input
                    name="durationMinutes"
                    type="number"
                    defaultValue="30"
                    min="5"
                    max="180"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-opacity"
                >
                  {isAr ? "إنشاء الاختبار وتفعيله" : "Create Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">
                {deleteTarget.type === "assessment"
                  ? isAr ? "تأكيد حذف الاختبار الأكاديمي" : "Confirm Assessment Deletion"
                  : isAr ? "تأكيد حذف السؤال من البنك" : "Confirm Question Deletion"}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr
                  ? `هل أنت متأكد من رغبتك في حذف "${deleteTarget.title}" نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسيتم تسجيله في سجل التدقيق الأمني.`
                  : `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                {isAr ? "إلغاء التراجع" : "Cancel"}
              </button>
              <button
                disabled={isPending}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                {isAr ? "تأكيد الحذف النهائي" : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
