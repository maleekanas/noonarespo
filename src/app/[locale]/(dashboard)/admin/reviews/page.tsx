import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  Star,
  ArrowRight,
  Users,
} from "lucide-react";
import { reviewService } from "@/server/services/ReviewService";
import { ReviewStatus } from "@/server/repositories/ReviewRepository";
import { administrationService } from "@/server/services/AdministrationService";
import { getDictionary } from "@/lib/localization";
import { reviewTranslationAdapter } from "@/lib/integrations/ai/ReviewTranslationAdapter";
import { requireAdminHubAccess } from "@/lib/auth/currentUser";
import ReviewManagementClient, {
  SerializedParentReview,
  ReviewTranslationData,
} from "@/components/admin/ReviewManagementClient";

export default async function AdminReviewModerationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const adminSession = await requireAdminHubAccess(locale, "reviews");
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const arm = dict.adminReviews;

  const unfilteredReviews = await reviewService.getAllReviewsForAdmin();

  // Per-teacher ratings summary
  const teacherIds = Array.from(new Set(unfilteredReviews.map((r) => r.teacherId)));
  const teacherNameById = new Map(unfilteredReviews.map((r) => [r.teacherId, r.teacherName]));
  const teacherSummaries = (
    await Promise.all(teacherIds.map((id) => reviewService.getTeacherReviewSummary(id)))
  ).sort((a, b) => b.averageRating - a.averageRating || b.totalReviewsCount - a.totalReviewsCount);

  // Translations
  const rawTranslations = await reviewTranslationAdapter.translateReviewBatch(
    unfilteredReviews.map((rev) => ({
      id: rev.id,
      title: rev.titleAr,
      comment: rev.commentAr,
      adminReply: rev.adminReplyAr,
    })),
    locale
  );

  const translationsMap: Record<string, ReviewTranslationData> = {};
  rawTranslations.forEach((val, key) => {
    translationsMap[key] = {
      title: val.title,
      comment: val.comment,
      adminReply: val.adminReply,
    };
  });

  // Serialize reviews for Client Component
  const serializedReviews: SerializedParentReview[] = unfilteredReviews.map((r) => ({
    id: r.id,
    parentId: r.parentId,
    parentName: r.parentName,
    teacherId: r.teacherId,
    teacherName: r.teacherName,
    rating: r.rating,
    titleAr: r.titleAr,
    commentAr: r.commentAr,
    status: r.status,
    adminReplyAr: r.adminReplyAr,
    createdAt: r.createdAt.toISOString(),
  }));

  // Server Action: Moderate Review Status
  async function handleModerateStatusAction(reviewId: string, newStatus: ReviewStatus) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "reviews");
    const updated = await reviewService.moderateReview(reviewId, newStatus);
    if (!updated) return { success: false, message: "Review not found" };

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: `MODERATE_REVIEW_${newStatus}`,
      actor: currentAdmin,
      targetEntityId: reviewId,
      targetEntityType: "ParentReview",
      diffSummary: `Moderated review status to ${newStatus}`,
    });

    revalidatePath(`/${locale}/admin/reviews`);
    revalidatePath(`/${locale}/parent/reviews`);
    return { success: true };
  }

  // Server Action: Post Official Admin Reply
  async function handleReplyAction(reviewId: string, replyText: string) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "reviews");
    const updated = await reviewService.replyToReview(reviewId, replyText);
    if (!updated) return { success: false, message: "Review not found" };

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "REPLY_REVIEW",
      actor: currentAdmin,
      targetEntityId: reviewId,
      targetEntityType: "ParentReview",
      diffSummary: `Posted official admin reply to review: "${replyText.slice(0, 40)}..."`,
    });

    revalidatePath(`/${locale}/admin/reviews`);
    revalidatePath(`/${locale}/parent/reviews`);
    return { success: true };
  }

  // Server Action: Delete Review
  async function handleDeleteAction(reviewId: string) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "reviews");
    const deleted = await reviewService.deleteReview(reviewId);
    if (!deleted) return { success: false, message: "Review not found" };

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "DELETE_REVIEW",
      actor: currentAdmin,
      targetEntityId: reviewId,
      targetEntityType: "ParentReview",
      diffSummary: `Deleted review permanently`,
    });

    revalidatePath(`/${locale}/admin/reviews`);
    revalidatePath(`/${locale}/parent/reviews`);
    return { success: true };
  }

  // Server Action: Bulk Moderate Selected Reviews
  async function handleBulkModerateAction(reviewIds: string[], bulkStatus: ReviewStatus) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "reviews");
    const { succeededIds } = await reviewService.bulkModerateReviews(reviewIds, bulkStatus);

    await administrationService.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: `BULK_MODERATE_REVIEWS_${bulkStatus}`,
      actor: currentAdmin,
      targetEntityId: reviewIds.join(","),
      targetEntityType: "ParentReview",
      diffSummary: `Bulk moderated ${succeededIds.length} reviews to ${bulkStatus}`,
    });

    revalidatePath(`/${locale}/admin/reviews`);
    revalidatePath(`/${locale}/parent/reviews`);
    return { success: true, count: succeededIds.length };
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

      {/* Interactive Reviews Management Hub Client */}
      <ReviewManagementClient
        initialReviews={serializedReviews}
        translations={translationsMap}
        locale={locale}
        onModerateStatus={handleModerateStatusAction}
        onReplyReview={handleReplyAction}
        onDeleteReview={handleDeleteAction}
        onBulkModerate={handleBulkModerateAction}
      />
    </div>
  );
}
