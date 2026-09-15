import React from "react";
import Link from "next/link";
import { gamificationService } from "@/server/services/GamificationService";
import { requireStudentProfile } from "@/lib/auth/currentUser";
import { ShieldCheck } from "lucide-react";

export default async function StudentLeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { profile: studentProfile } = await requireStudentProfile(locale);
  const studentId = studentProfile.id;

  const leaderboard = await gamificationService.getCohortLeaderboard(studentId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/student`} className="hover:underline">
              بوابة الطالب
            </Link>
            <span>/</span>
            <span>لوحة الصدارة</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            لوحة الصدارة الودية للفصل 🏆
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            منافسة مشجعة بين أصدقائك في الفصل مبنية على نقاط الخبرة (XP) المكتسبة هذا الشهر
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>خصوصية كاملة وأسماء محمية</span>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      <div className="grid grid-cols-3 gap-4 text-center items-end pt-6">
        {/* 2nd Place */}
        {leaderboard[1] && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2 order-1 sm:order-none">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 font-extrabold text-lg flex items-center justify-center mx-auto">
              🥈
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm block">
                {leaderboard[1].displayName}
              </span>
              <span className="text-[11px] text-slate-500">{leaderboard[1].levelTitle}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold block w-fit mx-auto">
              {leaderboard[1].monthlyXp} XP
            </span>
          </div>
        )}

        {/* 1st Place */}
        {leaderboard[0] && (
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 border-2 border-amber-300 shadow-md space-y-3 -translate-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
              👑
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base block">
                {leaderboard[0].displayName}
              </span>
              <span className="text-xs text-amber-800 font-semibold">{leaderboard[0].levelTitle}</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-extrabold block w-fit mx-auto shadow-sm">
              {leaderboard[0].monthlyXp} XP
            </span>
          </div>
        )}

        {/* 3rd Place */}
        {leaderboard[2] && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2 order-2 sm:order-none">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 font-extrabold text-lg flex items-center justify-center mx-auto">
              🥉
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm block">
                {leaderboard[2].displayName}
              </span>
              <span className="text-[11px] text-slate-500">{leaderboard[2].levelTitle}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold block w-fit mx-auto">
              {leaderboard[2].monthlyXp} XP
            </span>
          </div>
        )}
      </div>

      {/* Complete Ranks List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {leaderboard.map((entry) => (
          <div
            key={entry.studentId}
            className={`p-4 sm:p-5 flex items-center justify-between transition-colors ${
              entry.isCurrentStudent ? "bg-brand-50/60 font-bold" : "hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="w-7 text-center font-extrabold text-slate-500 text-sm">
                #{entry.rank}
              </span>
              <div>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{entry.displayName}</span>
                  {entry.isCurrentStudent && (
                    <span className="px-2 py-0.5 rounded-md bg-brand-600 text-white text-[10px] font-bold">
                      أنت
                    </span>
                  )}
                </span>
                <span className="text-xs text-slate-400 block">{entry.levelTitle}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-end">
                <span className="text-sm font-extrabold text-brand-600 block">
                  {entry.monthlyXp} XP
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {entry.badgeCount} أوسمة
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
