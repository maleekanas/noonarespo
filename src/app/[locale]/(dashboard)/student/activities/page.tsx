import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { gamificationService } from "@/server/services/GamificationService";
import { Flame, Sparkles } from "lucide-react";
import { PhonicsArcadeStudio } from "@/components/activities/PhonicsArcadeStudio";

export default async function StudentActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const studentId = "student-1";

  async function handleCompleteActivity() {
    "use server";
    await gamificationService.awardXp(studentId, 30, "إكمال جولة في مهارات الحروف وتركيب الكلمات");
    revalidatePath(`/${locale}/student/activities`);
    revalidatePath(`/${locale}/student`);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/student`} className="hover:underline">
              بوابة الطالب
            </Link>
            <span>/</span>
            <span>الأنشطة التفاعلية</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            ألعاب وأنشطة التعلم الذكي 🎮
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            استكشف أصوات الحروف مع الحركات الإعرابية، وركب الكلمات العربية، ومارس التحديات لكسب +30 XP!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold">
            <Flame className="w-4 h-4 fill-orange-500" />
            <span>شعلة الحماس نشطة (5 أيام)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>مستوى 2: مستكشف الحروف</span>
          </div>
        </div>
      </div>

      {/* Interactive Arcade Studio Component */}
      <PhonicsArcadeStudio
        studentName="زيد طارق"
        onCompleteActivity={handleCompleteActivity}
      />
    </div>
  );
}
