import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { roadmapService } from "@/server/services/RoadmapService";
import { VisualLearningQuestMap } from "@/components/roadmap/VisualLearningQuestMap";
import { requireStudentProfile } from "@/lib/auth/currentUser";

export default async function StudentRoadmapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
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
              {isAr ? "العودة إلى لوحة الطالب" : "Back to Student Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {isAr ? "خريطة المغامرة ومسار التعلم" : "Learning Quest Map"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Compass className="w-8 h-8 text-brand-600" />
            {isAr ? "خريطة رحلة التعلم الكبرى: مغامرة الفصاحة 🗺️" : "The Arabic Odyssey Quest Map 🗺️"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isAr
              ? "مسار تفاعلي مصور يربط جميع مهارات القراءة والكتابة والنطق والقرآن بمحطات متدرجة ونجوم ذهبية."
              : "Visual gamified roadmap connecting foundations, phonics, stories, Tajweed, and speaking fluency."}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-2xl shadow-2xs">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{isAr ? "مكافآت المحطات:" : "Rewards:"}</span>{" "}
            <span>+25 إلى +50 XP {isAr ? "لكل محطة مكتملة" : "per cleared milestone"}</span>
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
