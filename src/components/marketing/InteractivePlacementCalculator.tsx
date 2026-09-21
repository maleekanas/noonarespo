"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  BookOpen,
  RotateCcw,
  Compass,
  Star,
} from "lucide-react";

interface InteractivePlacementCalculatorProps {
  locale: string;
  isRtl?: boolean;
}

interface AssessmentResult {
  cefrLevel: string;
  cohortTitle: string;
  cohortTitleAr: string;
  targetFocus: string;
  targetFocusAr: string;
  milestones: {
    phase1: { title: string; titleAr: string; desc: string; descAr: string };
    phase2: { title: string; titleAr: string; desc: string; descAr: string };
    phase3: { title: string; titleAr: string; desc: string; descAr: string };
  };
  recommendedPlanId: string;
  recommendedPlanName: string;
  weeklyCommitment: string;
  weeklyCommitmentAr: string;
}

export function InteractivePlacementCalculator({
  locale,
  isRtl = false,
}: InteractivePlacementCalculatorProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [ageGroup, setAgeGroup] = useState<string>("7-10");
  const [currentLevel, setCurrentLevel] = useState<string>("beginner");
  const [learningGoal, setLearningGoal] = useState<string>("quran");

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Age group definitions
  const ageOptions = [
    {
      id: "4-6",
      labelEn: "Ages 4 - 6",
      labelAr: "الأعمار 4 - 6 سنوات",
      subEn: "Early Sprouts • Sensory & Phonics",
      subAr: "براعم العربية • وعي صوتي وتأسيس مبكر",
      icon: "🌱",
    },
    {
      id: "7-10",
      labelEn: "Ages 7 - 10",
      labelAr: "الأعمار 7 - 10 سنوات",
      subEn: "Junior Explorers • Literacy & Fluency",
      subAr: "المستكشف الصغير • قراءة وطلاقة",
      icon: "🚀",
    },
    {
      id: "11-13",
      labelEn: "Ages 11 - 13",
      labelAr: "الأعمار 11 - 13 سنة",
      subEn: "Fluent Pioneers • Grammar & Tajweed",
      subAr: "رواد الفصاحة • نحو وتجويد",
      icon: "🧭",
    },
    {
      id: "14-17",
      labelEn: "Ages 14 - 17",
      labelAr: "الأعمار 14 - 17 سنة",
      subEn: "Young Scholars • Advanced Rhetoric",
      subAr: "علماء المستقبل • بلاغة وإتقان",
      icon: "🎓",
    },
  ];

  // Current Arabic proficiency options
  const proficiencyOptions = [
    {
      id: "beginner",
      labelEn: "Absolute Beginner",
      labelAr: "مبتدئ تماماً",
      subEn: "Never learned Arabic letters; starting completely from scratch.",
      subAr: "لم يتعلم الحروف بعد، يبدأ من الصفر تماماً.",
      icon: "✏️",
    },
    {
      id: "knows-letters",
      labelEn: "Recognizes Letters",
      labelAr: "يعرف الحروف",
      subEn: "Can identify some alphabet letters, but struggles to join them into words.",
      subAr: "يميز بعض أشكال الحروف لكنه يجد صعوبة في وصلها وقراءة الكلمات.",
      icon: "🧩",
    },
    {
      id: "early-reader",
      labelEn: "Early Reader (Harakat)",
      labelAr: "قارئ مبتدئ بالحركات",
      subEn: "Can slowly sound out short words with Fatha, Kasra, and Damma.",
      subAr: "يستطيع تهجئة الكلمات القصيرة تدريجياً بالحركات (الفتحة، الكسرة، الضمة).",
      icon: "📖",
    },
    {
      id: "heritage-speaker",
      labelEn: "Heritage / Home Speaker",
      labelAr: "يتحدث في المنزل ولا يقرأ",
      subEn: "Understands or speaks conversational Arabic at home, but cannot read or write.",
      subAr: "يفهم ويتحدث العربية مع العائلة لكنه لا يستطيع القراءة أو الكتابة الأكاديمية.",
      icon: "🗣️",
    },
    {
      id: "advanced-quran",
      labelEn: "Quran Reader / Intermediate",
      labelAr: "يقرأ القرآن / متوسط",
      subEn: "Can read Quranic text; seeks Tajweed precision and language comprehension.",
      subAr: "يقرأ نصوص المصحف الشريف ويسعى لإتقان أحكام التجويد ومخارج الحروف وفهم المعاني.",
      icon: "🌟",
    },
  ];

  // Learning goal options
  const goalOptions = [
    {
      id: "quran",
      labelEn: "Quran Recitation & Tajweed",
      labelAr: "تلاوة القرآن الكريم والتجويد",
      subEn: "Master makharij, smooth recitation, and memorize sacred Surahs.",
      subAr: "إتقان مخارج الحروف، التلاوة السليمة، وحفظ السور الكريمة بإتقان.",
      icon: "🕌",
    },
    {
      id: "speaking",
      labelEn: "Spoken Arabic & Daily Conversation",
      labelAr: "المحادثة والطلاقة الشفوية",
      subEn: "Build confidence to speak fluent Arabic with family and peers.",
      subAr: "بناء الثقة للتحدث بطلاقة مع الأهل والأصدقاء في الحياة اليومية.",
      icon: "💬",
    },
    {
      id: "academic",
      labelEn: "Full Academic Literacy (Read & Write)",
      labelAr: "القراءة والكتابة والنحو الأكاديمي",
      subEn: "Structured CEFR mastery covering reading, spelling, and grammar rules.",
      subAr: "منهج أكاديمي متكامل يغطي القراءة، الإملاء، والقواعد النحوية والصرفية.",
      icon: "📚",
    },
    {
      id: "heritage",
      labelEn: "Islamic Identity & Cultural Connection",
      labelAr: "تعزيز الهوية الإسلامية والارتباط باللغة",
      subEn: "Connect with prophetic stories, Islamic values, and cultural heritage.",
      subAr: "الارتباط بالقصص النبوية، القيم والأخلاق الإسلامية، والهوية الثقافية.",
      icon: "✨",
    },
  ];

  // Compute recommendation based on selections
  const computeResult = (): AssessmentResult => {
    let cefrLevel = "A1";
    let cohortTitle = "Junior Explorers Micro-Cohort";
    let cohortTitleAr = "مجموعة المستكشف الصغير المصغرة";
    let targetFocus = "Phonemic awareness, sound blending & core vocabulary";
    let targetFocusAr = "الوعي الصوتي، تركيب الحروف والمفردات الأساسية";

    if (ageGroup === "4-6" || currentLevel === "beginner") {
      cefrLevel = "Pre-A1";
      cohortTitle = "Early Sprouts Foundation Cohort";
      cohortTitleAr = "مجموعة براعم التأسيس المبكر";
      targetFocus = "Alphabet phonics, stroke tracing, and auditory discrimination";
      targetFocusAr = "صوتيات الحروف، رسم المسارات، والتمييز السمعي للأصوات";
    } else if (currentLevel === "knows-letters" || currentLevel === "heritage-speaker") {
      cefrLevel = "A1";
      cohortTitle = "Junior Explorers Word-Builder Cohort";
      cohortTitleAr = "مجموعة بناة الكلمات للمستكشف الصغير";
      targetFocus = "Letter-joining rules, 3-letter root synthesis & active conversation";
      targetFocusAr = "قواعد اتصال الحروف، دمج الجذور الثلاثية والمحادثة النشطة";
    } else if (currentLevel === "early-reader") {
      cefrLevel = "A2";
      cohortTitle = "Fluent Pioneers Reading & Tajweed Cohort";
      cohortTitleAr = "مجموعة رواد الفصاحة للقراءة والتجويد";
      targetFocus = "Sentence fluency, Tanween, Madd rules, and interactive stories";
      targetFocusAr = "طلاقة الجمل، التنوين والمدود، والقصص التفاعلية المصورة";
    } else {
      cefrLevel = "B1";
      cohortTitle = "Young Scholars Advanced Tajweed & Rhetoric Cohort";
      cohortTitleAr = "مجموعة علماء المستقبل للإتقان والبلاغة";
      targetFocus = "Quranic Tajweed Ijazah prep, classical grammar & expressive dialogue";
      targetFocusAr = "تأهيل إجازة التجويد، النحو الكلاسيكي، والحوارات البلاغية المعبرة";
    }

    return {
      cefrLevel,
      cohortTitle,
      cohortTitleAr,
      targetFocus,
      targetFocusAr,
      milestones: {
        phase1: {
          title: "Weeks 1 - 4: Core Recognition & Makharij",
          titleAr: "الأسابيع 1 - 4: التمييز الصوتي ومخارج الحروف",
          desc: "Targeted pronunciation drills and interactive tracing with our native specialist.",
          descAr: "تدريبات نطق مركزة وتحليل مخارج الحروف مع المعلم المتخصص.",
        },
        phase2: {
          title: "Weeks 5 - 8: Word Joining & Harakat Fluency",
          titleAr: "الأسابيع 5 - 8: وصل الحركات وتركيب الكلمات",
          desc: "Mastering Fatha, Kasra, Damma, and combining 3-letter roots with Phonics Arcade.",
          descAr: "إتقان الحركات والمدود ودمج الكلمات عبر استوديو ألعاب الحروف.",
        },
        phase3: {
          title: "Weeks 9 - 12: Independent Reading & Conversation",
          titleAr: "الأسابيع 9 - 12: القراءة المستقلة والمحادثة",
          desc: "Reading complete Quranic Ayahs and speaking in authentic everyday scenarios.",
          descAr: "تلاوة آيات قرآنية كاملة والتحدث في مواقف حوارية واقعية بثقة تامة.",
        },
      },
      recommendedPlanId: "plan-individual",
      recommendedPlanName: "Individual Student Plan",
      weeklyCommitment: "2 Live Micro-Cohort Classes (45 min) + 15 min Gamified Practice",
      weeklyCommitmentAr: "حصتان مباشرتان أسبوعياً (45 دقيقة) + 15 دقيقة تدريب تفاعلي",
    };
  };

  const result = computeResult();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/70 overflow-hidden">
      {/* Top Banner / Progress Indicator */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>{isRtl ? "أداة تحديد المستوى الذكية المجانية" : "Free 60-Second Placement Diagnostic"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isRtl
                ? "اكتشف المسار التعليمي والمجموعة المثالية لطفلك"
                : "Find the Perfect Level & Micro-Cohort for Your Child"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {isRtl
                ? "أجب عن 3 أسئلة سريعة لنحدد لك المستوى الأوروبي المعياري (CEFR) والجدول الأسبوعي المناسب."
                : "Answer 3 quick questions to calculate your child's CEFR level, recommended cohort, and 12-week milestone roadmap."}
            </p>
          </div>

          {/* Step Badges */}
          <div className="flex items-center gap-2 shrink-0">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-brand-500 text-white ring-4 ring-brand-500/20"
                    : step > s
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6 sm:p-10">
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {isRtl ? "الخطوة 1 من 3: الفئة العمرية" : "Step 1 of 3: Age Bracket"}
              </span>
              <h4 className="text-xl font-bold text-slate-900">
                {isRtl ? "كم عمر طفلك؟" : "How old is your child?"}
              </h4>
              <p className="text-xs text-slate-500">
                {isRtl
                  ? "نقوم بتوزيع الطلاب في مجموعات متقاربة عمرياً لضمان أفضل تفاعل اجتماعي وأكاديمي."
                  : "We place children in age-aligned cohorts to ensure peer engagement and optimal pedagogical pacing."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ageOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAgeGroup(opt.id)}
                  type="button"
                  className={`p-5 rounded-2xl border text-start transition-all flex items-start gap-4 ${
                    ageGroup === opt.id
                      ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">
                    {opt.icon}
                  </span>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 text-sm">
                      {isRtl ? opt.labelAr : opt.labelEn}
                    </h5>
                    <p className="text-xs text-slate-500">
                      {isRtl ? opt.subAr : opt.subEn}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>{isRtl ? "التالي: المستوى الحالي" : "Next: Current Arabic Level"}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {isRtl ? "الخطوة 2 من 3: الإلمام باللغة" : "Step 2 of 3: Current Arabic Familiarity"}
              </span>
              <h4 className="text-xl font-bold text-slate-900">
                {isRtl ? "ما هو مستوى طفلك الحالي في اللغة العربية؟" : "What is your child's current Arabic knowledge?"}
              </h4>
              <p className="text-xs text-slate-500">
                {isRtl
                  ? "لا تقلق إذا كان طفلك مبتدئاً تماماً، فمعظم طلابنا يبدأون من الصفر."
                  : "Don't worry if your child has zero prior experience—most of our diaspora learners start from scratch."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {proficiencyOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCurrentLevel(opt.id)}
                  type="button"
                  className={`p-5 rounded-2xl border text-start transition-all flex items-start gap-4 ${
                    currentLevel === opt.id
                      ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">
                    {opt.icon}
                  </span>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 text-sm">
                      {isRtl ? opt.labelAr : opt.labelEn}
                    </h5>
                    <p className="text-xs text-slate-500">
                      {isRtl ? opt.subAr : opt.subEn}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(1)}
                type="button"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {isRtl ? "← العودة للخطوة السابقة" : "← Back to Age Selection"}
              </button>
              <button
                onClick={() => setStep(3)}
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>{isRtl ? "التالي: الهدف الأساسي" : "Next: Primary Learning Goal"}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {isRtl ? "الخطوة 3 من 3: الهدف الأساسي" : "Step 3 of 3: Primary Goal"}
              </span>
              <h4 className="text-xl font-bold text-slate-900">
                {isRtl ? "ما هو هدفك الأهم لطفلك في هذا العام؟" : "What is your main goal for your child this year?"}
              </h4>
              <p className="text-xs text-slate-500">
                {isRtl
                  ? "سنخصص خطة المنهج والأنشطة التفاعلية بناءً على هذا الهدف."
                  : "We tailor lesson themes, interactive studios, and homework games to this goal."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goalOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLearningGoal(opt.id)}
                  type="button"
                  className={`p-5 rounded-2xl border text-start transition-all flex items-start gap-4 ${
                    learningGoal === opt.id
                      ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-white shadow-xs border border-slate-100">
                    {opt.icon}
                  </span>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 text-sm">
                      {isRtl ? opt.labelAr : opt.labelEn}
                    </h5>
                    <p className="text-xs text-slate-500">
                      {isRtl ? opt.subAr : opt.subEn}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                type="button"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {isRtl ? "← العودة للمستوى" : "← Back to Proficiency"}
              </button>
              <button
                onClick={() => setStep(4)}
                type="button"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-md shadow-brand-500/25 hover:opacity-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isRtl ? "عرض النتيجة والمسار الموصى به" : "Generate Personalized Plan"}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results & Tailored Roadmap */}
        {step === 4 && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Badge & Level */}
            <div className="bg-gradient-to-r from-brand-50 via-purple-50 to-indigo-50 border border-brand-200/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-brand-600 text-white font-black text-xs uppercase tracking-wider">
                    {result.cefrLevel} Track
                  </span>
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    {isRtl ? "مجموعة مصغرة (بحد أقصى 6 طلاب)" : "Micro-Cohort (Max 6 Students)"}
                  </span>
                </div>
                <h4 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {isRtl ? result.cohortTitleAr : result.cohortTitle}
                </h4>
                <p className="text-sm text-slate-600 max-w-xl">
                  {isRtl ? result.targetFocusAr : result.targetFocus}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0 flex flex-col gap-2 min-w-[220px]">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isRtl ? "الالتزام الأسبوعي المقترح" : "Recommended Commitment"}
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {isRtl ? result.weeklyCommitmentAr : result.weeklyCommitment}
                </p>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold pt-1 border-t border-slate-100">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{isRtl ? "معلم ناطق أصلي معتمد" : "Certified Native Arabic Mentor"}</span>
                </div>
              </div>
            </div>

            {/* 12-Week Roadmap */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Compass className="w-5 h-5 text-brand-600" />
                  <span>{isRtl ? "خارطة الطريق المخصصة (12 أسبوعاً)" : "Your Child's 12-Week Milestone Roadmap"}</span>
                </h5>
                <span className="text-xs text-slate-500">
                  {isRtl ? "معايير CEFR المعتمدة" : "CEFR Benchmark Aligned"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 relative">
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center mb-3">
                    1
                  </div>
                  <h6 className="font-bold text-slate-900 text-sm mb-1">
                    {isRtl ? result.milestones.phase1.titleAr : result.milestones.phase1.title}
                  </h6>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isRtl ? result.milestones.phase1.descAr : result.milestones.phase1.desc}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 relative">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center mb-3">
                    2
                  </div>
                  <h6 className="font-bold text-slate-900 text-sm mb-1">
                    {isRtl ? result.milestones.phase2.titleAr : result.milestones.phase2.title}
                  </h6>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isRtl ? result.milestones.phase2.descAr : result.milestones.phase2.desc}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
                    3
                  </div>
                  <h6 className="font-bold text-slate-900 text-sm mb-1">
                    {isRtl ? result.milestones.phase3.titleAr : result.milestones.phase3.title}
                  </h6>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isRtl ? result.milestones.phase3.descAr : result.milestones.phase3.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <button
                onClick={() => setStep(1)}
                type="button"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isRtl ? "إعادة التقييم مرة أخرى" : "Retake Assessment"}</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href={`/${locale}/contact?inquiry=placement&age=${ageGroup}&level=${currentLevel}`}
                  className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all text-center"
                >
                  {isRtl ? "تحدث مع مستشار أكاديمي" : "Speak with Academic Advisor"}
                </Link>
                <Link
                  href={`/${locale}/register?plan=${result.recommendedPlanId}&age=${ageGroup}&level=${result.cefrLevel}&trial=1`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white text-xs font-bold shadow-md shadow-brand-500/25 hover:opacity-95 transition-all text-center flex-1 sm:flex-initial"
                >
                  <span>{isRtl ? "احجز التجربة المجانية لهذا المسار" : "Claim 1-Day Free Trial for This Track"}</span>
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
