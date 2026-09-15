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

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href={`/${locale}/parent/billing`} className="hover:text-brand-600 flex items-center gap-1">
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
            {isAr ? "العودة لبوابة ولي الأمر" : "Back to Parent Portal"}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">{isAr ? "تقييمات وتجارب أولياء الأمور" : "Parent Reviews"}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
          <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
          {isAr ? "تقييمات الكادر التعليمي وتجارب أولياء الأمور ⭐" : "Teacher Reviews & Ratings ⭐"}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {isAr
            ? "شارك تجربتك التربوية وقيم أداء معلمي أطفالك لدعم مجتمع الأكاديمية وضمان أعلى معايير الجودة التعليمية."
            : "Share your feedback and rate your children's teachers to help fellow families and maintain educational excellence."}
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
          {isAr
            ? "لا يوجد معلم معيّن لأطفالك بعد. سيظهر هنا بمجرد تسجيل طفلك في فصل."
            : "No teacher is assigned to your children yet. This will appear once your child is enrolled in a class."}
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
                {isAr ? "معلم معتمد" : "Verified Teacher"}
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-1">
              {isAr
                ? `معلم طفلك: ${activeTeacher.studentNames.join("، ")}`
                : `Teaching: ${activeTeacher.studentNames.join(", ")}`}
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
              {summary.totalReviewsCount} {isAr ? "تقييمات موثقة" : "verified reviews"}
            </div>
          </div>

          <div className="ps-4 border-s border-white/20">
            <div className="text-2xl font-black">100%</div>
            <div className="text-xs text-amber-100">{isAr ? "يوصون به" : "Recommended"}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Review Submission Form (1 Col) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isAr ? `أضف تقييمك لـ ${activeTeacher.teacherName}` : "Submit Your Review"}</span>
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
                  {isAr ? "التقييم العام (بالنجوم):" : "Star Rating:"}
                </label>
                <select
                  name="rating"
                  defaultValue="5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="5">⭐⭐⭐⭐⭐ ممتاز (5 من 5)</option>
                  <option value="4">⭐⭐⭐⭐ جيد جداً (4 من 5)</option>
                  <option value="3">⭐⭐⭐ جيد (3 من 5)</option>
                  <option value="2">⭐⭐ مقبول (2 من 5)</option>
                  <option value="1">⭐ ضعيف (1 من 5)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "عنوان التقييم:" : "Review Title:"}
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder={isAr ? "مثال: أسلوب ملهم وتطور سريع لابني" : "e.g. Great teacher, very patient"}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "رأيك التربوي المفصل:" : "Detailed Feedback:"}
                </label>
                <textarea
                  name="comment"
                  rows={4}
                  placeholder={isAr ? "اكتب انطباعك عن تعامل المعلم وتفاعل طفلك معه..." : "Write your thoughts on the teacher..."}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAr ? "نشر التقييم المعتمد" : "Publish Review"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Reviews Feed (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>{isAr ? "آراء أولياء الأمور الموثقة" : "Verified Parent Testimonials"}</span>
            </h3>
            <span className="text-xs text-slate-500">
              {summary.totalReviewsCount} {isAr ? "تقييمات" : "reviews"}
            </span>
          </div>

          <div className="space-y-4">
            {summary.reviews.map((rev) => (
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
                            {isAr ? "ولي أمر معتمد" : "Verified Parent"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {rev.createdAt.toLocaleDateString(isAr ? "ar-SA" : "en-US")}
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

                <div className="text-xs sm:text-sm font-bold text-slate-900">{rev.titleAr}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.commentAr}</p>

                {/* Academy Response */}
                {rev.adminReplyAr && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1 mt-2">
                    <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                      <span>{isAr ? "رد إدارة أكاديمية براعم العربية:" : "Academy Administration Reply:"}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed ps-3">
                      {rev.adminReplyAr}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
