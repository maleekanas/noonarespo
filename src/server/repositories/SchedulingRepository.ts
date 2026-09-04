import { DomainClassSession } from "./types";
import { SessionStatus } from "@prisma/client";

class InMemorySchedulingRepository {
  private sessions: Map<string, DomainClassSession> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const today = new Date();
    const makeSessionTime = (daysOffset: number, startHour: number, durationMinutes: number = 45) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysOffset, startHour, 0, 0);
      const end = new Date(d.getTime() + durationMinutes * 60 * 1000);
      return { start: d, end };
    };

    // 1. Reading Session (Today 16:00 UTC)
    const t1 = makeSessionTime(0, 16);
    this.sessions.set("session-today-1", {
      id: "session-today-1",
      classGroupId: "class-reading-a1-cohort1",
      teacherId: "teacher-1",
      startTimeUtc: t1.start,
      endTimeUtc: t1.end,
      status: SessionStatus.SCHEDULED,
      meetingUrl: "https://meet.kidsarabicacademy.internal/room/reading-a1-stars",
    });

    // 2. Quran & Tajweed Session (Tomorrow 15:00 UTC)
    const t2 = makeSessionTime(1, 15);
    this.sessions.set("session-quran-1", {
      id: "session-quran-1",
      classGroupId: "class-quran-a1-cohort1",
      teacherId: "teacher-1",
      startTimeUtc: t2.start,
      endTimeUtc: t2.end,
      status: SessionStatus.SCHEDULED,
      meetingUrl: "https://meet.kidsarabicacademy.internal/room/quran-a1-firdaus",
    });

    // 3. Foundations Sprouts Session (Tomorrow 16:30 UTC)
    const t3 = makeSessionTime(1, 16, 40);
    this.sessions.set("session-sprouts-1", {
      id: "session-sprouts-1",
      classGroupId: "class-sprouts-cohort1",
      teacherId: "teacher-4",
      startTimeUtc: t3.start,
      endTimeUtc: t3.end,
      status: SessionStatus.SCHEDULED,
      meetingUrl: "https://meet.kidsarabicacademy.internal/room/sprouts-foundations",
    });

    // 4. Writing & Penmanship Session (Day +2 14:00 UTC)
    const t4 = makeSessionTime(2, 14);
    this.sessions.set("session-writing-1", {
      id: "session-writing-1",
      classGroupId: "class-writing-a1-cohort1",
      teacherId: "teacher-2",
      startTimeUtc: t4.start,
      endTimeUtc: t4.end,
      status: SessionStatus.SCHEDULED,
      meetingUrl: "https://meet.kidsarabicacademy.internal/room/writing-a1-calligraphers",
    });

    // 5. Speaking & Conversation Session (Day +2 16:00 UTC)
    const t5 = makeSessionTime(2, 16);
    this.sessions.set("session-speaking-1", {
      id: "session-speaking-1",
      classGroupId: "class-speaking-a1-cohort1",
      teacherId: "teacher-4",
      startTimeUtc: t5.start,
      endTimeUtc: t5.end,
      status: SessionStatus.SCHEDULED,
      meetingUrl: "https://meet.kidsarabicacademy.internal/room/speaking-a1-eloquent",
    });

    // 6. Listening & Auditory Session (Day +3 15:30 UTC)
    const t6 = makeSessionTime(3, 15, 30);
    this.sessions.set("session-listening-1", {
      id: "session-listening-1",
      classGroupId: "class-listening-pre-a1-cohort1",
      teacherId: "teacher-4",
      startTimeUtc: t6.start,
      endTimeUtc: t6.end,
      status: SessionStatus.SCHEDULED,
      meetingUrl: "https://meet.kidsarabicacademy.internal/room/listening-pre-a1-smart",
    });

    // 7. Islamic Studies & Values Session (Day +3 17:00 UTC)
    const t7 = makeSessionTime(3, 17);
    this.sessions.set("session-islamic-1", {
      id: "session-islamic-1",
      classGroupId: "class-islamic-a1-cohort1",
      teacherId: "teacher-2",
      startTimeUtc: t7.start,
      endTimeUtc: t7.end,
      status: SessionStatus.SCHEDULED,
      meetingUrl: "https://meet.kidsarabicacademy.internal/room/islamic-a1-values",
    });

    // An upcoming session next week for reading
    const nextWeek = makeSessionTime(7, 16);
    this.sessions.set("session-next-1", {
      id: "session-next-1",
      classGroupId: "class-reading-a1-cohort1",
      teacherId: "teacher-1",
      startTimeUtc: nextWeek.start,
      endTimeUtc: nextWeek.end,
      status: SessionStatus.SCHEDULED,
      meetingUrl: "https://meet.kidsarabicacademy.internal/room/reading-a1-stars",
    });
  }

  async getAllSessions(): Promise<DomainClassSession[]> {
    return Array.from(this.sessions.values());
  }

  async getSessionById(id: string): Promise<DomainClassSession | null> {
    return this.sessions.get(id) || null;
  }

  async getSessionsByTeacherId(teacherId: string): Promise<DomainClassSession[]> {
    return Array.from(this.sessions.values()).filter((s) => s.teacherId === teacherId);
  }

  async getSessionsByClassGroupId(classGroupId: string): Promise<DomainClassSession[]> {
    return Array.from(this.sessions.values()).filter((s) => s.classGroupId === classGroupId);
  }

  async findOverlappingTeacherSessions(
    teacherId: string,
    startTimeUtc: Date,
    endTimeUtc: Date,
    excludeSessionId?: string
  ): Promise<DomainClassSession[]> {
    return Array.from(this.sessions.values()).filter((s) => {
      if (s.teacherId !== teacherId) return false;
      if (s.status === SessionStatus.CANCELLED) return false;
      if (excludeSessionId && s.id === excludeSessionId) return false;

      // Overlap condition: startA < endB && endA > startB
      const startsBeforeOtherEnds = s.startTimeUtc.getTime() < endTimeUtc.getTime();
      const endsAfterOtherStarts = s.endTimeUtc.getTime() > startTimeUtc.getTime();
      return startsBeforeOtherEnds && endsAfterOtherStarts;
    });
  }

  async createSession(data: {
    classGroupId: string;
    teacherId: string;
    startTimeUtc: Date;
    endTimeUtc: Date;
    meetingUrl?: string;
  }): Promise<DomainClassSession> {
    const id = "session-" + (this.sessions.size + 1);
    const session: DomainClassSession = {
      id,
      classGroupId: data.classGroupId,
      teacherId: data.teacherId,
      startTimeUtc: data.startTimeUtc,
      endTimeUtc: data.endTimeUtc,
      status: SessionStatus.SCHEDULED,
      meetingUrl: data.meetingUrl || `https://meet.kidsarabicacademy.internal/room/${data.classGroupId}`,
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSessionStatus(id: string, status: SessionStatus): Promise<DomainClassSession | null> {
    const session = this.sessions.get(id);
    if (!session) return null;
    session.status = status;
    this.sessions.set(id, session);
    return session;
  }
}

export const schedulingRepository = new InMemorySchedulingRepository();
