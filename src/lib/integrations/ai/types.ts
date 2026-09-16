export interface AiChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  harakatHighlighted?: string;
  pronunciationTip?: string;
  encouragementXp?: number;
}

export interface LessonPlanRequest {
  programTitle: string;
  courseLevel: string;
  topicTitle: string;
  targetAgeGroup: string;
  durationMinutes: number;
}

export interface GeneratedLessonPlan {
  titleAr: string;
  warmupActivity: string;
  coreConcepts: string[];
  interactiveGame: string;
  assessmentQuestion: string;
  homeworkRecommendation: string;
  isAiGenerated: boolean;
}

export interface AiTutorProvider {
  isConfigured(): boolean;
  generateStudentDialogue(
    studentMessage: string,
    context?: { studentAgeGroup?: string; currentLevel?: string },
    conversationHistory?: AiChatMessage[]
  ): Promise<AiChatMessage>;
  generateTeacherLessonPlan(
    request: LessonPlanRequest
  ): Promise<GeneratedLessonPlan>;
}
