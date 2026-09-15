import {
  DomainAssignment,
  DomainAssignmentSubmission,
  DomainTeacherFeedback,
} from "./types";
import { SubmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

/**
 * Prisma-backed repository for homework assignments, student submissions,
 * and teacher feedback. Previously in-memory, seeded only against fixed
 * demo class groups and "student-1" -- a real teacher's assignment, a
 * real child's submission, or a real teacher's grading never persisted.
 */
class AssignmentRepository {
  // Queries
  async getAllAssignments(): Promise<DomainAssignment[]> {
    return prisma.assignment.findMany();
  }

  async getAssignmentsByClassGroupId(classGroupId: string): Promise<DomainAssignment[]> {
    return prisma.assignment.findMany({ where: { classGroupId } });
  }

  async getAssignmentById(id: string): Promise<DomainAssignment | null> {
    return prisma.assignment.findUnique({ where: { id } });
  }

  async getSubmission(assignmentId: string, studentId: string): Promise<DomainAssignmentSubmission | null> {
    return prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
    });
  }

  async getSubmissionsByAssignmentId(assignmentId: string): Promise<DomainAssignmentSubmission[]> {
    return prisma.assignmentSubmission.findMany({ where: { assignmentId } });
  }

  async getSubmissionsByStudentId(studentId: string): Promise<DomainAssignmentSubmission[]> {
    return prisma.assignmentSubmission.findMany({ where: { studentId } });
  }

  async getFeedbackBySubmissionId(submissionId: string): Promise<DomainTeacherFeedback | null> {
    return prisma.teacherFeedback.findUnique({ where: { submissionId } });
  }

  // Mutations
  async createAssignment(data: {
    classGroupId: string;
    titleAr: string;
    titleEn: string;
    instructions: string;
    voicePromptUrl?: string;
    dueDateUtc: Date;
  }): Promise<DomainAssignment> {
    return prisma.assignment.create({
      data: {
        classGroupId: data.classGroupId,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        instructions: data.instructions,
        voicePromptUrl: data.voicePromptUrl,
        dueDateUtc: data.dueDateUtc,
      },
    });
  }

  async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    audioUrl?: string;
    textContent?: string;
  }): Promise<DomainAssignmentSubmission> {
    return prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId: data.assignmentId, studentId: data.studentId } },
      update: {
        audioUrl: data.audioUrl,
        textContent: data.textContent,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      create: {
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        audioUrl: data.audioUrl,
        textContent: data.textContent,
        status: SubmissionStatus.SUBMITTED,
      },
    });
  }

  async gradeSubmission(data: {
    submissionId: string;
    teacherId: string;
    score: number;
    parentVisibleFeedback: string;
    internalTeacherNotes?: string;
  }): Promise<DomainTeacherFeedback> {
    await prisma.assignmentSubmission.update({
      where: { id: data.submissionId },
      data: { status: SubmissionStatus.GRADED },
    });

    return prisma.teacherFeedback.upsert({
      where: { submissionId: data.submissionId },
      update: {
        score: data.score,
        parentVisibleFeedback: data.parentVisibleFeedback,
        internalTeacherNotes: data.internalTeacherNotes,
      },
      create: {
        submissionId: data.submissionId,
        teacherId: data.teacherId,
        score: data.score,
        parentVisibleFeedback: data.parentVisibleFeedback,
        internalTeacherNotes: data.internalTeacherNotes,
      },
    });
  }
}

export const assignmentRepository = new AssignmentRepository();
