"use client";

import React, { useState } from "react";
import {
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Zap,
  Gamepad2,
  ArrowLeft,
} from "lucide-react";

interface PhonicsArcadeStudioProps {
  studentName: string;
  onCompleteActivity: () => Promise<void>;
}

type TabType = "PHONICS" | "BUILDER" | "MEMORY";

interface PhonicsLetter {
  char: string;
  nameAr: string;
  fathaExample: string;
  dammaExample: string;
  kasraExample: string;
  sukunExample: string;
}

const LETTERS: PhonicsLetter[] = [
  { char: "أ", nameAr: "أَلِف", fathaExample: "أَسَد (Asad)", dammaExample: "أُمِّي (Ummi)", kasraExample: "إِبْرِيق (Ibreeq)", sukunExample: "فَأْر (Fa'r)" },
  { char: "ب", nameAr: "بَاء", fathaExample: "بَطَّة (Battah)", dammaExample: "بُرْتُقَال (Burtuqal)", kasraExample: "بِنْت (Bint)", sukunExample: "حَبْل (Habl)" },
  { char: "ت", nameAr: "تَاء", fathaExample: "تَمْر (Tamr)", dammaExample: "تُفَّاح (Tuffah)", kasraExample: "تِمْسَاح (Timsah)", sukunExample: "كَتْكُوت (Katkoot)" },
  { char: "ث", nameAr: "ثَاء", fathaExample: "ثَعْلَب (Tha'lab)", dammaExample: "ثُعْبَان (Thu'ban)", kasraExample: "ثِيَاب (Thiyab)", sukunExample: "عُثْمَان ('Uthman)" },
  { char: "ج", nameAr: "جِيم", fathaExample: "جَمَل (Jamal)", dammaExample: "جُنْدِي (Jundi)", kasraExample: "جِدَار (Jidar)", sukunExample: "نَجْم (Najm)" },
  { char: "ح", nameAr: "حَاء", fathaExample: "حَمَامَة (Hamamah)", dammaExample: "حُوت (Hoot)", kasraExample: "حِصَان (Hisaan)", sukunExample: "بَحْر (Bahr)" },
  { char: "د", nameAr: "دَال", fathaExample: "دَرَاجَة (Darrajah)", dammaExample: "دُبّ (Dubb)", kasraExample: "دِيك (Deek)", sukunExample: "بَدْر (Badr)" },
  { char: "ر", nameAr: "رَاء", fathaExample: "رَجُل (Rajul)", dammaExample: "رُمَّان (Rumman)", kasraExample: "رِيشَة (Reeshah)", sukunExample: "وَرْد (Ward)" },
  { char: "س", nameAr: "سِين", fathaExample: "سَمَكَة (Samakah)", dammaExample: "سُلَحْفَاة (Sulahfah)", kasraExample: "سِتَار (Sitar)", sukunExample: "مَسْجِد (Masjid)" },
  { char: "ش", nameAr: "شِين", fathaExample: "شَمْس (Shams)", dammaExample: "شُعَاع (Shu'a')", kasraExample: "شِتَاء (Shita')", sukunExample: "مِشْمِش (Mishmish)" },
  { char: "ق", nameAr: "قَاف", fathaExample: "قَلَم (Qalam)", dammaExample: "قُبَّعَة (Qubba'ah)", kasraExample: "قِطَار (Qitar)", sukunExample: "صَقْر (Saqr)" },
  { char: "م", nameAr: "مِيم", fathaExample: "مَوْز (Mawz)", dammaExample: "مُعَلِّم (Mu'allim)", kasraExample: "مِقَصّ (Miqass)", sukunExample: "تَمْر (Tamr)" },
];

interface HarakaOption {
  symbol: string;
  nameAr: string;
  soundLabel: string;
  colorClass: string;
}

