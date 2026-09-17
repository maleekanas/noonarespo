import React from "react";
import Link from "next/link";
import {
  Star,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Send,
} from "lucide-react";
import { reviewService } from "@/server/services/ReviewService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import { userRepository } from "@/server/repositories/UserRepository";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { getDictionary } from "@/lib/localization";
import { reviewTranslationAdapter } from "@/lib/integrations/ai/ReviewTranslationAdapter";

// rev.titleAr/commentAr/adminReplyAr hold only the language the reviewer or
// admin actually typed in -- there is no titleEn/commentEn pair to fall back
// to, unlike other bilingual DB fields elsewhere in the app. Live-translated
// below via reviewTranslationAdapter for locales other than Arabic; falls
// back to the original text if translation isn't configured or fails.
const INTL_LOCALE: Record<string, string> = {
  ar: "ar-SA", en: "en-US", nl: "nl-NL", tr: "tr-TR", it: "it-IT", es: "es-ES",
};


export default async function ParentReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ teacherId?: string }>;
}) {
  const { locale } = await params;
  const { teacherId: queryTeacherId } = await searchParams;
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const pr = dict.parentReviews;
  const { profile } = await requireParentProfile(locale);

  // Resolve the real teacher(s) actually assigned to this parent's children,
  // instead of a single hardcoded "أحمد حسن" spotlight shown to every
  // parent regardless of who teaches their child.
  const children = await userRepository.getLinkedChildren(profile.id);
  const teacherOptionsMap = new Map<string, { teacherId: string; teacherName: string; studentNames: string[] }>();
  for (const child of children) {
    const enrollments = await academicRepository.getEnrollmentsByStudentId(child.id);
    for (const enr of enrollments) {
      const assignments = await academicRepository.getTeacherAssignmentsByClassGroupId(enr.classGroupId);
      const assignedTeacherId = assignments[0]?.teacherId;
      if (!assignedTeacherId) continue;
      const teacher = await userRepository.findTeacherProfileById(assignedTeacherId);
      if (!teacher) continue;
      const existing = teacherOptionsMap.get(assignedTeacherId);
      const studentName = `${child.firstName} ${child.lastName}`;
      if (existing) {
        if (!existing.studentNames.includes(studentName)) existing.studentNames.push(studentName);
      } else {
        teacherOptionsMap.set(assignedTeacherId, {
          teacherId: assignedTeacherId,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          studentNames: [studentName],
        });
      }
    }
  }
  const teacherOptions = Array.from(teacherOptionsMap.values());
  const activeTeacher =
    teacherOptions.find((t) => t.teacherId === queryTeacherId) || teacherOptions[0];

  const summary = activeTeacher
    ? await reviewService.getTeacherReviewSummary(activeTeacher.teacherId)
    : { averageRating: 0, totalReviewsCount: 0, reviews: [] as Awaited<ReturnType<typeof reviewService.getTeacherReviewSummary>>["reviews"] };

  const translations = await reviewTranslationAdapter.translateReviewBatch(
    summary.reviews.map((rev) => ({
      id: rev.id,
      title: rev.titleAr,
      comment: rev.commentAr,
      adminReply: rev.adminReplyAr,
    })),
    locale
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href={`/${locale}/parent/billing`} className="hover:text-brand-600 flex items-center gap-1">
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
            {pr.backToParentPortal}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">{pr.breadcrumbCurrent}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
          <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
          {pr.pageHeading}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {pr.pageSubtitle}
        </p>
      </div>

      {/* Teacher Switcher (only when the parent has children with more than one assigned teacher) */}
      {teacherOptions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-4 text-xs">
          {teacherOptions.map((t) => (
            <Link
              key={t.teacherId}
              href={`/${locale}/parent/reviews?teacherId=${t.teacherId}`}
              className={`shrink-0 px-3.5 py-2 rounded-xl font-bold border transition-all ${
                t.teacherId === activeTeacher?.teacherId
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.teacherName}
            </Link>
          ))}
        </div>
      )}

      {!activeTeacher ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm text-center text-sm text-slate-500">
          {pr.noTeacherAssigned}
        </div>
      ) : (
      <>
      {/* Teacher Rating Spotlight Card */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-brand-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0">
            👨‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black">{activeTeacher.teacherName}</h2>
              <span className="px-2.5 py-0.5 bg-white/20 text-xs font-bold rounded-full">
                {pr.verifiedTeacherBadge}
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-1">
              {pr.teachingLabel.replace("{names}", activeTeacher.studentNames.join(pr.nameJoinSeparator))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-s border-white/20 pt-4 md:pt-0 md:ps-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black flex items-center justify-center gap-1">
              <span>{summary.averageRating}</span>
              <Star className="w-6 h-6 fill-white text-white" />
            </div>
            <div className="text-xs text-amber-100 mt-0.5">
              {summary.totalReviewsCount} {pr.verifiedReviewsSuffix}
            </div>
          </div>

          <div className="ps-4 border-s border-white/20">
            <div className="text-2xl font-black">100%</div>
            <div className="text-xs text-amber-100">{pr.recommendedLabel}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Review Submission Form (1 Col) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{pr.submitReviewFor.replace("{teacher}", activeTeacher.teacherName)}</span>
            </div>

            <form
              action={async (formData: FormData) => {
                "use server";
                const rating = parseInt(formData.get("rating") as string) || 5;
                const title = (formData.get("title") as string) || "تقييم متميز";
                const comment = (formData.get("comment") as string) || "معلم رائع ومتميز";

                await reviewService.submitParentReview({
                  parentId: profile.id,
                  parentName: `${profile.firstName} ${profile.lastName}`,
                  teacherId: activeTeacher.teacherId,
                  teacherName: activeTeacher.teacherName,

                  rating,
                  titleAr: title,
                  commentAr: comment,
                });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {pr.starRatingLabel}
                </label>
                <select
                  name="rating"
                  defaultValue="5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="5">{pr.ratingOption5}</option>
                  <option value="4">{pr.ratingOption4}</option>
                  <option value="3">{pr.ratingOption3}</option>
                  <option value="2">{pr.ratingOption2}</option>
                  <option value="1">{pr.ratingOption1}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {pr.reviewTitleLabel}
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder={pr.reviewTitlePlaceholder}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {pr.detailedFeedbackLabel}
                </label>
                <textarea
                  name="comment"
                  rows={4}
                  placeholder={pr.detailedFeedbackPlaceholder}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{pr.publishReviewButton}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Reviews Feed (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>{pr.verifiedTestimonialsHeading}</span>
            </h3>
            <span className="text-xs text-slate-500">
              {summary.totalReviewsCount} {pr.reviewsSuffix}
            </span>
          </div>

          <div className="space-y-4">
            {summary.reviews.map((rev) => {
              const translated = translations.get(rev.id);
              const displayTitle = translated?.title ?? rev.titleAr;
              const displayComment = translated?.comment ?? rev.commentAr;
              const displayAdminReply = translated?.adminReply ?? rev.adminReplyAr;

              return (
              <div
                key={rev.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-xs font-bold text-brand-700">
                        {rev.parentName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                          <span>{rev.parentName}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-semibold">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {pr.verifiedParentBadge}
                          </span>
                          {translated && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[10px] font-semibold">
                              {pr.translatedBadgeLabel}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {rev.createdAt.toLocaleDateString(INTL_LOCALE[locale] || "en-US")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stars Display */}
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-xs sm:text-sm font-bold text-slate-900">{displayTitle}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{displayComment}</p>

                {/* Academy Response */}
                {displayAdminReply && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1 mt-2">
                    <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                      <span>{pr.academyReplyLabel}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed ps-3">
                      {displayAdminReply}
                    </p>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
