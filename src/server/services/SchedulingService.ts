import { schedulingRepository } from "../repositories/SchedulingRepository";
import { academicRepository } from "../repositories/AcademicRepository";
import { userRepository } from "../repositories/UserRepository";
import { meetingManager } from "@/lib/integrations/meetings/MeetingManager";
import { DomainClassSession } from "../repositories/types";
import { EnrollmentStatus, SessionStatus } from "@prisma/client";

export interface UpcomingSessionSummary {
  sessionId: string;
  classGroupName: string;
  teacherFirstName: string;
  teacherLastName: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
}

export interface ScheduleConflictReport {
  hasConflict: boolean;
  conflictType?: "TEACHER_OVERLAP" | "STUDENT_OVERLAP" | "NONE";
  conflictingSessionId?: string;
  reason?: string;
}

export class SchedulingService {
  /**
   * Checks if a teacher has another session scheduled that overlaps with the requested time window.
   */
  async checkTeacherConflict(
    teacherId: string,
    startTimeUtc: Date,
    endTimeUtc: Date,
    excludeSessionId?: string
  ): Promise<ScheduleConflictReport> {
    const overlapping = await schedulingRepository.findOverlappingTeacherSessions(
      teacherId,
      startTimeUtc,
      endTimeUtc,
      excludeSessionId
    );

    if (overlapping.length > 0) {
      return {
        hasConflict: true,
        conflictType: "TEACHER_OVERLAP",
        conflictingSessionId: overlapping[0].id,
        reason: `Teacher is already booked for session ${overlapping[0].id} from ${overlapping[0].startTimeUtc.toISOString()} to ${overlapping[0].endTimeUtc.toISOString()}`,
      };
    }

    return {
      hasConflict: false,
      conflictType: "NONE",
    };
  }

  /**
   * Schedules a session after verifying that no teacher conflict exists.
   */
  async scheduleSession(params: {
    classGroupId: string;
    teacherId: string;
    startTimeUtc: Date;
    durationMinutes: number;
  }): Promise<DomainClassSession> {
    const endTimeUtc = new Date(
      params.startTimeUtc.getTime() + params.durationMinutes * 60 * 1000
    );

    // 1. Conflict Check
    const conflict = await this.checkTeacherConflict(
      params.teacherId,
      params.startTimeUtc,
      endTimeUtc
    );
    if (conflict.hasConflict) {
      throw new Error(`SCHEDULE_CONFLICT: ${conflict.reason}`);
    }

    // 2. Class Group Validation
    const classGroup = await academicRepository.getClassGroupById(params.classGroupId);
    if (!classGroup) {
      throw new Error(`CLASS_NOT_FOUND: Class group ${params.classGroupId} does not exist`);
    }

    // 3. Virtual Classroom Generation -- uses whichever real platform (Zoom/
    // Teams/Google Meet/Webex) the school has actually connected, honestly
    // falling back to a sandbox link when none are configured yet.
    const meeting = await meetingManager.createBestAvailableSession({
      sessionId: "temp",
      classGroupName: classGroup.name,
      teacherName: `Teacher ${params.teacherId}`,
      startTimeUtc: params.startTimeUtc,
      durationMinutes: params.durationMinutes,
    });

    // 4. Persistence
    return await schedulingRepository.createSession({
      classGroupId: params.classGroupId,
      teacherId: params.teacherId,
      startTimeUtc: params.startTimeUtc,
      endTimeUtc,
      meetingUrl: meeting.joinUrlStudent,
    });
  }

  /**
   * Generates weekly recurring sessions over N weeks.
   */
  async generateWeeklyRecurringSchedule(params: {
    classGroupId: string;
    teacherId: string;
    startEpochDate: Date;
    durationMinutes: number;
    numberOfWeeks: number;
  }): Promise<DomainClassSession[]> {
    const createdSessions: DomainClassSession[] = [];

    for (let i = 0; i < params.numberOfWeeks; i++) {
      const sessionDate = new Date(
        params.startEpochDate.getTime() + i * 7 * 24 * 60 * 60 * 1000
      );

      const session = await this.scheduleSession({
        classGroupId: params.classGroupId,
        teacherId: params.teacherId,
        startTimeUtc: sessionDate,
        durationMinutes: params.durationMinutes,
      });

      createdSessions.push(session);
    }

    return createdSessions;
  }

  /**
   * The student's next not-yet-finished session across every class they're
   * actively enrolled in -- used to link "Join Virtual Classroom" at a real
   * session id instead of a fixed placeholder that never matched any actual
   * scheduled class.
   */
  async getNextSessionForStudent(studentId: string): Promise<UpcomingSessionSummary | null> {
    const enrollments = (await academicRepository.getEnrollmentsByStudentId(studentId)).filter(
      (e) => e.status === EnrollmentStatus.ACTIVE
    );
    if (enrollments.length === 0) return null;

    const now = new Date();
    const candidates: DomainClassSession[] = [];
    for (const enrollment of enrollments) {
      const sessions = await schedulingRepository.getSessionsByClassGroupId(enrollment.classGroupId);
      candidates.push(
        ...sessions.filter((s) => s.status !== SessionStatus.CANCELLED && s.endTimeUtc >= now)
      );
    }
    if (candidates.length === 0) return null;

    candidates.sort((a, b) => a.startTimeUtc.getTime() - b.startTimeUtc.getTime());
    const next = candidates[0];

    const [classGroup, teacher] = await Promise.all([
      academicRepository.getClassGroupById(next.classGroupId),
      userRepository.findTeacherProfileById(next.teacherId),
    ]);
    if (!classGroup || !teacher) return null;

    return {
      sessionId: next.id,
      classGroupName: classGroup.name,
      teacherFirstName: teacher.firstName,
      teacherLastName: teacher.lastName,
      startTimeUtc: next.startTimeUtc,
      endTimeUtc: next.endTimeUtc,
    };
  }

  /**
   * Reschedules an existing session with conflict detection.
   */
  async rescheduleSession(params: {
    sessionId: string;
    newStartTimeUtc: Date;
    durationMinutes: number;
  }): Promise<DomainClassSession | null> {
    const session = await schedulingRepository.getSessionById(params.sessionId);
    if (!session) {
      throw new Error(`SESSION_NOT_FOUND: Session ${params.sessionId} does not exist`);
    }

    const newEndTimeUtc = new Date(
      params.newStartTimeUtc.getTime() + params.durationMinutes * 60 * 1000
    );

    const conflict = await this.checkTeacherConflict(
      session.teacherId,
      params.newStartTimeUtc,
      newEndTimeUtc,
      session.id
    );
    if (conflict.hasConflict) {
      throw new Error(`SCHEDULE_CONFLICT: ${conflict.reason}`);
    }

    return schedulingRepository.rescheduleSession(params.sessionId, params.newStartTimeUtc, newEndTimeUtc);
  }

  /**
   * Cancels an existing session.
   */
  async cancelSession(sessionId: string): Promise<boolean> {
    return schedulingRepository.cancelSession(sessionId);
  }
}

export const schedulingService = new SchedulingService();
