import {
  storyRepository,
  StoryBook,
  StoryCategory,
  getStoryTitle,
} from "../repositories/StoryRepository";
import { gamificationService } from "./GamificationService";
import { getDictionary } from "@/lib/localization";

export interface StoryQuizEvaluation {
  storyId: string;
  scorePercentage: number;
  isPassed: boolean;
  correctCount: number;
  totalQuestions: number;
  xpAwarded: number;
  newTotalXp: number;
  feedbackMessage: string;
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
    locale?: string;
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

    const locale = params.locale || "ar";
    const dict = getDictionary(locale);
    const ssr = dict.studentStoryReader;
    const localizedTitle = getStoryTitle(story, locale);

    const feedbackMessage = isPassed
      ? ssr.feedbackPassedTemplate.replace("{title}", localizedTitle).replace("{xp}", String(xpAwarded))
      : ssr.feedbackFailedTemplate;

    return {
      storyId: params.storyId,
      scorePercentage,
      isPassed,
      correctCount,
      totalQuestions,
      xpAwarded,
      newTotalXp,
      feedbackMessage,
    };
  }
}

export const storyService = new StoryService();
