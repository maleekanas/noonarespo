import {
  recommendationRepository,
  LearningRecommendation,
  StudentMilestoneProgress,
  CuratedLearningResource,
} from "../repositories/RecommendationRepository";
import { progressService } from "./ProgressService";
import { gamificationService } from "./GamificationService";
import { userRepository } from "../repositories/UserRepository";

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

    // 3. Milestone Progress
    let milestoneProgress = await recommendationRepository.getMilestonesByStudentId(studentId);
    if (!milestoneProgress) {
      milestoneProgress = {
        studentId,
        currentLevel: "A1",
        targetLevel: "A2",
        targetLevelTitleAr: "المستوى A2: الانطلاق والطلاقة التعبيرية",
        overallProgressPercent: 70,
        milestones: [
          {
            code: "M1_PHONICS",
            titleAr: "إتقان نطق الحروف الـ 28 بجميع الحركات الثلاث والسكون",
            isAchieved: true,
            evidenceAr: "تم الإنجاز بنسبة 100%",
          },
          {
            code: "M2_READING",
            titleAr: "قراءة نصوص قصيرة بسرعة 35 كلمة/دقيقة",
            isAchieved: true,
            evidenceAr: "تم تحقيق الهدف في الاختبار الأسبوعي",
          },
          {
            code: "M3_QURAN",
            titleAr: "حفظ وتجويد قصار السور المحددة في المنهج",
            isAchieved: false,
            evidenceAr: "قيد المتابعة والتدريب في استوديو التلاوة",
          },
        ],
      };
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
