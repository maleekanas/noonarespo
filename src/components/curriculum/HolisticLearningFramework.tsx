"use client";

import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  Cpu,
  Palette,
  Compass,
  Lightbulb,
  CheckCircle2,
  Atom,
  Binary,
  Shapes,
  Music,
  Calculator,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Zap,
} from "lucide-react";

interface HolisticLearningFrameworkProps {
  locale?: string;
  isRtl?: boolean;
}

export function HolisticLearningFramework({
  locale = "ar",
  isRtl = true,
}: HolisticLearningFrameworkProps) {
  const [activeTab, setActiveTab] = useState<"BLOOM" | "BIDE" | "STEAM">("BLOOM");

  const bloomStages = [
    {
      level: 1,
      nameAr: "تذكّر (Remember)",
      nameEn: "Remember",
      descAr: "التعرف البصري والصوتي على الحروف، الحركات، واسترجاع المفردات الأساسية.",
      descEn: "Recognizing letter shapes, phonemes, vowels, and recalling core vocabulary.",
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      accent: "bg-emerald-500",
    },
    {
      level: 2,
      nameAr: "فهم (Understand)",
      nameEn: "Understand",
      descAr: "استيعاب معاني الكلمات والجمل، الربط بين الصوت والصورة، وفهم القصص القصيرة.",
      descEn: "Comprehending sentence meanings, audio-visual association, and short narrative context.",
      color: "bg-teal-50 text-teal-800 border-teal-200",
      accent: "bg-teal-500",
    },
    {
      level: 3,
      nameAr: "تطبيق (Apply)",
      nameEn: "Apply",
      descAr: "توظيف القواعد في المحادثة، تركيب الجمل، ممارسة التجويد، والتعبير الشفهي.",
      descEn: "Using grammar in dialogue, constructing sentences, applying tajweed rules, and oral expression.",
      color: "bg-blue-50 text-blue-800 border-blue-200",
      accent: "bg-blue-500",
    },
    {
      level: 4,
      nameAr: "تحليل (Analyze)",
      nameEn: "Analyze",
      descAr: "تفكيك تراكيب الجمل، استخراج جذور الكلمات (علم الصرف)، والتمييز بين أوزان الشعر.",
      descEn: "Dissecting syntax, extracting morphological root patterns, and distinguishing poetic meters.",
      color: "bg-indigo-50 text-indigo-800 border-indigo-200",
      accent: "bg-indigo-500",
    },
    {
      level: 5,
      nameAr: "تقييم (Evaluate)",
      nameEn: "Evaluate",
      descAr: "التقييم الذاتي لمخارج الحروف، مراجعة نصوص الزملاء، والنقد البناء للمناظرات.",
      descEn: "Self-correcting pronunciation, peer review of written essays, and constructive debate critique.",
      color: "bg-purple-50 text-purple-800 border-purple-200",
      accent: "bg-purple-500",
    },
    {
      level: 6,
      nameAr: "ابتكار (Create)",
      nameEn: "Create",
      descAr: "تأليف قصص أصلية، إلقاء خطب بليغة، وتصميم لوحات خطية ديوانية فنية.",
      descEn: "Composing original stories, delivering persuasive speeches, and authoring artistic calligraphy.",
      color: "bg-rose-50 text-rose-800 border-rose-200",
      accent: "bg-rose-500",
    },
  ];

  const bideDimensions = [
    {
      id: "BROAD",
      titleAr: "شامل (Broad)",
      titleEn: "Broad Coverage",
      descAr: "تغطية شاملة لـ 7 مسارات لغوية، أدبية، وتراثية، تربط الطفل بالثقافة العربية المتنوعة وعالمية الحضارة.",
      descEn: "Comprehensive coverage across 7 academic tracks, connecting children with rich pan-Arab heritage and global diaspora.",
      icon: Compass,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      id: "INSPIRING",
      titleAr: "ملهم (Inspiring)",
      titleEn: "Inspiring Narratives",
      descAr: "قصص تاريخية لأعلام الحضارة (ابن بطوطة، الخوارزمي)، تحفيز بالألعاب، وأوسمة تغرس الاعتزاز بالهوية.",
      descEn: "Historic narratives of iconic scholars, gamified learning quests, and identity badges that ignite pride.",
      icon: Lightbulb,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      id: "DEEP",
      titleAr: "عميق (Deep)",
      titleEn: "Deep Mastery",
      descAr: "تأصيل لغوي متين لقواعد النحو، الصرف، البلاغة، أحكام التجويد، وهندسة خطي النسخ والرقعة.",
      descEn: "Rigorous scientific foundation in Nahw, Sarf, Balaghah, Tajweed acoustics, and classical penmanship.",
      icon: BrainCircuit,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      id: "EFFICIENT",
      titleAr: "فعّال (Efficient)",
      titleEn: "Efficient Retention",
      descAr: "تكرار متباعد (SRS)، جلسات فردية مركزة (15 دقيقة)، وتفاعل فوري ذكي يحقق أعلى نتائج بأقصر وقت.",
      descEn: "Spaced repetition (SRS), 15-minute focused 1-on-1 sessions, and instant AI feedback maximizing outcome per minute.",
      icon: Zap,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
  ];

  const steamDomains = [
    {
      id: "SCIENCE",
      nameAr: "العلوم (Science)",
      nameEn: "Science",
      icon: Atom,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      exampleAr: "الظواهر الفلكية، علوم النبات، والطب التراثي (ابن سينا) المذكورة في القرآن ونصوص القراءة.",
      exampleEn: "Astronomical phenomena, botany, and classical medicine (Avicenna) woven into reading passages.",
    },
    {
      id: "TECHNOLOGY",
      nameAr: "التكنولوجيا (Technology)",
      nameEn: "Technology",
      icon: Binary,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      exampleAr: "اللوح التفاعلي السحابي، تحليل النطق بالذكاء الاصطناعي، ومقاربة جذور الكلمات بالخوارزميات البرمجية.",
      exampleEn: "Cloud interactive whiteboard, AI pronunciation analyzer, and treating word roots as algorithmic structures.",
    },
    {
      id: "ENGINEERING",
      nameAr: "الهندسة (Engineering)",
      nameEn: "Engineering",
      icon: Shapes,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      exampleAr: "هندسة الخط العربي والنسبة الفاضلة لحروف النسخ والرقعة، وتراكيب الجمل اللغوية المتزنة.",
      exampleEn: "Geometric proportions in Arabic calligraphy (Naskh & Ruq'ah) and architectural sentence syntax.",
    },
    {
      id: "ARTS",
      nameAr: "الفنون (Arts)",
      nameEn: "Arts",
      icon: Music,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      exampleAr: "فنون الخط العربي التشكيلية، المقامات الصوتية للتجويد، وعلم العروض والإيقاع الشعري الموسيقي.",
      exampleEn: "Arabic calligraphy aesthetics, vocal tajweed maqamat, and poetic rhythm and meters (Arood).",
    },
    {
      id: "MATHS",
      nameAr: "الرياضيات (Maths)",
      nameEn: "Maths",
      icon: Calculator,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      exampleAr: "الأرقام العربية، حساب الجمل، الزخارف الهندسية الإسلامية (Tessellations)، والتقويم الفلكي.",
      exampleEn: "Arabic numerals, Al-Khwarizmi algebra, Islamic geometric tessellations, and lunar calendar calculations.",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? "النموذج التربوي المتكامل" : "Comprehensive Educational Framework"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {isRtl ? "تعلم شمولي مخصص لكل طفل" : "Holistic learning personalised for each child"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {isRtl
              ? "نجمع بين هرم بلوم المعرفي (Bloom's Taxonomy)، نموذج BIDE التربوي المبتكر، ومنهجية STEAM لربط اللغة العربية بالتكنولوجيا والعلوم المعاصرة."
              : "Combining Bloom's Taxonomy, the innovative BIDE pedagogical model, and STEAM methodology to connect Arabic with modern technology and inquiry."}
          </p>
        </div>

        {/* Central Triangle Diagram & Pillars Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left / Visual Column: The Triangle Diagram (Matches uploaded image) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Outer Triangular Outline */}
              <svg viewBox="0 0 300 260" className="w-full h-full drop-shadow-md">
                {/* Left Side: Bloom (Green) */}
                <path
                  d="M 150,20 L 30,220"
                  stroke="#10b981"
                  strokeWidth="24"
                  strokeLinecap="round"
                  className={`cursor-pointer transition-all duration-300 ${activeTab === "BLOOM" ? "opacity-100 stroke-emerald-600" : "opacity-60 hover:opacity-90"}`}
                  onClick={() => setActiveTab("BLOOM")}
                />
                {/* Right Side: BIDE (Gold/Amber) */}
                <path
                  d="M 150,20 L 270,220"
                  stroke="#f59e0b"
                  strokeWidth="24"
                  strokeLinecap="round"
                  className={`cursor-pointer transition-all duration-300 ${activeTab === "BIDE" ? "opacity-100 stroke-amber-600" : "opacity-60 hover:opacity-90"}`}
                  onClick={() => setActiveTab("BIDE")}
                />
                {/* Bottom Side: STEAM (Blue) */}
                <path
                  d="M 40,230 L 260,230"
                  stroke="#3b82f6"
                  strokeWidth="24"
                  strokeLinecap="round"
                  className={`cursor-pointer transition-all duration-300 ${activeTab === "STEAM" ? "opacity-100 stroke-blue-600" : "opacity-60 hover:opacity-90"}`}
                  onClick={() => setActiveTab("STEAM")}
                />

                {/* Central Labels */}
                <text
                  x="80"
                  y="110"
                  transform="rotate(-58 80,110)"
                  fill="#059669"
                  fontWeight="bold"
                  fontSize="14"
                  className="cursor-pointer select-none"
                  onClick={() => setActiveTab("BLOOM")}
                >
                  BLOOM
                </text>
                <text
                  x="210"
                  y="120"
                  transform="rotate(58 210,120)"
                  fill="#d97706"
                  fontWeight="bold"
                  fontSize="14"
                  className="cursor-pointer select-none"
                  onClick={() => setActiveTab("BIDE")}
                >
                  BIDE
                </text>
                <text
                  x="120"
                  y="250"
                  fill="#2563eb"
                  fontWeight="bold"
                  fontSize="14"
                  className="cursor-pointer select-none"
                  onClick={() => setActiveTab("STEAM")}
                >
                  STEAM
                </text>
              </svg>
            </div>

            {/* Pillar Selector Buttons */}
            <div className="grid grid-cols-3 gap-2 w-full mt-6">
              <button
                type="button"
                onClick={() => setActiveTab("BLOOM")}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                  activeTab === "BLOOM"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>هرم بلوم</span>
                <span className="text-[10px] font-normal opacity-90">Bloom's Taxonomy</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("BIDE")}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                  activeTab === "BIDE"
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>نموذج BIDE</span>
                <span className="text-[10px] font-normal opacity-90">Broad • Deep</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("STEAM")}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                  activeTab === "STEAM"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>منهجية STEAM</span>
                <span className="text-[10px] font-normal opacity-90">Science & Tech</span>
              </button>
            </div>
          </div>

          {/* Right / Detail Column: Tab Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. BLOOM TAB */}
            {activeTab === "BLOOM" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-emerald-950 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span>{isRtl ? "هرم بلوم المعرفي (Bloom's Taxonomy)" : "Bloom's Taxonomy for K-12"}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {isRtl
                        ? "معيار عالمي لمراحل التعلم الست: تذكّر، فهم، تطبيق، تحليل، تقييم، وابتكار"
                        : "Global K-12 standard spanning 6 cognitive stages: Remember, Understand, Apply, Analyze, Evaluate & Create"}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    6 مراحل معرفية
                  </span>
                </div>

                <div className="space-y-2.5">
                  {bloomStages.map((stage) => (
                    <div
                      key={stage.level}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${stage.color}`}
                    >
                      <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-black shrink-0 ${stage.accent}`}>
                        {stage.level}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs sm:text-sm">
                          {isRtl ? stage.nameAr : stage.nameEn}
                        </div>
                        <p className="text-xs opacity-90 leading-relaxed">
                          {isRtl ? stage.descAr : stage.descEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. BIDE TAB */}
            {activeTab === "BIDE" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-amber-100 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-amber-950 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-amber-600" />
                      <span>{isRtl ? "نموذج BIDE التربوي المبتكر" : "The BIDE Educational Model"}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {isRtl
                        ? "صُمم خصيصاً ليناسب القدرات والاهتمامات الفريدة لكل طفل: شامل، ملهم، عميق، وفعّال"
                        : "Developed in-house to cater to each child's unique abilities: Broad, Inspiring, Deep & Efficient"}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    4 أبعاد تربوية
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bideDimensions.map((dim) => {
                    const IconComp = dim.icon;
                    return (
                      <div
                        key={dim.id}
                        className={`p-5 rounded-2xl border space-y-2.5 transition-all hover:shadow-sm ${dim.color}`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComp className="w-5 h-5" />
                          <h4 className="font-extrabold text-sm">{isRtl ? dim.titleAr : dim.titleEn}</h4>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {isRtl ? dim.descAr : dim.descEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. STEAM TAB */}
            {activeTab === "STEAM" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-blue-100 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-blue-950 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      <span>{isRtl ? "منهجية STEAM التفاعلية المعاصرة" : "STEAM Learning Methodology"}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {isRtl
                        ? "ربط تعلم اللغة العربية اليومي بالعلوم، التكنولوجيا، الهندسة، الفنون، والرياضيات"
                        : "Connecting daily Arabic learning with Science, Technology, Engineering, Arts & Maths"}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                    5 مجالات تكاملية
                  </span>
                </div>

                <div className="space-y-3">
                  {steamDomains.map((domain) => {
                    const IconComp = domain.icon;
                    return (
                      <div
                        key={domain.id}
                        className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-colors ${domain.color}`}
                      >
                        <div className="p-2 rounded-xl bg-white/80 shrink-0 mt-0.5">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-xs sm:text-sm">
                            {isRtl ? domain.nameAr : domain.nameEn}
                          </div>
                          <p className="text-xs opacity-90 leading-relaxed">
                            {isRtl ? domain.exampleAr : domain.exampleEn}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