const HARAKAT: HarakaOption[] = [
  { symbol: "َ", nameAr: "الْفَتْحَة", soundLabel: "A (ـَ)", colorClass: "bg-amber-100 text-amber-800 border-amber-300" },
  { symbol: "ُ", nameAr: "الضَّمَّة", soundLabel: "U (ـُ)", colorClass: "bg-blue-100 text-blue-800 border-blue-300" },
  { symbol: "ِ", nameAr: "الْكَسْرَة", soundLabel: "I (ـِ)", colorClass: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { symbol: "ْ", nameAr: "السُّكُون", soundLabel: "Sukun (ـْ)", colorClass: "bg-purple-100 text-purple-800 border-purple-300" },
];

interface WordChallenge {
  id: number;
  wordFull: string;
  meaningEn: string;
  emoji: string;
  correctLetters: string[];
  scrambledLetters: string[];
}

const WORD_CHALLENGES: WordChallenge[] = [
  {
    id: 1,
    wordFull: "قَلَم",
    meaningEn: "Pen",
    emoji: "🖊️",
    correctLetters: ["ق", "ل", "م"],
    scrambledLetters: ["ل", "م", "ق"],
  },
  {
    id: 2,
    wordFull: "شَمْس",
    meaningEn: "Sun",
    emoji: "☀️",
    correctLetters: ["ش", "م", "س"],
    scrambledLetters: ["س", "ش", "م"],
  },
  {
    id: 3,
    wordFull: "نَجْم",
    meaningEn: "Star",
    emoji: "⭐",
    correctLetters: ["ن", "ج", "م"],
    scrambledLetters: ["ج", "ن", "م"],
  },
  {
    id: 4,
    wordFull: "كِتَاب",
    meaningEn: "Book",
    emoji: "📖",
    correctLetters: ["ك", "ت", "ا", "ب"],
    scrambledLetters: ["ت", "ب", "ك", "ا"],
  },
];

interface MemoryCard {
  id: number;
  pairKey: string;
  display: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const INITIAL_MEMORY_CARDS: MemoryCard[] = [
  { id: 1, pairKey: "lion", display: "🦁", isFlipped: false, isMatched: false },
  { id: 2, pairKey: "lion", display: "أَسَد", isFlipped: false, isMatched: false },
  { id: 3, pairKey: "rabbit", display: "🐰", isFlipped: false, isMatched: false },
  { id: 4, pairKey: "rabbit", display: "أَرْنَب", isFlipped: false, isMatched: false },
  { id: 5, pairKey: "duck", display: "🦆", isFlipped: false, isMatched: false },
  { id: 6, pairKey: "duck", display: "بَطَّة", isFlipped: false, isMatched: false },
];

export function PhonicsArcadeStudio({
  studentName,
  onCompleteActivity,
}: PhonicsArcadeStudioProps) {
  const [activeTab, setActiveTab] = useState<TabType>("PHONICS");
  const [isSubmittingXp, setIsSubmittingXp] = useState(false);
  const [xpAwardedNotification, setXpAwardedNotification] = useState(false);

  // Phonics Soundboard State
  const [selectedLetter, setSelectedLetter] = useState<PhonicsLetter>(LETTERS[0]);
  const [selectedHaraka, setSelectedHaraka] = useState<HarakaOption>(HARAKAT[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Word Builder State
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const currentChallenge = WORD_CHALLENGES[currentWordIdx];
  const [assembledLetters, setAssembledLetters] = useState<string[]>([]);
  const [builderStatus, setBuilderStatus] = useState<"IDLE" | "SUCCESS" | "TRY_AGAIN">("IDLE");

  // Memory Match State
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>(INITIAL_MEMORY_CARDS);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [memoryMatchesCount, setMemoryMatchesCount] = useState(0);

  // Simulated Web Speech / Sound Trigger
  function playPhonicSound(text: string) {
    setIsPlayingAudio(true);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.85;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 900);
    }
  }

  // Handle Word Builder Tile Click
  function handleAddLetter(char: string) {
    if (assembledLetters.length >= currentChallenge.correctLetters.length) return;
    const next = [...assembledLetters, char];
    setAssembledLetters(next);
    setBuilderStatus("IDLE");

    if (next.length === currentChallenge.correctLetters.length) {
      const isCorrect = next.every((val, idx) => val === currentChallenge.correctLetters[idx]);
      if (isCorrect) {
        setBuilderStatus("SUCCESS");
        playPhonicSound(currentChallenge.wordFull);
      } else {
        setBuilderStatus("TRY_AGAIN");
      }
    }
  }

  function handleResetWordBuilder() {
    setAssembledLetters([]);
    setBuilderStatus("IDLE");
  }

  function handleNextWordChallenge() {
    handleResetWordBuilder();
    setCurrentWordIdx((prev) => (prev + 1) % WORD_CHALLENGES.length);
  }

  // Handle Memory Flip
  function handleFlipCard(card: MemoryCard) {
    if (card.isFlipped || card.isMatched || flippedIds.length >= 2) return;

    const newFlipped = [...flippedIds, card.id];
    const updatedCards = memoryCards.map((c) =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setMemoryCards(updatedCards);
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      const firstCard = updatedCards.find((c) => c.id === newFlipped[0]);
      const secondCard = updatedCards.find((c) => c.id === newFlipped[1]);

      if (firstCard && secondCard && firstCard.pairKey === secondCard.pairKey) {
        // Matched!
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c) =>
              c.pairKey === firstCard.pairKey ? { ...c, isMatched: true } : c
            )
          );
          setFlippedIds([]);
          setMemoryMatchesCount((prev) => prev + 1);
        }, 500);
      } else {
        // Not matched -> Flip back
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIds([]);
        }, 900);
      }
    }
  }

  function handleResetMemory() {
    setMemoryCards(
      INITIAL_MEMORY_CARDS.map((c) => ({ ...c, isFlipped: false, isMatched: false }))
    );
    setFlippedIds([]);
    setMemoryMatchesCount(0);
  }

  // Server Action XP claim
  async function handleClaimXp() {
    try {
      setIsSubmittingXp(true);
      await onCompleteActivity();
      setXpAwardedNotification(true);
      setTimeout(() => setXpAwardedNotification(false), 5000);
    } finally {
      setIsSubmittingXp(false);
    }
  }

  const combinedLetterWithHaraka = `${selectedLetter.char}${selectedHaraka.symbol}`;

  const currentExample =
    selectedHaraka.symbol === "َ"
      ? selectedLetter.fathaExample
      : selectedHaraka.symbol === "ُ"
      ? selectedLetter.dammaExample
      : selectedHaraka.symbol === "ِ"
      ? selectedLetter.kasraExample
      : selectedLetter.sukunExample;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {xpAwardedNotification && (
        <div className="p-4 rounded-2xl bg-amber-500 text-slate-950 font-extrabold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 fill-slate-950" />
            <div>
              <p className="text-sm font-black">أحسنت يا {studentName || "بطل"}! 🎉 تم تسجيل إنجازك بنجاح</p>
              <p className="text-xs font-semibold">أضيف إلى حسابك +30 XP في سجل الأنشطة والمهارات</p>
            </div>
          </div>
          <span className="text-xs bg-slate-950 text-white px-3 py-1 rounded-full">
            المستوى مكتمل ✓
          </span>
        </div>
      )}

      {/* Arcade Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("PHONICS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "PHONICS"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>لوحة أصوات الحروف والحركات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("BUILDER")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "BUILDER"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>مختبر تركيب الكلمات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("MEMORY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "MEMORY"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>تحدي الذاكرة والمطابقة</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleClaimXp}
          disabled={isSubmittingXp}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs shadow-sm transition-all disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5 fill-slate-900" />
          <span>{isSubmittingXp ? "جارِ التسجيل..." : "تسجيل إنجاز (+30 XP)"}</span>
        </button>
      </div>

      {/* TAB 1: PHONICS SOUNDBOARD */}
      {activeTab === "PHONICS" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            {/* Interactive Letter Display Showcase */}
            <div className="flex items-center gap-6">
              <div
                onClick={() => playPhonicSound(combinedLetterWithHaraka)}
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-4 flex flex-col items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                  isPlayingAudio
                    ? "bg-amber-100 border-amber-400 animate-pulse"
                    : "bg-gradient-to-br from-brand-50 to-indigo-50 border-brand-300"
                }`}
              >
                <span className="text-6xl sm:text-7xl font-bold font-serif text-brand-700 leading-none">
                  {combinedLetterWithHaraka}
                </span>
                <span className="text-[11px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-brand-600" />
                  <span>انقر للسماع</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800 inline-block">
                  حرف {selectedLetter.nameAr} ({selectedLetter.char})
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  الحركة: {selectedHaraka.nameAr} ({selectedHaraka.soundLabel})
                </h3>
                <p className="text-xs text-slate-500">
                  مثال مصور في كلمة:{" "}
                  <span className="font-bold text-slate-900 font-serif text-sm">
                    {currentExample}
                  </span>
                </p>
              </div>
            </div>

            {/* 4 Harakat Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 block">اختر الحركة الإعرابية:</span>
              <div className="grid grid-cols-2 gap-2">
                {HARAKAT.map((h) => (
                  <button
                    key={h.symbol}
                    type="button"
                    onClick={() => {
                      setSelectedHaraka(h);
                      playPhonicSound(`${selectedLetter.char}${h.symbol}`);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between gap-2 ${
                      selectedHaraka.symbol === h.symbol
                        ? `${h.colorClass} shadow-xs font-extrabold ring-2 ring-brand-400`
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{h.nameAr}</span>
                    <span className="text-base font-serif font-bold">
                      {selectedLetter.char}
                      {h.symbol}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Letter Selector Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              اختر حرفاً من الحروف العربية الأساسية:
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2.5">
              {LETTERS.map((letter) => {
                const isSelected = selectedLetter.char === letter.char;
                return (
                  <button
                    key={letter.char}
                    type="button"
                    onClick={() => {
                      setSelectedLetter(letter);
                      playPhonicSound(`${letter.char}${selectedHaraka.symbol}`);
                    }}
                    className={`py-3 rounded-2xl text-2xl font-bold font-serif transition-all border ${
                      isSelected
                        ? "gradient-brand text-white border-transparent shadow-md scale-105"
                        : "bg-slate-50 hover:bg-brand-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    {letter.char}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORD BUILDER / SCRAMBLER */}
      {activeTab === "BUILDER" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                التحدي {currentWordIdx + 1} من {WORD_CHALLENGES.length}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                ركّب حروف الكلمة بالترتيب الصحيح!
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetWordBuilder}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
                title="إعادة المحاولة"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextWordChallenge}
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1"
              >
                <span>الكلمة التالية</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Puzzle Target Area */}
          <div className="p-8 rounded-3xl bg-purple-50/50 border-2 border-dashed border-purple-200 text-center space-y-6">
            <div className="text-6xl">{currentChallenge.emoji}</div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500">
                المعنى بالإنجليزية: {currentChallenge.meaningEn}
              </p>
              <div className="flex items-center justify-center gap-3">
                {currentChallenge.correctLetters.map((_, i) => (
                  <div
                    key={i}
                    className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold font-serif transition-all ${
                      assembledLetters[i]
                        ? "bg-white border-purple-500 text-purple-700 shadow-sm"
                        : "bg-white/60 border-slate-200 text-slate-300"
                    }`}
                  >
                    {assembledLetters[i] || "؟"}
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Feedback */}
            {builderStatus === "SUCCESS" && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>ما شاء الله! تركيب صحيح: {currentChallenge.wordFull} (+10 XP)</span>
              </div>
            )}

            {builderStatus === "TRY_AGAIN" && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                <span>حاول مرة أخرى يا بطل! اضغط إعادة المحاولة ↺</span>
              </div>
            )}
          </div>

          {/* Scrambled Letter Tiles */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              اضغط على الحروف لتركيبها في الخانات:
            </span>
            <div className="flex items-center justify-center gap-3">
              {currentChallenge.scrambledLetters.map((letter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddLetter(letter)}
                  className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 hover:border-purple-500 text-slate-900 hover:text-purple-700 text-3xl font-bold font-serif shadow-sm hover:scale-105 active:scale-95 transition-all"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEMORY MATCHING */}
      {activeTab === "MEMORY" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                تحدي الذاكرة والمطابقة
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                اقلب البطاقات وطابق الكلمة العربية مع صورتها
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">
                المطابقات: {memoryMatchesCount} / 3
              </span>
              <button
                type="button"
                onClick={handleResetMemory}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
                title="إعادة اللعبة"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            {memoryCards.map((card) => {
              const isVisible = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleFlipCard(card)}
                  disabled={card.isMatched}
                  className={`h-28 rounded-2xl border-2 flex items-center justify-center text-center transition-all duration-300 shadow-xs ${
                    card.isMatched
                      ? "bg-emerald-50 border-emerald-400 text-emerald-800 scale-95 opacity-80 cursor-default"
                      : isVisible
                      ? "bg-white border-brand-500 text-slate-900 scale-105"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-400"
                  }`}
                >
                  {isVisible ? (
                    <span
                      className={`font-bold ${
                        card.display.length > 2 ? "text-xl font-serif text-brand-700" : "text-4xl"
                      }`}
                    >
                      {card.display}
                    </span>
                  ) : (
                    <span className="text-3xl font-serif text-slate-400">؟</span>
                  )}
                </button>
              );
            })}
          </div>

          {memoryMatchesCount === 3 && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 max-w-lg mx-auto animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-extrabold text-sm">
                <Trophy className="w-5 h-5" />
                <span>رائع جداً! أتممت مطابقة جميع البطاقات بنجاح</span>
              </div>
              <button
                type="button"
                onClick={handleClaimXp}
                className="px-4 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-xs hover:opacity-95"
              >
                تسجيل إنجاز الذاكرة (+30 XP)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
