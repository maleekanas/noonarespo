import {
  vocabularyRepository,
  VocabularyFlashcard,
  StudentSrsOverview,
} from "../repositories/VocabularyRepository";
import { gamificationService } from "./GamificationService";
import { getDictionary } from "@/lib/localization";

export interface SrsSessionResult {
  studentId: string;
  cardsReviewedCount: number;
  accuracyPercentage: number;
  xpAwarded: number;
  newTotalXp: number;
  streakDays: number;
  feedback: string;
}

export class VocabularyService {
  async getDueCards(studentId: string): Promise<VocabularyFlashcard[]> {
    return vocabularyRepository.getDueCards(studentId);
  }

  async getAllCards(): Promise<VocabularyFlashcard[]> {
    return vocabularyRepository.getAllCards();
  }

  async recordCardReview(params: {
    studentId: string;
    cardId: string;
    grade: "EASY" | "GOOD" | "AGAIN";
  }) {
    return vocabularyRepository.updateSrsState(
      params.studentId,
      params.cardId,
      params.grade
    );
  }

  async completeSession(params: {
    studentId: string;
    totalCards: number;
    againCount: number;
    locale?: string;
  }): Promise<SrsSessionResult> {
    const total = params.totalCards || 1;
    const correctCount = Math.max(0, total - params.againCount);
    const accuracyPercentage = Math.round((correctCount / total) * 100);

    const xpAwarded = 15;
    const newTotalXp = await gamificationService.awardXp(
      params.studentId,
      xpAwarded,
      `إتمام جلسة التكرار المتباعد للكلمات (${total} بطاقات)`
    );

    const overview = await vocabularyRepository.getStudentSrsOverview(params.studentId);

    const dict = getDictionary(params.locale || "ar");
    const feedback = dict.vocabularySrsStudio.feedbackTemplate
      .replace("{total}", String(total))
      .replace("{accuracy}", String(accuracyPercentage));

    return {
      studentId: params.studentId,
      cardsReviewedCount: total,
      accuracyPercentage,
      xpAwarded,
      newTotalXp,
      streakDays: overview.reviewStreakDays,
      feedback,
    };
  }

  async getStudentOverview(studentId: string): Promise<StudentSrsOverview> {
    return vocabularyRepository.getStudentSrsOverview(studentId);
  }
}

export const vocabularyService = new VocabularyService();
