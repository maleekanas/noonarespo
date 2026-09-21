import { assignmentRepository } from "../repositories/AssignmentRepository";
import { academicRepository } from "../repositories/AcademicRepository";
import { userRepository } from "../repositories/UserRepository";
import {
  DomainAssignment,
  DomainAssignmentSubmission,
  DomainTeacherFeedback,
} from "../repositories/types";

export class AssignmentService {
  /**
   * Creates an assignment for a class group.
   */
  async createAssignment(params: {
    classGroupId: string;
    titleAr: string;
    titleEn: string;
    instructions: string;
    voicePromptUrl?: string;
    dueDateUtc: Date;
  }): Promise<DomainAssignment> {
    const classGroup = await academicRepository.getClassGroupById(params.classGroupId);
    if (!classGroup) {
      throw new Error(`CLASS_NOT_FOUND: Class group ${params.classGroupId} does not exist`);
    }

    return await assignmentRepository.createAssignment(params);
  }

  /**
   * Submits homework response on behalf of a student.
   */
  async submitHomework(params: {
    assignmentId: string;
    studentId: string;
    audioUrl?: string;
    textContent?: string;
  }): Promise<DomainAssignmentSubmission> {
    const assignment = await assignmentRepository.getAssignmentById(params.assignmentId);
    if (!assignment) {
      throw new Error(`ASSIGNMENT_NOT_FOUND: Assignment ${params.assignmentId} does not exist`);
    }

    const student = await userRepository.findStudentProfileById(params.studentId);
    if (!student) {
      throw new Error(`STUDENT_NOT_FOUND: Student ${params.studentId} does not exist`);
    }

    return await assignmentRepository.submitAssignment(params);
  }

  /**
   * Evaluates student submission with score, internal notes, and encouraging parent-visible feedback.
   */
  async gradeSubmission(params: {
    submissionId: string;
    teacherId: string;
    score: number;
    parentVisibleFeedback: string;
    internalTeacherNotes?: string;
  }): Promise<DomainTeacherFeedback> {
    if (params.score < 0 || params.score > 100) {
      throw new Error("INVALID_SCORE: Score must be between 0 and 100");
    }

    if (!params.parentVisibleFeedback || params.parentVisibleFeedback.trim().length === 0) {
      throw new Error("FEEDBACK_REQUIRED: Constructive parent-visible feedback is required");
    }

    return await assignmentRepository.gradeSubmission(params);
  }

  /**
   * Real average of a student's graded homework scores, for parent-facing
   * dashboards. Returns null (not 0) when nothing has been graded yet.
   */
  async getStudentHomeworkSummary(studentId: string) {
    return await assignmentRepository.getStudentHomeworkSummary(studentId);
  }

  /**
   * The most recent teacher evaluation left for a student, for parent-facing
   * dashboards. Returns null when the student has no graded submissions yet.
   */
  async getLatestFeedbackForStudent(studentId: string) {
    return await assignmentRepository.getLatestFeedbackForStudent(studentId);
  }

  /**
   * Updates an existing assignment.
   */
  async updateAssignment(
    id: string,
    params: {
      titleAr?: string;
      titleEn?: string;
      instructions?: string;
      voicePromptUrl?: string;
      dueDateUtc?: Date;
    }
  ): Promise<DomainAssignment | null> {
    return await assignmentRepository.updateAssignment(id, params);
  }

  /**
   * Deletes an assignment.
   */
  async deleteAssignment(id: string): Promise<boolean> {
    return await assignmentRepository.deleteAssignment(id);
  }
}

export const assignmentService = new AssignmentService();
