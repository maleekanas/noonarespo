"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  Trophy,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Zap,
  Activity,
  Bookmark,
} from "lucide-react";
import {
  PhonemeItem,
  MinimalPair,
  PhonemeSampleWord,
} from "@/server/repositories/PronunciationRepository";

interface PronunciationStudioProps {
  phonemes: PhonemeItem[];
  minimalPairs: MinimalPair[];
  locale: string;
  onEvaluate: (params: {
    phonemeId: string;
    audioDurationMs: number;
    userWaveformSamples: number[];
  }) => Promise<{
    scorePercentage: number;
    pitchAccuracy: number;
    clarityScore: number;
    isPassed: boolean;
    xpAwarded: number;
    newTotalXp: number;
    feedbackAr: string;
    feedbackEn: string;
  }>;
}

export function PronunciationWaveformStudio({
  phonemes,
  minimalPairs,
  locale,
  onEvaluate,
}: PronunciationStudioProps) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<"PHONEMES" | "MINIMAL_PAIRS">("PHONEMES");
  const [selectedPhonemeId, setSelectedPhonemeId] = useState<string>(
    phonemes[0]?.id || "phoneme-dhad"
  );
  const [selectedWord, setSelectedWord] = useState<PhonemeSampleWord | null>(
    phonemes[0]?.sampleWords[0] || null
  );

  // Audio Playback & Recording State
  const [isTeacherPlaying, setIsTeacherPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMakhrajTips, setShowMakhrajTips] = useState(false);

  // Evaluation Result State
  const [evaluationResult, setEvaluationResult] = useState<{
    scorePercentage: number;
    pitchAccuracy: number;
    clarityScore: number;
    isPassed: boolean;
    xpAwarded: number;
    newTotalXp: number;
    feedbackAr: string;
    feedbackEn: string;
  } | null>(null);

  // Simulated Waveform Data (0-100 values)
  const [teacherWaveform, setTeacherWaveform] = useState<number[]>([]);
  const [studentWaveform, setStudentWaveform] = useState<number[]>([]);

  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  const activePhoneme =
    phonemes.find((p) => p.id === selectedPhonemeId) || phonemes[0];

  // Initialize reference teacher waveform for selected phoneme
  useEffect(() => {
    // Generate an ideal smooth acoustic envelope (24 bins)
    const baseEnvelope = [
      15, 25, 45, 65, 80, 92, 98, 95, 88, 82, 75, 70, 68, 65, 60, 52, 45, 38,
      30, 24, 18, 12, 8, 4,
    ];
    setTeacherWaveform(baseEnvelope);
    setStudentWaveform([]);
    setEvaluationResult(null);
    if (activePhoneme.sampleWords.length > 0) {
      setSelectedWord(activePhoneme.sampleWords[0]);
    }
  }, [selectedPhonemeId, activePhoneme]);

  // Audio Speech Synthesis for Teacher Model
  function playTeacherAudio(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsTeacherPlaying(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.85; // Slightly slower for crisp educational phonetics
      utterance.onend = () => setIsTeacherPlaying(false);
      utterance.onerror = () => setIsTeacherPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  }

  // Handle Recording Start / Stop
  function handleToggleRecording() {
    if (isRecording) {
      // Stop recording
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setIsRecording(false);
      const durationMs = Date.now() - recordingStartTimeRef.current;
      analyzeRecording(durationMs);
    } else {
      // Start recording
      setEvaluationResult(null);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingStartTimeRef.current = Date.now();

      // Generate dynamic live waveform while recording
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
        const dynamicBins = Array.from({ length: 24 }, () =>
          Math.floor(20 + Math.random() * 75)
        );
        setStudentWaveform(dynamicBins);
      }, 250);
    }
  }

  // Submit and evaluate recording
  async function analyzeRecording(durationMs: number) {
    setIsAnalyzing(true);
    try {
      const generatedSamples =
        studentWaveform.length > 0
          ? studentWaveform
          : [20, 35, 55, 72, 85, 90, 94, 88, 76, 68, 60, 52, 40, 32, 25];

      const result = await onEvaluate({
        phonemeId: activePhoneme.id,
        audioDurationMs: Math.max(durationMs, 1000),
        userWaveformSamples: generatedSamples,
      });

      setEvaluationResult(result);
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleNextPhoneme() {
    const currentIndex = phonemes.findIndex((p) => p.id === activePhoneme.id);
    if (currentIndex < phonemes.length - 1) {
      setSelectedPhonemeId(phonemes[currentIndex + 1].id);
    } else {
      setSelectedPhonemeId(phonemes[0].id);
    }
  }

  return (
    <div className="space-y-8">
      {/* Studio Header Mode Switcher */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab("PHONEMES")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "PHONEMES"
              ? "bg-brand-600 text-white shadow-md shadow-brand-100"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isAr ? "مخارج الحروف والمطابقة الصوتية" : "Makharij & Waveform Studio"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("MINIMAL_PAIRS")}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "MINIMAL_PAIRS"
              ? "bg-brand-600 text-white shadow-md shadow-brand-100"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{isAr ? "الأزواج المتشابهة (المعنى والصوت)" : "Minimal Sound Pairs"}</span>
        </button>
      </div>

      {activeTab === "PHONEMES" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Letter Selector Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-brand-600" />
                <span>{isAr ? "اختر الحرف الصوتي المستهدف" : "Select Target Phoneme"}</span>
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {phonemes.map((item) => {
                  const isSelected = item.id === selectedPhonemeId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPhonemeId(item.id)}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-brand-50 border-brand-500 text-brand-700 shadow-md ring-2 ring-brand-300 scale-105"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-3xl font-black">{item.letter}</span>
                      <span className="text-xs font-bold text-slate-500">
                        {isAr ? item.letterNameAr : item.letterNameEn}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 ${
                          item.difficulty === "CHALLENGING"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.difficulty === "CHALLENGING"
                          ? (isAr ? "حرف مائز" : "Special")
                          : (isAr ? "مفخم" : "Heavy")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Makharij Anatomical Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-1 rounded-full">
                  {isAr ? "مخرج الحرف في الفم" : "Makhraj (Articulation Point)"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowMakhrajTips(!showMakhrajTips)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{showMakhrajTips ? (isAr ? "إخفاء" : "Hide") : (isAr ? "تفاصيل" : "Details")}</span>
                </button>
              </div>

              <div className="text-3xl mb-2">🗣️</div>
              <p className="text-sm font-semibold text-emerald-950 leading-relaxed mb-3">
                {isAr ? activePhoneme.makhrajAr : activePhoneme.makhrajEn}
              </p>

              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-900 mb-1">
                  {isAr ? "نصائح الإتقان الذهبية:" : "Pro Articulation Tips:"}
                </div>
                {(isAr ? activePhoneme.tipsAr : activePhoneme.tipsEn).map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Audio & Dual Waveform Studio */}
          <div className="lg:col-span-8 space-y-6">
            {/* Main Studio Console */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
              {/* Top Banner: Letter Spotlight */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-5xl font-black shadow-lg shadow-brand-200">
                    {activePhoneme.letter}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      {isAr ? `حرف الـ${activePhoneme.letterNameAr}` : `Letter ${activePhoneme.letterNameEn} (${activePhoneme.letter})`}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isAr
                        ? "استمع للنموذج الصوتي النموذجي ثم سجل صوتك للمطابقة"
                        : "Listen to the native teacher model then record to test your pitch match"}
                    </p>
                  </div>
                </div>

                {/* Teacher Sample Audio Button */}
                <button
                  type="button"
                  onClick={() => playTeacherAudio(selectedWord ? selectedWord.wordAr : activePhoneme.letter)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    isTeacherPlaying
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-200 animate-pulse"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <Volume2 className="w-5 h-5 text-amber-300" />
                  <span>{isTeacherPlaying ? (isAr ? "جارِ الاستماع..." : "Playing Model...") : (isAr ? "استمع لصوت المعلم 🔊" : "Listen to Model 🔊")}</span>
                </button>
              </div>

              {/* Sample Words with Harakat */}
              <div className="py-6 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">
                  <span>{isAr ? "تدرب على الحرف بالحركات المختلفة:" : "Practice with Arabic Vowels (Harakat):"}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {activePhoneme.sampleWords.map((wordItem, idx) => {
                    const isSelected = selectedWord?.wordAr === wordItem.wordAr;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedWord(wordItem);
                          playTeacherAudio(wordItem.wordAr);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? "bg-amber-50 border-amber-400 text-amber-900 shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-xl font-bold text-slate-900">{wordItem.wordAr}</span>
                        <span className="text-[11px] text-slate-500 font-medium mt-0.5">{wordItem.wordEn}</span>
                        <span className="text-[10px] text-brand-600 font-mono mt-0.5">{wordItem.transliteration}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dual Waveform Visualizer */}
              <div className="py-6 space-y-6">
                {/* Waveform 1: Reference Model */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-inner">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-400">
                      <Volume2 className="w-4 h-4" />
                      <span>{isAr ? "الموجة الصوتية للنموذج (المعلم):" : "Reference Teacher Waveform:"}</span>
                    </div>
                    <span className="text-slate-400 font-mono">44.1 kHz • Clean Voice</span>
                  </div>

                  <div className="h-16 flex items-center justify-between gap-1 px-2">
                    {teacherWaveform.map((val, i) => (
                      <div
                        key={i}
                        style={{ height: `${val}%` }}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          isTeacherPlaying ? "bg-amber-400 animate-pulse" : "bg-emerald-500/80"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Waveform 2: Student Recording */}
                <div className={`rounded-2xl p-5 border text-white shadow-inner transition-all ${
                  isRecording ? "bg-rose-950/90 border-rose-500 ring-2 ring-rose-400" : "bg-slate-900 border-slate-800"
                }`}>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex items-center gap-2 font-bold text-rose-400">
                      <Mic className="w-4 h-4" />
                      <span>{isAr ? "موجتك الصوتية (الطالب):" : "Your Voice Waveform:"}</span>
                    </div>
                    <div className="font-mono text-slate-400">
                      {isRecording ? (
                        <span className="text-rose-400 font-bold animate-pulse">
                          ● {isAr ? "جارِ التسجيل..." : "Recording..."} {recordingSeconds}s
                        </span>
                      ) : studentWaveform.length > 0 ? (
                        <span className="text-emerald-400 font-bold">✓ {isAr ? "تم الالتقاط" : "Captured"}</span>
                      ) : (
                        <span>{isAr ? "بانتظار التسجيل" : "Awaiting input"}</span>
                      )}
                    </div>
                  </div>

                  <div className="h-16 flex items-center justify-between gap-1 px-2">
                    {studentWaveform.length > 0 ? (
                      studentWaveform.map((val, i) => (
                        <div
                          key={i}
                          style={{ height: `${val}%` }}
                          className={`flex-1 rounded-full transition-all duration-150 ${
                            isRecording ? "bg-rose-500" : "bg-brand-400"
                          }`}
                        />
                      ))
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 italic">
                        {isAr ? "اضغط على زر التسجيل وتحدث بصوت واضح" : "Click 'Start Recording' and speak clearly"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Record & Evaluate */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  disabled={isAnalyzing}
                  className={`w-full sm:flex-1 py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-lg ${
                    isRecording
                      ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                      : "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-200"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-5 h-5" />
                      <span>{isAr ? "إيقاف التسجيل والتحليل ⏹️" : "Stop & Analyze Audio ⏹️"}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      <span>{isAr ? "ابدأ تسجيل نطقك 🎙️" : "Start Voice Recording 🎙️"}</span>
                    </>
                  )}
                </button>

                {evaluationResult && (
                  <button
                    type="button"
                    onClick={() => {
                      setStudentWaveform([]);
                      setEvaluationResult(null);
                    }}
                    className="py-4 px-5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{isAr ? "إعادة المحاولة" : "Reset"}</span>
                  </button>
                )}
              </div>

              {/* Analysis Loading Indicator */}
              {isAnalyzing && (
                <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-2xl flex items-center justify-center gap-3 text-brand-800 font-bold animate-pulse text-sm">
                  <Activity className="w-5 h-5 animate-spin" />
                  <span>{isAr ? "جارِ تحليل الترددات ومطابقة مخارج الحروف..." : "Analyzing frequencies and phonetic alignment..."}</span>
                </div>
              )}

              {/* Evaluation Celebration Results Banner */}
              {evaluationResult && !isAnalyzing && (
                <div className="mt-6 p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 border border-emerald-300 shadow-md">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-emerald-200">
                        <Trophy className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-black text-slate-900">
                            {isAr ? "نتيجة تقييم النطق" : "Pronunciation Assessment"}
                          </h4>
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                            {evaluationResult.scorePercentage}% {isAr ? "مطابقة" : "Match"}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-emerald-900 mt-1 font-medium">
                          {isAr ? evaluationResult.feedbackAr : evaluationResult.feedbackEn}
                        </p>
                      </div>
                    </div>

                    {/* XP Awarded badge */}
                    <div className="flex items-center gap-2 bg-amber-100 border border-amber-300 px-4 py-2 rounded-2xl text-amber-900 font-black text-sm shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>+{evaluationResult.xpAwarded} XP {isAr ? "مكتسبة!" : "Earned!"}</span>
                    </div>
                  </div>

                  {/* Acoustic Metric Gauges */}
                  <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-emerald-200/60">
                    <div className="bg-white/80 backdrop-blur rounded-2xl p-3 border border-emerald-100">
                      <div className="text-xs text-slate-500 font-bold mb-1">
                        {isAr ? "وضوح الصوت ومخارج الهواء:" : "Acoustic Clarity:"}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${evaluationResult.clarityScore}%` }}
                            className="bg-emerald-500 h-full rounded-full"
                          />
                        </div>
                        <span className="text-xs font-black text-slate-800 font-mono">
                          {evaluationResult.clarityScore}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur rounded-2xl p-3 border border-emerald-100">
                      <div className="text-xs text-slate-500 font-bold mb-1">
                        {isAr ? "دقة النغمة والرنين (Pitch):" : "Pitch Resonance Match:"}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${evaluationResult.pitchAccuracy}%` }}
                            className="bg-teal-500 h-full rounded-full"
                          />
                        </div>
                        <span className="text-xs font-black text-slate-800 font-mono">
                          {evaluationResult.pitchAccuracy}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next Letter Button */}
                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextPhoneme}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
                    >
                      <span>{isAr ? "الانتقال للحرف التالي ➡️" : "Next Letter ➡️"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Minimal Pairs Practice */}
      {activeTab === "MINIMAL_PAIRS" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-brand-50 via-sky-50 to-indigo-50 border border-brand-200 rounded-3xl p-6">
            <h3 className="text-lg font-black text-brand-950 mb-1">
              {isAr ? "الأزواج اللغوية المتشابهة: كيف يغير الحرف معنى الكلمة؟" : "Minimal Sound Pairs: How One Letter Changes Meaning"}
            </h3>
            <p className="text-xs md:text-sm text-brand-800 leading-relaxed">
              {isAr
                ? "في اللغة العربية، استبدال حرف مرقق بآخر مفخم قد يغير معنى الكلمة بالكامل (مثل: سَيْف ⚔️ وصَيْف ☀️، أَوْ كَلْب 🐕 وقَلْب ❤️). استمع وتدرب على التمييز بينهما."
                : "In Arabic, confusing a light phoneme with an emphatic one completely changes the meaning (e.g. Sayf 'sword' vs Sayf 'summer', Kalb 'dog' vs Qalb 'heart'). Listen and master the difference."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {minimalPairs.map((pair) => (
              <div
                key={pair.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-brand-600">{pair.phonemeA}</span>
                    <span className="text-xs font-bold text-slate-400">مُقَابِل</span>
                    <span className="text-2xl font-black text-rose-600">{pair.phonemeB}</span>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                    {pair.letterNameA} × {pair.letterNameB}
                  </span>
                </div>

                {/* Word Comparison Tiles */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Word A */}
                  <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 text-center">
                    <span className="text-2xl font-black text-slate-900 block mb-1">{pair.wordA.wordAr}</span>
                    <span className="text-xs font-bold text-sky-800 block">{pair.wordA.wordEn}</span>
                    <span className="text-[11px] font-mono text-slate-500 block mb-3">{pair.wordA.transliteration}</span>
                    <button
                      type="button"
                      onClick={() => playTeacherAudio(pair.wordA.wordAr)}
                      className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isAr ? "استمع" : "Listen"}</span>
                    </button>
                  </div>

                  {/* Word B */}
                  <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 text-center">
                    <span className="text-2xl font-black text-slate-900 block mb-1">{pair.wordB.wordAr}</span>
                    <span className="text-xs font-bold text-rose-800 block">{pair.wordB.wordEn}</span>
                    <span className="text-[11px] font-mono text-slate-500 block mb-3">{pair.wordB.transliteration}</span>
                    <button
                      type="button"
                      onClick={() => playTeacherAudio(pair.wordB.wordAr)}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isAr ? "استمع" : "Listen"}</span>
                    </button>
                  </div>
                </div>

                {/* Linguistic Explanation */}
                <div className="bg-slate-50 p-3.5 rounded-2xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    {isAr ? "الفارق الصوتي الدقيق:" : "Phonetic Distinction:"}
                  </span>
                  {isAr ? pair.distinctionExplanationAr : pair.distinctionExplanationEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
