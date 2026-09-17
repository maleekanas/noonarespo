import React from "react";
import Link from "next/link";
import {
  FileCheck,
  Calendar,
  MessageSquare,
  Video,
  Users,
  Bot,
  GraduationCap,
} from "lucide-react";
import { getDictionary } from "@/lib/localization";
import { requireTeacherProfile } from "@/lib/auth/currentUser";

export default async function TeacherDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireTeacherProfile(locale);
  const dict = getDictionary(locale);
  const td = dict.teacherDashboard;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Teacher Profile & Operational Metrics */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            {td.portalBadge}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {td.welcomeHeading}
          </h1>
          <p className="text-xs text-slate-500">
            {td.specialization}
          </p>
        </div>

        <div className="flex items-center gap-6 text-center">
          <div>
            <span className="text-2xl font-extrabold text-slate-900 block">18</span>
            <span className="text-[11px] text-slate-500 font-medium">{td.classesThisWeek}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-2xl font-extrabold text-brand-600 block">99.2%</span>
            <span className="text-[11px] text-slate-500 font-medium">{td.attendanceRateLabel}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-2xl font-extrabold text-amber-500 block">4.95 ★</span>
            <span className="text-[11px] text-slate-500 font-medium">{td.parentRatingLabel}</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link
          href={`/${locale}/teacher/classes/class-reading-a1-cohort1`}
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{td.myClasses}</h3>
            <span className="text-[11px] text-slate-500">{td.rostersAttendance}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/teacher/gradebook`}
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{td.liveGradebook}</h3>
            <span className="text-[11px] text-slate-500">{td.wpmStarRubrics}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/teacher/assignments`}
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{td.grading}</h3>
            <span className="text-[11px] text-slate-500">{td.voiceSubmissionsLabel}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/teacher/messages`}
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{td.parentMessages}</h3>
            <span className="text-[11px] text-slate-500">{td.advisoryChat}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/teacher/meetings`}
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{td.oneOnOneVideo}</h3>
            <span className="text-[11px] text-slate-500">{td.roomSchedules}</span>
          </div>
        </Link>

        <Link
          href={`/${locale}/teacher/ai-assistant`}
          className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-brand-400 transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{td.aiAssistant}</h3>
            <span className="text-[11px] text-slate-500">{td.lessonGenerator}</span>
          </div>
        </Link>
      </div>

      {/* Main Grid: Today's Teaching Schedule & Grading Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                <span>{td.todaysLiveClasses}</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">{td.activeToday}</span>
            </div>

            <div className="space-y-3">
              {/* Session 1 */}
              <div className="p-5 rounded-2xl border border-brand-200 bg-brand-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-brand-100 text-brand-800 font-bold text-[10px]">
                      {td.sessionTimeSlot}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {td.starsCohortLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {td.lesson4Desc}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/${locale}/teacher/classes/class-reading-a1-cohort1`}
                    className="px-4 py-2 text-xs font-bold rounded-xl gradient-brand text-white shadow-sm hover:opacity-95 transition-all text-center"
                  >
                    {td.joinSessionMarkAttendance}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Grading Queue Quick Widget */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-purple-600" />
                <span>{td.gradingQueue}</span>
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold">
                {td.pendingCount}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{td.studentNameZayd}</span>
                  <span className="text-[11px] text-slate-400">{td.todayLabel}</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  {td.voiceSubmissionDesc}
                </p>
                <Link
                  href={`/${locale}/teacher/assignments`}
                  className="w-full py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] transition-colors text-center block"
                >
                  {td.openGradingRubric}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
