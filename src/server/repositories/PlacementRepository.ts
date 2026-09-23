import { prisma } from "@/lib/database/prisma";

export type QuestionType =
  | "LETTER_RECOGNITION"
  | "PHONICS_HARAKAT"
  | "AUDIO_LISTENING"
  | "VOCAB_MATCH"
  | "SENTENCE_CONSTRUCTION"
  | "READING_COMPREHENSION"
  | "SPEECH_RECORDING";

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  promptAr: string;
  promptEn: string;
  options: string[];
  correctAnswer: string;
  audioPromptUrl?: string;
  imagePromptUrl?: string;
  points: number;
}

export interface PlacementAttempt {
  id: string;
  studentId: string;
  scorePercentage: number;
  recommendedLevelCode: "PRE_A1" | "A1" | "A2" | "B1";
  recommendedLevelTitleAr: string;
  recommendedLevelTitleEn: string;
  answers: Record<string, string>;
  completedAt: Date;
}

// The placement question bank is static app content (the same test for every
// student), so it stays in-memory. Only real per-student attempts/results are
// backed by Prisma below.
const QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q1",
    type: "LETTER_RECOGNITION",
    promptAr: "ما هو الحرف الذي يبدأ به اسم الحيوان في الصورة: (أرنب)؟",
    promptEn: "What letter starts the word: (Rabbit - Arnab)?",
    options: ["أ", "ب", "ت", "ث"],
    correctAnswer: "أ",
    points: 10,
  },
  {
    id: "q2",
    type: "PHONICS_HARAKAT",
    promptAr: "اختر الحركة الصحيحة لحرف الباء في كلمة (بُـسْتَان):",
    promptEn: "Select the correct vowel mark (Harakah) for Baa in (Bustan):",
    options: ["فتحة (بَ)", "ضمة (بُ)", "كسرة (بِ)", "سكون (بْ)"],
    correctAnswer: "ضمة (بُ)",
    points: 15,
  },
  {
    id: "q3",
    type: "AUDIO_LISTENING",
    promptAr: "استمع إلى المقطع الصوتي، ثم اختر الكلمة التي سمعتها بدقة:",
    promptEn: "Listen to the audio clip, then choose the spoken word:",
    audioPromptUrl: "https://audio.kidsarabicacademy.internal/prompts/qalam-model.mp3",
    options: ["قَلَم", "عَلَم", "حَلَم", "سَلَم"],
    correctAnswer: "قَلَم",
    points: 15,
  },
  {
    id: "q4",
    type: "VOCAB_MATCH",
    promptAr: "ما هو المعنى الصحيح لمفردة «كِتَاب» بالإنجليزية؟",
    promptEn: "What is the meaning of the word «Kitab»?",
    options: ["Book", "Pen", "Notebook", "School"],
    correctAnswer: "Book",
    points: 15,
  },
  {
    id: "q5",
    type: "SENTENCE_CONSTRUCTION",
    promptAr: "رتب الكلمات التالية لتكوين جملة اسمية مفيدة: (مفيدةٌ - القراءةُ)",
    promptEn: "Order the words to form a correct sentence:",
    options: [
      "القراءةُ مفيدةٌ",
      "مفيدةٌ القراءةُ",
      "القراءةُ في مفيدةٌ",
      "مفيدةٌ هي القراءةُ",
    ],
    correctAnswer: "القراءةُ مفيدةٌ",
    points: 15,
  },
  {
    id: "q6",
    type: "READING_COMPREHENSION",
    promptAr: "اقرأ النص: «ذهبَ أحمدُ إلى حديقةِ الحيوانِ وشاهدَ الأسدَ والزرافة». أين ذهب أحمد؟",
    promptEn: "Read the sentence and answer: Where did Ahmed go?",
    options: [
      "إلى حديقةِ الحيوانِ",
      "إلى المدرسةِ",
      "إلى السوقِ",
      "إلى شاطئ البحرِ",
    ],
    correctAnswer: "إلى حديقةِ الحيوانِ",
    points: 15,
  },
  {
    id: "q7",
    type: "SPEECH_RECORDING",
    promptAr: "تحدّث: اقرأ الجملة بصوتك الواضح: «العِلْمُ نُورٌ وَالجَهْلُ ظَلاَمٌ»",
    promptEn: "Speak clearly: Read the proverb into your microphone",
    options: ["تم التسجيل الصوتي بنجاح"],
    correctAnswer: "تم التسجيل الصوتي بنجاح",
    points: 15,
  },
];

const IN_MEMORY_PLACEMENT_ATTEMPTS: PlacementAttempt[] = [];

class PlacementRepository {
  async getAllQuestions(): Promise<AssessmentQuestion[]> {
    return QUESTIONS;
  }

  async saveAttempt(attempt: PlacementAttempt): Promise<PlacementAttempt> {
    try {
      const row = await prisma.placementAttempt.create({
        data: {
          studentId: attempt.studentId,
          scorePercentage: attempt.scorePercentage,
          recommendedLevelCode: attempt.recommendedLevelCode,
          recommendedLevelTitleAr: attempt.recommendedLevelTitleAr,
          recommendedLevelTitleEn: attempt.recommendedLevelTitleEn,
          answers: attempt.answers,
          completedAt: attempt.completedAt,
        },
      });

      return this.toAttempt(row);
    } catch {
      const savedAttempt: PlacementAttempt = {
        ...attempt,
        id: `attempt-${Date.now()}`,
      };
      IN_MEMORY_PLACEMENT_ATTEMPTS.unshift(savedAttempt);
      return savedAttempt;
    }
  }

  async getLatestAttemptByStudentId(studentId: string): Promise<PlacementAttempt | null> {
    try {
      const row = await prisma.placementAttempt.findFirst({
        where: { studentId },
        orderBy: { completedAt: "desc" },
      });

      return row ? this.toAttempt(row) : null;
    } catch {
      const found = IN_MEMORY_PLACEMENT_ATTEMPTS.find((a) => a.studentId === studentId);
      return found ?? null;
    }
  }

  private toAttempt(row: {
    id: string;
    studentId: string;
    scorePercentage: number;
    recommendedLevelCode: string;
    recommendedLevelTitleAr: string;
    recommendedLevelTitleEn: string;
    answers: unknown;
    completedAt: Date;
  }): PlacementAttempt {
    return {
      id: row.id,
      studentId: row.studentId,
      scorePercentage: row.scorePercentage,
      recommendedLevelCode: row.recommendedLevelCode as "PRE_A1" | "A1" | "A2" | "B1",
      recommendedLevelTitleAr: row.recommendedLevelTitleAr,
      recommendedLevelTitleEn: row.recommendedLevelTitleEn,
      answers: row.answers as Record<string, string>,
      completedAt: row.completedAt,
    };
  }
}

export const placementRepository = new PlacementRepository();
