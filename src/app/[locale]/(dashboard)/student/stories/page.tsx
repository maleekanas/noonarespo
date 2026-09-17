import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  Trophy,
  Clock,
  CheckCircle2,
  Compass,
  HeartHandshake,
  Scroll,
} from "lucide-react";
import { storyService } from "@/server/services/StoryService";
import { StoryCategory } from "@/server/repositories/StoryRepository";
import { getDictionary } from "@/lib/localization";

export default async function StudentStoriesCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category: filterCategory } = await searchParams;
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const ss = dict.studentStories;

  const allStories = await storyService.getStoryCatalog(
    filterCategory && ["PROPHETIC_STORIES", "ISLAMIC_VALUES", "LANGUAGE_ADVENTURE"].includes(filterCategory)
      ? (filterCategory as StoryCategory)
      : undefined
  );

  const categories = [
    {
      id: "ALL",
      name: ss.categoryAll,
      icon: BookOpen,
      href: `/${locale}/student/stories`,
      active: !filterCategory,
    },
    {
      id: "PROPHETIC_STORIES",
      name: ss.categoryProphetic,
      icon: Scroll,
      href: `/${locale}/student/stories?category=PROPHETIC_STORIES`,
      active: filterCategory === "PROPHETIC_STORIES",
    },
    {
      id: "ISLAMIC_VALUES",
      name: ss.categoryIslamicValues,
      icon: HeartHandshake,
      href: `/${locale}/student/stories?category=ISLAMIC_VALUES`,
      active: filterCategory === "ISLAMIC_VALUES",
    },
    {
      id: "LANGUAGE_ADVENTURE",
      name: ss.categoryLanguageAdventure,
      icon: Compass,
      href: `/${locale}/student/stories?category=LANGUAGE_ADVENTURE`,
      active: filterCategory === "LANGUAGE_ADVENTURE",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href={`/${locale}/student`} className="hover:text-brand-600 flex items-center gap-1">
              <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
              {ss.backToStudentDashboard}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">{ss.breadcrumbCurrent}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <span className="text-3xl">📖</span>
            {ss.pageHeading}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {ss.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl shadow-sm">
          <Trophy className="w-6 h-6 text-amber-600 shrink-0 animate-bounce" />
          <div className="text-xs">
            <div className="font-bold text-amber-900 text-sm">
              {ss.xpPerStory}
            </div>
            <div className="text-amber-700">
              {ss.includesExplorerBadge}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shrink-0 ${
                cat.active
                  ? "bg-brand-600 text-white shadow-md shadow-brand-200 scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allStories.map((story) => {
          return (
            <div
              key={story.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
            >
              {/* Cover Banner */}
              <div className="h-44 bg-gradient-to-br from-indigo-100 via-sky-50 to-emerald-50 relative flex items-center justify-center border-b border-slate-100 overflow-hidden">
                <span className="text-7xl select-none transform group-hover:scale-110 transition-transform duration-300">
                  {story.coverEmoji}
                </span>

                {/* Category Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm border border-slate-200">
                  {story.category === "PROPHETIC_STORIES"
                    ? ss.categoryBadgeProphetic
                    : story.category === "ISLAMIC_VALUES"
                    ? ss.categoryBadgeIslamicValues
                    : ss.categoryBadgeLanguage}
                </div>

                {/* Age Group */}
                <div className="absolute bottom-3 left-3 bg-slate-900/70 text-white backdrop-blur px-2.5 py-0.5 rounded-lg text-xs font-medium">
                  {ss.agesLabel} {story.ageGroup === "AGE_4_6" ? "4-6" : story.ageGroup === "AGE_7_10" ? "7-10" : "11-13"}
                </div>
              </div>

              {/* Story Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-brand-600 transition-colors leading-snug">
                    {story.titleAr}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-4">
                    {story.titleEn}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                      <span>{story.pages.length} {ss.pagesSuffix}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>~{story.readingDurationMinutes} {ss.minsSuffix}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-emerald-700 ml-auto">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>+{story.xpReward} XP</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/${locale}/student/stories/${story.id}`}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-brand-100 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{ss.openStorybookButton}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Feature Tip */}
      <div className="mt-12 bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-md">
          🎙️
        </div>
        <div>
          <h4 className="text-base font-black text-emerald-950 mb-1">
            {ss.voicePronunciationHeading}
          </h4>
          <p className="text-xs md:text-sm text-emerald-800 leading-relaxed">
            {ss.voicePronunciationDesc}
          </p>
        </div>
        <div className="shrink-0">
          <Link
            href={`/${locale}/student/pronunciation`}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{ss.visitVoiceStudioButton}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
