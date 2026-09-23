import {
  assessmentBankRepository,
  AssessmentFormatType,
  BankQuestion,
  ManagedAssessment,
} from "../repositories/AssessmentBankRepository";
import { administrationService } from "./AdministrationService";
import { SessionUser } from "@/lib/auth/session";

export class AssessmentBankService {
  async getQuestionBank(filters?: {
    type?: AssessmentFormatType;
    courseLevelCode?: string;
    programId?: string;
  }): Promise<BankQuestion[]> {
    return assessmentBankRepository.getAllQuestions(filters);
  }

  async addQuestionToBank(
    data: Omit<BankQuestion, "id">,
    actor: SessionUser
  ): Promise<BankQuestion> {
    const question = await assessmentBankRepository.addQuestion(data);

    await administrationService.recordAuditLog({
      category: "ACADEMIC",
      action: "QUESTION_BANK_ITEM_CREATED",
      actor,
      targetEntityId: question.id,
      targetEntityType: "BankQuestion",
      diffSummary: `إضافة سؤال جديد لبنك الأسئلة: [${question.type}] - [${question.titleAr}]`,
    });

    return question;
  }

  async getAllAssessments(): Promise<ManagedAssessment[]> {
    return assessmentBankRepository.getAllAssessments();
  }

  async getAssessmentById(id: string): Promise<ManagedAssessment | null> {
    return assessmentBankRepository.getAssessmentById(id);
  }

  async createAssessment(
    data: {
      titleAr: string;
      titleEn: string;
      descriptionAr: string;
      courseLevelCode: string;
      classGroupId?: string;
      passingScorePercentage: number;
      durationMinutes: number;
      questionIds: string[];
      isPublished?: boolean;
    },
    actor: SessionUser
  ): Promise<ManagedAssessment> {
    const assessment = await assessmentBankRepository.createAssessment(data);

    await administrationService.recordAuditLog({
      category: "ACADEMIC",
      action: "ASSESSMENT_EXAM_CREATED",
      actor,
      targetEntityId: assessment.id,
      targetEntityType: "ManagedAssessment",
      diffSummary: `إنشاء اختبار تقييمي جديد [${assessment.titleAr}] بدرجة نجاح [${assessment.passingScorePercentage}%]`,
    });

    return assessment;
  }

  async togglePublishAssessment(
    id: string,
    actor: SessionUser
  ): Promise<ManagedAssessment | null> {
    const assessment = await assessmentBankRepository.togglePublishAssessment(id);
    if (!assessment) return null;

    await administrationService.recordAuditLog({
      category: "ACADEMIC",
      action: assessment.isPublished ? "ASSESSMENT_PUBLISHED" : "ASSESSMENT_UNPUBLISHED",
      actor,
      targetEntityId: assessment.id,
      targetEntityType: "ManagedAssessment",
      diffSummary: `تعديل حالة نشر الاختبار [${assessment.titleAr}] إلى [${assessment.isPublished ? "منشور للطلاب" : "مسودة معلقة"}]`,
    });

    return assessment;
  }

  async deleteAssessment(id: string, actor: SessionUser): Promise<boolean> {
    const existing = await assessmentBankRepository.getAssessmentById(id);
    const success = await assessmentBankRepository.deleteAssessment(id);
    if (success && existing) {
      await administrationService.recordAuditLog({
        category: "ACADEMIC",
        action: "ASSESSMENT_EXAM_DELETED",
        actor,
        targetEntityId: id,
        targetEntityType: "ManagedAssessment",
        diffSummary: `حذف الاختبار التقييمي [${existing.titleAr}]`,
      });
    }
    return success;
  }

  async deleteQuestion(id: string, actor: SessionUser): Promise<boolean> {
    const existing = await assessmentBankRepository.getQuestionById(id);
    const success = await assessmentBankRepository.deleteQuestion(id);
    if (success && existing) {
      await administrationService.recordAuditLog({
        category: "ACADEMIC",
        action: "QUESTION_BANK_ITEM_DELETED",
        actor,
        targetEntityId: id,
        targetEntityType: "BankQuestion",
        diffSummary: `حذف سؤال من بنك الأسئلة [${existing.titleAr}]`,
      });
    }
    return success;
  }
}

export const assessmentBankService = new AssessmentBankService();

