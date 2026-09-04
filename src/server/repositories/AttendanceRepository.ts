import { DomainAttendanceRecord } from "./types";
import { AttendanceStatus } from "@prisma/client";

class InMemoryAttendanceRepository {
  private records: Map<string, DomainAttendanceRecord> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Seed sample historical attendance for student-1
    const statuses = [
      AttendanceStatus.PRESENT,
      AttendanceStatus.PRESENT,
      AttendanceStatus.PRESENT,
      AttendanceStatus.PRESENT,
      AttendanceStatus.PRESENT,
    ];

    statuses.forEach((st, idx) => {
      const id = `att-seed-${idx + 1}`;
      this.records.set(id, {
        id,
        sessionId: `session-hist-${idx + 1}`,
        studentId: "student-1",
        status: st,
        notes: "حضور مميز وتفاعل متواصل",
        recordedAt: new Date(Date.now() - (idx + 1) * 7 * 24 * 60 * 60 * 1000),
      });
    });
  }

  async getAttendanceBySessionId(sessionId: string): Promise<DomainAttendanceRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.sessionId === sessionId);
  }

  async getAttendanceByStudentId(studentId: string): Promise<DomainAttendanceRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.studentId === studentId);
  }

  async upsertAttendanceRecord(
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    notes?: string
  ): Promise<DomainAttendanceRecord> {
    // Check if record exists for this session & student
    for (const r of this.records.values()) {
      if (r.sessionId === sessionId && r.studentId === studentId) {
        r.status = status;
        if (notes !== undefined) r.notes = notes;
        r.recordedAt = new Date();
        this.records.set(r.id, r);
        return r;
      }
    }

    const id = "att-" + (this.records.size + 1);
    const newRecord: DomainAttendanceRecord = {
      id,
      sessionId,
      studentId,
      status,
      notes,
      recordedAt: new Date(),
    };
    this.records.set(id, newRecord);
    return newRecord;
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

export const attendanceRepository = new InMemoryAttendanceRepository();
