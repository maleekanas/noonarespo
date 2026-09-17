import React from "react";
import Link from "next/link";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import { vocabularyService } from "@/server/services/VocabularyService";
import { VocabularySrsStudio } from "@/components/vocabulary/VocabularySrsStudio";
import { requireStudentProfile } from "@/lib/auth/currentUser";
import { getDictionary } from "@/lib/localization";

export default async function StudentFlashcardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const fc = dict.studentFlashcards;
  const { profile: studentProfile } = await requireStudentProfile(locale);
  const studentId = studentProfile.id;

  const dueCards = await vocabularyService.getDueCards(studentId);
  const overview = await vocabularyService.getStudentOverview(studentId);

  async function handleRecordCard(params: {
    cardId: string;
    grade: "EASY" | "GOOD" | "AGAIN";
  }) {
    "use server";
    await vocabularyService.recordCardReview({
      studentId,
      cardId: params.cardId,
      grade: params.grade,
    });
  }

  async function handleCompleteSession(params: {
    totalCards: number;
    againCount: number;
  }) {
    "use server";
    return vocabularyService.completeSession({
      studentId,
      totalCards: params.totalCards,
      againCount: params.againCount,
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href={`/${locale}/student`} className="hover:text-brand-600 flex items-center gap-1">
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
              {fc.backToStudentDashboard}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {fc.breadcrumbCurrent}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Layers className="w-8 h-8 text-brand-600" />
            {fc.pageHeading}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {fc.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-900 px-4 py-2.5 rounded-2xl shadow-2xs">
          <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{fc.sessionRewardLabel}</span>{" "}
            <span>+15 XP {fc.perCompletedRound}</span>
          </div>
        </div>
      </div>

      {/* Main Flashcard Studio Component */}
      <VocabularySrsStudio
        initialCards={dueCards}
        overview={overview}
        locale={locale}
        onRecordCard={handleRecordCard}
        onCompleteSession={handleCompleteSession}
      />
    </div>
  );
}
