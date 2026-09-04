import {
  placementRepository,
  AssessmentQuestion,
  PlacementAttempt,
} from "../repositories/PlacementRepository";
import { gamificationService } from "./GamificationService";

export interface PlacementResult {
  attemptId: string;
  studentId: string;
  scorePercentage: number;
  correctAnswersCount: number;
  totalQuestionsCount: number;
  recommendedLevelCode: "PRE_A1" | "A1" | "A2" | "B1";
  recommendedLevelTitleAr: string;
  recommendedLevelTitleEn: string;
  pedagogicalRationaleAr: string;
  xpAwarded: number;
}

export class PlacementService {
  async getQuestions(): Promise<AssessmentQuestion[]> {
    return await placementRepository.getAllQuestions();
  }

  /**
   * Evaluates student answers, determines recommended level, persists attempt, and awards XP.
   */
  async evaluateAndPlace(
    studentId: string,
    answers: Record<string, string>
  ): Promise<PlacementResult> {
    const questions = await placementRepository.getAllQuestions();
    let totalPoints = 0;
    let earnedPoints = 0;
    let correctCount = 0;

    for (const q of questions) {
      totalPoints += q.points;
      const studentAnswer = answers[q.id];
      if (studentAnswer && studentAnswer.trim() === q.correctAnswer.trim()) {
        earnedPoints += q.points;
        correctCount += 1;
      }
    }

    const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);

    // Course Level Placement Mapping
    let recommendedLevelCode: "PRE_A1" | "A1" | "A2" | "B1" = "A1";
    let recommendedLevelTitleAr = "المستوى الأول (A1) - الحروف والكلمات المركبة";
    let recommendedLevelTitleEn = "Level A1 - Compound Letters & Words";
    let pedagogicalRationaleAr = "يمتلك الطالب أساساً طيباً في تمييز الحروف البسيطة ويحتاج تعزيز الطلاقة القرائية.";

    if (scorePercentage <= 40) {
      recommendedLevelCode = "PRE_A1";
      recommendedLevelTitleAr = "المستوى التمهيدي (Pre-A1) - أصوات الحروف وبراعم القراءة";
      recommendedLevelTitleEn = "Pre-A1 - Letter Sounds & Foundations";
      pedagogicalRationaleAr = "نوصي بالتركيز على التعلم المرح والأناشيد التعليمية لربط شكل الحرف بصوته وحركاته الأولى.";
    } else if (scorePercentage <= 70) {
      recommendedLevelCode = "A1";
      recommendedLevelTitleAr = "المستوى الأول (A1) - الحروف والكلمات المركبة";
      recommendedLevelTitleEn = "Level A1 - Compound Letters & Words";
      pedagogicalRationaleAr = "جاهز للانطلاق في قراءة الجمل القصيرة وتركيب المفردات الأساسية وأحكام التجويد المبسطة.";
    } else if (scorePercentage <= 85) {
      recommendedLevelCode = "A2";
      recommendedLevelTitleAr = "المستوى الثاني (A2) - الطلاقة القرائية والتعبير التلقائي";
      recommendedLevelTitleEn = "Level A2 - Reading Fluency & Expression";
      pedagogicalRationaleAr = "أظهر الطالب مهارة ممتازة في القراءة السريعة وفهم النصوص، وهو مهيأ لمستوى الحوار المتقدم.";
    } else {
      recommendedLevelCode = "B1";
      recommendedLevelTitleAr = "المستوى المتقدم (B1) - رواد الفصاحة والبلاغة والخط العربي";
      recommendedLevelTitleEn = "Level B1 - Advanced Fluency & Arabic Rhetoric";
      pedagogicalRationaleAr = "إتقان استثنائي لمخارج الحروف والتراكيب اللغوية يؤهله لدراسة الأدب العربي والتجويد المتقن.";
    }

    const attemptId = "attempt-" + Date.now();
    const attempt: PlacementAttempt = {
      id: attemptId,
      studentId,
      scorePercentage,
      recommendedLevelCode,
      recommendedLevelTitleAr,
      recommendedLevelTitleEn,
      answers,
      completedAt: new Date(),
    };

    await placementRepository.saveAttempt(attempt);

    // Award XP for completing placement assessment
    const xpAwarded = 50;
    await gamificationService.awardXp(studentId, xpAwarded, "إكمال اختبار تحديد المستوى المبدئي");

    return {
      attemptId,
      studentId,
      scorePercentage,
      correctAnswersCount: correctCount,
      totalQuestionsCount: questions.length,
      recommendedLevelCode,
      recommendedLevelTitleAr,
      recommendedLevelTitleEn,
      pedagogicalRationaleAr,
      xpAwarded,
    };
  }

  async getLatestResult(studentId: string): Promise<PlacementAttempt | null> {
    return await placementRepository.getLatestAttemptByStudentId(studentId);
  }
}

export const placementService = new PlacementService();
