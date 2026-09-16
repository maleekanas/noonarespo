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

export default async function ParentDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
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
    if (rate >= 95) return isAr ? "ممتاز" : "Excellent";
    if (rate >= 80) return isAr ? "جيد" : "Good";
    return isAr ? "يحتاج متابعة" : "Needs attention";
  };

  const nextSessionTimeLabel = nextSession
    ? new Intl.DateTimeFormat(isAr ? "ar" : "en-US", {
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
            {isAr ? "بوابة ولي الأمر الموحدة" : "Unified Parent Portal"}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {isAr
              ? `أهلاً بك، أ/ ${profile.firstName} ${profile.lastName} 👨‍👧`
              : `Welcome, ${profile.firstName} ${profile.lastName} 👨‍👧`}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr
              ? "متابعة شاملة لرحلة أطفالك التعليمية، الكفاءات اللغوية، والتواصل المباشر مع المعلمين"
              : "Comprehensive tracking of your children's learning journey, competencies, and teacher messaging"}
          </p>
        </div>

        {/* Multi-Child Switcher Control & Notifications Shortcut */}
        <div className="flex items-center gap-3">
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
                {child.firstName} ({child.ageGroup === "AGE_4_6" ? (isAr ? "5 سنوات" : "5 yrs") : (isAr ? "8 سنوات" : "8 yrs")})
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
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "الكراسات والمطبوعات" : "A4 Printables"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "خط وتلوين (A4)" : "Tracing & QR"}</span>
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
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "توصيات المسار" : "AI Learning Plan"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "خطة CEFR الذكية" : "CEFR Guidance"}</span>
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
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "مؤشرات الكفاءات" : "Competencies"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "رادار الإتقان" : "Mastery Radar"}</span>
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
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "المحادثات المباشرة" : "Messages"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "تواصل مع المعلم" : "Teacher Chat"}</span>
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
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "لقاء فردي (15 د)" : "1-on-1 Meet"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "استشارة مرئية" : "Video Advisory"}</span>
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
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "التقرير الأسبوعي" : "Weekly Report"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "ملخص الإنجازات" : "Progress Summary"}</span>
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
            <h3 className="text-xs font-bold text-slate-900">{isAr ? "تقييم الكادر" : "Teacher Reviews"}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? "تقييم موثق" : "Verified Review"}</span>
          </div>
        </Link>
      </div>

      {/* Progress & Attendance Quick KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isAr ? "نسبة الحضور" : "Attendance Rate"}</span>
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
                {isAr ? "حصة مسجلة حتى الآن هذا الفصل" : "Sessions recorded so far this term"}
              </p>
            </>
          ) : (
            <>
              <div className="text-3xl font-extrabold text-slate-300">—</div>
              <p className="text-xs text-slate-500">{isAr ? "لا توجد حصص مسجلة بعد" : "No classes recorded yet"}</p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isAr ? "متوسط درجات الواجبات" : "Homework Average"}</span>
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
                {isAr
                  ? `بناءً على ${homeworkSummary.gradedCount} واجب مصحح`
                  : `Based on ${homeworkSummary.gradedCount} graded submission${homeworkSummary.gradedCount === 1 ? "" : "s"}`}
              </p>
            </>
          ) : (
            <>
              <div className="text-3xl font-extrabold text-slate-300">—</div>
              <p className="text-xs text-slate-500">
                {homeworkSummary && homeworkSummary.totalSubmissions > 0
                  ? isAr
                    ? "بانتظار تصحيح المعلم"
                    : "Awaiting teacher grading"
                  : isAr
                    ? "لم يتم تسليم أي واجب بعد"
                    : "No homework submitted yet"}
              </p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isAr ? "النقاط والأوسمة" : "XP & Badges"}</span>
            {gamification && (
              <span className="text-amber-500 font-bold">{isAr ? `المستوى ${gamification.level}` : `Level ${gamification.level}`}</span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{gamification ? `${gamification.totalXp} XP` : "0 XP"}</div>
          <p className="text-xs text-slate-500">
            {gamification && gamification.unlockedBadges.length > 0
              ? gamification.unlockedBadges.map((b) => (isAr ? b.titleAr : b.titleEn)).join(isAr ? " و" : " & ")
              : gamification && gamification.streakDays > 0
                ? isAr
                  ? `سلسلة مواظبة ${gamification.streakDays} يوم`
                  : `${gamification.streakDays}-day learning streak`
                : isAr
                  ? "استمر لتحصل على أول وسام!"
                  : "Keep learning to earn your first badge!"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isAr ? "حالة الاشتراك المالي" : "Subscription Status"}</span>
            {subscription && (
              <span className="text-emerald-600 font-bold">
                {isAr ? "نشط" : subscription.status === SubscriptionStatus.TRIALING ? "Trialing" : "Active"}
              </span>
            )}
          </div>
          {subscription ? (
            <>
              <div className="text-2xl font-extrabold text-slate-900">
                {billingService.formatPrice(subscription.plan.priceMinorUnits, subscription.plan.currency)}
                <span className="text-sm font-semibold text-slate-500">{isAr ? " / شهر" : " / mo"}</span>
              </div>
              <p className="text-xs text-slate-500">
                {isAr ? subscription.plan.nameAr : subscription.plan.nameEn}
                {" · "}
                {isAr ? "التجديد في " : "Renews "}
                {subscription.currentPeriodEnd.toISOString().split("T")[0]}
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-extrabold text-slate-300">{isAr ? "لا يوجد اشتراك" : "No subscription"}</div>
              <Link href={`/${locale}/parent/checkout`} className="text-xs text-brand-600 font-bold hover:underline">
                {isAr ? "اشترك الآن" : "Subscribe now"}
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
                <span>{isAr ? "أحدث تقييم وتغذية راجعة من المعلم" : "Latest Teacher Evaluation & Feedback"}</span>
              </h3>
              <Link
                href={`/${locale}/parent/reports/weekly?studentId=${selectedChild?.id}`}
                className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>{isAr ? "التقرير الأسبوعي" : "Weekly Report"}</span>
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
                    {isAr ? `العلامة: ${latestFeedback.score}/100` : `Grade: ${latestFeedback.score}/100`}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{latestFeedback.parentVisibleFeedback}</p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <p className="text-xs text-slate-500">
                  {isAr ? "لا يوجد تقييم من المعلم بعد" : "No teacher evaluation yet"}
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Schedule for Child */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>{isAr ? "جدول الحصص القادمة هذا الأسبوع" : "Upcoming Schedule This Week"}</span>
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
                        {isAr ? `${nextSessionDurationMinutes} دقيقة` : `${nextSessionDurationMinutes} mins`}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-600 font-semibold">
                    {isAr
                      ? `مع الأستاذ ${nextSession.teacherFirstName} ${nextSession.teacherLastName}`
                      : `with ${nextSession.teacherFirstName} ${nextSession.teacherLastName}`}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-dashed border-slate-200 text-center text-slate-500">
                  {isAr ? "لا توجد حصص قادمة مجدولة حالياً" : "No upcoming sessions scheduled"}
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
              <span>{isAr ? "إدارة الأبناء والتسجيل" : "Children & Enrollments"}</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? "إضافة طفل جديد، أو تعديل البيانات الشخصية، أو تسجيل في فصول إضافية."
                : "Add a new child, update profile details, or enroll in additional tracks."}
            </p>
            <div className="space-y-2">
              <Link
                href={`/${locale}/parent/children`}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors text-center block"
              >
                {isAr ? "إدارة ملفات الأبناء" : "Manage Child Profiles"}
              </Link>
              <Link
                href={`/${locale}/parent/enroll`}
                className="w-full py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all text-center block"
              >
                {isAr ? "تسجيل في فصول جديدة" : "Enroll in New Tracks"}
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? "سجل الفواتير والاشتراك" : "Billing & Invoices"}</span>
            </h3>

            <div className="space-y-2 text-xs">
              {latestInvoice ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {latestInvoice.items[0]?.description || (isAr ? "اشتراك شهري" : "Monthly subscription")}
                    </span>
                    <span className="text-[11px] text-slate-500">#{latestInvoice.invoiceNumber}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                    {isAr
                      ? `${latestInvoice.status === "PAID" ? "مدفوعة" : latestInvoice.status} (${billingService.formatPrice(latestInvoice.totalMinorUnits, latestInvoice.currency)})`
                      : `${latestInvoice.status === "PAID" ? "Paid" : latestInvoice.status} (${billingService.formatPrice(latestInvoice.totalMinorUnits, latestInvoice.currency)})`}
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 text-center text-slate-500">
                  {isAr ? "لا توجد فواتير بعد" : "No invoices yet"}
                </div>
              )}
              {latestInvoice && (
                <Link
                  href={`/${locale}/parent/billing`}
                  className="block text-center text-brand-600 font-bold hover:underline pt-1"
                >
                  {isAr ? "عرض كل الفواتير" : "View all invoices"}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
