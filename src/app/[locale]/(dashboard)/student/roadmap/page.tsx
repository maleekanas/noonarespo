import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { roadmapService } from "@/server/services/RoadmapService";
import { VisualLearningQuestMap } from "@/components/roadmap/VisualLearningQuestMap";
import { requireStudentProfile } from "@/lib/auth/currentUser";
import { getDictionary } from "@/lib/localization";

export default async function StudentRoadmapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const rm = dict.studentRoadmap;
  const { profile: studentProfile } = await requireStudentProfile(locale);
  const studentId = studentProfile.id;

  const progress = await roadmapService.getStudentRoadmap(studentId);

  async function handleClaimChestAction(chestId: string) {
    "use server";
    return roadmapService.claimMilestoneChest({
      studentId,
      chestId,
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href={`/${locale}/student`} className="hover:text-brand-600 flex items-center gap-1">
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
              {rm.backToStudentDashboard}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {rm.breadcrumbCurrent}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Compass className="w-8 h-8 text-brand-600" />
            {rm.pageHeading}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {rm.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-2xl shadow-2xs">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{rm.rewardsLabel}</span>{" "}
            <span>+25 إلى +50 XP {rm.perClearedMilestone}</span>
          </div>
        </div>
      </div>

      {/* Interactive Quest Map */}
      <VisualLearningQuestMap
        progress={progress}
        locale={locale}
        onClaimChest={handleClaimChestAction}
      />
    </div>
  );
}
