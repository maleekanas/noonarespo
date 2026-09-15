import React from "react";
import Link from "next/link";
import { ArrowRight, Mic, Award } from "lucide-react";
import { pronunciationService } from "@/server/services/PronunciationService";
import { PronunciationWaveformStudio } from "@/components/pronunciation/PronunciationWaveformStudio";
import { requireStudentProfile } from "@/lib/auth/currentUser";

export default async function PronunciationStudioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
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
              {isAr ? "العودة إلى لوحة الطالب" : "Back to Student Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {isAr ? "استوديو مخارج الحروف والنطق" : "Voice Pronunciation Studio"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Mic className="w-8 h-8 text-rose-600" />
            {isAr ? "استوديو مخارج الحروف والمطابقة الصوتية 🎙️" : "Voice Pronunciation & Waveform Studio 🎙️"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isAr
              ? "تدرب على نطق أصعب الحروف العربية (الضاد، الصاد، الطاء، العين، القاف)، طابق موجتك الصوتية مع صوت المعلم، واكسب نقاط XP!"
              : "Master challenging Arabic phonemes (Dhad, Sad, Ta, 'Ayn, Qaf), match your voice pitch against native models, and earn XP!"}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 text-rose-900 px-4 py-3 rounded-2xl shadow-sm">
          <Award className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-rose-900 text-sm">
              {isAr ? "+20 XP لكل حرف متقن" : "+20 XP per mastered phoneme"}
            </div>
            <div className="text-rose-700">
              {isAr ? "دقة مطابقة 70% فما فوق" : "Requires 70%+ acoustic match"}
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
