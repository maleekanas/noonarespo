"use client";

import React, { useState } from "react";
import {
  Volume2,
  Sparkles,
  Trophy,
  RotateCw,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import {
  VocabularyFlashcard,
  StudentSrsOverview,
} from "@/server/repositories/VocabularyRepository";
import { SrsSessionResult } from "@/server/services/VocabularyService";

interface VocabularySrsStudioProps {
  initialCards: VocabularyFlashcard[];
  overview: StudentSrsOverview;
  locale: string;
  onRecordCard: (params: {
    cardId: string;
    grade: "EASY" | "GOOD" | "AGAIN";
  }) => Promise<void>;
  onCompleteSession: (params: {
    totalCards: number;
    againCount: number;
  }) => Promise<SrsSessionResult>;
}

export function VocabularySrsStudio({
  initialCards,
  overview,
  locale,
  onRecordCard,
  onCompleteSession,
}: VocabularySrsStudioProps) {
  const isAr = locale === "ar";
  const [cards] = useState<VocabularyFlashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [againCount, setAgainCount] = useState<number>(0);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [sessionResult, setSessionResult] = useState<SrsSessionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentCard = cards[currentIndex];
  const progressPercent = cards.length > 0
    ? Math.round((currentIndex / cards.length) * 100)
    : 100;

  function playArabicSpeech(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(true);
      const utterance = new SpeechSynthesisUtterance(text.replace(/[➔×]/g, ""));
      utterance.lang = "ar-SA";
      utterance.rate = 0.85;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  }

  async function handleGrade(grade: "EASY" | "GOOD" | "AGAIN") {
    if (!currentCard) return;

    if (grade === "AGAIN") {
      setAgainCount((prev) => prev + 1);
    }

    try {
      await onRecordCard({
        cardId: currentCard.id,
        grade,
      });
    } catch (err) {
      console.error(err);
    }

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Session Completed!
      finishSession();
    }
  }

  async function finishSession() {
    setIsSubmitting(true);
    try {
      const result = await onCompleteSession({
        totalCards: cards.length,
        againCount,
      });
      setSessionResult(result);
      setSessionCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleResetSession() {
    setCurrentIndex(0);
    setIsFlipped(false);
    setAgainCount(0);
    setSessionCompleted(false);
    setSessionResult(null);
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top SRS Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            🔥
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">
              {isAr ? "شعلة الحماس" : "Review Streak"}
            </div>
            <div className="text-base font-black text-slate-900">
              {overview.reviewStreakDays} {isAr ? "أيام" : "days"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            ⭐
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">
              {isAr ? "متقنة تماماً" : "Mastered (SRS)"}
            </div>
            <div className="text-base font-black text-slate-900">
              {overview.totalCardsMastered} {isAr ? "بطاقات" : "cards"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
            📖
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">
              {isAr ? "قيد التثبيت" : "Learning"}
            </div>
            <div className="text-base font-black text-slate-900">
              {overview.totalCardsLearning} {isAr ? "بطاقات" : "cards"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
            🎯
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">
              {isAr ? "نسبة الاسترجاع" : "Retention Rate"}
            </div>
            <div className="text-base font-black text-slate-900">
              {overview.retentionRatePercentage}%
            </div>
          </div>
        </div>
      </div>

      {!sessionCompleted && currentCard ? (
        <div className="space-y-6">
          {/* Progress Bar & Counter */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
            <span>
              {isAr
                ? `البطاقة ${currentIndex + 1} من ${cards.length}`
                : `Card ${currentIndex + 1} of ${cards.length}`}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="bg-brand-600 h-full rounded-full transition-all duration-300"
            />
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer select-none perspective-1000 min-h-[360px] relative"
          >
            <div
              className={`w-full h-full min-h-[360px] rounded-3xl border-2 transition-all duration-500 p-8 flex flex-col justify-between shadow-lg relative ${
                isFlipped
                  ? "bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white border-indigo-500"
                  : "bg-white border-slate-200 hover:border-brand-300 text-slate-900"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isFlipped
                      ? "bg-indigo-800/60 text-indigo-200"
                      : "bg-brand-50 text-brand-700"
                  }`}
                >
                  {isAr ? currentCard.categoryNameAr : currentCard.categoryNameEn}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playArabicSpeech(currentCard.wordAr);
                  }}
                  className={`p-2.5 rounded-2xl transition-all shadow-sm ${
                    isFlipped
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  } ${isPlayingAudio ? "ring-2 ring-amber-400 animate-pulse" : ""}`}
                  title={isAr ? "استمع للنطق الصوتي" : "Play pronunciation"}
                >
                  <Volume2 className="w-5 h-5 text-amber-400" />
                </button>
              </div>

              {/* Card Center: Front vs Back */}
              {!isFlipped ? (
                /* FRONT OF CARD */
                <div className="text-center py-6 space-y-3">
                  <div className="text-6xl mb-2">{currentCard.illustrationEmoji}</div>

                  {currentCard.rootLetters && (
                    <div className="text-xs font-mono font-bold text-slate-400">
                      {isAr ? `جذر الكلمة: [ ${currentCard.rootLetters} ]` : `Root: [ ${currentCard.rootLetters} ]`}
                    </div>
                  )}

                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                    {currentCard.wordAr}
                  </h3>

                  <p className="text-xs text-brand-600 font-mono">
                    {currentCard.transliteration}
                  </p>
                </div>
              ) : (
                /* BACK OF CARD */
                <div className="text-center py-4 space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-amber-300 mb-1">
                      {currentCard.wordEn}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {currentCard.transliteration}
                    </p>
                  </div>

                  {/* Example Vocalized Sentence */}
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-right space-y-1">
                    <div className="text-sm font-bold text-white leading-relaxed">
                      {currentCard.exampleSentenceAr}
                    </div>
                    <div className="text-xs text-slate-300 italic">
                      &ldquo;{currentCard.exampleSentenceEn}&rdquo;
                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer Cue */}
              <div className="text-center pt-4 border-t border-slate-100/20 text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5" />
                <span>
                  {!isFlipped
                    ? (isAr ? "انقر على البطاقة لإظهار المعنى والمثال" : "Click card to reveal meaning & example")
                    : (isAr ? "انقر للعودة للوجه الأول" : "Click to flip back")}
                </span>
              </div>
            </div>
          </div>

          {/* SRS Grading Action Bar (Shown when flipped) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleGrade("AGAIN")}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>{isAr ? "لم أتذكرها (إعادة) 🔄" : "Again (Reset) 🔄"}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleGrade("GOOD")}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-2 border border-sky-200 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>{isAr ? "تذكرتها (جيد) 👍" : "Good (Advance) 👍"}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleGrade("EASY")}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-100 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isAr ? "أعرفها بسهولة (سهل) 🌟" : "Easy (Master) 🌟"}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Session Completed Celebration Screen */}
      {sessionCompleted && sessionResult && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6 shadow-md animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-lg shadow-amber-100">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 mb-1">
              {isAr ? "اكتملت جلسة التكرار المتباعد بنجاح! 🎉" : "SRS Study Session Cleared! 🎉"}
            </h3>
            <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto">
              {isAr ? sessionResult.feedbackAr : sessionResult.feedbackEn}
            </p>
          </div>

          {/* XP & Accuracy Result Card */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="text-xs text-amber-800 font-bold mb-0.5">
                {isAr ? "النقاط المكتسبة" : "XP Earned"}
              </div>
              <div className="text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>+{sessionResult.xpAwarded} XP</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-xs text-emerald-800 font-bold mb-0.5">
                {isAr ? "دقة التذكر" : "Recall Accuracy"}
              </div>
              <div className="text-2xl font-black text-emerald-900">
                {sessionResult.accuracyPercentage}%
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleResetSession}
              className="py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              <span>{isAr ? "مراجعة جولة أخرى 🔄" : "Practice Another Round 🔄"}</span>
            </button>

            <a
              href={`/${locale}/student/roadmap`}
              className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              <span>{isAr ? "العودة إلى خريطة المسار 🗺️" : "Back to Quest Map 🗺️"}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
