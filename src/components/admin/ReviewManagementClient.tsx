"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Star,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Flag,
  Trash2,
  MessageSquare,
  Send,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Users,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

export type ReviewStatus = "APPROVED" | "PENDING" | "FLAGGED";

export interface SerializedParentReview {
  id: string;
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  rating: number; // 1 to 5
  titleAr: string;
  commentAr: string;
  status: ReviewStatus;
  adminReplyAr?: string;
  createdAt: string; // ISO date string
}

export interface ReviewTranslationData {
  title?: string;
  comment?: string;
  adminReply?: string;
}

interface ReviewManagementClientProps {
  initialReviews: SerializedParentReview[];
  translations?: Record<string, ReviewTranslationData>;
  locale: string;
  onModerateStatus: (reviewId: string, status: ReviewStatus) => Promise<{ success: boolean; message?: string }>;
  onReplyReview: (reviewId: string, replyText: string) => Promise<{ success: boolean; message?: string }>;
  onDeleteReview: (reviewId: string) => Promise<{ success: boolean; message?: string }>;
  onBulkModerate: (reviewIds: string[], status: ReviewStatus) => Promise<{ success: boolean; count: number }>;
}

const REPLY_TEMPLATES_AR = [
  "شكراً لثقتكم الغالية بأكاديمية نون. نسعد دائماً برؤية تقدم أبنائنا وبناتنا.",
  "بارك الله فيكم، رأيكم محل تقديرنا ويسهم في تطوير مسيرتنا التعليمية باستمرار.",
  "تم استلام ملاحظتكم بعناية وتم توجيهها للمشرف الأكاديمي لمتابعتها مباشرة.",
  "نشكركم على الإشادة بمعلمينا الأفاضل، سننقل هذا الثناء للأستاذ بكل فخر.",
];

