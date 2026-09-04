/**
 * Pluggable Virtual Classroom Meeting Provider Interface
 */
export interface MeetingSessionDetails {
  sessionId: string;
  topic: string;
  joinUrlStudent: string;
  hostUrlTeacher: string;
  provider: "MOCK" | "ZOOM" | "TEAMS" | "MEET";
  createdAt: Date;
}

export interface MeetingProvider {
  createClassroomSession(params: {
    sessionId: string;
    classGroupName: string;
    teacherName: string;
    startTimeUtc: Date;
    durationMinutes: number;
  }): Promise<MeetingSessionDetails>;
}

/**
 * MockMeetingProvider delivers functional, sandbox classroom URLs for development & QA testing
 */
export class MockMeetingProvider implements MeetingProvider {
  async createClassroomSession(params: {
    sessionId: string;
    classGroupName: string;
    teacherName: string;
    startTimeUtc: Date;
    durationMinutes: number;
  }): Promise<MeetingSessionDetails> {
    const slug = encodeURIComponent(
      params.classGroupName.toLowerCase().replace(/\s+/g, "-")
    );
    const hostToken = "host_sec_" + Math.random().toString(36).substring(2, 10);
    const studentToken = "std_sec_" + Math.random().toString(36).substring(2, 10);

    return {
      sessionId: params.sessionId,
      topic: params.classGroupName,
      joinUrlStudent: `https://virtual-classroom.kidsarabicacademy.internal/room/${slug}?token=${studentToken}`,
      hostUrlTeacher: `https://virtual-classroom.kidsarabicacademy.internal/host/${slug}?token=${hostToken}`,
      provider: "MOCK",
      createdAt: new Date(),
    };
  }
}

export const defaultMeetingProvider: MeetingProvider = new MockMeetingProvider();
