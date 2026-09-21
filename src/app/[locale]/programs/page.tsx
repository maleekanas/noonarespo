import React from "react";
import Link from "next/link";
import { academicRepository, getProgramSlug } from "@/server/repositories/AcademicRepository";
import { administrationService } from "@/server/services/AdministrationService";
import { getDirection, getDictionary } from "@/lib/localization";
import type { CurriculumModule } from "@/server/repositories/AdministrationRepository";

// CurriculumModule content carries one field per locale (titleAr/titleEn/...);
// this picks the right one for the page's current locale, falling back to
// English for any locale that isn't Arabic and doesn't have its own field.
function pickLocaleField(
  locale: string,
  fieldsByLocale: { ar: string; en: string; nl: string; tr: string; it: string; es: string }
): string {
  switch (locale) {
    case "ar":
      return fieldsByLocale.ar;
    case "nl":
      return fieldsByLocale.nl;
    case "tr":
      return fieldsByLocale.tr;
    case "it":
      return fieldsByLocale.it;
    case "es":
      return fieldsByLocale.es;
    default:
      return fieldsByLocale.en;
  }
}

function moduleTitle(locale: string, m: CurriculumModule): string {
  return pickLocaleField(locale, {
    ar: m.titleAr,
    en: m.titleEn,
    nl: m.titleNl,
    tr: m.titleTr,
    it: m.titleIt,
    es: m.titleEs,
  });
}

function moduleDescription(locale: string, m: CurriculumModule): string {
  return pickLocaleField(locale, {
    ar: m.descriptionAr,
    en: m.descriptionEn,
    nl: m.descriptionNl,
    tr: m.descriptionTr,
    it: m.descriptionIt,
    es: m.descriptionEs,
  });
}

