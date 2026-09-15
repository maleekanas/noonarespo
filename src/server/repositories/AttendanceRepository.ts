import { DomainAttendanceRecord } from "./types";
import { AttendanceStatus } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

/**
 * Prisma-backed repository for per-session attendance records. Previously
 * in-memory, seeded only with fixed historical demo data for "student-1" --
 * a real teacher marking a real student present/absent was never actually
 * saved anywhere durable.
 */
class AttendanceRepository {
  async getAttendanceBySessionId(sessionId: string): Promise<DomainAttendanceRecord[]> {
    const records = await prisma.attendanceRecord.findMany({ where: { sessionId } });
    return records.map((r) => ({ ...r, recordedAt: r.createdAt }));
  }

  async getAttendanceByStudentId(studentId: string): Promise<DomainAttendanceRecord[]> {
    const records = await prisma.attendanceRecord.findMany({ where: { studentId } });
    return records.map((r) => ({ ...r, recordedAt: r.createdAt }));
  }

  async upsertAttendanceRecord(
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    notes?: string
  ): Promise<DomainAttendanceRecord> {
    const record = await prisma.attendanceRecord.upsert({
      where: { sessionId_studentId: { sessionId, studentId } },
      update: { status, notes, createdAt: new Date() },
      create: { sessionId, studentId, status, notes },
    });
    return { ...record, recordedAt: record.createdAt };
  }

  async calculateStudentAttendanceRate(studentId: string): Promise<{
    totalSessions: number;
    presentSessions: number;
    ratePercentage: number;
  }> {
    const studentRecords = await this.getAttendanceByStudentId(studentId);
    if (studentRecords.length === 0) {
      return { totalSessions: 0, presentSessions: 0, ratePercentage: 100 };
    }

    const presentCount = studentRecords.filter(
      (r) => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE
    ).length;

    const ratePercentage = Math.round((presentCount / studentRecords.length) * 100);

    return {
      totalSessions: studentRecords.length,
      presentSessions: presentCount,
      ratePercentage,
    };
  }
}

export const attendanceRepository = new AttendanceRepository();
