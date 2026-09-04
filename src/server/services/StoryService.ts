import {
  storyRepository,
  StoryBook,
  StoryCategory,
} from "../repositories/StoryRepository";
import { gamificationService } from "./GamificationService";

export interface StoryQuizEvaluation {
  storyId: string;
  scorePercentage: number;
  isPassed: boolean;
  correctCount: number;
  totalQuestions: number;
  xpAwarded: number;
  newTotalXp: number;
  feedbackMessageAr: string;
}

export class StoryService {
  async getStoryCatalog(category?: StoryCategory): Promise<StoryBook[]> {
    if (category) {
      return storyRepository.getStoriesByCategory(category);
    }
    return storyRepository.getAllStories();
  }

  async getStoryDetails(storyId: string): Promise<StoryBook | null> {
    return storyRepository.getStoryById(storyId);
  }

  async evaluateStoryQuiz(params: {
    studentId: string;
    storyId: string;
    selectedOptions: Record<string, number>; // questionId -> selectedOptionIndex
  }): Promise<StoryQuizEvaluation> {
    const story = await storyRepository.getStoryById(params.storyId);
    if (!story) {
      throw new Error(`Story not found: ${params.storyId}`);
    }

    const totalQuestions = story.quizQuestions.length;
    let correctCount = 0;

    story.quizQuestions.forEach((q) => {
      const selected = params.selectedOptions[q.id];
      if (selected !== undefined && selected === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    const isPassed = scorePercentage >= 50;

    let xpAwarded = 0;
    let newTotalXp = 0;

    if (isPassed) {
      xpAwarded = story.xpReward;
      newTotalXp = await gamificationService.awardXp(
        params.studentId,
        xpAwarded,
        `إتمام قراءة واختبار فهم قصة: ${story.titleAr}`
      );
    } else {
      const profile = await gamificationService.getStudentGamification(params.studentId);
      newTotalXp = profile.totalXp;
    }

    await storyRepository.saveProgress({
      studentId: params.studentId,
      storyId: params.storyId,
      isCompleted: isPassed,
      quizScorePercentage: scorePercentage,
      completedAt: new Date(),
    });

    const feedbackMessageAr = isPassed
      ? `أحسنت يا بطل! لقد استوعبت العِبرة من قصة «${story.titleAr}» وحصلت على ${xpAwarded} نقطة XP!`
      : `قراءة جيدة! راجع القصة مرة أخرى لتحصل على العلامة الكاملة ونقاط XP.`;

    return {
      storyId: params.storyId,
      scorePercentage,
      isPassed,
      correctCount,
      totalQuestions,
      xpAwarded,
      newTotalXp,
      feedbackMessageAr,
    };
  }
}

export const storyService = new StoryService();
