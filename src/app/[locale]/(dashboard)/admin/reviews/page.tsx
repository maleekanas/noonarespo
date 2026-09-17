import React from "react";
import Link from "next/link";
import {
  Star,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Flag,
  MessageSquare,
} from "lucide-react";
import { reviewService } from "@/server/services/ReviewService";
import { ReviewStatus } from "@/server/repositories/ReviewRepository";
import { getDictionary } from "@/lib/localization";
import { reviewTranslationAdapter } from "@/lib/integrations/ai/ReviewTranslationAdapter";
import { requireAdminSession } from "@/lib/auth/currentUser";

// rev.titleAr/commentAr/adminReplyAr hold only the language the reviewer or
// admin actually typed in -- live-translated below via
// reviewTranslationAdapter for locales other than Arabic (see parent
// reviews page for the same pattern); falls back to the original text if
// translation isn't configured or fails.
const INTL_LOCALE: Record<string, string> = {
  ar: "ar-SA", en: "en-US", nl: "nl-NL", tr: "tr-TR", it: "it-IT", es: "es-ES",
};

export default async function AdminReviewModerationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdminSession(locale);
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const arm = dict.adminReviews;

  const allReviews = await reviewService.getAllReviewsForAdmin();

  const translations = await reviewTranslationAdapter.translateReviewBatch(
    allReviews.map((rev) => ({
      id: rev.id,
      title: rev.titleAr,
      comment: rev.commentAr,
      adminReply: rev.adminReplyAr,
    })),
    locale
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Top Header */}
      <div className="mb-8">
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

            {/* Admin Reply */}
            {displayAdminReply && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                  <span>{arm.officialAdminReplyLabel}</span>
                </div>
                <p className="text-slate-600 text-[11px] ps-2">{displayAdminReply}</p>
              </div>
            )}

            {/* Moderation Controls Form */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <form
                  action={async () => {
                    "use server";
                    await requireAdminSession(locale);
                    await reviewService.moderateReview(rev.id, "APPROVED" as ReviewStatus);
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{arm.approveButton}</span>
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await requireAdminSession(locale);
                    await reviewService.moderateReview(rev.id, "FLAGGED" as ReviewStatus);
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{arm.flagButton}</span>
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
