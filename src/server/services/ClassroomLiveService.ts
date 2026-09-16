import type { SessionUser } from "@/lib/auth/session";
import { RoleType } from "@prisma/client";
import { schedulingRepository } from "../repositories/SchedulingRepository";
import { academicRepository } from "../repositories/AcademicRepository";
import { userRepository } from "../repositories/UserRepository";
import { attendanceService } from "./AttendanceService";
import { DomainClassSession } from "../repositories/types";

export interface ClassroomParticipant {
  studentId: string;
  firstName: string;
  lastName: string;
}

export interface ClassroomContext {
  session: DomainClassSession;
  classGroupId: string;
  classGroupName: string;
  teacherId: string;
  teacherFirstName: string;
  teacherLastName: string;
  meetingUrl: string | null;
  roster: ClassroomParticipant[];
  viewerRole: "TEACHER" | "STUDENT";
  viewerParticipantId: string; // teacherProfile.id or studentProfile.id, whichever applies
  viewerFirstName: string;
  viewerLastName: string;
}

export type ClassroomContextResult =
  | { status: "OK"; context: ClassroomContext }
  | { status: "NOT_FOUND" }
  | { status: "FORBIDDEN" };

/**
 * Resolves the real class session, roster, and teacher for a classroom/[id]
 * page, and authorizes the signed-in viewer against it. This is also the
 * single source of truth the presence-channel auth route (/api/realtime/
 * classroom-auth) and the whiteboard/signal broadcast routes call into --
 * anyone with a valid session cookie can request any sessionId, so every
 * one of those endpoints must independently re-derive "is this person
 * actually the assigned teacher or an actively enrolled student of *this*
 * class session" rather than trusting a client-supplied role or id.
 */
class ClassroomLiveService {
  async getClassroomContext(
    sessionId: string,
    sessionUser: SessionUser
  ): Promise<ClassroomContextResult> {
    const classSession = await schedulingRepository.getSessionById(sessionId);
    if (!classSession) {
      return { status: "NOT_FOUND" };
    }

    const classGroup = await academicRepository.getClassGroupById(classSession.classGroupId);
    const teacher = await userRepository.findTeacherProfileById(classSession.teacherId);
    if (!classGroup || !teacher) {
      // A session pointing at a deleted class group or teacher is a data
      // problem, not a "you're not allowed in" problem -- treat it the same
      // as not found rather than leaking a broken/partial classroom.
      return { status: "NOT_FOUND" };
    }

    const roster = (await attendanceService.getSessionRoster(sessionId)).map((item) => ({
      studentId: item.student.id,
      firstName: item.student.firstName,
      lastName: item.student.lastName,
    }));

    let viewerRole: "TEACHER" | "STUDENT" | null = null;
    let viewerParticipantId: string | null = null;
    let viewerFirstName = "";
    let viewerLastName = "";

    if (sessionUser.role === RoleType.TEACHER) {
      const teacherProfile = await userRepository.findTeacherProfileByUserId(sessionUser.id);
      if (teacherProfile && teacherProfile.id === classSession.teacherId) {
        viewerRole = "TEACHER";
        viewerParticipantId = teacherProfile.id;
        viewerFirstName = teacherProfile.firstName;
        viewerLastName = teacherProfile.lastName;
      }
    } else if (sessionUser.role === RoleType.STUDENT) {
      const studentProfile = await userRepository.findStudentProfileByUserId(sessionUser.id);
      const rosterEntry = studentProfile
        ? roster.find((r) => r.studentId === studentProfile.id)
        : undefined;
      if (studentProfile && rosterEntry) {
        viewerRole = "STUDENT";
        viewerParticipantId = studentProfile.id;
        viewerFirstName = studentProfile.firstName;
        viewerLastName = studentProfile.lastName;
      }
    }

    if (!viewerRole || !viewerParticipantId) {
      return { status: "FORBIDDEN" };
    }

    return {
      status: "OK",
      context: {
        session: classSession,
        classGroupId: classGroup.id,
        classGroupName: classGroup.name,
        teacherId: teacher.id,
        teacherFirstName: teacher.firstName,
        teacherLastName: teacher.lastName,
        meetingUrl: classSession.meetingUrl ?? null,
        roster,
        viewerRole,
        viewerParticipantId,
        viewerFirstName,
        viewerLastName,
      },
    };
  }

  /**
   * Lighter-weight authorization check used by the API routes (presence
   * auth, whiteboard/signal broadcast) that fire many times per session and
   * don't need the full roster/teacher payload back.
   */
  async isAuthorizedParticipant(sessionId: string, sessionUser: SessionUser): Promise<boolean> {
    const result = await this.getClassroomContext(sessionId, sessionUser);
    return result.status === "OK";
  }
}

export const classroomLiveService = new ClassroomLiveService();
