"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Volume2,
  Mic,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
} from "lucide-react";

export interface QuestionData {
  id: string;
  type: string;
  titleAr: string;
  titleEn: string;
  promptAr: string;
  promptEn: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface AssessmentExamRunnerProps {
  locale: string;
  assessmentId: string;
  titleAr: string;
  titleEn: string;
  durationMinutes: number;
  questions: QuestionData[];
}

const EXAM_RUNNER_I18N: Record<
  string,
  {
    passedTitle: string;
    failedTitle: string;
    scoreLabel: string;
    pointsLabel: string;
    xpLabel: string;
    returnDashboard: string;
    tryAgain: string;
    activeAssessment: string;
    questionOf: (curr: number, total: number) => string;
    pointsSuffix: string;
    recordPrompt: string;
    audioRecorded: string;
    recordingInProgress: string;
    recordingAttached: string;
    clickToRecord: string;
    typeAnswerPlaceholder: string;
    previous: string;
    nextQuestion: string;
    submitAssessment: string;
  }
> = {
  ar: {
    passedTitle: "أحسنت! لقد اجتزت الاختبار بنجاح",
    failedTitle: "اكتمل الاختبار - بحاجة إلى مزيد من المراجعة",
    scoreLabel: "النتيجة",
    pointsLabel: "النقاط",
    xpLabel: "نقاط الخبرة (XP)",
    returnDashboard: "العودة للوحة التعلم",
    tryAgain: "إعادة المحاولة",
    activeAssessment: "اختبار أكاديمي نشط",
    questionOf: (curr, total) => `السؤال ${curr} من ${total}`,
    pointsSuffix: "نقاط",
    recordPrompt: "انقر على الميكروفون وسجل قراءتك:",
    audioRecorded: "تم التسجيل الصوتي بنجاح",
    recordingInProgress: "جارٍ التسجيل الصوتي...",
    recordingAttached: "✓ تم حفظ التسجيل الصوتي",
    clickToRecord: "انقر لبدء التسجيل",
    typeAnswerPlaceholder: "اكتب إجابتك هنا...",
    previous: "السابق",
    nextQuestion: "التالي",
    submitAssessment: "تسليم الاختبار النهائي",
  },
  en: {
    passedTitle: "Congratulations! You Passed",
    failedTitle: "Assessment Completed - Keep Practicing",
    scoreLabel: "Score",
    pointsLabel: "Points",
    xpLabel: "XP Awarded",
    returnDashboard: "Return to Student Dashboard",
    tryAgain: "Try Again",
    activeAssessment: "Active Assessment",
    questionOf: (curr, total) => `Question ${curr} of ${total}`,
    pointsSuffix: "Points",
    recordPrompt: "Click microphone and record your response:",
    audioRecorded: "Audio response recorded",
    recordingInProgress: "Recording in progress...",
    recordingAttached: "✓ Voice recording attached",
    clickToRecord: "Click to record",
    typeAnswerPlaceholder: "Type your answer here...",
    previous: "Previous",
    nextQuestion: "Next Question",
    submitAssessment: "Submit Assessment",
  },
  nl: {
    passedTitle: "Gefeliciteerd! Je bent geslaagd",
    failedTitle: "Beoordeling voltooid - Blijf oefenen",
    scoreLabel: "Score",
    pointsLabel: "Punten",
    xpLabel: "XP Toegekend",
    returnDashboard: "Terug naar Leerlingdashboard",
    tryAgain: "Opnieuw Proberen",
    activeAssessment: "Actieve Toets",
    questionOf: (curr, total) => `Vraag ${curr} van ${total}`,
    pointsSuffix: "Punten",
    recordPrompt: "Klik op de microfoon en neem je antwoord op:",
    audioRecorded: "Audio-opname succesvol",
    recordingInProgress: "Opname bezig...",
    recordingAttached: "✓ Spraakopname toegevoegd",
    clickToRecord: "Klik om op te nemen",
    typeAnswerPlaceholder: "Typ hier je antwoord...",
    previous: "Vorige",
    nextQuestion: "Volgende Vraag",
    submitAssessment: "Toets Inleveren",
  },
  tr: {
    passedTitle: "Tebrikler! Değerlendirmeyi Geçtiniz",
    failedTitle: "Değerlendirme Tamamlandı - Pratik Yapmaya Devam Edin",
    scoreLabel: "Skor",
    pointsLabel: "Puan",
    xpLabel: "Kazanılan XP",
    returnDashboard: "Öğrenci Paneline Dön",
    tryAgain: "Tekrar Dene",
    activeAssessment: "Aktif Değerlendirme",
    questionOf: (curr, total) => `Soru ${curr} / ${total}`,
    pointsSuffix: "Puan",
    recordPrompt: "Mikrofona tıklayın ve cevabınızı kaydedin:",
    audioRecorded: "Ses kaydı başarıyla alındı",
    recordingInProgress: "Kayıt devam ediyor...",
    recordingAttached: "✓ Ses kaydı eklendi",
    clickToRecord: "Kaydetmek için tıklayın",
    typeAnswerPlaceholder: "Cevabınızı buraya yazın...",
    previous: "Önceki",
    nextQuestion: "Sonraki Soru",
    submitAssessment: "Değerlendirmeyi Gönder",
  },
  it: {
    passedTitle: "Congratulazioni! Hai superato la prova",
    failedTitle: "Valutazione completata - Continua ad esercitarti",
    scoreLabel: "Punteggio",
    pointsLabel: "Punti",
    xpLabel: "XP Assegnati",
    returnDashboard: "Torna alla Dashboard Studente",
    tryAgain: "Riprova",
    activeAssessment: "Valutazione Attiva",
    questionOf: (curr, total) => `Domanda ${curr} di ${total}`,
    pointsSuffix: "Punti",
    recordPrompt: "Fai clic sul microfono e registra la risposta:",
    audioRecorded: "Registrazione audio completata",
    recordingInProgress: "Registrazione in corso...",
    recordingAttached: "✓ Registrazione vocale allegata",
    clickToRecord: "Fai clic per registrare",
    typeAnswerPlaceholder: "Scrivi qui la tua risposta...",
    previous: "Precedente",
    nextQuestion: "Prossima Domanda",
    submitAssessment: "Invia Valutazione",
  },
  es: {
    passedTitle: "¡Felicidades! Has aprobado",
    failedTitle: "Evaluación completada - Sigue practicando",
    scoreLabel: "Puntuación",
    pointsLabel: "Puntos",
    xpLabel: "XP Otorgados",
    returnDashboard: "Volver al Panel de Estudiante",
    tryAgain: "Intentar de Nuevo",
    activeAssessment: "Evaluación Activa",
    questionOf: (curr, total) => `Pregunta ${curr} de ${total}`,
    pointsSuffix: "Puntos",
    recordPrompt: "Haz clic en el micrófono y graba tu respuesta:",
    audioRecorded: "Grabación de audio realizada",
    recordingInProgress: "Grabación en curso...",
    recordingAttached: "✓ Grabación de voz adjunta",
    clickToRecord: "Haz clic para grabar",
    typeAnswerPlaceholder: "Escribe tu respuesta aquí...",
    previous: "Anterior",
    nextQuestion: "Siguiente Pregunta",
    submitAssessment: "Entregar Evaluación",
  },
};

export function AssessmentExamRunner({
  locale,
  assessmentId,
  titleAr,
  titleEn,
  durationMinutes,
  questions,
}: AssessmentExamRunnerProps) {
  const isRtl = locale === "ar";
  const t = EXAM_RUNNER_I18N[locale] || EXAM_RUNNER_I18N.en;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const currentQ = questions[currentIndex];
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  const handleSelectAnswer = (ans: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: ans }));
  };

  const calculateScore = () => {
    let score = 0;
    let total = 0;
    questions.forEach((q) => {
      total += q.points;
      if (answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        score += q.points;
      }
    });
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    return { score, total, percentage };
  };

  const { score, total, percentage } = calculateScore();
  const passed = percentage >= 70;

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
        <div
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
            passed ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
          }`}
        >
          {passed ? <Award className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {passed ? t.passedTitle : t.failedTitle}
          </h2>
          <p className="text-sm text-slate-500">
            {isRtl ? titleAr : titleEn}
          </p>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-around">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">{t.scoreLabel}</div>
            <div className="text-3xl font-black text-slate-900">{percentage}%</div>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">{t.pointsLabel}</div>
            <div className="text-3xl font-black text-brand-600">{score} / {total}</div>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">{t.xpLabel}</div>
            <div className="text-3xl font-black text-amber-500">+{passed ? 150 : 50} XP</div>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Link
            href={`/${locale}/student`}
            className="px-6 py-3 gradient-brand text-white font-bold text-sm rounded-xl shadow-md hover:opacity-95 transition-all"
          >
            {t.returnDashboard}
          </Link>
          <button
            onClick={() => {
              setAnswers({});
              setIsSubmitted(false);
              setTimeLeftSeconds(durationMinutes * 60);
              setCurrentIndex(0);
            }}
            className="px-6 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.tryAgain}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            {t.activeAssessment}
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            {isRtl ? titleAr : titleEn}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-sm font-black px-4 py-2 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="font-mono">{formatTime(timeLeftSeconds)}</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">
          {t.questionOf(currentIndex + 1, questions.length)}
        </span>
        <div className="w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full gradient-brand transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {currentQ.type.replace(/_/g, " ")} • {currentQ.points} {t.pointsSuffix}
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            {isRtl ? currentQ.promptAr : currentQ.promptEn}
          </h2>
        </div>

        {/* Question Type Renderers */}
        <div className="space-y-4 pt-2">
          {/* 1. Multiple Choice / True-False / Matching */}
          {currentQ.options && currentQ.options.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = answers[currentQ.id] === opt;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectAnswer(opt)}
                    className={`p-5 rounded-2xl text-start border transition-all text-sm font-semibold flex items-center justify-between ${
                      isSelected
                        ? "border-brand-600 bg-brand-50/80 text-brand-950 ring-2 ring-brand-500/20 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          ) : currentQ.type === "SPEECH_RECORDING" ? (
            /* 2. Voice Recording Question */
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
              <div className="text-sm font-medium text-slate-700">
                {t.recordPrompt}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRecording(!isRecording);
                  handleSelectAnswer(t.audioRecorded);
                }}
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all ${
                  isRecording
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                }`}
              >
                <Mic className="w-7 h-7" />
              </button>
              <div className="text-xs text-slate-500">
                {isRecording
                  ? t.recordingInProgress
                  : answers[currentQ.id]
                  ? t.recordingAttached
                  : t.clickToRecord}
              </div>
            </div>
          ) : (
            /* 3. Text / Essay / Fill in Blank */
            <div>
              <textarea
                rows={3}
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleSelectAnswer(e.target.value)}
                placeholder={t.typeAnswerPlaceholder}
                className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            {t.previous}
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="px-6 py-2.5 gradient-brand text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-95 transition-all"
            >
              {t.nextQuestion}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSubmitted(true)}
              className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              {t.submitAssessment}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
