"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StoryBook } from "@/server/repositories/StoryRepository";
import {
  Volume2,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

interface InteractiveStoryReaderProps {
  story: StoryBook;
  locale: string;
  onQuizSubmit: (selectedOptions: Record<string, number>) => Promise<{
    scorePercentage: number;
    isPassed: boolean;
    xpAwarded: number;
    feedbackMessageAr: string;
  }>;
}

export function InteractiveStoryReader({
  story,
  locale,
  onQuizSubmit,
}: InteractiveStoryReaderProps) {
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<0.8 | 1.0>(1.0);
  const [showEnglishTranslation, setShowEnglishTranslation] = useState(true);
  const [activeWordPronouncing, setActiveWordPronouncing] = useState<string | null>(null);

  // Quiz Mode State
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    scorePercentage: number;
    isPassed: boolean;
    xpAwarded: number;
    feedbackMessageAr: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPage = story.pages[currentPageIdx];
  const isFirstPage = currentPageIdx === 0;
  const isLastPage = currentPageIdx === story.pages.length - 1;

  // Speech synthesis for word or page
  function pronounceText(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = audioSpeed;
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setActiveWordPronouncing(null);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setActiveWordPronouncing(null);
      };
      window.speechSynthesis.speak(utterance);
    }
  }

  function handleToggleNarration() {
    if (isPlayingAudio) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      pronounceText(currentPage.textAr);
    }
  }

  function handleWordClick(word: string) {
    // Clean punctuation
    const cleanWord = word.replace(/[،.؟!"':;]/g, "");
    setActiveWordPronouncing(cleanWord);
    pronounceText(cleanWord);
  }

  function handleNextPage() {
    if (currentPageIdx < story.pages.length - 1) {
      setCurrentPageIdx((prev) => prev + 1);
      if (isPlayingAudio) {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        setIsPlayingAudio(false);
      }
    } else {
      setIsQuizMode(true);
    }
  }

  function handlePrevPage() {
    if (currentPageIdx > 0) {
      setCurrentPageIdx((prev) => prev - 1);
      if (isPlayingAudio) {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        setIsPlayingAudio(false);
      }
    }
  }

  async function handleQuizSubmit() {
    try {
      setIsSubmitting(true);
      const res = await onQuizSubmit(selectedAnswers);
      setQuizResult(res);
      setQuizSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRestartStory() {
    setCurrentPageIdx(0);
    setIsQuizMode(false);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
  }

  // Split page text into individual words for click-to-pronounce
  const words = currentPage ? currentPage.textAr.split(" ") : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/student/stories`}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <DirectionalIcon icon={ArrowRight} locale={locale} className="w-4 h-4" />
            <span>مكتبة القصص</span>
          </Link>

          <div>
            <span className="text-[11px] font-bold text-brand-600 block">
              {story.categoryTitleAr}
            </span>
            <h1 className="text-base font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">
              {story.titleAr}
            </h1>
          </div>
        </div>

        {/* Audio Player & Reader Settings */}
        <div className="flex items-center gap-2">
          {!isQuizMode && (
            <>
              <button
                type="button"
                onClick={handleToggleNarration}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isPlayingAudio
                    ? "bg-amber-400 text-slate-950 font-black animate-pulse"
                    : "gradient-brand text-white hover:opacity-95"
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>إيقاف القراءة</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>استماع للصفحة</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAudioSpeed((s) => (s === 1.0 ? 0.8 : 1.0))}
                className="px-2.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold font-mono hover:bg-slate-100"
                title="تعديل سرعة القراءة الصوتية"
              >
                {audioSpeed === 0.8 ? "0.8x بطيء" : "1.0x عادي"}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowEnglishTranslation((v) => !v)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              showEnglishTranslation
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}
          >
            {showEnglishTranslation ? "الترجمة: ظاهرة" : "الترجمة: مخفية"}
          </button>
        </div>
      </div>

      {/* Main Content Area: Story Page View or Quiz View */}
      {!isQuizMode ? (
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
          {/* Page Indicator & Progress Dots */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500">
              الصفحة {currentPageIdx + 1} من {story.pages.length}
            </span>

            <div className="flex items-center gap-1.5">
              {story.pages.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentPageIdx
                      ? "w-8 bg-brand-600"
                      : idx < currentPageIdx
                      ? "bg-brand-300"
                      : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Large Illustration Canvas */}
          <div className="h-48 sm:h-64 rounded-3xl bg-gradient-to-b from-slate-50 to-indigo-50/50 border border-slate-200/80 flex flex-col items-center justify-center p-6 text-center relative group">
            <div className="text-7xl sm:text-8xl drop-shadow-sm transition-transform group-hover:scale-110 duration-300">
              {currentPage.illustrationEmoji}
            </div>
            <span className="text-xs font-bold text-slate-400 mt-3 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-brand-600" />
              <span>اضغط على أي كلمة لسماع نطقها الفردي</span>
            </span>
          </div>

          {/* Vocalized Arabic Text with Click-to-Pronounce */}
          <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/30 border border-amber-200/60 text-center space-y-4">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 leading-relaxed sm:leading-loose flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
              {words.map((word, wIdx) => {
                const isSelected = activeWordPronouncing && word.includes(activeWordPronouncing);
                return (
                  <span
                    key={wIdx}
                    onClick={() => handleWordClick(word)}
                    className={`cursor-pointer px-1.5 py-0.5 rounded-lg transition-all ${
                      isSelected
                        ? "bg-amber-300 text-slate-950 scale-105 shadow-xs font-black"
                        : "hover:bg-amber-200/70 hover:text-brand-900"
                    }`}
                    title="اضغط للاستماع"
                  >
                    {word}
                  </span>
                );
              })}
            </div>

            {/* English Translation */}
            {showEnglishTranslation && (
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto italic pt-2 border-t border-amber-200/50">
                &ldquo;{currentPage.textEn}&rdquo;
              </p>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={isFirstPage}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <DirectionalIcon icon={ArrowRight} locale={locale} className="w-4 h-4" />
              <span>الصفحة السابقة</span>
            </button>

            <button
              type="button"
              onClick={handleNextPage}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
            >
              <span>{isLastPage ? "بدء اختبار الفهم (+35 XP)" : "الصفحة التالية"}</span>
              <DirectionalIcon icon={ArrowLeft} locale={locale} className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* QUIZ MODE */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                اختبار الفهم والاستيعاب القرائي
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                ماذا تعلمنا من قصة: {story.titleAr}؟
              </h2>
            </div>

            <button
              type="button"
              onClick={handleRestartStory}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة قراءة القصة</span>
            </button>
          </div>

          {/* Victory / Result Banner */}
          {quizSubmitted && quizResult && (
            <div
              className={`p-6 rounded-3xl border space-y-2 animate-in zoom-in-95 duration-200 ${
                quizResult.isPassed
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-amber-50 border-amber-300 text-amber-950"
              }`}
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-amber-500 shrink-0" />
                <div>
                  <h3 className="text-lg font-black">
                    {quizResult.isPassed ? "تهانينا يا بطل! 🎉" : "محاولة جيدة!"}
                  </h3>
                  <p className="text-xs font-semibold">{quizResult.feedbackMessageAr}</p>
                </div>
              </div>

              {quizResult.isPassed && (
                <div className="pt-2 flex items-center gap-2 text-xs font-extrabold text-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>تم فتح وسام: مستكشف القصص والعِبر ⭐</span>
                </div>
              )}
            </div>
          )}

          {/* Questions */}
          <div className="space-y-6">
            {story.quizQuestions.map((q, qIndex) => {
              const selected = selectedAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {qIndex + 1}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {q.questionAr}
                    </h3>
                  </div>

                  <div className="space-y-2 ps-8">
                    {q.optionsAr.map((opt, optIndex) => {
                      const isChosen = selected === optIndex;
                      const isCorrect = optIndex === q.correctOptionIndex;

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() =>
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [q.id]: optIndex,
                            }))
                          }
                          className={`w-full p-3 rounded-xl text-xs font-bold text-start transition-all border flex items-center justify-between ${
                            quizSubmitted
                              ? isCorrect
                                ? "bg-emerald-100 border-emerald-400 text-emerald-950 font-black"
                                : isChosen
                                ? "bg-rose-100 border-rose-400 text-rose-950"
                                : "bg-white border-slate-200 text-slate-400"
                              : isChosen
                              ? "bg-brand-50 border-brand-500 text-brand-950 shadow-xs font-black ring-2 ring-brand-300"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                          {quizSubmitted && isChosen && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 rounded-xl bg-amber-50 text-[11px] text-amber-900 border border-amber-200 ps-8">
                      <strong>العِبرة والقيمة التربوية:</strong> {q.moralLessonAr}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!quizSubmitted ? (
            <button
              type="button"
              onClick={handleQuizSubmit}
              disabled={
                isSubmitting ||
                Object.keys(selectedAnswers).length < story.quizQuestions.length
              }
              className="w-full py-3.5 rounded-2xl gradient-brand text-white font-extrabold text-sm shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "جارِ التحقق من الإجابات..." : "تسجيل الإجابات والحصول على +35 XP"}
            </button>
          ) : (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleRestartStory}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                إعادة قراءة القصة
              </button>

              <Link
                href={`/${locale}/student/stories`}
                className="px-6 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95"
              >
                استكشاف قصة جديدة ←
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
