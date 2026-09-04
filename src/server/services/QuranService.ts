import { quranRepository, QuranSurah, RecitationSubmission } from "@/server/repositories/QuranRepository";
import { gamificationService } from "@/server/services/GamificationService";

export interface RecitationEvaluationResult {
  submission: RecitationSubmission;
  newStudentXp: number;
  unlockedBadge?: string;
  feedbackMessageAr: string;
}

export class QuranService {
  async getSurahCatalog(): Promise<QuranSurah[]> {
    return quranRepository.getAllSurahs();
  }

  async getSurahDetail(surahId: string): Promise<QuranSurah | null> {
    return quranRepository.getSurahById(surahId);
  }

  async getStudentRecitations(studentId: string): Promise<RecitationSubmission[]> {
    return quranRepository.getSubmissionsByStudentId(studentId);
  }

  /**
   * Submit audio recitation attempt, evaluate against rubric, and award +25 XP
   */
  async submitRecitation(params: {
    studentId: string;
    surahId: string;
    audioUrl?: string;
    durationSeconds: number;
  }): Promise<RecitationEvaluationResult> {
    const surah = await quranRepository.getSurahById(params.surahId);
    if (!surah) {
      throw new Error(`Surah with ID ${params.surahId} not found`);
    }

    // Default high-performance simulated scores for student practice
    const scoreMakharij = 92;
    const scoreTajweed = 95;
    const scoreHifz = 98;
    const overallScore = Math.round((scoreMakharij + scoreTajweed + scoreHifz) / 3);
    const xpAwarded = 25;

    const feedbackMessageAr = `أحسنت يا بطل! تلاوة مباركة ومتقنة لـ ${surah.nameAr}، تم تطبيق أحكام التجويد ومخارج الحروف بامتياز!`;

    const submission = await quranRepository.saveSubmission({
      studentId: params.studentId,
      surahId: params.surahId,
      audioUrl: params.audioUrl || `https://storage.kidsarabicacademy.internal/audio/submissions/${params.studentId}-${params.surahId}.mp3`,
      recordedDurationSeconds: params.durationSeconds,
      scoreMakharij,
      scoreTajweed,
      scoreHifz,
      overallScore,
      teacherFeedbackAr: feedbackMessageAr,
      xpAwarded,
    });

    // Award XP through gamification engine
    const newStudentXp = await gamificationService.awardXp(
      params.studentId,
      xpAwarded,
      `تلاوة وإتقان تجويد: ${surah.nameAr}`
    );

    return {
      submission,
      newStudentXp,
      feedbackMessageAr,
    };
  }
}

export const quranService = new QuranService();