export default function ReviewManagementClient({
  initialReviews,
  translations = {},
  locale,
  onModerateStatus,
  onReplyReview,
  onDeleteReview,
  onBulkModerate,
}: ReviewManagementClientProps) {
  const isAr = locale === "ar";
  const [reviews, setReviews] = useState<SerializedParentReview[]>(initialReviews);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReviewStatus>("ALL");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [teacherFilter, setTeacherFilter] = useState<string>("ALL");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pending transitions
  const [isPending, startTransition] = useTransition();
  const [statusNotice, setStatusNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals state
  const [activeReplyReview, setActiveReplyReview] = useState<SerializedParentReview | null>(null);
  const [replyText, setReplyText] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SerializedParentReview | null>(null);

  // Unique teachers for dropdown
  const uniqueTeachers = useMemo(() => {
    const map = new Map<string, string>();
    reviews.forEach((r) => {
      if (!map.has(r.teacherId)) map.set(r.teacherId, r.teacherName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (ratingFilter !== "ALL" && r.rating !== ratingFilter) return false;
      if (teacherFilter !== "ALL" && r.teacherId !== teacherFilter) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesParent = r.parentName.toLowerCase().includes(query);
        const matchesTeacher = r.teacherName.toLowerCase().includes(query);
        const matchesTitle = r.titleAr.toLowerCase().includes(query);
        const matchesComment = r.commentAr.toLowerCase().includes(query);
        const matchesReply = r.adminReplyAr ? r.adminReplyAr.toLowerCase().includes(query) : false;
        if (!matchesParent && !matchesTeacher && !matchesTitle && !matchesComment && !matchesReply) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, statusFilter, ratingFilter, teacherFilter, searchTerm]);

  // Statistics counters
  const counts = useMemo(() => {
    return {
      all: reviews.length,
      approved: reviews.filter((r) => r.status === "APPROVED").length,
      pending: reviews.filter((r) => r.status === "PENDING").length,
      flagged: reviews.filter((r) => r.status === "FLAGGED").length,
    };
  }, [reviews]);

  // Selection helpers
  const isAllSelected = filteredReviews.length > 0 && filteredReviews.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredReviews.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // CSV Export with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = isAr
      ? ["معرف التقييم", "اسم ولي الأمر", "اسم المعلم", "التقييم", "الحالة", "عنوان التقييم", "نص التقييم", "رد الإدارة الرسمي", "التاريخ"]
      : ["Review ID", "Parent Name", "Teacher Name", "Rating", "Status", "Review Title", "Review Comment", "Admin Reply", "Date"];

    const rows = filteredReviews.map((r) => [
      `"${r.id}"`,
      `"${r.parentName.replace(/"/g, '""')}"`,
      `"${r.teacherName.replace(/"/g, '""')}"`,
      r.rating,
      r.status,
      `"${r.titleAr.replace(/"/g, '""')}"`,
      `"${r.commentAr.replace(/"/g, '""')}"`,
      `"${(r.adminReplyAr || "").replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toISOString().split("T")[0]}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reviews_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Action: Moderate single status
  const handleStatusChange = (reviewId: string, newStatus: ReviewStatus) => {
    startTransition(async () => {
      const res = await onModerateStatus(reviewId, newStatus);
      if (res.success) {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r)));
        setStatusNotice({
          type: "success",
          text: isAr ? `تم تحديث حالة التقييم بنجاح إلى ${newStatus}` : `Review status updated to ${newStatus}`,
        });
      } else {
        setStatusNotice({ type: "error", text: res.message || "Operation failed" });
      }
    });
  };

  // Action: Bulk Moderate
  const handleBulkAction = (status: ReviewStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    startTransition(async () => {
      const res = await onBulkModerate(ids, status);
      if (res.success) {
        setReviews((prev) => prev.map((r) => (selectedIds.has(r.id) ? { ...r, status } : r)));
        setSelectedIds(new Set());
        setStatusNotice({
          type: "success",
          text: isAr
            ? `تم تحديث ${res.count} تقييم دفعة واحدة إلى ${status}`
            : `Successfully updated ${res.count} reviews to ${status}`,
        });
      }
    });
  };

  // Action: Submit Reply
  const handleOpenReplyModal = (rev: SerializedParentReview) => {
    setActiveReplyReview(rev);
    setReplyText(rev.adminReplyAr || "");
  };

  const handleSaveReply = () => {
    if (!activeReplyReview || !replyText.trim()) return;

    startTransition(async () => {
      const res = await onReplyReview(activeReplyReview.id, replyText.trim());
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === activeReplyReview.id ? { ...r, adminReplyAr: replyText.trim() } : r))
        );
        setActiveReplyReview(null);
        setReplyText("");
        setStatusNotice({
          type: "success",
          text: isAr ? "تم حفظ ونشر الرد الرسمي للأكاديمية بنجاح" : "Admin reply posted successfully",
        });
      } else {
        setStatusNotice({ type: "error", text: res.message || "Failed to post reply" });
      }
    });
  };

  // Action: Delete Single Review
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const res = await onDeleteReview(deleteTarget.id);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        setDeleteTarget(null);
        setStatusNotice({
          type: "success",
          text: isAr ? "تم حذف التقييم نهائياً من النظام" : "Review deleted successfully",
        });
      } else {
        setStatusNotice({ type: "error", text: res.message || "Failed to delete review" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Notice Toast */}
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

      {/* Control Toolbar: Search, Filters, CSV Export */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute top-3.5 start-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isAr
                  ? "البحث باسم ولي الأمر، المعلم، محتوى التقييم أو الرد..."
                  : "Search parent, teacher, review content or reply..."
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

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Rating Filter Dropdown */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === "ALL" ? "ALL" : parseInt(e.target.value, 10))}
              className="px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">{isAr ? "كافة التقييمات ⭐" : "All Ratings ⭐"}</option>
              <option value="5">{isAr ? "5 نجوم ★★★★★" : "5 Stars ★★★★★"}</option>
              <option value="4">{isAr ? "4 نجوم ★★★★☆" : "4 Stars ★★★★☆"}</option>
              <option value="3">{isAr ? "3 نجوم ★★★☆☆" : "3 Stars ★★★☆☆"}</option>
              <option value="2">{isAr ? "نجمتان ★★☆☆☆" : "2 Stars ★★☆☆☆"}</option>
              <option value="1">{isAr ? "نجمة واحدة ★☆☆☆☆" : "1 Star ★☆☆☆☆"}</option>
            </select>

            {/* Teacher Filter Dropdown */}
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 max-w-[180px] truncate"
            >
              <option value="ALL">{isAr ? "كافة المعلمين" : "All Teachers"}</option>
              {uniqueTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* CSV Export Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shrink-0 shadow-sm"
              title={isAr ? "تصدير إلى إكسل بصيغة CSV" : "Export to Excel CSV"}
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>{isAr ? "تصدير CSV" : "Export CSV"}</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs & Selection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {isAr ? "الكل" : "All"} ({counts.all})
            </button>

            <button
              onClick={() => setStatusFilter("APPROVED")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                statusFilter === "APPROVED"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {isAr ? "المعتمدة المنشورة" : "Approved"} ({counts.approved})
            </button>

            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                statusFilter === "PENDING"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              {isAr ? "قيد المراجعة" : "Pending"} ({counts.pending})
            </button>

            <button
              onClick={() => setStatusFilter("FLAGGED")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                statusFilter === "FLAGGED"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              {isAr ? "المبلغ عنها" : "Flagged"} ({counts.flagged})
            </button>
          </div>

          {/* Bulk Action Controls */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-1.5 rounded-xl text-xs shadow-md animate-fade-in">
              <span className="font-bold">
                {isAr ? `المحدد (${selectedIds.size})` : `Selected (${selectedIds.size})`}
              </span>
              <div className="h-4 w-px bg-slate-700 mx-1" />
              <button
                disabled={isPending}
                onClick={() => handleBulkAction("APPROVED")}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{isAr ? "اعتماد" : "Approve"}</span>
              </button>
              <button
                disabled={isPending}
                onClick={() => handleBulkAction("FLAGGED")}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Flag className="w-3 h-3" />
                <span>{isAr ? "إبلاغ" : "Flag"}</span>
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                title={isAr ? "إلغاء التحديد" : "Clear selection"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Select All Checkbox Header */}
      {filteredReviews.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-medium">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <span>
              {isAr
                ? `تحديد الكل في هذه النتائج (${filteredReviews.length})`
                : `Select all in results (${filteredReviews.length})`}
            </span>
          </label>
          <span>
            {isAr
              ? `عرض ${filteredReviews.length} من أصل ${reviews.length} تقييم`
              : `Showing ${filteredReviews.length} of ${reviews.length} reviews`}
          </span>
        </div>
      )}

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-base">
              {isAr ? "لا توجد تقييمات مطابقة" : "No matching reviews found"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isAr
                ? "جرب تعديل خيارات البحث أو تصفية الحالة لعرض التقييمات المسجلة."
                : "Try adjusting your search criteria or status filter to display reviews."}
            </p>
            {(searchTerm || statusFilter !== "ALL" || ratingFilter !== "ALL" || teacherFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setRatingFilter("ALL");
                  setTeacherFilter("ALL");
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? "إعادة ضبط المرشحات" : "Reset filters"}</span>
              </button>
            )}
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const translated = translations[rev.id];
            const displayTitle = translated?.title || rev.titleAr;
            const displayComment = translated?.comment || rev.commentAr;
            const displayAdminReply = translated?.adminReply || rev.adminReplyAr;
            const isSelected = selectedIds.has(rev.id);

            return (
              <div
                key={rev.id}
                className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 transition-all ${
                  isSelected ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(rev.id)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
                    />
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-extrabold flex items-center justify-center text-sm shrink-0">
                      {rev.parentName[0]}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <span>{rev.parentName}</span>
                        <span className="text-xs font-normal text-slate-500">
                          {isAr ? `(تقييم للمعلم: ${rev.teacherName})` : `(Rated: ${rev.teacherName})`}
                        </span>
                        {translated && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[10px] font-bold">
                            {isAr ? "مترجم آلياً" : "Translated"}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Rating stars & status badge */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                        />
                      ))}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        rev.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : rev.status === "FLAGGED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {rev.status === "APPROVED" && (isAr ? "معتمد ✓" : "Approved")}
                      {rev.status === "PENDING" && (isAr ? "قيد المراجعة ⏸" : "Pending")}
                      {rev.status === "FLAGGED" && (isAr ? "مبلّغ عنه ⚠" : "Flagged")}
                    </span>
                  </div>
                </div>

                {/* Review Body */}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1">{displayTitle}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{displayComment}</p>
                </div>

                {/* Official Admin Reply banner if exists */}
                {rev.adminReplyAr && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1">
                    <div className="font-bold text-slate-700 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-brand-700">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isAr ? "الرد الرسمي لإدارة الأكاديمية:" : "Official Academy Response:"}</span>
                      </div>
                      <button
                        onClick={() => handleOpenReplyModal(rev)}
                        className="text-brand-600 hover:text-brand-800 font-bold text-[11px] underline"
                      >
                        {isAr ? "تعديل الرد" : "Edit reply"}
                      </button>
                    </div>
                    <p className="text-slate-700 text-xs ps-2">{displayAdminReply}</p>
                  </div>
                )}

                {/* Bottom Actions Toolbar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                  {/* Status Moderation Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isPending}
                      onClick={() => handleStatusChange(rev.id, "APPROVED")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl border transition-colors ${
                        rev.status === "APPROVED"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAr ? "اعتماد النشر" : "Approve"}</span>
                    </button>

                    <button
                      disabled={isPending}
                      onClick={() => handleStatusChange(rev.id, "FLAGGED")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl border transition-colors ${
                        rev.status === "FLAGGED"
                          ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                          : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{isAr ? "إبلاغ / حجب" : "Flag"}</span>
                    </button>

                    <button
                      disabled={isPending}
                      onClick={() => handleStatusChange(rev.id, "PENDING")}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 font-bold rounded-xl border transition-colors ${
                        rev.status === "PENDING"
                          ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      }`}
                      title={isAr ? "إعادة التقييم إلى قيد المراجعة" : "Set back to pending"}
                    >
                      <span>{isAr ? "تعليق ⏸" : "Hold"}</span>
                    </button>
                  </div>

                  {/* Reply button & Delete button */}
                  <div className="flex items-center gap-2">
                    {!rev.adminReplyAr && (
                      <button
                        onClick={() => handleOpenReplyModal(rev)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-[11px] transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isAr ? "+ كتابة رد رسمي" : "+ Post Official Reply"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setDeleteTarget(rev)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title={isAr ? "حذف التقييم نهائياً" : "Delete review permanently"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Official Admin Reply Modal */}
      {activeReplyReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {isAr ? "كتابة الرد الرسمي لإدارة الأكاديمية" : "Post Official Academy Reply"}
                </h3>
              </div>
              <button
                onClick={() => setActiveReplyReview(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
              <span className="font-bold text-slate-800">
                {activeReplyReview.parentName} ({activeReplyReview.rating} ★):
              </span>
              <p className="text-slate-600 italic">"{activeReplyReview.commentAr}"</p>
            </div>

            {/* Quick Fill Templates */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500">
                {isAr ? "قوالب جاهزة سريعة:" : "Quick templates:"}
              </span>
              <div className="flex flex-col gap-1.5">
                {REPLY_TEMPLATES_AR.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(template)}
                    className="text-start p-2 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 text-[11px] text-slate-700 transition-colors"
                  >
                    "{template}"
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? "نص الرد المنشور للعامة:" : "Public reply content:"}
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                placeholder={isAr ? "اكتب الرد الرسمي للأكاديمية هنا..." : "Type official response..."}
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveReplyReview(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                disabled={isPending || !replyText.trim()}
                onClick={handleSaveReply}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAr ? "نشر الرد الرسمي" : "Publish Reply"}</span>
              </button>
            </div>
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
                {isAr ? "تأكيد حذف التقييم" : "Confirm Review Deletion"}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr
                  ? `هل أنت متأكد من رغبتك في حذف تقييم ${deleteTarget.parentName} نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسيتم تسجيله في سجل التدقيق الأمني.`
                  : `Are you sure you want to permanently delete the review from ${deleteTarget.parentName}? This action cannot be undone and will be logged.`}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 italic">
              "{deleteTarget.commentAr}"
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
