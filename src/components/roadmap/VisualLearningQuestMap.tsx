"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  Lock,
  CheckCircle2,
  Sparkles,
  Trophy,
  Compass,
  Gift,
  X,
  Play,
} from "lucide-react";
import {
  StudentQuestProgress,
  QuestNode,
  MilestoneChest,
} from "@/server/repositories/RoadmapRepository";

interface VisualLearningQuestMapProps {
  progress: StudentQuestProgress;
  locale: string;
  onClaimChest: (chestId: string) => Promise<{
    chestTitleAr: string;
    xpBonusAwarded: number;
    newTotalXp: number;
  }>;
}

export function VisualLearningQuestMap({
  progress,
  locale,
  onClaimChest,
}: VisualLearningQuestMapProps) {
  const isAr = locale === "ar";
  const [activeChestModal, setActiveChestModal] = useState<MilestoneChest | null>(null);
  const [chestClaimed, setChestClaimed] = useState<boolean>(false);
  const [claimResult, setClaimResult] = useState<{
    chestTitleAr: string;
    xpBonusAwarded: number;
    newTotalXp: number;
  } | null>(null);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  // Group nodes by stage
  const stages = [
    {
      id: "stage-oasis",
      nameAr: "المرحلة الأولى: واحة الحروف والأصوات 🌴",
      nameEn: "Stage 1: Oasis of Letters & Sounds 🌴",
      descriptionAr: "إتقان رسم الحروف ومواضعها وأصوات الحركات الثلاث",
      descriptionEn: "Master letter shapes, positions, and short vowels",
      bgGradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
      borderColor: "border-emerald-200",
      accentColor: "text-emerald-700",
    },
    {
      id: "stage-dunes",
      nameAr: "المرحلة الثانية: كثبان الأصوات والكلمات 🏜️",
      nameEn: "Stage 2: Dunes of Phonics & Words 🏜️",
      descriptionAr: "مخارج الحروف المفخمة، تركيب الكلمات، والأزواج المتباينة",
      descriptionEn: "Emphatic phonemes, word scramble building, and minimal pairs",
      bgGradient: "from-amber-500/10 via-orange-500/5 to-transparent",
      borderColor: "border-amber-200",
      accentColor: "text-amber-700",
    },
    {
      id: "stage-river",
      nameAr: "المرحلة الثالثة: نهر القصص والقيم النبوية 🌊",
      nameEn: "Stage 3: River of Stories & Values 🌊",
      descriptionAr: "قراءة قصص مصورة مشكولة مع استيعاب الدروس والعبر",
      descriptionEn: "Vocalized illustrated storybooks and moral comprehension",
      bgGradient: "from-sky-500/10 via-blue-500/5 to-transparent",
      borderColor: "border-sky-200",
      accentColor: "text-sky-700",
    },
    {
      id: "stage-citadel",
      nameAr: "المرحلة الرابعة: قلعة التلاوة والتجويد 🏰",
      nameEn: "Stage 4: Citadel of Quran & Tajweed 🏰",
      descriptionAr: "أحكام التجويد الملونة بالرسم العثماني وتسجيل التلاوة",
      descriptionEn: "Color-coded Tajweed in Uthmani script and audio recordings",
      bgGradient: "from-purple-500/10 via-indigo-500/5 to-transparent",
      borderColor: "border-purple-200",
      accentColor: "text-purple-700",
    },
    {
      id: "stage-palace",
      nameAr: "المرحلة الخامسة: قصر الفصاحة والبيان 👑",
      nameEn: "Stage 5: Palace of Arabic Fluency 👑",
      descriptionAr: "المحادثة الحية مع الذكاء الاصطناعي وبلوغ الطلاقة التعبيرية",
      descriptionEn: "Live interactive dialogue with Faseeh AI to reach B1 fluency",
      bgGradient: "from-rose-500/10 via-pink-500/5 to-transparent",
      borderColor: "border-rose-200",
      accentColor: "text-rose-700",
    },
  ];

  async function handleClaimChest(chest: MilestoneChest) {
    if (!chest.isUnlocked) return;
    setIsClaiming(true);
    try {
      const res = await onClaimChest(chest.id);
      setClaimResult(res);
      setChestClaimed(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Overview KPI Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold w-fit mb-3">
              <Compass className="w-4 h-4 text-amber-300" />
              <span>{isAr ? "خريطة المغامرة اللغوية الكبرى" : "The Arabic Odyssey Quest Map"}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-1">
              {isAr ? "رحلة الفصاحة: من الحرف إلى الطلاقة" : "Journey to Arabic Fluency"}
            </h2>
            <p className="text-xs md:text-sm text-indigo-100 max-w-xl">
              {isAr
                ? "أكمل المحطات بالترتيب، احصد النجوم الثلاث في كل تحدٍ، وافتح صناديق الكنز للحصول على أوسمة الشرف ونقاط XP!"
                : "Complete adventure milestones sequentially, earn 3 stars on every challenge, and unlock treasure chests!"}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-white/15 backdrop-blur p-4 rounded-2xl border border-white/20 shrink-0">
            <div className="text-center px-3 border-r border-white/20">
              <div className="flex items-center justify-center gap-1 text-amber-300 font-black text-2xl">
                <Star className="w-5 h-5 fill-amber-300" />
                <span>{progress.totalStars}</span>
              </div>
              <span className="text-[11px] text-indigo-200 font-bold block mt-0.5">
                {isAr ? "نجمة ذهبية" : "Stars Earned"}
              </span>
            </div>

            <div className="text-center px-3">
              <div className="font-black text-2xl text-white">
                {progress.pathCompletionPercentage}%
              </div>
              <span className="text-[11px] text-indigo-200 font-bold block mt-0.5">
                {isAr ? "إنجاز المسار" : "Path Progress"}
              </span>
            </div>
          </div>
        </div>

        {/* Path Progress Bar */}
        <div className="mt-6 pt-6 border-t border-white/15">
          <div className="flex items-center justify-between text-xs text-indigo-200 font-bold mb-2">
            <span>
              {isAr
                ? `المحطات المنجزة: ${progress.completedNodesCount} من ${progress.nodes.length}`
                : `Milestones Cleared: ${progress.completedNodesCount} of ${progress.nodes.length}`}
            </span>
            <span>{progress.pathCompletionPercentage}%</span>
          </div>
          <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress.pathCompletionPercentage}%` }}
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Milestone Treasure Chests Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-brand-600" />
          <span>{isAr ? "صناديق كنوز الإنجاز الكبرى" : "Milestone Treasure Chests"}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {progress.chests.map((chest) => (
            <button
              key={chest.id}
              type="button"
              onClick={() => {
                setActiveChestModal(chest);
                setChestClaimed(false);
                setClaimResult(null);
              }}
              className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between ${
                chest.isUnlocked
                  ? "bg-amber-50/80 border-amber-300 hover:shadow-md hover:scale-[1.02]"
                  : "bg-slate-50 border-slate-200 opacity-75"
              }`}
            >
              <div>
                <div className="text-xs font-black text-slate-900 mb-0.5">
                  {isAr ? chest.titleAr : chest.titleEn}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {chest.isUnlocked
                    ? (isAr ? "✨ مفتوح! انقر للاستلام" : "✨ Unlocked! Click to claim")
                    : (isAr ? `🔒 يتطلب ${chest.requiredStars} نجوم` : `🔒 Requires ${chest.requiredStars} stars`)}
                </div>
              </div>
              <div className="text-2xl shrink-0">
                {chest.isUnlocked ? "🎁" : "🔒"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quest Map: Grouped by Stages */}
      <div className="space-y-8">
        {stages.map((stage) => {
          const stageNodes = progress.nodes.filter((n) => n.stageId === stage.id);
          if (stageNodes.length === 0) return null;

          return (
            <div
              key={stage.id}
              className={`rounded-3xl border ${stage.borderColor} bg-gradient-to-b ${stage.bgGradient} p-6 shadow-sm space-y-6`}
            >
              {/* Stage Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {isAr ? stage.nameAr : stage.nameEn}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAr ? stage.descriptionAr : stage.descriptionEn}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs w-fit">
                  {stageNodes.filter((n) => n.status === "COMPLETED").length} / {stageNodes.length} {isAr ? "محطات" : "Nodes"}
                </span>
              </div>

              {/* Stage Nodes Lineup */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {stageNodes.map((node: QuestNode) => {
                  const isCompleted = node.status === "COMPLETED";
                  const isActive = node.status === "ACTIVE";

                  return (
                    <div
                      key={node.id}
                      className={`relative rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                        isActive
                          ? "bg-white border-brand-500 shadow-xl ring-4 ring-brand-100 scale-102"
                          : isCompleted
                          ? "bg-white/95 border-emerald-300 shadow-sm"
                          : "bg-slate-100/70 border-slate-200 opacity-70"
                      }`}
                    >
                      {/* Top Bar: Order & CEFR Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : isActive
                              ? "bg-brand-600 text-white animate-bounce"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {node.order}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {node.cefrMilestone && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                              CEFR {node.cefrMilestone}
                            </span>
                          )}

                          {isCompleted && (
                            <span className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < node.starsEarned
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Node Content */}
                      <div>
                        <div className="text-4xl mb-2">{node.illustrationEmoji}</div>
                        <h4 className="text-base font-black text-slate-900 mb-1 leading-snug">
                          {isAr ? node.titleAr : node.titleEn}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                          {isAr ? node.descriptionAr : node.descriptionEn}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-slate-100">
                        {isCompleted ? (
                          <Link
                            href={`/${locale}${node.targetRoute}`}
                            className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{isAr ? "مكتملة (إعادة التحدي)" : "Completed (Replay)"}</span>
                          </Link>
                        ) : isActive ? (
                          <Link
                            href={`/${locale}${node.targetRoute}`}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-brand-100 transition-colors animate-pulse"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>{isAr ? "ابدأ التحدي الآن 🚀" : "Start Milestone 🚀"}</span>
                          </Link>
                        ) : (
                          <div className="w-full py-2.5 bg-slate-200/80 text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed">
                            <Lock className="w-3.5 h-3.5" />
                            <span>{isAr ? "مقفل حالياً" : "Locked Node"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone Treasure Chest Claim Modal */}
      {activeChestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-center space-y-4">
            <button
              type="button"
              onClick={() => setActiveChestModal(null)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 mx-auto bg-amber-100 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
              🎁
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                {isAr ? activeChestModal.titleAr : activeChestModal.titleEn}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isAr
                  ? `وسام: ${activeChestModal.badgeNameAr} • مكافأة +${activeChestModal.xpBonus} XP`
                  : `Reward: +${activeChestModal.xpBonus} XP bonus`}
              </p>
            </div>

            {chestClaimed && claimResult ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-emerald-800 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? "تم استلام الكنز بنجاح!" : "Treasure Claimed!"}</span>
                </div>
                <div className="text-xs text-emerald-700">
                  +{claimResult.xpBonusAwarded} XP {isAr ? "أضيفت لرصيدك الإجمالي" : "added to total XP"}
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={!activeChestModal.isUnlocked || isClaiming}
                onClick={() => handleClaimChest(activeChestModal)}
                className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  activeChestModal.isUnlocked
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>
                  {activeChestModal.isUnlocked
                    ? (isAr ? "افتح الصندوق واستلم المكافأة 💎" : "Open Chest & Collect Reward 💎")
                    : (isAr ? `اجمع ${activeChestModal.requiredStars} نجوم لفتحه` : `Need ${activeChestModal.requiredStars} stars to open`)}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
