"use client";

import React, { useState } from "react";
import { Volume2, Sparkles, CheckCircle2, AlertCircle, Play, Music } from "lucide-react";

interface InteractivePhonemeSoundboardProps {
  locale: string;
  isRtl?: boolean;
}

interface PhonemeData {
  letter: string;
  nameEn: string;
  nameAr: string;
  ipa: string;
  sampleWordAr: string;
  sampleWordEn: string;
  sampleWordTranslit: string;
  makhrajEn: string;
  makhrajAr: string;
  mistakeEn: string;
  mistakeAr: string;
  tipEn: string;
  tipAr: string;
  synthFrequency: number;
}

const PHONEMES: PhonemeData[] = [
  {
    letter: "ض",
    nameEn: "Ḍād (The Arabic Signature)",
    nameAr: "الضاد (لغة الضاد)",
    ipa: "/dˤ/",
    sampleWordAr: "ضَوْء",
    sampleWordEn: "Light",
    sampleWordTranslit: "Ḍawʾ",
    makhrajEn: "Lateral edges of the tongue pressed against the upper molars.",
    makhrajAr: "من إحدى حافتي اللسان أو كلتيهما مع ما يحاذيها من الأضراس العليا.",
    mistakeEn: "Substituted with a plain English 'D' or flat 'Z'.",
    mistakeAr: "خلطه بحرف الدال المرققة أو الزاي في بعض اللهجات غير الفصيحة.",
    tipEn: "Our native teachers guide children to expand their tongue laterally, producing the deep, resonant tone unique to Arabic.",
    tipAr: "يدرب معلمونا الأطفال على استطالة اللسان والضغط الجانبي الرقيق لإخراج الصوت الرخو الفصيح.",
    synthFrequency: 220,
  },
  {
    letter: "ع",
    nameEn: "ʿAyn (Deep Throat Resonance)",
    nameAr: "العين (حلقي مجهور)",
    ipa: "/ʕ/",
    sampleWordAr: "عَسَل",
    sampleWordEn: "Honey",
    sampleWordTranslit: "ʿAsal",
    makhrajEn: "Middle of the throat (pharynx), squeezed gently with vocal fold vibration.",
    makhrajAr: "من وسط الحلق (منطقة لسان المزمار) بانضغاط معتدل وصوت نقي.",
    mistakeEn: "Often replaced with a flat 'A' or swallowed without clear throat constriction.",
    mistakeAr: "نطقه كهمزة أو ألف ممدودة مفخمة دون توسط حلقي صحيح.",
    tipEn: "Children practice with fun sensory games ('clearing a smooth path in the middle throat') to make it effortless.",
    tipAr: "يتعلم الطفل التحكم في عضلات الحلق عبر ألعاب صوتية ممتعة دون أي إجهاد صوتي.",
    synthFrequency: 280,
  },
  {
    letter: "ح",
    nameEn: "Ḥāʾ (Whispered Pharyngeal)",
    nameAr: "الحاء (حلقي مهموس)",
    ipa: "/ħ/",
    sampleWordAr: "حَدِيقَة",
    sampleWordEn: "Garden",
    sampleWordTranslit: "Ḥadīqah",
    makhrajEn: "Middle of the throat with continuous whispering friction (Hams).",
    makhrajAr: "من وسط الحلق مع جريان النفس والهمس دون أي خشونة لهوية.",
    mistakeEn: "Confused with the raspy 'Khāʾ' or a weak English 'H'.",
    mistakeAr: "خلطه بحرف الخاء الخشن أو الهاء الضعيفة المخرجة من أقصى الصدر.",
    tipEn: "We teach kids the 'warm breath on a mirror on a frosty morning' technique for instant crystal-clear perfection.",
    tipAr: "تقنية 'بخار النفس الدافئ' تمكن الأطفال من نطق الحاء الصافية من أول جلسة.",
    synthFrequency: 330,
  },
  {
    letter: "ص",
    nameEn: "Ṣād (Emphatic Whistling)",
    nameAr: "الصاد (صفير واستعلاء)",
    ipa: "/sˤ/",
    sampleWordAr: "صَبَاح",
    sampleWordEn: "Morning",
    sampleWordTranslit: "Ṣabāḥ",
    makhrajEn: "Tip of the tongue above the lower front teeth with elevated back of tongue (Isti'laa).",
    makhrajAr: "من رأس اللسان مع أطراف الثنايا السفلى مع استعلاء أقصى اللسان وإطباقه.",
    mistakeEn: "Pronounced like a light English 'S' without full mouth chamber resonance.",
    mistakeAr: "نطقه كحرف السين المرققة مما يغير معاني الكلمات القرآنية.",
    tipEn: "Our interactive audio waveforms show kids exactly how to elevate the rear tongue to produce full resonance.",
    tipAr: "تساعد الرسوم التفاعلية الطفل على رفع مؤخرة اللسان ورؤية شكل الموجة الممتلئة.",
    synthFrequency: 390,
  },
  {
    letter: "ق",
    nameEn: "Qāf (Deep Uvular Stop)",
    nameAr: "القاف (أقصى اللسان فوقي)",
    ipa: "/q/",
    sampleWordAr: "قَمَر",
    sampleWordEn: "Moon",
    sampleWordTranslit: "Qamar",
    makhrajEn: "Extreme back of tongue against the soft palate with Qalqalah (echo rebound).",
    makhrajAr: "من أقصى اللسان مع ما يحاذيه من الحنك الأعلى الرخو مع اضطراب المخرج (القلقلة).",
    mistakeEn: "Pronounced like English 'K' or collapsed into a glottal stop / Hamza in casual slang.",
    mistakeAr: "قلبه إلى كاف أو همزة كما في بعض اللهجات العامية المعاصرة.",
    tipEn: "Certified Quranic tutors guide kids in the crisp Qalqalah rebound, essential for authentic recitation.",
    tipAr: "تدريب تطبيقي على نبرة القلقلة الصريحة دون إفراط لتلاوة قرآنية سليمة.",
    synthFrequency: 440,
  },
  {
    letter: "ط",
    nameEn: "Ṭāʾ (Strongest Emphatic)",
    nameAr: "الطاء (أقوى الحروف إطباقاً)",
    ipa: "/tˤ/",
    sampleWordAr: "طَرِيق",
    sampleWordEn: "Path / Road",
    sampleWordTranslit: "Ṭarīq",
    makhrajEn: "Tip of tongue against the roots of upper front teeth with maximum roof contact (Itbaq).",
    makhrajAr: "من طرف اللسان مع أصول الثنايا العليا مع انطباق طائفة من اللسان إلى الحنك.",
    mistakeEn: "Replaced with English 'T', losing the noble gravitas of the Arabic sound.",
    mistakeAr: "ترقيقه ليصبح كالتاء أو نطق التاء مفخمة مما يخل بالفصاحة.",
    tipEn: "Children learn the distinction between 'Taa' and 'Taa' through fun minimal pair audio battles.",
    tipAr: "تحديات الأزواج اللفظية (تاب / طاب) تعزز التمييز السمعي والنطقي الدقيق.",
    synthFrequency: 520,
  },
];

