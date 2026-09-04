import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Play,
  Mic,
  Sparkles,
  Volume2,
  CheckCircle2,
  HelpCircle,
  Award,
} from "lucide-react";
import { quranService } from "@/server/services/QuranService";

export default async function QuranStudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ surah?: string }>;
}) {
  const { locale } = await params;
  const { surah: activeSurahId } = await searchParams;
  const isAr = locale === "ar";

  const surahs = await quranService.getSurahCatalog();
  const currentSurah = surahs.find((s) => s.id === activeSurahId) || surahs[1] || surahs[0]; // Default to Al-Ikhlas or first
  const pastSubmissions = await quranService.getStudentRecitations("student-1");

  const tajweedRulesLegend = [
    { nameAr: "القلقلة (قطب جد)", nameEn: "Qalqalah", colorHex: "#DC2626", bgClass: "bg-rose-50 text-rose-700 border-rose-200" },
    { nameAr: "المدود (2-6 حركات)", nameEn: "Madd (Elongation)", colorHex: "#9333EA", bgClass: "bg-purple-50 text-purple-700 border-purple-200" },
    { nameAr: "الإدغام بغنة", nameEn: "Idgham with Ghunnah", colorHex: "#2563EB", bgClass: "bg-blue-50 text-blue-700 border-blue-200" },
    { nameAr: "الإخفاء والإظهار", nameEn: "Ikhfa & Izhhar", colorHex: "#059669", bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href={`/${locale}/student`} className="hover:text-brand-600 flex items-center gap-1">
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
              {isAr ? "العودة إلى لوحة الطالب" : "Back to Student Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">{isAr ? "استوديو التلاوة والتجويد" : "Quran Studio"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-600" />
            {isAr ? "استوديو التلاوة الملونة وأحكام التجويد 📖" : "Interactive Quran & Tajweed Studio 📖"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isAr
              ? "استمع للآيات بالرسم العثماني الملون، تدرب على أحكام التجويد، وسجل تلاوتك بصوتك للحصول على تقييم المعلم ونقاط XP!"
              : "Listen to color-coded Tajweed verses in Uthmani script, record your recitation, and earn teacher feedback + XP rewards!"}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-2xl">
          <Award className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{isAr ? "مكافأة الإتقان:" : "Recitation Reward:"}</span>{" "}
            <span>+25 XP {isAr ? "لكل تلاوة متقنة" : "per verified Surah"}</span>
          </div>
        </div>
      </div>

      {/* Surah Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {surahs.map((s) => {
          const isSelected = s.id === currentSurah.id;
          return (
            <Link
              key={s.id}
              href={`/${locale}/student/quran-studio?surah=${s.id}`}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                isSelected
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
            >
              <span>{s.number}.</span>
              <span>{s.nameAr}</span>
              <span className={`text-[10px] ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                ({s.versesCount} {isAr ? "آيات" : "verses"})
              </span>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Recitation Stage (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tajweed Rules Color Legend */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-brand-600" />
              <span>{isAr ? "دليل ألوان أحكام التجويد المعتمدة:" : "Color-Coded Tajweed Guide:"}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tajweedRulesLegend.map((rule, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${rule.bgClass}`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: rule.colorHex }}
                  />
                  <span className="truncate">{isAr ? rule.nameAr : rule.nameEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verses Container */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="text-xs font-semibold text-emerald-700 tracking-wider">
                {currentSurah.revelationType === "MECCAN" ? (isAr ? "مَكِّيَّة" : "Meccan") : (isAr ? "مَدَنِيَّة" : "Medinan")}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-serif">
                {currentSurah.nameAr}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">{currentSurah.nameEn}</div>
            </div>

            {/* Basmalah */}
            {currentSurah.number !== 9 && (
              <div className="text-center text-xl sm:text-2xl font-serif text-slate-800 py-2">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}

            {/* Verses List */}
            <div className="space-y-6">
              {currentSurah.verses.map((v) => (
                <div
                  key={v.ayahNumber}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {v.ayahNumber}
                    </div>

                    <div className="flex-1 text-end">
                      <p className="text-xl sm:text-2xl leading-loose font-serif font-bold text-slate-900 dir-rtl">
                        {v.textUthmani}
                        <span className="text-emerald-600 text-lg ms-2">۝{v.ayahNumber}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1 text-start font-sans">
                        {v.translationEn}
                      </p>
                    </div>
                  </div>

                  {/* Tajweed Highlights Badges */}
                  {v.tajweedAnnotations.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500">
                        {isAr ? "الأحكام في هذه الآية:" : "Tajweed in this Ayah:"}
                      </span>
                      {v.tajweedAnnotations.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: t.colorHex }}
                          title={isAr ? t.ruleTitleAr : t.ruleTitleEn}
                        >
                          {t.textSnippet} ({isAr ? t.ruleTitleAr : t.ruleTitleEn})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Audio Practice & Recording Console (1 Col) */}
        <div className="space-y-6">
          {/* Interactive Voice Recorder Widget */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                {isAr ? "مسجل التلاوة التفاعلي" : "Recitation Recorder"}
              </span>
              <span className="px-2 py-0.5 bg-emerald-800/80 rounded-full text-[10px] text-emerald-200 font-semibold">
                Mic Active
              </span>
            </div>

            <div className="text-center py-4 space-y-3">
              {/* Simulated Audio Waveform */}
              <div className="h-16 flex items-center justify-center gap-1 px-4 bg-white/5 rounded-2xl border border-white/10">
                {[12, 28, 45, 18, 55, 34, 48, 20, 38, 52, 22, 14, 42, 30].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}px` }}
                    className="w-1.5 bg-emerald-400 rounded-full animate-pulse"
                  />
                ))}
              </div>

              <div className="text-xs font-mono text-emerald-200">00:24 / 01:30</div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                  title="Record"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                  title="Listen Back"
                >
                  <Play className="w-5 h-5 fill-current" />
                </button>
              </div>
            </div>

            {/* Submit Recitation Action */}
            <form action={async () => {
              "use server";
              await quranService.submitRecitation({
                studentId: "student-1",
                surahId: currentSurah.id,
                durationSeconds: 24,
              });
            }}>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? "إرسال التلاوة للتقييم (+25 XP) ⭐" : "Submit Recitation for Review (+25 XP) ⭐"}</span>
              </button>
            </form>
          </div>

          {/* Reciter Model Audio Player */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-brand-600" />
              <span>{isAr ? "الاستماع للشيخ المعلم (نموذج محاكي)" : "Teacher Model Audio"}</span>
            </h3>
            <p className="text-xs text-slate-600">
              {isAr
                ? "استمع لقراءة الشيخ المعلم بتمهل لملاحظة أماكن القلقلة والمدود بدقة."
                : "Listen to the Sheikh's clear recitation to observe Tajweed stops and vowel durations."}
            </p>
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-xs font-bold text-slate-800">
                {currentSurah.nameAr} - الشيخ محمود خليل الحصري
              </div>
              <button
                type="button"
                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                title="Play model"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>

          {/* Past Recitation History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? "سجل التلاوات المعتمدة لـ زيد" : "Zayd's Verified Recitations"}</span>
            </h3>

            <div className="space-y-2">
              {pastSubmissions.map((sub) => (
                <div key={sub.id} className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">سورة الإخلاص</span>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {sub.overallScore}% ممتاز
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-900 leading-relaxed">
                    {sub.teacherFeedbackAr}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">
                    +{sub.xpAwarded} XP • {sub.submittedAt.toLocaleDateString("ar-SA")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
