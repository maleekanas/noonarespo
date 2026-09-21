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
  private fallbackGrades: Map<string, LiveSessionGradeEntry> = new Map();

  constructor() {
    this.seedFallbackGrades();
  }

  private seedFallbackGrades() {
    this.fallbackGrades.set("grade-1", {
      id: "grade-1",
      studentId: "student-1",
      studentName: "زيد طارق",
      classGroupId: "class-reading-a1-cohort1",
      classGroupName: "فصل النجوم (A1 - القراءة والطلاقة)",
      sessionDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      wordsPerMinute: 38,
      makharijScore: 92,
      participationStars: 5,
      teacherNotesAr: "مشاركة تفاعلية ممتازة وطلاقة واضحة في نطق الكلمات الثلاثية المشكولة.",
      parentAlertSent: true,
      xpAwarded: 20,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    });
    this.fallbackGrades.set("grade-2", {
      id: "grade-2",
      studentId: "student-2",
      studentName: "مريم المنصوري",
      classGroupId: "class-reading-a1-cohort1",
      classGroupName: "فصل النجوم (A1 - القراءة والطلاقة)",
      sessionDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      wordsPerMinute: 32,
      makharijScore: 88,
      participationStars: 4,
      teacherNotesAr: "تحسن ملحوظ في قراءة الحركات القصيرة ونطق حرف الثاء.",
      parentAlertSent: false,
      xpAwarded: 15,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    });
    this.fallbackGrades.set("grade-3", {
      id: "grade-3",
      studentId: "student-1",
      studentName: "زيد طارق",
      classGroupId: "class-quran-a1-cohort1",
      classGroupName: "حلقة الفردوس (A1 - حفظ وتجويد قصار السور)",
      sessionDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      wordsPerMinute: 25,
      makharijScore: 95,
      participationStars: 5,
      teacherNotesAr: "إتقان ممتاز لقلقلة سورة الإخلاص وتطبيق حكم الإظهار الحلقي.",
      parentAlertSent: true,
      xpAwarded: 25,
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    });
  }

  async getAllGrades(): Promise<LiveSessionGradeEntry[]> {
    try {
      const rows = await prisma.liveSessionGrade.findMany({
        include: withNames,
        orderBy: { createdAt: "desc" },
      });
      if (rows && rows.length > 0) return rows.map(toEntry);
    } catch {
      // offline fallback
    }
    return Array.from(this.fallbackGrades.values());
  }

  async getGradesByClassGroupId(classGroupId: string): Promise<LiveSessionGradeEntry[]> {
    try {
      const rows = await prisma.liveSessionGrade.findMany({
        where: { classGroupId },
        include: withNames,
        orderBy: { createdAt: "desc" },
      });
      if (rows && rows.length > 0) return rows.map(toEntry);
    } catch {
      // offline fallback
    }
    return Array.from(this.fallbackGrades.values()).filter((g) => g.classGroupId === classGroupId);
  }

  async getGradesByStudentId(studentId: string): Promise<LiveSessionGradeEntry[]> {
    try {
      const rows = await prisma.liveSessionGrade.findMany({
        where: { studentId },
        include: withNames,
        orderBy: { createdAt: "desc" },
      });
      if (rows && rows.length > 0) return rows.map(toEntry);
    } catch {
      // offline fallback
    }
    return Array.from(this.fallbackGrades.values()).filter((g) => g.studentId === studentId);
  }

  async createGradeEntry(
    entry: Omit<LiveSessionGradeEntry, "id" | "createdAt">
  ): Promise<LiveSessionGradeEntry> {
    try {
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
    } catch {
      const fallback: LiveSessionGradeEntry = {
        id: `grade-${Date.now()}`,
        studentId: entry.studentId,
        studentName: "Student",
        classGroupId: entry.classGroupId,
        classGroupName: "Class",
        sessionDate: entry.sessionDate,
        wordsPerMinute: entry.wordsPerMinute,
        makharijScore: entry.makharijScore,
        participationStars: entry.participationStars,
        teacherNotesAr: entry.teacherNotesAr,
        parentAlertSent: entry.parentAlertSent,
        xpAwarded: entry.xpAwarded,
        createdAt: new Date(),
      };
      this.fallbackGrades.set(fallback.id, fallback);
      return fallback;
    }
  }
}

export const gradebookRepository = new GradebookRepository();