const SOUNDBOARD_UI: Record<string, {
  badge: string;
  title: string;
  desc: string;
  exampleWord: string;
  playBtn: string;
  makhrajTitle: string;
  mistakeTitle: string;
  secretTitle: string;
}> = {
  ar: {
    badge: "لوحة مخارج الحروف الصوتية التفاعلية",
    title: "لماذا يحتاج طفلك إلى معلم ناطق أصلي معتمد؟",
    desc: "انقر على أي حرف لتسمع مخارج الحروف الفصيحة وتكتشف كيف ندرّب أطفال المهجر على التحدث بلسان عربي مبين دون عجمة.",
    exampleWord: "نموذج الكلمة: ",
    playBtn: "استمع للنطق النموذجي",
    makhrajTitle: "المخرج التشريحي الدقيق",
    mistakeTitle: "الخطأ الشائع في المهجر",
    secretTitle: "سر أسلوبنا التعليمي",
  },
  nl: {
    badge: "Interactief Klankbord voor Arabische Uitspraak & Makharij",
    title: "Waarom generieke apps tekortschieten: de kunst van Arabische klanken",
    desc: "Klik op een letter om de authentieke moedertaaluitspraak te horen en ontdek hoe onze docenten diaspora-kinderen leren spreken met vlekkeloze welsprekendheid.",
    exampleWord: "Voorbeeldwoord: ",
    playBtn: "Luister naar authentieke uitspraak",
    makhrajTitle: "Anatomisch articulatiepunt (Makhraj)",
    mistakeTitle: "Veelgemaakte fout in de diaspora",
    secretTitle: "Het geheim van onze academie",
  },
  tr: {
    badge: "İnteraktif Arapça Fonem ve Mahreç Ses Panosu",
    title: "Standart Uygulamalar Neden Yetersiz Kalır: Arapça Fonetik Sanatı",
    desc: "Özgün ana dil telaffuzunu duymak ve sertifikalı eğitmenlerimizin çocuklara nasıl kusursuz Arapça öğrettiğini görmek için herhangi bir harfe tıklayın.",
    exampleWord: "Örnek kelime: ",
    playBtn: "Özgün Telaffuzu Dinle",
    makhrajTitle: "Anatomik Mahreç Noktası",
    mistakeTitle: "Yurt Dışında Sık Yapılan Hata",
    secretTitle: "Akademimizin Öğretim Sırrı",
  },
  it: {
    badge: "Tavola Sonora Interattiva dei Fonemi e Makharij Arabi",
    title: "Perché le app generiche falliscono: l'arte della fonetica araba",
    desc: "Clicca su qualsiasi lettera per ascoltare l'articolazione madrelingua autentica e scoprire come i nostri docenti guidano i bambini a parlare con perfetta eloquenza.",
    exampleWord: "Parola di esempio: ",
    playBtn: "Ascolta l'articolazione autentica",
    makhrajTitle: "Punto di articolazione anatomico (Makhraj)",
    mistakeTitle: "Errore comune nella diaspora",
    secretTitle: "Il segreto della nostra accademia",
  },
  es: {
    badge: "Panel Sonoro Interactivo de Fonemas y Majárij Árabes",
    title: "Por qué las apps genéricas fallan: el arte de la fonética árabe",
    desc: "Haz clic en cualquier letra para escuchar la articulación nativa auténtica y ver cómo nuestros tutores certificados enseñan a los niños a hablar con elocuencia impecable.",
    exampleWord: "Palabra de ejemplo: ",
    playBtn: "Escuchar pronunciación nativa",
    makhrajTitle: "Punto de articulación anatómico (Makhraj)",
    mistakeTitle: "Error común en la diáspora",
    secretTitle: "El secreto de nuestra academia",
  },
  en: {
    badge: "Interactive Arabic Phoneme & Makharij Soundboard",
    title: "Why Generic Apps Fail: The Art of Arabic Phonetics",
    desc: "Click any letter below to hear authentic native articulation and see how our certified tutors teach diaspora children to speak with flawless Arabic eloquence.",
    exampleWord: "Example word: ",
    playBtn: "Play Native Articulation",
    makhrajTitle: "Anatomical Makhraj Point",
    mistakeTitle: "Common Diaspora Stumble",
    secretTitle: "Our Academy Secret",
  },
};

