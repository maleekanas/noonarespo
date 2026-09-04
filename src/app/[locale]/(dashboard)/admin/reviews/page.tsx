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

export default async function AdminReviewModerationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const allReviews = await reviewService.getAllReviewsForAdmin();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href={`/${locale}/admin`} className="hover:text-brand-600 flex items-center gap-1">
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
            {isAr ? "العودة إلى لوحة العمليات" : "Back to Admin Hub"}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">{isAr ? "إدارة التقييمات والجودة" : "Review Moderation"}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
          <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
          {isAr ? "إدارة تقييمات أولياء الأمور وجودة التدريس" : "Teacher Reviews & Quality Moderation"}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {isAr
            ? "مراجعة واعتماد تقييمات أولياء الأمور للمعلمين والمقررات لضمان المصداقية ومتابعة جودة الفصول."
            : "Review, approve, and moderate parent feedback to maintain academy standards and transparency."}
        </p>
      </div>

      {/* Reviews Moderation List */}
      <div className="space-y-4">
        {allReviews.map((rev) => (
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
                      قيم {rev.teacherName}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {rev.createdAt.toLocaleDateString(isAr ? "ar-SA" : "en-US")}
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
              <h3 className="font-bold text-slate-900 text-sm mb-1">{rev.titleAr}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{rev.commentAr}</p>
            </div>

            {/* Admin Reply */}
            {rev.adminReplyAr && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                  <span>{isAr ? "رد الإدارة المعتمد:" : "Official Admin Reply:"}</span>
                </div>
                <p className="text-slate-600 text-[11px] ps-2">{rev.adminReplyAr}</p>
              </div>
            )}

            {/* Moderation Controls Form */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <form
                  action={async () => {
                    "use server";
                    await reviewService.moderateReview(rev.id, "APPROVED" as ReviewStatus);
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? "اعتماد النشر" : "Approve"}</span>
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await reviewService.moderateReview(rev.id, "FLAGGED" as ReviewStatus);
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{isAr ? "حجب التقييم" : "Flag"}</span>
                  </button>
                </form>
              </div>

              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isAr ? "حوكمة مراجعة الجودة نشطة" : "Verified Governance"}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
