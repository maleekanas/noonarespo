import React from "react";
import Link from "next/link";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import { vocabularyService } from "@/server/services/VocabularyService";
import { VocabularySrsStudio } from "@/components/vocabulary/VocabularySrsStudio";
import { requireStudentProfile } from "@/lib/auth/currentUser";

export default async function StudentFlashcardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
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
              {isAr ? "العودة إلى لوحة الطالب" : "Back to Student Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {isAr ? "استوديو البطاقات والتكرار المتباعد" : "SRS Flashcards Studio"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Layers className="w-8 h-8 text-brand-600" />
            {isAr ? "استوديو المفردات الذكية والتكرار المتباعد (SRS) 🧠" : "Spaced Repetition Vocabulary Studio (SRS) 🧠"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isAr
              ? "خوارزمية لايتنر الذكية لجدولة مراجعة عائلات الجذور الثلاثية، جموع التكسير، والمتضادات حتى الاستقرار في الذاكرة طويلة المدى."
              : "Algorithm-driven Leitner spaced repetition for mastering triliteral roots, broken plurals, and opposites."}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-900 px-4 py-2.5 rounded-2xl shadow-2xs">
          <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{isAr ? "مكافأة الجلسة:" : "Session Reward:"}</span>{" "}
            <span>+15 XP {isAr ? "لكل جولة مراجعة مكتملة" : "per completed review round"}</span>
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