export function InteractivePhonemeSoundboard({
  locale,
  isRtl = false,
}: InteractivePhonemeSoundboardProps) {
  const ui = SOUNDBOARD_UI[locale] || SOUNDBOARD_UI.en;
  const isAr = locale === "ar";
  const [selectedLetter, setSelectedLetter] = useState<string>("ض");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const activePhoneme =
    PHONEMES.find((p) => p.letter === selectedLetter) || PHONEMES[0];

  // Play audio using Web Speech API with Web Audio harmonic tone fallback
  const playSound = (letter: string, word: string, freq: number) => {
    setIsPlaying(true);

    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        // Cancel any pending speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(`${letter}... ${word}`);
        utterance.lang = "ar-SA";
        utterance.rate = 0.85; // Slightly slower for clear child articulation

        // Check if Arabic voices are installed
        const voices = window.speechSynthesis.getVoices();
        const arVoice = voices.find((v) => v.lang.startsWith("ar"));
        if (arVoice) {
          utterance.voice = arVoice;
        }

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback to Web Audio oscillator
        playWebAudioChime(freq);
      }
    } catch {
      playWebAudioChime(freq);
    }
  };

  const playWebAudioChime = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        setIsPlaying(false);
        return;
      }
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);

      setTimeout(() => setIsPlaying(false), 600);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/70 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-2">
              <Volume2 className="w-3.5 h-3.5" />
              <span>{ui.badge}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              {ui.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {ui.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Letter Selector Grid */}
      <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {PHONEMES.map((item) => {
            const isSelected = selectedLetter === item.letter;
            return (
              <button
                key={item.letter}
                onClick={() => {
                  setSelectedLetter(item.letter);
                  playSound(item.letter, item.sampleWordAr, item.synthFrequency);
                }}
                type="button"
                className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105 ring-4 ring-brand-500/20"
                    : "bg-white text-slate-900 border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50"
                }`}
              >
                <span className="text-3xl sm:text-4xl font-black font-serif leading-none mb-1">
                  {item.letter}
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    isSelected ? "text-brand-100" : "text-slate-500"
                  }`}
                >
                  {item.ipa}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Letter Detail View */}
      <div className="p-6 sm:p-10 space-y-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-brand-50 border border-brand-200 flex items-center justify-center shadow-inner shrink-0">
              <span className="text-5xl font-black text-brand-700 font-serif">
                {activePhoneme.letter}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xl sm:text-2xl font-black text-slate-900">
                  {isAr ? activePhoneme.nameAr : activePhoneme.nameEn}
                </h4>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                  {activePhoneme.ipa}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {ui.exampleWord}
                <span className="font-bold text-slate-900 text-sm font-serif">
                  {activePhoneme.sampleWordAr}
                </span>{" "}
                ({activePhoneme.sampleWordTranslit} • {activePhoneme.sampleWordEn})
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              playSound(
                activePhoneme.letter,
                activePhoneme.sampleWordAr,
                activePhoneme.synthFrequency
              )
            }
            type="button"
            className="w-full lg:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl gradient-brand text-white font-bold text-sm shadow-md shadow-brand-500/25 hover:opacity-95 transition-all"
          >
            <Volume2
              className={`w-4 h-4 ${isPlaying ? "animate-bounce text-amber-300" : ""}`}
            />
            <span>{ui.playBtn}</span>
          </button>
        </div>

        {/* 3 Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Makhraj */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-brand-700 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>{ui.makhrajTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {isAr ? activePhoneme.makhrajAr : activePhoneme.makhrajEn}
            </p>
          </div>

          {/* Card 2: Common Diaspora Mistake */}
          <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200/70 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>{ui.mistakeTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              {isAr ? activePhoneme.mistakeAr : activePhoneme.mistakeEn}
            </p>
          </div>

          {/* Card 3: Our Secret Technique */}
          <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/70 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{ui.secretTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
              {isAr ? activePhoneme.tipAr : activePhoneme.tipEn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
