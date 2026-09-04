import {
  gradebookRepository,
  LiveSessionGradeEntry,
} from "../repositories/GradebookRepository";
import { userRepository } from "../repositories/UserRepository";
import { academicRepository } from "../repositories/AcademicRepository";
import { gamificationService } from "./GamificationService";
import { notificationService } from "./NotificationService";

export interface LiveEvaluationResult {
  gradeEntry: LiveSessionGradeEntry;
  newStudentXp: number;
  parentAlertSent: boolean;
}

export class GradebookService {
  async getAllGrades(): Promise<LiveSessionGradeEntry[]> {
    return gradebookRepository.getAllGrades();
  }

  async getClassSessionGrades(classGroupId: string): Promise<LiveSessionGradeEntry[]> {
    return gradebookRepository.getGradesByClassGroupId(classGroupId);
  }

  async getStudentSessionGrades(studentId: string): Promise<LiveSessionGradeEntry[]> {
    return gradebookRepository.getGradesByStudentId(studentId);
  }

  async recordLiveEvaluation(params: {
    studentId: string;
    classGroupId: string;
    wordsPerMinute: number;
    makharijScore: number;
    participationStars: number;
    teacherNotesAr: string;
  }): Promise<LiveEvaluationResult> {
    const student = await userRepository.findStudentProfileById(params.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : "الطالب";

    const classGroup = await academicRepository.getClassGroupById(params.classGroupId);
    const classGroupName = classGroup ? classGroup.name : "فصل تعليمي تفاعلي";

    // Safe clamps
    const safeWpm = Math.max(0, Math.min(150, Math.round(params.wordsPerMinute)));
    const safeMakharij = Math.max(0, Math.min(100, Math.round(params.makharijScore)));
    const safeStars = Math.max(1, Math.min(5, Math.round(params.participationStars)));

    // Calculate XP: 10 base + (stars * 2), e.g. 20 XP for 5 stars
    const xpAwarded = 10 + safeStars * 2;

    // 1. Award XP to student
    const newStudentXp = await gamificationService.awardXp(
      params.studentId,
      xpAwarded,
      `تقييم متميز في الحصة المباشرة (${safeStars} نجوم)`
    );

    // 2. Dispatch parent notification
    let parentAlertSent = false;
    try {
      await notificationService.notifyClassPerformance({
        parentId: "parent-1", // Zayd's parent
        studentName,
        stars: safeStars,
        notes: params.teacherNotesAr || "مشاركة تفاعلية ممتازة وطلاقة في القراءة.",
      });
      parentAlertSent = true;
    } catch {
      parentAlertSent = false;
    }

    // 3. Save grade entry
    const gradeEntry = await gradebookRepository.createGradeEntry({
      studentId: params.studentId,
      studentName,
      classGroupId: params.classGroupId,
      classGroupName,
      sessionDate: new Date(),
      wordsPerMinute: safeWpm,
      makharijScore: safeMakharij,
      participationStars: safeStars,
      teacherNotesAr: params.teacherNotesAr,
      parentAlertSent,
      xpAwarded,
    });

    return {
      gradeEntry,
      newStudentXp,
      parentAlertSent,
    };
  }
}

export const gradebookService = new GradebookService();
