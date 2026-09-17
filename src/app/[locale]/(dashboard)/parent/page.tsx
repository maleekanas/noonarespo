import React from "react";
import Link from "next/link";
import {
  CreditCard,
  MessageSquare,
  Sparkles,
  Calendar,
  Users,
  Award,
  Bell,
  Video,
  FileText,
  ArrowRight,
  Star,
  Target,
  Printer,
  UserCog,
} from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";
import { userRepository } from "@/server/repositories/UserRepository";
import { notificationService } from "@/server/services/NotificationService";
import { attendanceService } from "@/server/services/AttendanceService";
import { assignmentService } from "@/server/services/AssignmentService";
import { gamificationService } from "@/server/services/GamificationService";
import { schedulingService, UpcomingSessionSummary } from "@/server/services/SchedulingService";
import { billingService } from "@/server/services/BillingService";
import { prisma } from "@/lib/database/prisma";
import { SubscriptionStatus } from "@prisma/client";
import { requireParentProfile } from "@/lib/auth/currentUser";
import { getDictionary } from "@/lib/localization";

// subscription.plan.nameAr/nameEn, gamification badge.titleAr/titleEn, and
// course.titleAr/titleEn are seeded, DB-backed content that (like
// Program/CurriculumModule) currently only exists in Arabic/English -- a
// separate, larger follow-up from the UI-chrome fix below. Non-Arabic
// locales fall back to the English content value, same as the established
// convention elsewhere in the app.
const INTL_LOCALE: Record<string, string> = {
  ar: "ar", en: "en-US", nl: "nl-NL", tr: "tr-TR", it: "it-IT", es: "es-ES",
};

