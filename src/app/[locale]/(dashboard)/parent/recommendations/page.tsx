import React from "react";
import Link from "next/link";
import { userRepository } from "@/server/repositories/UserRepository";
import { recommendationService } from "@/server/services/RecommendationService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import {
  Sparkles,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  ArrowRight,
  Flame,
  Volume2,
} from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

export default async function ParentRecommendationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { locale } = await params;
  const { studentId: queryStudentId } = await searchParams;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;

  const children = await userRepository.getLinkedChildren(parentId);
  const activeStudentId = queryStudentId || (children.length > 0 ? children[0].id : "student-1");
  const activeChild = children.find((c) => c.id === activeStudentId) || children[0];

  const overview = await recommendationService.getParentRecommendationOverview(activeStudentId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Multi-Child Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/parent`} className="hover:underline">
              بوابة ولي الأمر
            </Link>
            <span>/</span>
            <span>التوصيات التعليمية الذكية</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            مركز التوصيات ومسار الإتقان (AI Recommendations) 🎯
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تحليل ذكي لمستوى طفلك، رصد نقاط القوة وفرص التطوير، وخطة تمارين منزلية مخصصة
          </p>
        </div>

        {/* Child Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/${locale}/parent/recommendations?studentId=${child.id}`}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                child.id === activeChild?.id
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {child.firstName} ({child.ageGroup === "AGE_4_6" ? "5 سنوات" : "8 سنوات"})
            </Link>
          ))}
        </div>
      </div>

      {/* Main Hero Banner: Child Diagnostic Summary */}
      <div className="bg-gradient-to-r from-indigo-700 via-brand-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md">
                المستوى الحالي: {overview.currentLevel}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold">
                {overview.recommendedDailyMinutes} دقيقة يومياً موصى بها
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              الخطة الإرشادية لـ {overview.studentName} 🌟
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
              وفقاً لأحدث تقييمات المعلم وجلسات استوديو التلاوة، يحرز طفلك تقدماً لافتاً في الطلاقة القرائية، ويحتاج إلى دعم خفيف في مخارج حروف القلقلة لإنهاء متطلبات المستوى القادم.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-300 font-extrabold text-xl">
                <Flame className="w-5 h-5 fill-amber-300" />
                <span>{overview.streakDays}</span>
              </div>
              <span className="text-[11px] text-indigo-200 block mt-0.5">أيام نشطة</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-300 font-extrabold text-xl">
                <Target className="w-5 h-5" />
                <span>{overview.milestoneProgress.overallProgressPercent}%</span>
              </div>
              <span className="text-[11px] text-indigo-200 block mt-0.5">إنجاز المستوى A2</span>
            </div>
          </div>
        </div>

        {/* Competencies Quick Bar */}
        <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-100">
            <span>مؤشرات الكفاءات اللغوية الخمس (مبنية على تقييمات المعلم والاختبارات)</span>
            <span>المعدل التراكمي: {overview.competencies.overallAverage}%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-[11px] text-indigo-200 block">الاستماع</span>
              <span className="text-base font-extrabold text-white">{overview.competencies.listeningScore}%</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-[11px] text-indigo-200 block">المحادثة</span>
              <span className="text-base font-extrabold text-white">{overview.competencies.speakingScore}%</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-[11px] text-indigo-200 block">القراءة</span>
              <span className="text-base font-extrabold text-emerald-300">{overview.competencies.readingScore}%</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-[11px] text-indigo-200 block">الكتابة</span>
              <span className="text-base font-extrabold text-white">{overview.competencies.writingScore}%</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[11px] text-indigo-200 block">القرآن والتجويد</span>
              <span className="text-base font-extrabold text-amber-300">{overview.competencies.quranScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Actionable Recommendations & Milestone Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recommendations List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>التوصيات الإرشادية ذات الأولوية (خطوات عملية للمنزل)</span>
            </h3>
            <span className="text-xs text-slate-500">
              {overview.recommendations.length} توصيات مقترحة
            </span>
          </div>

          <div className="space-y-4">
            {overview.recommendations.map((rec) => {
              const isHigh = rec.priority === "HIGH";
              const isMed = rec.priority === "MEDIUM";

              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-brand-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                          isHigh
                            ? "bg-rose-100 text-rose-800"
                            : isMed
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isHigh ? "أولوية مرتفعة" : isMed ? "أولوية متوسطة" : "تعزيز إيجابي"}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {rec.titleAr}
                      </h4>
                    </div>

                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rec.estimatedMinutesPerDay} دقائق يومياً</span>
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-600 space-y-2 leading-relaxed">
                    <p>
                      <strong className="text-slate-800">سبب التوصية:</strong> {rec.rationaleAr}
                    </p>
                    <p>
                      <strong className="text-brand-700">ما الذي يمكنك فعله كولي أمر؟</strong>{" "}
                      {rec.suggestedActionAr}
                    </p>
                  </div>

                  {rec.curatedResourceTitleAr && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        {rec.curatedResourceType === "STORY" ? (
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-brand-600" />
                        )}
                        <span>المصدر المقترح: {rec.curatedResourceTitleAr}</span>
                      </div>

                      <Link
                        href={`/${locale}/student/quran-studio`}
                        className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                      >
                        <span>فتح النشاط</span>
                        <DirectionalIcon icon={ArrowRight} locale={locale} className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Curated Resources Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-600" />
              <span>المكتبة التعليمية الموصى بها لمرحلة {activeChild?.firstName}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {overview.curatedResources.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-brand-50/20 hover:border-brand-300 transition-all space-y-2"
                >
                  <div className="text-3xl">{res.icon}</div>
                  <h4 className="text-xs font-bold text-slate-900">{res.titleAr}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{res.descriptionAr}</p>
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md inline-block">
                    {res.durationMinutes} دقيقة تفاعلية
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: CEFR Milestones Checklist */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600">
                <Target className="w-4 h-4" />
                <span>المعايير الدولية (CEFR)</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {overview.milestoneProgress.targetLevelTitleAr}
              </h3>
              <p className="text-xs text-slate-500">
                قائمة المعايير الواجب اجتيازها للترقي إلى المستوى القادم
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">التقدم العام للمستوى</span>
                <span className="text-brand-600 font-mono">
                  {overview.milestoneProgress.overallProgressPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-500"
                  style={{ width: `${overview.milestoneProgress.overallProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Milestone Items */}
            <div className="space-y-3 pt-2">
              {overview.milestoneProgress.milestones.map((m) => (
                <div
                  key={m.code}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                    m.isAchieved
                      ? "bg-emerald-50/70 border-emerald-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {m.isAchieved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span
                        className={`font-bold block ${
                          m.isAchieved ? "text-emerald-950" : "text-slate-900"
                        }`}
                      >
                        {m.titleAr}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {m.evidenceAr}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href={`/${locale}/parent/progress?studentId=${activeStudentId}`}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 text-center block transition-colors"
              >
                عرض رادار الكفاءات والتحليلات التفصيلية
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
