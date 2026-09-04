import { attendanceRepository } from "../repositories/AttendanceRepository";
import { userRepository } from "../repositories/UserRepository";
import { schedulingRepository } from "../repositories/SchedulingRepository";
import { academicRepository } from "../repositories/AcademicRepository";
import { AttendanceStatus } from "@prisma/client";
import { DomainAttendanceRecord, DomainStudentProfile } from "../repositories/types";

export interface StudentAttendanceRosterItem {
  student: DomainStudentProfile;
  attendanceRecord?: DomainAttendanceRecord;
  status: AttendanceStatus;
}

export class AttendanceService {
  /**
   * Records or updates attendance for a student in a session.
   */
  async recordAttendance(params: {
    sessionId: string;
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
  }): Promise<DomainAttendanceRecord> {
    const session = await schedulingRepository.getSessionById(params.sessionId);
    if (!session) {
      throw new Error(`SESSION_NOT_FOUND: Session ${params.sessionId} does not exist`);
    }

    const student = await userRepository.findStudentProfileById(params.studentId);
    if (!student) {
      throw new Error(`STUDENT_NOT_FOUND: Student ${params.studentId} does not exist`);
    }

    return await attendanceRepository.upsertAttendanceRecord(
      params.sessionId,
      params.studentId,
      params.status,
      params.notes
    );
  }

  /**
   * Gets the attendance roster for a session, pairing each enrolled student with their attendance status.
   */
  async getSessionRoster(sessionId: string): Promise<StudentAttendanceRosterItem[]> {
    const session = await schedulingRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error(`SESSION_NOT_FOUND: Session ${sessionId} does not exist`);
    }

    const enrollments = await academicRepository.getEnrollmentsByClassGroupId(session.classGroupId);
    const existingRecords = await attendanceRepository.getAttendanceBySessionId(sessionId);
    const recordsMap = new Map(existingRecords.map((r) => [r.studentId, r]));

    const roster: StudentAttendanceRosterItem[] = [];
    for (const enr of enrollments) {
      const student = await userRepository.findStudentProfileById(enr.studentId);
      if (student) {
        const record = recordsMap.get(student.id);
        roster.push({
          student,
          attendanceRecord: record,
          status: record ? record.status : AttendanceStatus.PRESENT, // default to present on initial open
        });
      }
    }

    return roster;
  }

  /**
   * Calculates comprehensive attendance statistics for a student.
   */
  async getStudentAttendanceSummary(studentId: string) {
    return await attendanceRepository.calculateStudentAttendanceRate(studentId);
  }
}

export const attendanceService = new AttendanceService();
