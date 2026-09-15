import { prisma } from "@/lib/database/prisma";

/**
 * Prisma-backed repository for live-session teacher evaluations (words per
 * minute, Makharij score, participation stars). Previously in-memory,
 * seeded only against the fixed demo students "student-1"/"student-2" and
 * demo class groups -- a real teacher's live evaluation of a real student
 * was never actually saved anywhere durable and reset on every serverless
 * cold start.
 *
 * The real database had no matching table for this at all, so a new
 * LiveSessionGrade model/table was added (see prisma/schema.prisma and
 * src/app/api/admin/apply-gradebook-schema-migration/route.ts, the same
 * "additive schema change behind a temporary secret-gated route" pattern
 * used for the earlier Stripe billing columns). The old in-memory shape
 * denormalized studentName/classGroupName directly onto each grade entry;
 * this version keeps that same external LiveSessionGradeEntry contract
 * (so GradebookService and its callers needed no changes) but resolves
 * those two fields via a join at read time instead of storing them twice.
 */

export interface LiveSessionGradeEntry {
  id: string;
  studentId: string;
  studentName: string;
  classGroupId: string;
  classGroupName: string;
  sessionDate: Date;
  wordsPerMinute: number;
  makharijScore: number; // 0-100%
  participationStars: number; // 1 to 5
  teacherNotesAr: string;
  parentAlertSent: boolean;
  xpAwarded: number;
  createdAt: Date;
}

const withNames = {
  student: { select: { firstName: true, lastName: true } },
  classGroup: { select: { name: true } },
} as const;

type RawGrade = {
  id: string;
  studentId: string;
  classGroupId: string;
  sessionDate: Date;
  wordsPerMinute: number;
  makharijScore: number;
  participationStars: number;
  teacherNotesAr: string;
  parentAlertSent: boolean;
  xpAwarded: number;
  createdAt: Date;
  student: { firstName: string; lastName: string };
  classGroup: { name: string };
};

function toEntry(g: RawGrade): LiveSessionGradeEntry {
  return {
    id: g.id,
    studentId: g.studentId,
    studentName: `${g.student.firstName} ${g.student.lastName}`,
    classGroupId: g.classGroupId,
    classGroupName: g.classGroup.name,
    sessionDate: g.sessionDate,
    wordsPerMinute: g.wordsPerMinute,
    makharijScore: g.makharijScore,
    participationStars: g.participationStars,
    teacherNotesAr: g.teacherNotesAr,
    parentAlertSent: g.parentAlertSent,
    xpAwarded: g.xpAwarded,
    createdAt: g.createdAt,
  };
}

class GradebookRepository {
  async getAllGrades(): Promise<LiveSessionGradeEntry[]> {
    const rows = await prisma.liveSessionGrade.findMany({
      include: withNames,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toEntry);
  }

  async getGradesByClassGroupId(classGroupId: string): Promise<LiveSessionGradeEntry[]> {
    const rows = await prisma.liveSessionGrade.findMany({
      where: { classGroupId },
      include: withNames,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toEntry);
  }

  async getGradesByStudentId(studentId: string): Promise<LiveSessionGradeEntry[]> {
    const rows = await prisma.liveSessionGrade.findMany({
      where: { studentId },
      include: withNames,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toEntry);
  }

  async createGradeEntry(
    entry: Omit<LiveSessionGradeEntry, "id" | "createdAt">
  ): Promise<LiveSessionGradeEntry> {
    const created = await prisma.liveSessionGrade.create({
      data: {
        studentId: entry.studentId,
        classGroupId: entry.classGroupId,
        sessionDate: entry.sessionDate,
        wordsPerMinute: entry.wordsPerMinute,
        makharijScore: entry.makharijScore,
        participationStars: entry.participationStars,
        teacherNotesAr: entry.teacherNotesAr,
        parentAlertSent: entry.parentAlertSent,
        xpAwarded: entry.xpAwarded,
      },
      include: withNames,
    });
    return toEntry(created);
  }
}

export const gradebookRepository = new GradebookRepository();
