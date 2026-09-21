import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { administrationService } from "@/server/services/AdministrationService";
import { academicRepository, getProgramSlug } from "@/server/repositories/AcademicRepository";
import { AgeGroup } from "@prisma/client";
import { requireAdminSession } from "@/lib/auth/currentUser";
import {
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  Target,
  PenTool,
  Mic,
  Gamepad2,
  BookMarked,
  Brain,
  Clock,
  FileText,
  Award,
} from "lucide-react";

const TOOL_ICONS: Record<string, { labelAr: string; labelEn: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  WHITEBOARD: { labelAr: "اللوح التفاعلي", labelEn: "Whiteboard", icon: PenTool, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  AUDIO_RECORDER: { labelAr: "مسجل الصوت", labelEn: "Audio Lab", icon: Mic, color: "text-rose-600 bg-rose-50 border-rose-200" },
  PHONICS_CANVAS: { labelAr: "ورشة الأصوات", labelEn: "Phonics Canvas", icon: Gamepad2, color: "text-amber-600 bg-amber-50 border-amber-200" },
  TAJWEED_STUDIO: { labelAr: "مختبر التجويد", labelEn: "Tajweed Studio", icon: BookMarked, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  WORD_SCRAMBLER: { labelAr: "تركيب الكلمات", labelEn: "Word Lab", icon: Brain, color: "text-purple-600 bg-purple-50 border-purple-200" },
  FLASHCARDS: { labelAr: "بطاقات التكرار", labelEn: "Flashcards", icon: Layers, color: "text-sky-600 bg-sky-50 border-sky-200" },
};

export default async function AdminCurriculumPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ program?: string; age?: string }>;
}) {
  const { locale } = await params;
  const { program: activeProgramId, age: activeAgeParam } = await searchParams;
  const adminSession = await requireAdminSession(locale);

  const programs = await academicRepository.getAllPrograms();
  const programsWithSlug = programs.map((p) => ({ ...p, slug: getProgramSlug(p.type) }));
  const selectedSlug =
    activeProgramId && programsWithSlug.some((p) => p.slug === activeProgramId)
      ? activeProgramId
      : programsWithSlug[0]?.slug || "prog-foundations";

  const modules = await administrationService.getCurriculumModules(selectedSlug);

  // Lesson counts & catalog across age groups
  const lessonCounts = await administrationService.getLessonsCountByAgeGroup();
  const totalLessons = Object.values(lessonCounts).reduce((a, b) => a + b, 0);

  const selectedAgeGroup: AgeGroup =
    activeAgeParam && Object.values(AgeGroup).includes(activeAgeParam as AgeGroup)
      ? (activeAgeParam as AgeGroup)
      : AgeGroup.AGE_4_6;

  const lessons = await administrationService.getLessonsByAgeGroup(selectedAgeGroup);

  async function handleAddModule(formData: FormData) {
    "use server";
    const programId = formData.get("programId")?.toString() || "prog-foundations";
    const titleAr = formData.get("titleAr")?.toString() || "";
    const descriptionAr = formData.get("descriptionAr")?.toString() || "";
    const courseLevelCode = formData.get("courseLevelCode")?.toString() || "A1";
    const targetAgeGroup = (formData.get("targetAgeGroup")?.toString() || "AGE_7_10") as AgeGroup;
    const durationWeeks = parseInt(formData.get("durationWeeks")?.toString() || "4", 10);
    const targetVocabularyCount = parseInt(formData.get("vocabularyCount")?.toString() || "50", 10);
    const objective1 = formData.get("objective1")?.toString() || "التعرف على المهارة الأساسية";
    const objective2 = formData.get("objective2")?.toString() || "التطبيق العملي في جمل مفيدة";

    if (!titleAr) return;

    await administrationService.addCurriculumModule(
      {
        programId,
        programTitleAr: "البرنامج الأكاديمي",
        programTitleEn: "Academic Program",
        courseLevelCode,
        levelTitleAr: `المستوى (${courseLevelCode})`,
        targetAgeGroup,
        cefrAlignment: `CEFR ${courseLevelCode}`,
        titleAr,
        titleEn: titleAr,
        titleNl: titleAr,
        titleTr: titleAr,
        titleIt: titleAr,
        titleEs: titleAr,
        descriptionAr,
        descriptionEn: descriptionAr,
        descriptionNl: descriptionAr,
        descriptionTr: descriptionAr,
        descriptionIt: descriptionAr,
        descriptionEs: descriptionAr,
        weeklyObjectivesAr: [objective1, objective2],
        weeklyObjectivesEn: [objective1, objective2],
        weeklyObjectivesNl: [objective1, objective2],
        weeklyObjectivesTr: [objective1, objective2],
        weeklyObjectivesIt: [objective1, objective2],
        weeklyObjectivesEs: [objective1, objective2],
        targetVocabularyCount,
        durationWeeks,
      },
      adminSession
    );

    revalidatePath(`/${locale}/admin/curriculum`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

  const ageGroupCards = [
    {
      group: AgeGroup.AGE_4_6,
      nameAr: "البراعم (4 - 6 سنوات)",
      nameEn: "Sprouts (Ages 4-6)",
      count: lessonCounts[AgeGroup.AGE_4_6] || 0,
      emoji: "🌱",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      group: AgeGroup.AGE_7_10,
      nameAr: "المستكشفون (7 - 10 سنوات)",
      nameEn: "Explorers (Ages 7-10)",
      count: lessonCounts[AgeGroup.AGE_7_10] || 0,
      emoji: "🔍",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      group: AgeGroup.AGE_11_13,
      nameAr: "الرواد (11 - 13 سنة)",
      nameEn: "Pioneers (Ages 11-13)",
      count: lessonCounts[AgeGroup.AGE_11_13] || 0,
      emoji: "🚀",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      group: AgeGroup.AGE_14_16,
      nameAr: "الفرسان (14 - 16 سنة)",
      nameEn: "Scholars (Ages 14-16)",
      count: lessonCounts[AgeGroup.AGE_14_16] || 0,
      emoji: "🛡️",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              لوحة الإدارة العامة
            </Link>
            <span>/</span>
            <span>المناهج والمعايير الأكاديمية</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            إدارة المناهج والمسارات التعليمية السبعة 📚
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            معايرة مخرجات التعلم المتوافقة مع الإطار الأوروبي المشترك للغات (CEFR) وأكثر من 75 درساً لكل فئة عمرية
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>{totalLessons} درساً تفاعلياً معتمداً عبر 4 فئات عمرية</span>
        </div>
      </div>

      {/* Age Group Stat Cards (Verifying >75 lessons per age group) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ageGroupCards.map((card) => {
          const isSelected = card.group === selectedAgeGroup;
          return (
            <Link
              key={card.group}
              href={`/${locale}/admin/curriculum?age=${card.group}&program=${selectedSlug}`}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "bg-white border-brand-500 shadow-md ring-2 ring-brand-500/20"
                  : "bg-white border-slate-200 hover:border-brand-300 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{card.emoji}</span>
                <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${card.badgeColor}`}>
                  {card.count > 75 ? "مكتمل (>75 درس)" : `${card.count} درس`}
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{card.nameAr}</h3>
                <span className="text-[11px] text-slate-400 font-mono block">{card.nameEn}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-bold">الدروس المسجلة:</span>
                <span className="font-mono font-extrabold text-brand-700 text-sm">{card.count} درساً</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Detailed Lesson Explorer Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-extrabold text-slate-900">
                فهرس الدروس التفاعلية المفصلة ({lessons.length} درساً معتمداً لـ {ageGroupCards.find(c => c.group === selectedAgeGroup)?.nameAr})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              جميع الدروس مجهزة بأدوات الغرفة التفاعلية (اللوح الذكي، مختبر التجويد، مسجل الصوت) وواجبات منزلية مصاحبة
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">الفئة المختارة:</span>
            <span className="px-3 py-1 rounded-xl bg-brand-50 text-brand-700 font-extrabold text-xs border border-brand-200">
              {ageGroupCards.find(c => c.group === selectedAgeGroup)?.nameAr}
            </span>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-brand-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-brand-100 text-brand-800 text-[10px] font-extrabold font-mono">
                    درس {lesson.lessonNumber}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>{lesson.durationMinutes} دقيقة</span>
                  </div>
                </div>

                <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                  {lesson.titleAr}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                  {lesson.descriptionAr}
                </p>
              </div>

              {/* Interactive Tools Badges */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <div className="flex flex-wrap gap-1.5">
                  {lesson.interactiveTools.map((toolKey) => {
                    const toolInfo = TOOL_ICONS[toolKey];
                    if (!toolInfo) return null;
                    const Icon = toolInfo.icon;
                    return (
                      <span
                        key={toolKey}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${toolInfo.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{toolInfo.labelAr}</span>
                      </span>
                    );
                  })}
                </div>

                {lesson.homeworkTitleAr && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200/60">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{lesson.homeworkTitleAr}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Program Selector Tabs for Modules */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {programsWithSlug.map((prog) => {
          const isSelected = prog.slug === selectedSlug;
          return (
            <Link
              key={prog.id}
              href={`/${locale}/admin/curriculum?program=${prog.slug}&age=${selectedAgeGroup}`}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? "gradient-brand text-white shadow-md shadow-brand-500/20 scale-[1.02]"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{prog.titleAr}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Modules & Add Module Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Modules List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-600" />
              <span>الوحدات الدراسية المعتمدة لهذا البرنامج ({modules.length})</span>
            </h2>
          </div>

          {modules.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              لا توجد وحدات مسجلة بعد لهذا المسار. استخدم النموذج المقابل لإضافة وحدة دراسية جديدة.
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((mod) => (
                <div
                  key={mod.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-brand-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-lg bg-brand-50 text-brand-700 text-[11px] font-bold border border-brand-200">
                        {mod.cefrAlignment} • {mod.levelTitleAr}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                        {mod.titleAr}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono block">
                        {mod.titleEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">المدة</span>
                        <span className="font-extrabold text-slate-800 font-mono">
                          {mod.durationWeeks} أسابيع
                        </span>
                      </div>
                      <div className="text-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">المفردات</span>
                        <span className="font-extrabold text-emerald-600 font-mono">
                          +{mod.targetVocabularyCount} كلمة
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {mod.descriptionAr}
                  </p>

                  {/* Weekly Objectives */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      الأهداف والمخرجات الأسبوعية:
                    </span>
                    <ul className="space-y-1.5">
                      {mod.weeklyObjectivesAr.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Curriculum Unit Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 h-fit">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-600" />
              <span>إضافة وحدة منهجية جديدة ➕</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              تحديد محاور الوحدة، أهدافها، وعدد المفردات المستهدفة
            </p>
          </div>

          <form action={handleAddModule} className="space-y-4 text-xs">
            <input type="hidden" name="programId" value={selectedSlug} />

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                عنوان الوحدة بالعربية
              </label>
              <input
                name="titleAr"
                type="text"
                required
                placeholder="مثال: وحدة الأفعال والضمائر المتصلة"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                وصف الوحدة والمخرجات
              </label>
              <textarea
                name="descriptionAr"
                rows={3}
                required
                placeholder="شرح موجز لأهمية الوحدة وما سيتعلمه الطفل خلال الأسابيع القادمة..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المستوى (CEFR)
                </label>
                <select
                  name="courseLevelCode"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="PRE_A1">Pre-A1 (تمهيدي)</option>
                  <option value="A1">A1 (مبتدئ)</option>
                  <option value="A2">A2 (فوق مبتدئ)</option>
                  <option value="B1">B1 (متوسط)</option>
                  <option value="B2">B2 (متقدم)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الفئة العمرية
                </label>
                <select
                  name="targetAgeGroup"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="AGE_4_6">4 - 6 سنوات</option>
                  <option value="AGE_7_10">7 - 10 سنوات</option>
                  <option value="AGE_11_13">11 - 13 سنة</option>
                  <option value="AGE_14_16">14 - 16 سنة</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المدة (بالأسابيع)
                </label>
                <input
                  name="durationWeeks"
                  type="number"
                  defaultValue={4}
                  min={1}
                  max={12}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المفردات المستهدفة
                </label>
                <input
                  name="vocabularyCount"
                  type="number"
                  defaultValue={50}
                  step={10}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الهدف الأسبوعي الأول
              </label>
              <input
                name="objective1"
                type="text"
                placeholder="مثال: تمييز الفعل الماضي عن المضارع"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الهدف الأسبوعي الثاني
              </label>
              <input
                name="objective2"
                type="text"
                placeholder="مثال: تركيب جملة فعلية صحيحة"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all mt-2"
            >
              حفظ واعتماد الوحدة الأكاديمية 💾
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
