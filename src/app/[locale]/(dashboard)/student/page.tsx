import React from "react";
import Link from "next/link";
import {
  Flame,
  Award,
  Video,
  Clock,
  Sparkles,
  FileCheck,
  Trophy,
  Gamepad2,
  GraduationCap,
  Bot,
  BookOpen,
  Mic,
  Compass,
  Layers,
  UserCog,
} from "lucide-react";
import { gamificationService } from "@/server/services/GamificationService";
import { schedulingService } from "@/server/services/SchedulingService";
import { requireStudentProfile } from "@/lib/auth/currentUser";
import { getDictionary } from "@/lib/localization";

// profile.levelTitleAr/En and badge.titleAr/titleEn are seeded, DB-backed
// content that (like Program/CurriculumModule) currently only exists in
// Arabic/English -- a separate, larger follow-up from the UI-chrome fix
// below. Non-Arabic locales fall back to the English content value, same
// as the established convention elsewhere in the app.
const INTL_LOCALE: Record<string, string> = {
  ar: "ar", en: "en-US", nl: "nl-NL", tr: "tr-TR", it: "it-IT", es: "es-ES",
};

export default async function StudentDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const sd = dict.studentDashboard;
  const { profile: studentProfile } = await requireStudentProfile(locale);
  const studentId = studentProfile.id;

  const profile = await gamificationService.getStudentGamification(studentId);
  const nextSession = await schedulingService.getNextSessionForStudent(studentId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Greeting & Gamification Stats Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden space-y-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                {`${sd.levelPrefix} ${profile.level}: ${isAr ? profile.levelTitleAr : profile.levelTitleEn}`}
              </span>
              <Link
                href={`/${locale}/student/placement`}
                className="px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-300 transition-colors"
              >
                {sd.placementAssessmentCta}
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {sd.welcomeChampion.replace("{name}", studentProfile.firstName)}
            </h1>
            <p className="text-sm text-purple-100 max-w-lg">
              {nextSession
                ? sd.nextSessionWith.replace("{teacher}", `${nextSession.teacherFirstName} ${nextSession.teacherLastName}`)
                : sd.noLiveSessionScheduled}
            </p>
          </div>

          <Link
            href={`/${locale}/account`}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white transition-colors self-start"
            title={dict.account.title}
          >
            <UserCog className="w-5 h-5" />
          </Link>

          {/* Gamification Live Counters */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
            <div className="text-center">
              <div className="flex items-center gap-1 text-amber-300 font-extrabold text-xl sm:text-2xl">
                <Flame className="w-6 h-6 fill-amber-300" />
                <span>{profile.streakDays}</span>
              </div>
              <span className="text-[11px] text-purple-200 font-semibold">{sd.dayStreak}</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center gap-1 text-yellow-300 font-extrabold text-xl sm:text-2xl">
                <Sparkles className="w-6 h-6" />
                <span>{profile.totalXp}</span>
              </div>
              <span className="text-[11px] text-purple-200 font-semibold">{sd.totalXp}</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center gap-1 text-emerald-300 font-extrabold text-xl sm:text-2xl">
                <Award className="w-6 h-6" />
                <span>{profile.unlockedBadges.length}</span>
              </div>
              <span className="text-[11px] text-purple-200 font-semibold">{sd.honorBadges}</span>
            </div>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-purple-100">
            <span>{sd.progressToNextLevel.replace("{xp}", String(profile.nextLevelXp))}</span>
            <span>{profile.progressToNextLevelPercentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${profile.progressToNextLevelPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards for Gamification & Activities */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
        <Link
          href={`/${locale}/student/roadmap`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">{sd.questMapTitle}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{sd.starJourney}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/student/flashcards`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">{sd.vocabularySrs}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{sd.smartSrsXp}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/student/stories`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">{sd.storybook}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{sd.listenXp}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/student/pronunciation`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">{sd.voiceStudio}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{sd.waveformXp}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/student/quran-studio`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">{sd.quranStudio}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{sd.tajweedXp}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/student/activities`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">{sd.phonicsArcade}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{sd.arcadeXp}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/student/leaderboard`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">{sd.leaderboard}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{sd.topChampions}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/student/certificates`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">{sd.certificatesTitle}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{sd.accredited}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/student/placement`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">{sd.placementTitle}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{sd.sevenQsXp}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/student/ai-tutor`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">{sd.faseehTutor}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{sd.chatXp}</span>
          </div>
        </Link>
      </div>

      {/* Main Grid: Today's Class & Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Next Lesson & Homework */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Live Class Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Video className="w-5 h-5 text-brand-600" />
                <span>{sd.upcomingLiveClass}</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {sd.confirmedToday}
              </span>
            </div>

            {nextSession ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{nextSession.classGroupName}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {nextSession.startTimeUtc.toLocaleString(INTL_LOCALE[locale] || "en-US", {
                          weekday: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                    <span>
                      {sd.teacherPrefix.replace("{teacher}", `${nextSession.teacherFirstName} ${nextSession.teacherLastName}`)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/${locale}/classroom/${nextSession.sessionId}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-md hover:opacity-95 transition-all text-center"
                >
                  <Video className="w-4 h-4" />
                  <span>{sd.joinVirtualClassroom}</span>
                </Link>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-sm text-slate-500">
                {sd.noUpcomingLiveClass}
              </div>
            )}
          </div>

          {/* Pending Homework Tasks */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FileCheck className="w-5 h-5 text-purple-600" />
                <span>{sd.myHomeworkAudio}</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">{sd.activeTask}</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">
                    {sd.voiceRecordingTask}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {sd.gradeAwarded}
                  </p>
                </div>
                <Link
                  href={`/${locale}/student/homework/hw-1`}
                  className="px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                >
                  {sd.viewRubricFeedback}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Badges & Rewards */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Award className="w-5 h-5 text-amber-500" />
                <span>{sd.myAchievementBadges}</span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {sd.badgeCountOf.replace("{unlocked}", String(profile.unlockedBadges.length)).replace("{total}", String(profile.allBadges.length))}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {profile.allBadges.map((badge) => {
                const isUnlocked = profile.unlockedBadges.some((b) => b.code === badge.code);
                return (
                  <div
                    key={badge.code}
                    className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                      isUnlocked
                        ? "bg-amber-50/70 border-amber-200"
                        : "bg-slate-50 border-slate-200 opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-3xl block">
                      {badge.code === "READING_CHAMPION"
                        ? "📖"
                        : badge.code === "QURAN_STAR"
                        ? "⭐"
                        : badge.code === "PERFECT_ATTENDANCE"
                        ? "🎯"
                        : badge.code === "STREAK_MASTER"
                        ? "🔥"
                        : "✍️"}
                    </span>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isAr ? badge.titleAr : badge.titleEn}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {isUnlocked ? sd.badgeUnlocked : sd.badgeLocked}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
