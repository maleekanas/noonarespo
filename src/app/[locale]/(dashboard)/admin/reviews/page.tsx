import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  Star,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Flag,
  MessageSquare,
  Trash2,
  Send,
  Filter,
  Users,
  ListChecks,
} from "lucide-react";
import { reviewService } from "@/server/services/ReviewService";
import { ReviewStatus } from "@/server/repositories/ReviewRepository";
import { getDictionary } from "@/lib/localization";
import { reviewTranslationAdapter } from "@/lib/integrations/ai/ReviewTranslationAdapter";
import { requireAdminHubAccess } from "@/lib/auth/currentUser";

const INTL_LOCALE: Record<string, string> = {
  ar: "ar-SA",
  en: "en-US",
  nl: "nl-NL",
  tr: "tr-TR",
  it: "it-IT",
  es: "es-ES",
};

export default async function AdminReviewModerationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; bulkModerated?: string }>;
}) {
  const { locale } = await params;
  const { status: filterStatus, bulkModerated } = await searchParams;
  await requireAdminHubAccess(locale, "reviews");
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const arm = dict.adminReviews;

  const unfilteredReviews = await reviewService.getAllReviewsForAdmin();
  let allReviews = unfilteredReviews;

  if (filterStatus && filterStatus !== "ALL") {
    allReviews = allReviews.filter((r) => r.status === filterStatus);
  }

  // Per-teacher ratings -- getTeacherReviewSummary() already existed in
  // ReviewService (it's what the parent-facing teacher profile would use)
  // but nothing surfaced it to admins, who could only see a flat,
  // unaggregated list of every review with no way to tell which teachers
  // were actually rated well without manually counting stars themselves.
  const teacherIds = Array.from(new Set(unfilteredReviews.map((r) => r.teacherId)));
  const teacherNameById = new Map(unfilteredReviews.map((r) => [r.teacherId, r.teacherName]));
  const teacherSummaries = (
    await Promise.all(teacherIds.map((id) => reviewService.getTeacherReviewSummary(id)))
  ).sort((a, b) => b.averageRating - a.averageRating || b.totalReviewsCount - a.totalReviewsCount);

  const translations = await reviewTranslationAdapter.translateReviewBatch(
    allReviews.map((rev) => ({
      id: rev.id,
      title: rev.titleAr,
      comment: rev.commentAr,
      adminReply: rev.adminReplyAr,
    })),
    locale
  );

  // Server Action: Moderate Review Status
  async function handleModerate(reviewId: string, newStatus: ReviewStatus) {
    "use server";
    await requireAdminHubAccess(locale, "reviews");
    await reviewService.moderateReview(reviewId, newStatus);
    revalidatePath(`/${locale}/admin/reviews`);
    revalidatePath(`/${locale}/parent/reviews`);
  }

  // Server Action: Post Official Admin Reply
  async function handleReply(formData: FormData) {
    "use server";
    await requireAdminHubAccess(locale, "reviews");
    const reviewId = formData.get("reviewId")?.toString();
    const replyText = formData.get("replyText")?.toString().trim();
    if (!reviewId || !replyText) return;

    await reviewService.replyToReview(reviewId, replyText);
    revalidatePath(`/${locale}/admin/reviews`);
    revalidatePath(`/${locale}/parent/reviews`);
  }

  // Server Action: Delete Review
  async function handleDelete(formData: FormData) {
    "use server";
    await requireAdminHubAccess(locale, "reviews");
    const reviewId = formData.get("reviewId")?.toString();
    if (!reviewId) return;

    await reviewService.deleteReview(reviewId);
    revalidatePath(`/${locale}/admin/reviews`);
    revalidatePath(`/${locale}/parent/reviews`);
  }

  // Server Action: Bulk Moderate Selected Reviews. The checkboxes that
  // populate reviewIds live inside each review card (see the `form="..."`
  // attribute below) rather than nested inside this <form> -- HTML forbids
  // nesting a <form> inside another <form>, and each review card already
  // has its own reply/delete forms, so the checkboxes are associated with
  // this external form by id instead.
  async function handleBulkModerate(formData: FormData) {
    "use server";
    await requireAdminHubAccess(locale, "reviews");
    const reviewIds = formData.getAll("reviewIds").map((v) => v.toString()).filter(Boolean);
    const bulkStatus = formData.get("bulkStatus")?.toString() as ReviewStatus | undefined;
    if (reviewIds.length === 0 || !bulkStatus) {
      redirect(`/${locale}/admin/reviews${filterStatus ? `?status=${filterStatus}` : ""}`);
    }

    const { succeededIds } = await reviewService.bulkModerateReviews(reviewIds, bulkStatus);

    revalidatePath(`/${locale}/admin/reviews`);
    revalidatePath(`/${locale}/parent/reviews`);
    redirect(
      `/${locale}/admin/reviews?bulkModerated=${succeededIds.length}${filterStatus ? `&status=${filterStatus}` : ""}`
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href={`/${locale}/admin`} className="hover:text-brand-600 flex items-center gap-1">
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
            {arm.backToAdminHub}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">{arm.breadcrumbCurrent}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
          <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
          {arm.pageHeading}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {arm.pageSubtitle}
        </p>
      </div>

      {/* Per-Teacher Ratings Summary */}
      {teacherSummaries.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            <span>{isAr ? "متوسط التقييمات لكل معلم" : "Ratings by Teacher"}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teacherSummaries.map((summary) => (
              <div
                key={summary.teacherId}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs truncate">
                    {teacherNameById.get(summary.teacherId) || summary.teacherId}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-mono font-extrabold text-slate-800 text-xs">
                      {summary.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = summary.ratingDistribution[star] || 0;
                    const pct = summary.totalReviewsCount > 0 ? (count / summary.totalReviewsCount) * 100 : 0;
                    return (
                      <div
                        key={star}
                        className="h-1.5 rounded-full bg-slate-200 overflow-hidden flex-1"
                        title={`${star}★: ${count}`}
                      >
                        <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                    );
                  })}
                </div>
                <span className="text-[11px] text-slate-400">
                  {isAr
                    ? `${summary.totalReviewsCount} تقييماً معتمداً`
                    : `${summary.totalReviewsCount} approved review${summary.totalReviewsCount === 1 ? "" : "s"}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {bulkModerated && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            {isAr
              ? `تم تحديث حالة ${bulkModerated} تقييماً دفعة واحدة.`
              : `Updated ${bulkModerated} review${bulkModerated === "1" ? "" : "s"} in bulk.`}
          </span>
        </div>
      )}

      {/* Bulk Moderation Bar -- checkboxes on each review card below are
          associated with this form via the "form" attribute rather than
          being nested inside it (see handleBulkModerate's comment). */}
      <form
        id="bulk-review-form"
        action={handleBulkModerate}
        className="flex flex-wrap items-center gap-2 bg-white p-4 rounded-2xl border border-slate-200 text-xs"
      >
        <span className="font-bold text-slate-500 me-2 flex items-center gap-1.5">
          <ListChecks className="w-4 h-4 text-slate-400" />
          <span>{isAr ? "إجراء جماعي على المحدد:" : "Bulk action on selected:"}</span>
        </span>
        <button
          type="submit"
          name="bulkStatus"
          value="APPROVED"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl border bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isAr ? "اعتماد المحدد" : "Approve Selected"}</span>
        </button>
        <button
          type="submit"
          name="bulkStatus"
          value="FLAGGED"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl border bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>{isAr ? "الإبلاغ عن المحدد" : "Flag Selected"}</span>
        </button>
        <span className="text-slate-400 text-[11px]">
          {isAr ? "حدد التقييمات المطلوبة من مربعات الاختيار أدناه" : "Check the boxes below on the reviews you want to include"}
        </span>
      </form>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
        <span className="font-bold text-slate-500 me-2 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>{isAr ? "حالة التقييمات:" : "Filter Status:"}</span>
        </span>

        <Link
          href={`/${locale}/admin/reviews?status=ALL`}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
            !filterStatus || filterStatus === "ALL"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {isAr ? "كافة التقييمات" : "All Reviews"} ({allReviews.length})
        </Link>

        <Link
          href={`/${locale}/admin/reviews?status=APPROVED`}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
            filterStatus === "APPROVED"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          {isAr ? "المعتمدة المنشورة (Approved)" : "Approved"}
        </Link>

        <Link
          href={`/${locale}/admin/reviews?status=PENDING`}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
            filterStatus === "PENDING"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-amber-50 text-amber-800 hover:bg-amber-100"
          }`}
        >
          {isAr ? "قيد المراجعة (Pending)" : "Pending"}
        </Link>

        <Link
          href={`/${locale}/admin/reviews?status=FLAGGED`}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
            filterStatus === "FLAGGED"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-rose-50 text-rose-700 hover:bg-rose-100"
          }`}
        >
          {isAr ? "المبلغ عنها (Flagged)" : "Flagged"}
        </Link>
      </div>

      {/* Reviews Moderation List */}
      <div className="space-y-4">
        {allReviews.map((rev) => {
          const translated = translations.get(rev.id);
          const displayTitle = translated?.title ?? rev.titleAr;
          const displayComment = translated?.comment ?? rev.commentAr;
          const displayAdminReply = translated?.adminReply ?? rev.adminReplyAr;

          return (
            <div
              key={rev.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="reviewIds"
                    value={rev.id}
                    form="bulk-review-form"
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
                    aria-label={isAr ? "تحديد هذا التقييم للإجراء الجماعي" : "Select this review for bulk action"}
                  />
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-bold flex items-center justify-center text-sm">
                    {rev.parentName[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{rev.parentName}</span>
                      <span className="text-xs font-normal text-slate-500">
                        {arm.ratedTeacherLabel.replace("{teacher}", rev.teacherName)}
                      </span>
                      {translated && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[10px] font-semibold">
                          {arm.translatedBadgeLabel}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {rev.createdAt.toLocaleDateString(INTL_LOCALE[locale] || "en-US")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                      />
                    ))}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      rev.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : rev.status === "FLAGGED"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{displayTitle}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{displayComment}</p>
              </div>

              {/* Official Admin Reply display */}
              {displayAdminReply && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                  <div className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                    <span>{arm.officialAdminReplyLabel}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] ps-2">{displayAdminReply}</p>
                </div>
              )}

              {/* Write / Edit Official Admin Reply */}
              <details className="text-xs group pt-1">
                <summary className="cursor-pointer text-brand-600 font-bold flex items-center gap-1 select-none">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>
                    {displayAdminReply
                      ? isAr ? "تعديل الرد الرسمي للأكاديمية" : "Edit Admin Reply"
                      : isAr ? "+ كتابة رد رسمي من إدارة الأكاديمية" : "+ Add Official Admin Reply"}
                  </span>
                </summary>

                <form action={handleReply} className="mt-2 space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <input type="hidden" name="reviewId" value={rev.id} />
                  <textarea
                    name="replyText"
                    defaultValue={rev.adminReplyAr || ""}
                    rows={2}
                    placeholder={isAr ? "اكتب الرد الرسمي هنا ليظهر تحت التقييم..." : "Write official reply..."}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl gradient-brand text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isAr ? "نشر الرد الرسمي" : "Post Reply"}</span>
                  </button>
                </form>
              </details>

              {/* Moderation Controls Form */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleModerate(rev.id, "APPROVED")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl border transition-colors ${
                      rev.status === "APPROVED"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{arm.approveButton}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModerate(rev.id, "FLAGGED")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl border transition-colors ${
                      rev.status === "FLAGGED"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{arm.flagButton}</span>
                  </button>

                  <form action={handleDelete}>
                    <input type="hidden" name="reviewId" value={rev.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-bold text-[11px]"
                      title={isAr ? "حذف التقييم نهائياً" : "Delete review"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isAr ? "حذف" : "Delete"}</span>
                    </button>
                  </form>
                </div>

                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{arm.verifiedGovernanceLabel}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
