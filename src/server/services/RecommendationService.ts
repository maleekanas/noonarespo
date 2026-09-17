import {
  recommendationRepository,
  LearningRecommendation,
  StudentMilestoneProgress,
  CEFRMilestoneItem,
  CuratedLearningResource,
} from "../repositories/RecommendationRepository";
import { progressService } from "./ProgressService";
import { gamificationService } from "./GamificationService";
import { userRepository } from "../repositories/UserRepository";
import { roadmapRepository } from "../repositories/RoadmapRepository";

// CEFR tiers in curriculum order, matching the cefrMilestone tags on
// RoadmapRepository's quest nodes and PlacementRepository's recommendedLevelCode.
const CEFR_LEVEL_ORDER = ["PRE_A1", "A1", "A2", "B1"] as const;
const CEFR_LEVEL_TITLES_AR: Record<(typeof CEFR_LEVEL_ORDER)[number], string> = {
  PRE_A1: "التأسيس المبدئي: أشكال الحروف والحركات",
  A1: "المستوى A1: الانطلاقة الأولى في القراءة والنطق",
  A2: "المستوى A2: الانطلاق والطلاقة التعبيرية",
  B1: "المستوى B1: الفصاحة والمحادثة المتقدمة",
};

export interface StudentCompetencyOverview {
  listeningScore: number;
  speakingScore: number;
  readingScore: number;
  writingScore: number;
  quranScore: number;
  overallAverage: number;
}

export interface ParentRecommendationOverview {
  studentId: string;
  studentName: string;
  currentLevel: string;
  streakDays: number;
  totalXp: number;
  competencies: StudentCompetencyOverview;
  recommendations: LearningRecommendation[];
  milestoneProgress: StudentMilestoneProgress;
  curatedResources: CuratedLearningResource[];
  recommendedDailyMinutes: number;
}

