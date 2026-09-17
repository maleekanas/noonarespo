import React from "react";
import Link from "next/link";
import { ArrowRight, Mic, Award } from "lucide-react";
import { pronunciationService } from "@/server/services/PronunciationService";
import { PronunciationWaveformStudio } from "@/components/pronunciation/PronunciationWaveformStudio";
import { requireStudentProfile } from "@/lib/auth/currentUser";
import { getDictionary } from "@/lib/localization";

export default async function PronunciationStudioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const pp = dict.studentPronunciation;
  await requireStudentProfile(locale);

  const phonemes = await pronunciationService.getPhonemeCatalog();
  const minimalPairs = await pronunciationService.getMinimalPairs();

  // Server action to evaluate voice pronunciation
  async function evaluateVoiceAction(params: {
    phonemeId: string;
    audioDurationMs: number;
    userWaveformSamples: number[];
  }) {
    "use server";
    const { profile: studentProfile } = await requireStudentProfile(locale);
    const result = await pronunciationService.evaluatePronunciation({
      studentId: studentProfile.id,
      phonemeId: params.phonemeId,
      audioDurationMs: params.audioDurationMs,
      userWaveformSamples: params.userWaveformSamples,
    });

    return {
      scorePercentage: result.scorePercentage,
      pitchAccuracy: result.pitchAccuracy,
      clarityScore: result.clarityScore,
      isPassed: result.isPassed,
      xpAwarded: result.xpAwarded,
      newTotalXp: result.newTotalXp,
      feedbackAr: result.feedbackAr,
      feedbackEn: result.feedbackEn,
    };
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href={`/${locale}/student`} className="hover:text-brand-600 flex items-center gap-1">
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
              {pp.backToStudentDashboard}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {pp.breadcrumbCurrent}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Mic className="w-8 h-8 text-rose-600" />
            {pp.pageHeading}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {pp.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 text-rose-900 px-4 py-3 rounded-2xl shadow-sm">
          <Award className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-rose-900 text-sm">
              {pp.xpPerPhoneme}
            </div>
            <div className="text-rose-700">
              {pp.requires70Match}
            </div>
          </div>
        </div>
      </div>

      {/* Main Pronunciation Studio Component */}
      <PronunciationWaveformStudio
        phonemes={phonemes}
        minimalPairs={minimalPairs}
        locale={locale}
        onEvaluate={evaluateVoiceAction}
      />
    </div>
  );
}
