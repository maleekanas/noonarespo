import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { userRepository } from "@/server/repositories/UserRepository";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { academicService } from "@/server/services/AcademicService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import { getParentAccessLevel } from "@/lib/auth/subscriptionAccess";
import { Users, BookOpen, CheckCircle2, Lock, Sparkles } from "lucide-react";

export default async function ParentEnrollPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ studentId?: string; program?: string }>;
}) {
  const { locale } = await params;
  const { studentId: selectedStudentIdParam, program: selectedProgramParam } = await searchParams;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;

  // Live class enrollment is the single highest-value feature in the app --
  // it's the one thing that consumes real teacher capacity rather than being
  // a self-serve recorded/audio experience. It's deliberately excluded from
  // the 1-day free trial (see subscriptionAccess.ts) so a trial account can
  // fully explore pronunciation/phonics/stories/Quran/printables to see how
  // strong the platform is at teaching, while live classes stay a clear
  // reason to convert to a paid plan.
  const access = await getParentAccessLevel(parentId);
  const isTrialLocked = access.level === "TRIAL";

  const children = await userRepository.getLinkedChildren(parentId);
  const selectedStudentId = selectedStudentIdParam || (children.length > 0 ? children[0].id : "");

  const allPrograms = await academicRepository.getAllPrograms();
  const allLevels = await academicRepository.getAllLevels();
  const allCourses = await academicRepository.getAllCourses();

  // Create lookup maps
  const levelMap = new Map(allLevels.map((l) => [l.id, l]));
  const courseMap = new Map(allCourses.map((c) => [c.id, c]));
  const programMap = new Map(allPrograms.map((p) => [p.id, p]));

  let classGroups = await academicRepository.getAllClassGroups();

  if (selectedProgramParam) {
    classGroups = classGroups.filter((cg) => {
      const lvl = levelMap.get(cg.courseLevelId);
      if (!lvl) return false;
      const crs = courseMap.get(lvl.courseId);
      return crs?.programId === selectedProgramParam;
    });
  }

  // Load enrollments for all class groups to compute capacity
  const classEnrollmentCounts: Record<string, number> = {};
  for (const cg of classGroups) {
    const enrs = await academicRepository.getEnrollmentsByClassGroupId(cg.id);
    classEnrollmentCounts[cg.id] = enrs.length;
  }

  // Load selected child's active enrollments
  const childEnrollments = selectedStudentId
    ? await academicRepository.getEnrollmentsByStudentId(selectedStudentId)
    : [];
  const enrolledClassIds = new Set(childEnrollments.map((e) => e.classGroupId));

  async function handleEnroll(formData: FormData) {
    "use server";
    const studentId = formData.get("studentId")?.toString();
    const classGroupId = formData.get("classGroupId")?.toString();

    if (!studentId || !classGroupId) return;

    // Defense in depth: the UI below already hides the enrollment grid
    // during a trial, but a direct form POST must not be able to bypass
    // that -- so the same access check is re-derived and enforced here
    // server-side rather than trusted from the client.
    const { profile: enrollingProfile } = await requireParentProfile(locale);
    const enrollingAccess = await getParentAccessLevel(enrollingProfile.id);
    if (enrollingAccess.level === "TRIAL") {
      console.warn("Blocked enrollment attempt from trial account:", enrollingProfile.id);
      return;
    }

    try {
      await academicService.enrollStudent(studentId, classGroupId);
      revalidatePath(`/${locale}/parent/enroll`);
      revalidatePath(`/${locale}/parent`);
    } catch (e: unknown) {
      console.error("Enrollment failed:", e);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/parent`} className="hover:underline">
              لوحة ولي الأمر
            </Link>
            <span>/</span>
            <Link href={`/${locale}/parent/children`} className="hover:underline">
              إدارة الأبناء
            </Link>
            <span>/</span>
            <span>تسجيل في الفصول</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            كتالوج التسجيل في الفصول الدراسية 🎓
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            اختر الطفل والفصل المناسب من بين المسارات الأكاديمية السبعة المعتمدة
          </p>
        </div>

        {/* Child Selection Filter */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">التسجيل لـ:</span>
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/${locale}/parent/enroll?studentId=${child.id}${selectedProgramParam ? `&program=${selectedProgramParam}` : ""}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  child.id === selectedStudentId
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {child.firstName} ({child.ageGroup === "AGE_4_6" ? "براعم" : "مستكشفون"})
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 7 Programs Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href={`/${locale}/parent/enroll?studentId=${selectedStudentId}`}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
            !selectedProgramParam
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
          }`}
        >
          جميع المسارات ({classGroups.length})
        </Link>
        {allPrograms.map((prog) => {
          const isSelected = prog.id === selectedProgramParam;
          return (
            <Link
              key={prog.id}
              href={`/${locale}/parent/enroll?studentId=${selectedStudentId}&program=${prog.id}`}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
            >
              {prog.titleAr}
            </Link>
          );
        })}
      </div>

      {/* Trial Upsell -- replaces the live class enrollment grid entirely
          while on the 1-day free trial. Live classes are the one feature
          that consumes real teacher time/capacity, so they're the clearest,
          highest-value reason to convert to a paid plan. */}
      {isTrialLocked ? (
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-8 sm:p-10 text-white text-center space-y-4 shadow-lg shadow-brand-500/20">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold">
            الفصول المباشرة مع المعلمين غير متاحة خلال التجربة المجانية
          </h2>
          <p className="text-sm text-white/80 max-w-lg mx-auto leading-relaxed">
            جرّب استوديو النطق، وألعاب الصوتيات، وقارئ القصص، وتلاوة القرآن، والمطبوعات القابلة للطباعة مجاناً
            الآن لتكتشف قوة المنهج. الاشتراك في فصل جماعي مباشر مع معلم متخصص متاح فقط للحسابات المدفوعة.
          </p>
          <Link
            href={`/${locale}/parent/billing`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-700 font-bold text-sm shadow-md hover:opacity-90 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>الترقية الآن للانضمام إلى فصل مباشر</span>
          </Link>
        </div>
      ) : (
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <span>الفصول المتاحة حالياً ({classGroups.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classGroups.map((group) => {
            const currentCount = classEnrollmentCounts[group.id] || 0;
            const isFull = currentCount >= group.capacityMax;
            const isEnrolled = enrolledClassIds.has(group.id);
            const lvl = levelMap.get(group.courseLevelId);
            const crs = lvl ? courseMap.get(lvl.courseId) : null;
            const prg = crs ? programMap.get(crs.programId) : null;

            return (
              <div
                key={group.id}
                className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between space-y-6 ${
                  isEnrolled ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                      فصل جماعي مصغر
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                        isFull
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{currentCount} / {group.capacityMax} مقاعد</span>
                    </span>
                  </div>

                  <div>
                    {prg && (
                      <span className="text-[11px] font-extrabold text-brand-600 block mb-1">
                        {prg.titleAr} • المستوى {lvl?.levelCode}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {group.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      حصتان أسبوعياً مباشرة مع المعلم ومتابعة للواجبات الصوتية
                    </p>
                  </div>
                </div>

                {/* Enrollment Button / Status */}
                {isEnrolled ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>مسجل بالفعل في هذا الفصل</span>
                  </div>
                ) : isFull ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed text-center"
                  >
                    الفصل مكتمل (لا توجد مقاعد شاغرة)
                  </button>
                ) : (
                  <form action={handleEnroll}>
                    <input type="hidden" name="studentId" value={selectedStudentId} />
                    <input type="hidden" name="classGroupId" value={group.id} />
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
                    >
                      تأكيد تسجيل الطفل في هذا الفصل
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
