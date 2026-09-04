import React from "react";
import Link from "next/link";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { administrationService } from "@/server/services/AdministrationService";
import { getDirection } from "@/lib/localization";
import {
  BookOpen,
  Volume2,
  PenTool,
  MessageCircle,
  Headphones,
  Moon,
  HeartHandshake,
  CheckCircle2,
  Target,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  Award,
  Layers,
  Bot,
  Gamepad2,
  Mic,
} from "lucide-react";

export default async function ProgramsCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ program?: string }>;
}) {
  const { locale } = await params;
  const { program: programParam } = await searchParams;
  const isAr = locale === "ar";
  const isRtl = getDirection(locale) === "rtl";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const ForwardArrow = isRtl ? ArrowLeft : ArrowRight;

  const allPrograms = await academicRepository.getAllPrograms();
  const selectedProgramId =
    programParam && allPrograms.some((p) => p.id === programParam)
      ? programParam
      : allPrograms[0]?.id || "prog-foundations";

  const currentProgram =
    allPrograms.find((p) => p.id === selectedProgramId) || allPrograms[0];

  // Fetch courses, levels, and curriculum modules for the selected program
  const courses = await academicRepository.getCoursesByProgramId(selectedProgramId);
  const modules = await administrationService.getCurriculumModules(selectedProgramId);

  // Collect levels across courses
  const levels = [];
  for (const course of courses) {
    const courseLevels = await academicRepository.getLevelsByCourseId(course.id);
    levels.push(...courseLevels);
  }
  const levelIds = new Set(levels.map((l) => l.id));

  // Get active class groups matching these levels
  const allClasses = await academicRepository.getAllClassGroups();
  const programClasses = allClasses.filter((cg) => levelIds.has(cg.courseLevelId));

  // Program-specific metadata & studio tool integrations
  const programMeta: Record<
    string,
    {
      icon: React.ComponentType<{ className?: string }>;
      badgeColor: string;
      bgLight: string;
      gradient: string;
      cefrSpan: string;
      targetAges: string;
      studios: { title: string; desc: string; icon: React.ComponentType<{ className?: string }>; href: string }[];
    }
  > = {
    "prog-foundations": {
      icon: BookOpen,
      badgeColor: "text-blue-600 bg-blue-50 border-blue-200",
      bgLight: "bg-blue-50 text-blue-600",
      gradient: "from-blue-600 to-indigo-700",
      cefrSpan: "CEFR Pre-A1 → A1",
      targetAges: isAr ? "4 - 8 سنوات" : "Ages 4 - 8",
      studios: [
        {
          title: isAr ? "صالة الحروف التفاعلية" : "Phonics Arcade",
          desc: isAr ? "28 حرفاً مع الحركات وألعاب التركيب السريعة" : "28 Arabic letters with Harakat and arcade puzzles",
          icon: Gamepad2,
          href: `/${locale}/student/activities`,
        },
        {
          title: isAr ? "استوديو التكرار المتباعد" : "Vocabulary SRS",
          desc: isAr ? "بطاقات ذكية لحفظ الحروف والمفردات الأولى" : "Smart Leitner cards for alphabet and first words",
          icon: Layers,
          href: `/${locale}/student/flashcards`,
        },
      ],
    },
    "prog-reading": {
      icon: Volume2,
      badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      bgLight: "bg-emerald-50 text-emerald-600",
      gradient: "from-emerald-600 to-teal-700",
      cefrSpan: "CEFR A1 → B1",
      targetAges: isAr ? "7 - 12 سنة" : "Ages 7 - 12",
      studios: [
        {
          title: isAr ? "خريطة المغامرة القرائية" : "Visual Quest Map",
          desc: isAr ? "10 محطات قرائية عبر 5 بيئات جغرافية مشوقة" : "10 reading nodes across 5 interactive biomes",
          icon: Award,
          href: `/${locale}/student/roadmap`,
        },
        {
          title: isAr ? "المكتبة الرقمية المصورة" : "Illustrated Stories",
          desc: isAr ? "قصص مشكولة مع قراءة صوتية نموذجية واختبارات فهم" : "Vocalized storybooks with native audio and quizzes",
          icon: BookOpen,
          href: `/${locale}/student/stories`,
        },
      ],
    },
    "prog-writing": {
      icon: PenTool,
      badgeColor: "text-purple-600 bg-purple-50 border-purple-200",
      bgLight: "bg-purple-50 text-purple-600",
      gradient: "from-purple-600 to-violet-700",
      cefrSpan: "CEFR A1 → B1",
      targetAges: isAr ? "7 - 14 سنة" : "Ages 7 - 14",
      studios: [
        {
          title: isAr ? "سبورة خط النسخ المسطرة" : "Ruled Naskh Whiteboard",
          desc: isAr ? "كانفاس مسطر لضبط حركة القلم والاتصال السليم" : "Ruled calligraphy canvas for stroke mechanics",
          icon: PenTool,
          href: `/${locale}/student/activities`,
        },
        {
          title: isAr ? "كراسات الخط والطباعة A4" : "Printables Hub",
          desc: isAr ? "أوراق عمل قابلة للطباعة مع باركود التحقق الذكي" : "Printable A4 worksheets with QR verification",
          icon: Layers,
          href: `/${locale}/student/activities`,
        },
      ],
    },
    "prog-speaking": {
      icon: MessageCircle,
      badgeColor: "text-amber-600 bg-amber-50 border-amber-200",
      bgLight: "bg-amber-50 text-amber-600",
      gradient: "from-amber-600 to-orange-700",
      cefrSpan: "CEFR A1 → B2",
      targetAges: isAr ? "6 - 15 سنة" : "Ages 6 - 15",
      studios: [
        {
          title: isAr ? "المرشد الحواري فصيح" : "Faseeh AI Tutor",
          desc: isAr ? "محادثة شفوية تفاعلية تحاكي الواقع باللغة الفصحى" : "Interactive spoken dialogues with CEFR AI tutor",
          icon: Bot,
          href: `/${locale}/student/ai-tutor`,
        },
        {
          title: isAr ? "استوديو مخارج الحروف والنطق" : "Voice Waveform Studio",
          desc: isAr ? "مطابقة نبرة الصوت والموجات الصوتية ومخارج الحروف" : "Waveform pitch-matching and acoustic feedback",
          icon: Mic,
          href: `/${locale}/student/pronunciation`,
        },
      ],
    },
    "prog-listening": {
      icon: Headphones,
      badgeColor: "text-pink-600 bg-pink-50 border-pink-200",
      bgLight: "bg-pink-50 text-pink-600",
      gradient: "from-pink-600 to-rose-700",
      cefrSpan: "CEFR Pre-A1 → A2",
      targetAges: isAr ? "4 - 11 سنة" : "Ages 4 - 11",
      studios: [
        {
          title: isAr ? "مختبر التمييز السمعي" : "Auditory Minimal Pairs",
          desc: isAr ? "التفريق الدقيق بين الحروف المتقاربة صوتاً (س/ص، ت/ط)" : "Acoustic discrimination of emphatic vs light phonemes",
          icon: Headphones,
          href: `/${locale}/student/pronunciation`,
        },
        {
          title: isAr ? "الحكايات الصوتية التفاعلية" : "Audio Narratives",
          desc: isAr ? "استماع لقصص مسجلة بصوت نقي وتتبع الحبكة" : "Crystal clear audio stories with plot comprehension",
          icon: Volume2,
          href: `/${locale}/student/stories`,
        },
      ],
    },
    "prog-quran": {
      icon: Moon,
      badgeColor: "text-cyan-600 bg-cyan-50 border-cyan-200",
      bgLight: "bg-cyan-50 text-cyan-600",
      gradient: "from-cyan-600 to-blue-700",
      cefrSpan: "Tajweed Levels 1 → 3",
      targetAges: isAr ? "5 - 16 سنة" : "Ages 5 - 16",
      studios: [
        {
          title: isAr ? "استوديو المصحف الملون" : "Color-Coded Tajweed Studio",
          desc: isAr ? "خط عثماني مع تلوين أحكام التجويد ومسجل التلاوة" : "Uthmani Mushaf with colored Tajweed rules & audio recorder",
          icon: Moon,
          href: `/${locale}/student/quran-studio`,
        },
        {
          title: isAr ? "حلقات التثبيت والمراجعة" : "Hifz Retention System",
          desc: isAr ? "متابعة دقيقة لحفظ جزء عم مع إتقان المخارج والوقف" : "Juz Amma retention tracking with certified Qira'at",
          icon: Award,
          href: `/${locale}/student/quran-studio`,
        },
      ],
    },
    "prog-islamic": {
      icon: HeartHandshake,
      badgeColor: "text-teal-600 bg-teal-50 border-teal-200",
      bgLight: "bg-teal-50 text-teal-600",
      gradient: "from-teal-600 to-emerald-700",
      cefrSpan: "Values Foundation → Level 3",
      targetAges: isAr ? "5 - 15 سنة" : "Ages 5 - 15",
      studios: [
        {
          title: isAr ? "سير الأنبياء المصورة" : "Illustrated Seerah",
          desc: isAr ? "محطات ملهمة من سيرة الرسول ﷺ وأولي العزم من الرسل" : "Inspiring milestones of the Prophet ﷺ and Prophets",
          icon: BookOpen,
          href: `/${locale}/student/stories`,
        },
        {
          title: isAr ? "بطاقات القيم والآداب اليومية" : "Islamic Adab & Ethics",
          desc: isAr ? "مواقف تفاعلية لترسيخ الصدق وبر الوالدين والأمانة" : "Interactive moral dilemmas on honesty, kindness & integrity",
          icon: HeartHandshake,
          href: `/${locale}/student/activities`,
        },
      ],
    },
  };

  const currentMeta = programMeta[selectedProgramId] || programMeta["prog-foundations"];
  const MainIcon = currentMeta.icon;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
          >
            <BackArrow className="w-4 h-4" />
            <span>{isAr ? "العودة للرئيسية" : "Back to Home"}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs text-slate-500 font-medium">
              {isAr ? "المسارات الأكاديمية الـ 7 المعتمدة" : "7 Accredited Academic Tracks"}
            </span>
            <Link
              href={`/${locale}/parent/enroll`}
              className="px-4 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all"
            >
              {isAr ? "التسجيل في الفصول 🎓" : "Enroll in Classes 🎓"}
            </Link>
          </div>
        </div>

        {/* 7 Program Selector Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {allPrograms.map((prog) => {
              const meta = programMeta[prog.id] || programMeta["prog-foundations"];
              const ProgIcon = meta.icon;
              const isSelected = prog.id === selectedProgramId;
              return (
                <Link
                  key={prog.id}
                  href={`/${locale}/programs?program=${prog.id}`}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.02]"
                      : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <ProgIcon className="w-4 h-4" />
                  <span>{isAr ? prog.titleAr : prog.titleEn}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Header for Selected Program */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className={`bg-gradient-to-r ${currentMeta.gradient} rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden`}>
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                {currentMeta.cefrSpan}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
                {currentMeta.targetAges}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-extrabold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{isAr ? "فصول مصغرة (حد أقصى 6 أطفال)" : "Micro-Cohorts (Max 6 Students)"}</span>
              </span>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
                <MainIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {isAr ? currentProgram.titleAr : currentProgram.titleEn}
                </h1>
                <p className="text-white/90 text-sm sm:text-base mt-1 leading-relaxed">
                  {isAr ? currentProgram.descriptionAr : currentProgram.descriptionEn}
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-white/80 border-t border-white/20">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{isAr ? "معاير وفق الإطار الأوروبي CEFR" : "Calibrated to CEFR Standards"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{isAr ? "حصص تفاعلية مرئية مباشرة أسبوعياً" : "Weekly Live Interactive Video Sessions"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{isAr ? "تقارير إنجاز أسبوعية مفصلة لأولياء الأمور" : "Weekly Detailed Parent Progress Reports"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Section 1: Detailed Curriculum Sequence */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-1">
                <Target className="w-3.5 h-3.5" />
                <span>{isAr ? "المنهج والوحدات التعليمية المعتمدة" : "Accredited Syllabi & Modules"}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {isAr ? "التدرج الأكاديمي ومخرجات التعلم الأسبوعية" : "Academic Progression & Weekly Learning Outcomes"}
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {isAr ? `${modules.length} وحدات تدريسية مفصلة` : `${modules.length} Detailed Teaching Modules`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((m, idx) => (
              <div
                key={m.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-xl bg-brand-50 text-brand-700 font-extrabold text-xs">
                      {m.cefrAlignment}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isAr ? `${m.durationWeeks} أسابيع` : `${m.durationWeeks} Weeks`}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {isAr ? `الوحدة ${idx + 1}: ${m.levelTitleAr}` : `Module ${idx + 1}: ${m.courseLevelCode}`}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {isAr ? m.titleAr : m.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {m.descriptionAr}
                    </p>
                  </div>

                  {/* Weekly Objectives */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      {isAr ? "المخرجات التعليمية المستهدفة:" : "Core Learning Objectives:"}
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {m.weeklyObjectivesAr.map((obj, oIdx) => (
                        <li key={oIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{isAr ? `الحصيلة: +${m.targetVocabularyCount} مفردة` : `Target: +${m.targetVocabularyCount} Words`}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                    {m.targetAgeGroup === "AGE_4_6"
                      ? isAr
                        ? "براعم (4-6)"
                        : "Sprouts (4-6)"
                      : m.targetAgeGroup === "AGE_7_10"
                      ? isAr
                        ? "مستكشفون (7-10)"
                        : "Explorers (7-10)"
                      : isAr
                      ? "رواد (11-13)"
                      : "Navigators (11-13)"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Integrated Interactive Studios */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "أدوات واستوديوهات التعلم التفاعلي" : "Integrated Interactive Learning Studios"}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {isAr ? "تطبيقات حية مدمجة تعزز مهارات هذا البرنامج" : "Live Interactive Studios Enhancing This Track"}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr
                ? "يتاح للطلاب المسجلين وصول فوري وغير محدود لهذه الأدوات لترسيخ الممارسة اليومية"
                : "Enrolled students receive instant and unlimited access to these studio tools"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentMeta.studios.map((studio, sIdx) => {
              const StudioIcon = studio.icon;
              return (
                <div
                  key={sIdx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white hover:border-brand-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white text-brand-600 shadow-xs border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <StudioIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                        {studio.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {studio.desc}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={studio.href}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-brand-600 hover:border-brand-300 transition-all shrink-0 self-start sm:self-center"
                  >
                    <span>{isAr ? "تجربة الاستوديو" : "Explore Studio"}</span>
                    <ForwardArrow className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Active Micro-Cohorts & Direct Enrollment */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>{isAr ? "الفصول القائمة والمتاحة للتسجيل الفوري" : "Active Cohorts Available for Enrollment"}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {isAr ? "اختر الفوج المناسب لطفلك (بحد أقصى 6 مقاعد)" : "Select Cohort for Your Child (Capped at 6 Seats)"}
              </h2>
            </div>

            <Link
              href={`/${locale}/parent/enroll`}
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>{isAr ? "عرض جميع الفصول السبعة" : "View All 7 Tracks Cohorts"}</span>
              <ForwardArrow className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programClasses.map((cg) => {
              return (
                <div
                  key={cg.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-brand-300 transition-all space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-extrabold text-xs">
                        {cg.classType === "GROUP"
                          ? isAr
                            ? "فصل جماعي مصغر (6 طلاب)"
                            : "Micro-Group (6 max)"
                          : isAr
                          ? "درس خاص (1 على 1)"
                          : "Private (1-on-1)"}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        {isAr ? "متاح للتسجيل" : "Enrollment Open"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {cg.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? "منهج معتمد يركز على التطبيق التفاعلي مع معلم معتمد ومجموعات صغيرة محفزة."
                        : "Accredited curriculum focusing on active interaction with certified teachers."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                        👨‍🏫
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block leading-none">
                          {isAr ? "المعلم المشرف" : "Lead Instructor"}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {isAr ? "أستاذ معتمد ومجاز" : "Certified Faculty"}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/parent/enroll`}
                      className="px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>{isAr ? "حجز مقعد الآن" : "Reserve Seat"}</span>
                      <ForwardArrow className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