export class RecommendationService {
  async getParentRecommendationOverview(studentId: string): Promise<ParentRecommendationOverview> {
    const student = await userRepository.findStudentProfileById(studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : "الطالب";

    // 1. Competencies & Gamification data
    const rawCompetencies = await progressService.getStudentCompetencies(studentId);
    const getScore = (key: string) =>
      rawCompetencies.find((c) => c.skillKey === key)?.scorePercentage || 85;

    const competencies: StudentCompetencyOverview = {
      listeningScore: getScore("listening"),
      speakingScore: getScore("speaking"),
      readingScore: getScore("reading"),
      writingScore: getScore("writing"),
      quranScore: getScore("quran"),
      overallAverage: Math.round(
        rawCompetencies.reduce((sum, c) => sum + c.scorePercentage, 0) /
          (rawCompetencies.length || 1)
      ),
    };

    const gamification = await gamificationService.getStudentGamification(studentId);

    // 2. Fetch or dynamically generate recommendations
    let recommendations = await recommendationRepository.getRecommendationsByStudentId(studentId);

    if (recommendations.length === 0) {
      // Dynamic fallback based on competencies
      recommendations = [
        {
          id: `dyn-rec-${studentId}-1`,
          studentId,
          category: "READING",
          priority: "HIGH",
          titleAr: "تعزيز طلاقة القراءة اليومية",
          titleEn: "Enhance Daily Reading Fluency",
          rationaleAr: `درجة القراءة الحالية ${competencies.readingScore}%؛ نوصي بتخصيص 10 دقائق يومية لقراءة نصوص تناسب مستواه.`,
          suggestedActionAr: "قراءة قصة قصيرة مشكولة مع متابعة مخارج الحروف بصوت مرتفع.",
          estimatedMinutesPerDay: 10,
          curatedResourceTitleAr: "قصة مصورة: رحلة في واحة النخيل",
          curatedResourceType: "STORY",
        },
        {
          id: `dyn-rec-${studentId}-2`,
          studentId,
          category: "HABIT",
          priority: "MEDIUM",
          titleAr: "ممارسة الحوار العربي التفاعلي",
          titleEn: "Practice Interactive Arabic Conversation",
          rationaleAr: "الممارسة المنتظمة تعزز سرعة استرجاع المفردات وبناء الجُمل التعبيرية.",
          suggestedActionAr: "إجراء محادثة لمدة 5 دقائق مع المرشد الذكي فصيح.",
          estimatedMinutesPerDay: 5,
          curatedResourceTitleAr: "المرشد فصيح: محادثة تفاعلية (+10 XP)",
          curatedResourceType: "AUDIO_DRILL",
        },
      ];
    }

    // 3. Milestone Progress -- this used to fall back to a fixed, fabricated
    // "100% achieved" / "70% overall" checklist for every real student the
    // moment they weren't the seeded demo account, regardless of what
    // they'd actually done (the same class of bug as the fake certificate
    // verification and pre-seeded roadmap progress issues already fixed
    // elsewhere in this app). It's now derived from the student's real,
    // persisted RoadmapNodeProgress rows via roadmapRepository, grouped by
    // CEFR tier -- a tier only shows as achieved once every quest node
    // tagged with it is genuinely COMPLETED.
    let milestoneProgress = await recommendationRepository.getMilestonesByStudentId(studentId);
    if (!milestoneProgress) {
      milestoneProgress = await this.deriveMilestoneProgressFromRoadmap(studentId);
    }

    // 4. Curated Resources
    const curatedResources = await recommendationRepository.getCuratedResources("AGE_7_10");

    // 5. Compute recommended daily minutes
    const recommendedDailyMinutes = recommendations.reduce(
      (sum, r) => sum + r.estimatedMinutesPerDay,
      0
    );

    return {
      studentId,
      studentName,
      currentLevel: gamification.levelTitleAr,
      streakDays: gamification.streakDays,
      totalXp: gamification.totalXp,
      competencies,
      recommendations,
      milestoneProgress,
      curatedResources,
      recommendedDailyMinutes: Math.max(15, recommendedDailyMinutes),
    };
  }

  /**
   * Builds a real CEFR milestone checklist from the student's actual
   * roadmap-node completion data instead of a static, identical-for-everyone
   * stand-in. A tier is "achieved" only once every quest node tagged with
   * that CEFR level is COMPLETED; the target tier is the first one not yet
   * fully achieved (or the highest tier, once everything is).
   */
  private async deriveMilestoneProgressFromRoadmap(
    studentId: string
  ): Promise<StudentMilestoneProgress> {
    const progress = await roadmapRepository.getStudentProgress(studentId);

    const milestones: CEFRMilestoneItem[] = [];
    for (const level of CEFR_LEVEL_ORDER) {
      const levelNodes = progress.nodes.filter((n) => n.cefrMilestone === level);
      if (levelNodes.length === 0) continue;

      const completedCount = levelNodes.filter((n) => n.status === "COMPLETED").length;
      const isAchieved = completedCount === levelNodes.length;

      milestones.push({
        code: level,
        titleAr: CEFR_LEVEL_TITLES_AR[level],
        isAchieved,
        evidenceAr: isAchieved
          ? `تم إكمال جميع محطات هذا المستوى (${completedCount}/${levelNodes.length})`
          : `${completedCount}/${levelNodes.length} محطات مكتملة حتى الآن`,
      });
    }

    let currentLevel: string = CEFR_LEVEL_ORDER[0];
    let targetIndex = 0;
    for (let i = 0; i < milestones.length; i++) {
      if (milestones[i].isAchieved) {
        currentLevel = milestones[i].code;
        targetIndex = Math.min(i + 1, milestones.length - 1);
      } else {
        targetIndex = i;
        break;
      }
    }

    const targetMilestone = milestones[targetIndex];
    const targetLevel = targetMilestone?.code ?? CEFR_LEVEL_ORDER[0];
    const targetLevelTitleAr =
      CEFR_LEVEL_TITLES_AR[targetLevel as (typeof CEFR_LEVEL_ORDER)[number]] ??
      CEFR_LEVEL_TITLES_AR[CEFR_LEVEL_ORDER[0]];

    return {
      studentId,
      currentLevel,
      targetLevel,
      targetLevelTitleAr,
      overallProgressPercent: progress.pathCompletionPercentage,
      milestones,
    };
  }

  async getCuratedResourcesForStudent(studentId?: string): Promise<CuratedLearningResource[]> {
    if (studentId) {
      const student = await userRepository.findStudentProfileById(studentId);
      if (student?.ageGroup) {
        return recommendationRepository.getCuratedResources(student.ageGroup);
      }
    }
    return recommendationRepository.getCuratedResources("AGE_7_10");
  }
}

export const recommendationService = new RecommendationService();
