import { schedulingRepository } from "../repositories/SchedulingRepository";
import { academicRepository } from "../repositories/AcademicRepository";
import { defaultMeetingProvider } from "@/lib/integrations/meetingProvider";
import { DomainClassSession } from "../repositories/types";

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

    // 3. Virtual Classroom Generation
    const meeting = await defaultMeetingProvider.createClassroomSession({
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
}

export const schedulingService = new SchedulingService();
