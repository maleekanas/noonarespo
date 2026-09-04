import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { administrationService } from "@/server/services/AdministrationService";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { AgeGroup, RoleType } from "@prisma/client";
import {
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  Target,
} from "lucide-react";

export default async function AdminCurriculumPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ program?: string }>;
}) {
  const { locale } = await params;
  const { program: activeProgramId } = await searchParams;

  const programs = await academicRepository.getAllPrograms();
  const selectedProgramId = activeProgramId || programs[0]?.id || "prog-foundations";

  const modules = await administrationService.getCurriculumModules(selectedProgramId);

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
        descriptionAr,
        weeklyObjectivesAr: [objective1, objective2],
        targetVocabularyCount,
        durationWeeks,
      },
      {
        id: "user-superadmin",
        email: "superadmin@kidsarabicacademy.internal",
        name: "المشرف العام",
        role: RoleType.SUPER_ADMIN,
        locale: "ar",
      }
    );

    revalidatePath(`/${locale}/admin/curriculum`);
    revalidatePath(`/${locale}/admin/audit-logs`);
  }

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
            معايرة مخرجات التعلم المتوافقة مع الإطار الأوروبي المشترك للغات (CEFR)
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>7 برامج تعليمية معتمدة دولياً</span>
        </div>
      </div>

      {/* Program Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {programs.map((prog) => {
          const isSelected = prog.id === selectedProgramId;
          return (
            <Link
              key={prog.id}
              href={`/${locale}/admin/curriculum?program=${prog.id}`}
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
            <input type="hidden" name="programId" value={selectedProgramId} />

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
