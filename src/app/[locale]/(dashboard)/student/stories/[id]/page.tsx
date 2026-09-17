import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { storyService } from "@/server/services/StoryService";
import { InteractiveStoryReader } from "@/components/stories/InteractiveStoryReader";
import { requireStudentProfile } from "@/lib/auth/currentUser";
import { getDictionary } from "@/lib/localization";

export default async function StoryReaderPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const sr = dict.studentStoryReader;
  await requireStudentProfile(locale);

  const story = await storyService.getStoryDetails(id);

  if (!story) {
    notFound();
  }

  // Server action to evaluate story quiz
  async function submitQuizAction(selectedOptions: Record<string, number>) {
    "use server";
    const { profile: studentProfile } = await requireStudentProfile(locale);
    const result = await storyService.evaluateStoryQuiz({
      studentId: studentProfile.id,
      storyId: id,
      selectedOptions,
    });
    return {
      scorePercentage: result.scorePercentage,
      isPassed: result.isPassed,
      xpAwarded: result.xpAwarded,
      feedbackMessageAr: result.feedbackMessageAr,
    };
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href={`/${locale}/student/stories`}
              className="hover:text-brand-600 flex items-center gap-1.5 font-medium transition-colors"
            >
              <ArrowRight className={`w-4 h-4 ${isAr ? "" : "rotate-180"}`} />
              {sr.backToStoryLibrary}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold truncate max-w-xs">{story.titleAr}</span>
          </div>

          <div className="flex items-center gap-2 text-xs bg-brand-50 border border-brand-200 text-brand-800 px-3 py-1.5 rounded-full font-bold">
            <BookOpen className="w-3.5 h-3.5 text-brand-600" />
            <span>{sr.interactiveVocalizedReader}</span>
          </div>
        </div>

        {/* Client Interactive Reader Component */}
        <InteractiveStoryReader
          story={story}
          locale={locale}
          onQuizSubmit={submitQuizAction}
        />
      </div>
    </div>
  );
}