function moduleWeeklyObjectives(locale: string, m: CurriculumModule): string[] {
  switch (locale) {
    case "ar":
      return m.weeklyObjectivesAr;
    case "nl":
      return m.weeklyObjectivesNl;
    case "tr":
      return m.weeklyObjectivesTr;
    case "it":
      return m.weeklyObjectivesIt;
    case "es":
      return m.weeklyObjectivesEs;
    default:
      return m.weeklyObjectivesEn;
  }
}
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
  const dict = getDictionary(locale);
  const pc = dict.programsCatalog;
  // pc.meta's keys are the fixed set of "prog-xxx" slugs, typed from the
  // JSON dictionary as literal keys -- cast once so it can be looked up by
  // a dynamically-resolved slug (selectedSlug / prog.slug) below.
  const programMetaDict = pc.meta as unknown as Record<
    string,
    {
      title: string;
      description: string;
      targetAges: string;
      studio1Title: string;
      studio1Desc: string;
      studio2Title: string;
      studio2Desc: string;
    }
  >;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const ForwardArrow = isRtl ? ArrowLeft : ArrowRight;

  // Program.id in the database is a random UUID; the stable "prog-xxx" slug
  // (derived from the program's real, stable `type`) is what the curriculum
  // catalog, the dictionaries, and incoming links (e.g. from the homepage)
  // actually use to identify a program. Resolve the selected program by
  // slug first, and use its real database id only for genuine DB lookups
  // (courses/levels) -- mixing the two previously meant every program page
  // silently fell back to Foundations' metadata and always showed "0"
  // curriculum modules, regardless of which program tab was open.
  let allPrograms: any[] = [];
  try {
    allPrograms = await academicRepository.getAllPrograms();
  } catch (err) {
    console.error("Failed to load programs:", err);
    allPrograms = [];
  }

  const allProgramsWithSlug = allPrograms.map((p) => ({ ...p, slug: getProgramSlug(p.type) }));
  const selectedSlug =
    programParam && allProgramsWithSlug.some((p) => p.slug === programParam)
      ? programParam
      : allProgramsWithSlug[0]?.slug || "prog-foundations";

  const currentProgram =
    allProgramsWithSlug.find((p) => p.slug === selectedSlug) || allProgramsWithSlug[0];

  // Fetch courses, levels, and curriculum modules for the selected program
  let courses: any[] = [];
  let modules: any[] = [];
  try {
    if (currentProgram?.id) {
      courses = await academicRepository.getCoursesByProgramId(currentProgram.id);
    }
    modules = await administrationService.getCurriculumModules(selectedSlug);
  } catch (err) {
    console.error("Failed to load courses or modules:", err);
  }

  // Collect levels across courses
  const levels = [];
  try {
    for (const course of courses) {
      const courseLevels = await academicRepository.getLevelsByCourseId(course.id);
      levels.push(...courseLevels);
    }
  } catch (err) {
    console.error("Failed to load levels:", err);
  }
  const levelIds = new Set(levels.map((l) => l.id));

  // Get active class groups matching these levels
  let allClasses: any[] = [];
  try {
    allClasses = await academicRepository.getAllClassGroups();
  } catch (err) {
    console.error("Failed to load class groups:", err);
  }
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
      targetAges: pc.meta["prog-foundations"].targetAges,
      studios: [
        {
          title: pc.meta["prog-foundations"].studio1Title,
          desc: pc.meta["prog-foundations"].studio1Desc,
          icon: Gamepad2,
          href: `/${locale}/student/activities`,
        },
        {
          title: pc.meta["prog-foundations"].studio2Title,
          desc: pc.meta["prog-foundations"].studio2Desc,
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
      targetAges: pc.meta["prog-reading"].targetAges,
      studios: [
        {
          title: pc.meta["prog-reading"].studio1Title,
          desc: pc.meta["prog-reading"].studio1Desc,
          icon: Award,
          href: `/${locale}/student/roadmap`,
        },
        {
          title: pc.meta["prog-reading"].studio2Title,
          desc: pc.meta["prog-reading"].studio2Desc,
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
      targetAges: pc.meta["prog-writing"].targetAges,
      studios: [
        {
          title: pc.meta["prog-writing"].studio1Title,
          desc: pc.meta["prog-writing"].studio1Desc,
          icon: PenTool,
          href: `/${locale}/student/activities`,
        },
        {
          title: pc.meta["prog-writing"].studio2Title,
          desc: pc.meta["prog-writing"].studio2Desc,
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
      targetAges: pc.meta["prog-speaking"].targetAges,
      studios: [
        {
          title: pc.meta["prog-speaking"].studio1Title,
          desc: pc.meta["prog-speaking"].studio1Desc,
          icon: Bot,
          href: `/${locale}/student/ai-tutor`,
        },
        {
          title: pc.meta["prog-speaking"].studio2Title,
          desc: pc.meta["prog-speaking"].studio2Desc,
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
      targetAges: pc.meta["prog-listening"].targetAges,
      studios: [
        {
          title: pc.meta["prog-listening"].studio1Title,
          desc: pc.meta["prog-listening"].studio1Desc,
          icon: Headphones,
          href: `/${locale}/student/pronunciation`,
        },
        {
          title: pc.meta["prog-listening"].studio2Title,
          desc: pc.meta["prog-listening"].studio2Desc,
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
      targetAges: pc.meta["prog-quran"].targetAges,
      studios: [
        {
          title: pc.meta["prog-quran"].studio1Title,
          desc: pc.meta["prog-quran"].studio1Desc,
          icon: Moon,
          href: `/${locale}/student/quran-studio`,
        },
        {
          title: pc.meta["prog-quran"].studio2Title,
          desc: pc.meta["prog-quran"].studio2Desc,
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
      targetAges: pc.meta["prog-islamic"].targetAges,
      studios: [
        {
          title: pc.meta["prog-islamic"].studio1Title,
          desc: pc.meta["prog-islamic"].studio1Desc,
          icon: BookOpen,
          href: `/${locale}/student/stories`,
        },
        {
          title: pc.meta["prog-islamic"].studio2Title,
          desc: pc.meta["prog-islamic"].studio2Desc,
          icon: HeartHandshake,
          href: `/${locale}/student/activities`,
        },
      ],
    },
  };

  const currentMeta = programMeta[selectedSlug] || programMeta["prog-foundations"];
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
            <span>{pc.backToHome}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs text-slate-500 font-medium">
              {pc.tracksLabel}
            </span>
            <Link
              href={`/${locale}/parent/enroll`}
              className="px-4 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all"
            >
              {pc.enrollCta}
            </Link>
          </div>
        </div>

        {/* 7 Program Selector Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {allProgramsWithSlug.map((prog) => {
              const meta = programMeta[prog.slug] || programMeta["prog-foundations"];
              const ProgIcon = meta.icon;
              const isSelected = prog.slug === selectedSlug;
              const progTitle = programMetaDict[prog.slug]?.title || prog.titleEn;
              return (
                <Link
                  key={prog.id}
                  href={`/${locale}/programs?program=${prog.slug}`}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.02]"
                      : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <ProgIcon className="w-4 h-4" />
                  <span>{progTitle}</span>
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
                <span>{pc.microCohortsBadge}</span>
              </span>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
                <MainIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {programMetaDict[selectedSlug]?.title || currentProgram.titleEn}
                </h1>
                <p className="text-white/90 text-sm sm:text-base mt-1 leading-relaxed">
                  {programMetaDict[selectedSlug]?.description || currentProgram.descriptionEn}
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-white/80 border-t border-white/20">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{pc.cefrStandardsBadge}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{isAr ? "+75 درساً لكل فئة عمرية (320+ درساً معتمداً)" : "75+ Lessons / Age Group (320+ Total)"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{pc.liveSessionsBadge}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{pc.progressReportsBadge}</span>
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
                <span>{pc.syllabiTag}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {pc.progressionTitle}
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {modules.length} {pc.modulesLabel}
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
                      <span>{m.durationWeeks} {pc.weeksLabel}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {isAr ? `${pc.moduleLabel} ${idx + 1}: ${m.levelTitleAr}` : `${pc.moduleLabel} ${idx + 1}: ${m.courseLevelCode}`}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {moduleTitle(locale, m)}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {moduleDescription(locale, m)}
                    </p>
                  </div>

                  {/* Weekly Objectives */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      {pc.objectivesLabel}
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {moduleWeeklyObjectives(locale, m).map((obj, oIdx) => (
                        <li key={oIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{pc.targetLabel} +{m.targetVocabularyCount} {pc.wordsLabel}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                    {m.targetAgeGroup === "AGE_4_6"
                      ? pc.ageSproutsLabel
                      : m.targetAgeGroup === "AGE_7_10"
                      ? pc.ageExplorersLabel
                      : pc.ageNavigatorsLabel}
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
              <span>{pc.studiosTag}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {pc.studiosTitle}
            </h2>
            <p className="text-xs text-slate-500">
              {pc.studiosSubtitle}
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
                    <span>{pc.exploreStudioCta}</span>
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
                <span>{pc.cohortsTag}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {pc.cohortsTitle}
              </h2>
            </div>

            <Link
              href={`/${locale}/parent/enroll`}
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>{pc.viewAllCta}</span>
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
                        {cg.classType === "GROUP" ? pc.microGroupLabel : pc.privateLabel}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        {pc.enrollmentOpenLabel}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {cg.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {pc.cohortDescriptionGeneric}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                        👨‍🏫
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block leading-none">
                          {pc.leadInstructorLabel}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {pc.certifiedFacultyLabel}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/parent/enroll`}
                      className="px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>{pc.reserveSeatCta}</span>
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