export default async function ParentDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const pd = dict.parentDashboard;
  const { studentId: selectedParam } = await searchParams;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;

  const children = await userRepository.getLinkedChildren(parentId);
  const selectedStudentId = selectedParam || (children.length > 0 ? children[0].id : "");
  const selectedChild = children.find((c) => c.id === selectedStudentId) || children[0];

  const notifications = await notificationService.getNotifications(parentId);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Real, Prisma/service-backed stats for the selected child -- replaces
  // what used to be fixed demo numbers (12/12 attendance, 98% homework,
  // 450 XP, a hardcoded teacher quote) with each child's actual record.
  // A parent with no children yet simply sees the honest empty states below.
  let attendanceSummary: Awaited<ReturnType<typeof attendanceService.getStudentAttendanceSummary>> | null = null;
  let homeworkSummary: Awaited<ReturnType<typeof assignmentService.getStudentHomeworkSummary>> | null = null;
  let gamification: Awaited<ReturnType<typeof gamificationService.getStudentGamification>> | null = null;
  let latestFeedback: Awaited<ReturnType<typeof assignmentService.getLatestFeedbackForStudent>> | null = null;
  let nextSession: UpcomingSessionSummary | null = null;

  if (selectedChild) {
    [attendanceSummary, homeworkSummary, gamification, latestFeedback, nextSession] = await Promise.all([
      attendanceService.getStudentAttendanceSummary(selectedChild.id),
      assignmentService.getStudentHomeworkSummary(selectedChild.id),
      gamificationService.getStudentGamification(selectedChild.id),
      assignmentService.getLatestFeedbackForStudent(selectedChild.id),
      schedulingService.getNextSessionForStudent(selectedChild.id),
    ]);
  }

  // Real, Stripe/Prisma-backed billing data for the parent (same source as
  // the Billing & Invoices page) -- replaces the fixed "$74.50 / Family
  // Plan / Renews Oct 1" and fake "#INV-2026-0901" invoice.
  const [subscription, recentInvoices] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        parentId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE] },
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { parentId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
  ]);
  const latestInvoice = recentInvoices[0] || null;

  const attendanceLabel = (rate: number) => {
    if (rate >= 95) return pd.attendanceExcellent;
    if (rate >= 80) return pd.attendanceGood;
    return pd.attendanceNeedsAttention;
  };

  const nextSessionTimeLabel = nextSession
    ? new Intl.DateTimeFormat(INTL_LOCALE[locale] || "en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
      }).format(nextSession.startTimeUtc)
    : null;
  const nextSessionDurationMinutes = nextSession
    ? Math.round((nextSession.endTimeUtc.getTime() - nextSession.startTimeUtc.getTime()) / 60000)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Quick Action Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            {pd.portalBadge}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {pd.welcomeHeading.replace("{firstName}", profile.firstName).replace("{lastName}", profile.lastName)}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {pd.subtitle}
          </p>
        </div>

        {/* Multi-Child Switcher Control & Notifications Shortcut */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/account`}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title={dict.account.title}
          >
            <UserCog className="w-5 h-5" />
          </Link>
          <Link
            href={`/${locale}/parent/notifications`}
            className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/${locale}/parent?studentId=${child.id}`}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  child.id === selectedChild?.id
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {child.firstName} ({child.ageGroup === "AGE_4_6" ? pd.age4to6 : pd.age7to12})
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Link
          href={`/${locale}/parent/printables`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{pd.printablesTitle}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{pd.printablesDesc}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/parent/recommendations?studentId=${selectedChild?.id}`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{pd.learningPlanTitle}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{pd.learningPlanDesc}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/parent/progress?studentId=${selectedChild?.id}`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{pd.competenciesTitle}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{pd.competenciesDesc}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/parent/messages`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{pd.messagesTitle}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{pd.messagesDesc}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/parent/meetings`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{pd.meetTitle}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{pd.meetDesc}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/parent/reports/weekly?studentId=${selectedChild?.id}`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{pd.weeklyReportTitle}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{pd.weeklyReportDesc}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/parent/reviews`}
          className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-1.5 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Star className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{pd.reviewsTitle}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{pd.reviewsDesc}</span>
          </div>
        </Link>
      </div>

      {/* Progress & Attendance Quick KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{pd.attendanceRateLabel}</span>
            {attendanceSummary && attendanceSummary.totalSessions > 0 && (
              <span className="text-emerald-600 font-bold">
                {attendanceSummary.ratePercentage}% {attendanceLabel(attendanceSummary.ratePercentage)}
              </span>
            )}
          </div>
          {attendanceSummary && attendanceSummary.totalSessions > 0 ? (
            <>
              <div className="text-3xl font-extrabold text-slate-900">
                {attendanceSummary.presentSessions} / {attendanceSummary.totalSessions}
              </div>
              <p className="text-xs text-slate-500">
                {pd.sessionsRecordedTerm}
              </p>
            </>
          ) : (
            <>
              <div className="text-3xl font-extrabold text-slate-300">—</div>
              <p className="text-xs text-slate-500">{pd.noClassesRecorded}</p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{pd.homeworkAverageLabel}</span>
            {homeworkSummary && homeworkSummary.averageScorePercentage !== null && (
              <span className="text-brand-600 font-bold">{homeworkSummary.averageScorePercentage}%</span>
            )}
          </div>
          {homeworkSummary && homeworkSummary.averageScorePercentage !== null ? (
            <>
              <div className="text-3xl font-extrabold text-slate-900">
                {(homeworkSummary.averageScorePercentage / 10).toFixed(1)} / 10
              </div>
              <p className="text-xs text-slate-500">
                {(homeworkSummary.gradedCount === 1 ? pd.basedOnGradedSingular : pd.basedOnGradedPlural).replace(
                  "{count}",
                  String(homeworkSummary.gradedCount)
                )}
              </p>
            </>
          ) : (
            <>
              <div className="text-3xl font-extrabold text-slate-300">—</div>
              <p className="text-xs text-slate-500">
                {homeworkSummary && homeworkSummary.totalSubmissions > 0 ? pd.awaitingGrading : pd.noHomeworkYet}
              </p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{pd.xpBadgesLabel}</span>
            {gamification && (
              <span className="text-amber-500 font-bold">{pd.levelLabel.replace("{level}", String(gamification.level))}</span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{gamification ? `${gamification.totalXp} XP` : "0 XP"}</div>
          <p className="text-xs text-slate-500">
            {gamification && gamification.unlockedBadges.length > 0
              ? gamification.unlockedBadges.map((b) => (isAr ? b.titleAr : b.titleEn)).join(pd.badgeJoinSeparator)
              : gamification && gamification.streakDays > 0
                ? pd.streakDays.replace("{days}", String(gamification.streakDays))
                : pd.firstBadgeEncouragement}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{pd.subscriptionStatusLabel}</span>
            {subscription && (
              <span className="text-emerald-600 font-bold">
                {subscription.status === SubscriptionStatus.TRIALING ? pd.statusTrialing : pd.statusActive}
              </span>
            )}
          </div>
          {subscription ? (
            <>
              <div className="text-2xl font-extrabold text-slate-900">
                {billingService.formatPrice(subscription.plan.priceMinorUnits, subscription.plan.currency)}
                <span className="text-sm font-semibold text-slate-500">{pd.perMonth}</span>
              </div>
              <p className="text-xs text-slate-500">
                {isAr ? subscription.plan.nameAr : subscription.plan.nameEn}
                {" · "}
                {pd.renewsPrefix}
                {subscription.currentPeriodEnd.toISOString().split("T")[0]}
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-extrabold text-slate-300">{pd.noSubscriptionLabel}</div>
              <Link href={`/${locale}/parent/checkout`} className="text-xs text-brand-600 font-bold hover:underline">
                {pd.subscribeNow}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Sections: Teacher Feedback & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Teacher Evaluation */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                <span>{pd.latestEvaluationHeading}</span>
              </h3>
              <Link
                href={`/${locale}/parent/reports/weekly?studentId=${selectedChild?.id}`}
                className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>{pd.weeklyReportTitle}</span>
                <DirectionalIcon icon={ArrowRight} locale={locale} className="w-3.5 h-3.5" />
              </Link>
            </div>

            {latestFeedback ? (
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full gradient-brand text-white font-bold flex items-center justify-center text-xs">
                      {latestFeedback.teacher.firstName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {latestFeedback.teacher.firstName} {latestFeedback.teacher.lastName}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {isAr
                          ? latestFeedback.submission.assignment.classGroup.courseLevel.course.titleAr
                          : latestFeedback.submission.assignment.classGroup.courseLevel.course.titleEn}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {pd.gradeLabel.replace("{score}", String(latestFeedback.score))}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{latestFeedback.parentVisibleFeedback}</p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <p className="text-xs text-slate-500">
                  {pd.noEvaluationYet}
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Schedule for Child */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>{pd.upcomingScheduleHeading}</span>
            </h3>

            <div className="space-y-3 text-xs">
              {nextSession ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <span className="font-bold text-slate-900 block">{nextSession.classGroupName}</span>
                      <span className="text-slate-500">
                        {nextSessionTimeLabel}
                        {" · "}
                        {pd.minutesLabel.replace("{mins}", String(nextSessionDurationMinutes))}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-600 font-semibold">
                    {pd.withTeacher
                      .replace("{firstName}", nextSession.teacherFirstName)
                      .replace("{lastName}", nextSession.teacherLastName)}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-dashed border-slate-200 text-center text-slate-500">
                  {pd.noUpcomingSessions}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Actions & Invoices */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>{pd.childrenEnrollmentsHeading}</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {pd.childrenEnrollmentsDesc}
            </p>
            <div className="space-y-2">
              <Link
                href={`/${locale}/parent/children`}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors text-center block"
              >
                {pd.manageChildProfiles}
              </Link>
              <Link
                href={`/${locale}/parent/enroll`}
                className="w-full py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all text-center block"
              >
                {pd.enrollNewTracks}
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>{pd.billingInvoicesHeading}</span>
            </h3>

            <div className="space-y-2 text-xs">
              {latestInvoice ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {latestInvoice.items[0]?.description || pd.monthlySubscriptionDefault}
                    </span>
                    <span className="text-[11px] text-slate-500">#{latestInvoice.invoiceNumber}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                    {pd.invoiceStatusLine
                      .replace("{status}", latestInvoice.status === "PAID" ? pd.paidStatus : latestInvoice.status)
                      .replace(
                        "{price}",
                        billingService.formatPrice(latestInvoice.totalMinorUnits, latestInvoice.currency)
                      )}
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 text-center text-slate-500">
                  {pd.noInvoicesYet}
                </div>
              )}
              {latestInvoice && (
                <Link
                  href={`/${locale}/parent/billing`}
                  className="block text-center text-brand-600 font-bold hover:underline pt-1"
                >
                  {pd.viewAllInvoices}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
