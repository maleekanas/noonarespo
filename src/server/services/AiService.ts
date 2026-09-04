import {
  AiChatMessage,
  AiTutorProvider,
  GeneratedLessonPlan,
  LessonPlanRequest,
} from "@/lib/integrations/ai/types";
import { defaultAiTutor } from "@/lib/integrations/ai/KidsArabicAiTutorAdapter";
import { gamificationService } from "./GamificationService";

export interface StudentConversationSession {
  studentId: string;
  history: AiChatMessage[];
  totalXpEarned: number;
}

export class AiService {
  private activeSessions: Map<string, StudentConversationSession> = new Map();

  constructor(private tutor: AiTutorProvider = defaultAiTutor) {}

  isAiConfigured(): boolean {
    return this.tutor.isConfigured();
  }

  async sendStudentMessage(params: {
    studentId: string;
    message: string;
  }): Promise<{
    reply: AiChatMessage;
    newTotalXp: number;
  }> {
    let session = this.activeSessions.get(params.studentId);
    if (!session) {
      session = {
        studentId: params.studentId,
        history: [
          {
            role: "assistant",
            content: "مَرْحَباً بِكَ يَا بَطَل! أَنَا فَصِيح، صَدِيقُكَ الذَّكِيّ لِتَعَلُّمِ اللُّغَةِ الْعَرَبِيَّة. عَمَّ تُحِبُّ أَنْ نَتَحَدَّثَ الْيَوْم؟",
            harakatHighlighted: "أَهْلاً بِكَ فِي نَادِي فَصِيح!",
            encouragementXp: 5,
          },
        ],
        totalXpEarned: 5,
      };
      this.activeSessions.set(params.studentId, session);
    }

    // Append student message
    session.history.push({
      role: "user",
      content: params.message,
    });

    // Generate response from AI tutor
    const reply = await this.tutor.generateStudentDialogue(params.message);
    session.history.push(reply);

    // Award XP if applicable
    if (reply.encouragementXp) {
      session.totalXpEarned += reply.encouragementXp;
      await gamificationService.awardXp(
        params.studentId,
        reply.encouragementXp,
        "محادثة تفاعلية باللغة العربية مع المرشد الذكي فصيح"
      );
    }

    return {
      reply,
      newTotalXp: session.totalXpEarned,
    };
  }

  getSessionHistory(studentId: string): AiChatMessage[] {
    const session = this.activeSessions.get(studentId);
    if (!session) {
      return [
        {
          role: "assistant",
          content: "مَرْحَباً بِكَ يَا بَطَل! أَنَا فَصِيح، صَدِيقُكَ الذَّكِيّ لِتَعَلُّمِ اللُّغَةِ الْعَرَبِيَّة. اكْتُبْ لِي أَيَّ شَيْءٍ لِنَبْدَأَ الْحِوَار!",
          harakatHighlighted: "أَهْلاً بِكَ!",
          encouragementXp: 5,
        },
      ];
    }
    return session.history;
  }

  async generateTeacherLessonPlan(
    request: LessonPlanRequest
  ): Promise<GeneratedLessonPlan> {
    return this.tutor.generateTeacherLessonPlan(request);
  }

  getAiStatus(): {
    engineName: string;
    isConfigured: boolean;
    badgeText: string;
    modelCapability: string;
  } {
    const configured = this.isAiConfigured();
    return {
      engineName: "Kids Arabic Conversational Engine (Faseeh v2.4)",
      isConfigured: configured,
      badgeText: configured
        ? "محرك الذكاء الاصطناعي متصل (Live AI)"
        : "محاكي فصيح التعليمي للأطفال (Dev Sandbox)",
      modelCapability: "تحليل النطق، الضبط بالشكل بالحركات الكاملة، وتوليد الخطط المنهجية",
    };
  }
}

export const aiService = new AiService();
